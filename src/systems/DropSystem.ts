/**
 * Monster Drops System for ScapeRune
 * Implements authentic RuneScape Classic drop mechanics
 */

export interface DropItem {
  itemId: string;
  name: string;
  quantity: [number, number]; // [min, max]
  chance: number; // 0.0 to 1.0
  noted?: boolean;
}

export interface DropTable {
  // 100% drops (always dropped)
  alwaysDrops: DropItem[];
  
  // Common drops (high chance)
  commonDrops: DropItem[];
  
  // Uncommon drops (medium chance)
  uncommonDrops: DropItem[];
  
  // Rare drops (low chance)
  rareDrops: DropItem[];
  
  // Very rare drops (very low chance)
  veryRareDrops: DropItem[];
  
  // Rare drop table access
  rareDropTableChance?: number; // Chance to access the rare drop table
}

export interface DroppedItem {
  itemId: string;
  name: string;
  quantity: number;
  noted: boolean;
  position: { x: number, y: number, z: number };
}

/**
 * RuneScape Classic Rare Drop Table
 * Contains valuable items that many monsters can drop
 */
export class RareDropTable {
  private static rareDrops: DropItem[] = [
    // Uncut gems (most common on RDT)
    { itemId: 'uncut_sapphire', name: 'Uncut sapphire', quantity: [1, 1], chance: 0.25 },
    { itemId: 'uncut_emerald', name: 'Uncut emerald', quantity: [1, 1], chance: 0.15 },
    { itemId: 'uncut_ruby', name: 'Uncut ruby', quantity: [1, 1], chance: 0.10 },
    { itemId: 'uncut_diamond', name: 'Uncut diamond', quantity: [1, 1], chance: 0.05 },
    
    // Key halves (rare)
    { itemId: 'loop_half_of_key', name: 'Loop half of key', quantity: [1, 1], chance: 0.02 },
    { itemId: 'tooth_half_of_key', name: 'Tooth half of key', quantity: [1, 1], chance: 0.02 },
    
    // Dragon square shield halves (very rare)
    { itemId: 'left_half_dragon_square_shield', name: 'Left half dragon square shield', quantity: [1, 1], chance: 0.005 },
    { itemId: 'right_half_dragon_square_shield', name: 'Right half dragon square shield', quantity: [1, 1], chance: 0.005 },
    
    // Coins (common fallback)
    { itemId: 'coins', name: 'Coins', quantity: [100, 500], chance: 0.385 }
  ];

  /**
   * Roll for rare drop table item
   */
  public static rollRareDropTable(): DropItem | null {
    const roll = Math.random();
    let cumulativeChance = 0;

    for (const drop of this.rareDrops) {
      cumulativeChance += drop.chance;
      if (roll <= cumulativeChance) {
        return drop;
      }
    }

    return null; // Should not happen if chances add up to 1.0
  }
}

/**
 * Monster Drop System
 */
export class DropSystem {
  private dropTables: Map<string, DropTable> = new Map();
  private droppedItems: DroppedItem[] = [];

  constructor() {
    this.initializeDropTables();
  }

