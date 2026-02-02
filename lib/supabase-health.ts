import { supabase } from './supabase';

// ============ GYM SESSIONS ============

export async function getGymSessions(userId: string) {
    const { data, error } = await supabase
        .from('gym_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createGymSession(session: any) {
    const { data, error } = await supabase
        .from('gym_sessions')
        .insert([session])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateGymSession(id: string, updates: any) {
    const { data, error } = await supabase
        .from('gym_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteGymSession(id: string) {
    const { error } = await supabase
        .from('gym_sessions')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============ RUN SESSIONS ============

export async function getRunSessions(userId: string) {
    const { data, error } = await supabase
        .from('run_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createRunSession(session: any) {
    const { data, error } = await supabase
        .from('run_sessions')
        .insert([session])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateRunSession(id: string, updates: any) {
    const { data, error } = await supabase
        .from('run_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteRunSession(id: string) {
    const { error } = await supabase
        .from('run_sessions')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============ MEALS ============

export async function getMeals(userId: string) {
    const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .order('time', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function createMeal(meal: any) {
    const { data, error } = await supabase
        .from('meals')
        .insert([meal])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateMeal(id: string, updates: any) {
    const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteMeal(id: string) {
    const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============ GENERAL ROUTINES ============

export async function getGeneralRoutines(userId: string) {
    const { data, error } = await supabase
        .from('general_routines')
        .select('*')
        .eq('user_id', userId)
        .order('time', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function createGeneralRoutine(routine: any) {
    const { data, error } = await supabase
        .from('general_routines')
        .insert([routine])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateGeneralRoutine(id: string, updates: any) {
    const { data, error } = await supabase
        .from('general_routines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteGeneralRoutine(id: string) {
    const { error } = await supabase
        .from('general_routines')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============ SLEEP LOGS ============

export async function getSleepLogs(userId: string) {
    const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createSleepLog(log: any) {
    const { data, error } = await supabase
        .from('sleep_logs')
        .insert([log])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============ FASTING ============

export async function getFastingState(userId: string) {
    const { data, error } = await supabase
        .from('fasting_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned
    return data;
}

export async function updateFastingLog(userId: string, state: any) {
    // This is more complex since we usually have only one active log
    if (state.isActive) {
        const { data, error } = await supabase
            .from('fasting_logs')
            .upsert({
                user_id: userId,
                plan_id: state.planId,
                start_time: state.startTime ? new Date(state.startTime).toISOString() : null,
                is_active: true
            }, { onConflict: 'user_id,is_active' }) // Might need a unique constraint in DB for this to work perfectly or logic to close others
            .select()
            .single();
        if (error) throw error;
        return data;
    } else {
        // Deactivate active log
        const { error } = await supabase
            .from('fasting_logs')
            .update({ is_active: false, end_time: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('is_active', true);
        if (error) throw error;
        return null;
    }
}
