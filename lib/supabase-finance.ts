import { supabase } from './supabase';

export interface FinanceAccount {
    id: string;
    user_id: string;
    name: string;
    balance: number;
    type?: string;
    color?: string;
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

export async function getFinanceTransactions(userId: string): Promise<FinanceTransaction[]> {
    const { data, error } = await supabase
        .from('finance_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createFinanceTransaction(transaction: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<FinanceTransaction> {
    // Map camelCase to snake_case for Supabase
    const { accountId, ...rest } = transaction;

    const dbTransaction: any = {
        ...rest,
        account_id: accountId || (transaction as any).account_id
    };

    if (dbTransaction.userId) {
        dbTransaction.user_id = dbTransaction.userId;
        delete dbTransaction.userId;
    }

    const { data, error } = await supabase
        .from('finance_transactions')
        .insert([dbTransaction])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateFinanceTransaction(id: string, updates: Partial<FinanceTransaction>): Promise<FinanceTransaction> {
    // Map camelCase to snake_case for Supabase
    const dbUpdates: any = { ...updates };
    if ((updates as any).accountId) {
        dbUpdates.account_id = (updates as any).accountId;
        delete dbUpdates.accountId;
    }

    const { data, error } = await supabase
        .from('finance_transactions')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteFinanceTransaction(id: string): Promise<void> {
    const { error } = await supabase
        .from('finance_transactions')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function confirmTransaction(id: string): Promise<FinanceTransaction> {
    return updateFinanceTransaction(id, { confirmed: true });
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
            color: acc.color
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
                date: trans.date,
                confirmed: trans.confirmed !== false
            }));
            await supabase.from('finance_transactions').insert(transactionsToInsert);
        }
    }
}
