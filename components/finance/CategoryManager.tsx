"use client";

import { useState } from "react";
import { X, Plus, Edit2, Trash2, Tag } from "lucide-react";

interface Category {
    id: string;
    name: string;
    type: "income" | "expense";
    color: string;
    icon?: string;
}

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onSave: (categories: Category[]) => void;
}

const COLORS = [
    { value: "bg-red-500", label: "vermelho" },
    { value: "bg-orange-500", label: "laranja" },
    { value: "bg-amber-500", label: "âmbar" },
    { value: "bg-yellow-500", label: "amarelo" },
    { value: "bg-lime-500", label: "lima" },
    { value: "bg-green-500", label: "verde" },
    { value: "bg-emerald-500", label: "esmeralda" },
    { value: "bg-teal-500", label: "azul-petróleo" },
    { value: "bg-cyan-500", label: "ciano" },
    { value: "bg-sky-500", label: "céu" },
    { value: "bg-blue-500", label: "azul" },
    { value: "bg-indigo-500", label: "índigo" },
    { value: "bg-violet-500", label: "violeta" },
    { value: "bg-purple-500", label: "roxo" },
    { value: "bg-fuchsia-500", label: "fúcsia" },
    { value: "bg-pink-500", label: "rosa" },
    { value: "bg-rose-500", label: "rosê" }
];

export function CategoryManager({ isOpen, onClose, categories, onSave }: CategoryManagerProps) {
    const [localCategories, setLocalCategories] = useState<Category[]>(categories);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({ name: "", type: "expense" as "income" | "expense", color: "bg-blue-500" });

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!newCategory.name.trim()) return;

        const category: Category = {
            id: Date.now().toString(),
            name: newCategory.name,
            type: newCategory.type,
            color: newCategory.color
        };

        setLocalCategories([...localCategories, category]);
        setNewCategory({ name: "", type: "expense", color: "bg-blue-500" });
    };

    const handleDelete = (id: string) => {
        if (confirm("Excluir esta categoria?")) {
            setLocalCategories(localCategories.filter(c => c.id !== id));
        }
    };

    const handleEdit = (id: string, updates: Partial<Category>) => {
        setLocalCategories(localCategories.map(c =>
            c.id === id ? { ...c, ...updates } : c
        ));
        setEditingId(null);
    };

    const handleSave = () => {
        onSave(localCategories);
        onClose();
    };

    const incomeCategories = localCategories.filter(c => c.type === "income");
    const expenseCategories = localCategories.filter(c => c.type === "expense");

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Tag className="text-blue-500" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Gerenciar Categorias</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <X size={20} className="text-zinc-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Add New Category */}
                    <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-zinc-400 mb-3">Nova Categoria</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nome da categoria"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            />
                            <select
                                value={newCategory.type}
                                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as "income" | "expense" })}
                                className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            >
                                <option value="expense">Despesa</option>
                                <option value="income">Receita</option>
                            </select>
                            <select
                                value={newCategory.color}
                                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                                className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            >
                                {COLORS.map(color => (
                                    <option key={color.value} value={color.value}>{color.label}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAdd}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Adicionar
                            </button>
                        </div>
                    </div>

                    {/* Income Categories */}
                    <div>
                        <h3 className="text-sm font-medium text-emerald-400 mb-3">Receitas</h3>
                        <div className="space-y-2">
                            {incomeCategories.map(category => (
                                <div key={category.id} className="flex items-center gap-2 p-3 bg-zinc-800/30 border border-white/5 rounded-lg group">
                                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                                    {editingId === category.id ? (
                                        <input
                                            type="text"
                                            defaultValue={category.name}
                                            onBlur={(e) => handleEdit(category.id, { name: e.target.value })}
                                            onKeyDown={(e) => e.key === "Enter" && handleEdit(category.id, { name: e.currentTarget.value })}
                                            className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="flex-1 text-white text-sm">{category.name}</span>
                                    )}
                                    <button
                                        onClick={() => setEditingId(category.id)}
                                        className="p-1.5 hover:bg-white/5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Edit2 size={14} className="text-zinc-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-1.5 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} className="text-red-400" />
                                    </button>
                                </div>
                            ))}
                            {incomeCategories.length === 0 && (
                                <p className="text-zinc-500 text-sm text-center py-4">Nenhuma categoria de receita</p>
                            )}
                        </div>
                    </div>

                    {/* Expense Categories */}
                    <div>
                        <h3 className="text-sm font-medium text-red-400 mb-3">Despesas</h3>
                        <div className="space-y-2">
                            {expenseCategories.map(category => (
                                <div key={category.id} className="flex items-center gap-2 p-3 bg-zinc-800/30 border border-white/5 rounded-lg group">
                                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                                    {editingId === category.id ? (
                                        <input
                                            type="text"
                                            defaultValue={category.name}
                                            onBlur={(e) => handleEdit(category.id, { name: e.target.value })}
                                            onKeyDown={(e) => e.key === "Enter" && handleEdit(category.id, { name: e.currentTarget.value })}
                                            className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="flex-1 text-white text-sm">{category.name}</span>
                                    )}
                                    <button
                                        onClick={() => setEditingId(category.id)}
                                        className="p-1.5 hover:bg-white/5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Edit2 size={14} className="text-zinc-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-1.5 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} className="text-red-400" />
                                    </button>
                                </div>
                            ))}
                            {expenseCategories.length === 0 && (
                                <p className="text-zinc-500 text-sm text-center py-4">Nenhuma categoria de despesa</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}
