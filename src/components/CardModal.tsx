import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Plus, Trash2, AlignLeft, Layers } from 'lucide-react';
import type { Card, Column, Label } from '../types/kanban';

interface CardModalProps {
  isOpen: boolean;
  card: Card | null;
  columns: Column[];
  currentColumnId?: string;
  onClose: () => void;
  onSave: (updatedCard: Card, targetColumnId: string) => void;
  onDelete?: (cardId: string) => void;
}

const PRESET_COLORS = [
  '#ef4444', // Vermelho
  '#f97316', // Laranja
  '#eab308', // Amarelo
  '#10b981', // Verde
  '#06b6d4', // Ciano
  '#3b82f6', // Azul
  '#8b5cf6', // Roxo
  '#ec4899', // Rosa
  '#64748b', // Cinza
];

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  card,
  columns,
  currentColumnId,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);

  // Novo estado de etiqueta
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[5]);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setDueDate(card.dueDate || '');
      setLabels(card.labels || []);
      setColumnId(currentColumnId || columns[0]?.id || '');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setLabels([]);
      setColumnId(currentColumnId || columns[0]?.id || '');
    }
  }, [card, currentColumnId, columns, isOpen]);

  if (!isOpen) return null;

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;
    const label: Label = {
      id: `label-${Date.now()}`,
      name: newLabelName.trim(),
      color: newLabelColor,
    };
    setLabels([...labels, label]);
    setNewLabelName('');
  };

  const handleRemoveLabel = (id: string) => {
    setLabels(labels.filter((l) => l.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date().toISOString();
    const updatedCard: Card = {
      id: card ? card.id : `card-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      labels,
      createdAt: card ? card.createdAt : now,
      updatedAt: now,
      dueDate,
    };

    onSave(updatedCard, columnId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h3 className="text-lg font-bold font-display text-slate-100 flex items-center gap-2">
            {card ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite um título objetivo..."
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all"
            />
          </div>

          {/* Coluna & Data de Vencimento em Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Coluna
              </label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id} className="bg-slate-900 text-slate-100">
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Data de Vencimento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Descrição Detalhada
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione notas, instruções ou checklist..."
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all resize-none"
            />
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Etiquetas Coloridas
            </label>

            {/* Tags existentes */}
            <div className="flex flex-wrap gap-2 mb-3">
              {labels.map((label) => (
                <span
                  key={label.id}
                  style={{ backgroundColor: `${label.color}25`, borderColor: `${label.color}60`, color: label.color }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1.5"
                >
                  {label.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(label.id)}
                    className="hover:opacity-75 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {labels.length === 0 && (
                <span className="text-xs text-slate-500 italic">Nenhuma etiqueta atribuída</span>
              )}
            </div>

            {/* Criador de etiqueta */}
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Nome da nova etiqueta..."
                  className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddLabel}
                  disabled={!newLabelName.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              {/* Paleta de cores */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Cor:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewLabelColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        newLabelColor === color ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-slate-900' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {card && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(card.id);
                  onClose();
                }}
                className="px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Excluir Card
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
              >
                {card ? 'Salvar Alterações' : 'Criar Card'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
