"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Send, MoreVertical, Hash, Lock, Trash2, Shield, Ban, PenSquare, Eye, UserPlus, Image as ImageIcon, Paperclip, Heart, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { InviteUserModal } from "./InviteUserModal";
import { AchievementCard, Achievement } from "./AchievementCard";

// Mock Data Types
interface Message {
    id: number;
    user: string;
    avatar: string;
    content?: string;
    image?: string;
    achievement?: Achievement;
    time: string;
    role: "admin" | "member" | "me";
    type: "text" | "image" | "achievement";
    likes: number;
    hasLiked: boolean;
    comments: number;
}

// Initial Messages
const INITIAL_MESSAGES: Message[] = [
    {
        id: 1,
        user: "Alex Founder",
        avatar: "A",
        content: "Bem-vindos ao Geral. Lembrem-se das regras.",
        time: "10:00",
        role: "admin",
        type: "text",
        likes: 5,
        hasLiked: false,
        comments: 2
    },
    {
        id: 2,
        user: "Sarah Design",
        avatar: "S",
        content: "Olhem minha evolução no supino!",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
        time: "10:12",
        role: "member",
        type: "image",
        likes: 12,
        hasLiked: false,
        comments: 4
    },
    {
        id: 3,
        user: "Mike Dev",
        avatar: "M",
        achievement: {
            title: "Primeiro 100kg no Supino",
            description: "Mike bateu um novo recorde pessoal hoje!",
            type: "workout",
            stats: [{ label: "Peso", value: "100kg" }, { label: "Reps", value: "5" }]
        },
        time: "10:15",
        role: "member",
        type: "achievement",
        likes: 24,
        hasLiked: true,
        comments: 8
    },
];

interface ChatInterfaceProps {
    roomId: string;
}