  /**
   * Initialize drop tables for all monsters
   */
  private initializeDropTables(): void {
    // Rat drop table
    this.dropTables.set('Rat', {
      alwaysDrops: [
        { itemId: 'bones', name: 'Bones', quantity: [1, 1], chance: 1.0 },
        { itemId: 'raw_rat_meat', name: 'Raw rat meat', quantity: [1, 1], chance: 1.0 }
      ],
      commonDrops: [],
      uncommonDrops: [],
      rareDrops: [],
      veryRareDrops: [],
      rareDropTableChance: 0.001 // 1/1000 chance
    });

    // Goblin drop table
    this.dropTables.set('Goblin', {
      alwaysDrops: [
        { itemId: 'bones', name: 'Bones', quantity: [1, 1], chance: 1.0 }
      ],
      commonDrops: [
        { itemId: 'coins', name: 'Coins', quantity: [1, 25], chance: 0.6 },
        { itemId: 'air_rune', name: 'Air rune', quantity: [2, 7], chance: 0.15 },
        { itemId: 'water_rune', name: 'Water rune', quantity: [3, 9], chance: 0.10 },
        { itemId: 'earth_rune', name: 'Earth rune', quantity: [2, 4], chance: 0.10 },
        { itemId: 'fire_rune', name: 'Fire rune', quantity: [1, 3], chance: 0.08 }
      ],
      uncommonDrops: [
        { itemId: 'bronze_dagger', name: 'Bronze dagger', quantity: [1, 1], chance: 0.05 },
        { itemId: 'bronze_spear', name: 'Bronze spear', quantity: [1, 1], chance: 0.03 },
        { itemId: 'staff', name: 'Staff', quantity: [1, 1], chance: 0.02 },
        { itemId: 'beer', name: 'Beer', quantity: [1, 1], chance: 0.05 },
        { itemId: 'hammer', name: 'Hammer', quantity: [1, 1], chance: 0.02 }
      ],
      rareDrops: [
        { itemId: 'bronze_square_shield', name: 'Bronze square shield', quantity: [1, 1], chance: 0.01 },
        { itemId: 'bronze_sword', name: 'Bronze sword', quantity: [1, 1], chance: 0.008 }
      ],
      veryRareDrops: [],
      rareDropTableChance: 0.008 // 1/128 chance
    });

    // Cow drop table
    this.dropTables.set('Cow', {
      alwaysDrops: [
        { itemId: 'bones', name: 'Bones', quantity: [1, 1], chance: 1.0 },
        { itemId: 'raw_beef', name: 'Raw beef', quantity: [1, 1], chance: 1.0 },
        { itemId: 'cowhide', name: 'Cowhide', quantity: [1, 1], chance: 1.0 }
      ],
      commonDrops: [],
      uncommonDrops: [],
      rareDrops: [],
      veryRareDrops: [],
      rareDropTableChance: 0.002 // 1/500 chance
    });

    // Chicken drop table
    this.dropTables.set('Chicken', {
      alwaysDrops: [
        { itemId: 'bones', name: 'Bones', quantity: [1, 1], chance: 1.0 },
        { itemId: 'raw_chicken', name: 'Raw chicken', quantity: [1, 1], chance: 1.0 },
        { itemId: 'feather', name: 'Feather', quantity: [1, 15], chance: 1.0 }
      ],
      commonDrops: [],
      uncommonDrops: [],
      rareDrops: [],
      veryRareDrops: [],
      rareDropTableChance: 0.001 // 1/1000 chance
    });
  }

  /**
   * Generate drops for a killed monster
   */
  public generateDrops(monsterName: string, position: { x: number, y: number, z: number }): DroppedItem[] {
    const dropTable = this.dropTables.get(monsterName);
    if (!dropTable) {
      console.warn(`No drop table found for monster: ${monsterName}`);
      return [];
    }

    const drops: DroppedItem[] = [];

    // Always drops (100% chance)
    for (const drop of dropTable.alwaysDrops) {
      const quantity = this.rollQuantity(drop.quantity);
      drops.push({
        itemId: drop.itemId,
        name: drop.name,
        quantity,
        noted: drop.noted || false,
        position: { ...position }
      });
    }

    // Check rare drop table first
    if (dropTable.rareDropTableChance && Math.random() < dropTable.rareDropTableChance) {
      const rareDropTableItem = RareDropTable.rollRareDropTable();
      if (rareDropTableItem) {
        const quantity = this.rollQuantity(rareDropTableItem.quantity);
        drops.push({
          itemId: rareDropTableItem.itemId,
          name: rareDropTableItem.name,
          quantity,
          noted: rareDropTableItem.noted || false,
          position: { ...position }
        });
      }
    } else {
      // Roll for regular drops in order of rarity
      const allDrops = [
        ...dropTable.commonDrops,
        ...dropTable.uncommonDrops,
        ...dropTable.rareDrops,
        ...dropTable.veryRareDrops
      ];

      for (const drop of allDrops) {
        if (Math.random() < drop.chance) {
          const quantity = this.rollQuantity(drop.quantity);
          drops.push({
            itemId: drop.itemId,
            name: drop.name,
            quantity,
            noted: drop.noted || false,
            position: { ...position }
          });
          break; // Only one drop from this category
        }
      }
    }

    // Store dropped items for pickup
    this.droppedItems.push(...drops);

    return drops;
  }

  /**
   * Roll a random quantity within the given range
   */
  private rollQuantity(range: [number, number]): number {
    const [min, max] = range;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get all dropped items in the world
   */
  public getDroppedItems(): DroppedItem[] {
    return [...this.droppedItems];
  }

  /**
   * Pick up a dropped item
   */
  public pickupItem(itemIndex: number): DroppedItem | null {
    if (itemIndex >= 0 && itemIndex < this.droppedItems.length) {
      return this.droppedItems.splice(itemIndex, 1)[0];
    }
    return null;
  }

  /**
   * Clear all dropped items (for cleanup)
   */
  public clearDroppedItems(): void {
    this.droppedItems = [];
  }

  /**
   * Get drop table for a monster (for debugging/testing)
   */
  public getDropTable(monsterName: string): DropTable | undefined {
    return this.dropTables.get(monsterName);
  }

  /**
   * Add or update a drop table for a monster
   */
  public setDropTable(monsterName: string, dropTable: DropTable): void {
    this.dropTables.set(monsterName, dropTable);
  }
}

export default DropSystem;
