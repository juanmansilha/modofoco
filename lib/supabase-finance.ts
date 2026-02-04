import { supabase } from './supabase';

export interface FinanceAccount {
    id: string;
    user_id: string;
    name: string;
    balance: number;
    type?: string;
    color?: string;
    logo_url?: string;
    is_primary?: boolean;
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
    payment_method?: 'debit' | 'credit';
    credit_card_id?: string;
    creditCardId?: string; // Compatibility with frontend camelCase
    invoice_id?: string;
    installment_number?: number;
    total_installments?: number;
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

// ============ CREDIT CARDS ============

export interface CreditCard {
    id: string;
    user_id: string;
    bank_account_id?: string;
    name: string;
    credit_limit: number;
    available_limit: number;
    closing_day: number;
    due_day: number;
    color?: string;
    logo_url?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreditCardInvoice {
    id: string;
    credit_card_id: string;
    user_id: string;
    reference_month: string;
    start_date: string;
    end_date: string;
    due_date: string;
    total_amount: number;
    paid_amount: number;
    status: 'open' | 'closed' | 'paid' | 'partial' | 'overdue';
    paid_at?: string;
    paid_from_account_id?: string;
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

// ============ CREDIT CARDS ============

export async function getCreditCards(userId: string): Promise<CreditCard[]> {
    const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createCreditCard(card: Omit<CreditCard, 'id' | 'created_at' | 'updated_at'>): Promise<CreditCard> {
    // Set available_limit to credit_limit on creation
    const cardData = {
        ...card,
        available_limit: card.credit_limit
    };

    const { data, error } = await supabase
        .from('credit_cards')
        .insert([cardData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateCreditCard(id: string, updates: Partial<CreditCard>): Promise<CreditCard> {
    const { data, error } = await supabase
        .from('credit_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteCreditCard(id: string): Promise<void> {
    // Soft delete - just mark as inactive
    const { error } = await supabase
        .from('credit_cards')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}

// ============ CREDIT CARD LIMIT HELPERS ============

async function updateCreditCardLimit(cardId: string, amountChange: number): Promise<void> {
    const { data: card, error: getError } = await supabase
        .from('credit_cards')
        .select('available_limit')
        .eq('id', cardId)
        .single();

    if (getError) throw getError;
    if (!card) return;

    const newLimit = Math.max(0, (card.available_limit || 0) + amountChange);

    const { error: updateError } = await supabase
        .from('credit_cards')
        .update({ available_limit: newLimit })
        .eq('id', cardId);

    if (updateError) throw updateError;
}

// ============ INVOICES ============

export async function getInvoices(userId: string, cardId?: string): Promise<CreditCardInvoice[]> {
    let query = supabase
        .from('credit_card_invoices')
        .select('*')
        .eq('user_id', userId)
        .order('reference_month', { ascending: false });

    if (cardId) {
        query = query.eq('credit_card_id', cardId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getCurrentInvoice(cardId: string, userId: string): Promise<CreditCardInvoice | null> {
    // Get the card to know closing/due days
    const { data: card, error: cardError } = await supabase
        .from('credit_cards')
        .select('closing_day, due_day')
        .eq('id', cardId)
        .single();

    if (cardError) throw cardError;
    if (!card) return null;

    const now = new Date();
    const currentDay = now.getDate();

    // Determine current invoice period based on closing day
    let refMonth: Date;
    if (currentDay <= card.closing_day) {
        // Still in current month's invoice
        refMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
        // Next month's invoice
        refMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const refMonthStr = refMonth.toISOString().split('T')[0];

    // Try to find existing invoice
    const { data: existingInvoice, error: invoiceError } = await supabase
        .from('credit_card_invoices')
        .select('*')
        .eq('credit_card_id', cardId)
        .eq('reference_month', refMonthStr)
        .single();

    if (invoiceError && invoiceError.code !== 'PGRST116') {
        throw invoiceError;
    }

    if (existingInvoice) {
        return existingInvoice;
    }

    // Create new invoice if it doesn't exist
    const startDate = new Date(refMonth.getFullYear(), refMonth.getMonth() - 1, card.closing_day + 1);
    const endDate = new Date(refMonth.getFullYear(), refMonth.getMonth(), card.closing_day);
    const dueDate = new Date(refMonth.getFullYear(), refMonth.getMonth(), card.due_day);

    const { data: newInvoice, error: createError } = await supabase
        .from('credit_card_invoices')
        .insert([{
            credit_card_id: cardId,
            user_id: userId,
            reference_month: refMonthStr,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            total_amount: 0,
            paid_amount: 0,
            status: 'open'
        }])
        .select()
        .single();

    if (createError) throw createError;
    return newInvoice;
}

export async function getOrCreateInvoiceForDate(
    cardId: string,
    userId: string,
    transactionDate: Date
): Promise<CreditCardInvoice> {
    // Get card settings
    const { data: card, error: cardError } = await supabase
        .from('credit_cards')
        .select('closing_day, due_day')
        .eq('id', cardId)
        .single();

    if (cardError) throw cardError;
    if (!card) throw new Error('Card not found');

    const txDay = transactionDate.getDate();

    // Determine which invoice this transaction belongs to
    let refMonth: Date;
    if (txDay <= card.closing_day) {
        // Current month's invoice
        refMonth = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1);
    } else {
        // Next month's invoice
        refMonth = new Date(transactionDate.getFullYear(), transactionDate.getMonth() + 1, 1);
    }

    const refMonthStr = refMonth.toISOString().split('T')[0];

    // Try to find existing invoice
    const { data: existingInvoice, error: invoiceError } = await supabase
        .from('credit_card_invoices')
        .select('*')
        .eq('credit_card_id', cardId)
        .eq('reference_month', refMonthStr)
        .single();

    if (invoiceError && invoiceError.code !== 'PGRST116') {
        throw invoiceError;
    }

    if (existingInvoice) {
        return existingInvoice;
    }

    // Create new invoice
    const startDate = new Date(refMonth.getFullYear(), refMonth.getMonth() - 1, card.closing_day + 1);
    const endDate = new Date(refMonth.getFullYear(), refMonth.getMonth(), card.closing_day);
    const dueDate = new Date(refMonth.getFullYear(), refMonth.getMonth(), card.due_day);

    const { data: newInvoice, error: createError } = await supabase
        .from('credit_card_invoices')
        .insert([{
            credit_card_id: cardId,
            user_id: userId,
            reference_month: refMonthStr,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            total_amount: 0,
            paid_amount: 0,
            status: 'open'
        }])
        .select()
        .single();

    if (createError) throw createError;
    return newInvoice;
}

async function updateInvoiceTotal(invoiceId: string, amountChange: number): Promise<void> {
    const { data: invoice, error: getError } = await supabase
        .from('credit_card_invoices')
        .select('total_amount')
        .eq('id', invoiceId)
        .single();

    if (getError) throw getError;
    if (!invoice) return;

    const newTotal = Math.max(0, (invoice.total_amount || 0) + amountChange);

    const { error: updateError } = await supabase
        .from('credit_card_invoices')
        .update({ total_amount: newTotal })
        .eq('id', invoiceId);

    if (updateError) throw updateError;
}

export async function payInvoice(
    invoiceId: string,
    fromAccountId: string,
    amount: number,
    userId: string
): Promise<CreditCardInvoice> {
    // 1. Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
        .from('credit_card_invoices')
        .select('*, credit_cards(*)')
        .eq('id', invoiceId)
        .single();

    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error('Invoice not found');

    const remainingAmount = invoice.total_amount - invoice.paid_amount;
    const paymentAmount = Math.min(amount, remainingAmount);

    // 2. Debit from account
    await updateAccountBalance(fromAccountId, -paymentAmount);

    // 3. Release credit card limit
    await updateCreditCardLimit(invoice.credit_card_id, paymentAmount);

    // 4. Update invoice
    const newPaidAmount = invoice.paid_amount + paymentAmount;
    const newStatus = newPaidAmount >= invoice.total_amount ? 'paid' : 'partial';

    const { data: updatedInvoice, error: updateError } = await supabase
        .from('credit_card_invoices')
        .update({
            paid_amount: newPaidAmount,
            status: newStatus,
            paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
            paid_from_account_id: fromAccountId
        })
        .eq('id', invoiceId)
        .select()
        .single();

    if (updateError) throw updateError;

    // 5. Create a transaction record for the payment
    await supabase.from('finance_transactions').insert([{
        user_id: userId,
        account_id: fromAccountId,
        description: `Pagamento de Fatura - ${(invoice as any).credit_cards?.name || 'Cartão'}`,
        amount: paymentAmount,
        type: 'expense',
        category: 'Pagamento de Fatura',
        date: new Date().toISOString(),
        confirmed: true,
        payment_method: 'debit'
    }]);

    return updatedInvoice;
}

// ============ CREDIT CARD TRANSACTIONS ============

export async function createCreditCardTransaction(
    transaction: {
        user_id: string;
        credit_card_id: string;
        description: string;
        amount: number;
        category?: string;
        date: string;
        installments?: number;
    }
): Promise<FinanceTransaction[]> {
    const { user_id, credit_card_id, description, amount, category, date, installments = 1 } = transaction;

    const createdTransactions: FinanceTransaction[] = [];
    const txDate = new Date(date);

    for (let i = 0; i < installments; i++) {
        // Calculate date for this installment
        const installmentDate = new Date(txDate);
        installmentDate.setMonth(installmentDate.getMonth() + i);

        // Get or create invoice for this date
        const invoice = await getOrCreateInvoiceForDate(credit_card_id, user_id, installmentDate);

        const installmentAmount = amount / installments;
        const installmentDesc = installments > 1
            ? `${description} (${i + 1}/${installments})`
            : description;

        // Create transaction
        const { data: tx, error } = await supabase
            .from('finance_transactions')
            .insert([{
                user_id,
                account_id: credit_card_id, // Using card ID as "account" for credit transactions
                description: installmentDesc,
                amount: installmentAmount,
                type: 'expense',
                category: category || 'Outros',
                date: installmentDate.toISOString(),
                confirmed: true, // Credit transactions are always "confirmed" (they happened)
                payment_method: 'credit',
                credit_card_id,
                invoice_id: invoice.id,
                installment_number: i + 1,
                total_installments: installments
            }])
            .select()
            .single();

        if (error) throw error;
        createdTransactions.push(tx);

        // Update invoice total
        await updateInvoiceTotal(invoice.id, installmentAmount);
    }

    // Reduce available limit (by total amount, not per installment)
    await updateCreditCardLimit(credit_card_id, -amount);

    return createdTransactions;
}

// ============ PRIMARY ACCOUNT ============

export async function setPrimaryAccount(accountId: string, userId: string): Promise<void> {
    // The database trigger will handle unsetting other primary accounts
    const { error } = await supabase
        .from('finance_accounts')
        .update({ is_primary: true })
        .eq('id', accountId)
        .eq('user_id', userId);

    if (error) throw error;
}

export async function getPrimaryAccount(userId: string): Promise<FinanceAccount | null> {
    const { data, error } = await supabase
        .from('finance_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
}
