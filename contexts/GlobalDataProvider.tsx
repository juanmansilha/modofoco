"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { addDays, format } from "date-fns";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import * as SupabaseHealth from "@/lib/supabase-health";
import * as SupabaseProductivity from "@/lib/supabase-productivity";

// --- Types from NEW (Health/Gamification) ---

export interface GlobalRoutine {
    id: string;
    title: string;
    time: string;
    icon: string; // lucide icon name or similar
    days: string[]; // ['mon', 'tue']
    steps: { id: string; text: string; completed: boolean }[];
    completedDates?: string[];
}

export interface GymSession {
    id: string;
    name: string;
    focus: string;
    duration: string;
    date?: string;
    time?: string;
    recurrence?: string[];
    exercises: any[];
    completed?: boolean;
    lastPerformed?: string;
}

export interface RunSession {
    id: string;
    title: string;
    date: string;
    time: string; // HH:MM - Schedule time
    duration: string; // MM:SS - Duration/Pace
    dist: number;
    calories: number;
    completed?: boolean;
}

export interface Meal {
    id: string;
    type: "breakfast" | "lunch" | "dinner" | "snack";
    name: string;
    time: string;
    date: string;
    recurrence?: string[];
}

export interface UserData {
    name: string;
    email?: string;
    whatsapp?: string;
    photo?: string | null;
    focus?: string[];
    discovery?: string;
    onboardingCompleted: boolean;
}

// --- Types from OLD (Tasks/Goals/Study/Resources) ---

export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    status: "todo" | "doing" | "done";
    subtasks?: { id: string; text: string; completed: boolean }[];
    dueDate?: string;
    column?: string; // Legacy from TasksPage
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    imageUrl: string;
    status: string;
    tasks: { id: string; title: string; completed: boolean }[];
}

export interface StudySubject {
    id: string;
    title: string;
    category: "college" | "course" | "book" | "other";
    progress: number;
    totalHours: number;
    lastStudied?: string;
    dueDate?: string;
    tasks: { id: string; text: string; completed: boolean }[];
}

export interface Resource {
    id: string;
    title: string;
    type: string;
    description?: string;
    tasks: { id: string; text: string; completed: boolean }[];
}

// --- Combined Context Type ---

// ... (Types)

interface GlobalDataContextType {
    // Health Data
    gymRoutines: GymSession[];
    runSessions: RunSession[];
    dietMeals: Meal[];
    generalRoutines: GlobalRoutine[];

    // User Data
    userData: UserData;
    updateUserData: (data: Partial<UserData>) => void;
    login: (email: string, pass: string) => Promise<void>;
    signup: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthLoading: boolean;

    // Productivity Data
    tasks: Task[];
    goals: Goal[];
    subjects: StudySubject[];
    resources: Resource[];

    // Health Actions
    addGymRoutine: (routine: GymSession) => void;
    updateGymRoutine: (routine: GymSession) => void;
    deleteGymRoutine: (id: string) => void;
    toggleGymCompletion: (id: string, date: string) => void;

    addRunSession: (run: RunSession) => void;
    updateRunSession: (run: RunSession) => void;
    deleteRunSession: (id: string) => void;
    toggleRunCompletion: (id: string) => void;

    addMeal: (meal: Meal) => void;
    updateMeal: (meal: Meal) => void;
    deleteMeal: (id: string) => void;

    addGeneralRoutine: (routine: GlobalRoutine) => void;
    updateGeneralRoutine: (routine: GlobalRoutine) => void;
    deleteGeneralRoutine: (id: string) => void;

    // Productivity Actions
    addTask: (task: Task) => void;
    updateTask: (task: Task) => void;
    deleteTask: (id: string) => void;

    addGoal: (goal: Goal) => void;
    updateGoal: (goal: Goal) => void;
    deleteGoal: (id: string) => void;

    addSubject: (subject: StudySubject) => void;
    updateSubject: (subject: StudySubject) => void;
    deleteSubject: (id: string) => void;

    addResource: (resource: Resource) => void;
    updateResource: (resource: Resource) => void;
    deleteResource: (id: string) => void;

