"use client";

import { useState } from "react";
import { X, Plus, Edit2, Trash2, Tag, Home, ShoppingCart, Car, Coffee, Utensils, Zap, Heart, Gift, Briefcase, GraduationCap, Plane, Wallet, TrendingUp, DollarSign } from "lucide-react";

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

const CATEGORY_ICONS = [
    { id: "DollarSign", icon: DollarSign },
    { id: "Wallet", icon: Wallet },
    { id: "TrendingUp", icon: TrendingUp },
    { id: "ShoppingCart", icon: ShoppingCart },
    { id: "Utensils", icon: Utensils },
    { id: "Coffee", icon: Coffee },
    { id: "Home", icon: Home },
    { id: "Car", icon: Car },
    { id: "Zap", icon: Zap },
    { id: "Heart", icon: Heart },
    { id: "Gift", icon: Gift },
    { id: "Briefcase", icon: Briefcase },
    { id: "GraduationCap", icon: GraduationCap },
    { id: "Plane", icon: Plane },
    { id: "Tag", icon: Tag },
];

const COLORS = [
    { value: "#ef4444", label: "Vermelho" },
    { value: "#f97316", label: "Laranja" },
    { value: "#f59e0b", label: "Âmbar" },
    { value: "#eab308", label: "Amarelo" },
    { value: "#84cc16", label: "Lima" },
    { value: "#22c55e", label: "Verde" },
    { value: "#10b981", label: "Esmeralda" },
    { value: "#14b8a6", label: "Teal" },
    { value: "#06b6d4", label: "Ciano" },
    { value: "#0ea5e9", label: "Sky" },
    { value: "#3b82f6", label: "Azul" },
    { value: "#6366f1", label: "Índigo" },
    { value: "#a855f7", label: "Violeta" },
    { value: "#d946ef", label: "Fúcsia" },
    { value: "#ec4899", label: "Rosa" },
];

export function CategoryManager({ isOpen, onClose, categories, onSave }: CategoryManagerProps) {
    const [localCategories, setLocalCategories] = useState<Category[]>(categories);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({ name: "", type: "expense" as "income" | "expense", color: "#3b82f6", icon: "Tag" });

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!newCategory.name.trim()) return;

        const category: Category = {
            id: Date.now().toString(),
            name: newCategory.name,
            type: newCategory.type,
            color: newCategory.color,
            icon: newCategory.icon
        };

        setLocalCategories([...localCategories, category]);
        setNewCategory({ name: "", type: "expense", color: "#3b82f6", icon: "Tag" });
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
                    <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-6 space-y-4">
                        <h3 className="text-sm font-medium text-zinc-400">Nova Categoria</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 uppercase font-bold">Nome</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Salário, Mercado..."
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 uppercase font-bold">Tipo</label>
                                <select
                                    value={newCategory.type}
                                    onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as "income" | "expense" })}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="expense">Despesa</option>
                                    <option value="income">Receita</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500 uppercase font-bold">Escolha um Ícone</label>
                            <div className="grid grid-cols-5 md:grid-cols-8 gap-2">
                                {CATEGORY_ICONS.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setNewCategory({ ...newCategory, icon: item.id })}
                                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${newCategory.icon === item.id ? "bg-blue-500 text-white shadow-lg" : "bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800"}`}
                                    >
                                        <item.icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500 uppercase font-bold">Cor</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${newCategory.color === color.value ? "border-white scale-110" : "border-transparent"}`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.label}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={newCategory.color}
                                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                                    className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 cursor-pointer p-0 overflow-hidden"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAdd}
                            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-bold"
                        >
                            <Plus size={16} />
                            Adicionar Categoria
                        </button>
                    </div>

                    {/* Income Categories */}
                    <div>
                        <h3 className="text-sm font-medium text-emerald-400 mb-3">Receitas</h3>
                        <div className="space-y-2">
                            {incomeCategories.map(category => (
                                <div key={category.id} className="flex items-center gap-3 p-3 bg-zinc-800/30 border border-white/5 rounded-lg group">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                                        {(() => {
                                            const Icon = CATEGORY_ICONS.find(i => i.id === category.icon)?.icon || Tag;
                                            return <Icon size={16} />;
                                        })()}
                                    </div>
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
                                <div key={category.id} className="flex items-center gap-3 p-3 bg-zinc-800/30 border border-white/5 rounded-lg group">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                                        {(() => {
                                            const Icon = CATEGORY_ICONS.find(i => i.id === category.icon)?.icon || Tag;
                                            return <Icon size={16} />;
                                        })()}
                                    </div>
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
