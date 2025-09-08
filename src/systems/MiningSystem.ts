import * as THREE from 'three';
import { OreModelLoader } from '../utils/OreModelLoader';

export interface MiningEquipment {
  pickaxeType: 'bronze' | 'iron' | 'steel' | 'mithril' | 'adamant' | 'rune';
  pickaxeLevel: number;
  swingsPerClick: number;
}

export interface Rock {
  type: 'clay' | 'copper' | 'tin' | 'iron' | 'silver' | 'coal' | 'gold' | 'gem' | 'mithril' | 'adamant' | 'runite';
  position: THREE.Vector3;
  mesh?: THREE.Group;
  respawnTime: number; // milliseconds
  isMined: boolean;
  minedAt?: number; // timestamp
}

export interface MiningResult {
  success: boolean;
  ore: string; // Type of ore obtained
  experience: number;
  message: string;
  gem?: string; // Optional gem found
}

export interface OreType {
  name: string;
  levelRequired: number;
  experience: number;
  respawnTime: number; // milliseconds
  gemChance: number; // Chance to find a gem (0-1)
}

export class MiningSystem {
  private oreTypes: Record<string, OreType> = {
    'clay': { 
      name: 'Clay', 
      levelRequired: 1, 
      experience: 5, 
      respawnTime: 1000,
      gemChance: 0.001
    },
    'copper': { 
      name: 'Copper ore', 
      levelRequired: 1, 
      experience: 17.5, 
      respawnTime: 3000,
      gemChance: 0.002
    },
    'tin': { 
      name: 'Tin ore', 
      levelRequired: 1, 
      experience: 17.5, 
      respawnTime: 3000,
      gemChance: 0.002
    },
    'iron': { 
      name: 'Iron ore', 
      levelRequired: 15, 
      experience: 35, 
      respawnTime: 5500,
      gemChance: 0.005
    },
    'silver': { 
      name: 'Silver', 
      levelRequired: 20, 
      experience: 40, 
      respawnTime: 60000,
      gemChance: 0.008
    },
    'coal': { 
      name: 'Coal', 
      levelRequired: 30, 
      experience: 50, 
      respawnTime: 25000,
      gemChance: 0.01
    },
    'gold': { 
      name: 'Gold', 
      levelRequired: 40, 
      experience: 65, 
      respawnTime: 60000,
      gemChance: 0.015
    },
    'gem': { 
      name: 'Uncut gems', 
      levelRequired: 40, 
      experience: 50, 
      respawnTime: 120000,
      gemChance: 1.0
    },
    'mithril': { 
      name: 'Mithril ore', 
      levelRequired: 55, 
      experience: 80, 
      respawnTime: 110000,
      gemChance: 0.02
    },
    'adamant': { 
      name: 'Adamantite ore', 
      levelRequired: 70, 
      experience: 95, 
      respawnTime: 200000,
      gemChance: 0.025
    },
    'runite': { 
      name: 'Runite ore', 
      levelRequired: 85, 
      experience: 125, 
      respawnTime: 750000, // 12.5 minutes
      gemChance: 0.03
    }
  };

  private pickaxeTypes: Record<string, MiningEquipment> = {
    'bronze': { pickaxeType: 'bronze', pickaxeLevel: 1, swingsPerClick: 1 },
    'iron': { pickaxeType: 'iron', pickaxeLevel: 1, swingsPerClick: 2 },
    'steel': { pickaxeType: 'steel', pickaxeLevel: 6, swingsPerClick: 3 },
    'mithril': { pickaxeType: 'mithril', pickaxeLevel: 21, swingsPerClick: 5 },
    'adamant': { pickaxeType: 'adamant', pickaxeLevel: 31, swingsPerClick: 8 },
    'rune': { pickaxeType: 'rune', pickaxeLevel: 41, swingsPerClick: 12 }
  };

  private gemTypes = ['Uncut sapphire', 'Uncut emerald', 'Uncut ruby', 'Uncut diamond'];
  private rocks: Rock[] = [];

  /**
   * Calculate mining success chance based on RSC mechanics
   */
  private calculateSuccessChance(
    playerLevel: number, 
    rockType: string, 
    equipment: MiningEquipment
  ): number {
    const oreType = this.oreTypes[rockType];
    if (!oreType) return 0;

    // Base success rate increases with player level and pickaxe quality
    let successRate = 0.1; // Base 10% chance
    
    // Player level bonus
    const levelDifference = playerLevel - oreType.levelRequired;
    successRate += levelDifference * 0.02; // 2% per level above requirement

    // Pickaxe bonus
    successRate += equipment.swingsPerClick * 0.05; // 5% per swing the pickaxe provides

    // Higher level ores are harder to mine
    const rockDifficulty = oreType.levelRequired / 100;
    successRate -= rockDifficulty;

    // Cap success rate between 5% and 85%
    return Math.max(0.05, Math.min(0.85, successRate));
  }