    // Unified Logic
    toggleExternalTask: (source: 'goal' | 'subject' | 'resource', parentId: string, taskId: string) => void;
    updateTaskStatus: (source: 'native' | 'goal' | 'subject' | 'resource', parentId: string | undefined, taskId: string, newStatus: string) => void;

    // Helpers
    getItemsForDate: (date: Date) => TimelineItem[];
}

export type TimelineItemType = "gym" | "run" | "meal" | "routine";

export interface TimelineItem {
    id: string;
    originalId: string;
    type: TimelineItemType;
    title: string;
    subtitle?: string;
    time: string;
    isCompleted: boolean;
    data: any;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

// --- Initial Data ---

const INITIAL_GYM: GymSession[] = [];

const INITIAL_RUN: RunSession[] = [];

const INITIAL_DIET: Meal[] = [];

const INITIAL_ROUTINES: GlobalRoutine[] = [];

const INITIAL_TASKS: Task[] = [];

const INITIAL_GOALS: Goal[] = [];

const INITIAL_SUBJECTS: StudySubject[] = [];

const INITIAL_RESOURCES: Resource[] = [];

export function GlobalDataProvider({ children }: { children: React.ReactNode }) {
    // Health State
    const [gymRoutines, setGymRoutines] = useState<GymSession[]>(INITIAL_GYM);
    const [runSessions, setRunSessions] = useState<RunSession[]>(INITIAL_RUN);
    const [dietMeals, setDietMeals] = useState<Meal[]>(INITIAL_DIET);
    const [generalRoutines, setGeneralRoutines] = useState<GlobalRoutine[]>(INITIAL_ROUTINES);

    // Productivity State
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
    const [subjects, setSubjects] = useState<StudySubject[]>(INITIAL_SUBJECTS);
    const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);

