"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  LogOut,
  PlusCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowRight,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import type { Payment } from "@/lib/types";

export default function DashboardPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthStats, setMonthStats] = useState({
    total: 0,
    count: 0,
    avg: 0,
  });
  const [filterDate, setFilterDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const monthInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchData = async (year: number, month: number) => {
    setLoading(true);
    const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
    const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data: recentPayments } = await supabase
      .from("payments")
      .select("*")
      .order("date", { ascending: false })
      .limit(10);

    const { data: monthPayments } = await supabase
      .from("payments")
      .select("amount_paid")
      .gte("date", firstDay)
      .lte("date", lastDay);

    if (recentPayments) setPayments(recentPayments);

    if (monthPayments) {
      const total = monthPayments.reduce(
        (sum, p) => sum + Number(p.amount_paid),
        0
      );
      const count = monthPayments.length;
      setMonthStats({
        total,
        count,
        avg: count > 0 ? total / count : 0,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(filterDate.year, filterDate.month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const prevMonth = () => {
    setFilterDate((prev) => {
      const newMonth = prev.month - 1;
      if (newMonth < 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: newMonth };
    });
  };

  const nextMonth = () => {
    setFilterDate((prev) => {
      const now = new Date();
      const target = new Date(prev.year, prev.month + 1, 1);
      if (target > now) return prev;
      const newMonth = prev.month + 1;
      if (newMonth > 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: newMonth };
    });
  };

  const handleMonthPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month] = e.target.value.split("-").map(Number);
    setFilterDate({ year, month: month - 1 });
  };

  const openMonthPicker = () => {
    monthInputRef.current?.showPicker();
  };

  const filterMonthName = new Date(
    filterDate.year,
    filterDate.month,
    1
  ).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const isCurrentMonth =
    filterDate.year === new Date().getFullYear() &&
    filterDate.month === new Date().getMonth();

  const monthValue = `${filterDate.year}-${String(filterDate.month + 1).padStart(2, "0")}`;

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-3 rounded-full animate-spin mb-3" style={{ borderColor: "var(--glass-border)", borderTopColor: "var(--accent)" }} />
          <p style={{ color: "var(--text-muted)" }} className="text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header className="sticky top-0 z-40" style={{ background: "var(--header-bg)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--glass-border)" }}>
        <div className="max-w-lg mx-auto px-5 py-4 flex justify-between items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Estás en
            </p>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Inicio</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm transition-smooth p-2"
              style={{ color: "var(--text-secondary)" }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6 space-y-5">
        {/* Month Filter */}
        <section className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-smooth"
              style={{ background: "var(--input-bg)" }}
            >
              <ChevronLeft size={20} style={{ color: "var(--text-secondary)" }} />
            </button>
            <button
              onClick={openMonthPicker}
              className="text-center px-3 py-1 rounded-xl transition-smooth"
            >
              <div className="flex items-center gap-2 justify-center">
                <Calendar size={16} style={{ color: "var(--accent)" }} />
                <h2 className="text-lg font-bold capitalize" style={{ color: "var(--text-primary)" }}>
                  {filterMonthName}
                </h2>
              </div>
              {isCurrentMonth && (
                <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                  Mes actual
                </span>
              )}
            </button>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-smooth disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "var(--input-bg)" }}
            >
              <ChevronRight size={20} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
          <input
            ref={monthInputRef}
            type="month"
            value={monthValue}
            onChange={handleMonthPickerChange}
            className="sr-only"
            tabIndex={-1}
          />

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2" style={{ background: "var(--success-bg)" }}>
                <DollarSign size={20} style={{ color: "var(--success)" }} />
              </div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--success)" }}>
                ${monthStats.total.toLocaleString("es-MX")}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Cobrado</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2" style={{ background: "var(--accent-bg, var(--input-bg))" }}>
                <Receipt size={20} style={{ color: "var(--accent)" }} />
              </div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--accent)" }}>
                {monthStats.count}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Pagos</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2" style={{ background: "var(--input-bg)" }}>
                <TrendingUp size={20} style={{ color: "var(--text-secondary)" }} />
              </div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                $
                {monthStats.avg.toLocaleString("es-MX", {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Promedio</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <Link
          href="/payments/new"
          className="flex items-center justify-center gap-2 w-full py-4 text-lg font-semibold rounded-2xl transition-smooth press-effect"
          style={{ background: "var(--accent)", color: "#ffffff" }}
        >
          <PlusCircle size={22} />
          Registrar pago
        </Link>

        {/* Recent Payments */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Pagos recientes
            </h2>
            <Link
              href="/history"
              className="flex items-center gap-1 text-sm font-medium transition-smooth"
              style={{ color: "var(--accent)" }}
            >
              Ver todo
              <ArrowRight size={16} />
            </Link>
          </div>

          {payments.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Receipt size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-base" style={{ color: "var(--text-muted)" }}>
                No hay pagos registrados aún
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <Link
                  key={payment.id}
                  href={`/payments/${payment.id}`}
                  className="block glass rounded-2xl p-4 press-effect transition-smooth"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "var(--success-bg)" }}>
                        <DollarSign size={18} style={{ color: "var(--success)" }} />
                      </div>
                      <div>
                        <p className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                          $
                          {Number(payment.amount_paid).toLocaleString("es-MX")}
                        </p>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {new Date(
                            payment.date + "T00:00:00"
                          ).toLocaleDateString("es-MX", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                        {payment.confirmation_code && (
                          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {payment.confirmation_code}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {payment.receipt_url && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
                          Comprobante
                        </span>
                      )}
                      <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
