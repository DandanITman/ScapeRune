import { create } from 'zustand';

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
  }))
}));