    const [userId, setUserId] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Get real user ID from Supabase
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load ALL data from Supabase when userId is ready
    useEffect(() => {
        if (!userId) return;

        const loadAllData = async () => {
            setIsLoadingData(true);
            try {
                const [
                    gym,
                    run,
                    meals,
                    routines,
                    taskData,
                    goalData,
                    subjectData,
                    resourceData
                ] = await Promise.all([
                    SupabaseHealth.getGymSessions(userId),
                    SupabaseHealth.getRunSessions(userId),
                    SupabaseHealth.getMeals(userId),
                    SupabaseHealth.getGeneralRoutines(userId),
                    SupabaseProductivity.getTasks(userId),
                    SupabaseProductivity.getGoals(userId),
                    SupabaseProductivity.getStudySubjects(userId),
                    SupabaseProductivity.getResources(userId)
                ]);

                setGymRoutines(gym);
                setRunSessions(run);
                setDietMeals(meals);
                setGeneralRoutines(routines);

                setTasks(taskData.map(t => ({
                    ...t,
                    priority: t.priority as any,
                    status: t.status as any,
                    column: t.column_id,
                    dueDate: t.due_date // Map database column to frontend property
                })));
                setGoals(goalData);
                setSubjects(subjectData);
                setResources(resourceData);

            } catch (error) {
                console.error("Error loading global data from Supabase:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadAllData();
    }, [userId]);

    // --- Health Actions ---

    const addGymRoutine = async (r: GymSession) => {
        if (!userId) return;
        try {
            const created = await SupabaseHealth.createGymSession({ ...r, user_id: userId, id: undefined });
            setGymRoutines([...gymRoutines, created]);
        } catch (e) {
            console.error("Error adding gym routine:", e);
        }
    };

    const updateGymRoutine = async (r: GymSession) => {
        try {
            const updated = await SupabaseHealth.updateGymSession(r.id, r);
            setGymRoutines(prev => prev.map(item => item.id === r.id ? updated : item));
        } catch (e) {
            console.error("Error updating gym routine:", e);
        }
    };

    const deleteGymRoutine = async (id: string) => {
        try {
            await SupabaseHealth.deleteGymSession(id);
            setGymRoutines(prev => prev.filter(item => item.id !== id));
        } catch (e) {
            console.error("Error deleting gym routine:", e);
        }
    };

    const toggleGymCompletion = async (id: string) => {
        const routine = gymRoutines.find(r => r.id === id);
        if (!routine) return;
        try {
            const updated = await SupabaseHealth.updateGymSession(id, { completed: !routine.completed });
            setGymRoutines(prev => prev.map(r => r.id === id ? updated : r));
        } catch (e) {
            console.error("Error toggling gym completion:", e);
        }
    };

    const addRunSession = async (r: RunSession) => {
        if (!userId) return;
        try {
            const created = await SupabaseHealth.createRunSession({ ...r, user_id: userId, id: undefined });
            setRunSessions([...runSessions, created]);
        } catch (e) {
            console.error("Error adding run session:", e);
        }
    };

    const updateRunSession = async (r: RunSession) => {
        try {
            const updated = await SupabaseHealth.updateRunSession(r.id, r);
            setRunSessions(prev => prev.map(item => item.id === r.id ? updated : item));
        } catch (e) {
            console.error("Error updating run session:", e);
        }
    };

    const deleteRunSession = async (id: string) => {
        try {
            await SupabaseHealth.deleteRunSession(id);
            setRunSessions(prev => prev.filter(item => item.id !== id));
        } catch (e) {
            console.error("Error deleting run session:", e);
        }
    };

    const toggleRunCompletion = async (id: string) => {
        const run = runSessions.find(r => r.id === id);
        if (!run) return;
        try {
            const updated = await SupabaseHealth.updateRunSession(id, { completed: !run.completed });
            setRunSessions(prev => prev.map(r => r.id === id ? updated : r));
        } catch (e) {
            console.error("Error toggling run completion:", e);
        }
    };

    const addMeal = async (m: Meal) => {
        if (!userId) return;
        try {
            const created = await SupabaseHealth.createMeal({ ...m, user_id: userId, id: undefined });
            setDietMeals([...dietMeals, created]);
        } catch (e) {
            console.error("Error adding meal:", e);
        }
    };

    const updateMeal = async (m: Meal) => {
        try {
            const updated = await SupabaseHealth.updateMeal(m.id, m);
            setDietMeals(prev => prev.map(item => item.id === m.id ? updated : item));
        } catch (e) {
            console.error("Error updating meal:", e);
        }
    };

    const deleteMeal = async (id: string) => {
        try {
            await SupabaseHealth.deleteMeal(id);
            setDietMeals(prev => prev.filter(item => item.id !== id));
        } catch (e) {
            console.error("Error deleting meal:", e);
        }
    };

    const addGeneralRoutine = async (r: GlobalRoutine) => {
        if (!userId) return;
        try {
            const created = await SupabaseHealth.createGeneralRoutine({ ...r, user_id: userId, id: undefined });
            setGeneralRoutines([...generalRoutines, created]);
        } catch (e) {
            console.error("Error adding routine:", e);
        }
    };

    const updateGeneralRoutine = async (r: GlobalRoutine) => {
        try {
            const updated = await SupabaseHealth.updateGeneralRoutine(r.id, r);
            setGeneralRoutines(prev => prev.map(item => item.id === r.id ? updated : item));
        } catch (e) {
            console.error("Error updating routine:", e);
        }
    };

    const deleteGeneralRoutine = async (id: string) => {
        try {
            await SupabaseHealth.deleteGeneralRoutine(id);
            setGeneralRoutines(prev => prev.filter(item => item.id !== id));
        } catch (e) {
            console.error("Error deleting routine:", e);
        }
    };

    // --- Productivity Actions ---

    const addTask = async (task: Task) => {
        if (!userId) {
            console.error("User ID not found when adding task");
            return;
        }
        try {
            // Clean task object before sending to Supabase
            const { id, column, ...taskPayload } = task;
            const created = await SupabaseProductivity.createTask({
                ...taskPayload,
                user_id: userId,
                column_id: column || 'todo'
            });

            if (created) {
                setTasks(prev => [...prev, { ...created, column: created.column_id }]);
                return true;
            }
        } catch (e) {
            console.error("Error adding task to Supabase:", e);
            // We could add a toast notification here if we had a toaster context
            throw e; // Re-throw to let the caller know it failed
        }
    };

    const updateTask = async (task: Task) => {
        try {
            const updated = await SupabaseProductivity.updateTask(task.id, {
                ...task,
                column_id: task.column
            });
            setTasks(tasks.map(t => t.id === task.id ? { ...updated, column: updated.column_id } : t));
        } catch (e) {
            console.error("Error updating task:", e);
        }
    };

    const deleteTask = async (id: string) => {
        try {
            await SupabaseProductivity.deleteTask(id);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (e) {
            console.error("Error deleting task:", e);
        }
    };

    const addGoal = async (goal: Goal) => {
        if (!userId) return;
        try {
            const created = await SupabaseProductivity.createGoal({ ...goal, user_id: userId, id: undefined });
            setGoals([...goals, created]);
        } catch (e) {
            console.error("Error adding goal:", e);
        }
    };

    const updateGoal = async (goal: Goal) => {
        try {
            const updated = await SupabaseProductivity.updateGoal(goal.id, goal);
            setGoals(goals.map(g => g.id === goal.id ? updated : g));
        } catch (e) {
            console.error("Error updating goal:", e);
        }
    };

    const deleteGoal = async (id: string) => {
        try {
            await SupabaseProductivity.deleteGoal(id);
            setGoals(goals.filter(g => g.id !== id));
        } catch (e) {
            console.error("Error deleting goal:", e);
        }
    };

    const addSubject = async (subject: StudySubject) => {
        if (!userId) return;
        try {
            const created = await SupabaseProductivity.createStudySubject({ ...subject, user_id: userId, id: undefined });
            setSubjects([...subjects, created]);
        } catch (e) {
            console.error("Error adding subject:", e);
        }
    };

    const updateSubject = async (subject: StudySubject) => {
        try {
            const updated = await SupabaseProductivity.updateStudySubject(subject.id, subject);
            setSubjects(subjects.map(s => s.id === subject.id ? updated : s));
        } catch (e) {
            console.error("Error updating subject:", e);
        }
    };

    const deleteSubject = async (id: string) => {
        try {
            await SupabaseProductivity.deleteStudySubject(id);
            setSubjects(subjects.filter(s => s.id !== id));
        } catch (e) {
            console.error("Error deleting subject:", e);
        }
    };

    const addResource = async (resource: Resource) => {
        if (!userId) return;
        try {
            const created = await SupabaseProductivity.createResource({ ...resource, user_id: userId, id: undefined });
            setResources([...resources, created]);
        } catch (e) {
            console.error("Error adding resource:", e);
        }
    };

    const updateResource = async (resource: Resource) => {
        try {
            const updated = await SupabaseProductivity.updateResource(resource.id, resource);
            setResources(resources.map(r => r.id === resource.id ? updated : r));
        } catch (e) {
            console.error("Error updating resource:", e);
        }
    };

    const deleteResource = async (id: string) => {
        try {
            await SupabaseProductivity.deleteResource(id);
            setResources(resources.filter(r => r.id !== id));
        } catch (e) {
            console.error("Error deleting resource:", e);
        }
    };

    // Unified Toggle Logic
    const toggleExternalTask = (source: 'goal' | 'subject' | 'resource', parentId: string, taskId: string) => {
        updateTaskStatus(source, parentId, taskId, 'toggle');
    };

    // Generic Status Update (Support for DnD)
    const updateTaskStatus = async (source: 'native' | 'goal' | 'subject' | 'resource', parentId: string | undefined, taskId: string, newStatus: string) => {

        // Helper to determine boolean completion from status string
        const isCompleted = (status: string, currentCompleted: boolean) => {
            if (status === 'toggle') return !currentCompleted;
            if (status === 'done') return true;
            if (status === 'todo' || status === 'doing') return false;
            return currentCompleted;
        };

        if (source === 'native') {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const statusVal = newStatus === 'toggle'
                ? (task.status === 'done' ? 'todo' : 'done')
                : (newStatus as any);

            const updatedTask = {
                ...task,
                status: statusVal,
                column: newStatus === 'toggle' ? (task.column === 'done' ? 'todo' : 'done') : newStatus
            };

            setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));

            try {
                await SupabaseProductivity.updateTask(taskId, {
                    status: updatedTask.status,
                    column_id: updatedTask.column
                });
            } catch (e) {
                console.error("Error updating native task status:", e);
            }
            return;
        }

        if (!parentId) return;

        if (source === 'goal') {
            const goal = goals.find(g => g.id === parentId);
            if (!goal) return;

            const updatedTasks = goal.tasks.map(t => t.id === taskId ? { ...t, completed: isCompleted(newStatus, t.completed) } : t);
            const updatedGoal = { ...goal, tasks: updatedTasks };

            setGoals(goals.map(g => g.id === parentId ? updatedGoal : g));
            try {
                await SupabaseProductivity.updateGoal(parentId, { tasks: updatedTasks });
            } catch (e) {
                console.error("Error updating goal task status:", e);
            }
        } else if (source === 'subject') {
            const subject = subjects.find(s => s.id === parentId);
            if (!subject) return;

            const updatedTasks = subject.tasks.map(t => t.id === taskId ? { ...t, completed: isCompleted(newStatus, t.completed) } : t);
            const completedCount = updatedTasks.filter(t => t.completed).length;
            const progress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
            const updatedSubject = { ...subject, tasks: updatedTasks, progress };

            setSubjects(subjects.map(s => s.id === parentId ? updatedSubject : s));
            try {
                await SupabaseProductivity.updateStudySubject(parentId, { tasks: updatedTasks, progress });
            } catch (e) {
                console.error("Error updating subject task status:", e);
            }
        } else if (source === 'resource') {
            const resource = resources.find(r => r.id === parentId);
            if (!resource) return;

            const updatedTasks = resource.tasks.map(t => t.id === taskId ? { ...t, completed: isCompleted(newStatus, t.completed) } : t);
            const updatedResource = { ...resource, tasks: updatedTasks };

            setResources(resources.map(r => r.id === parentId ? updatedResource : r));
            try {
                await SupabaseProductivity.updateResource(parentId, { tasks: updatedTasks });
            } catch (e) {
                console.error("Error updating resource task status:", e);
            }
        }
    };

    // --- Helper for Aggregation ---

    const getItemsForDate = (date: Date): TimelineItem[] => {
        const dateStr = format(date, "yyyy-MM-dd");
        const dayKey = format(date, "EEE").toLowerCase(); // mon, tue...
        const timeline: TimelineItem[] = [];

        // 1. Gym
        gymRoutines.forEach(gym => {
            const matchesDate = gym.date === dateStr;
            const matchesRecurrence = gym.recurrence && gym.recurrence.includes(dayKey);

            if (matchesDate || matchesRecurrence) {
                timeline.push({
                    id: `timeline-gym-${gym.id}-${dateStr}`,
                    originalId: gym.id,
                    type: "gym",
                    title: gym.name,
                    subtitle: gym.focus,
                    time: gym.time || "00:00",
                    isCompleted: !!gym.completed,
                    data: gym
                });
            }
        });

        // 2. Run
        runSessions.forEach(run => {
            if (run.date === dateStr) {
                timeline.push({
                    id: `timeline-run-${run.id}`,
                    originalId: run.id,
                    type: "run",
                    title: run.title,
                    subtitle: `${run.dist}km • ${run.duration || '00:00'}`,
                    time: run.time || "00:00",
                    isCompleted: !!run.completed,
                    data: run
                });
            }
        });

        // 3. Diet
        dietMeals.forEach(meal => {
            const matchesDate = meal.date === dateStr && (!meal.recurrence || meal.recurrence.length === 0);
            const matchesRecurrence = meal.recurrence && meal.recurrence.includes(dayKey);

            if (matchesDate || matchesRecurrence) {
                timeline.push({
                    id: `timeline-meal-${meal.id}-${dateStr}`,
                    originalId: meal.id,
                    type: "meal",
                    title: meal.name,
                    subtitle: meal.type,
                    time: meal.time,
                    isCompleted: false,
                    data: meal
                });
            }
        });

        // 4. General Routines
        generalRoutines.forEach(routine => {
            if (routine.days.includes(dayKey)) {
                timeline.push({
                    id: `timeline-routine-${routine.id}-${dateStr}`,
                    originalId: routine.id,
                    type: "routine",
                    title: routine.title,
                    subtitle: `${routine.steps.length} passos`,
                    time: routine.time,
                    isCompleted: false,
                    data: routine
                });
            }
        });

        return timeline.sort((a, b) => a.time.localeCompare(b.time));
    };

    // --- User Data ---
    const [userData, setUserData] = useState<UserData>({
        name: "",
        email: "",
        whatsapp: "",
        photo: null,
        onboardingCompleted: false
    });
    // Auth State
    const [user, setUser] = useState<any | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true); // Start as true to prevent flash

    // Supabase Auth & Profile Integration
    useEffect(() => {
        const loadProfile = async (uid: string) => {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
            if (data && !error) {
                setUserData({
                    name: data.name || "",
                    email: data.email || "",
                    whatsapp: data.whatsapp || "",
                    photo: data.photo || null,
                    onboardingCompleted: data.onboarding_completed || false,
                    focus: data.focus || [],
                    discovery: data.discovery || ""
                });
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                loadProfile(session.user.id);
            }
            setIsAuthLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                loadProfile(session.user.id);
            } else {
                setUserData({ name: "", email: "", whatsapp: "", photo: null, onboardingCompleted: false });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const updateUserData = async (data: Partial<UserData>) => {
        if (!userId) {
            // Fallback for onboarding before auth is fully ready if needed, 
            // but usually we have a session by now
            setUserData(prev => ({ ...prev, ...data }));
            return;
        }

        try {
            const updates = {
                name: data.name,
                whatsapp: data.whatsapp,
                photo: data.photo,
                focus: data.focus,
                discovery: data.discovery,
                onboarding_completed: data.onboardingCompleted,
                updated_at: new Date()
            };

            // Remove undefined fields
            Object.keys(updates).forEach(key => (updates as any)[key] === undefined && delete (updates as any)[key]);

            await supabase.from('profiles').update(updates).eq('id', userId);
            setUserData(prev => ({ ...prev, ...data }));
        } catch (e) {
            console.error("Error updating user profile:", e);
        }
    };

    const login = async (email: string, pass: string) => {
        // 1. Auth Sign In
        const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;

        // 2. Immediate Profile Fetch (Avoids race condition with onAuthStateChange)
        if (session?.user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (profile) {
                setUserData({
                    name: profile.name || "",
                    email: profile.email || "",
                    whatsapp: profile.whatsapp || "",
                    photo: profile.photo || null,
                    onboardingCompleted: profile.onboarding_completed || false,
                    focus: profile.focus || [],
                    discovery: profile.discovery || ""
                });
                setUserId(session.user.id);
            }
        }
    };

    const signup = async (email: string, pass: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: { full_name: name }
            }
        });
        if (error) throw error;
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUserData({ name: "", email: "", onboardingCompleted: false });
            // Clear all local states
            setGymRoutines([]);
            setRunSessions([]);
            setDietMeals([]);
            setTasks([]);
            setGoals([]);
        } catch (e) {
            console.error("Error during logout:", e);
        }
    };

    return (
        <GlobalDataContext.Provider value={{
            // User Data
            userData, updateUserData,
            login, signup, logout,
            isAuthLoading,

            // Health
            gymRoutines, runSessions, dietMeals, generalRoutines,
            addGymRoutine, updateGymRoutine, deleteGymRoutine, toggleGymCompletion,
            addRunSession, updateRunSession, deleteRunSession, toggleRunCompletion,
            addMeal, updateMeal, deleteMeal,
            addGeneralRoutine, updateGeneralRoutine, deleteGeneralRoutine,

            // Productivity
            tasks, goals, subjects, resources,
            addTask, updateTask, deleteTask,
            addGoal, updateGoal, deleteGoal,
            addSubject, updateSubject, deleteSubject,
            addResource, updateResource, deleteResource,
            toggleExternalTask, updateTaskStatus,
            // Helpers
            getItemsForDate
        }}>
            {children}
        </GlobalDataContext.Provider>
    );
}

export function useGlobalData() {
    const context = useContext(GlobalDataContext);
    if (context === undefined) {
        throw new Error("useGlobalData must be used within a GlobalDataProvider");
    }
    return context;
}
