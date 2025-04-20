export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface TimeWindow {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface WeeklySchedule {
  days: number[]; // 0-6 (Sunday-Saturday)
  timeWindows: TimeWindow[];
}

export interface MonthlySchedule {
  days: number[]; // 1-31
  timeWindows: TimeWindow[];
}

export interface Schedule {
  frequency: Frequency;
  timeWindows?: TimeWindow[];
  weeklySchedule?: WeeklySchedule;
  monthlySchedule?: MonthlySchedule;
  timezone: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: Frequency;
  schedule: Schedule;
  streak: number;
  level: number;
  experience_points: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type CreateHabitDTO = Omit<
  Habit,
  'id' | 'streak' | 'level' | 'experience_points' | 'created_at' | 'updated_at'
>;

export type UpdateHabitDTO = Partial<
  Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;

export interface HabitProgress {
  habit_id: string;
  completion_rate: number;
  current_streak: number;
  best_streak: number;
  total_completions: number;
  time_paradoxes: number;
  level: number;
  experience_points: number;
  next_level_threshold: number;
}

export interface HabitWithProgress extends Habit {
  progress: HabitProgress;
}

export interface HabitStats {
  total_habits: number;
  active_habits: number;
  completed_today: number;
  current_streaks: { [key: string]: number };
  time_paradoxes: number;
  total_experience: number;
  average_completion_rate: number;
} 