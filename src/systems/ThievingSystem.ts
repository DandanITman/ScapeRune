import type { InventoryItem } from '../types/inventory';

export interface ThievingTarget {
  id: string;
  name: string;
  type: 'npc' | 'chest' | 'stall';
  levelRequired: number;
  experience: number;
  successRate: number; // Base success rate (0-1)
  stunTime?: number; // Time stunned on failure (seconds)
  damage?: number; // Damage taken on failure
  lootTable: ThievingLoot[];
  respawnTime?: number; // For chests/stalls (seconds)
}

export interface ThievingLoot {
  itemId: string;
  name: string;
  quantity: { min: number; max: number };
  rarity: number; // 0-1, higher = more common
}

export interface ThievingResult {
  success: boolean;
  experience: number;
  loot?: InventoryItem;
  stunned?: boolean;
  stunTime?: number;
  damage?: number;
  message: string;
  leveledUp?: boolean;
  newLevel?: number;
}

export class ThievingSystem {
  private targets: Map<string, ThievingTarget> = new Map();
  private stunnedUntil: Map<string, number> = new Map(); // Player stun tracking
  private lastTheftAttempt: Map<string, number> = new Map(); // Cooldown tracking

  constructor() {
    this.initializeTargets();
  }

  /**
   * Initialize thieving targets with authentic RSC data
   */
  private initializeTargets(): void {
    const targetData: ThievingTarget[] = [
      // NPCs - Pickpocketing
      {
        id: 'man',
        name: 'Man',
        type: 'npc',
        levelRequired: 1,
        experience: 8,
        successRate: 0.9,
        stunTime: 5,
        damage: 1,
        lootTable: [
          { itemId: 'coins', name: 'Coins', quantity: { min: 1, max: 3 }, rarity: 1.0 }
        ]
      },
      {
        id: 'farmer',
        name: 'Farmer',
        type: 'npc',
        levelRequired: 10,
        experience: 14.5,
        successRate: 0.8,
        stunTime: 5,
        damage: 2,
        lootTable: [
          { itemId: 'coins', name: 'Coins', quantity: { min: 8, max: 12 }, rarity: 0.8 },
          { itemId: 'potato_seed', name: 'Potato Seed', quantity: { min: 1, max: 3 }, rarity: 0.2 }
        ]
      },
      {
        id: 'warrior',
        name: 'Warrior',
        type: 'npc',
        levelRequired: 25,
        experience: 26,
        successRate: 0.65,
        stunTime: 6,
        damage: 3,
        lootTable: [
          { itemId: 'coins', name: 'Coins', quantity: { min: 15, max: 25 }, rarity: 0.9 },
          { itemId: 'iron_dagger', name: 'Iron Dagger', quantity: { min: 1, max: 1 }, rarity: 0.1 }
        ]
      },
      {
        id: 'rogue',
        name: 'Rogue',
        type: 'npc',
        levelRequired: 32,
        experience: 36,
        successRate: 0.6,
        stunTime: 7,
        damage: 4,
        lootTable: [
          { itemId: 'coins', name: 'Coins', quantity: { min: 20, max: 40 }, rarity: 0.7 },
          { itemId: 'lockpick', name: 'Lockpick', quantity: { min: 1, max: 1 }, rarity: 0.2 },
          { itemId: 'uncut_sapphire', name: 'Uncut Sapphire', quantity: { min: 1, max: 1 }, rarity: 0.1 }
        ]
      },

      // Stalls
      {
        id: 'baker_stall',
        name: 'Baker Stall',
        type: 'stall',
        levelRequired: 5,
        experience: 16,
        successRate: 0.85,
        stunTime: 5,
        respawnTime: 20,
        lootTable: [
          { itemId: 'bread', name: 'Bread', quantity: { min: 1, max: 1 }, rarity: 0.6 },
          { itemId: 'cake', name: 'Cake', quantity: { min: 1, max: 1 }, rarity: 0.3 },
          { itemId: 'meat_pie', name: 'Meat Pie', quantity: { min: 1, max: 1 }, rarity: 0.1 }
        ]
      },
      {
        id: 'silk_stall',
        name: 'Silk Stall',
        type: 'stall',
        levelRequired: 20,
        experience: 24,
        successRate: 0.75,
        stunTime: 5,
        respawnTime: 30,
        lootTable: [
          { itemId: 'silk', name: 'Silk', quantity: { min: 1, max: 1 }, rarity: 1.0 }
        ]
      },
      {
        id: 'gem_stall',
        name: 'Gem Stall',
        type: 'stall',
        levelRequired: 75,
        experience: 160,
        successRate: 0.5,
        stunTime: 8,
        respawnTime: 60,
        lootTable: [
          { itemId: 'uncut_sapphire', name: 'Uncut Sapphire', quantity: { min: 1, max: 1 }, rarity: 0.4 },
          { itemId: 'uncut_emerald', name: 'Uncut Emerald', quantity: { min: 1, max: 1 }, rarity: 0.3 },
          { itemId: 'uncut_ruby', name: 'Uncut Ruby', quantity: { min: 1, max: 1 }, rarity: 0.2 },
          { itemId: 'uncut_diamond', name: 'Uncut Diamond', quantity: { min: 1, max: 1 }, rarity: 0.1 }
        ]
      },

      // Chests
      {
        id: 'lumbridge_chest',
        name: 'Lumbridge Chest',
        type: 'chest',
        levelRequired: 13,
        experience: 20,
        successRate: 0.8,
        stunTime: 4,
        respawnTime: 45,
        lootTable: [
          { itemId: 'coins', name: 'Coins', quantity: { min: 10, max: 50 }, rarity: 0.8 },
          { itemId: 'nature_rune', name: 'Nature Rune', quantity: { min: 1, max: 3 }, rarity: 0.15 },
          { itemId: 'iron_ore', name: 'Iron Ore', quantity: { min: 1, max: 2 }, rarity: 0.05 }
        ]
      },
      {
        id: 'draynor_chest',
        name: 'Draynor Bank Chest',
        type: 'chest',
        levelRequired: 31,
        experience: 40,
        successRate: 0.65,
        stunTime: 6,
        respawnTime: 90,
        lootTable: [
          { itemId: 'coins', name: 'Coins', quantity: { min: 25, max: 100 }, rarity: 0.6 },
          { itemId: 'law_rune', name: 'Law Rune', quantity: { min: 1, max: 2 }, rarity: 0.2 },
          { itemId: 'death_rune', name: 'Death Rune', quantity: { min: 1, max: 1 }, rarity: 0.1 },
          { itemId: 'uncut_emerald', name: 'Uncut Emerald', quantity: { min: 1, max: 1 }, rarity: 0.1 }
        ]
      }
    ];

    targetData.forEach(target => {
      this.targets.set(target.id, target);
    });
  }

