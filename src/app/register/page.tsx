"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Car, UserPlus, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/` } });
    if (error) {
      setError(error.message.includes("already") ? "Este correo ya está registrado." : "Error al crear la cuenta.");
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
    setTimeout(() => { router.push("/"); router.refresh(); }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Car size={32} strokeWidth={1.8} style={{ color: "var(--text-primary)" }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Mi Cobranza</h1>
          <p className="mt-2 text-lg" style={{ color: "var(--text-secondary)" }}>Crea tu cuenta para empezar</p>
        </div>

        <div className="rounded-2xl p-6 space-y-5" style={{ background: "#ffffff", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
          {success ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3" style={{ background: "#f0fdf4" }}>
                <CheckCircle size={28} style={{ color: "#16a34a" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "#111827" }}>Cuenta creada</h2>
              <p className="text-base" style={{ color: "#6b7280" }}>Redirigiendo...</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-base font-semibold mb-2" style={{ color: "#374151" }}>Correo electrónico</label>
                <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 text-lg rounded-xl transition-smooth"
                  style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#111827" }}
                  placeholder="tu@correo.com" autoComplete="email" />
              </div>
              <div>
                <label htmlFor="password" className="block text-base font-semibold mb-2" style={{ color: "#374151" }}>Contraseña</label>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 text-lg rounded-xl transition-smooth"
                    style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#111827" }}
                    placeholder="Mínimo 6 caracteres" minLength={6} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: "#9ca3af" }} tabIndex={-1}>
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="text-base p-3 rounded-xl" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>{error}</div>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-4 text-lg font-semibold rounded-xl transition-smooth press-effect disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#374151", color: "#ffffff" }}>
                {loading ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={22} />}
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>
          )}
          <div className="text-center pt-2">
            <Link href="/login" className="text-sm font-medium transition-smooth" style={{ color: "#4b5563" }}>
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
