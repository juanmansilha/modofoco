import { supabase } from './supabase';

// ============ TASKS ============

export async function getTasks(userId: string) {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createTask(task: any) {
    const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateTask(id: string, updates: any) {
    const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteTask(id: string) {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============ GOALS ============

export async function getGoals(userId: string) {
    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createGoal(goal: any) {
    const { data, error } = await supabase
        .from('goals')
        .insert([goal])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateGoal(id: string, updates: any) {
    const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteGoal(id: string) {
    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============ STUDY SUBJECTS ============

export async function getStudySubjects(userId: string) {
    const { data, error } = await supabase
        .from('study_subjects')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data || [];
}

export async function createStudySubject(subject: any) {
    const { data, error } = await supabase
        .from('study_subjects')
        .insert([subject])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateStudySubject(id: string, updates: any) {
    const { data, error } = await supabase
        .from('study_subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteStudySubject(id: string) {
    const { error } = await supabase
        .from('study_subjects')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============ RESOURCES ============

export async function getResources(userId: string) {
    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data || [];
}

export async function createResource(resource: any) {
    const { data, error } = await supabase
        .from('resources')
        .insert([resource])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateResource(id: string, updates: any) {
    const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteResource(id: string) {
    const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
