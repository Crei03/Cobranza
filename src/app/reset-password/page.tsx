"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { KeyRound, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setValidSession(true);
      } else {
        setError("No se detectó una sesión válida. Solicita un nuevo enlace.");
      }
      setChecking(false);
    };
    checkSession();
  }, [supabase]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Error al actualizar la contraseña: " + error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 3000);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin mb-3" />
          <p className="text-white/70 text-lg">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-4">
              <AlertCircle size={32} strokeWidth={1.8} />
            </div>
            <h1 className="text-3xl font-bold text-white">Enlace no válido</h1>
          </div>

          <div className="glass rounded-2xl p-6 text-center space-y-4">
            <p className="text-gray-600 text-base">
              {error || "El enlace no es válido o ya expiró."}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 py-3 px-6 bg-white text-gray-900 text-base font-semibold rounded-xl transition-smooth press-effect"
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-4">
            <KeyRound size={32} strokeWidth={1.8} />
          </div>
          <h1 className="text-3xl font-bold text-white">Nueva contraseña</h1>
          <p className="text-white/70 mt-2 text-lg">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-5">
          {success ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 mb-3">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Contraseña actualizada
              </h2>
              <p className="text-gray-500 text-base">
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-base font-semibold text-gray-700 mb-2"
                >
                  Nueva contraseña
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 text-lg border border-gray-200 rounded-xl bg-white/60 transition-smooth placeholder:text-gray-400"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-base font-semibold text-gray-700 mb-2"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3.5 text-lg border border-gray-200 rounded-xl bg-white/60 transition-smooth placeholder:text-gray-400"
                  placeholder="Repite tu contraseña"
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-base p-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-gray-900 text-base font-semibold rounded-xl transition-smooth press-effect disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <KeyRound size={20} />
                )}
                {loading ? "Guardando..." : "Guardar contraseña"}
              </button>
            </form>
          )}

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium active:text-gray-700 transition-smooth py-2"
          >
            <ArrowLeft size={16} />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
