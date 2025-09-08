import { QuestSystem } from './QuestSystem';

export interface DialogueOption {
  id: string;
  text: string;
  action?: 'start_quest' | 'continue_quest' | 'complete_quest' | 'shop' | 'teleport';
  questId?: string;
  objectiveId?: string;
  nextDialogue?: string;
  requirements?: {
    questStatus?: 'not_started' | 'in_progress' | 'completed';
    questId?: string;
    hasItems?: { itemId: string; quantity: number }[];
  };
}

export interface DialogueNode {
  id: string;
  npcId: string;
  text: string;
  options: DialogueOption[];
  autoOptions?: DialogueOption[]; // Options shown automatically without player choice
}

export interface NPCDialogue {
  npcId: string;
  name: string;
  defaultDialogue: DialogueNode;
  questDialogues: Record<string, DialogueNode[]>; // questId -> dialogue chain
}

export class DialogueSystem {
  private static instance: DialogueSystem;
  private npcs: Map<string, NPCDialogue> = new Map();
  private questSystem: QuestSystem;

  private constructor() {
    this.questSystem = QuestSystem.getInstance();
    this.initializeNPCs();
  }

  public static getInstance(): DialogueSystem {
    if (!DialogueSystem.instance) {
      DialogueSystem.instance = new DialogueSystem();
    }
    return DialogueSystem.instance;
  }

  private initializeNPCs(): void {
    // Cook NPC for Cook's Assistant quest
    const cookDialogue: NPCDialogue = {
      npcId: 'cook',
      name: 'Cook',
      defaultDialogue: {
        id: 'cook_default',
        npcId: 'cook',
        text: "Hello! I work in the kitchen of Lumbridge castle.",
        options: [
          {
            id: 'ask_about_job',
            text: "What do you do here?",
            nextDialogue: 'cook_job_info'
          },
          {
            id: 'goodbye',
            text: "Goodbye.",
            nextDialogue: 'end'
          }
        ]
      },
      questDialogues: {
        'cooks_assistant': [
          {
            id: 'cook_quest_start',
            npcId: 'cook',
            text: "Hello! I'm in a terrible mess. The Duke wants me to make him a birthday cake, but I've forgotten to buy some of the ingredients!",
            options: [
              {
                id: 'offer_help',
                text: "Can I help you?",
                action: 'start_quest',
                questId: 'cooks_assistant',
                nextDialogue: 'cook_quest_accept'
              },
              {
                id: 'not_interested',
                text: "That's not my problem.",
                nextDialogue: 'end'
              }
            ]
          },
          {
            id: 'cook_quest_accept',
            npcId: 'cook',
            text: "Great! I need milk, an egg, and flour. Please bring them to me as quickly as you can!",
            options: [
              {
                id: 'understand',
                text: "I'll get those ingredients for you.",
                nextDialogue: 'end'
              }
            ]
          },
          {
            id: 'cook_quest_progress',
            npcId: 'cook',
            text: "Have you brought me the ingredients I need? I need milk, an egg, and flour.",
            options: [
              {
                id: 'deliver_ingredients',
                text: "Yes, I have everything!",
                action: 'complete_quest',
                questId: 'cooks_assistant',
                requirements: {
                  hasItems: [
                    { itemId: 'bucket_of_milk', quantity: 1 },
                    { itemId: 'egg', quantity: 1 },
                    { itemId: 'pot_of_flour', quantity: 1 }
                  ]
                },
                nextDialogue: 'cook_quest_complete'
              },
              {
                id: 'not_ready',
                text: "Not yet, I'm still gathering them.",
                nextDialogue: 'cook_quest_reminder'
              }
            ]
          },
          {
            id: 'cook_quest_complete',
            npcId: 'cook',
            text: "Wonderful! I can make the cake now. The Duke will be so pleased! Here's a little something for your trouble.",
            options: [
              {
                id: 'thank_you',
                text: "Thank you!",
                nextDialogue: 'end'
              }
            ]
          }
        ]
      }
    };

    // Fred the Farmer for Sheep Shearer quest
    const fredDialogue: NPCDialogue = {
      npcId: 'fred_farmer',
      name: 'Fred the Farmer',
      defaultDialogue: {
        id: 'fred_default',
        npcId: 'fred_farmer',
        text: "Hello there! I'm Fred the Farmer. I look after the sheep here.",
        options: [
          {
            id: 'ask_about_sheep',
            text: "Tell me about your sheep.",
            nextDialogue: 'fred_sheep_info'
          },
          {
            id: 'goodbye',
            text: "Goodbye.",
            nextDialogue: 'end'
          }
        ]
      },
      questDialogues: {
        'sheep_shearer': [
          {
            id: 'fred_quest_start',
            npcId: 'fred_farmer',
            text: "I'm afraid I have rather a problem. I am a sheep farmer but I need to get my sheep sheared before I can sell the wool.",
            options: [
              {
                id: 'offer_help',
                text: "I could shear your sheep for you.",
                action: 'start_quest',
                questId: 'sheep_shearer',
                nextDialogue: 'fred_quest_accept'
              },
              {
                id: 'not_interested',
                text: "Sorry, I'm too busy.",
                nextDialogue: 'end'
              }
            ]
          },
          {
            id: 'fred_quest_accept',
            npcId: 'fred_farmer',
            text: "Please could you shear my sheep for me? I need 20 balls of wool. You'll need shears to do it.",
            options: [
              {
                id: 'understand',
                text: "I'll get right on it!",
                nextDialogue: 'end'
              }
            ]
          },
          {
            id: 'fred_quest_progress',
            npcId: 'fred_farmer',
            text: "How are you getting on with shearing my sheep? I need 20 balls of wool.",
            options: [
              {
                id: 'deliver_wool',
                text: "I have your wool!",
                action: 'complete_quest',
                questId: 'sheep_shearer',
                requirements: {
                  hasItems: [
                    { itemId: 'ball_of_wool', quantity: 20 }
                  ]
                },
                nextDialogue: 'fred_quest_complete'
              },
              {
                id: 'still_working',
                text: "I'm still working on it.",
                nextDialogue: 'fred_quest_reminder'
              }
            ]
          },
          {
            id: 'fred_quest_complete',
            npcId: 'fred_farmer',
            text: "Thank you so much! Here's some money for your help, and you can keep some wool for yourself.",
            options: [
              {
                id: 'thank_you',
                text: "You're welcome!",
                nextDialogue: 'end'
              }
            ]
          }
        ]
      }
    };

    this.npcs.set('cook', cookDialogue);
    this.npcs.set('fred_farmer', fredDialogue);

    console.log('Dialogue system initialized with NPCs');
  }