  /**
   * Attempt to steal from a target
   */
  public attemptTheft(
    targetId: string,
    playerLevel: number,
    playerId: string, // For tracking stuns and cooldowns
    addExperience: (skill: string, xp: number) => { newLevel?: number },
    addItemToInventory: (itemId: string, quantity: number) => boolean
  ): ThievingResult {
    const target = this.targets.get(targetId);
    if (!target) {
      return {
        success: false,
        experience: 0,
        message: 'Unknown thieving target.'
      };
    }

    // Check if player is stunned
    const currentTime = Date.now();
    const stunnedUntil = this.stunnedUntil.get(playerId) || 0;
    if (currentTime < stunnedUntil) {
      const remainingTime = Math.ceil((stunnedUntil - currentTime) / 1000);
      return {
        success: false,
        experience: 0,
        message: `You are stunned for ${remainingTime} more seconds.`
      };
    }

    // Check level requirement
    if (playerLevel < target.levelRequired) {
      return {
        success: false,
        experience: 0,
        message: `You need level ${target.levelRequired} Thieving to steal from this target.`
      };
    }

    // Check cooldown for repeated attempts
    const lastAttempt = this.lastTheftAttempt.get(`${playerId}_${targetId}`) || 0;
    const cooldownTime = 2000; // 2 seconds between attempts
    if (currentTime - lastAttempt < cooldownTime) {
      const waitTime = Math.ceil((cooldownTime - (currentTime - lastAttempt)) / 1000);
      return {
        success: false,
        experience: 0,
        message: `You must wait ${waitTime} more seconds before trying again.`
      };
    }

    // Update last attempt time
    this.lastTheftAttempt.set(`${playerId}_${targetId}`, currentTime);

    // Calculate success rate based on level
    const levelBonus = Math.min((playerLevel - target.levelRequired) * 0.015, 0.2);
    const actualSuccessRate = Math.min(target.successRate + levelBonus, 0.95);
    const success = Math.random() < actualSuccessRate;

    if (success) {
      // Successful theft
      const result = addExperience('thieving', target.experience);
      
      // Generate loot
      const loot = this.generateLoot(target.lootTable);
      let lootAdded = false;
      
      if (loot) {
        lootAdded = addItemToInventory(loot.id, loot.quantity);
      }

      return {
        success: true,
        experience: target.experience,
        loot: lootAdded ? loot : undefined,
        message: lootAdded && loot 
          ? `You successfully steal ${loot.quantity}x ${loot.name} from the ${target.name.toLowerCase()}.`
          : `You successfully steal from the ${target.name.toLowerCase()}, but your inventory is full!`,
        leveledUp: !!result.newLevel,
        newLevel: result.newLevel
      };
    } else {
      // Failed theft - get stunned
      if (target.stunTime) {
        this.stunnedUntil.set(playerId, currentTime + (target.stunTime * 1000));
      }

      return {
        success: false,
        experience: 0,
        stunned: !!target.stunTime,
        stunTime: target.stunTime,
        damage: target.damage,
        message: `You fail to steal from the ${target.name.toLowerCase()}${target.stunTime ? ` and are stunned for ${target.stunTime} seconds` : ''}.`
      };
    }
  }

