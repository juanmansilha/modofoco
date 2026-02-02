import { Routine, Exercise } from "@/components/health/WorkoutRoutine";

// --- Types ---

export type Goal = "hypertrophy" | "weight_loss" | "strength" | "general_health";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type MovementPattern =
    | "upper_push_horizontal"
    | "upper_push_vertical"
    | "upper_pull_horizontal"
    | "upper_pull_vertical"
    | "lower_knee"
    | "lower_hip"
    | "core_anti_extension"
    | "core_anti_rotation"
    | "carries"
    | "isolation_biceps"
    | "isolation_triceps"
    | "isolation_shoulder"
    | "isolation_calves"
    | "cardio";

interface ExerciseDef {
    id: string;
    name: string;
    pattern: MovementPattern;
    level: ExperienceLevel[]; // levels appropriate for
    equipment: string;
    isCompound: boolean;
}

// --- Database (Based on user request) ---

const EXERCISE_DB: ExerciseDef[] = [
    // Upper Push Horizontal (Chest)
    { id: "bench_press_bar", name: "Supino Reto com Barra", pattern: "upper_push_horizontal", level: ["intermediate", "advanced"], equipment: "barbell", isCompound: true },
    { id: "bench_press_db", name: "Supino Reto com Halteres", pattern: "upper_push_horizontal", level: ["beginner", "intermediate", "advanced"], equipment: "dumbbell", isCompound: true },
    { id: "incline_press_db", name: "Supino Inclinado com Halteres", pattern: "upper_push_horizontal", level: ["beginner", "intermediate", "advanced"], equipment: "dumbbell", isCompound: true },
    { id: "push_up", name: "Flexão de Braço", pattern: "upper_push_horizontal", level: ["beginner", "intermediate", "advanced"], equipment: "bodyweight", isCompound: true },
    { id: "chest_press_machine", name: "Máquina Chest Press", pattern: "upper_push_horizontal", level: ["beginner"], equipment: "machine", isCompound: true },
    { id: "fly_machine", name: "Peck Deck / Fly Máquina", pattern: "upper_push_horizontal", level: ["beginner", "intermediate", "advanced"], equipment: "machine", isCompound: false },

    // Upper Push Vertical (Shoulders)
    { id: "overhead_press_bar", name: "Desenvolvimento Militar Barra", pattern: "upper_push_vertical", level: ["intermediate", "advanced"], equipment: "barbell", isCompound: true },
    { id: "overhead_press_db", name: "Desenvolvimento com Halteres", pattern: "upper_push_vertical", level: ["beginner", "intermediate", "advanced"], equipment: "dumbbell", isCompound: true },
    { id: "shoulder_press_machine", name: "Máquina Desenvolvimento", pattern: "upper_push_vertical", level: ["beginner"], equipment: "machine", isCompound: true },

    // Upper Pull Horizontal (Rows)
    { id: "bent_over_row", name: "Remada Curvada", pattern: "upper_pull_horizontal", level: ["intermediate", "advanced"], equipment: "barbell", isCompound: true },
    { id: "db_row", name: "Remada Unilateral (Serrote)", pattern: "upper_pull_horizontal", level: ["beginner", "intermediate", "advanced"], equipment: "dumbbell", isCompound: true },
    { id: "cable_row", name: "Remada Baixa (Polia)", pattern: "upper_pull_horizontal", level: ["beginner", "intermediate", "advanced"], equipment: "cable", isCompound: true },
    { id: "machine_row", name: "Remada Máquina", pattern: "upper_pull_horizontal", level: ["beginner"], equipment: "machine", isCompound: true },

    // Upper Pull Vertical (Lats)
    { id: "pull_up", name: "Barra Fixa (Pull-up)", pattern: "upper_pull_vertical", level: ["intermediate", "advanced"], equipment: "bodyweight", isCompound: true },
    { id: "lat_pulldown", name: "Puxada Alta (Polia)", pattern: "upper_pull_vertical", level: ["beginner", "intermediate", "advanced"], equipment: "cable", isCompound: true },

    // Lower Knee Dominant (Quads)
    { id: "squat_bar", name: "Agachamento Livre", pattern: "lower_knee", level: ["intermediate", "advanced"], equipment: "barbell", isCompound: true },
    { id: "goblet_squat", name: "Agachamento Goblet", pattern: "lower_knee", level: ["beginner", "intermediate"], equipment: "dumbbell", isCompound: true },
    { id: "leg_press", name: "Leg Press 45º", pattern: "lower_knee", level: ["beginner", "intermediate", "advanced"], equipment: "machine", isCompound: true },
    { id: "lunges", name: "Passada / Avanço", pattern: "lower_knee", level: ["beginner", "intermediate", "advanced"], equipment: "dumbbell", isCompound: true },
    { id: "leg_extension", name: "Cadeira Extensora", pattern: "lower_knee", level: ["beginner", "intermediate", "advanced"], equipment: "machine", isCompound: false },

    // Lower Hip Dominant (Hams/Glutes)
    { id: "deadlift", name: "Levantamento Terra", pattern: "lower_hip", level: ["intermediate", "advanced"], equipment: "barbell", isCompound: true },
    { id: "rdl", name: "Stiff / RDL", pattern: "lower_hip", level: ["intermediate", "advanced"], equipment: "barbell", isCompound: true },
    { id: "hip_thrust", name: "Elevação Pélvica (Hip Thrust)", pattern: "lower_hip", level: ["intermediate", "advanced"], equipment: "barbell", isCompound: true },
    { id: "leg_curl", name: "Mesa Flexora", pattern: "lower_hip", level: ["beginner", "intermediate", "advanced"], equipment: "machine", isCompound: false },

    // Core
    { id: "plank", name: "Prancha Abdominal", pattern: "core_anti_extension", level: ["beginner", "intermediate", "advanced"], equipment: "bodyweight", isCompound: false },
    { id: "dead_bug", name: "Dead Bug", pattern: "core_anti_extension", level: ["beginner"], equipment: "bodyweight", isCompound: false },

    // Isolation Arms/Shoulders
    { id: "bicep_curl_bar", name: "Rosca Direta", pattern: "isolation_biceps", level: ["beginner", "intermediate", "advanced"], equipment: "barbell", isCompound: false },
    { id: "bicep_curl_db", name: "Rosca com Halteres", pattern: "isolation_biceps", level: ["beginner", "intermediate", "advanced"], equipment: "dumbbell", isCompound: false },
    { id: "tricep_pushdown", name: "Tríceps Pulley", pattern: "isolation_triceps", level: ["beginner", "intermediate", "advanced"], equipment: "cable", isCompound: false },
    { id: "lateral_raise", name: "Elevação Lateral", pattern: "isolation_shoulder", level: ["beginner", "intermediate", "advanced"], equipment: "dumbbell", isCompound: false },
    { id: "calf_raise", name: "Panturrilha em Pé", pattern: "isolation_calves", level: ["beginner", "intermediate", "advanced"], equipment: "machine", isCompound: false },
];

