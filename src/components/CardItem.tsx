import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, AlignLeft, GripVertical, Edit3, Trash2 } from 'lucide-react';
import type { Card } from '../types/kanban';

interface CardItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'Card', card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Status da data de vencimento
  const getDueDateStatus = (dateStr?: string) => {
    if (!dateStr) return null;
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) return { text: 'Atrasado', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    if (diffDays === 0) return { text: 'Hoje', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    if (diffDays === 1) return { text: 'Amanhã', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
    return { text: dateStr.split('-').reverse().join('/'), color: 'text-slate-400 bg-slate-800 border-slate-700' };
  };

  const dueDateStatus = getDueDateStatus(card.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-40 ring-2 ring-indigo-500 scale-[1.02] z-50 shadow-2xl' : ''
      }`}
    >
      {/* Drag Handle & Quick Actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 p-1 -ml-1 rounded transition-colors"
          title="Arrastar cartão"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            onClick={() => onEdit(card)}
            className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded transition-colors"
            title="Editar cartão"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(card.id)}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
            title="Excluir cartão"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Título do Card */}
      <h4
        onClick={() => onEdit(card)}
        className="font-medium text-sm text-slate-100 leading-snug cursor-pointer hover:text-indigo-300 transition-colors mb-2"
      >
        {card.title}
      </h4>

      {/* Badges de Etiquetas */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {card.labels.map((label) => (
            <span
              key={label.id}
              style={{
                backgroundColor: `${label.color}20`,
                borderColor: `${label.color}50`,
                color: label.color,
              }}
              className="px-2 py-0.5 text-[11px] font-semibold rounded-md border leading-none"
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info: Descrição & Vencimento */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-400">
          {card.description && (
            <span className="flex items-center gap-1" title="Possui descrição">
              <AlignLeft className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {dueDateStatus && (
          <span
            className={`px-2 py-0.5 rounded-md border text-[11px] font-medium flex items-center gap-1 ${dueDateStatus.color}`}
          >
            <Calendar className="w-3 h-3" />
            {dueDateStatus.text}
          </span>
        )}
      </div>
    </div>
  );
};