  /**
   * Generate random loot from a loot table
   */
  private generateLoot(lootTable: ThievingLoot[]): InventoryItem | null {
    // Calculate total rarity weight
    const totalWeight = lootTable.reduce((sum, item) => sum + item.rarity, 0);
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    for (const lootItem of lootTable) {
      currentWeight += lootItem.rarity;
      if (random <= currentWeight) {
        const quantity = Math.floor(
          Math.random() * (lootItem.quantity.max - lootItem.quantity.min + 1)
        ) + lootItem.quantity.min;

        return {
          id: lootItem.itemId,
          name: lootItem.name,
          quantity,
          type: 'misc', // Will be determined by item system
          stackable: true,
          value: 1
        };
      }
    }

    return null; // No loot generated
  }

  /**
   * Check if player is currently stunned
   */
  public isPlayerStunned(playerId: string): boolean {
    const stunnedUntil = this.stunnedUntil.get(playerId) || 0;
    return Date.now() < stunnedUntil;
  }

  /**
   * Get remaining stun time for player
   */
  public getStunTimeRemaining(playerId: string): number {
    const stunnedUntil = this.stunnedUntil.get(playerId) || 0;
    const remaining = stunnedUntil - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  /**
   * Get all thieving targets
   */
  public getTargets(): Map<string, ThievingTarget> {
    return this.targets;
  }

  /**
   * Get target by ID
   */
  public getTarget(targetId: string): ThievingTarget | undefined {
    return this.targets.get(targetId);
  }

  /**
   * Check if target can be stolen from (for stalls/chests with respawn times)
   */
  public canStealFromTarget(targetId: string): boolean {
    const target = this.targets.get(targetId);
    if (!target || !target.respawnTime) {
      return true; // NPCs are always available
    }

    // For stalls/chests, check if enough time has passed since last theft
    const lastAttempt = this.lastTheftAttempt.get(`target_${targetId}`) || 0;
    const currentTime = Date.now();
    return currentTime - lastAttempt >= (target.respawnTime * 1000);
  }

  /**
   * Get respawn time remaining for a target
   */
  public getTargetRespawnTime(targetId: string): number {
    const target = this.targets.get(targetId);
    if (!target || !target.respawnTime) {
      return 0;
    }

    const lastAttempt = this.lastTheftAttempt.get(`target_${targetId}`) || 0;
    const currentTime = Date.now();
    const elapsed = currentTime - lastAttempt;
    const respawnMs = target.respawnTime * 1000;
    
    return Math.max(0, Math.ceil((respawnMs - elapsed) / 1000));
  }

  /**
   * Clear all player state (useful for resets)
   */
  public clearPlayerState(playerId: string): void {
    this.stunnedUntil.delete(playerId);
    // Clear cooldowns for this player
    Array.from(this.lastTheftAttempt.keys())
      .filter(key => key.startsWith(`${playerId}_`))
      .forEach(key => this.lastTheftAttempt.delete(key));
  }
}
