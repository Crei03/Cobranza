"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { extractReceiptData } from "@/lib/ocr";
import { ArrowLeft, Camera, Calendar, DollarSign, StickyNote, Check, Hash, Loader2, AlertCircle, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function NewPaymentPage() {
  const [date, setDate] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrDone, setOcrDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleReceiptChange = async (file: File | null) => {
    if (!file) return;
    setReceipt(file); setOcrLoading(true); setOcrError(null); setOcrDone(false);
    const preview = URL.createObjectURL(file); setReceiptPreview(preview);
    try { const data = await extractReceiptData(file); if (data.amount !== null) setAmountPaid(String(data.amount)); if (data.date !== null) setDate(data.date.split(" ")[0]); if (data.confirmationCode !== null) setConfirmationCode(data.confirmationCode); setOcrDone(true); } catch { setOcrError("No se pudo leer el comprobante. Ingresa los datos manualmente."); } finally { setOcrLoading(false); }
  };

  const handleRemoveReceipt = () => { if (receiptPreview) URL.revokeObjectURL(receiptPreview); setReceipt(null); setReceiptPreview(null); setAmountPaid(""); setDate(""); setConfirmationCode(""); setOcrDone(false); setOcrError(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleUpload = async (file: File): Promise<string | null> => { const ext = file.name.split(".").pop(); const fp = `receipts/${Date.now()}.${ext}`; const { error: e } = await supabase.storage.from("receipts").upload(fp, file); if (e) return null; const { data: { publicUrl } } = supabase.storage.from("receipts").getPublicUrl(fp); return publicUrl; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    if (!date || !amountPaid) { setError("La fecha y el monto son obligatorios."); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("No se detectó usuario."); setLoading(false); return; }
    let url: string | null = null;
    if (receipt) { url = await handleUpload(receipt); if (!url) { setError("Error al subir el comprobante."); setLoading(false); return; } }
    const { error: ie } = await supabase.from("payments").insert({ user_id: user.id, date, amount_paid: parseFloat(amountPaid), receipt_url: url, confirmation_code: confirmationCode || null, notes: notes || null });
    if (ie) { setError("Error al guardar: " + ie.message); setLoading(false); return; }
    router.push("/"); router.refresh();
  };

  const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-primary)" };
  const labelStyle = { color: "var(--text-primary)" };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header className="sticky top-0 z-40" style={{ background: "var(--header-bg)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--glass-border)" }}>
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 rounded-xl transition-smooth" style={{ background: "var(--input-bg)" }}>
            <ArrowLeft size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Estás en</p>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Registrar pago</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-5 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass rounded-2xl p-4">
            <label className="flex items-center gap-2 text-base font-semibold mb-3" style={labelStyle}><Camera size={18} style={{ color: "var(--accent)" }} />Comprobante de pago</label>
            {receiptPreview ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden">
                  <img src={receiptPreview} alt="Comprobante" className="w-full max-h-64 object-contain" style={{ background: "var(--input-bg)", outline: "1px solid var(--input-border)" }} />
                  <button type="button" onClick={handleRemoveReceipt} className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full transition-smooth" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}><X size={16} /></button>
                </div>
                {ocrLoading && <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "var(--input-bg)", color: "var(--accent)" }}><Loader2 size={18} className="animate-spin" /><span className="text-sm font-medium">Leyendo comprobante...</span></div>}
                {ocrDone && !ocrLoading && <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "var(--success-bg)", color: "var(--success)" }}><Check size={18} /><span className="text-sm font-medium">Datos extraídos</span></div>}
                {ocrError && <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}><AlertCircle size={18} /><span className="text-sm">{ocrError}</span></div>}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-xl cursor-pointer transition-smooth" style={{ borderColor: "var(--input-border)" }}>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleReceiptChange(e.target.files?.[0] || null)} />
                <Camera size={40} style={{ color: "var(--text-muted)" }} className="mb-3" />
                <span className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>Tomar foto del comprobante</span>
                <span className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Se leerán los datos automáticamente</span>
              </label>
            )}
          </div>

          <div className="glass rounded-2xl p-4">
            <label className="flex items-center gap-2 text-base font-semibold mb-3" style={labelStyle}><Calendar size={18} style={{ color: "var(--accent)" }} />Fecha del pago{ocrDone && date && <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: "var(--success-bg)", color: "var(--success)" }}>Auto</span>}</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3.5 text-lg rounded-xl transition-smooth" style={inputStyle} />
          </div>

          <div className="glass rounded-2xl p-4">
            <label className="flex items-center gap-2 text-base font-semibold mb-3" style={labelStyle}><DollarSign size={18} style={{ color: "var(--success)" }} />Monto pagado{ocrDone && amountPaid && <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: "var(--success-bg)", color: "var(--success)" }}>Auto</span>}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: "var(--text-muted)" }}>$</span>
              <input type="number" required min="0" step="0.01" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} className="w-full pl-8 pr-4 py-3.5 text-lg rounded-xl transition-smooth tabular-nums" style={inputStyle} placeholder="0.00" />
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <label className="flex items-center gap-2 text-base font-semibold mb-3" style={labelStyle}><Hash size={18} style={{ color: "var(--accent)" }} />Código de confirmación{ocrDone && confirmationCode && <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: "var(--success-bg)", color: "var(--success)" }}>Auto</span>}</label>
            <input type="text" value={confirmationCode} onChange={e => setConfirmationCode(e.target.value)} className="w-full px-4 py-3.5 text-lg rounded-xl transition-smooth font-mono" style={inputStyle} placeholder="#XXXX-00000000" />
          </div>

          <div className="glass rounded-2xl p-4">
            <label className="flex items-center gap-2 text-base font-semibold mb-3" style={labelStyle}><StickyNote size={18} style={{ color: "var(--accent)" }} />Notas <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>(opcional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3.5 text-lg rounded-xl transition-smooth resize-none" style={inputStyle} placeholder="Algún detalle..." />
          </div>

          {error && <div className="text-base p-3 rounded-xl" style={{ background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger)" }}>{error}</div>}

          <button type="submit" disabled={loading || ocrLoading} className="w-full py-4 text-lg font-semibold rounded-2xl transition-smooth press-effect disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "var(--accent)", color: "#fff" }}>
            {loading ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={22} />}
            {loading ? "Guardando..." : "Guardar pago"}
          </button>
        </form>
      </main>
    </div>
  );
}
