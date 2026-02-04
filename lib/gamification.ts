export const FOCO_POINTS = {
    // Tasks
    TASK_SIMPLE: 3,    // Max 5 per day
    TASK_MEDIUM: 5,    // 30-90 mins
    TASK_HARD: 8,      // High mental load
    DAILY_GOAL: 20,    // Key tasks completed

    // Study
    STUDY_SESSION: 15, // 25 min pomodoro
    STUDY_BONUS: 5,    // 2+ sessions in a day
    STUDY_STREAK_7: 20,

    // Health
    WORKOUT_RUN: 12,
    FASTING: 15,
    SLEEP: 3,
    FOOD_LOG: 3,

    // Routine
    DAILY_LOGIN: 2,
    STREAK_7: 10,
    STREAK_30: 40,
    PERFECT_DAY: 15, // Routine + Workout + Study
} as const;

export const ANTI_FARM = {
    MIN_TASK_DURATION_MINUTES: 5,
    MAX_SIMPLE_TASKS_PER_DAY: 5,
};

export const LEVELS = [
    { level: 1, name: "Iniciado", minFP: 0, color: "#B0B0B0", text: "text-[#B0B0B0]", bg: "bg-[#B0B0B0]" },
    { level: 2, name: "Desperto", minFP: 150, color: "#5DA9E9", text: "text-[#5DA9E9]", bg: "bg-[#5DA9E9]" },
    { level: 3, name: "Consistente", minFP: 350, color: "#4CAF50", text: "text-[#4CAF50]", bg: "bg-[#4CAF50]" },
    { level: 4, name: "Determinado", minFP: 650, color: "#FFC107", text: "text-[#FFC107]", bg: "bg-[#FFC107]" },
    { level: 5, name: "Focado", minFP: 1000, color: "#FF9800", text: "text-[#FF9800]", bg: "bg-[#FF9800]" },
    { level: 6, name: "Disciplinado", minFP: 1500, color: "#F44336", text: "text-[#F44336]", bg: "bg-[#F44336]" },
    { level: 7, name: "Estrategista", minFP: 2200, color: "#7E57C2", text: "text-[#7E57C2]", bg: "bg-[#7E57C2]" },
    { level: 8, name: "Alta Performance", minFP: 3200, color: "#1E3A8A", text: "text-[#1E3A8A]", bg: "bg-[#1E3A8A]" },
    { level: 9, name: "Elite", minFP: 4500, color: "#000000", text: "text-zinc-400", bg: "bg-zinc-900" }, // Special style
    { level: 10, name: "Modo Foco", minFP: 6000, color: "#FFD700", text: "text-[#FFD700]", bg: "bg-[#FFD700]" },
    { level: 11, name: "Lendário", minFP: 8500, color: "gold-gradient", text: "text-amber-200", bg: "bg-gradient-to-r from-amber-200 to-yellow-500" },
    { level: 12, name: "VIP", minFP: 12000, color: "vip-gradient", text: "text-indigo-300", bg: "bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500" },
];

export const REWARDS_CATALOG = [
    { id: "plaque", title: "Placa ModoFoco", cost: 1000, type: "physical" },
    { id: "squeeze", title: "Squeeze ModoFoco", cost: 1200, type: "physical" },
    { id: "mug", title: "Caneca ModoFoco", cost: 1500, type: "physical" },
    { id: "hoodie", title: "Moletom ModoFoco", cost: 2500, type: "physical" },
    { id: "kit", title: "Kit Completo", cost: 4000, type: "physical" },
];
