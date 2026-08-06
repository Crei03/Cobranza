"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { ArrowLeft, Calendar, StickyNote, Trash2, Paperclip, Hash } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import type { Payment } from "@/lib/types";

export default function PaymentDetailPage() {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => { const { data } = await supabase.from("payments").select("*").eq("id", params.id).single(); setPayment(data); setLoading(false); };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este pago?")) return;
    setDeleting(true);
    if (payment?.receipt_url) { const path = payment.receipt_url.split("/receipts/")[1]; if (path) await supabase.storage.from("receipts").remove([`receipts/${path}`]); }
    await supabase.from("payments").delete().eq("id", payment!.id);
    router.push("/history");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}><div className="text-center"><div className="inline-block w-8 h-8 border-3 rounded-full animate-spin mb-3" style={{ borderColor: "var(--glass-border)", borderTopColor: "var(--accent)" }} /><p style={{ color: "var(--text-muted)" }} className="text-lg">Cargando...</p></div></div>;
  if (!payment) return <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}><div className="glass rounded-2xl p-8 text-center"><p className="text-lg" style={{ color: "var(--text-muted)" }}>Pago no encontrado</p></div></div>;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header className="sticky top-0 z-40" style={{ background: "var(--header-bg)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--glass-border)" }}>
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 rounded-xl transition-smooth" style={{ background: "var(--input-bg)" }}>
            <ArrowLeft size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Estás en</p>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Detalle del pago</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-5 py-6 space-y-4">
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-5 text-center" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            <p className="text-4xl font-bold tabular-nums" style={{ color: "var(--success)" }}>${Number(payment.amount_paid).toLocaleString("es-MX")}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "var(--input-bg)", color: "var(--accent)" }}>
              <Calendar size={15} />
              <span className="text-sm font-medium">{new Date(payment.date + "T00:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            {payment.confirmation_code && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "var(--input-bg)", color: "var(--accent)" }}>
                <Hash size={14} /><span className="text-sm font-mono font-medium">{payment.confirmation_code}</span>
              </div>
            )}
          </div>
          {(payment.daily_income || payment.notes) && (
            <div className="p-5 space-y-3">
              {payment.daily_income && <div className="flex items-center justify-between"><span className="text-sm" style={{ color: "var(--text-muted)" }}>Ingreso del día</span><span className="text-base font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>${Number(payment.daily_income).toLocaleString("es-MX")}</span></div>}
              {payment.notes && <div><div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--text-muted)" }}><StickyNote size={14} /><span className="text-xs font-medium">Notas</span></div><p className="text-sm" style={{ color: "var(--text-secondary)" }}>{payment.notes}</p></div>}
            </div>
          )}
        </div>
        {payment.receipt_url && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-4 pb-2"><Paperclip size={16} style={{ color: "var(--text-muted)" }} /><span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Comprobante</span></div>
            <div className="relative mx-4 mb-4 rounded-xl overflow-hidden"><Image src={payment.receipt_url} alt="Comprobante" width={600} height={400} className="w-full object-contain max-h-80" style={{ outline: "1px solid var(--input-border)" }} /></div>
          </div>
        )}
        <button onClick={handleDelete} disabled={deleting} className="w-full py-4 text-lg font-semibold rounded-2xl transition-smooth press-effect disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "var(--danger-bg)", border: "1px solid var(--danger)", color: "var(--danger)" }}>
          {deleting ? <span className="inline-block w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--danger)", borderTopColor: "transparent" }} /> : <Trash2 size={20} />}
          {deleting ? "Eliminando..." : "Eliminar pago"}
        </button>
      </main>
    </div>
  );
}
