import * as THREE from 'three';

export interface WoodcuttingEquipment {
  axeType: 'bronze' | 'iron' | 'steel' | 'black' | 'mithril' | 'adamant' | 'rune';
  axeBonus: number; // Success rate bonus
}

export interface Tree {
  type: 'normal' | 'oak' | 'willow' | 'maple' | 'yew' | 'magic';
  position: THREE.Vector3;
  mesh?: THREE.Group;
  respawnTime: number; // milliseconds
  isChopped: boolean;
  choppedAt?: number; // timestamp
}

export interface WoodcuttingResult {
  success: boolean;
  logs: string; // Type of logs obtained
  experience: number;
  message: string;
}

export interface LogType {
  name: string;
  levelRequired: number;
  experience: number;
  successRate: number; // Base success rate percentage
}

export class WoodcuttingSystem {
  private logTypes: Record<string, LogType> = {
    'normal': { 
      name: 'Logs', 
      levelRequired: 1, 
      experience: 25, 
      successRate: 0.533 
    },
    'oak': { 
      name: 'Oak logs', 
      levelRequired: 15, 
      experience: 37.5, 
      successRate: 0.8 
    },
    'willow': { 
      name: 'Willow logs', 
      levelRequired: 30, 
      experience: 62.5, 
      successRate: 1.333 
    },
    'maple': { 
      name: 'Maple logs', 
      levelRequired: 45, 
      experience: 100, 
      successRate: 2.133 
    },
    'yew': { 
      name: 'Yew logs', 
      levelRequired: 60, 
      experience: 175, 
      successRate: 3.733 
    },
    'magic': { 
      name: 'Magic logs', 
      levelRequired: 75, 
      experience: 250, 
      successRate: 5.333 
    }
  };

  private axeTypes: Record<string, { bonus: number }> = {
    'bronze': { bonus: 1 },
    'iron': { bonus: 2 },
    'steel': { bonus: 3 },
    'black': { bonus: 4 },
    'mithril': { bonus: 5 },
    'adamant': { bonus: 6 },
    'rune': { bonus: 7 }
  };

  private trees: Tree[] = [];

  /**
   * Calculate woodcutting success chance based on RSC mechanics
   */
  private calculateSuccessChance(
    playerLevel: number, 
    treeType: string, 
    equipment: WoodcuttingEquipment
  ): number {
    const logType = this.logTypes[treeType];
    if (!logType) return 0;

    // Base success rate from the tree type
    let successRate = logType.successRate;

    // Player level bonus (higher level = better success rate)
    const levelBonus = (playerLevel - logType.levelRequired) * 0.1;
    successRate += Math.max(0, levelBonus);

    // Axe bonus (better axe = better success rate)
    const axeBonus = this.axeTypes[equipment.axeType]?.bonus || 1;
    successRate *= axeBonus;

    // Cap success rate at 95% (RSC had failure chance even at high levels)
    return Math.min(0.95, successRate / 100);
  }

  /**
   * Attempt to chop a tree
   */
  public chopTree(
    tree: Tree,
    playerLevel: number,
    equipment: WoodcuttingEquipment,
    addItemToInventory: (itemId: string, quantity?: number) => boolean
  ): WoodcuttingResult {
    const logType = this.logTypes[tree.type];
    
    // Check if player has required level
    if (playerLevel < logType.levelRequired) {
      return {
        success: false,
        logs: '',
        experience: 0,
        message: `You need a woodcutting level of ${logType.levelRequired} to chop this tree.`
      };
    }

    // Check if tree is already chopped
    if (tree.isChopped) {
      return {
        success: false,
        logs: '',
        experience: 0,
        message: 'This tree has already been chopped down.'
      };
    }

    // Calculate success chance
    const successChance = this.calculateSuccessChance(playerLevel, tree.type, equipment);
    const success = Math.random() < successChance;

    if (success) {
      // Tree is chopped down
      tree.isChopped = true;
      tree.choppedAt = Date.now();

      // Add logs to inventory
      const itemId = tree.type === 'normal' ? 'logs' : `${tree.type}_logs`;
      const itemAdded = addItemToInventory(itemId, 1);

      if (!itemAdded) {
        return {
          success: false,
          logs: '',
          experience: 0,
          message: 'Your inventory is full!'
        };
      }

      return {
        success: true,
        logs: logType.name,
        experience: logType.experience,
        message: `You chop down the ${tree.type} tree and get some ${logType.name.toLowerCase()}.`
      };
    } else {
      return {
        success: false,
        logs: '',
        experience: 0,
        message: 'You slip and fail to hit the tree.'
      };
    }
  }

