import * as THREE from 'three';
import type { Scene } from 'three';

export interface FireType {
  id: string;
  name: string;
  logId: string;
  levelRequired: number;
  experience: number;
  burnTime: number; // Duration in seconds
  lightChance: number; // Base chance to light (0-1)
}

export interface Fire {
  id: string;
  type: FireType;
  position: THREE.Vector3;
  mesh?: THREE.Object3D;
  lightedAt: number;
  burnUntil: number;
}

export interface FiremakingResult {
  success: boolean;
  experience: number;
  fireId?: string;
  message: string;
  leveledUp?: boolean;
  newLevel?: number;
}

export class FiremakingSystem {
  private scene: Scene;
  private fireTypes: Map<string, FireType> = new Map();
  private activeFires: Map<string, Fire> = new Map();
  private fireCounter: number = 0;

  constructor(scene: Scene) {
    this.scene = scene;
    this.initializeFireTypes();
  }

  /**
   * Initialize fire types with authentic RSC data
   */
  private initializeFireTypes(): void {
    const fireData: FireType[] = [
      {
        id: 'normal_logs',
        name: 'Normal Fire',
        logId: 'logs',
        levelRequired: 1,
        experience: 40,
        burnTime: 120, // 2 minutes
        lightChance: 0.6
      },
      {
        id: 'achey_logs',
        name: 'Achey Fire',
        logId: 'achey_logs',
        levelRequired: 1,
        experience: 40,
        burnTime: 90, // 1.5 minutes
        lightChance: 0.65
      },
      {
        id: 'oak_logs',
        name: 'Oak Fire',
        logId: 'oak_logs',
        levelRequired: 15,
        experience: 60,
        burnTime: 180, // 3 minutes
        lightChance: 0.7
      },
      {
        id: 'willow_logs',
        name: 'Willow Fire',
        logId: 'willow_logs',
        levelRequired: 30,
        experience: 90,
        burnTime: 240, // 4 minutes
        lightChance: 0.75
      },
      {
        id: 'teak_logs',
        name: 'Teak Fire',
        logId: 'teak_logs',
        levelRequired: 35,
        experience: 105,
        burnTime: 270, // 4.5 minutes
        lightChance: 0.8
      },
      {
        id: 'maple_logs',
        name: 'Maple Fire',
        logId: 'maple_logs',
        levelRequired: 45,
        experience: 135,
        burnTime: 300, // 5 minutes
        lightChance: 0.8
      },
      {
        id: 'mahogany_logs',
        name: 'Mahogany Fire',
        logId: 'mahogany_logs',
        levelRequired: 50,
        experience: 157.5,
        burnTime: 330, // 5.5 minutes
        lightChance: 0.85
      },
      {
        id: 'yew_logs',
        name: 'Yew Fire',
        logId: 'yew_logs',
        levelRequired: 60,
        experience: 202.5,
        burnTime: 420, // 7 minutes
        lightChance: 0.85
      },
      {
        id: 'magic_logs',
        name: 'Magic Fire',
        logId: 'magic_logs',
        levelRequired: 75,
        experience: 303.8,
        burnTime: 600, // 10 minutes
        lightChance: 0.9
      }
    ];

    fireData.forEach(fire => {
      this.fireTypes.set(fire.id, fire);
    });
  }

