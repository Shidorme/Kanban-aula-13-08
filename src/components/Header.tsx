import React from 'react';
import { LogOut, Save, CheckCircle, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import type { UserProfile, SyncStatus } from '../types/kanban';

interface HeaderProps {
  user: UserProfile;
  syncStatus: SyncStatus;
  onManualSave: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  syncStatus,
  onManualSave,
  onLogout,
}) => {
  const renderSyncBadge = () => {
    switch (syncStatus) {
      case 'saving':
        return (
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold rounded-full flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Salvando...
          </span>
        );
      case 'saved':
        return (
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Salvo
          </span>
        );
      case 'error':
        return (
          <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Erro de Conexão
          </span>
        );
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-none">
            NovoKanban
          </h1>
          {user.isDemo && (
            <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
              Modo Demonstrativo
            </span>
          )}
        </div>
      </div>

      {/* Right Side: Status Badge, Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Autosave Status */}
        {renderSyncBadge()}

        {/* Manual Save Button */}
        <button
          onClick={onManualSave}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
          title="Forçar gravação imediata"
        >
          <Save className="w-3.5 h-3.5" /> Salvar
        </button>

        <div className="h-6 w-[1px] bg-slate-800" />

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Usuário'}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-400 text-white font-bold text-xs flex items-center justify-center">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <span className="text-sm font-semibold text-slate-200 hidden sm:inline">
            {user.displayName || 'Usuário'}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          title="Sair da conta"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
