import type { 
  Quest, 
  QuestObjective, 
  QuestStage, 
  QuestStatus, 
  PlayerQuestProgress, 
  QuestRequirement,
  QuestReward 
} from '../types/quest';
import type { PlayerStats } from '../store/gameStore';
import type { InventorySlot } from '../types/inventory';

export class QuestSystem {
  private static instance: QuestSystem;
  private quests: Map<string, Quest> = new Map();
  private playerProgress: Map<string, PlayerQuestProgress> = new Map();
  
  private constructor() {
    this.initializeQuests();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): QuestSystem {
    if (!QuestSystem.instance) {
      QuestSystem.instance = new QuestSystem();
    }
    return QuestSystem.instance;
  }

  /**
   * Initialize all available quests
   */
  private initializeQuests(): void {
    // Import and register default quests
    import('../data/quests').then(({ COOKS_ASSISTANT, SHEEP_SHEARER }) => {
      this.registerQuest(COOKS_ASSISTANT);
      this.registerQuest(SHEEP_SHEARER);
      console.log('Quest system initialized with default quests');
    });
  }

  /**
   * Register a quest in the system
   */
  public registerQuest(quest: Quest): void {
    this.quests.set(quest.id, quest);
    console.log(`Quest registered: ${quest.name}`);
  }

