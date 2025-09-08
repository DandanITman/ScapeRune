import { create } from 'zustand';
import type { InventoryItem, InventorySlot, Equipment } from '../types/inventory';
import { ITEM_DEFINITIONS, ItemType } from '../types/inventory';
import { SmithingSystem } from '../systems/SmithingSystem';
import type { PrayerState } from '../systems/PrayerSystem';
import { PrayerSystem } from '../systems/PrayerSystem';
import type { SpecialAttackEnergy } from '../systems/SpecialAttacksSystem';
import { SpecialAttacksSystem } from '../systems/SpecialAttacksSystem';
import { EnhancedCombatStyleSystem } from '../systems/EnhancedCombatStyleSystem';
import type { CombatStyleName } from '../systems/EnhancedCombatStyleSystem';
import type { PlayerQuestProgress } from '../types/quest';

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
  level: number;
  currentHits: number;
  hitpoints: number;
  maxHitpoints: number;
  fatigue: number;
  prayerState: PrayerState;
  specialAttackEnergy: SpecialAttackEnergy;
  inventory: InventorySlot[];
  equipment: Equipment;
  tutorialCompleted?: boolean;
  unlockedAreas?: string[];
  completedQuests?: string[];
  settings?: {
    graphics?: 'low' | 'medium' | 'high';
    sound?: boolean;
    musicVolume?: number;
    effectVolume?: number;
    showTutorialHints?: boolean;
  };
}

// Game state interface
export interface GameState {
  player: Player;
  isGameLoaded: boolean;
  isPaused: boolean;
  currentLocation: string;
  combatStyle: CombatStyleName;
  selectedSpell: string | null;
  selectedRangedWeapon: string | null;
  selectedAmmo: string | null;
  questProgress: Record<string, PlayerQuestProgress>;
  chatMessages: { id: number; text: string; timestamp: number }[];
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
  setCombatStyle: (style: CombatStyleName) => void;
  updateCurrentHits: (damage: number) => void;
  setSelectedSpell: (spellId: string | null) => void;
  setSelectedRangedWeapon: (weaponId: string | null) => void;
  setSelectedAmmo: (ammoId: string | null) => void;
  
  // Inventory actions
  addItemToInventory: (itemId: string, quantity?: number) => boolean;
  removeItemFromInventory: (slotIndex: number, quantity?: number) => void;
  dropItem: (slotIndex: number, quantity?: number) => void;
  useItem: (slotIndex: number) => void;
  equipItem: (slotIndex: number) => void;
  unequipItem: (equipSlot: string) => void;
  getInventoryItem: (slotIndex: number) => InventoryItem | null;
  getEquippedItem: (equipSlot: string) => InventoryItem | null;
  hasInventorySpace: () => boolean;
  findItemInInventory: (itemId: string) => number | null;
  getEquipmentBonuses: () => { attackBonus: number; strengthBonus: number; defenseBonus: number };
  moveItemToSlot: (fromSlot: number, toSlot: number) => void;
  
  // Prayer actions
  activatePrayer: (prayerId: string) => { success: boolean; message: string };
  deactivatePrayer: (prayerId: string) => { success: boolean; message: string };
  buryBones: (slotIndex: number) => { success: boolean; message: string; xp?: number };
  restoreAtAltar: (altarType?: 'normal' | 'monastery') => { success: boolean; message: string };
  updatePrayerDrain: (deltaTime: number) => void;
  
  // Special Attack actions
  canUseSpecialAttack: (attackId: string) => { canUse: boolean; reason?: string };
  performSpecialAttack: (attackId: string, targetId?: string) => { success: boolean; message: string; energyUsed: number };
  updateSpecialAttackEnergy: (deltaTime: number) => void;
  getAvailableSpecialAttacks: () => string[];
  
  // Smithing actions
  smeltOre: (recipeId: string) => { success: boolean; message: string; xp?: number };
  smithItem: (recipeId: string) => { success: boolean; message: string; xp?: number };
  
  // Save/Load system methods
  setPlayerExperience: (skill: keyof PlayerExperience, value: number) => void;
  setInventory: (inventory: InventorySlot[]) => void;
  setEquipment: (equipment: Equipment) => void;
  setQuestProgress: (questProgress: Record<string, PlayerQuestProgress>) => void;
  setTutorialCompleted: (completed: boolean) => void;
  updateSettings: (settings: Partial<Player['settings']>) => void;
  
