export type ParadoxStatus = 'active' | 'resolved' | 'expired';

export type ResolutionType = 'individual' | 'collaborative' | 'guild';

export interface ResolutionRequirement {
  type: 'time' | 'action' | 'social' | 'ar';
  value: number | string;
  description: string;
}

export interface ResolutionProgress {
  current: number;
  required: number;
  contributors?: string[]; // User IDs
}

export interface ResolutionData {
  type: ResolutionType;
  requirements: ResolutionRequirement[];
  progress: ResolutionProgress;
  completed_at?: Date;
  reward?: {
    experience: number;
    time_score: number;
    items?: any[];
  };
}

export interface TimeParadox {
  id: string;
  habit_id: string;
  user_id: string;
  severity: number; // 1-5
  status: ParadoxStatus;
  expires_at: Date;
  resolved_at?: Date;
  resolution_data: ResolutionData;
  created_at: Date;
  updated_at: Date;
}

export type CreateTimeParadoxDTO = Omit<
  TimeParadox,
  'id' | 'status' | 'resolved_at' | 'created_at' | 'updated_at'
>;

export type UpdateTimeParadoxDTO = Partial<
  Omit<TimeParadox, 'id' | 'habit_id' | 'user_id' | 'created_at' | 'updated_at'>
>;

export interface ParadoxEffect {
  type: 'time_score' | 'streak' | 'experience' | 'global';
  value: number;
  duration?: number; // in hours
  description: string;
}

export interface ParadoxWithEffects extends TimeParadox {
  effects: ParadoxEffect[];
  habit: {
    title: string;
    frequency: string;
    streak: number;
  };
  user: {
    username: string;
    time_score: number;
  };
}

export interface GlobalParadoxStats {
  active_paradoxes: number;
  resolved_today: number;
  average_resolution_time: number;
  severity_distribution: { [key: number]: number };
  most_affected_habits: Array<{
    habit_id: string;
    title: string;
    paradox_count: number;
  }>;
  global_stability: number; // 0-100
} 