  /**
   * Check for gem discovery
   */
  private checkForGem(rockType: string): string | null {
    const oreType = this.oreTypes[rockType];
    if (!oreType) return null;

    if (Math.random() < oreType.gemChance) {
      const randomGem = this.gemTypes[Math.floor(Math.random() * this.gemTypes.length)];
      return randomGem;
    }

    return null;
  }

  /**
   * Attempt to mine a rock
   */
  public mineRock(
    rock: Rock,
    playerLevel: number,
    equipment: MiningEquipment,
    addItemToInventory: (itemId: string, quantity?: number) => boolean
  ): MiningResult {
    const oreType = this.oreTypes[rock.type];
    
    // Check if player has required level
    if (playerLevel < oreType.levelRequired) {
      return {
        success: false,
        ore: '',
        experience: 0,
        message: `You need a mining level of ${oreType.levelRequired} to mine this rock.`
      };
    }

    // Check if rock is already mined
    if (rock.isMined) {
      return {
        success: false,
        ore: '',
        experience: 0,
        message: 'Someone else is mining this rock.'
      };
    }

    // Calculate success chance based on multiple swings for better pickaxes
    let success = false;
    for (let i = 0; i < equipment.swingsPerClick; i++) {
      const successChance = this.calculateSuccessChance(playerLevel, rock.type, equipment);
      if (Math.random() < successChance) {
        success = true;
        break;
      }
    }

    if (success) {
      // Rock is mined
      rock.isMined = true;
      rock.minedAt = Date.now();
      
      // Hide the rock mesh when mined
      if (rock.mesh) {
        rock.mesh.visible = false;
      }

      // Add ore to inventory
      const itemId = rock.type === 'copper' ? 'copper_ore' : 
                     rock.type === 'tin' ? 'tin_ore' :
                     rock.type === 'iron' ? 'iron_ore' :
                     rock.type === 'silver' ? 'silver_ore' :
                     rock.type === 'gold' ? 'gold_ore' :
                     rock.type === 'mithril' ? 'mithril_ore' :
                     rock.type === 'adamant' ? 'adamant_ore' :
                     rock.type === 'runite' ? 'runite_ore' : rock.type;
      
      const oreAdded = addItemToInventory(itemId, 1);
      if (!oreAdded) {
        // Reset rock state if inventory is full
        rock.isMined = false;
        rock.minedAt = undefined;
        return {
          success: false,
          ore: '',
          experience: 0,
          message: 'Your inventory is full!'
        };
      }

      // Check for gem
      const gem = this.checkForGem(rock.type);
      let message = `You mine some ${oreType.name.toLowerCase()}.`;
      
      if (gem) {
        const gemItemId = gem.toLowerCase().replace(' ', '_');
        const gemAdded = addItemToInventory(gemItemId, 1);
        if (gemAdded) {
          message += ` You also find a ${gem.toLowerCase()}!`;
        }
      }

      return {
        success: true,
        ore: oreType.name,
        experience: oreType.experience,
        message,
        gem: gem || undefined
      };
    } else {
      return {
        success: false,
        ore: '',
        experience: 0,
        message: 'You only succeed in scratching the rock.'
      };
    }
  }

  /**
   * Check if a rock should respawn
   */
  public async checkRockRespawn(rock: Rock, scene?: THREE.Scene): Promise<boolean> {
    if (!rock.isMined || !rock.minedAt) return false;

    const oreType = this.oreTypes[rock.type];
    const timeElapsed = Date.now() - rock.minedAt;

    if (timeElapsed >= oreType.respawnTime) {
      rock.isMined = false;
      rock.minedAt = undefined;
      
      // Show the rock mesh again or recreate with custom model
      if (rock.mesh) {
        rock.mesh.visible = true;
      } else if (scene) {
        // Recreate the rock mesh with custom model
        try {
          const newMesh = await this.createRockMesh(rock.type);
          newMesh.position.copy(rock.position);
          scene.add(newMesh);
          rock.mesh = newMesh;
          console.log(`Respawned ${rock.type} rock with custom model`);
        } catch (error) {
          console.warn(`Failed to recreate ${rock.type} rock with custom model:`, error);
        }
      }
      
      return true;
    }

    return false;
  }

  /**
   * Add a rock to the system
   */
  public addRock(rock: Rock): void {
    this.rocks.push(rock);
  }

  /**
   * Get all rocks
   */
  public getRocks(): Rock[] {
    return this.rocks;
  }