export function ChatInterface({ roomId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isAdmin, setIsAdmin] = useState(true);
    const [showRoomSettings, setShowRoomSettings] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    // File Upload Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message: Message = {
            id: messages.length + 1,
            user: "Você",
            avatar: "V",
            content: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            role: "me",
            type: "text",
            likes: 0,
            hasLiked: false,
            comments: 0
        };

        setMessages([...messages, message]);
        setNewMessage("");
    };

    const handleDeleteMessage = (id: number) => {
        setMessages(messages.filter(msg => msg.id !== id));
    };

    const handleLike = (id: number) => {
        setMessages(messages.map(msg => {
            if (msg.id === id) {
                return {
                    ...msg,
                    likes: msg.hasLiked ? msg.likes - 1 : msg.likes + 1,
                    hasLiked: !msg.hasLiked
                };
            }
            return msg;
        }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Mock upload - just adding a mock image message
            const message: Message = {
                id: messages.length + 1,
                user: "Você",
                avatar: "V",
                image: URL.createObjectURL(file),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                role: "me",
                type: "image",
                likes: 0,
                hasLiked: false,
                comments: 0
            };
            setMessages([...messages, message]);
        }
    };

    const handleInvite = (userIds: string[]) => {
        console.log("Inviting to room:", userIds);
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#050505]/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/community" className="md:hidden text-muted hover:text-white">←</Link>
                    <div className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center">
                        <Hash size={20} className="text-zinc-400" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white flex items-center gap-2">
                            {roomId.charAt(0).toUpperCase() + roomId.slice(1)}
                            {roomId === 'vip' && <Lock size={14} className="text-red-500" />}
                        </h2>
                        <p className="text-xs text-muted">124 online</p>
                    </div>
                </div>

                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowRoomSettings(!showRoomSettings)}
                    >
                        <MoreVertical size={20} className="text-zinc-500" />
                    </Button>

                    {/* Room Settings Dropdown */}
                    {showRoomSettings && (
                        <div className="absolute right-0 top-12 w-56 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl z-20 py-1 flex flex-col">
                            <button
                                onClick={() => setIsInviteOpen(true)}
                                className="px-4 py-2 hover:bg-white/5 text-left text-sm text-zinc-300 flex items-center gap-2"
                            >
                                <UserPlus size={14} /> Convidar Pessoas
                            </button>

                            {isAdmin && (
                                <>
                                    <div className="h-px bg-white/5 my-1" />
                                    <button className="px-4 py-2 hover:bg-white/5 text-left text-sm text-zinc-300 flex items-center gap-2">
                                        <PenSquare size={14} /> Editar Sala
                                    </button>
                                    <button className="px-4 py-2 hover:bg-white/5 text-left text-sm text-zinc-300 flex items-center gap-2">
                                        <Shield size={14} /> Gerenciar Admins
                                    </button>
                                    <button className="px-4 py-2 hover:bg-red-500/10 text-left text-sm text-red-400 flex items-center gap-2">
                                        <Trash2 size={14} /> Excluir Sala
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar" onClick={() => setShowRoomSettings(false)}>
                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-4 max-w-3xl group relative", msg.role === 'me' ? "ml-auto flex-row-reverse" : "")}>

                        {/* Avatar */}
                        {!msg.achievement && (
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                                msg.role === 'admin' ? "bg-red-500 text-white" :
                                    msg.role === 'me' ? "bg-white text-black" : "bg-zinc-800 text-zinc-400"
                            )}>
                                {msg.avatar}
                            </div>
                        )}

                        {/* Message Layout */}
                        <div className={cn("flex flex-col gap-1 w-full", msg.role === 'me' ? "items-end" : "items-start")}>

                            {/* Metadata */}
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-sm font-bold text-zinc-300">{msg.user}</span>
                                <span className="text-[10px] text-zinc-600">{msg.time}</span>
                                {msg.role === 'admin' && <Shield size={12} className="text-red-500" />}
                            </div>

                            {/* Content Bubble */}
                            <div className={cn(
                                "rounded-2xl overflow-hidden shadow-sm relative group/bubble max-w-full",
                                msg.role === 'me'
                                    ? "bg-white text-black rounded-tr-sm"
                                    : "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-sm"
                            )}>
                                {msg.type === 'text' && (
                                    <div className="p-3 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                                )}

                                {msg.type === 'image' && msg.image && (
                                    <div className="relative">
                                        <img src={msg.image} alt="Upload" className="max-w-[300px] w-full h-auto object-cover" />
                                        {msg.content && <div className="p-3 text-sm">{msg.content}</div>}
                                    </div>
                                )}

                                {msg.type === 'achievement' && msg.achievement && (
                                    <AchievementCard achievement={msg.achievement} className="min-w-[300px]" />
                                )}
                            </div>

                            {/* Social Actions */}
                            <div className={cn("flex items-center gap-3 mt-1 px-1", msg.role === 'me' ? "flex-row-reverse" : "")}>
                                <button
                                    onClick={() => handleLike(msg.id)}
                                    className={cn("text-xs flex items-center gap-1 transition-colors", msg.hasLiked ? "text-red-500" : "text-zinc-500 hover:text-red-400")}
                                >
                                    <Heart size={14} fill={msg.hasLiked ? "currentColor" : "none"} /> {msg.likes > 0 && msg.likes}
                                </button>
                                <button className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                                    <MessageSquare size={14} /> {msg.comments > 0 && msg.comments}
                                </button>
                            </div>
                        </div>

                        {/* Admin/User Delete Actions */}
                        {isAdmin && msg.role !== 'me' && (
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1 bg-black/60 rounded backdrop-blur-sm -translate-y-1/2 translate-x-1/2 z-10">
                                <button title="Banir Usuário" className="p-1 text-zinc-400 hover:text-red-500"><Ban size={12} /></button>
                                <button onClick={() => handleDeleteMessage(msg.id)} title="Apagar Mensagem" className="p-1 text-zinc-400 hover:text-red-500"><Trash2 size={12} /></button>
                            </div>
                        )}
                        {msg.role === 'me' && (
                            <div className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1 bg-black/60 rounded backdrop-blur-sm -translate-y-1/2 -translate-x-1/2 z-10">
                                <button onClick={() => handleDeleteMessage(msg.id)} title="Apagar Mensagem" className="p-1 text-zinc-400 hover:text-red-500"><Trash2 size={12} /></button>
                            </div>
                        )}

                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-[#050505]">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />

                    <div className="flex gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-zinc-500 hover:text-white"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon size={20} />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="text-zinc-500 hover:text-white hidden sm:flex">
                            <Paperclip size={20} />
                        </Button>
                    </div>

                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Mensagem em #${roomId}...`}
                        className="flex-1 bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700 h-11"
                    />
                    <Button type="submit" size="icon" className="h-11 w-11 bg-white text-black hover:bg-zinc-200 shrink-0">
                        <Send size={18} />
                    </Button>
                </form>
            </div>

            <InviteUserModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onInvite={handleInvite}
                currentMembers={[]}
            />
        </div>
    );
}
