import { create } from 'zustand';
import type { InventoryItem, InventorySlot, Equipment } from '../types/inventory';
import { ITEM_DEFINITIONS, ItemType } from '../types/inventory';
import { SmithingSystem } from '../systems/SmithingSystem';

// Player stats interface
export interface PlayerStats {
  attack: number;
  defense: number;
  strength: number;
  hits: number;
  ranged: number;
  prayer: number;
  magic: number;
  cooking: number;
  woodcutting: number;
  fletching: number;
  fishing: number;
  firemaking: number;
  crafting: number;
  smithing: number;
  mining: number;
  herblaw: number;
  agility: number;
  thieving: number;
}

// Player experience interface
export interface PlayerExperience {
  attack: number;
  defense: number;
  strength: number;
  hits: number;
  ranged: number;
  prayer: number;
  magic: number;
  cooking: number;
  woodcutting: number;
  fletching: number;
  fishing: number;
  firemaking: number;
  crafting: number;
  smithing: number;
  mining: number;
  herblaw: number;
  agility: number;
  thieving: number;
}

// Player interface
export interface Player {
  name: string;
  position: { x: number; y: number; z: number };
  stats: PlayerStats;
  experience: PlayerExperience;
  combatLevel: number;
  hitpoints: number;
  maxHitpoints: number;
  fatigue: number;
  inventory: InventorySlot[];
  equipment: Equipment;
}

// Game state interface
export interface GameState {
  player: Player;
  isGameLoaded: boolean;
  isPaused: boolean;
  currentLocation: string;
  combatStyle: 'accurate' | 'aggressive' | 'defensive' | 'controlled';
}

// Game store interface
interface GameStore extends GameState {
  // Actions
  setPlayerPosition: (position: { x: number; y: number; z: number }) => void;
  updatePlayerStat: (skill: keyof PlayerStats, value: number) => void;
  addExperience: (skill: keyof PlayerExperience, amount: number) => void;
  setGameLoaded: (loaded: boolean) => void;
  setPaused: (paused: boolean) => void;
  setCurrentLocation: (location: string) => void;
  calculateCombatLevel: () => void;
  getCombatStats: () => { attack: number; defense: number; strength: number; hits: number; currentHits: number };
  setCombatStyle: (style: 'accurate' | 'aggressive' | 'defensive' | 'controlled') => void;
  updateCurrentHits: (damage: number) => void;
  
  // Inventory actions
  addItemToInventory: (itemId: string, quantity?: number) => boolean;
  removeItemFromInventory: (slotIndex: number, quantity?: number) => void;
  useItem: (slotIndex: number) => void;
  equipItem: (slotIndex: number) => void;
  unequipItem: (equipSlot: string) => void;
  getInventoryItem: (slotIndex: number) => InventoryItem | null;
  getEquippedItem: (equipSlot: string) => InventoryItem | null;
  hasInventorySpace: () => boolean;
  findItemInInventory: (itemId: string) => number | null;
  getEquipmentBonuses: () => { attackBonus: number; strengthBonus: number; defenseBonus: number };
  
  // Smithing actions
  smeltOre: (recipeId: string) => { success: boolean; message: string; xp?: number };
  smithItem: (recipeId: string) => { success: boolean; message: string; xp?: number };
}