// --- Templates ---

interface DayTemplate {
    focusName: string; // e.g., "Full Body A", "Push Power"
    patterns: MovementPattern[];
}

// 3 Days: Full Body A/B/C
const SPLIT_3_DAY: DayTemplate[] = [
    {
        focusName: "Full Body A",
        patterns: ["lower_knee", "upper_push_horizontal", "upper_pull_horizontal", "isolation_shoulder", "isolation_biceps", "core_anti_extension"]
    },
    {
        focusName: "Full Body B",
        patterns: ["lower_hip", "upper_push_vertical", "upper_pull_vertical", "isolation_triceps", "core_anti_extension", "cardio"]
    },
    {
        focusName: "Full Body C",
        patterns: ["lower_knee", "upper_push_horizontal", "upper_pull_horizontal", "lower_hip", "isolation_calves", "core_anti_extension"]
    }
];

// 4 Days: Upper / Lower
const SPLIT_4_DAY: DayTemplate[] = [
    { focusName: "Upper A (Força)", patterns: ["upper_push_horizontal", "upper_pull_horizontal", "upper_push_vertical", "isolation_biceps", "isolation_triceps"] },
    { focusName: "Lower A (Agacho)", patterns: ["lower_knee", "lower_hip", "lower_knee", "isolation_calves", "core_anti_extension"] },
    { focusName: "Upper B (Hipertrofia)", patterns: ["upper_push_vertical", "upper_pull_vertical", "upper_push_horizontal", "isolation_shoulder", "isolation_biceps"] },
    { focusName: "Lower B (Terra)", patterns: ["lower_hip", "lower_knee", "lower_hip", "isolation_calves", "core_anti_extension"] },
];