  /**
   * Get dialogue for an NPC based on quest status
   */
  public getDialogue(npcId: string): DialogueNode | null {
    const npc = this.npcs.get(npcId);
    if (!npc) return null;

    // Check if this NPC has quest-specific dialogues
    for (const [questId, questDialogues] of Object.entries(npc.questDialogues)) {
      const questProgress = this.questSystem.getQuestProgress(questId);
      
      if (!questProgress) {
        // Quest not started - show start dialogue
        const startDialogue = questDialogues.find(d => d.id.includes('start'));
        if (startDialogue) return startDialogue;
      } else if (questProgress.status === 'in_progress') {
        // Quest in progress - show progress dialogue
        const progressDialogue = questDialogues.find(d => d.id.includes('progress'));
        if (progressDialogue) return progressDialogue;
      } else if (questProgress.status === 'completed') {
        // Quest completed - might have different dialogue
        const completedDialogue = questDialogues.find(d => d.id.includes('completed'));
        if (completedDialogue) return completedDialogue;
      }
    }

    // Default dialogue
    return npc.defaultDialogue;
  }

  /**
   * Process a dialogue option selection
   */
  public selectOption(npcId: string, optionId: string): {
    success: boolean;
    message?: string;
    nextDialogue?: DialogueNode | null;
  } {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return { success: false, message: 'NPC not found' };
    }

    // Find the option across all dialogues
    let selectedOption: DialogueOption | null = null;

    // Search in default dialogue
    const defaultOption = npc.defaultDialogue.options.find(opt => opt.id === optionId);
    if (defaultOption) {
      selectedOption = defaultOption;
    }

    // Search in quest dialogues
    if (!selectedOption) {
      for (const questDialogues of Object.values(npc.questDialogues)) {
        for (const dialogue of questDialogues) {
          const option = dialogue.options.find(opt => opt.id === optionId);
          if (option) {
            selectedOption = option;
            break;
          }
        }
        if (selectedOption) break;
      }
    }

    if (!selectedOption) {
      return { success: false, message: 'Option not found' };
    }

    // Process the action
    if (selectedOption.action) {
      switch (selectedOption.action) {
        case 'start_quest':
          if (selectedOption.questId) {
            const started = this.questSystem.startQuest(selectedOption.questId);
            if (!started) {
              return { success: false, message: 'Could not start quest' };
            }
          }
          break;
        case 'complete_quest':
          if (selectedOption.questId) {
            // Check requirements first
            if (selectedOption.requirements?.hasItems) {
              // This would need to check player inventory
              // For now, assume requirements are met
            }
            
            const completed = this.questSystem.completeQuest(selectedOption.questId);
            if (!completed) {
              return { success: false, message: 'Could not complete quest' };
            }
          }
          break;
      }
    }

    // Get next dialogue
    let nextDialogue: DialogueNode | null = null;
    if (selectedOption.nextDialogue && selectedOption.nextDialogue !== 'end') {
      nextDialogue = this.getDialogue(npcId);
    }

    return {
      success: true,
      message: 'Option processed successfully',
      nextDialogue
    };
  }

  /**
   * Register a new NPC dialogue
   */
  public registerNPC(npcDialogue: NPCDialogue): void {
    this.npcs.set(npcDialogue.npcId, npcDialogue);
    console.log(`Registered dialogue for NPC: ${npcDialogue.name}`);
  }
}

export default DialogueSystem;
