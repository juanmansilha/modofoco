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
    const dbSession = { ...session };
    // Let Supabase generate the ID
    if (!dbSession.id) {
        delete dbSession.id;
    }

    const { data, error } = await supabase
        .from('gym_sessions')
        .insert([dbSession])
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

// DEPRECATED: Sleep and Fasting modules removed per user request.
