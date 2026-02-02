"use client";

import { useState } from "react";
import { Plus, Search, Filter, Folder, Users, List, Box } from "lucide-react";
import { CreateResourceModal } from "@/components/resources/CreateResourceModal";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceViewModal } from "@/components/resources/ResourceViewModal";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { PageBanner } from "@/components/ui/PageBanner";

const INITIAL_TYPES = [
    { id: "area", label: "Área", color: "bg-blue-500", isCustom: false },
    { id: "family", label: "Família", color: "bg-pink-500", isCustom: false },
    { id: "list", label: "Lista", color: "bg-emerald-500", isCustom: false },
    { id: "other", label: "Outro", color: "bg-zinc-500", isCustom: false },
];

export default function ResourcesPage() {
    // Global Data
    const { resources, addResource, updateResource, deleteResource } = useGlobalData();

    // UI State
    const [resourceTypes, setResourceTypes] = useState(INITIAL_TYPES);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<any>(null);
    const [viewingResource, setViewingResource] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const handleCreate = (newResource: any) => {
        addResource({
            id: Math.random().toString(36).substr(2, 9),
            ...newResource
        });
    };

    const handleEdit = (updatedResource: any) => {
        if (!editingResource) return;
        updateResource({ ...updatedResource, id: editingResource.id });
        setEditingResource(null);
        setIsCreateModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja excluir este recurso?")) {
            deleteResource(id);
        }
    };

    const handleToggleTask = (resourceId: string, taskId: string) => {
        // Find resource
        const resource = resources.find(r => r.id === resourceId);
        if (!resource) return;

        const updatedTasks = resource.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        const updatedResource = { ...resource, tasks: updatedTasks };

        updateResource(updatedResource);

        // Update viewing resource if open
        if (viewingResource && viewingResource.id === resourceId) {
            setViewingResource(updatedResource);
        }
    };

    // Type Management
    const handleAddType = (label: string) => {
        const newType = {
            id: label.toLowerCase().replace(/\s+/g, '-'),
            label,
            color: "bg-purple-500", // Default color for new custom types
            isCustom: true
        };
        if (!resourceTypes.find(t => t.id === newType.id)) {
            setResourceTypes([...resourceTypes, newType]);
        }
    };

    const handleDeleteType = (id: string) => {
        if (confirm("Excluir este tipo?")) {
            setResourceTypes(resourceTypes.filter(t => t.id !== id));
        }
    };

    const getTypeLabel = (typeId: string) => {
        return resourceTypes.find(t => t.id === typeId)?.label || "Outro";
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-background">
            <PageBanner
                title="Meus Recursos"
                subtitle="Organize suas áreas, listas e informações importantes."
                gradientColor="pink"
                icon={Folder}
            />

            <main className="p-8 pb-32 max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="sr-only">Ações</h2>
                    <div className="flex-1" /> {/* Spacer */}
                    <button
                        onClick={() => {
                            setEditingResource(null);
                            setIsCreateModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                    >
                        <Plus size={20} />
                        Novo Recurso
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-white/5 w-full md:w-fit">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar recursos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-white pl-10 pr-4 py-2 placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <Filter size={18} />
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResources.map((resource) => (
                        <ResourceCard
                            key={resource.id}
                            {...resource}
                            // @ts-ignore
                            onEdit={() => {
                                setEditingResource(resource);
                                setIsCreateModalOpen(true);
                            }}
                            onDelete={handleDelete}
                            onView={() => {
                                setViewingResource(resource);
                                setIsViewModalOpen(true);
                            }}
                            getTypeLabel={getTypeLabel}
                        />
                    ))}
                </div>

                {filteredResources.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 text-zinc-500 mb-4">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">Nenhum recurso encontrado</h3>
                        <p className="text-zinc-500">Tente buscar por outro termo ou crie um novo recurso.</p>
                    </div>
                )}

                <CreateResourceModal
                    isOpen={isCreateModalOpen}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setEditingResource(null);
                    }}
                    onSave={editingResource ? handleEdit : handleCreate}
                    initialData={editingResource}
                    isEditing={!!editingResource}
                    availableTypes={resourceTypes}
                    onAddType={handleAddType}
                    onDeleteType={handleDeleteType}
                />

                <ResourceViewModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    resource={viewingResource}
                    onToggleTask={handleToggleTask}
                    getTypeLabel={getTypeLabel}
                />
            </main>
        </div>
    );
}
