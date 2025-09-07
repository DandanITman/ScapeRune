import * as THREE from 'three';

export interface FishingEquipment {
  toolType: 'net' | 'rod' | 'fly_rod' | 'big_net' | 'harpoon' | 'lobster_pot' | 'oily_rod';
  levelRequired: number;
  baitType?: 'bait' | 'feathers' | 'red_vine_worms';
  hasBait?: boolean;
}

export interface FishingSpot {
  type: 'net_bait' | 'lure_bait' | 'harpoon_cage' | 'cage_harpoon' | 'big_net_harpoon' | 'special';
  position: THREE.Vector3;
  mesh?: THREE.Group;
  fishTypes: string[]; // What fish can be caught here
  equipment: string[]; // What equipment can be used here
}

export interface FishingResult {
  success: boolean;
  fish: string; // Type of fish caught
  experience: number;
  message: string;
  otherItem?: string; // For big net fishing (boots, gloves, etc.)
}

export interface FishType {
  name: string;
  levelRequired: number;
  experience: number;
  healAmount: number;
  successRate: number; // Base success rate percentage
  equipment: string[];
}

export class FishingSystem {
  private fishTypes: Record<string, FishType> = {
    'shrimp': {
      name: 'Raw shrimp',
      levelRequired: 1,
      experience: 10,
      healAmount: 3,
      successRate: 80,
      equipment: ['net']
    },
    'sardine': {
      name: 'Raw sardine',
      levelRequired: 5,
      experience: 20,
      healAmount: 4,
      successRate: 70,
      equipment: ['rod']
    },
    'herring': {
      name: 'Raw herring',
      levelRequired: 10,
      experience: 30,
      healAmount: 5,
      successRate: 65,
      equipment: ['rod']
    },
    'anchovies': {
      name: 'Raw anchovies',
      levelRequired: 15,
      experience: 40,
      healAmount: 1,
      successRate: 75,
      equipment: ['net']
    },
    'mackerel': {
      name: 'Raw mackerel',
      levelRequired: 16,
      experience: 20,
      healAmount: 6,
      successRate: 60,
      equipment: ['big_net']
    },
    'trout': {
      name: 'Raw trout',
      levelRequired: 20,
      experience: 50,
      healAmount: 7,
      successRate: 55,
      equipment: ['fly_rod']
    },
    'cod': {
      name: 'Raw cod',
      levelRequired: 23,
      experience: 45,
      healAmount: 7,
      successRate: 50,
      equipment: ['big_net']
    },
    'pike': {
      name: 'Raw pike',
      levelRequired: 25,
      experience: 60,
      healAmount: 8,
      successRate: 45,
      equipment: ['rod']
    },
    'salmon': {
      name: 'Raw salmon',
      levelRequired: 30,
      experience: 70,
      healAmount: 9,
      successRate: 40,
      equipment: ['fly_rod']
    },
    'tuna': {
      name: 'Raw tuna',
      levelRequired: 35,
      experience: 80,
      healAmount: 10,
      successRate: 35,
      equipment: ['harpoon']
    },
    'lobster': {
      name: 'Raw lobster',
      levelRequired: 40,
      experience: 90,
      healAmount: 12,
      successRate: 30,
      equipment: ['lobster_pot']
    },
    'bass': {
      name: 'Raw bass',
      levelRequired: 46,
      experience: 100,
      healAmount: 13,
      successRate: 25,
      equipment: ['big_net']
    },
    'swordfish': {
      name: 'Raw swordfish',
      levelRequired: 50,
      experience: 100,
      healAmount: 14,
      successRate: 20,
      equipment: ['harpoon']
    },
    'lava_eel': {
      name: 'Raw lava eel',
      levelRequired: 53,
      experience: 90,
      healAmount: 11,
      successRate: 15,
      equipment: ['oily_rod']
    },
    'shark': {
      name: 'Raw shark',
      levelRequired: 76,
      experience: 110,
      healAmount: 20,
      successRate: 10,
      equipment: ['harpoon']
    }
  };