// Initial player state
const initialPlayer: Player = {
  name: 'Player',
  position: { x: 0, y: 0, z: 0 },
  stats: {
    attack: 1,
    defense: 1,
    strength: 1,
    hits: 10,
    ranged: 1,
    prayer: 1,
    magic: 1,
    cooking: 1,
    woodcutting: 1,
    fletching: 1,
    fishing: 1,
    firemaking: 1,
    crafting: 1,
    smithing: 1,
    mining: 1,
    herblaw: 1,
    agility: 1,
    thieving: 1,
  },
  experience: {
    attack: 0,
    defense: 0,
    strength: 0,
    hits: 1154,
    ranged: 0,
    prayer: 0,
    magic: 0,
    cooking: 0,
    woodcutting: 0,
    fletching: 0,
    fishing: 0,
    firemaking: 0,
    crafting: 0,
    smithing: 0,
    mining: 0,
    herblaw: 0,
    agility: 0,
    thieving: 0,
  },
  combatLevel: 3,
  hitpoints: 10,
  maxHitpoints: 10,
  fatigue: 0,
  inventory: Array.from({ length: 30 }, (_, index) => ({
    slotIndex: index,
    item: index === 0 ? { ...ITEM_DEFINITIONS.bread, quantity: 5 } : 
          index === 1 ? { ...ITEM_DEFINITIONS.bronze_sword, quantity: 1 } : 
          index === 2 ? { ...ITEM_DEFINITIONS.bronze_helmet, quantity: 1 } :
          index === 3 ? { ...ITEM_DEFINITIONS.bronze_chainmail, quantity: 1 } :
          index === 4 ? { ...ITEM_DEFINITIONS.bronze_platelegs, quantity: 1 } :
          index === 5 ? { ...ITEM_DEFINITIONS.bronze_axe, quantity: 1 } :
          index === 6 ? { ...ITEM_DEFINITIONS.bronze_pickaxe, quantity: 1 } :
          index === 7 ? { ...ITEM_DEFINITIONS.small_fishing_net, quantity: 1 } :
          index === 8 ? { ...ITEM_DEFINITIONS.copper_ore, quantity: 10 } :
          index === 9 ? { ...ITEM_DEFINITIONS.tin_ore, quantity: 10 } :
          index === 10 ? { ...ITEM_DEFINITIONS.iron_ore, quantity: 5 } :
          index === 11 ? { ...ITEM_DEFINITIONS.coal, quantity: 10 } :
          index === 12 ? { ...ITEM_DEFINITIONS.bronze_bar, quantity: 3 } : null
  })),
  equipment: {}
};

// Experience table for calculating levels
const expTable = [
  0, 83, 174, 276, 388, 512, 650, 801, 969, 1154, 1358, 1584, 1833, 2107, 2411,
  2746, 3115, 3523, 3973, 4470, 5018, 5624, 6291, 7028, 7842, 8740, 9730, 10824,
  12031, 13363, 14833, 16456, 18247, 20224, 22406, 24815, 27473, 30408, 33648,
  37224, 41171, 45529, 50339, 55649, 61512, 67983, 75127, 83014, 91721, 101333,
  111945, 123660, 136594, 150872, 166636, 184040, 203254, 224466, 247886, 273742,
  302288, 333804, 368599, 407015, 449428, 496254, 547953, 605032, 668051, 737627,
  814445, 899257, 992895, 1096278, 1210421, 1336443, 1475581, 1629200, 1798808,
  1986068, 2192818, 2421087, 2673114, 2951373, 3258594, 3597792, 3972294, 4385776,
  4842295, 5346332, 5902831, 6517253, 7195629, 7944614, 8771558, 9684577, 10692629,
  11805606, 13034431, 200000000,
];

// Calculate level from experience
function getLevelFromExp(exp: number): number {
  for (let i = 1; i < expTable.length; i++) {
    if (exp < expTable[i]) {
      return i - 1;
    }
  }
  return 99;
}

// Calculate combat level
function calculateCombatLevel(stats: PlayerStats): number {
  const attack = stats.attack;
  const defense = stats.defense;
  const strength = stats.strength;
  const hits = stats.hits;
  const ranged = stats.ranged;
  const prayer = stats.prayer;
  const magic = stats.magic;

  const base = (defense + hits + Math.floor(prayer / 2)) * 0.25;
  const melee = (attack + strength) * 0.325;
  const archer = Math.floor(ranged * 1.5) * 0.325;
  const mage = Math.floor(magic * 1.5) * 0.325;

  return Math.floor(base + Math.max(melee, Math.max(archer, mage)));
}

