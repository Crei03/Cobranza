"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import type { Payment } from "@/lib/types";

export default function HistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const monthInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchPayments = async (year: number, month: number) => {
    setLoading(true);
    const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
    const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];
    const { data } = await supabase
      .from("payments")
      .select("*")
      .gte("date", firstDay)
      .lte("date", lastDay)
      .order("date", { ascending: false });
    setPayments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayments(filterDate.year, filterDate.month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate]);

  const total = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const prevMonth = () => setFilterDate(p => ({ year: p.month === 0 ? p.year - 1 : p.year, month: p.month === 0 ? 11 : p.month - 1 }));
  const nextMonth = () => setFilterDate(p => {
    const now = new Date();
    if (new Date(p.year, p.month + 1, 1) > now) return p;
    return { year: p.month === 11 ? p.year + 1 : p.year, month: p.month === 11 ? 0 : p.month + 1 };
  });
  const monthValue = `${filterDate.year}-${String(filterDate.month + 1).padStart(2, "0")}`;
  const filterMonthName = new Date(filterDate.year, filterDate.month, 1).toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  const isCurrentMonth = filterDate.year === new Date().getFullYear() && filterDate.month === new Date().getMonth();

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header className="sticky top-0 z-40" style={{ background: "var(--header-bg)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--glass-border)" }}>
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 rounded-xl transition-smooth" style={{ background: "var(--input-bg)" }}>
            <ArrowLeft size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Estás en</p>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Historial</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6 space-y-4">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="flex items-center justify-center w-10 h-10 rounded-xl transition-smooth" style={{ background: "var(--input-bg)" }}>
              <ChevronLeft size={20} style={{ color: "var(--text-secondary)" }} />
            </button>
            <button onClick={() => monthInputRef.current?.showPicker()} className="text-center px-3 py-1 rounded-xl">
              <div className="flex items-center gap-2 justify-center">
                <Calendar size={16} style={{ color: "var(--accent)" }} />
                <h2 className="text-lg font-bold capitalize" style={{ color: "var(--text-primary)" }}>{filterMonthName}</h2>
              </div>
              {isCurrentMonth && <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>Mes actual</span>}
            </button>
            <button onClick={nextMonth} disabled={isCurrentMonth} className="flex items-center justify-center w-10 h-10 rounded-xl transition-smooth disabled:opacity-30" style={{ background: "var(--input-bg)" }}>
              <ChevronRight size={20} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
          <input ref={monthInputRef} type="month" value={monthValue} onChange={e => { const [y, m] = e.target.value.split("-").map(Number); setFilterDate({ year: y, month: m - 1 }); }} className="sr-only" tabIndex={-1} />
        </div>

        <div className="glass rounded-2xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} style={{ color: "var(--text-muted)" }} />
            <span style={{ color: "var(--text-secondary)" }}>{payments.length} pago{payments.length !== 1 ? "s" : ""}</span>
          </div>
          <span className="text-xl font-bold tabular-nums" style={{ color: "var(--success)" }}>${total.toLocaleString("es-MX")}</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-3 rounded-full animate-spin mb-3" style={{ borderColor: "var(--glass-border)", borderTopColor: "var(--accent)" }} />
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>Cargando pagos...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <ClipboardList size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>No hay pagos este mes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map(payment => (
              <Link key={payment.id} href={`/payments/${payment.id}`} className="block glass rounded-2xl p-4 press-effect transition-smooth">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl" style={{ background: "var(--success-bg)" }}>
                      <DollarSign size={20} style={{ color: "var(--success)" }} />
                    </div>
                    <div>
                      <p className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>${Number(payment.amount_paid).toLocaleString("es-MX")}</p>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{new Date(payment.date + "T00:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</p>
                      {payment.confirmation_code && <p className="text-xs font-mono mt-1" style={{ color: "var(--text-muted)" }}>{payment.confirmation_code}</p>}
                    </div>
                  </div>
                  {payment.receipt_url && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "var(--success-bg)" }}>
                      <Paperclip size={14} style={{ color: "var(--success)" }} />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
