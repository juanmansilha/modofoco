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

export async function updateTask(id: string, updates: any) {
    const dbUpdates = { ...updates };

    // Map camelCase to snake_case
    if (dbUpdates.dueDate !== undefined) {
        dbUpdates.due_date = dbUpdates.dueDate;
        delete dbUpdates.dueDate;
    }
    // Handle empty date string
    if (dbUpdates.due_date === "") dbUpdates.due_date = null;

    if (dbUpdates.columnId !== undefined) {
        dbUpdates.column_id = dbUpdates.columnId;
        delete dbUpdates.columnId;
    }

    const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
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
    // Explicit mapping to avoid any ambiguity or leakage of camelCase properties
    const dbGoal: any = {
        user_id: goal.userId || goal.user_id,
        title: goal.title,
        description: goal.description,
        status: goal.status || 'in_progress',
        tasks: goal.tasks || [],
        target_date: goal.targetDate || goal.target_date || null,
        image_url: goal.imageUrl || goal.image_url || null
    };

    // Remove any undefined keys to allow DB defaults if needed (though we set defaults above)
    // but we handled most common ones.

    console.log("Saving Goal (Sanitized):", dbGoal);

    const { data, error } = await supabase
        .from('goals')
        .insert([dbGoal])
        .select()
        .single();

    if (error) {
        console.error("Supabase Create Goal Error:", error);
        throw error;
    }
    return data;
}

export async function updateGoal(id: string, updates: any) {
    const dbUpdates: any = {};

    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.tasks !== undefined) dbUpdates.tasks = updates.tasks;

    // Explicit date handling
    if (updates.targetDate !== undefined) dbUpdates.target_date = updates.targetDate;
    if (updates.target_date !== undefined) dbUpdates.target_date = updates.target_date;

    // Explicit image handling
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.image_url !== undefined) dbUpdates.image_url = updates.image_url;

    // Handle empty strings converting to null
    if (dbUpdates.target_date === "") dbUpdates.target_date = null;

    console.log("Updating Goal (Sanitized):", dbUpdates);

    const { data, error } = await supabase
        .from('goals')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Supabase Update Goal Error:", error);
        throw error;
    }
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
    // Explicit mapping to ensure no extra keys (like 'dueDate') leak to Supabase
    const dbSubject = {
        user_id: subject.userId || subject.user_id,
        title: subject.title,
        category: subject.category,
        progress: subject.progress || 0,
        total_hours: subject.totalHours || subject.total_hours || 0,
        last_studied: (subject.lastStudied === "" ? null : (subject.lastStudied || subject.last_studied || null)),
        due_date: (subject.dueDate === "" ? null : (subject.dueDate || subject.due_date || null)),
        tasks: subject.tasks || []
    };

    const { data, error } = await supabase
        .from('study_subjects')
        .insert([dbSubject])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateStudySubject(id: string, updates: any) {
    const dbUpdates: any = {};

    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.tasks !== undefined) dbUpdates.tasks = updates.tasks;

    if (updates.totalHours !== undefined) dbUpdates.total_hours = updates.totalHours;
    if (updates.total_hours !== undefined) dbUpdates.total_hours = updates.total_hours;

    if (updates.lastStudied !== undefined) dbUpdates.last_studied = updates.lastStudied;
    if (updates.last_studied !== undefined) dbUpdates.last_studied = updates.last_studied;
    if (dbUpdates.last_studied === "") dbUpdates.last_studied = null;

    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.due_date !== undefined) dbUpdates.due_date = updates.due_date;
    if (dbUpdates.due_date === "") dbUpdates.due_date = null;

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
