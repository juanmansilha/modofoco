import { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "./supabase";
import { FOCO_POINTS } from "./gamification";

// --- System Prompt / Persona ---
export const FALCON_SYSTEM_PROMPT = `
# 🦅 FALCON — TREINAMENTO OFICIAL
## MODO NOTIFICAÇÃO & LEMBRETES

## 🎯 PAPEL DO FALCON
O Falcon é um **sistema de comunicação ativa** do ModoFoco.
Ele **não recebe**, **não interpreta** e **não executa comandos enviados pelo usuário**.
Ele **apenas envia mensagens** de:
* Lembretes
* Alertas
* Avisos de progresso
* Incentivos de constância
* Confirmações de eventos automáticos

## 🧠 PRINCÍPIOS DE ATUAÇÃO
* Nunca iniciar conversa sem motivo
* Nunca pedir resposta
* Nunca usar perguntas abertas
* Nunca enviar mensagens desnecessárias
* Sempre comunicar ação ou risco real
* Sempre reforçar constância e clareza

O Falcon **fala pouco e quando fala, importa**.

## 🎙️ TOM DE VOZ OFICIAL
* Neutro
* Objetivo
* Sem emojis excessivos
* Sem perguntas
* Sem motivação vazia
* Sem julgamento
`;

export const FALCON_ONBOARDING_MESSAGE = `🦅 Olá. Eu sou o Falcon.

Sou o sistema de lembretes e notificações do ModoFoco.

Vou te avisar sobre tarefas, rotinas, estudo, treinos, finanças e progresso.

Não recebo mensagens e não respondo comandos.

Todas as ações devem ser feitas diretamente no sistema.

Quando eu falar, é porque algo importa.

Vamos manter o foco.`;


// --- Command Types ---
type FalconCommandType =
    | 'CREATE_TASK'
    | 'COMPLETE_TASK'
    | 'REGISTER_WORKOUT'
    | 'REGISTER_RUN'
    | 'REGISTER_STUDY'
    | 'REGISTER_FINANCE_INCOME'
    | 'REGISTER_FINANCE_EXPENSE'
    | 'MARK_ROUTINE'
    | 'UNKNOWN';

interface FalconCommand {
    type: FalconCommandType;
    data: any;
    originalText: string;
}

interface FalconResponse {
    text: string;
    actionPerformed?: boolean;
    data?: any;
    fpGained?: number;
}

// --- Execution Logic ---

export class FalconBrain {

    private userId: string;
    private supabase: SupabaseClient;

    constructor(userId: string, client?: SupabaseClient) {
        this.userId = userId;
        this.supabase = client || defaultSupabase;
    }

    async processMessage(text: string): Promise<FalconResponse> {
        // FALCON NEW PROTOCOL: READ ONLY.
        // Does not interpret commands.

        const lower = text.trim().toLowerCase();

        // Only respond to Greetings/Onboarding triggers
        if (['oi', 'ola', 'olá', 'start', 'inicio', 'ajuda'].includes(lower)) {
            return { text: FALCON_ONBOARDING_MESSAGE };
        }

        // For any other text, we reinforce the "Read Only" nature
        return {
            text: `🦅 O Falcon é um sistema de notificação.\n\nNão recebo comandos por aqui. Utilize o App ModoFoco para registrar suas ações.\n\nQuando algo importante acontecer, eu te avisarei.`
        };
    }

    // --- Notifications Methods ---

    async notifyUpcomingBills(): Promise<FalconResponse> {
        const { data: bills, error } = await this.supabase
            .from('finance_transactions')
            .select('*')
            .eq('user_id', this.userId)
            .eq('type', 'expense')
            .eq('confirmed', false)
            .order('date', { ascending: true })
            .limit(3);

        if (error || !bills || bills.length === 0) {
            return { text: "Sem pendências." };
        }

        // New Formal Tone
        let message = "🦅 Contas pendentes:\n\n";
        bills.forEach(bill => {
            const date = new Date(bill.date).toLocaleDateString('pt-BR');
            const amount = bill.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            message += `“${bill.description}” — ${amount} (Vence: ${date})\n`;
        });

        await this.sendWhatsAppMessage(message);
        return { text: "Notificação financeiro enviada." };
    }

    async checkPendingTasks(): Promise<FalconResponse> {
        // Check for tasks due today or overdue not completed
        const today = new Date().toISOString().split('T')[0];

        const { data: tasks } = await this.supabase
            .from('tasks')
            .select('*')
            .eq('user_id', this.userId)
            .eq('completed', false)
            .lte('due_date', today) // Due today or before
            .order('due_date', { ascending: true })
            .limit(1);

        if (tasks && tasks.length > 0) {
            const task = tasks[0];
            const isOverdue = task.due_date < today;

            let message = "";
            if (isOverdue) {
                message = `🦅 Tarefa atrasada:\n“${task.title}”`;
            } else {
                message = `🦅 Tarefa pendente hoje:\n“${task.title}”`;
            }

            await this.sendWhatsAppMessage(message);
            return { text: "Notificação tarefa enviada." };
        }

        return { text: "Sem tarefas pendentes." };
    }

    async checkInactivity(): Promise<FalconResponse> {
        // Check for last activity in: tasks, finance, gamification
        // We can check 'updated_at' on tasks or 'created_at' on history

        // 1. Get last gamification entry (most reliable generic activity log)
        const { data: lastActivity } = await this.supabase
            .from('gamification_history')
            .select('created_at')
            .eq('user_id', this.userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!lastActivity) return { text: "Sem histórico." };

        const lastDate = new Date(lastActivity.created_at);
        const now = new Date();
        const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

        // 24h = 1 day, 48h = 2 days, 72h = 3 days

        // Rules from training:
        // 24h: "Nenhuma atividade registrada hoje..."
        // 48h: "Dois dias sem registros..."
        // 72h: "Três dias sem atividade..."

        // We need to ensure we don't spam. This check runs once a day.
        // So simply checking if > 24h is enough for "Inactivity Alert".

        if (diffHours >= 72) {
            await this.sendWhatsAppMessage("🦅 Três dias sem atividade.\nDisciplina se constrói no retorno.");
            return { text: "Inatividade 72h detectada." };
        } else if (diffHours >= 48) {
            await this.sendWhatsAppMessage("🦅 Dois dias sem registros.\nRetomar pelo básico já é progresso.");
            return { text: "Inatividade 48h detectada." };
        } else if (diffHours >= 24) {
            await this.sendWhatsAppMessage("🦅 Nenhuma atividade recente.\nPequenos registros mantêm o ritmo.");
            return { text: "Inatividade 24h detectada." };
        }

        return { text: "Atividade recente detectada." };
    }

    // --- Helper ---

    private async sendWhatsAppMessage(message: string): Promise<void> {
        // 1. Get user phone
        const { data: profile } = await this.supabase
            .from('profiles')
            .select('whatsapp')
            .eq('id', this.userId)
            .single();

        if (!profile || !profile.whatsapp) {
            console.error("Falcon: No phone found for user", this.userId);
            return;
        }

        const phone = profile.whatsapp;
        const instanceName = process.env.EVO_INSTANCE_NAME;
        const apiKey = process.env.EVO_API_KEY;
        const apiUrl = process.env.EVO_API_URL;

        if (!instanceName || !apiKey || !apiUrl) {
            console.error("Falcon: Evolution API env vars missing");
            return;
        }

        try {
            await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey
                },
                body: JSON.stringify({
                    number: phone,
                    options: { delay: 1200, presence: "composing", linkPreview: false },
                    textMessage: { text: message }
                })
            });
        } catch (error) {
            console.error("Falcon: Network error sending WhatsApp:", error);
        }
    }

    // --- Legacy / Unused Command Parsing (Preserved but commented) ---
    /*
    private parseCommand(text: string): FalconCommand {
        ...
    }
    private async executeCommand(command: FalconCommand): Promise<FalconResponse> {
        ...
    }
    */
    private handleUnknown(text: string): FalconResponse {
        return { text: "System Default Response" };
    }
}
