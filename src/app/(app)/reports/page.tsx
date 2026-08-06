"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ExcelJS from "exceljs";
import { ArrowLeft, Download, BarChart3, DollarSign, Receipt, Calendar, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface MonthData { month: string; label: string; total: number; count: number; }
type RangeOption = "6m" | "1y" | "all";
const RANGE_LABELS: Record<RangeOption, string> = { "6m": "6 meses", "1y": "1 año", all: "Todo" };

export default function ReportsPage() {
  const [months, setMonths] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [range, setRange] = useState<RangeOption>("6m");
  const router = useRouter();
  const supabase = createClient();

  const fetchMonthlyData = async (selectedRange: RangeOption) => {
    setLoading(true);
    const now = new Date();
    const results: MonthData[] = [];
    let monthsBack = selectedRange === "1y" ? 12 : selectedRange === "all" ? 12 : 6;
    if (selectedRange === "all") {
      const fp = await supabase.from("payments").select("date").order("date", { ascending: true }).limit(1).single();
      if (fp.data) { const fd = new Date(fp.data.date); monthsBack = (now.getFullYear() - fd.getFullYear()) * 12 + (now.getMonth() - fd.getMonth()) + 1; }
    }
    for (let i = 0; i < monthsBack; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const fd = d.toISOString().split("T")[0];
      const ld = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
      const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const { data } = await supabase.from("payments").select("amount_paid").gte("date", fd).lte("date", ld);
      const total = (data || []).reduce((s, p) => s + Number(p.amount_paid), 0);
      results.push({ month: mk, label: d.toLocaleDateString("es-MX", { month: "long", year: "numeric" }), total, count: (data || []).length });
    }
    setMonths(results);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { fetchMonthlyData(range); }, [range]);

  const handleExport = async () => {
    setExporting(true);
    const { data } = await supabase.from("payments").select("*").order("date", { ascending: false });
    if (!data || data.length === 0) { setExporting(false); return; }
    const wb = new ExcelJS.Workbook();
    wb.creator = "Mi Cobranza";
    const hf: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F2937" } };
    const fmt = '"$"#,##0.00';
    const g = new Map<string, typeof data>();
    for (const p of data) { const k = p.date.substring(0, 7); if (!g.has(k)) g.set(k, []); g.get(k)!.push(p); }
    const ws = wb.addWorksheet("Resumen");
    ws.columns = [{ header: "Mes", key: "m", width: 25 }, { header: "Pagos", key: "c", width: 12 }, { header: "Total", key: "t", width: 18 }];
    ws.getRow(1).eachCell(c => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = hf; c.alignment = { horizontal: "center" }; });
    let totalPagos = 0;
    let totalMonto = 0;
    for (const [mk, ps] of g) { const d = new Date(mk + "-01"); const t = ps.reduce((s, p) => s + Number(p.amount_paid), 0); totalPagos += ps.length; totalMonto += t; ws.addRow({ m: d.toLocaleDateString("es-MX", { month: "long", year: "numeric" }), c: ps.length, t }); }
    const totalRow = ws.addRow({ m: "TOTAL", c: totalPagos, t: totalMonto });
    totalRow.eachCell(c => { c.font = { bold: true }; });
    ws.getColumn(2).numFmt = fmt;
    ws.getColumn(3).numFmt = fmt;
    for (const [mk, ps] of g) { const d = new Date(mk + "-01"); const s = wb.addWorksheet(d.toLocaleDateString("es-MX", { month: "short", year: "numeric" })); s.columns = [{ header: "Fecha", key: "d", width: 15 }, { header: "Monto", key: "a", width: 18 }, { header: "Confirmación", key: "co", width: 22 }, { header: "Notas", key: "n", width: 30 }]; s.getRow(1).eachCell(c => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = hf; c.alignment = { horizontal: "center" }; }); for (const p of ps) { s.addRow({ d: new Date(p.date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }), a: Number(p.amount_paid), co: p.confirmation_code || "", n: p.notes || "" }); } s.getColumn(2).numFmt = fmt; }
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `cobranza-${new Date().toISOString().split("T")[0]}.xlsx`; a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const gt = months.reduce((s, m) => s + m.total, 0);
  const gc = months.reduce((s, m) => s + m.count, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header className="sticky top-0 z-40" style={{ background: "var(--header-bg)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--glass-border)" }}>
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 rounded-xl transition-smooth" style={{ background: "var(--input-bg)" }}>
            <ArrowLeft size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Estás en</p>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Reportes</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-5 py-6 space-y-5">
        <div className="glass rounded-2xl p-2 flex gap-1">
          {(Object.keys(RANGE_LABELS) as RangeOption[]).map(opt => (
            <button key={opt} onClick={() => setRange(opt)} className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-smooth" style={{ background: range === opt ? "var(--accent)" : "transparent", color: range === opt ? "#fff" : "var(--text-secondary)" }}>
              {RANGE_LABELS[opt]}
            </button>
          ))}
        </div>
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} style={{ color: "var(--accent)" }} />
            <h2 className="text-base font-semibold" style={{ color: "var(--text-secondary)" }}>Resumen {RANGE_LABELS[range].toLowerCase()}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2" style={{ background: "var(--success-bg)" }}><DollarSign size={24} style={{ color: "var(--success)" }} /></div>
              <p className="text-3xl font-bold tabular-nums" style={{ color: "var(--success)" }}>${gt.toLocaleString("es-MX")}</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Total cobrado</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2" style={{ background: "var(--input-bg)" }}><Receipt size={24} style={{ color: "var(--accent)" }} /></div>
              <p className="text-3xl font-bold tabular-nums" style={{ color: "var(--accent)" }}>{gc}</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Pagos registrados</p>
            </div>
          </div>
        </section>
        <button onClick={handleExport} disabled={exporting} className="w-full py-4 glass rounded-2xl text-lg font-semibold transition-smooth press-effect disabled:opacity-50 flex items-center justify-center gap-2" style={{ color: "var(--text-primary)" }}>
          {exporting ? <Loader2 size={22} className="animate-spin" /> : <Download size={22} />}
          {exporting ? "Exportando..." : "Exportar a Excel"}
        </button>
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} style={{ color: "var(--accent)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Por mes</h2>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-3 rounded-full animate-spin mb-3" style={{ borderColor: "var(--glass-border)", borderTopColor: "var(--accent)" }} />
              <p className="text-lg" style={{ color: "var(--text-muted)" }}>Cargando reportes...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {months.map(m => (
                <div key={m.month} className="glass rounded-2xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl" style={{ background: "var(--input-bg)" }}><Calendar size={20} style={{ color: "var(--accent)" }} /></div>
                    <div>
                      <p className="text-base font-semibold capitalize" style={{ color: "var(--text-primary)" }}>{m.label}</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{m.count} pago{m.count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>${m.total.toLocaleString("es-MX")}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
