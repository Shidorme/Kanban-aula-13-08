import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Search, Plus, Filter } from 'lucide-react';
import type { BoardData, Column, Card } from '../types/kanban';
import { ColumnComponent } from './ColumnComponent';
import { CardItem } from './CardItem';
import { CardModal } from './CardModal';
import { ConfirmModal } from './ConfirmModal';

interface KanbanBoardProps {
  boardData: BoardData;
  onUpdateBoard: (newBoardData: BoardData) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  boardData,
  onUpdateBoard,
  onShowToast,
}) => {
  // Estados de busca e filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<string>('all');

  // Estados de Dragging do @dnd-kit
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // Estados dos Modais
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [targetColumnIdForCard, setTargetColumnIdForCard] = useState<string>('');

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Configuração dos Sensores do DndKit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Exige 5px de movimento para evitar acionamentos acidentais em cliques
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Lista de todas as etiquetas únicas presentes nos cartões
  const availableLabels = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color: string }>();
    Object.values(boardData.cards).forEach((card) => {
      card.labels?.forEach((l) => {
        if (!map.has(l.name)) {
          map.set(l.name, l);
        }
      });
    });
    return Array.from(map.values());
  }, [boardData.cards]);

  // Filtro de Cards
  const filteredCards = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    const result: Record<string, Card> = {};

    Object.entries(boardData.cards).forEach(([id, card]) => {
      const matchesSearch =
        !searchTerm ||
        card.title.toLowerCase().includes(searchLower) ||
        card.description.toLowerCase().includes(searchLower) ||
        card.labels?.some((l) => l.name.toLowerCase().includes(searchLower));

      const matchesLabel =
        selectedLabelFilter === 'all' ||
        card.labels?.some((l) => l.name === selectedLabelFilter);

      if (matchesSearch && matchesLabel) {
        result[id] = card;
      }
    });

    return result;
  }, [boardData.cards, searchTerm, selectedLabelFilter]);

  // Colunas ordenadas
  const sortedColumns = useMemo(() => {
    return [...boardData.columns].sort((a, b) => a.order - b.order);
  }, [boardData.columns]);

  // Handlers para Ações de Colunas
  const handleAddColumn = () => {
    const newColId = `col-${Date.now()}`;
    const newColumn: Column = {
      id: newColId,
      title: 'Nova Coluna',
      order: boardData.columns.length,
      cardIds: [],
    };

    onUpdateBoard({
      ...boardData,
      columns: [...boardData.columns, newColumn],
    });

    onShowToast('Coluna Criada', 'Clique no título da coluna para renomear.', 'success');
  };

  const handleUpdateColumnTitle = (columnId: string, newTitle: string) => {
    const updatedColumns = boardData.columns.map((col) =>
      col.id === columnId ? { ...col, title: newTitle } : col
    );

    onUpdateBoard({
      ...boardData,
      columns: updatedColumns,
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    const colToDelete = boardData.columns.find((c) => c.id === columnId);
    if (!colToDelete) return;

    setConfirmModalState({
      isOpen: true,
      title: `Excluir Coluna "${colToDelete.title}"?`,
      message: `Esta ação removerá a coluna e todos os ${colToDelete.cardIds.length} cartões associados a ela.`,
      onConfirm: () => {
        const updatedColumns = boardData.columns.filter((c) => c.id !== columnId);
        const updatedCards = { ...boardData.cards };
        colToDelete.cardIds.forEach((cardId) => {
          delete updatedCards[cardId];
        });

        onUpdateBoard({
          ...boardData,
          columns: updatedColumns,
          cards: updatedCards,
        });

        onShowToast('Coluna Excluída', `A coluna "${colToDelete.title}" foi removida.`, 'info');
      },
    });
  };

  // Handlers para Ações de Cards
  const handleOpenAddCardModal = (columnId: string) => {
    setEditingCard(null);
    setTargetColumnIdForCard(columnId);
    setCardModalOpen(true);
  };

  const handleOpenEditCardModal = (card: Card) => {
    setEditingCard(card);
    const col = boardData.columns.find((c) => c.cardIds.includes(card.id));
    setTargetColumnIdForCard(col ? col.id : boardData.columns[0]?.id || '');
    setCardModalOpen(true);
  };

  const handleSaveCard = (savedCard: Card, targetColumnId: string) => {
    const updatedCards = {
      ...boardData.cards,
      [savedCard.id]: savedCard,
    };

    let updatedColumns = boardData.columns.map((col) => {
      // Remove do antigo cardIds se estiver lá
      const newCardIds = col.cardIds.filter((id) => id !== savedCard.id);
      return { ...col, cardIds: newCardIds };
    });

    // Adiciona no targetColumnId
    updatedColumns = updatedColumns.map((col) => {
      if (col.id === targetColumnId) {
        return { ...col, cardIds: [...col.cardIds, savedCard.id] };
      }
      return col;
    });

    onUpdateBoard({
      ...boardData,
      columns: updatedColumns,
      cards: updatedCards,
    });

    onShowToast(
      editingCard ? 'Cartão Atualizado' : 'Cartão Criado',
      `"${savedCard.title}" salvo com sucesso.`,
      'success'
    );
  };

  const handleDeleteCard = (cardId: string) => {
    const cardToDelete = boardData.cards[cardId];
    if (!cardToDelete) return;

    setConfirmModalState({
      isOpen: true,
      title: `Excluir Cartão "${cardToDelete.title}"?`,
      message: 'O cartão será permanentemente excluído do quadro.',
      onConfirm: () => {
        const updatedCards = { ...boardData.cards };
        delete updatedCards[cardId];

        const updatedColumns = boardData.columns.map((col) => ({
          ...col,
          cardIds: col.cardIds.filter((id) => id !== cardId),
        }));

        onUpdateBoard({
          ...boardData,
          columns: updatedColumns,
          cards: updatedCards,
        });

        onShowToast('Cartão Removido', `"${cardToDelete.title}" foi excluído.`, 'info');
      },
    });
  };

  // Drag & Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'Column') {
      setActiveColumn(activeData.column);
    } else if (activeData?.type === 'Card') {
      setActiveCard(activeData.card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === 'Card';
    const isOverCard = over.data.current?.type === 'Card';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveCard) return;

    // Caso 1: Arrastando card sobre outro card
    if (isActiveCard && isOverCard) {
      const activeCol = boardData.columns.find((c) => c.cardIds.includes(activeId));
      const overCol = boardData.columns.find((c) => c.cardIds.includes(overId));

      if (!activeCol || !overCol || activeCol.id === overCol.id) return;

      const overIndex = overCol.cardIds.indexOf(overId);

      const newActiveCardIds = activeCol.cardIds.filter((id) => id !== activeId);
      const newOverCardIds = [...overCol.cardIds];
      newOverCardIds.splice(overIndex, 0, activeId);

      const updatedColumns = boardData.columns.map((col) => {
        if (col.id === activeCol.id) return { ...col, cardIds: newActiveCardIds };
        if (col.id === overCol.id) return { ...col, cardIds: newOverCardIds };
        return col;
      });

      onUpdateBoard({ ...boardData, columns: updatedColumns });
    }

    // Caso 2: Arrastando card sobre uma coluna vazia ou área de coluna
    if (isActiveCard && isOverColumn) {
      const activeCol = boardData.columns.find((c) => c.cardIds.includes(activeId));
      const overCol = boardData.columns.find((c) => c.id === overId);

      if (!activeCol || !overCol || activeCol.id === overCol.id) return;

      const newActiveCardIds = activeCol.cardIds.filter((id) => id !== activeId);
      const newOverCardIds = [...overCol.cardIds, activeId];

      const updatedColumns = boardData.columns.map((col) => {
        if (col.id === activeCol.id) return { ...col, cardIds: newActiveCardIds };
        if (col.id === overCol.id) return { ...col, cardIds: newOverCardIds };
        return col;
      });

      onUpdateBoard({ ...boardData, columns: updatedColumns });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveColumn(null);
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // 1. Reordenar Colunas
    if (active.data.current?.type === 'Column') {
      if (activeId !== overId) {
        const oldIndex = sortedColumns.findIndex((c) => c.id === activeId);
        const newIndex = sortedColumns.findIndex((c) => c.id === overId);

        const reordered = arrayMove(sortedColumns, oldIndex, newIndex).map((col, index) => ({
          ...col,
          order: index,
        }));

        onUpdateBoard({ ...boardData, columns: reordered });
      }
      return;
    }

    // 2. Reordenar Cards dentro da mesma coluna
    if (active.data.current?.type === 'Card') {
      const col = boardData.columns.find((c) => c.cardIds.includes(activeId));
      if (col && col.cardIds.includes(overId)) {
        const oldIndex = col.cardIds.indexOf(activeId);
        const newIndex = col.cardIds.indexOf(overId);

        if (oldIndex !== newIndex) {
          const reorderedCardIds = arrayMove(col.cardIds, oldIndex, newIndex);
          const updatedColumns = boardData.columns.map((c) =>
            c.id === col.id ? { ...c, cardIds: reorderedCardIds } : c
          );
          onUpdateBoard({ ...boardData, columns: updatedColumns });
        }
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search & Action Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Search Input & Filter */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, descrição ou etiquetas..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Label Filter Dropdown */}
          <div className="relative flex items-center">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={selectedLabelFilter}
              onChange={(e) => setSelectedLabelFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="all">Todas as Etiquetas</option>
              {availableLabels.map((lbl) => (
                <option key={lbl.id} value={lbl.name}>
                  {lbl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: New Column Button */}
        <button
          onClick={handleAddColumn}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nova Coluna
        </button>
      </div>

      {/* Kanban Drag and Drop Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 p-6 overflow-x-auto flex gap-6 items-start">
          <SortableContext
            items={sortedColumns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {sortedColumns.map((column) => {
              // Cartões filtrados desta coluna
              const colCards = column.cardIds
                .map((id) => filteredCards[id])
                .filter(Boolean);

              return (
                <ColumnComponent
                  key={column.id}
                  column={column}
                  cards={colCards}
                  onUpdateTitle={handleUpdateColumnTitle}
                  onDeleteColumn={handleDeleteColumn}
                  onAddCard={handleOpenAddCardModal}
                  onEditCard={handleOpenEditCardModal}
                  onDeleteCard={handleDeleteCard}
                />
              );
            })}
          </SortableContext>

          {/* Botão de Adicionar Coluna no final da lista */}
          <button
            onClick={handleAddColumn}
            className="w-80 h-28 shrink-0 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-300 bg-slate-900/30 hover:bg-slate-900/60 transition-all font-semibold text-sm group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Adicionar Coluna
          </button>
        </div>

        {/* Drag Overlay para feedback suave */}
        <DragOverlay>
          {activeColumn ? (
            <ColumnComponent
              column={activeColumn}
              cards={activeColumn.cardIds
                .map((id) => boardData.cards[id])
                .filter(Boolean)}
              onUpdateTitle={() => {}}
              onDeleteColumn={() => {}}
              onAddCard={() => {}}
              onEditCard={() => {}}
              onDeleteCard={() => {}}
            />
          ) : null}

          {activeCard ? (
            <CardItem card={activeCard} onEdit={() => {}} onDelete={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modais */}
      <CardModal
        isOpen={cardModalOpen}
        card={editingCard}
        columns={sortedColumns}
        currentColumnId={targetColumnIdForCard}
        onClose={() => setCardModalOpen(false)}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        onConfirm={confirmModalState.onConfirm}
        onClose={() => setConfirmModalState((s) => ({ ...s, isOpen: false }))}
      />
    </div>
  );
};
