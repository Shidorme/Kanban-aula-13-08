import React, { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useBoardData } from './hooks/useBoardData';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { Login } from './components/Login';
import { ToastContainer, type ToastMessage, type ToastType } from './components/Toast';
import { Loader2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, loading: authLoading, isDemoMode, logout } = useAuth();
  const { boardData, isLoading: boardLoading, syncStatus, updateBoard, saveImmediately } =
    useBoardData(user, isDemoMode);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (title: string, message?: string, type: ToastType = 'info') => {
      const newToast: ToastMessage = {
        id: `toast-${Date.now()}-${Math.random()}`,
        title,
        message,
        type,
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-300">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium">Carregando autenticação...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login onShowToast={addToast} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        user={user}
        syncStatus={syncStatus}
        onManualSave={() => {
          saveImmediately();
          addToast('Gravando...', 'Dados sincronizados.', 'success');
        }}
        onLogout={async () => {
          await logout();
          addToast('Sessão encerrada', 'Você saiu da sua conta.', 'info');
        }}
      />

      {boardLoading || !boardData ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium">Carregando dados do quadro...</p>
        </div>
      ) : (
        <KanbanBoard
          boardData={boardData}
          onUpdateBoard={updateBoard}
          onShowToast={addToast}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