  /**
   * Get a quest by ID
   */
  public getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }

  /**
   * Get all available quests
   */
  public getAllQuests(): Quest[] {
    return Array.from(this.quests.values());
  }

  /**
   * Get quests that the player can start (meets requirements)
   */
  public getAvailableQuests(playerStats: PlayerStats, playerInventory: InventorySlot[], completedQuests: string[]): Quest[] {
    return this.getAllQuests().filter(quest => {
      // Skip if already completed
      if (completedQuests.includes(quest.id)) {
        return false;
      }

      // Skip if already in progress
      if (this.getQuestStatus(quest.id) === 'in_progress') {
        return false;
      }

      // Check requirements
      return this.checkRequirements(quest.requirements, playerStats, playerInventory, completedQuests);
    });
  }

  /**
   * Check if player meets quest requirements
   */
  public checkRequirements(
    requirements: QuestRequirement[], 
    playerStats: PlayerStats, 
    playerInventory: InventorySlot[], 
    completedQuests: string[]
  ): boolean {
    return requirements.every(req => {
      switch (req.type) {
        case 'level': {
          return req.skill && req.skill in playerStats 
            ? playerStats[req.skill as keyof PlayerStats] >= req.level!
            : false;
        }
        
        case 'quest': {
          return completedQuests.includes(req.questId!);
        }
        
        case 'item': {
          const item = playerInventory.find(slot => 
            slot?.item?.id === req.itemId && (slot?.item?.quantity || 0) >= (req.quantity || 1)
          );
          return !!item;
        }
        
        case 'location': {
          // Would need to check player's current location
          return true; // Placeholder
        }
        
        default: {
          return true;
        }
      }
    });
  }

  /**
   * Start a quest
   */
  public startQuest(questId: string): boolean {
    const quest = this.getQuest(questId);
    if (!quest) {
      console.error(`Quest not found: ${questId}`);
      return false;
    }

    // Check if already started or completed
    const existingProgress = this.playerProgress.get(questId);
    if (existingProgress) {
      console.log(`Quest ${quest.name} is already ${existingProgress.status}`);
      return false;
    }

    // Create initial progress
    const progress: PlayerQuestProgress = {
      questId,
      status: 'in_progress',
      currentStage: quest.stages[0].id,
      completedStages: [],
      completedObjectives: [],
      objectiveProgress: {},
      completed: false,
      startedAt: new Date(),
      variables: {}
    };

    this.playerProgress.set(questId, progress);
    console.log(`Started quest: ${quest.name}`);
    
    return true;
  }

  /**
   * Get quest status for a player
   */
  public getQuestStatus(questId: string): QuestStatus {
    const progress = this.playerProgress.get(questId);
    return progress?.status || 'not_started';
  }

  /**
   * Get player's quest progress
   */
  public getQuestProgress(questId: string): PlayerQuestProgress | undefined {
    return this.playerProgress.get(questId);
  }

  /**
   * Update objective progress
   */
  public updateObjectiveProgress(questId: string, objectiveId: string, progress: number = 1): boolean {
    const questProgress = this.playerProgress.get(questId);
    if (!questProgress || questProgress.status !== 'in_progress') {
      return false;
    }

    const quest = this.getQuest(questId);
    if (!quest) return false;

    // Find the objective in current stage
    const currentStage = quest.stages.find(stage => stage.id === questProgress.currentStage);
    if (!currentStage) return false;

    const objective = currentStage.objectives.find(obj => obj.id === objectiveId);
    if (!objective) return false;

    // Update progress
    objective.currentProgress = (objective.currentProgress || 0) + progress;
    
    // Check if objective is complete
    const requiredQuantity = objective.quantity || 1;
    if (objective.currentProgress >= requiredQuantity) {
      objective.completed = true;
      if (!questProgress.completedObjectives.includes(objectiveId)) {
        questProgress.completedObjectives.push(objectiveId);
      }
      console.log(`Objective completed: ${objective.description}`);
      
      // Check if all objectives in current stage are complete
      this.checkStageCompletion(questId);
    }

    return true;
  }

  /**
   * Check if current stage is complete and advance if needed
   */
  private checkStageCompletion(questId: string): void {
    const questProgress = this.playerProgress.get(questId);
    const quest = this.getQuest(questId);
    
    if (!questProgress || !quest) return;

    const currentStage = quest.stages.find(stage => stage.id === questProgress.currentStage);
    if (!currentStage) return;

    // Check if all objectives are complete
    const allObjectivesComplete = currentStage.objectives.every(obj => obj.completed);
    
    if (allObjectivesComplete) {
      // Mark stage as complete
      if (!questProgress.completedStages.includes(currentStage.id)) {
        questProgress.completedStages.push(currentStage.id);
      }

      console.log(`Stage completed: ${currentStage.name}`);

      // Find next stage
      const currentStageIndex = quest.stages.findIndex(stage => stage.id === currentStage.id);
      const nextStage = quest.stages[currentStageIndex + 1];

      if (nextStage) {
        // Advance to next stage
        questProgress.currentStage = nextStage.id;
        console.log(`Advanced to stage: ${nextStage.name}`);
      } else {
        // Quest is complete
        this.completeQuest(questId);
      }
    }
  }

  /**
   * Complete a quest
   */
  public completeQuest(questId: string): boolean {
    const questProgress = this.playerProgress.get(questId);
    const quest = this.getQuest(questId);
    
    if (!questProgress || !quest) return false;

    questProgress.status = 'completed';
    questProgress.completed = true;
    questProgress.completedAt = new Date();

    console.log(`Quest completed: ${quest.name}`);
    console.log(`Rewards: ${quest.rewards.length} reward(s)`);

    // Apply rewards would be handled by the game engine
    return true;
  }

  /**
   * Get current stage for a quest
   */
  public getCurrentStage(questId: string): QuestStage | undefined {
    const questProgress = this.playerProgress.get(questId);
    const quest = this.getQuest(questId);
    
    if (!questProgress || !quest || questProgress.status !== 'in_progress') {
      return undefined;
    }

    return quest.stages.find(stage => stage.id === questProgress.currentStage);
  }

  /**
   * Get active objectives for current stage
   */
  public getActiveObjectives(questId: string): QuestObjective[] {
    const currentStage = this.getCurrentStage(questId);
    if (!currentStage) return [];

    return currentStage.objectives.filter(obj => !obj.completed && !obj.hidden);
  }

  /**
   * Check if an action triggers quest progress
   */
  public checkQuestTrigger(
    action: string, 
    targetId: string, 
    quantity: number = 1
  ): void {
    // Check all active quests for matching objectives
    for (const [questId, progress] of this.playerProgress) {
      if (progress.status !== 'in_progress') continue;

      const activeObjectives = this.getActiveObjectives(questId);
      
      for (const objective of activeObjectives) {
        if (this.objectiveMatches(objective, action, targetId)) {
          this.updateObjectiveProgress(questId, objective.id, quantity);
        }
      }
    }
  }

  /**
   * Check if an objective matches an action
   */
  private objectiveMatches(objective: QuestObjective, action: string, targetId: string): boolean {
    // Map actions to objective types
    const actionMap: Record<string, string[]> = {
      'talk': ['talk'],
      'kill': ['kill'],
      'collect': ['collect'],
      'deliver': ['deliver'],
      'use': ['use'],
      'visit': ['visit'],
      'craft': ['craft']
    };

    const matchingTypes = actionMap[action] || [];
    if (!matchingTypes.includes(objective.type)) {
      return false;
    }

    // Check if target matches
    return objective.targetId === targetId || objective.targetName === targetId;
  }

  /**
   * Get all quests in progress
   */
  public getActiveQuests(): PlayerQuestProgress[] {
    return Array.from(this.playerProgress.values())
      .filter(progress => progress.status === 'in_progress');
  }

  /**
   * Get completed quests
   */
  public getCompletedQuests(): string[] {
    return Array.from(this.playerProgress.values())
      .filter(progress => progress.status === 'completed')
      .map(progress => progress.questId);
  }

  /**
   * Apply quest rewards
   */
  public applyQuestRewards(questId: string, applyRewardFunction: (reward: QuestReward) => void): void {
    const quest = this.getQuest(questId);
    if (!quest) return;

    quest.rewards.forEach(reward => {
      applyRewardFunction(reward);
    });
  }

  /**
   * Get quest completion percentage
   */
  public getQuestCompletionPercentage(): number {
    const totalQuests = this.quests.size;
    if (totalQuests === 0) return 0;

    const completedCount = this.getCompletedQuests().length;
    return Math.round((completedCount / totalQuests) * 100);
  }

  /**
   * Get total quest points earned
   */
  public getTotalQuestPoints(): number {
    return this.getCompletedQuests().reduce((total, questId) => {
      const quest = this.getQuest(questId);
      return total + (quest?.questPoints || 0);
    }, 0);
  }
}

export default QuestSystem;
