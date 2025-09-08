import { useGameStore } from '../store/gameStore';
import type { PlayerStats, PlayerExperience } from '../store/gameStore';
import type { InventorySlot, Equipment } from '../types/inventory';

export interface SavedGameData {
  version: string;
  timestamp: number;
  player: {
    stats: PlayerStats;
    experience: PlayerExperience;
    level: number;
    combatLevel: number;
    currentHits: number;
    position: { x: number; y: number; z: number };
    location: string;
  };
  inventory: InventorySlot[];
  equipment: Equipment;
  questProgress: Record<string, any>;
  gameProgress: {
    tutorialCompleted: boolean;
    unlockedAreas: string[];
    completedQuests: string[];
  };
  settings: {
    graphics: 'low' | 'medium' | 'high';
    sound: boolean;
    musicVolume: number;
    effectVolume: number;
    showTutorialHints: boolean;
  };
}

export class SaveLoadSystem {
  private static readonly SAVE_KEY = 'scaperune_save_data';
  private static readonly VERSION = '1.0.0';

  /**
   * Save the current game state to localStorage
   */
  public static saveGame(): boolean {
    try {
      const gameState = useGameStore.getState();
      
      const saveData: SavedGameData = {
        version: this.VERSION,
        timestamp: Date.now(),
        player: {
          stats: gameState.player.stats,
          experience: gameState.player.experience,
          level: gameState.player.level,
          combatLevel: gameState.player.combatLevel,
          currentHits: gameState.player.currentHits,
          position: gameState.player.position,
          location: gameState.currentLocation
        },
        inventory: gameState.player.inventory,
        equipment: gameState.player.equipment,
        questProgress: gameState.questProgress,
        gameProgress: {
          tutorialCompleted: gameState.player.tutorialCompleted || false,
          unlockedAreas: gameState.player.unlockedAreas || ['lumbridge'],
          completedQuests: gameState.player.completedQuests || []
        },
        settings: {
          graphics: gameState.player.settings?.graphics || 'medium',
          sound: gameState.player.settings?.sound ?? true,
          musicVolume: gameState.player.settings?.musicVolume ?? 50,
          effectVolume: gameState.player.settings?.effectVolume ?? 75,
          showTutorialHints: gameState.player.settings?.showTutorialHints ?? true
        }
      };

      const serializedData = JSON.stringify(saveData);
      localStorage.setItem(this.SAVE_KEY, serializedData);
      
      console.log('Game saved successfully!');
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load game state from localStorage
   */
  public static loadGame(): SavedGameData | null {
    try {
      const savedData = localStorage.getItem(this.SAVE_KEY);
      if (!savedData) {
        console.log('No save data found');
        return null;
      }

      const saveData: SavedGameData = JSON.parse(savedData);
      
      // Version compatibility check
      if (!this.isCompatibleVersion(saveData.version)) {
        console.warn('Save data is from incompatible version:', saveData.version);
        return null;
      }

      console.log('Game loaded successfully!');
      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Apply loaded save data to the game store
   */
  public static applySaveData(saveData: SavedGameData): void {
    const gameStore = useGameStore.getState();

    // Update player stats and experience
    Object.entries(saveData.player.stats).forEach(([skill, value]) => {
      gameStore.updatePlayerStat(skill as keyof PlayerStats, value);
    });

    Object.entries(saveData.player.experience).forEach(([skill, value]) => {
      gameStore.setPlayerExperience(skill as keyof PlayerExperience, value);
    });

    // Update player state
    gameStore.updateCurrentHits(saveData.player.currentHits - gameStore.player.currentHits);
    gameStore.setPlayerPosition(saveData.player.position);
    gameStore.setCurrentLocation(saveData.player.location);

    // Update inventory
    gameStore.setInventory(saveData.inventory);

    // Update equipment
    gameStore.setEquipment(saveData.equipment);

    // Update quest progress
    gameStore.setQuestProgress(saveData.questProgress);

    // Update game progress
    if (saveData.gameProgress.tutorialCompleted) {
      gameStore.setTutorialCompleted(true);
    }

    // Update settings
    gameStore.updateSettings(saveData.settings);

    console.log('Save data applied to game state');
  }

  /**
   * Delete saved game data
   */
  public static deleteSave(): boolean {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      console.log('Save data deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete save data:', error);
      return false;
    }
  }

  /**
   * Check if saved game exists
   */
  public static hasSaveData(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  /**
   * Get save data info without loading
   */
  public static getSaveInfo(): { timestamp: number; version: string } | null {
    try {
      const savedData = localStorage.getItem(this.SAVE_KEY);
      if (!savedData) return null;

      const saveData: Partial<SavedGameData> = JSON.parse(savedData);
      return {
        timestamp: saveData.timestamp || 0,
        version: saveData.version || 'unknown'
      };
    } catch (error) {
      console.error('Failed to get save info:', error);
      return null;
    }
  }

  /**
   * Export save data as downloadable file
   */
  public static exportSave(): void {
    try {
      const savedData = localStorage.getItem(this.SAVE_KEY);
      if (!savedData) {
        alert('No save data to export');
        return;
      }

      const blob = new Blob([savedData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scaperune_save_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Save data exported successfully');
    } catch (error) {
      console.error('Failed to export save data:', error);
      alert('Failed to export save data');
    }
  }

  /**
   * Import save data from file
   */
  public static importSave(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target?.result as string;
            const saveData: SavedGameData = JSON.parse(data);
            
            if (!this.isCompatibleVersion(saveData.version)) {
              alert('Save file is from incompatible version');
              resolve(false);
              return;
            }

            localStorage.setItem(this.SAVE_KEY, data);
            console.log('Save data imported successfully');
            resolve(true);
          } catch (error) {
            console.error('Failed to parse imported save data:', error);
            alert('Invalid save file format');
            resolve(false);
          }
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('Failed to read import file:', error);
        resolve(false);
      }
    });
  }

  /**
   * Auto-save functionality
   */
  public static enableAutoSave(intervalMinutes: number = 5): number {
    const intervalMs = intervalMinutes * 60 * 1000;
    return window.setInterval(() => {
      this.saveGame();
      console.log('Auto-save completed');
    }, intervalMs);
  }

  /**
   * Disable auto-save
   */
  public static disableAutoSave(intervalId: number): void {
    clearInterval(intervalId);
    console.log('Auto-save disabled');
  }

  /**
   * Check version compatibility
   */
  private static isCompatibleVersion(version: string): boolean {
    // For now, only exact version match
    // In future, implement proper semantic versioning compatibility
    return version === this.VERSION;
  }

  /**
   * Create a new game save with default values
   */
  public static createNewSave(): SavedGameData {
    const defaultStats: PlayerStats = {
      attack: 1, defense: 1, strength: 1, hits: 10, ranged: 1,
      prayer: 1, magic: 1, cooking: 1, woodcutting: 1, fletching: 1,
      fishing: 1, firemaking: 1, crafting: 1, smithing: 1, mining: 1,
      herblaw: 1, agility: 1, thieving: 1
    };

    const defaultExperience: PlayerExperience = {
      attack: 0, defense: 0, strength: 0, hits: 1154, ranged: 0,
      prayer: 0, magic: 0, cooking: 0, woodcutting: 0, fletching: 0,
      fishing: 0, firemaking: 0, crafting: 0, smithing: 0, mining: 0,
      herblaw: 0, agility: 0, thieving: 0
    };

    return {
      version: this.VERSION,
      timestamp: Date.now(),
      player: {
        stats: defaultStats,
        experience: defaultExperience,
        level: 3,
        combatLevel: 3,
        currentHits: 10,
        position: { x: 0, y: 2, z: 0 },
        location: 'Lumbridge'
      },
      inventory: Array(30).fill(null),
      equipment: {
        weapon: null, shield: null, helmet: null, body: null,
        legs: null, gloves: null, boots: null, cape: null,
        amulet: null, ring: null, ammo: null
      },
      questProgress: {},
      gameProgress: {
        tutorialCompleted: false,
        unlockedAreas: ['lumbridge'],
        completedQuests: []
      },
      settings: {
        graphics: 'medium',
        sound: true,
        musicVolume: 50,
        effectVolume: 75,
        showTutorialHints: true
      }
    };
  }
}