  private equipmentTypes: Record<string, FishingEquipment> = {
    'net': { toolType: 'net', levelRequired: 1 },
    'rod': { toolType: 'rod', levelRequired: 5, baitType: 'bait' },
    'fly_rod': { toolType: 'fly_rod', levelRequired: 20, baitType: 'feathers' },
    'big_net': { toolType: 'big_net', levelRequired: 16 },
    'harpoon': { toolType: 'harpoon', levelRequired: 35 },
    'lobster_pot': { toolType: 'lobster_pot', levelRequired: 40 },
    'oily_rod': { toolType: 'oily_rod', levelRequired: 53, baitType: 'bait' }
  };

  // Big net can catch junk items
  private junkItems = [
    { name: 'Leather gloves', experience: 1 },
    { name: 'Boots', experience: 1 },
    { name: 'Seaweed', experience: 1 },
    { name: 'Oyster', experience: 10 },
    { name: 'Casket', experience: 10 }
  ];

  private fishingSpots: FishingSpot[] = [];

  /**
   * Calculate fishing success chance based on RSC mechanics
   */
  private calculateSuccessChance(
    playerLevel: number,
    fishType: string,
    equipment: FishingEquipment
  ): number {
    const fish = this.fishTypes[fishType];
    if (!fish) return 0;

    // Check if equipment can catch this fish
    if (!fish.equipment.includes(equipment.toolType)) return 0;

    // Base success rate from fish type
    let successRate = fish.successRate;

    // Player level bonus
    const levelDifference = playerLevel - fish.levelRequired;
    successRate += levelDifference * 2; // 2% per level above requirement

    // Equipment bonus (better equipment = better rates)
    const equipmentBonus = equipment.levelRequired * 0.5;
    successRate += equipmentBonus;

    // Check if bait is required and available
    if (equipment.baitType && !equipment.hasBait) {
      return 0; // Can't fish without required bait
    }

    // Cap success rate between 5% and 95%
    return Math.max(5, Math.min(95, successRate)) / 100;
  }

  /**
   * Check for big net junk items
   */
  private checkForJunkItem(): { name: string; experience: number } | null {
    if (Math.random() < 0.1) { // 10% chance for junk
      return this.junkItems[Math.floor(Math.random() * this.junkItems.length)];
    }
    return null;
  }

  /**
   * Get available fish at a fishing spot with given equipment
   */
  private getAvailableFish(spot: FishingSpot, equipment: FishingEquipment): string[] {
    return spot.fishTypes.filter(fishType => {
      const fish = this.fishTypes[fishType];
      return fish && fish.equipment.includes(equipment.toolType);
    });
  }

  /**
   * Attempt to fish at a spot
   */
  public fish(
    spot: FishingSpot,
    playerLevel: number,
    equipment: FishingEquipment,
    addItemToInventory: (itemId: string, quantity?: number) => boolean
  ): FishingResult {
    // Check if equipment can be used at this spot
    if (!spot.equipment.includes(equipment.toolType)) {
      return {
        success: false,
        fish: '',
        experience: 0,
        message: 'You cannot use that equipment at this fishing spot.'
      };
    }

    // Check if bait is required
    if (equipment.baitType && !equipment.hasBait) {
      return {
        success: false,
        fish: '',
        experience: 0,
        message: `You need ${equipment.baitType} to fish with this equipment.`
      };
    }

    // Get available fish for this spot and equipment
    const availableFish = this.getAvailableFish(spot, equipment);
    if (availableFish.length === 0) {
      return {
        success: false,
        fish: '',
        experience: 0,
        message: 'There are no fish you can catch here with that equipment.'
      };
    }

    // Try to catch each fish type (higher level fish first)
    const sortedFish = availableFish.sort((a, b) => 
      this.fishTypes[b].levelRequired - this.fishTypes[a].levelRequired
    );

    for (const fishType of sortedFish) {
      const fish = this.fishTypes[fishType];
      
      // Check level requirement
      if (playerLevel < fish.levelRequired) continue;

      // Check success chance
      const successChance = this.calculateSuccessChance(playerLevel, fishType, equipment);
      if (Math.random() < successChance) {
        // Success! Caught a fish
        
        // Add fish to inventory
        const fishItemId = fish.name.toLowerCase().replace(' ', '_');
        const fishAdded = addItemToInventory(fishItemId, 1);
        
        if (!fishAdded) {
          return {
            success: false,
            fish: '',
            experience: 0,
            message: 'Your inventory is full!'
          };
        }
        
        let message = `You catch a ${fish.name.toLowerCase()}.`;
        
        // Check for junk items if using big net
        let otherItem: string | undefined;
        if (equipment.toolType === 'big_net') {
          const junk = this.checkForJunkItem();
          if (junk) {
            const junkItemId = junk.name.toLowerCase().replace(' ', '_');
            const junkAdded = addItemToInventory(junkItemId, 1);
            if (junkAdded) {
              otherItem = junk.name;
              message += ` You also catch ${junk.name.toLowerCase()}.`;
            }
          }
        }

        return {
          success: true,
          fish: fish.name,
          experience: fish.experience,
          message,
          otherItem
        };
      }
    }

    // Failed to catch anything
    return {
      success: false,
      fish: '',
      experience: 0,
      message: 'You fail to catch anything.'
    };
  }