  // Chat system
  addChatMessage: (text: string) => void;
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
  level: 3,
  currentHits: 10,
  hitpoints: 10,
  maxHitpoints: 10,
  fatigue: 0,
  prayerState: {
    currentPoints: 1,
    maxPoints: 1,
    activePrayers: new Set(),
    drainRate: 0
  },
  specialAttackEnergy: {
    current: 100,
    maximum: 100,
    regenRate: 1/3 // 1% per 3 seconds
  },
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
          index === 12 ? { ...ITEM_DEFINITIONS.bronze_bar, quantity: 3 } :
          index === 13 ? { ...ITEM_DEFINITIONS.staff, quantity: 1 } :
          index === 14 ? { ...ITEM_DEFINITIONS.air_rune, quantity: 50 } :
          index === 15 ? { ...ITEM_DEFINITIONS.water_rune, quantity: 25 } :
          index === 16 ? { ...ITEM_DEFINITIONS.earth_rune, quantity: 25 } :
          index === 17 ? { ...ITEM_DEFINITIONS.fire_rune, quantity: 25 } :
          index === 18 ? { ...ITEM_DEFINITIONS.mind_rune, quantity: 50 } :
          index === 19 ? { ...ITEM_DEFINITIONS.chaos_rune, quantity: 10 } :
          index === 20 ? { ...ITEM_DEFINITIONS.death_rune, quantity: 5 } :
          index === 21 ? { ...ITEM_DEFINITIONS.law_rune, quantity: 3 } :
          index === 22 ? { ...ITEM_DEFINITIONS.shortbow, quantity: 1 } :
          index === 23 ? { ...ITEM_DEFINITIONS.bronze_arrow, quantity: 100 } :
          index === 24 ? { ...ITEM_DEFINITIONS.bones, quantity: 10 } : 
          index === 25 ? { ...ITEM_DEFINITIONS.bat_bones, quantity: 5 } :
          index === 26 ? { ...ITEM_DEFINITIONS.big_bones, quantity: 3 } : null
  })),
  equipment: {},
  tutorialCompleted: false,
  unlockedAreas: [],
  completedQuests: [],
  settings: {
    graphics: 'medium',
    sound: true,
    musicVolume: 50,
    effectVolume: 50,
    showTutorialHints: true
  }
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

