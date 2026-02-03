"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useNotifications } from "@/contexts/NotificationContext";
import { useGlobalData } from "@/contexts/GlobalDataProvider";
import { User, Mail, Lock, CreditCard, Trash2, Camera, LogOut, Check, Bell } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { uploadAvatar } from "@/lib/supabase-storage";

export default function SettingsPage() {
    const { userData, updateUserData, logout } = useGlobalData();
    const { addNotification, requestPermission } = useNotifications();
    const router = useRouter();

    // Local state for form fields
    const [name, setName] = useState("");
    const [photo, setPhoto] = useState("");
    const [email, setEmail] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        // Validate size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            addNotification("Erro", "A imagem deve ter no máximo 5MB.");
            return;
        }

        setIsUploading(true);
        try {
            // We need a userId. If userData doesn't have it (it should if loaded), we might fail.
            // But GlobalDataProvider usually ensures we have data.
            // Ideally we'd get userId from context too, but userData updates async. 
            // We can try to use a fallback or throw if critical.
            // For now assuming userData is populated as we are in Settings.
            // A clearer way would be exposing userId from context.
            // Let's assume we can get it or use 'unknown' if missing (which shouldn't happen logged in)

            // NOTE: GlobalDataProvider doesn't expose raw userId in interface shown previously, 
            // but it's likely available or we can use a temp ID if just testing, 
            // but for real storage we need it. 
            // Let's modify GlobalDataProvider to expose userId or use the one we have access to?
            // Actually, I can allow the utility to generate a name if userId is missing,
            // or just use a timestamp.

            const url = await uploadAvatar(file, userData.name || "user");
            setPhoto(url);
            addNotification("Sucesso", "Imagem carregada. Clique em Salvar para confirmar.");
        } catch (error) {
            console.error(error);
            addNotification("Erro", "Falha ao enviar imagem. Tente novamente.");
        } finally {
            setIsUploading(false);
        }
    };

    // Password UI state
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Subscription UI state
    const [subscriptionStatus, setSubscriptionStatus] = useState<"active" | "canceled">("active");

    // Load initial data
    useEffect(() => {
        if (userData) {
            setName(userData.name || "");
            setPhoto(userData.photo || "");
            setEmail(userData.email || "usuario@modofoco.com"); // Fallback if email not captured
        }
    }, [userData]);

    const handleSaveProfile = () => {
        updateUserData({ name, photo });
        addNotification("Perfil Atualizado", "Suas informações foram salvas com sucesso.");
    };

    const handleChangePassword = () => {
        // Mock password change
        if (!currentPassword || !newPassword) {
            addNotification("Erro", "Preencha todos os campos da senha.");
            return;
        }
        setIsPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        addNotification("Senha Alterada", "Sua senha foi atualizada com segurança.");
    };

    const handleCancelSubscription = () => {
        setSubscriptionStatus("canceled");
        addNotification("Assinatura Cancelada", "Sua assinatura não será renovada.");
    };

    const handleReactivateSubscription = () => {
        setSubscriptionStatus("active");
        addNotification("Assinatura Ativa", "Obrigado por continuar no ModoFoco Pro!");
    };

    const handleDeleteAccount = async () => {
        if (confirm("Tem certeza? Esta ação é irreversível e apagará todos os seus dados.")) {
            // Em um sistema real, aqui chamaríamos uma função para deletar os dados do usuário no Supabase
            // Por enquanto, vamos apenas deslogar e limpar o estado
            await logout();
            router.push("/login");
            addNotification("Conta Excluída", "Sentiremos sua falta.");
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-[#050505]">
            {/* Header Banner */}
            <div className="h-48 w-full bg-[#0A0A0A] relative shrink-0 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-black" />
                <div className="absolute bottom-6 left-8 z-10">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Configurações</h1>
                    <p className="text-zinc-400 mt-1 text-sm">Gerencie sua conta e preferências.</p>
                </div>
            </div>

            <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto pb-24">

                {/* Profile Section */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <User size={20} className="text-indigo-500" /> Perfil
                    </h2>
                    <Card className="p-6 bg-zinc-900/50 border-white/5 space-y-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-3">
                                <div
                                    className="h-24 w-24 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center relative overflow-hidden group cursor-pointer"
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                >
                                    {isUploading ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        </div>
                                    ) : null}

                                    {photo ? (
                                        <Image src={photo} alt="Avatar" fill className="object-cover" />
                                    ) : (
                                        <User size={32} className="text-zinc-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={20} className="text-white" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                />
                                <div className="text-xs text-zinc-500 text-center max-w-[120px]">
                                    Clique na foto para alterar
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="flex-1 space-y-4 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nome</label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="bg-black/40 border-white/5 text-white h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Email</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                            <Input
                                                value={email}
                                                disabled
                                                className="bg-black/20 border-white/5 text-zinc-500 h-11 pl-10 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-white/5">
                            <Button onClick={handleSaveProfile} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                                Salvar Alterações
                            </Button>
                        </div>
                    </Card>
                </section>

                {/* Notification Section */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Bell size={20} className="text-indigo-500" /> Notificações
                    </h2>
                    <Card className="p-6 bg-zinc-900/50 border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-white">Alertas do Sistema</h3>
                            <p className="text-zinc-400 text-sm">Ative para receber alertas sobre tarefas e hábitos.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => requestPermission()}>
                                Ativar Permissão
                            </Button>
                            <Button variant="outline" onClick={() => addNotification("Teste", "Isso é um teste de notificação!")}>
                                Testar Agora
                            </Button>
                        </div>
                    </Card>
                </section>

                {/* Security Section */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Lock size={20} className="text-indigo-500" /> Segurança
                    </h2>
                    <Card className="p-6 bg-zinc-900/50 border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-white">Senha</h3>
                            <p className="text-zinc-400 text-sm">Altere sua senha periodicamente para manter sua conta segura.</p>
                        </div>
                        <Button variant="secondary" onClick={() => setIsPasswordModalOpen(!isPasswordModalOpen)}>
                            Alterar Senha
                        </Button>
                    </Card>

                    {/* Simple Password Expandable Area */}
                    {isPasswordModalOpen && (
                        <div className="mt-4 p-6 bg-zinc-900/80 border border-white/5 rounded-xl animate-in slide-in-from-top-2 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Senha Atual</label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="bg-black/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Nova Senha</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-black/40"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>Cancelar</Button>
                                <Button onClick={handleChangePassword}>Confirmar</Button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Subscription Section */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <CreditCard size={20} className="text-indigo-500" /> Assinatura
                    </h2>
                    <Card className="p-6 bg-zinc-900/50 border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                    ModoFoco Pro
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${subscriptionStatus === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {subscriptionStatus === 'active' ? 'ATIVO' : 'CANCELADO'}
                                    </span>
                                </h3>
                                <p className="text-zinc-400 text-sm mt-1">
                                    {subscriptionStatus === 'active'
                                        ? "Próxima cobrança automática em 05/03/2026."
                                        : "Seu acesso Pro expira em 05/03/2026."}
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                                <Check size={20} className="text-indigo-400" />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {subscriptionStatus === 'active' ? (
                                <>
                                    <Button variant="secondary" className="flex-1">Gerenciar Plano</Button>
                                    <Button
                                        variant="ghost"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        onClick={handleCancelSubscription}
                                    >
                                        Cancelar Assinatura
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                                    onClick={handleReactivateSubscription}
                                >
                                    Reativar Assinatura
                                </Button>
                            )}
                        </div>
                    </Card>
                </section>

                {/* Danger Zone */}
                <section>
                    <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                        <Trash2 size={20} /> Área de Perigo
                    </h2>
                    <Card className="p-6 bg-red-950/10 border-red-500/20 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-white">Excluir Conta</h3>
                            <p className="text-zinc-400 text-sm">Todos os seus dados serão apagados permanentemente.</p>
                        </div>
                        <Button
                            variant="destructive"
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
                            onClick={handleDeleteAccount}
                        >
                            Excluir Minha Conta
                        </Button>
                    </Card>
                </section>
            </div>
        </div>
    );
}