  /**
   * Attempt to light a fire
   */
  public lightFire(
    logId: string,
    position: THREE.Vector3,
    playerLevel: number,
    addExperience: (skill: string, xp: number) => { newLevel?: number }
  ): FiremakingResult {
    // Find fire type for this log
    const fireType = Array.from(this.fireTypes.values()).find(ft => ft.logId === logId);
    
    if (!fireType) {
      return {
        success: false,
        experience: 0,
        message: 'You cannot light a fire with this item.'
      };
    }

    // Check level requirement
    if (playerLevel < fireType.levelRequired) {
      return {
        success: false,
        experience: 0,
        message: `You need level ${fireType.levelRequired} Firemaking to light this fire.`
      };
    }

    // Check if there's already a fire at this position
    const nearbyFire = this.getFireAtPosition(position, 2);
    if (nearbyFire) {
      return {
        success: false,
        experience: 0,
        message: 'There is already a fire burning nearby.'
      };
    }

    // Calculate success chance based on level
    const levelBonus = Math.min((playerLevel - fireType.levelRequired) * 0.02, 0.3);
    const actualLightChance = Math.min(fireType.lightChance + levelBonus, 0.95);
    const success = Math.random() < actualLightChance;

    if (success) {
      // Successfully light fire
      const result = addExperience('firemaking', fireType.experience);
      const fireId = this.createFire(fireType, position);

      return {
        success: true,
        experience: fireType.experience,
        fireId,
        message: `You successfully light the ${fireType.name.toLowerCase()}.`,
        leveledUp: !!result.newLevel,
        newLevel: result.newLevel
      };
    } else {
      // Failed to light fire
      return {
        success: false,
        experience: 0,
        message: `You fail to light the ${fireType.name.toLowerCase()}.`
      };
    }
  }

  /**
   * Create a fire object and add to scene
   */
  private createFire(fireType: FireType, position: THREE.Vector3): string {
    const fireId = `fire_${this.fireCounter++}`;
    const currentTime = Date.now();
    
    const fire: Fire = {
      id: fireId,
      type: fireType,
      position: position.clone(),
      lightedAt: currentTime,
      burnUntil: currentTime + (fireType.burnTime * 1000)
    };

    // Create fire mesh
    this.createFireMesh(fire);
    
    // Add to active fires
    this.activeFires.set(fireId, fire);

    return fireId;
  }

