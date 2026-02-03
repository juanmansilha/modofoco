import { supabase } from './supabase';

export interface FinanceAccount {
    id: string;
    user_id: string;
    name: string;
    balance: number;
    type?: string;
    color?: string;
    logo_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface FinanceTransaction {
    id: string;
    user_id: string;
    account_id: string;
    accountId?: string; // Compatibility with frontend camelCase
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category?: string;
    date: string;
    confirmed: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface FinanceCategory {
    id: string;
    user_id: string;
    name: string;
    type: 'income' | 'expense';
    color?: string;
    icon?: string;
    created_at?: string;
    updated_at?: string;
}

// ============ ACCOUNTS ============

export async function getFinanceAccounts(userId: string): Promise<FinanceAccount[]> {
    const { data, error } = await supabase
        .from('finance_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createFinanceAccount(account: Omit<FinanceAccount, 'id' | 'created_at' | 'updated_at'>): Promise<FinanceAccount> {
    const { data, error } = await supabase
        .from('finance_accounts')
        .insert([account])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateFinanceAccount(id: string, updates: Partial<FinanceAccount>): Promise<FinanceAccount> {
    const { data, error } = await supabase
        .from('finance_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteFinanceAccount(id: string): Promise<void> {
    const { error } = await supabase
        .from('finance_accounts')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============ TRANSACTIONS ============

// ============ HELPER: BALANCE UPDATE ============

async function updateAccountBalance(accountId: string, amountChange: number) {
    // 1. Get current balance
    const { data: account, error: getError } = await supabase
        .from('finance_accounts')
        .select('balance')
        .eq('id', accountId)
        .single();

    if (getError) throw getError;
    if (!account) return;

    // 2. Update
    const newBalance = (account.balance || 0) + amountChange;

    const { error: updateError } = await supabase
        .from('finance_accounts')
        .update({ balance: newBalance })
        .eq('id', accountId);

    if (updateError) throw updateError;
}

// ============ TRANSACTIONS ============

export async function getFinanceTransactions(userId: string): Promise<FinanceTransaction[]> {
    const { data, error } = await supabase
        .from('finance_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) throw error;

    // Map snake_case to camelCase for frontend compatibility
    return (data || []).map((t: any) => ({
        ...t,
        accountId: t.account_id
    }));
}

export async function createFinanceTransaction(transaction: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<FinanceTransaction> {
    // Map camelCase to snake_case for Supabase
    const { accountId, confirmed, ...rest } = transaction;

    const dbTransaction: any = {
        ...rest,
        account_id: accountId || (transaction as any).account_id
    };

    if (dbTransaction.userId) {
        dbTransaction.user_id = dbTransaction.userId;
        delete dbTransaction.userId;
    }

    // Ensure confirmed IS sent
    dbTransaction.confirmed = confirmed;

    const { data, error } = await supabase
        .from('finance_transactions')
        .insert([dbTransaction])
        .select()
        .single();

    if (error) throw error;

    // UPDATE BALANCE IF CONFIRMED
    if (confirmed) {
        const amountChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
        await updateAccountBalance(dbTransaction.account_id, amountChange);
    }

    return data;
}

export async function updateFinanceTransaction(id: string, updates: Partial<FinanceTransaction>): Promise<FinanceTransaction> {
    // Map camelCase to snake_case for Supabase
    const dbUpdates: any = { ...updates };
    if ((updates as any).accountId) {
        dbUpdates.account_id = (updates as any).accountId;
        delete dbUpdates.accountId;
    }

    // For now, allow simple updates.
    // Handling balance updates on EDIT is complex (need to reverse old, apply new).
    // For MVP, we might skip or warn. Ideally: fetch old tx, reverse it, apply new.
    // Let's implement full logic: Fetch original first.

    const { data: original, error: fetchError } = await supabase
        .from('finance_transactions')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    // Reverse original if it was confirmed
    if (original.confirmed) {
        const reverseChange = original.type === 'income' ? -original.amount : original.amount;
        await updateAccountBalance(original.account_id, reverseChange);
    }

    // Update
    const { data, error } = await supabase
        .from('finance_transactions')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    // Apply new if confirmed
    // user might have changed amount, type, or confirmed status
    if (data.confirmed) {
        const newChange = data.type === 'income' ? data.amount : -data.amount;
        await updateAccountBalance(data.account_id, newChange);
    }

    return data;
}

export async function deleteFinanceTransaction(id: string): Promise<void> {
    // Get transaction first to know if we need to revert balance
    const { data: original, error: fetchError } = await supabase
        .from('finance_transactions')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
        .from('finance_transactions')
        .delete()
        .eq('id', id);

    if (error) throw error;

    // Revert balance if it was confirmed
    if (original.confirmed) {
        const reverseChange = original.type === 'income' ? -original.amount : original.amount;
        await updateAccountBalance(original.account_id, reverseChange);
    }
}

export async function confirmTransaction(id: string): Promise<FinanceTransaction> {
    // Fetch first to get details
    const { data: original, error: fetchError } = await supabase
        .from('finance_transactions')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;
    if (original.confirmed) return original; // Already confirmed

    // Update to confirmed
    const { data, error } = await supabase
        .from('finance_transactions')
        .update({ confirmed: true })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    // Update Balance
    const amountChange = original.type === 'income' ? original.amount : -original.amount;
    await updateAccountBalance(original.account_id, amountChange);

    return data;
}

// ============ CATEGORIES ============

export async function getFinanceCategories(userId: string): Promise<FinanceCategory[]> {
    const { data, error } = await supabase
        .from('finance_categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function createFinanceCategory(category: Omit<FinanceCategory, 'id' | 'created_at' | 'updated_at'>): Promise<FinanceCategory> {
    const { data, error } = await supabase
        .from('finance_categories')
        .insert([category])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateFinanceCategory(id: string, updates: Partial<FinanceCategory>): Promise<FinanceCategory> {
    const { data, error } = await supabase
        .from('finance_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteFinanceCategory(id: string): Promise<void> {
    const { error } = await supabase
        .from('finance_categories')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function syncFinanceCategories(userId: string, categories: any[]): Promise<void> {
    // Delete existing
    await supabase.from('finance_categories').delete().eq('user_id', userId);

    // Insert new
    if (categories.length > 0) {
        const toInsert = categories.map(cat => ({
            user_id: userId,
            name: cat.name,
            type: cat.type,
            color: cat.color,
            icon: cat.icon
        }));
        const { error } = await supabase.from('finance_categories').insert(toInsert);
        if (error) throw error;
    }
}

// ============ BULK OPERATIONS ============

export async function syncLocalToSupabase(
    userId: string,
    accounts: any[],
    transactions: any[],
    categories: any[]
): Promise<void> {
    // Delete all existing data
    await supabase.from('finance_transactions').delete().eq('user_id', userId);
    await supabase.from('finance_accounts').delete().eq('user_id', userId);
    await supabase.from('finance_categories').delete().eq('user_id', userId);

    // Insert categories first
    if (categories.length > 0) {
        const categoriesToInsert = categories.map(cat => ({
            user_id: userId,
            name: cat.name,
            type: cat.type,
            color: cat.color,
            icon: cat.icon
        }));
        await supabase.from('finance_categories').insert(categoriesToInsert);
    }

    // Insert accounts
    if (accounts.length > 0) {
        const accountsToInsert = accounts.map(acc => ({
            user_id: userId,
            name: acc.name,
            balance: acc.balance,
            type: acc.type,
            color: acc.color,
            logo_url: acc.logo_url
        }));
        const { data: insertedAccounts } = await supabase
            .from('finance_accounts')
            .insert(accountsToInsert)
            .select();

        // Map old IDs to new IDs
        const accountIdMap: Record<string, string> = {};
        accounts.forEach((oldAcc, index) => {
            if (insertedAccounts && insertedAccounts[index]) {
                accountIdMap[oldAcc.id] = insertedAccounts[index].id;
            }
        });

        // Insert transactions with mapped account IDs
        if (transactions.length > 0) {
            const transactionsToInsert = transactions.map(trans => ({
                user_id: userId,
                account_id: accountIdMap[trans.accountId] || trans.accountId,
                description: trans.description,
                amount: trans.amount,
                type: trans.type,
                category: trans.category,
                date: trans.date
                // confirmed: trans.confirmed !== false // REMOVED confirmed
            }));
            await supabase.from('finance_transactions').insert(transactionsToInsert);
        }
    }
}

// ============ TRANSFERS & INVOICE PAYMENTS ============

export async function createTransferTransaction(
    userId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: string,
    description: string,
    confirmed: boolean = true,
    category: string = "Transferência"
): Promise<void> {

    // 1. Transaction Out (Source)
    const expenseTx: any = {
        user_id: userId,
        account_id: fromAccountId,
        description: description,
        amount: amount,
        type: 'expense',
        category: category,
        date: date,
        confirmed: confirmed
    };

    // 2. Transaction In (Destination)
    const incomeTx: any = {
        user_id: userId,
        account_id: toAccountId,
        description: category === "Pagamento de Fatura" ? `Pagamento Recebido` : `Transferência Recebida`,
        amount: amount,
        type: 'income',
        category: category,
        date: date,
        confirmed: confirmed
    };

    // Execute both inserts
    const { error: error1 } = await supabase.from('finance_transactions').insert([expenseTx]);
    if (error1) throw error1;

    const { error: error2 } = await supabase.from('finance_transactions').insert([incomeTx]);
    if (error2) throw error2;

    // UPDATE BALANCES IF CONFIRMED
    if (confirmed) {
        // Source loses money (Expense)
        await updateAccountBalance(fromAccountId, -amount);
        // Target gains money (Income)
        await updateAccountBalance(toAccountId, amount);
    }
}

export async function transferFunds(
    userId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: string,
    description: string = "Transferência entre contas"
): Promise<void> {
    return createTransferTransaction(userId, fromAccountId, toAccountId, amount, date, description, true, "Transferência");
}
