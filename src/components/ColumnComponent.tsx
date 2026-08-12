import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripHorizontal, Trash2, Check, X } from 'lucide-react';
import type { Column, Card } from '../types/kanban';
import { CardItem } from './CardItem';

interface ColumnComponentProps {
  column: Column;
  cards: Card[];
  onUpdateTitle: (columnId: string, newTitle: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
}

export const ColumnComponent: React.FC<ColumnComponentProps> = ({
  column,
  cards,
  onUpdateTitle,
  onDeleteColumn,
  onAddCard,
  onEditCard,
  onDeleteCard,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(column.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTitleSubmit = () => {
    if (titleText.trim() && titleText !== column.title) {
      onUpdateTitle(column.id, titleText.trim());
    } else {
      setTitleText(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTitleSubmit();
    if (e.key === 'Escape') {
      setTitleText(column.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-80 shrink-0 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col max-h-full shadow-lg backdrop-blur-md transition-all duration-200 ${
        isDragging ? 'opacity-30 ring-2 ring-indigo-500 shadow-2xl scale-[1.01]' : ''
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 p-1 rounded transition-colors"
            title="Mover coluna"
          >
            <GripHorizontal className="w-4 h-4" />
          </div>

          {isEditingTitle ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                autoFocus
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-sm font-bold font-display bg-slate-800 border border-indigo-500 rounded text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleTitleSubmit}
                className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setTitleText(column.title);
                  setIsEditingTitle(false);
                }}
                className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3
                onClick={() => setIsEditingTitle(true)}
                className="font-bold text-sm text-slate-100 font-display truncate cursor-pointer hover:text-indigo-400 transition-colors"
                title="Clique para renomear"
              >
                {column.title}
              </h3>
              <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold rounded-full shrink-0">
                {cards.length}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddCard(column.id)}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            title="Adicionar cartão"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Excluir coluna"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div className="p-3 overflow-y-auto flex-1 space-y-3 min-h-[120px]">
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div
            onClick={() => onAddCard(column.id)}
            className="border-2 border-dashed border-slate-800/80 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
          >
            <p className="text-xs font-medium text-slate-500 group-hover:text-indigo-400">
              + Adicionar cartão
            </p>
          </div>
        )}
      </div>

      {/* Footer Add Button */}
      <div className="p-3 border-t border-slate-800/60">
        <button
          onClick={() => onAddCard(column.id)}
          className="w-full py-2 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Cartão
        </button>
      </div>
    </div>
  );
};
