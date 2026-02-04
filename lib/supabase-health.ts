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

    // Map camelCase
    if (dbSession.lastPerformed) {
        dbSession.last_performed = dbSession.lastPerformed;
        delete dbSession.lastPerformed;
    }
    if (dbSession.last_performed === "") dbSession.last_performed = null;

    if (dbSession.date === "") dbSession.date = null;

    if (dbSession.userId) {
        dbSession.user_id = dbSession.userId;
        delete dbSession.userId;
    }

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
    const dbUpdates = { ...updates };

    // Map camelCase
    if (dbUpdates.lastPerformed) {
        dbUpdates.last_performed = dbUpdates.lastPerformed;
        delete dbUpdates.lastPerformed;
    }
    if (dbUpdates.completedDates) {
        dbUpdates.completed_dates = dbUpdates.completedDates;
        delete dbUpdates.completedDates;
    }

    const { data, error } = await supabase
        .from('gym_sessions')
        .update(dbUpdates)
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
    const dbSession = { ...session };

    // Map camelCase
    if (dbSession.userId) {
        dbSession.user_id = dbSession.userId;
        delete dbSession.userId;
    }

    if (dbSession.date === "") dbSession.date = null;

    if (!dbSession.id) {
        delete dbSession.id;
    }

    const { data, error } = await supabase
        .from('run_sessions')
        .insert([dbSession])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateRunSession(id: string, updates: any) {
    const dbUpdates = { ...updates };

    // Safety check just in case
    if (dbUpdates.userId) delete dbUpdates.userId;

    const { data, error } = await supabase
        .from('run_sessions')
        .update(dbUpdates)
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
    const dbMeal = { ...meal };

    // Map camelCase
    if (dbMeal.userId) {
        dbMeal.user_id = dbMeal.userId;
        delete dbMeal.userId;
    }

    if (dbMeal.date === "") dbMeal.date = null;

    if (!dbMeal.id) {
        delete dbMeal.id;
    }

    const { data, error } = await supabase
        .from('meals')
        .insert([dbMeal])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateMeal(id: string, updates: any) {
    const dbUpdates = { ...updates };
    if (dbUpdates.userId) delete dbUpdates.userId;

    if (dbUpdates.completedDates) {
        dbUpdates.completed_dates = dbUpdates.completedDates;
        delete dbUpdates.completedDates;
    }

    const { data, error } = await supabase
        .from('meals')
        .update(dbUpdates)
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
    const dbRoutine = { ...routine };

    // Map camelCase
    if (dbRoutine.userId) {
        dbRoutine.user_id = dbRoutine.userId;
        delete dbRoutine.userId;
    }
    if (dbRoutine.completedDates) {
        dbRoutine.completed_dates = dbRoutine.completedDates;
        delete dbRoutine.completedDates;
    }
    if (!dbRoutine.id) {
        delete dbRoutine.id;
    }

    const { data, error } = await supabase
        .from('general_routines')
        .insert([dbRoutine])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateGeneralRoutine(id: string, updates: any) {
    const dbUpdates = { ...updates };

    if (dbUpdates.completedDates) {
        dbUpdates.completed_dates = dbUpdates.completedDates;
        delete dbUpdates.completedDates;
    }
    if (dbUpdates.userId) delete dbUpdates.userId;

    const { data, error } = await supabase
        .from('general_routines')
        .update(dbUpdates)
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
