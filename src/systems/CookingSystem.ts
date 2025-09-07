import * as THREE from 'three';
import type { InventorySlot } from '../types/inventory';

// Cooking recipe interface
export interface CookingRecipe {
  id: string;
  name: string;
  requiredLevel: number;
  rawItem: string;
  cookedItem: string;
  burntItem: string;
  experience: number;
  burnLevel: number; // Level at which burn chance becomes 0
  baseBurnRate: number; // Base chance to burn (0-1)
}

export class CookingSystem {
  private ranges: THREE.Group[] = [];
  private fires: THREE.Group[] = [];

  // Cooking recipes
  private cookingRecipes: CookingRecipe[] = [
    {
      id: 'cook_shrimp',
      name: 'Shrimp',
      requiredLevel: 1,
      rawItem: 'raw_shrimp',
      cookedItem: 'cooked_shrimp',
      burntItem: 'burnt_shrimp',
      experience: 30,
      burnLevel: 34,
      baseBurnRate: 0.25
    },
    {
      id: 'cook_sardine',
      name: 'Sardine',
      requiredLevel: 1,
      rawItem: 'raw_sardine',
      cookedItem: 'cooked_sardine',
      burntItem: 'burnt_fish',
      experience: 40,
      burnLevel: 38,
      baseBurnRate: 0.28
    },
    {
      id: 'cook_herring',
      name: 'Herring',
      requiredLevel: 5,
      rawItem: 'raw_herring',
      cookedItem: 'cooked_herring',
      burntItem: 'burnt_fish',
      experience: 50,
      burnLevel: 41,
      baseBurnRate: 0.25
    },
    {
      id: 'cook_anchovies',
      name: 'Anchovies',
      requiredLevel: 1,
      rawItem: 'raw_anchovies',
      cookedItem: 'cooked_anchovies',
      burntItem: 'burnt_fish',
      experience: 30,
      burnLevel: 34,
      baseBurnRate: 0.22
    },
    {
      id: 'cook_mackerel',
      name: 'Mackerel',
      requiredLevel: 10,
      rawItem: 'raw_mackerel',
      cookedItem: 'cooked_mackerel',
      burntItem: 'burnt_fish',
      experience: 60,
      burnLevel: 45,
      baseBurnRate: 0.20
    },
    {
      id: 'cook_trout',
      name: 'Trout',
      requiredLevel: 15,
      rawItem: 'raw_trout',
      cookedItem: 'cooked_trout',
      burntItem: 'burnt_fish',
      experience: 70,
      burnLevel: 49,
      baseBurnRate: 0.18
    },
    {
      id: 'cook_cod',
      name: 'Cod',
      requiredLevel: 18,
      rawItem: 'raw_cod',
      cookedItem: 'cooked_cod',
      burntItem: 'burnt_fish',
      experience: 75,
      burnLevel: 52,
      baseBurnRate: 0.18
    },
    {
      id: 'cook_pike',
      name: 'Pike',
      requiredLevel: 20,
      rawItem: 'raw_pike',
      cookedItem: 'cooked_pike',
      burntItem: 'burnt_fish',
      experience: 80,
      burnLevel: 54,
      baseBurnRate: 0.16
    },
    {
      id: 'cook_salmon',
      name: 'Salmon',
      requiredLevel: 25,
      rawItem: 'raw_salmon',
      cookedItem: 'cooked_salmon',
      burntItem: 'burnt_fish',
      experience: 90,
      burnLevel: 58,
      baseBurnRate: 0.15
    },
    {
      id: 'cook_tuna',
      name: 'Tuna',
      requiredLevel: 30,
      rawItem: 'raw_tuna',
      cookedItem: 'cooked_tuna',
      burntItem: 'burnt_fish',
      experience: 100,
      burnLevel: 63,
      baseBurnRate: 0.13
    },
    {
      id: 'cook_lobster',
      name: 'Lobster',
      requiredLevel: 40,
      rawItem: 'raw_lobster',
      cookedItem: 'cooked_lobster',
      burntItem: 'burnt_fish',
      experience: 120,
      burnLevel: 74,
      baseBurnRate: 0.12
    },
    {
      id: 'cook_bass',
      name: 'Bass',
      requiredLevel: 43,
      rawItem: 'raw_bass',
      cookedItem: 'cooked_bass',
      burntItem: 'burnt_fish',
      experience: 130,
      burnLevel: 77,
      baseBurnRate: 0.11
    },
    {
      id: 'cook_swordfish',
      name: 'Swordfish',
      requiredLevel: 45,
      rawItem: 'raw_swordfish',
      cookedItem: 'cooked_swordfish',
      burntItem: 'burnt_fish',
      experience: 140,
      burnLevel: 81,
      baseBurnRate: 0.10
    },
    {
      id: 'cook_shark',
      name: 'Shark',
      requiredLevel: 80,
      rawItem: 'raw_shark',
      cookedItem: 'cooked_shark',
      burntItem: 'burnt_fish',
      experience: 210,
      burnLevel: 94,
      baseBurnRate: 0.08
    }
  ];