// Create the game store
export const useGameStore = create<GameStore>((set, get) => ({
  player: initialPlayer,
  isGameLoaded: false,
  isPaused: false,
  currentLocation: 'Tutorial Island',
  combatStyle: 'accurate',

  setPlayerPosition: (position) =>
    set((state) => ({
      player: { ...state.player, position },
    })),

  updatePlayerStat: (skill, value) =>
    set((state) => ({
      player: {
        ...state.player,
        stats: { ...state.player.stats, [skill]: value },
      },
    })),

  addExperience: (skill, amount) =>
    set((state) => {
      const newExp = state.player.experience[skill] + amount;
      const newLevel = getLevelFromExp(newExp);
      const oldLevel = state.player.stats[skill];
      
      const newPlayer = {
        ...state.player,
        experience: { ...state.player.experience, [skill]: newExp },
        stats: { ...state.player.stats, [skill]: newLevel },
      };

      // Update max hitpoints if hits skill leveled up
      if (skill === 'hits' && newLevel > oldLevel) {
        newPlayer.maxHitpoints = newLevel;
        newPlayer.hitpoints = Math.min(newPlayer.hitpoints, newLevel);
      }

      return { player: newPlayer };
    }),

  setGameLoaded: (loaded) => set({ isGameLoaded: loaded }),
  setPaused: (paused) => set({ isPaused: paused }),
  setCurrentLocation: (location) => set({ currentLocation: location }),

  calculateCombatLevel: () =>
    set((state) => ({
      player: {
        ...state.player,
        combatLevel: calculateCombatLevel(state.player.stats),
      },
    })),

  // Helper function to get player combat stats
  getCombatStats: () => {
    const state = get();
    return {
      attack: state.player.stats.attack,
      defense: state.player.stats.defense,
      strength: state.player.stats.strength,
      hits: state.player.stats.hits,
      currentHits: state.player.hitpoints || state.player.stats.hits
    };
  },

  setCombatStyle: (style) => set({ combatStyle: style }),
  
  updateCurrentHits: (damage) => set((state) => ({
    player: {
      ...state.player,
      hitpoints: Math.max(0, (state.player.hitpoints || state.player.stats.hits) - damage)
    }
  })),

  // Inventory actions
  addItemToInventory: (itemId, quantity = 1) => {
    const state = get();
    const itemDef = ITEM_DEFINITIONS[itemId];
    if (!itemDef) return false;

    const newInventory = [...state.player.inventory];
    
    // Check if item is stackable and already exists
    if (itemDef.stackable) {
      const existingSlot = newInventory.find(slot => slot.item?.id === itemId);
      if (existingSlot && existingSlot.item) {
        existingSlot.item.quantity += quantity;
        set((state) => ({
          player: { ...state.player, inventory: newInventory }
        }));
        return true;
      }
    }

    // Find empty slot
    const emptySlot = newInventory.find(slot => !slot.item);
    if (!emptySlot) return false; // Inventory full

    emptySlot.item = { ...itemDef, quantity };
    set((state) => ({
      player: { ...state.player, inventory: newInventory }
    }));
    return true;
  },

  removeItemFromInventory: (slotIndex, quantity = 1) => {
    const state = get();
    const newInventory = [...state.player.inventory];
    const slot = newInventory[slotIndex];
    
    if (!slot.item) return;

    if (slot.item.quantity <= quantity) {
      slot.item = null;
    } else {
      slot.item.quantity -= quantity;
    }

    set((state) => ({
      player: { ...state.player, inventory: newInventory }
    }));
  },

  useItem: (slotIndex) => {
    const state = get();
    const item = state.player.inventory[slotIndex]?.item;
    if (!item) return;

    // Handle food items
    if (item.type === ItemType.FOOD && item.healAmount) {
      const maxHeal = state.player.maxHitpoints - state.player.hitpoints;
      if (maxHeal > 0) {
        const healAmount = Math.min(item.healAmount, maxHeal);
        
        set((state) => ({
          player: {
            ...state.player,
            hitpoints: Math.min(state.player.maxHitpoints, state.player.hitpoints + healAmount)
          }
        }));

        // Remove one item
        get().removeItemFromInventory(slotIndex, 1);
        console.log(`Ate ${item.name} and healed ${healAmount} HP`);
      } else {
        console.log("You're already at full health!");
      }
    }
    // Add more item use cases here (potions, etc.)
  },

  equipItem: (slotIndex) => {
    const state = get();
    const item = state.player.inventory[slotIndex]?.item;
    if (!item || !item.equipSlot) return;

    // Check requirements
    if (item.requirements) {
      for (const [stat, requiredLevel] of Object.entries(item.requirements)) {
        if (state.player.stats[stat as keyof PlayerStats] < requiredLevel) {
          console.log(`You need ${requiredLevel} ${stat} to equip this item.`);
          return;
        }
      }
    }

    const newEquipment = { ...state.player.equipment };
    const newInventory = [...state.player.inventory];
    
    // If there's already an item equipped in this slot, unequip it first
    if (newEquipment[item.equipSlot as keyof Equipment]) {
      get().unequipItem(item.equipSlot);
    }

    // Equip the new item
    newEquipment[item.equipSlot as keyof Equipment] = item;
    newInventory[slotIndex].item = null;

    set((state) => ({
      player: {
        ...state.player,
        equipment: newEquipment,
        inventory: newInventory
      }
    }));
    
    console.log(`Equipped ${item.name}`);
  },

  unequipItem: (equipSlot) => {
    const state = get();
    const equippedItem = state.player.equipment[equipSlot as keyof Equipment];
    if (!equippedItem) return;

    // Find empty inventory slot
    if (!get().hasInventorySpace()) {
      console.log("Your inventory is full!");
      return;
    }

    const newEquipment = { ...state.player.equipment };
    delete newEquipment[equipSlot as keyof Equipment];

    // Add to inventory
    get().addItemToInventory(equippedItem.id, equippedItem.quantity);

    set((state) => ({
      player: {
        ...state.player,
        equipment: newEquipment
      }
    }));
    
    console.log(`Unequipped ${equippedItem.name}`);
  },

  getInventoryItem: (slotIndex) => {
    const state = get();
    return state.player.inventory[slotIndex]?.item || null;
  },

  getEquippedItem: (equipSlot) => {
    const state = get();
    return state.player.equipment[equipSlot as keyof Equipment] || null;
  },

  hasInventorySpace: () => {
    const state = get();
    return state.player.inventory.some(slot => !slot.item);
  },

  findItemInInventory: (itemId) => {
    const state = get();
    const slotIndex = state.player.inventory.findIndex(slot => slot.item?.id === itemId);
    return slotIndex === -1 ? null : slotIndex;
  },

  getEquipmentBonuses: () => {
    const state = get();
    let attackBonus = 0;
    let strengthBonus = 0;
    let defenseBonus = 0;

    // Calculate bonuses from each equipped item
    Object.values(state.player.equipment).forEach(item => {
      if (item) {
        if (item.attackBonus) attackBonus += item.attackBonus;
        if (item.strengthBonus) strengthBonus += item.strengthBonus;
        if (item.defenseBonus) defenseBonus += item.defenseBonus;
      }
    });

    return { attackBonus, strengthBonus, defenseBonus };
  },

  // Smithing actions
  smeltOre: (recipeId) => {
    const state = get();
    const smithingSystem = new SmithingSystem();
    const recipe = smithingSystem.getSmeltingRecipe(recipeId);
    
    if (!recipe) {
      return { success: false, message: 'Recipe not found.' };
    }
    
    // Check smithing level
    if (state.player.stats.smithing < recipe.requiredLevel) {
      return { success: false, message: `You need ${recipe.requiredLevel} Smithing to smelt this.` };
    }
    
    // Check if player has required materials
    if (!smithingSystem.canSmelt(recipe, state.player.inventory)) {
      return { success: false, message: 'You do not have the required materials.' };
    }
    
    // Check if player has inventory space
    if (!get().hasInventorySpace()) {
      return { success: false, message: 'Your inventory is full!' };
    }
    
    // Remove materials from inventory
    for (const material of recipe.materials) {
      const slotIndex = state.player.inventory.findIndex(slot => 
        slot.item && slot.item.id === material.itemId
      );
      if (slotIndex !== -1) {
        get().removeItemFromInventory(slotIndex, material.quantity);
      }
    }
    
    // Add result to inventory
    get().addItemToInventory(recipe.result.itemId, recipe.result.quantity);
    
    // Add experience
    get().addExperience('smithing', recipe.experience);
    
    return { 
      success: true, 
      message: `You successfully smelt ${recipe.name}.`,
      xp: recipe.experience
    };
  },

  smithItem: (recipeId) => {
    const state = get();
    const smithingSystem = new SmithingSystem();
    const recipe = smithingSystem.getSmithingRecipe(recipeId);
    
    if (!recipe) {
      return { success: false, message: 'Recipe not found.' };
    }
    
    // Check smithing level
    if (state.player.stats.smithing < recipe.requiredLevel) {
      return { success: false, message: `You need ${recipe.requiredLevel} Smithing to smith this.` };
    }
    
    // Check if player has required bars
    if (!smithingSystem.canSmith(recipe, state.player.inventory)) {
      return { success: false, message: 'You do not have the required bars.' };
    }
    
    // Check if player has inventory space
    if (!get().hasInventorySpace()) {
      return { success: false, message: 'Your inventory is full!' };
    }
    
    // Remove bars from inventory
    for (const bar of recipe.bars) {
      const slotIndex = state.player.inventory.findIndex(slot => 
        slot.item && slot.item.id === bar.itemId
      );
      if (slotIndex !== -1) {
        get().removeItemFromInventory(slotIndex, bar.quantity);
      }
    }
    
    // Add result to inventory
    get().addItemToInventory(recipe.result.itemId, recipe.result.quantity);
    
    // Add experience
    get().addExperience('smithing', recipe.experience);
    
    return { 
      success: true, 
      message: `You successfully smith ${recipe.name}.`,
      xp: recipe.experience
    };
  }
}));
