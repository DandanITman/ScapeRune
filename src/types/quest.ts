export type QuestDifficulty = 'Beginner' | 'Intermediate' | 'Experienced' | 'Master';
export type QuestCategory = 'Free' | 'Members' | 'Miniquest';

export interface QuestRequirement {
  type: 'level' | 'quest' | 'item' | 'location' | 'skill';
  skill?: string;
  level?: number;
  questId?: string;
  itemId?: string;
  quantity?: number;
  location?: string;
}

export interface QuestReward {
  type: 'experience' | 'item' | 'access' | 'money';
  skill?: string;
  amount?: number;
  itemId?: string;
  quantity?: number;
  accessType?: 'area' | 'shop' | 'npc' | 'feature';
  accessId?: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'talk' | 'kill' | 'collect' | 'deliver' | 'use' | 'visit' | 'craft';
  targetId?: string; // NPC ID, item ID, location ID, etc.
  targetName?: string;
  quantity?: number;
  currentProgress?: number;
  completed: boolean;
  hidden?: boolean; // For objectives that shouldn't be shown until previous ones are complete
}

export interface QuestStage {
  id: string;
  name: string;
  description: string;
  objectives: QuestObjective[];
  dialogue?: {
    npcId: string;
    beforeText?: string; // Text shown before objectives are complete
    afterText?: string;  // Text shown after objectives are complete
  };
  autoComplete?: boolean; // Whether stage completes automatically when all objectives done
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  difficulty: QuestDifficulty;
  questPoints: number;
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  stages: QuestStage[];
  startNpcId: string;
  category: QuestCategory;
  released?: string; // Release date for authenticity
  originalLength?: 'Short' | 'Medium' | 'Long' | 'Very Long';
}

export type QuestStatus = 'not_started' | 'in_progress' | 'completed';

export interface PlayerQuestProgress {
  questId: string;
  status: QuestStatus;
  currentStage: string;
  completedStages: string[];
  completedObjectives: string[];
  objectiveProgress: Record<string, number>; // objective ID -> progress count
  completed: boolean; // convenience property for quick checks
  startedAt?: Date;
  completedAt?: Date;
  variables?: Record<string, any>; // For quest-specific variables
}

export interface QuestRewardState {
  questId: string;
  rewarded: boolean;
  rewardedAt?: Date;
}

// Quest line / series support
export interface QuestSeries {
  id: string;
  name: string;
  description: string;
  questIds: string[]; // Ordered list of quest IDs
  overallRewards?: QuestReward[]; // Additional rewards for completing entire series
}

export type { Quest as default };
