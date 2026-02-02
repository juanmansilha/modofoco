export const FOCO_POINTS = {
    // Fitness
    COMPLETE_WORKOUT: 10,
    COMPLETE_RUN: 10,
    GENERATE_AI_WORKOUT: 2,

    // Tasks
    COMPLETE_TASK: 3,
    ADD_TASK: 2,

    // Health
    COMPLETE_FASTING: 15,
    REGISTER_SLEEP: 5,
    ADD_MEAL: 2,

    // Goals & Routines
    COMPLETE_GOAL: 30,
    COMPLETE_ROUTINE_PARTIAL: 5,
    COMPLETE_ROUTINE_FULL: 10,

    // Study
    COMPLETE_STUDY_SESSION: 15,

    // Vault
    ADD_VAULT_ITEM: 2,

    // Finance
    ADD_FINANCE_ENTRY: 2,
    FINANCE_MONTH_GREEN: 20,

    // General
    DAILY_LOGIN: 2,
} as const;

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000, 5000]; // Adjusting thresholds for lower point values
