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
    // Map camelCase to snake_case for Supabase
    const dbTask = {
        ...task,
        due_date: (task.dueDate || task.due_date) || null,
        user_id: task.userId || task.user_id,
        column_id: task.columnId || task.column_id
    };
    // Remove camelCase keys to avoid schema errors
    delete dbTask.dueDate;
    delete dbTask.userId;
    delete dbTask.columnId;

    const { data, error } = await supabase
        .from('tasks')
        .insert([dbTask])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ... (getGoals omitted)

export async function createGoal(goal: any) {
    const dbGoal = { ...goal };

    // Map camelCase
    if (dbGoal.targetDate) {
        dbGoal.target_date = dbGoal.targetDate;
        delete dbGoal.targetDate;
    }
    // Handle empty date string
    if (dbGoal.target_date === "") dbGoal.target_date = null;

    if (dbGoal.imageUrl) {
        dbGoal.image_url = dbGoal.imageUrl;
        delete dbGoal.imageUrl;
    }
    if (dbGoal.userId) {
        dbGoal.user_id = dbGoal.userId;
        delete dbGoal.userId;
    }
    if (!dbGoal.id) {
        delete dbGoal.id;
    }

    const { data, error } = await supabase
        .from('goals')
        .insert([dbGoal])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ... (updateGoal omitted)

export async function createStudySubject(subject: any) {
    const dbSubject = { ...subject };

    // Map camelCase
    if (dbSubject.totalHours !== undefined) {
        dbSubject.total_hours = dbSubject.totalHours;
        delete dbSubject.totalHours;
    }
    if (dbSubject.lastStudied) {
        dbSubject.last_studied = dbSubject.lastStudied;
        delete dbSubject.lastStudied;
    }
    // Handle empty date string
    if (dbSubject.last_studied === "") dbSubject.last_studied = null;

    if (dbSubject.dueDate) {
        dbSubject.due_date = dbSubject.dueDate;
        delete dbSubject.dueDate;
    }
    // Handle empty date string
    if (dbSubject.due_date === "") dbSubject.due_date = null;

    if (dbSubject.userId) {
        dbSubject.user_id = dbSubject.userId;
        delete dbSubject.userId;
    }
    if (!dbSubject.id) {
        delete dbSubject.id;
    }

    const { data, error } = await supabase
        .from('study_subjects')
        .insert([dbSubject])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateStudySubject(id: string, updates: any) {
    const dbUpdates = { ...updates };

    // Map camelCase
    if (dbUpdates.totalHours !== undefined) {
        dbUpdates.total_hours = dbUpdates.totalHours;
        delete dbUpdates.totalHours;
    }
    if (dbUpdates.lastStudied) {
        dbUpdates.last_studied = dbUpdates.lastStudied;
        delete dbUpdates.lastStudied;
    }
    if (dbUpdates.dueDate) {
        dbUpdates.due_date = dbUpdates.dueDate;
        delete dbUpdates.dueDate;
    }
    if (dbUpdates.userId) delete dbUpdates.userId;

    const { data, error } = await supabase
        .from('study_subjects')
        .update(dbUpdates)
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
    const dbResource = { ...resource };

    // Map camelCase
    if (dbResource.userId) {
        dbResource.user_id = dbResource.userId;
        delete dbResource.userId;
    }
    if (!dbResource.id) {
        delete dbResource.id;
    }

    const { data, error } = await supabase
        .from('resources')
        .insert([dbResource])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateResource(id: string, updates: any) {
    const dbUpdates = { ...updates };

    if (dbUpdates.userId) delete dbUpdates.userId;

    const { data, error } = await supabase
        .from('resources')
        .update(dbUpdates)
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
