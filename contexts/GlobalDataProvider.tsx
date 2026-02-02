"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { addDays, format } from "date-fns";

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

export interface FastingState {
    isActive: boolean;
    startTime: number | null; // Timestamp
    planId: string;
    elapsedSeconds: number; // For persistence mock
}

export interface SleepLog {
    id: string;
    date: string; // YYYY-MM-DD
    bedtime: string; // HH:MM
    wakeup: string; // HH:MM
    duration: number; // hours
    quality: "good" | "avg" | "bad";
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

import { supabase } from "@/lib/supabase";

// ... (Types)

interface GlobalDataContextType {
    // Health Data
    gymRoutines: GymSession[];
    runSessions: RunSession[];
    dietMeals: Meal[];
    generalRoutines: GlobalRoutine[];
    fastingState: FastingState;
    sleepLogs: SleepLog[];

    // User Data
    userData: UserData;
    updateUserData: (data: Partial<UserData>) => void;
    login: (email: string, pass: string) => Promise<void>;
    signup: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => Promise<void>;

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

    updateFastingState: (state: FastingState) => void;
    addSleepLog: (log: SleepLog) => void;

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

const INITIAL_FASTING: FastingState = {
    isActive: false,
    startTime: null,
    planId: "16-8",
    elapsedSeconds: 0
};

const INITIAL_SLEEP: SleepLog[] = [];

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
    const [fastingState, setFastingState] = useState<FastingState>(INITIAL_FASTING);
    const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(INITIAL_SLEEP);

    // Productivity State
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
    const [subjects, setSubjects] = useState<StudySubject[]>(INITIAL_SUBJECTS);
    const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);

    // --- Health Actions ---