  /**
   * Create 3D mesh for fire
   */
  private createFireMesh(fire: Fire): void {
    const group = new THREE.Group();

    // Base (burnt logs)
    const baseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 8);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x2F1B14 }); // Dark brown
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.1;
    group.add(base);

    // Fire flames (animated)
    const flameGeometry = new THREE.ConeGeometry(0.6, 1.5, 8);
    const flameMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xFF4500,
      transparent: true,
      opacity: 0.8
    });
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.y = 0.75;
    group.add(flame);

    // Inner flame
    const innerFlameGeometry = new THREE.ConeGeometry(0.3, 1.0, 6);
    const innerFlameMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xFFD700,
      transparent: true,
      opacity: 0.9
    });
    const innerFlame = new THREE.Mesh(innerFlameGeometry, innerFlameMaterial);
    innerFlame.position.y = 0.5;
    group.add(innerFlame);

    // Add point light for illumination
    const light = new THREE.PointLight(0xFF6600, 2, 15);
    light.position.y = 1;
    group.add(light);

    // Position and add to scene
    group.position.copy(fire.position);
    group.userData = { type: 'fire', fireId: fire.id, name: fire.type.name };
    
    fire.mesh = group;
    this.scene.add(group);
  }

  /**
   * Update fires (remove expired ones)
   */
  public updateFires(): void {
    const currentTime = Date.now();
    const expiredFires: string[] = [];

    this.activeFires.forEach((fire, fireId) => {
      if (currentTime >= fire.burnUntil) {
        expiredFires.push(fireId);
      } else {
        // Animate fire (optional - make flames flicker)
        if (fire.mesh) {
          const flame = fire.mesh.children[1]; // Main flame
          const innerFlame = fire.mesh.children[2]; // Inner flame
          
          if (flame && innerFlame) {
            const time = currentTime * 0.005;
            flame.rotation.y = Math.sin(time) * 0.1;
            innerFlame.rotation.y = Math.cos(time * 1.3) * 0.15;
            
            // Scale variation for flickering effect
            const scale = 1 + Math.sin(time * 3) * 0.1;
            flame.scale.y = scale;
            innerFlame.scale.y = scale * 1.1;
          }
        }
      }
    });

    // Remove expired fires
    expiredFires.forEach(fireId => {
      this.extinguishFire(fireId);
    });
  }

  /**
   * Extinguish a fire
   */
  public extinguishFire(fireId: string): boolean {
    const fire = this.activeFires.get(fireId);
    if (!fire) return false;

    // Remove mesh from scene
    if (fire.mesh && fire.mesh.parent) {
      this.scene.remove(fire.mesh);
    }

    // Remove from active fires
    this.activeFires.delete(fireId);
    
    return true;
  }

  /**
   * Cook food on a fire
   */
  public cookFood(
    fireId: string,
    rawFoodId: string,
    playerLevel: number,
    cookingLevel: number,
    addExperience: (skill: string, xp: number) => { newLevel?: number }
  ): { success: boolean; cookedItem?: any; burnedItem?: any; message: string } {
    const fire = this.activeFires.get(fireId);
    if (!fire) {
      return {
        success: false,
        message: 'This fire has gone out.'
      };
    }

    // Check if fire is still burning
    const currentTime = Date.now();
    if (currentTime >= fire.burnUntil) {
      return {
        success: false,
        message: 'This fire has burned out.'
      };
    }

    // Cooking logic would be handled by CookingSystem
    // This is just a placeholder for integration
    return {
      success: true,
      message: `You cook the ${rawFoodId} on the ${fire.type.name.toLowerCase()}.`
    };
  }

  /**
   * Get fire at position (within radius)
   */
  private getFireAtPosition(position: THREE.Vector3, radius: number): Fire | null {
    for (const fire of this.activeFires.values()) {
      if (fire.position.distanceTo(position) <= radius) {
        return fire;
      }
    }
    return null;
  }

  /**
   * Get all active fires
   */
  public getActiveFires(): Map<string, Fire> {
    return this.activeFires;
  }

  /**
   * Get fire by ID
   */
  public getFire(fireId: string): Fire | undefined {
    return this.activeFires.get(fireId);
  }

  /**
   * Get all fire types
   */
  public getFireTypes(): Map<string, FireType> {
    return this.fireTypes;
  }

  /**
   * Check if player can light a specific fire type
   */
  public canLightFire(logId: string, playerLevel: number): boolean {
    const fireType = Array.from(this.fireTypes.values()).find(ft => ft.logId === logId);
    return fireType ? playerLevel >= fireType.levelRequired : false;
  }

  /**
   * Get remaining burn time for a fire
   */
  public getFireBurnTimeRemaining(fireId: string): number {
    const fire = this.activeFires.get(fireId);
    if (!fire) return 0;

    const currentTime = Date.now();
    const remaining = fire.burnUntil - currentTime;
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  /**
   * Add logs to existing fire (extend burn time)
   */
  public addLogsToFire(
    fireId: string,
    logId: string,
    playerLevel: number,
    addExperience: (skill: string, xp: number) => { newLevel?: number }
  ): FiremakingResult {
    const fire = this.activeFires.get(fireId);
    if (!fire) {
      return {
        success: false,
        experience: 0,
        message: 'This fire no longer exists.'
      };
    }

    const fireType = Array.from(this.fireTypes.values()).find(ft => ft.logId === logId);
    if (!fireType) {
      return {
        success: false,
        experience: 0,
        message: 'You cannot add this to the fire.'
      };
    }

    if (playerLevel < fireType.levelRequired) {
      return {
        success: false,
        experience: 0,
        message: `You need level ${fireType.levelRequired} Firemaking to add these logs.`
      };
    }

    // Extend burn time
    const currentTime = Date.now();
    fire.burnUntil = Math.max(fire.burnUntil, currentTime) + (fireType.burnTime * 1000);

    // Award experience
    const result = addExperience('firemaking', fireType.experience);

    return {
      success: true,
      experience: fireType.experience,
      message: `You add the ${fireType.name.toLowerCase().replace(' fire', ' logs')} to the fire.`,
      leveledUp: !!result.newLevel,
      newLevel: result.newLevel
    };
  }

  /**
   * Clear all fires from scene
   */
  public clearAllFires(): void {
    Array.from(this.activeFires.keys()).forEach(fireId => {
      this.extinguishFire(fireId);
    });
  }
}