  /**
   * Create a cooking range mesh
   */
  public createRangeMesh(): THREE.Group {
    const range = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.BoxGeometry(2, 1, 1.5);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.5;
    base.castShadow = true;
    range.add(base);
    
    // Top cooking surface
    const topGeometry = new THREE.BoxGeometry(2.2, 0.2, 1.7);
    const topMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 1.1;
    top.castShadow = true;
    range.add(top);
    
    // Burners
    for (let i = 0; i < 4; i++) {
      const burnerGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05);
      const burnerMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
      const burner = new THREE.Mesh(burnerGeometry, burnerMaterial);
      burner.position.set(
        (i % 2) * 0.8 - 0.4,
        1.15,
        Math.floor(i / 2) * 0.6 - 0.3
      );
      range.add(burner);
    }

    // Store range data
    range.userData = { type: 'range', canCook: true };
    
    return range;
  }

  /**
   * Create a campfire mesh
   */
  public createFireMesh(): THREE.Group {
    const fire = new THREE.Group();
    
    // Fire base (logs)
    const logGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1);
    const logMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(logGeometry, logMaterial);
      log.position.set(
        Math.cos(i * Math.PI / 2) * 0.3,
        0.1,
        Math.sin(i * Math.PI / 2) * 0.3
      );
      log.rotation.z = Math.PI / 2;
      log.rotation.y = i * Math.PI / 2;
      fire.add(log);
    }
    
    // Fire center (embers)
    const emberGeometry = new THREE.SphereGeometry(0.2);
    const emberMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xFF4500,
      emissive: 0xFF2200,
      emissiveIntensity: 0.3
    });
    const embers = new THREE.Mesh(emberGeometry, emberMaterial);
    embers.position.y = 0.2;
    fire.add(embers);

    // Store fire data
    fire.userData = { type: 'fire', canCook: true, burnRate: 1.5 }; // Fire has higher burn rate
    
    return fire;
  }

  /**
   * Get available cooking recipes for a given cooking level
   */
  public getAvailableCookingRecipes(cookingLevel: number): CookingRecipe[] {
    return this.cookingRecipes.filter(recipe => recipe.requiredLevel <= cookingLevel);
  }

  /**
   * Check if player has the required raw item
   */
  public canCook(recipe: CookingRecipe, inventory: InventorySlot[]): boolean {
    const found = inventory.find(slot => 
      slot.item && 
      slot.item.id === recipe.rawItem && 
      slot.item.quantity >= 1
    );
    return !!found;
  }

  /**
   * Calculate burn chance based on cooking level and cooking method
   */
  public calculateBurnChance(recipe: CookingRecipe, cookingLevel: number, usingRange: boolean = true): number {
    if (cookingLevel >= recipe.burnLevel) {
      return 0; // No burning at or above burn level
    }
    
    // Base burn rate modified by level difference
    const levelDifference = recipe.burnLevel - cookingLevel;
    let burnChance = recipe.baseBurnRate + (levelDifference * 0.02);
    
    // Fire increases burn chance by 50%
    if (!usingRange) {
      burnChance *= 1.5;
    }
    
    // Cap at 90%
    return Math.min(burnChance, 0.9);
  }

  /**
   * Attempt to cook an item
   */
  public cookItem(recipe: CookingRecipe, cookingLevel: number, usingRange: boolean = true): 'success' | 'burnt' {
    const burnChance = this.calculateBurnChance(recipe, cookingLevel, usingRange);
    return Math.random() < burnChance ? 'burnt' : 'success';
  }

  /**
   * Get cooking recipe by raw item ID
   */
  public getRecipeByRawItem(rawItemId: string): CookingRecipe | undefined {
    return this.cookingRecipes.find(recipe => recipe.rawItem === rawItemId);
  }

  /**
   * Get cooking recipe by ID
   */
  public getCookingRecipe(recipeId: string): CookingRecipe | undefined {
    return this.cookingRecipes.find(recipe => recipe.id === recipeId);
  }

  /**
   * Get all ranges in the scene
   */
  public getRanges(): THREE.Group[] {
    return this.ranges;
  }

  /**
   * Get all fires in the scene
   */
  public getFires(): THREE.Group[] {
    return this.fires;
  }

  /**
   * Add a range to the scene at a specific position
   */
  public addRange(scene: THREE.Scene, position: THREE.Vector3): THREE.Group {
    const range = this.createRangeMesh();
    range.position.copy(position);
    scene.add(range);
    this.ranges.push(range);
    return range;
  }

  /**
   * Add a fire to the scene at a specific position
   */
  public addFire(scene: THREE.Scene, position: THREE.Vector3): THREE.Group {
    const fire = this.createFireMesh();
    fire.position.copy(position);
    scene.add(fire);
    this.fires.push(fire);
    return fire;
  }
}