  /**
   * Add a fishing spot to the system
   */
  public addFishingSpot(spot: FishingSpot): void {
    this.fishingSpots.push(spot);
  }

  /**
   * Get all fishing spots
   */
  public getFishingSpots(): FishingSpot[] {
    return this.fishingSpots;
  }

  /**
   * Find the closest fishing spot to a position
   */
  public findClosestFishingSpot(position: THREE.Vector3, maxDistance: number = 5): FishingSpot | null {
    let closestSpot: FishingSpot | null = null;
    let closestDistance = maxDistance;

    for (const spot of this.fishingSpots) {
      const distance = position.distanceTo(spot.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSpot = spot;
      }
    }

    return closestSpot;
  }

  /**
   * Get fish type information
   */
  public getFishType(fishType: string): FishType | null {
    return this.fishTypes[fishType] || null;
  }

  /**
   * Get equipment information
   */
  public getEquipmentType(equipmentType: string): FishingEquipment | null {
    return this.equipmentTypes[equipmentType] || null;
  }

  /**
   * Create a fishing spot mesh for the 3D world
   */
  public createFishingSpotMesh(spotType: string): THREE.Group {
    const spotGroup = new THREE.Group();
    
    // Create water surface
    const waterGeometry = new THREE.CircleGeometry(2, 16);
    const waterMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x006994,
      transparent: true,
      opacity: 0.8
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2; // Lay flat
    water.position.y = 0.1;
    spotGroup.add(water);

    // Add some ripples or bubbles
    for (let i = 0; i < 3; i++) {
      const bubbleGeometry = new THREE.SphereGeometry(0.1, 8, 6);
      const bubbleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.6
      });
      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      
      bubble.position.set(
        (Math.random() - 0.5) * 3,
        0.2,
        (Math.random() - 0.5) * 3
      );
      
      spotGroup.add(bubble);
    }

    // Add fishing spot indicator based on type
    let indicatorColor = 0x00FF00; // Green for basic spots
    if (spotType.includes('harpoon')) {
      indicatorColor = 0xFF6600; // Orange for harpoon spots
    } else if (spotType.includes('big_net')) {
      indicatorColor = 0x9966CC; // Purple for big net spots
    }

    const indicatorGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8);
    const indicatorMaterial = new THREE.MeshBasicMaterial({ color: indicatorColor });
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.position.y = 0.5;
    spotGroup.add(indicator);

    // Add collision detector
    const collisionGeometry = new THREE.CylinderGeometry(2.5, 2.5, 1, 16);
    const collisionMaterial = new THREE.MeshBasicMaterial({ 
      transparent: true, 
      opacity: 0, 
      visible: false 
    });
    const collision = new THREE.Mesh(collisionGeometry, collisionMaterial);
    collision.position.y = 0.5;
    collision.userData = { type: 'fishing_spot', spotType };
    spotGroup.add(collision);

    return spotGroup;
  }

  /**
   * Create fishing animation (bobbing rod, etc.)
   */
  public createFishingAnimation(equipment: FishingEquipment): THREE.Group | null {
    if (equipment.toolType === 'rod' || equipment.toolType === 'fly_rod' || equipment.toolType === 'oily_rod') {
      const rodGroup = new THREE.Group();
      
      // Simple rod representation
      const rodGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2, 8);
      const rodMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const rod = new THREE.Mesh(rodGeometry, rodMaterial);
      rod.rotation.z = Math.PI / 4; // Angle the rod
      rod.position.set(1, 1, 0);
      rodGroup.add(rod);

      // Fishing line
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array([0, 0, 0, 1, -1, 1]);
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      rodGroup.add(line);

      return rodGroup;
    }

    return null;
  }
}