    const addGymRoutine = (r: GymSession) => setGymRoutines([...gymRoutines, r]);
    const updateGymRoutine = (r: GymSession) => setGymRoutines(prev => prev.map(item => item.id === r.id ? r : item));
    const deleteGymRoutine = (id: string) => setGymRoutines(prev => prev.filter(item => item.id !== id));
    const toggleGymCompletion = (id: string) => {
        setGymRoutines(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    };

    const addRunSession = (r: RunSession) => setRunSessions([...runSessions, r]);
    const updateRunSession = (r: RunSession) => setRunSessions(prev => prev.map(item => item.id === r.id ? r : item));
    const deleteRunSession = (id: string) => setRunSessions(prev => prev.filter(item => item.id !== id));
    const toggleRunCompletion = (id: string) => {
        setRunSessions(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    };

    const addMeal = (m: Meal) => setDietMeals([...dietMeals, m]);
    const updateMeal = (m: Meal) => setDietMeals(prev => prev.map(item => item.id === m.id ? m : item));
    const deleteMeal = (id: string) => setDietMeals(prev => prev.filter(item => item.id !== id));

    const addGeneralRoutine = (r: GlobalRoutine) => setGeneralRoutines([...generalRoutines, r]);
    const updateGeneralRoutine = (r: GlobalRoutine) => setGeneralRoutines(prev => prev.map(item => item.id === r.id ? r : item));
    const deleteGeneralRoutine = (id: string) => setGeneralRoutines(prev => prev.filter(item => item.id !== id));

    const updateFastingState = (state: FastingState) => setFastingState(state);
    const addSleepLog = (log: SleepLog) => setSleepLogs([log, ...sleepLogs]);

    // --- Productivity Actions ---

    const addTask = (task: Task) => setTasks([...tasks, task]);
    const updateTask = (task: Task) => setTasks(tasks.map(t => t.id === task.id ? task : t));
    const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

    const addGoal = (goal: Goal) => setGoals([...goals, goal]);
    const updateGoal = (goal: Goal) => setGoals(goals.map(g => g.id === goal.id ? goal : g));
    const deleteGoal = (id: string) => setGoals(goals.filter(g => g.id !== id));

    const addSubject = (subject: StudySubject) => setSubjects([...subjects, subject]);
    const updateSubject = (subject: StudySubject) => setSubjects(subjects.map(s => s.id === subject.id ? subject : s));
    const deleteSubject = (id: string) => setSubjects(subjects.filter(s => s.id !== id));

    const addResource = (resource: Resource) => setResources([...resources, resource]);
    const updateResource = (resource: Resource) => setResources(resources.map(r => r.id === resource.id ? resource : r));
    const deleteResource = (id: string) => setResources(resources.filter(r => r.id !== id));

    // Unified Toggle Logic
    const toggleExternalTask = (source: 'goal' | 'subject' | 'resource', parentId: string, taskId: string) => {
        updateTaskStatus(source, parentId, taskId, 'toggle');
    };

    // Generic Status Update (Support for DnD)
    const updateTaskStatus = (source: 'native' | 'goal' | 'subject' | 'resource', parentId: string | undefined, taskId: string, newStatus: string) => {

        // Helper to determine boolean completion from status string
        const isCompleted = (status: string, currentCompleted: boolean) => {
            if (status === 'toggle') return !currentCompleted;
            if (status === 'done') return true;
            if (status === 'todo' || status === 'doing') return false;
            return currentCompleted;
        };

        if (source === 'native') {
            setTasks(tasks.map(t => {
                if (t.id === taskId) {
                    const statusVal = newStatus === 'toggle'
                        ? (t.status === 'done' ? 'todo' : 'done')
                        : (newStatus as any);

                    return {
                        ...t,
                        status: statusVal,
                        column: newStatus === 'toggle' ? (t.column === 'done' ? 'todo' : 'done') : newStatus
                    };
                }
                return t;
            }));
            return;
        }

        if (!parentId) return;

        if (source === 'goal') {
            setGoals(goals.map(g => {
                if (g.id === parentId) {
                    return {
                        ...g,
                        tasks: g.tasks.map(t => t.id === taskId ? { ...t, completed: isCompleted(newStatus, t.completed) } : t)
                    };
                }
                return g;
            }));
        } else if (source === 'subject') {
            setSubjects(subjects.map(s => {
                if (s.id === parentId) {
                    const updatedTasks = s.tasks.map(t => t.id === taskId ? { ...t, completed: isCompleted(newStatus, t.completed) } : t);
                    const completed = updatedTasks.filter(t => t.completed).length;
                    const progress = Math.round((completed / updatedTasks.length) * 100);
                    return { ...s, tasks: updatedTasks, progress };
                }
                return s;
            }));
        } else if (source === 'resource') {
            setResources(resources.map(r => {
                if (r.id === parentId) {
                    return {
                        ...r,
                        tasks: r.tasks.map(t => t.id === taskId ? { ...t, completed: isCompleted(newStatus, t.completed) } : t)
                    };
                }
                return r;
            }));
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
        name: "Visitante",
        email: "",
        whatsapp: "",
        photo: null,
        onboardingCompleted: false
    });

    // Supabase Auth Integration
    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                // If logged in via Supabase, we could load data from a 'profiles' table here
                // For now, we mix with localStorage
                const savedUser = localStorage.getItem("mf_user_data");
                if (savedUser) {
                    setUserData({ ...JSON.parse(savedUser), email: session.user.email });
                } else {
                    setUserData(prev => ({ ...prev, email: session.user.email }));
                }
            } else {
                // No session, maybe check local storage for 'offline' user or legacy
                const savedUser = localStorage.getItem("mf_user_data");
                if (savedUser) setUserData(JSON.parse(savedUser));
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                const savedUser = localStorage.getItem("mf_user_data");
                if (savedUser) {
                    setUserData({ ...JSON.parse(savedUser), email: session.user.email });
                } else {
                    setUserData(prev => ({ ...prev, email: session.user.email }));
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const updateUserData = (data: Partial<UserData>) => {
        setUserData(prev => {
            const newState = { ...prev, ...data };
            localStorage.setItem("mf_user_data", JSON.stringify(newState));
            return newState;
        });
    };

    const login = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
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
        // Also update local user data temporarily
        updateUserData({ name, email });
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        setUserData({ name: "", onboardingCompleted: false });
    };

    return (
        <GlobalDataContext.Provider value={{
            // User Data
            userData, updateUserData,
            login, signup, logout,

            // Health
            gymRoutines, runSessions, dietMeals, generalRoutines, fastingState, sleepLogs,
            addGymRoutine, updateGymRoutine, deleteGymRoutine, toggleGymCompletion,
            addRunSession, updateRunSession, deleteRunSession, toggleRunCompletion,
            addMeal, updateMeal, deleteMeal,
            addGeneralRoutine, updateGeneralRoutine, deleteGeneralRoutine,
            updateFastingState, addSleepLog,
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
