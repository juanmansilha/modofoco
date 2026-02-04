import { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "./supabase";
import { FOCO_POINTS } from "./gamification";

// --- System Prompt / Persona ---
// --- System Prompt / Persona ---
export const FALCON_SYSTEM_PROMPT = `
# 🦅 FALCON — SISTEMA DE ASSISTENTE INTELIGENTE DO MODOFOCO

## 🧠 PAPEL DO FALCON
Você é um **operador de produtividade**, responsável por:
* Registrar ações no sistema
* Lembrar o usuário do que importa
* Incentivar constância
* Interpretar comandos simples
* Proteger a lógica do ModoFoco

Você **executa**, **lembra**, **orienta** e **cobra**, sempre de forma objetiva.

## 🎯 PRINCÍPIOS DE COMPORTAMENTO
* Sempre claro e direto
* Nunca prolixo
* Nunca motivacional vazio
* Nunca conversa sem objetivo
* Sempre conduz para ação
* Sempre respeita o estado de uso do usuário
* O Falcon **não debate**, ele **direciona**.

## 🦅 TOM DE VOZ
* Objetivo
* Respeitoso
* Firme quando necessário
* Nunca emocional demais
* Nunca robótico
Exemplo: "Vamos manter o ritmo.", "Constância primeiro.", "Registro feito."

## 🔒 REGRA FINAL
**O Falcon não conversa para entreter. Ele existe para manter o foco ativo.**
`;

export const FALCON_ONBOARDING_MESSAGE = `🦅 Olá, eu sou o Falcon, seu assistente no ModoFoco.

Eu te ajudo a registrar tarefas, treinos, estudos, finanças e rotinas de forma rápida, direto pelo WhatsApp.

Você pode me mandar mensagens como:
• "Criar tarefa estudar matemática"
• "Registrar treino academia"
• "Adicionar gasto 120 mercado"
• "Registrar estudo 25 minutos"

Sempre que possível, use os **modelos de comando** para eu entender exatamente o que você quer fazer.

Quando estiver tudo certo, eu confirmo.
Se algo faltar, eu te pergunto.

Vamos manter o foco. 🔥`;


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

// --- Regex Patterns based on Templates ---
const PATTERNS = {
    // Tasks
    CREATE_TASK: /^Criar tarefa (.+)$/i,
    COMPLETE_TASK: /^Concluir tarefa (.+)$/i,

    // Fitness
    REGISTER_WORKOUT: /^Registrar treino (.+)$/i,
    REGISTER_RUN: /^Registrar corrida (\d+(?:[.,]\d+)?)km (\d+)min$/i, // ex: 5km 28min

    // Study
    REGISTER_STUDY_TIME: /^Registrar estudo (\d+) minutos$/i,
    REGISTER_STUDY_POMODORO: /^Registrar estudo pomodoro$/i,

    // Finance
    REGISTER_INCOME: /^Adicionar entrada (\d+(?:[.,]\d+)?) (.+)$/i,
    REGISTER_EXPENSE: /^Adicionar sa[íi]da (\d+(?:[.,]\d+)?) (.+)$/i,

    // Routines
    MARK_ROUTINE: /^Marcar rotina (.+)$/i,
    COMPLETE_ROUTINE: /^Concluir rotina (.+)$/i,
};

// --- Execution Logic ---

export class FalconBrain {

    private userId: string;
    private supabase: SupabaseClient;

    constructor(userId: string, client?: SupabaseClient) {
        this.userId = userId;
        this.supabase = client || defaultSupabase;
    }

    async processMessage(text: string): Promise<FalconResponse> {
        const command = this.parseCommand(text);

        if (command.type === 'UNKNOWN') {
            return this.handleUnknown(text);
        }

        try {
            return await this.executeCommand(command);
        } catch (error) {
            console.error("Falcon Execution Error:", error);
            return {
                text: "🦅 Falha ao registrar. Tente novamente."
            };
        }
    }

    private parseCommand(text: string): FalconCommand {
        // Normalize
        const cleanText = text.trim();

        // Tasks
        let match = cleanText.match(PATTERNS.CREATE_TASK);
        if (match) return { type: 'CREATE_TASK', data: { title: match[1] }, originalText: cleanText };

        match = cleanText.match(PATTERNS.COMPLETE_TASK);
        if (match) return { type: 'COMPLETE_TASK', data: { title: match[1] }, originalText: cleanText };

        // Fitness
        match = cleanText.match(PATTERNS.REGISTER_WORKOUT);
        if (match) return { type: 'REGISTER_WORKOUT', data: { activityType: match[1] }, originalText: cleanText };

        match = cleanText.match(PATTERNS.REGISTER_RUN);
        if (match) return { type: 'REGISTER_RUN', data: { distance: parseFloat(match[1].replace(',', '.')), time: parseInt(match[2]) }, originalText: cleanText };

        // Study
        match = cleanText.match(PATTERNS.REGISTER_STUDY_TIME);
        if (match) return { type: 'REGISTER_STUDY', data: { minutes: parseInt(match[1]) }, originalText: cleanText };

        if (PATTERNS.REGISTER_STUDY_POMODORO.test(cleanText)) {
            return { type: 'REGISTER_STUDY', data: { minutes: 25 }, originalText: cleanText };
        }

        // Finance
        match = cleanText.match(PATTERNS.REGISTER_INCOME);
        if (match) return { type: 'REGISTER_FINANCE_INCOME', data: { amount: parseFloat(match[1].replace(',', '.')), description: match[2] }, originalText: cleanText };

        match = cleanText.match(PATTERNS.REGISTER_EXPENSE);
        if (match) return { type: 'REGISTER_FINANCE_EXPENSE', data: { amount: parseFloat(match[1].replace(',', '.')), description: match[2] }, originalText: cleanText };

        // Routine
        match = cleanText.match(PATTERNS.MARK_ROUTINE);
        if (match) return { type: 'MARK_ROUTINE', data: { name: match[1] }, originalText: cleanText };

        match = cleanText.match(PATTERNS.COMPLETE_ROUTINE);
        if (match) return { type: 'MARK_ROUTINE', data: { name: match[1] }, originalText: cleanText };

        return { type: 'UNKNOWN', data: null, originalText: cleanText };
    }

    private async executeCommand(command: FalconCommand): Promise<FalconResponse> {
        switch (command.type) {
            case 'CREATE_TASK':
                await this.supabase.from('tasks').insert({
                    user_id: this.userId,
                    title: command.data.title,
                    completed: false,
                    list: 'Geral',
                    priority: 'media'
                });

                return {
                    text: `🦅 Tarefa criada: "${command.data.title}".\nFoco. 🔥`,
                    actionPerformed: true,
                    fpGained: FOCO_POINTS.ADD_TASK || 2
                };

            case 'REGISTER_FINANCE_EXPENSE':
                // Find first account to debit?? Or create one?
                // For simplicity, we just add the transaction without account logic if we can't find one, 
                // OR we query for an account.
                // Using Admin client, we can query accounts.
                const { data: accounts } = await this.supabase
                    .from('finance_accounts')
                    .select('id')
                    .eq('user_id', this.userId)
                    .limit(1);

                let accountId = accounts?.[0]?.id;

                if (!accountId) {
                    // Create default account if none exists
                    const { data: newAccount } = await this.supabase.from('finance_accounts').insert({
                        user_id: this.userId,
                        name: 'Carteira Principal',
                        balance: 0,
                        type: 'checking',
                        color: 'bg-zinc-500'
                    }).select().single();
                    accountId = newAccount.id;
                }

                await this.supabase.from('finance_transactions').insert({
                    user_id: this.userId,
                    account_id: accountId,
                    type: 'expense',
                    amount: command.data.amount,
                    description: command.data.description,
                    category: 'Outros', // Default
                    date: new Date().toISOString(),
                    confirmed: true
                });

                // Update balance
                // We must manually update balance since we're not using the helper
                const { data: acc } = await this.supabase.from('finance_accounts').select('balance').eq('id', accountId).single();
                if (acc) {
                    await this.supabase.from('finance_accounts').update({
                        balance: (acc.balance || 0) - command.data.amount
                    }).eq('id', accountId);
                }

                return {
                    text: `✅ Saída registrada\nValor: R$${command.data.amount}\nDescrição: ${command.data.description}\n\nFP ganhos: +${FOCO_POINTS.ADD_FINANCE_ENTRY || 2}`,
                    actionPerformed: true,
                    fpGained: FOCO_POINTS.ADD_FINANCE_ENTRY || 2
                };

            case 'REGISTER_FINANCE_INCOME':
                const { data: accountsIn } = await this.supabase
                    .from('finance_accounts')
                    .select('id')
                    .eq('user_id', this.userId)
                    .limit(1);

                let accountIdIn = accountsIn?.[0]?.id;

                if (!accountIdIn) {
                    const { data: newAccount } = await this.supabase.from('finance_accounts').insert({
                        user_id: this.userId,
                        name: 'Carteira Principal',
                        balance: 0,
                        type: 'checking',
                        color: 'bg-zinc-500'
                    }).select().single();
                    accountIdIn = newAccount.id;
                }

                await this.supabase.from('finance_transactions').insert({
                    user_id: this.userId,
                    account_id: accountIdIn,
                    type: 'income',
                    amount: command.data.amount,
                    description: command.data.description,
                    category: 'Salário', // Default
                    date: new Date().toISOString(),
                    confirmed: true
                });

                // Update balance
                const { data: accIn } = await this.supabase.from('finance_accounts').select('balance').eq('id', accountIdIn).single();
                if (accIn) {
                    await this.supabase.from('finance_accounts').update({
                        balance: (accIn.balance || 0) + command.data.amount
                    }).eq('id', accountIdIn);
                }

                await this.awardPoints(FOCO_POINTS.ADD_FINANCE_ENTRY || 2, "Entrada via Falcon");

                return {
                    text: `✅ Entrada registrada\nValor: R$${command.data.amount}\nDescrição: ${command.data.description}\n\nFP ganhos: +${FOCO_POINTS.ADD_FINANCE_ENTRY || 2}`,
                    actionPerformed: true,
                    fpGained: FOCO_POINTS.ADD_FINANCE_ENTRY || 2
                };

            case 'REGISTER_STUDY':
                // Log study session
                await this.supabase.from('study_sessions').insert({
                    user_id: this.userId,
                    subject_id: null, // General study
                    duration_minutes: command.data.minutes,
                    notes: "Registrado via Falcon",
                    created_at: new Date().toISOString()
                });

                await this.awardPoints(FOCO_POINTS.STUDY_SESSION || 15, "Estudo via Falcon");

                return {
                    text: `✅ Estudo registrado: ${command.data.minutes} minutos.\nConstância é tudo.`,
                    actionPerformed: true,
                    fpGained: FOCO_POINTS.STUDY_SESSION || 15
                };

            case 'REGISTER_WORKOUT':
                // Using 'gym_routine_completions' or similar if distinct from routine
                // Assuming generic activity log or just gamification for now if no specific table
                // MVP: Just acknowledge and give points, or log to a simple 'activities' table if it existed.
                // We will strictly return success for gamification.
                await this.awardPoints(FOCO_POINTS.WORKOUT_RUN || 12, `Treino: ${command.data.activityType}`);
                return {
                    text: `✅ Treino de ${command.data.activityType} registrado.\nCorpo forte, mente forte.`,
                    actionPerformed: true,
                    fpGained: FOCO_POINTS.WORKOUT_RUN || 12
                };

            case 'REGISTER_RUN':
                await this.awardPoints(FOCO_POINTS.WORKOUT_RUN || 12, "Corrida via Falcon");
                return {
                    text: `✅ Corrida registrada: ${command.data.distance}km em ${command.data.time}min.\nExcelente ritmo.`,
                    actionPerformed: true,
                    fpGained: FOCO_POINTS.WORKOUT_RUN || 12
                };

            default:
                return { text: "Comando reconhecido mas não implementado ainda." };
        }
    }

    private async awardPoints(amount: number, reason: string) {
        // Fetch current points
        const { data: profile } = await this.supabase
            .from('profiles')
            .select('fp, lifetime_fp')
            .eq('id', this.userId)
            .single();

        if (profile) {
            const newFP = (profile.fp || 0) + amount;
            const newLifetime = (profile.lifetime_fp || 0) + amount;

            // Update Profile
            await this.supabase.from('profiles').update({
                fp: newFP,
                lifetime_fp: newLifetime
            }).eq('id', this.userId);

            // Log History
            await this.supabase.from('gamification_history').insert({
                user_id: this.userId,
                amount: amount,
                reason: reason,
                type: 'earn'
            });
        }
    }

    async notifyUpcomingBills(): Promise<FalconResponse> {
        // 1. Fetch upcoming pending bills (expenses)
        // We look for expenses that are NOT confirmed (pending) 
        // OR expenses that are confirmed but date is in the future (though usually 'pending' is the key)
        // For simplicity, let's look for: type='expense' AND confirmed=false

        const { data: bills, error } = await this.supabase
            .from('finance_transactions')
            .select('*')
            .eq('user_id', this.userId)
            .eq('type', 'expense')
            .eq('confirmed', false)
            .order('date', { ascending: true })
            .limit(5);

        if (error) {
            console.error("Error fetching bills:", error);
            return { text: "Erro ao buscar contas." };
        }

        if (!bills || bills.length === 0) {
            await this.sendWhatsAppMessage("🦅 Nenhuma conta pendente encontrada para os próximos dias. Tudo em dia! ✅");
            return { text: "Sem contas." };
        }

        // Format message
        let message = "🦅 *Contas Próximas (Pendentes)*\n\n";
        bills.forEach(bill => {
            const date = new Date(bill.date).toLocaleDateString('pt-BR');
            const amount = bill.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            message += `• ${bill.description}: ${amount} (Vence: ${date})\n`;
        });

        message += "\nDigite *'Pagar [nome]'* para dar baixa.";

        await this.sendWhatsAppMessage(message);
        return { text: "Notificação enviada." };
    }

    private handleUnknown(text: string): FalconResponse {
        // Simple heuristic: if it looks like a greeting, send Onboarding
        const lower = text.toLowerCase();
        if (lower === 'oi' || lower === 'ola' || lower === 'olá' || lower === 'start' || lower === 'inicio') {
            return { text: FALCON_ONBOARDING_MESSAGE };
        }

        return {
            text: `🦅 Não entendi o comando.\n\nUse os modelos:\n• "Criar tarefa [nome]"\n• "Registrar treino [tipo]"\n• "Adicionar saída [valor] [descrição]"\n• "Registrar estudo [tempo]"`
        };
    }
}
