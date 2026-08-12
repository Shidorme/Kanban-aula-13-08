import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hasFirebaseConfig } from '../config/firebase';

interface LoginProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const Login: React.FC<LoginProps> = ({ onShowToast }) => {
  const { loginWithGoogle, loginAsDemo } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      await loginWithGoogle();
      onShowToast('Autenticado com sucesso!', 'Bem-vindo de volta.', 'success');
    } catch (err: unknown) {
      console.error('Erro no login Google:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao entrar com Google';
      onShowToast('Falha no Login', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    onShowToast('Modo Demonstrativo Ativo', 'Seus dados serão salvos localmente.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-xl shadow-indigo-600/30 mb-2">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold font-display bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              NovoKanban Board
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Organize seus projetos com alta performance, tempo real e resiliência total.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {/* Google SVG Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Entrar com Google</span>
            </button>

            <button
              onClick={handleDemoLogin}
              className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Modo Demonstrativo (Offline)</span>
              <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
            </button>
          </div>

          {!hasFirebaseConfig && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-300">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Chaves do Firebase não detectadas no <code>.env</code>. O Modo Demonstrativo utiliza armazenamento local no navegador.
              </span>
            </div>
          )}

          {/* Features Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Firestore / Local</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Autosave Debounced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
