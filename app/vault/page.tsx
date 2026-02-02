"use client";

import { useState } from "react";
import { Plus, Search, Archive } from "lucide-react";
import { VaultCard } from "@/components/vault/VaultCard";
import { VaultModal } from "@/components/vault/VaultModal";
import { PageBanner } from "@/components/ui/PageBanner";
import { useGamification } from "@/contexts/GamificationContext";
import { FOCO_POINTS } from "@/lib/gamification";

// Mock Data
const INITIAL_ITEMS = [
    {
        id: "1",
        type: "access",
        title: "Netflix",
        username: "juan@example.com",
        password: "password123",
        url: "https://netflix.com",
        createdAt: new Date()
    },
    {
        id: "2",
        type: "idea",
        title: "App de Corrida",
        content: "Criar um app que gamifica a corrida com monstros virtuais.",
        createdAt: new Date()
    },
    {
        id: "3",
        type: "note",
        title: "Reunião Dr. Silva",
        content: "Levar exames de sangue e ressonância magnética.",
        createdAt: new Date()
    }
];

export default function VaultPage() {
    const { awardFP } = useGamification();
    // @ts-ignore
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [filter, setFilter] = useState("all"); // 'all', 'idea', 'access', 'note'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSave = (item: any) => {
        if (editingItem) {
            setItems(items.map(i => i.id === editingItem.id ? { ...item, id: i.id } : i));
        } else {
            setItems([{ ...item, id: Math.random().toString(36).substr(2, 9) }, ...items]);
            awardFP(FOCO_POINTS.ADD_VAULT_ITEM, "Novo Item no Baú");
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja processar a exclusão deste item?")) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const filteredItems = items.filter(i => {
        const matchesFilter = filter === "all" || i.type === filter;
        const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.content && i.content.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background">
            <PageBanner
                title="Meu Baú"
                subtitle="Guarde suas ideias, segredos e anotações."
                gradientColor="yellow"
                icon={Archive}
            />

            <main className="p-8 pb-32 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-end">
                    <button
                        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                    >
                        <Plus size={20} />
                        Novo Item
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 p-1 bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden w-full md:w-auto">
                        {[
                            { id: "all", label: "Tudo" },
                            { id: "idea", label: "Ideias" },
                            { id: "access", label: "Acessos" },
                            { id: "note", label: "Notas" },
                        ].map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.id
                                    ? "bg-zinc-800 text-white shadow-sm"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar no baú..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/5 focus:border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-0 transition-all placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="break-inside-avoid">
                            {/* @ts-ignore */}
                            <VaultCard
                                {...item}
                                onEdit={(id) => {
                                    setEditingItem(items.find(i => i.id === id));
                                    setIsModalOpen(true);
                                }}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <Archive size={48} className="mb-4 text-zinc-500" />
                        <p className="text-lg font-medium text-white">Nada encontrado</p>
                        <p className="text-zinc-500">O baú está vazio ou nenhum item corresponde à busca.</p>
                    </div>
                )}

                <VaultModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingItem}
                    // @ts-ignore
                    initialType={filter === 'all' ? 'idea' : filter}
                />
            </main>
        </div>
    );
}