  /**
   * Find the closest rock to a position
   */
  public findClosestRock(position: THREE.Vector3, maxDistance: number = 5): Rock | null {
    let closestRock: Rock | null = null;
    let closestDistance = maxDistance;

    for (const rock of this.rocks) {
      if (rock.isMined) continue;

      const distance = position.distanceTo(rock.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestRock = rock;
      }
    }

    return closestRock;
  }

  /**
   * Update rock respawns (call this in your game loop)
   */
  public updateRocks(scene?: THREE.Scene): void {
    for (const rock of this.rocks) {
      // Handle async respawn without blocking
      this.checkRockRespawn(rock, scene).catch(error => {
        console.warn('Error during rock respawn:', error);
      });
    }
  }

  /**
   * Get ore type information
   */
  public getOreType(rockType: string): OreType | null {
    return this.oreTypes[rockType] || null;
  }

  /**
   * Get pickaxe information
   */
  public getPickaxeType(pickaxeType: string): MiningEquipment | null {
    return this.pickaxeTypes[pickaxeType] || null;
  }

  /**
   * Create a rock mesh for the 3D world using custom ore models
   */
  public async createRockMesh(rockType: string): Promise<THREE.Group> {
    const rockGroup = new THREE.Group();
    
    try {
      // Try to load custom ore model
      const oreModelLoader = OreModelLoader.getInstance();
      const oreModel = await oreModelLoader.createOreModel(rockType);
      
      // Scale and position the model appropriately
      oreModel.scale.set(1.2, 1.2, 1.2);
      oreModel.position.y = 0.2;
      
      // Add some randomness to the orientation
      oreModel.rotation.y = Math.random() * Math.PI * 2;
      oreModel.rotation.x = (Math.random() - 0.5) * 0.3;
      oreModel.rotation.z = (Math.random() - 0.5) * 0.3;
      
      rockGroup.add(oreModel);
      
      console.log(`Created custom ${rockType} ore model`);
    } catch (error) {
      console.warn(`Failed to load custom model for ${rockType}, using fallback`);
      // Fallback to the original geometry-based approach
      const fallbackRock = this.createFallbackRock(rockType);
      rockGroup.add(fallbackRock);
    }

    // Add collision detector (this part stays the same)
    const collisionGeometry = new THREE.BoxGeometry(2, 1.5, 2);
    const collisionMaterial = new THREE.MeshBasicMaterial({ 
      transparent: true, 
      opacity: 0, 
      visible: false 
    });
    const collision = new THREE.Mesh(collisionGeometry, collisionMaterial);
    collision.position.y = 0.75;
    collision.userData = { type: 'rock', rockType };
    rockGroup.add(collision);

    return rockGroup;
  }

  /**
   * Create fallback rock mesh using geometry (original method)
   */
  private createFallbackRock(rockType: string): THREE.Group {
    const fallbackGroup = new THREE.Group();
    
    // Rock colors based on ore type (from original implementation)
    const rockColors: Record<string, number> = {
      'clay': 0x8B4513,      // Brown
      'copper': 0xB87333,    // Copper
      'tin': 0xC0C0C0,       // Silver-gray
      'iron': 0x696969,      // Dark gray
      'silver': 0xE5E5E5,    // Light gray
      'coal': 0x2F4F4F,      // Dark slate gray
      'gold': 0xFFD700,      // Gold
      'gem': 0x9966CC,       // Purple
      'mithril': 0x4169E1,   // Royal blue
      'adamant': 0x228B22,   // Forest green
      'runite': 0x40E0D0     // Turquoise
    };

    const rockColor = rockColors[rockType] || 0x808080;

    // Create irregular rock shape
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshLambertMaterial({ color: rockColor });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    
    // Slightly flatten and position the rock
    rock.scale.set(1.2, 0.8, 1.1);
    rock.position.y = 0.4;
    
    // Add some randomness to the rock shape
    rock.rotation.x = (Math.random() - 0.5) * 0.5;
    rock.rotation.z = (Math.random() - 0.5) * 0.5;
    
    fallbackGroup.add(rock);
    return fallbackGroup;
  }

  /**
   * Add ore sparkle effect when rock respawns
   */
  public addRockRespawnEffect(rock: Rock): THREE.Group | null {
    if (!rock.mesh) return null;

    const sparkleGroup = new THREE.Group();
    
    // Create small glowing particles
    for (let i = 0; i < 6; i++) {
      const sparkleGeometry = new THREE.SphereGeometry(0.05, 4, 4);
      const sparkleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8
      });
      const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
      
      // Random position around the rock
      sparkle.position.set(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.5,
        (Math.random() - 0.5) * 2
      );
      
      sparkleGroup.add(sparkle);
    }

    // Auto-remove sparkles after 2 seconds
    setTimeout(() => {
      if (sparkleGroup.parent) {
        sparkleGroup.parent.remove(sparkleGroup);
      }
    }, 2000);

    return sparkleGroup;
  }
}