// Initialize singleton prayer system
const prayerSystemInstance = new PrayerSystem();
const specialAttacksSystemInstance = new SpecialAttacksSystem();

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
  selectedSpell: null,
  selectedRangedWeapon: null,
  selectedAmmo: null,
  questProgress: {},
  chatMessages: [
    { id: 1, text: 'Welcome to RuneScape Classic!', timestamp: Date.now() },
    { id: 2, text: 'Use the buttons above to access your stats and inventory.', timestamp: Date.now() }
  ],

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
  
  setSelectedSpell: (spellId) => set({ selectedSpell: spellId }),
  
  setSelectedRangedWeapon: (weaponId) => set({ selectedRangedWeapon: weaponId }),
  
  setSelectedAmmo: (ammoId) => set({ selectedAmmo: ammoId }),
  
  updateCurrentHits: (damage) => set((state) => ({
    player: {
      ...state.player,
      hitpoints: Math.max(0, (state.player.hitpoints || state.player.stats.hits) - damage),
      currentHits: Math.max(0, (state.player.currentHits || state.player.stats.hits) - damage)
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

  dropItem: (slotIndex, quantity = 1) => {
    // This will be called from the UI with engine context
    get().removeItemFromInventory(slotIndex, quantity);
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

    // Auto-switch combat style if equipping a weapon
    let newCombatStyle = state.combatStyle;
    if (item.equipSlot === 'weapon') {
      newCombatStyle = EnhancedCombatStyleSystem.autoSwitchStyle(state.combatStyle as CombatStyleName, item);
      if (newCombatStyle !== state.combatStyle) {
        console.log(`Combat style automatically switched to ${newCombatStyle} for ${item.name}`);
      }
    }

    set((state) => ({
      player: {
        ...state.player,
        equipment: newEquipment,
        inventory: newInventory
      },
      combatStyle: newCombatStyle
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

  moveItemToSlot: (fromSlot, toSlot) => {
    const state = get();
    const newInventory = [...state.player.inventory];
    
    // Check if fromSlot is valid and has an item
    if (fromSlot < 0 || fromSlot >= newInventory.length || !newInventory[fromSlot].item) {
      return;
    }
    
    // Check if toSlot is valid
    if (toSlot < 0 || toSlot >= newInventory.length) {
      return;
    }
    
    // Don't move to the same slot
    if (fromSlot === toSlot) {
      return;
    }
    
    const fromItem = newInventory[fromSlot].item;
    const toItem = newInventory[toSlot].item;
    
    // If both slots have items of the same type, try to stack them
    if (fromItem && toItem && fromItem.id === toItem.id && fromItem.stackable) {
      const totalQuantity = fromItem.quantity + toItem.quantity;
      const maxStack = 999999; // Default max stack for stackable items
      
      if (totalQuantity <= maxStack) {
        // Stack the items
        newInventory[toSlot].item = { ...toItem, quantity: totalQuantity };
        newInventory[fromSlot].item = null;
      } else {
        // Partial stack - fill destination to max and leave remainder in source
        const remainder = totalQuantity - maxStack;
        newInventory[toSlot].item = { ...toItem, quantity: maxStack };
        newInventory[fromSlot].item = { ...fromItem, quantity: remainder };
      }
    } else {
      // Simple swap - move item from source to destination and vice versa
      newInventory[fromSlot].item = toItem;
      newInventory[toSlot].item = fromItem;
    }
    
    set((state) => ({
      player: { ...state.player, inventory: newInventory }
    }));
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
  },

  // Prayer actions
  activatePrayer: (prayerId: string) => {
    const state = get();
    
    const canActivate = prayerSystemInstance.canActivatePrayer(
      prayerId,
      state.player.stats.prayer,
      state.player.prayerState.currentPoints,
      state.player.prayerState.activePrayers
    );
    
    if (!canActivate.canActivate) {
      return { success: false, message: canActivate.reason || 'Cannot activate prayer' };
    }
    
    const result = prayerSystemInstance.activatePrayer(prayerId, state.player.prayerState);
    
    set((state) => ({
      player: {
        ...state.player,
        prayerState: { ...state.player.prayerState }
      }
    }));
    
    return result;
  },

  deactivatePrayer: (prayerId: string) => {
    const state = get();
    
    const result = prayerSystemInstance.deactivatePrayer(prayerId, state.player.prayerState);
    
    set((state) => ({
      player: {
        ...state.player,
        prayerState: { ...state.player.prayerState }
      }
    }));
    
    return result;
  },

  buryBones: (slotIndex: number) => {
    const state = get();
    const item = state.player.inventory[slotIndex]?.item;
    
    if (!item) {
      return { success: false, message: 'No item in that slot' };
    }
    
    const boneData = prayerSystemInstance.getBone(item.id);
    
    if (!boneData) {
      return { success: false, message: 'This item cannot be buried' };
    }
    
    const result = prayerSystemInstance.buryBones(item.id, 1);
    
    if (result.success && result.experience) {
      // Remove one bone from inventory
      get().removeItemFromInventory(slotIndex, 1);
      
      // Add experience
      get().addExperience('prayer', result.experience);
      
      // Update max prayer points based on new level
      const newLevel = getLevelFromExp(state.player.experience.prayer + result.experience);
      const newMaxPoints = prayerSystemInstance.calculateMaxPrayerPoints(newLevel);
      
      set((state) => ({
        player: {
          ...state.player,
          prayerState: {
            ...state.player.prayerState,
            maxPoints: newMaxPoints,
            currentPoints: Math.min(state.player.prayerState.currentPoints, newMaxPoints)
          }
        }
      }));
    }
    
    return result;
  },

  restoreAtAltar: (altarType = 'normal') => {
    const result = prayerSystemInstance.restoreAtAltar(altarType);
    
    if (result.success) {
      set((state) => ({
        player: {
          ...state.player,
          prayerState: {
            ...state.player.prayerState,
            currentPoints: state.player.prayerState.maxPoints + (result.pointsUsed || 0),
            activePrayers: new Set(), // Deactivate all prayers when praying at altar
            drainRate: 0
          }
        }
      }));
    }
    
    return result;
  },

  updatePrayerDrain: (deltaTime: number) => {
    const state = get();
    if (state.player.prayerState.activePrayers.size === 0) return;
    
    const newPrayerState = { ...state.player.prayerState };
    prayerSystemInstance.updatePrayerPoints(newPrayerState, deltaTime);
    
    set((state) => ({
      player: {
        ...state.player,
        prayerState: newPrayerState
      }
    }));
  },

  // Special Attack actions
  canUseSpecialAttack: (attackId: string) => {
    const state = get();
    const equippedWeapon = state.player.equipment.weapon;
    
    let weaponType: string | undefined = undefined;
    if (equippedWeapon) {
      weaponType = specialAttacksSystemInstance.getWeaponType(equippedWeapon.id) || undefined;
    }
    
    return specialAttacksSystemInstance.canUseSpecialAttack(
      attackId,
      state.player.specialAttackEnergy.current,
      weaponType
    );
  },

  performSpecialAttack: (attackId: string, targetId?: string) => {
    const canUse = get().canUseSpecialAttack(attackId);
    
    if (!canUse.canUse) {
      return {
        success: false,
        message: canUse.reason || 'Cannot use special attack',
        energyUsed: 0
      };
    }

    const attack = specialAttacksSystemInstance.getSpecialAttack(attackId);
    if (!attack) {
      return {
        success: false,
        message: 'Special attack not found',
        energyUsed: 0
      };
    }

    // For now, just consume energy and show message
    // In a real game, this would perform combat calculations against targetId
    const energyUsed = attack.energyCost;
    
    set((state) => ({
      player: {
        ...state.player,
        specialAttackEnergy: {
          ...state.player.specialAttackEnergy,
          current: Math.max(0, state.player.specialAttackEnergy.current - energyUsed)
        }
      }
    }));

    return {
      success: true,
      message: `${attack.name} activated! ${attack.description}${targetId ? ` on ${targetId}` : ''}`,
      energyUsed
    };
  },

  updateSpecialAttackEnergy: (deltaTime: number) => {
    const state = get();
    const newEnergy = { ...state.player.specialAttackEnergy };
    specialAttacksSystemInstance.updateSpecialEnergy(newEnergy, deltaTime);
    
    set((state) => ({
      player: {
        ...state.player,
        specialAttackEnergy: newEnergy
      }
    }));
  },

  getAvailableSpecialAttacks: () => {
    const state = get();
    const equippedWeapon = state.player.equipment.weapon;
    
    if (!equippedWeapon) {
      return []; // No weapon equipped, no special attacks available
    }
    
    const weaponType = specialAttacksSystemInstance.getWeaponType(equippedWeapon.id);
    if (!weaponType) {
      return []; // Unknown weapon type
    }
    
    const weaponSpecials = specialAttacksSystemInstance.getWeaponSpecials(weaponType);
    return weaponSpecials.map(attack => attack.id);
  },

  // Save/Load system methods
  setPlayerExperience: (skill: keyof PlayerExperience, value: number) => {
    set((state) => ({
      ...state,
      player: {
        ...state.player,
        experience: {
          ...state.player.experience,
          [skill]: value
        }
      }
    }));
  },

  setInventory: (inventory: InventorySlot[]) => {
    set((state) => ({
      ...state,
      player: {
        ...state.player,
        inventory
      }
    }));
  },

  setEquipment: (equipment: Equipment) => {
    set((state) => ({
      ...state,
      player: {
        ...state.player,
        equipment
      }
    }));
  },

  setQuestProgress: (questProgress: Record<string, PlayerQuestProgress>) => {
    set((state) => ({
      ...state,
      questProgress
    }));
  },

  setTutorialCompleted: (completed: boolean) => {
    set((state) => ({
      ...state,
      player: {
        ...state.player,
        tutorialCompleted: completed
      }
    }));
  },

  updateSettings: (settings: Partial<Player['settings']>) => {
    set((state) => ({
      ...state,
      player: {
        ...state.player,
        settings: {
          ...state.player.settings,
          ...settings
        }
      }
    }));
  },

  addChatMessage: (text: string) => {
    set((state) => ({
      ...state,
      chatMessages: [
        ...state.chatMessages.slice(-49), // Keep only last 49 messages + new one = 50 total
        {
          id: Date.now(),
          text,
          timestamp: Date.now()
        }
      ]
    }));
  }
}));
