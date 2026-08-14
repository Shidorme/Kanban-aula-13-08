import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, hasFirebaseConfig } from '../config/firebase';
import type { BoardData, SyncStatus, UserProfile } from '../types/kanban';

export const DEFAULT_BOARD: BoardData = {
  boardId: 'default-board',
  columns: [
    {
      id: 'col-todo',
      title: '📌 A Fazer',
      order: 0,
      cardIds: ['card-1', 'card-2'],
    },
    {
      id: 'col-progress',
      title: '⚡ Em Progresso',
      order: 1,
      cardIds: ['card-3'],
    },
    {
      id: 'col-done',
      title: '🎉 Concluído',
      order: 2,
      cardIds: ['card-4'],
    },
  ],
  cards: {
    'card-1': {
      id: 'card-1',
      title: 'Criar wireframe da landing page',
      description: 'Desenhar protótipos de alta fidelidade no Figma com paleta moderna',
      labels: [
        { id: 'l1', name: 'Design', color: '#ec4899' },
        { id: 'l2', name: 'Urgente', color: '#ef4444' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    },
    'card-2': {
      id: 'card-2',
      title: 'Integrar Firebase Authentication',
      description: 'Implementar login com Google e suporte a login anônimo/demo',
      labels: [{ id: 'l3', name: 'Backend', color: '#8b5cf6' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    },
    'card-3': {
      id: 'card-3',
      title: 'Desenvolver Drag and Drop',
      description: 'Utilizar @dnd-kit para movimentação suave de cartões e colunas',
      labels: [{ id: 'l4', name: 'Frontend', color: '#3b82f6' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    },
    'card-4': {
      id: 'card-4',
      title: 'Configurar regras do Firestore',
      description: 'Restringir permissões de leitura/escrita por usuário logado',
      labels: [{ id: 'l5', name: 'Segurança', color: '#10b981' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date().toISOString().split('T')[0],
    },
  },
};

export const useBoardData = (user: UserProfile | null, isDemoMode: boolean) => {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved');

  const pendingSaveDataRef = useRef<BoardData | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getStorageKey = useCallback((uid: string) => `kanban_board_${uid}`, []);

  // 1. Carregamento Inicial com Timeout de 3.5s
  useEffect(() => {
    if (!user) {
      setBoardData(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const initialBoard: BoardData = {
      ...DEFAULT_BOARD,
      boardId: user.uid,
    };

    // Timeout de resiliência de 3.5s
    const loadTimeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Timeout no carregamento de dados do Firestore/Storage. Exibindo dados locais/padrão.');
        const localKey = getStorageKey(user.uid);
        const cached = localStorage.getItem(localKey);
        if (cached) {
          try {
            setBoardData(JSON.parse(cached));
          } catch {
            setBoardData(initialBoard);
          }
        } else {
          setBoardData(initialBoard);
        }
        setIsLoading(false);
      }
    }, 3500);

    const fetchBoard = async () => {
      const localKey = getStorageKey(user.uid);
      const cached = localStorage.getItem(localKey);
      let loadedData: BoardData | null = null;

      if (isDemoMode || !hasFirebaseConfig || !db) {
        if (cached) {
          try {
            loadedData = JSON.parse(cached);
          } catch {
            loadedData = initialBoard;
          }
        } else {
          loadedData = initialBoard;
        }
      } else {
        try {
          const docRef = doc(db, 'boards', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            loadedData = docSnap.data() as BoardData;
          } else if (cached) {
            try {
              loadedData = JSON.parse(cached);
            } catch {
              loadedData = initialBoard;
            }
          } else {
            loadedData = initialBoard;
            // Salva dados padrões iniciais no Firestore se for primeiro acesso
            await setDoc(docRef, initialBoard);
          }
        } catch (err) {
          console.error('Erro ao ler Firestore:', err);
          if (cached) {
            try {
              loadedData = JSON.parse(cached);
            } catch {
              loadedData = initialBoard;
            }
          } else {
            loadedData = initialBoard;
          }
        }
      }

      if (isMounted) {
        clearTimeout(loadTimeoutId);
        setBoardData(loadedData);
        setIsLoading(false);
      }
    };

    fetchBoard();

    return () => {
      isMounted = false;
      clearTimeout(loadTimeoutId);
    };
  }, [user, isDemoMode, getStorageKey]);

  // 2. Gravação imediata (Persistência)
  const savePersistedData = useCallback(
    async (dataToSave: BoardData) => {
      if (!user) return;
      setSyncStatus('saving');

      // Sempre atualiza LocalStorage para redundância rápida
      const localKey = getStorageKey(user.uid);
      try {
        localStorage.setItem(localKey, JSON.stringify(dataToSave));
      } catch (err) {
        console.error('Erro ao salvar no LocalStorage:', err);
      }

      // Se estiver no Firebase Firestore e não for Demo Mode
      if (!isDemoMode && hasFirebaseConfig && db) {
        try {
          const docRef = doc(db, 'boards', user.uid);
          await setDoc(docRef, dataToSave, { merge: true });
          setSyncStatus('saved');
        } catch (err) {
          console.error('Erro ao sincronizar com Cloud Firestore:', err);
          setSyncStatus('error');
        }
      } else {
        setSyncStatus('saved');
      }

      pendingSaveDataRef.current = null;
    },
    [user, isDemoMode, getStorageKey]
  );

  // 3. Debounce de 400ms para alterações contínuas
  const updateBoard = useCallback(
    (newBoardData: BoardData) => {
      setBoardData(newBoardData);
      setSyncStatus('saving');
      pendingSaveDataRef.current = newBoardData;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (pendingSaveDataRef.current) {
          savePersistedData(pendingSaveDataRef.current);
        }
      }, 400);
    },
    [savePersistedData]
  );

  // Forçar salvamento manual/imediato
  const saveImmediately = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (pendingSaveDataRef.current) {
      savePersistedData(pendingSaveDataRef.current);
    }
  }, [savePersistedData]);

  // 4. Listener no `beforeunload` para salvamento de emergência
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingSaveDataRef.current && user) {
        const localKey = getStorageKey(user.uid);
        try {
          localStorage.setItem(localKey, JSON.stringify(pendingSaveDataRef.current));
        } catch (e) {
          console.error('Erro no salvamento beforeunload:', e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, getStorageKey]);

  return {
    boardData,
    isLoading,
    syncStatus,
    updateBoard,
    saveImmediately,
  };
};
