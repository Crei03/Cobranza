"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Car, LogIn, Eye, EyeOff, KeyRound } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message.includes("Invalid login")
          ? "Correo o contraseña incorrectos"
          : "Error al iniciar sesión. Intenta de nuevo."
      );
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setResetError("Error al enviar el correo. Intenta de nuevo.");
      setResetLoading(false);
      return;
    }

    setResetSent(true);
    setResetLoading(false);
  };

  const inputStyle = {
    background: "var(--input-bg)",
    border: "1px solid var(--input-border)",
    color: "var(--text-primary)",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-4">
            <Car size={32} strokeWidth={1.8} />
          </div>
          <h1 className="text-3xl font-bold text-white">Mi Cobranza</h1>
          <p className="text-white/70 mt-2 text-lg">
            Inicia sesión para continuar
          </p>
        </div>

        {!showForgot ? (
          <form
            onSubmit={handleLogin}
            className="glass rounded-2xl p-6 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-base font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 text-lg rounded-xl transition-smooth"
                style={inputStyle}
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-base font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 text-lg rounded-xl transition-smooth"
                  style={inputStyle}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "var(--text-muted)" }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setShowForgot(true);
                  setResetEmail(email);
                  setResetSent(false);
                  setResetError(null);
                }}
                className="text-sm font-semibold transition-smooth"
                style={{ color: "var(--accent)" }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error && (
              <div
                className="text-base p-3 rounded-xl"
                style={{
                  background: "var(--danger-bg)",
                  color: "var(--danger)",
                  border: "1px solid var(--danger)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg font-semibold rounded-xl transition-smooth press-effect disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={22} />
              )}
              {loading ? "Entrando..." : "Iniciar sesión"}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/register"
                className="text-sm font-medium transition-smooth"
                style={{ color: "var(--accent)" }}
              >
                ¿No tienes cuenta? Crear una
              </Link>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleResetPassword}
            className="glass rounded-2xl p-6 space-y-5"
          >
            {resetSent ? (
              <div className="text-center py-4">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
                  style={{ background: "var(--success-bg)" }}
                >
                  <KeyRound size={28} style={{ color: "var(--success)" }} />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Correo enviado
                </h2>
                <p className="text-base" style={{ color: "var(--text-secondary)" }}>
                  Revisa tu bandeja de entrada y sigue las instrucciones para
                  restablecer tu contraseña.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-base font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3.5 text-lg rounded-xl transition-smooth"
                    style={inputStyle}
                    placeholder="tu@correo.com"
                  />
                </div>

                {resetError && (
                  <div
                    className="text-base p-3 rounded-xl"
                    style={{
                      background: "var(--danger-bg)",
                      color: "var(--danger)",
                      border: "1px solid var(--danger)",
                    }}
                  >
                    {resetError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-4 text-lg font-semibold rounded-xl transition-smooth press-effect disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  {resetLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <KeyRound size={22} />
                  )}
                  {resetLoading ? "Enviando..." : "Enviar correo"}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="w-full text-center text-sm font-medium transition-smooth py-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