// 5 Days: PPLUL (Push Pull Legs Upper Lower)
const SPLIT_5_DAY: DayTemplate[] = [
    { focusName: "Push (Empurrar)", patterns: ["upper_push_horizontal", "upper_push_vertical", "upper_push_horizontal", "isolation_triceps", "isolation_shoulder"] },
    { focusName: "Pull (Puxar)", patterns: ["lower_hip", "upper_pull_horizontal", "upper_pull_vertical", "upper_pull_horizontal", "isolation_biceps"] }, // Deadlift on Pull day variation
    { focusName: "Legs (Pernas)", patterns: ["lower_knee", "lower_hip", "lower_knee", "lower_knee", "isolation_calves"] },
    { focusName: "Upper (Superior)", patterns: ["upper_push_horizontal", "upper_pull_horizontal", "upper_push_vertical", "isolation_biceps", "isolation_triceps"] },
    { focusName: "Lower (Inferior)", patterns: ["lower_knee", "lower_hip", "lower_knee", "isolation_calves", "core_anti_extension"] },
];


// --- Helper Functions ---

function getExercisesForPattern(pattern: MovementPattern, level: ExperienceLevel, count: number, excludeIds: string[] = []): ExerciseDef[] {
    // Filter by pattern
    let candidates = EXERCISE_DB.filter(ex => ex.pattern === pattern);

    // Filter by level (easy logic: if user is beginner, allow only exercises formatted for beginner OR intermediate)
    // Actually, simple logic: check if ex.level includes user level
    // If empty after strict filter, relax to allow easier exercises
    const strictCandidates = candidates.filter(ex => ex.level.includes(level));
    if (strictCandidates.length > 0) candidates = strictCandidates;

    // Exclude used
    candidates = candidates.filter(ex => !excludeIds.includes(ex.id));

    // If running out, allow duplicates or fallback? For MVP, just reusing is ok if list small, but let's try not to.

    // Shuffle and slice
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getSetsReps(goal: Goal, isCompound: boolean): { sets: string; reps: string } {
    if (goal === "strength") {
        return isCompound ? { sets: "5", reps: "5" } : { sets: "3", reps: "8-10" };
    }
    if (goal === "hypertrophy") {
        return isCompound ? { sets: "4", reps: "8-10" } : { sets: "3", reps: "10-12" };
    }
    if (goal === "weight_loss") {
        return { sets: "3", reps: "12-15" }; // Circuit style ideally, but simplified here
    }
    // General / Beginner
    return { sets: "3", reps: "10-12" };
}

// --- Main Generator ---

interface GenerationInput {
    daysPerWeek: number;
    goal: Goal;
    level: ExperienceLevel;
}

export function generateWorkoutPlan(input: GenerationInput): Routine[] {
    const { daysPerWeek, goal, level } = input;

    // Select Split
    let split: DayTemplate[] = SPLIT_3_DAY;
    if (daysPerWeek === 2) split = SPLIT_3_DAY.slice(0, 2); // reuse full body
    else if (daysPerWeek === 3) split = SPLIT_3_DAY;
    else if (daysPerWeek === 4) split = SPLIT_4_DAY;
    else if (daysPerWeek >= 5) split = SPLIT_5_DAY; // Cap at 5 for this MVP database

    const routines: Routine[] = [];
    const usedExerciseIds: string[] = [];

    // Assign days of week based on simple logic (Mon, Wed, Fri etc)
    const dayLabels = daysPerWeek === 3 ? ["mon", "wed", "fri"]
        : daysPerWeek === 4 ? ["mon", "tue", "thu", "fri"]
            : ["mon", "tue", "wed", "thu", "fri"]; // 5 days

    split.forEach((dayTemplate, index) => {
        const exercises: import("@/components/health/WorkoutRoutine").Exercise[] = [];

        dayTemplate.patterns.forEach((pattern) => {
            const exerciseDefs = getExercisesForPattern(pattern, level, 1, []);
            // Note: Not modifying usedExerciseIds strictly to allow repeats across week (e.g. Squat twice a week is common)
            // But maybe avoid repeating in same session? Implementation above picks 1, so distinct per pattern slot.

            if (exerciseDefs.length > 0) {
                const exDef = exerciseDefs[0];
                const { sets, reps } = getSetsReps(goal, exDef.isCompound);

                exercises.push({
                    id: `gen-${Math.random().toString(36).substr(2, 5)}`,
                    name: exDef.name,
                    sets,
                    reps,
                    weight: "0kg", // User to fill
                    status: "pending"
                });
            }
        });

        routines.push({
            id: `plan-${Date.now()}-${index}`,
            name: `Treino ${String.fromCharCode(65 + index)}`,
            focus: dayTemplate.focusName,
            duration: "60 min",
            exercises,
            recurrence: [dayLabels[index] || ""] // Assign suggested day
        });
    });

    return routines;
}