  /**
   * Check if a tree should respawn
   */
  public checkTreeRespawn(tree: Tree): boolean {
    if (!tree.isChopped || !tree.choppedAt) return false;

    const respawnTime = this.getTreeRespawnTime(tree.type);
    const timeElapsed = Date.now() - tree.choppedAt;

    if (timeElapsed >= respawnTime) {
      tree.isChopped = false;
      tree.choppedAt = undefined;
      return true;
    }

    return false;
  }

  /**
   * Get respawn time for different tree types (in milliseconds)
   */
  private getTreeRespawnTime(treeType: string): number {
    const respawnTimes: Record<string, number> = {
      'normal': 30000,    // 30 seconds
      'oak': 60000,       // 1 minute
      'willow': 120000,   // 2 minutes
      'maple': 300000,    // 5 minutes
      'yew': 600000,      // 10 minutes
      'magic': 1200000    // 20 minutes
    };

    return respawnTimes[treeType] || 30000;
  }

  /**
   * Add a tree to the system
   */
  public addTree(tree: Tree): void {
    this.trees.push(tree);
  }

  /**
   * Get all trees
   */
  public getTrees(): Tree[] {
    return this.trees;
  }

  /**
   * Find the closest tree to a position
   */
  public findClosestTree(position: THREE.Vector3, maxDistance: number = 5): Tree | null {
    let closestTree: Tree | null = null;
    let closestDistance = maxDistance;

    for (const tree of this.trees) {
      if (tree.isChopped) continue;

      const distance = position.distanceTo(tree.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTree = tree;
      }
    }

    return closestTree;
  }

  /**
   * Update tree respawns (call this in your game loop)
   */
  public updateTrees(): void {
    for (const tree of this.trees) {
      this.checkTreeRespawn(tree);
    }
  }

  /**
   * Get log type information
   */
  public getLogType(treeType: string): LogType | null {
    return this.logTypes[treeType] || null;
  }

  /**
   * Create a tree mesh for the 3D world
   */
  public createTreeMesh(treeType: string): THREE.Group {
    const treeGroup = new THREE.Group();
    
    // Tree trunk (brown cylinder)
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    treeGroup.add(trunk);

    // Tree foliage (green sphere or different colors for different trees)
    let foliageColor = 0x228B22; // Default green
    let foliageSize = 1.5;

    switch (treeType) {
      case 'oak':
        foliageColor = 0x6B8E23;
        foliageSize = 1.8;
        break;
      case 'willow':
        foliageColor = 0x9ACD32;
        foliageSize = 2.0;
        break;
      case 'maple':
        foliageColor = 0xFF6347;
        foliageSize = 1.6;
        break;
      case 'yew':
        foliageColor = 0x006400;
        foliageSize = 2.2;
        break;
      case 'magic':
        foliageColor = 0x4B0082;
        foliageSize = 2.5;
        break;
    }

    const foliageGeometry = new THREE.SphereGeometry(foliageSize, 8, 6);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: foliageColor });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 2.5;
    treeGroup.add(foliage);

    // Add a simple collision detector (invisible cylinder)
    const collisionGeometry = new THREE.CylinderGeometry(1, 1, 3, 8);
    const collisionMaterial = new THREE.MeshBasicMaterial({ 
      transparent: true, 
      opacity: 0, 
      visible: false 
    });
    const collision = new THREE.Mesh(collisionGeometry, collisionMaterial);
    collision.position.y = 1.5;
    collision.userData = { type: 'tree', treeType };
    treeGroup.add(collision);

    return treeGroup;
  }
}
