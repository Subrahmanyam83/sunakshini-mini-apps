"use client";

import { useState, useEffect, useCallback } from "react";

export type ActivityLevel = "sedentary" | "lightly_active" | "moderately_active" | "very_active";

export type FamilyMember = {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
};

export type FoodItem = {
  fdcId: string;
  name: string;
  portionGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: string;
  type: MealType;
  foods: FoodItem[];
};

export type DailyLog = {
  date: string;
  memberId: string;
  meals: Meal[];
  waterMl?: number;
};

export type NutritionData = {
  members: FamilyMember[];
  logs: DailyLog[];
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
};

/** Mifflin-St Jeor BMR, then multiply by activity factor = TDEE */
export function calcTDEE(member: FamilyMember): number {
  const { age, gender, weightKg, heightCm, activityLevel } = member;
  const bmr =
    gender === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/** MET-based hours needed to burn `kcal` for a given body weight */
export type BurnOption = { label: string; hours: number; minutes: number };

export function calcBurnOptions(kcal: number, weightKg: number): BurnOption[] {
  if (kcal <= 0) return [];
  const options = [
    { label: "Walking", met: 3.5 },
    { label: "Home exercises", met: 5.0 },
    { label: "Gym workout", met: 7.0 },
  ];
  return options.map(({ label, met }) => {
    const hoursRaw = kcal / (met * weightKg);
    const totalMins = Math.round(hoursRaw * 60);
    return { label, hours: Math.floor(totalMins / 60), minutes: totalMins % 60 };
  });
}

export function sumMealCalories(meals: Meal[]): number {
  return meals.reduce(
    (acc, meal) => acc + meal.foods.reduce((a, f) => a + f.calories, 0),
    0
  );
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function useNutrition() {
  const [data, setData] = useState<NutritionData | null>(null);
  const [sha, setSha] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/nutrition");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data);
      setSha(json.sha);
    } catch {
      setError("Failed to load nutrition data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveData = useCallback(async (next: NutritionData) => {
    const res = await fetch("/api/nutrition", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: next, sha }),
    });
    if (!res.ok) throw new Error("Failed to save");
    const json = await res.json();
    setSha(json.sha);
    setData(next);
  }, [sha]);

  const addMember = useCallback(async (member: Omit<FamilyMember, "id">) => {
    if (!data) return;
    const next: NutritionData = {
      ...data,
      members: [...data.members, { ...member, id: crypto.randomUUID() }],
    };
    await saveData(next);
  }, [data, saveData]);

  const updateMember = useCallback(async (member: FamilyMember) => {
    if (!data) return;
    const next: NutritionData = {
      ...data,
      members: data.members.map((m) => (m.id === member.id ? member : m)),
    };
    await saveData(next);
  }, [data, saveData]);

  const deleteMember = useCallback(async (memberId: string) => {
    if (!data) return;
    const next: NutritionData = {
      members: data.members.filter((m) => m.id !== memberId),
      logs: data.logs.filter((l) => l.memberId !== memberId),
    };
    await saveData(next);
  }, [data, saveData]);

  const getOrCreateLog = useCallback(
    (memberId: string, date: string): DailyLog => {
      if (!data) return { date, memberId, meals: [] };
      return (
        data.logs.find((l) => l.memberId === memberId && l.date === date) ?? {
          date,
          memberId,
          meals: [],
        }
      );
    },
    [data]
  );

  const saveLog = useCallback(async (log: DailyLog) => {
    if (!data) return;
    const existing = data.logs.findIndex(
      (l) => l.memberId === log.memberId && l.date === log.date
    );
    const logs =
      existing >= 0
        ? data.logs.map((l, i) => (i === existing ? log : l))
        : [...data.logs, log];
    await saveData({ ...data, logs });
  }, [data, saveData]);

  return {
    data,
    loading,
    error,
    fetchData,
    addMember,
    updateMember,
    deleteMember,
    getOrCreateLog,
    saveLog,
  };
}
