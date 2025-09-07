import * as THREE from 'three';
import type { InventorySlot } from '../types/inventory';

// Smithing recipe interface
export interface SmithingRecipe {
  id: string;
  name: string;
  requiredLevel: number;
  bars: { itemId: string; quantity: number }[];
  result: { itemId: string; quantity: number };
  experience: number;
}

// Smelting recipe interface (ore to bars)
export interface SmeltingRecipe {
  id: string;
  name: string;
  requiredLevel: number;
  materials: { itemId: string; quantity: number }[];
  result: { itemId: string; quantity: number };
  experience: number;
}

export class SmithingSystem {
  private furnaces: THREE.Group[] = [];

  // Smelting recipes (ore to bars)
  private smeltingRecipes: SmeltingRecipe[] = [
    {
      id: 'bronze_bar_smelt',
      name: 'Bronze bar',
      requiredLevel: 1,
      materials: [
        { itemId: 'copper_ore', quantity: 1 },
        { itemId: 'tin_ore', quantity: 1 }
      ],
      result: { itemId: 'bronze_bar', quantity: 1 },
      experience: 6.25
    },
    {
      id: 'iron_bar_smelt',
      name: 'Iron bar',
      requiredLevel: 15,
      materials: [
        { itemId: 'iron_ore', quantity: 1 }
      ],
      result: { itemId: 'iron_bar', quantity: 1 },
      experience: 12.5
    },
    {
      id: 'steel_bar_smelt',
      name: 'Steel bar',
      requiredLevel: 30,
      materials: [
        { itemId: 'iron_ore', quantity: 1 },
        { itemId: 'coal', quantity: 2 }
      ],
      result: { itemId: 'steel_bar', quantity: 1 },
      experience: 17.5
    },
    {
      id: 'mithril_bar_smelt',
      name: 'Mithril bar',
      requiredLevel: 50,
      materials: [
        { itemId: 'mithril_ore', quantity: 1 },
        { itemId: 'coal', quantity: 4 }
      ],
      result: { itemId: 'mithril_bar', quantity: 1 },
      experience: 30
    },
    {
      id: 'adamant_bar_smelt',
      name: 'Adamant bar',
      requiredLevel: 70,
      materials: [
        { itemId: 'adamant_ore', quantity: 1 },
        { itemId: 'coal', quantity: 6 }
      ],
      result: { itemId: 'adamant_bar', quantity: 1 },
      experience: 37.5
    },
    {
      id: 'rune_bar_smelt',
      name: 'Rune bar',
      requiredLevel: 85,
      materials: [
        { itemId: 'runite_ore', quantity: 1 },
        { itemId: 'coal', quantity: 8 }
      ],
      result: { itemId: 'rune_bar', quantity: 1 },
      experience: 50
    }
  ];

  // Smithing recipes (bars to items)
  private smithingRecipes: SmithingRecipe[] = [
    // Bronze items
    {
      id: 'bronze_dagger_smith',
      name: 'Bronze dagger',
      requiredLevel: 1,
      bars: [{ itemId: 'bronze_bar', quantity: 1 }],
      result: { itemId: 'bronze_dagger', quantity: 1 },
      experience: 12.5
    },
    {
      id: 'bronze_sword_smith',
      name: 'Bronze sword',
      requiredLevel: 4,
      bars: [{ itemId: 'bronze_bar', quantity: 1 }],
      result: { itemId: 'bronze_sword', quantity: 1 },
      experience: 12.5
    },
    {
      id: 'bronze_mace_smith',
      name: 'Bronze mace',
      requiredLevel: 2,
      bars: [{ itemId: 'bronze_bar', quantity: 1 }],
      result: { itemId: 'bronze_mace', quantity: 1 },
      experience: 12.5
    },
    {
      id: 'bronze_axe_smith',
      name: 'Bronze axe',
      requiredLevel: 1,
      bars: [{ itemId: 'bronze_bar', quantity: 1 }],
      result: { itemId: 'bronze_axe', quantity: 1 },
      experience: 12.5
    },
    {
      id: 'bronze_battleaxe_smith',
      name: 'Bronze battleaxe',
      requiredLevel: 10,
      bars: [{ itemId: 'bronze_bar', quantity: 3 }],
      result: { itemId: 'bronze_battleaxe', quantity: 1 },
      experience: 37.5
    },
    {
      id: 'bronze_helmet_smith',
      name: 'Bronze helmet',
      requiredLevel: 1,
      bars: [{ itemId: 'bronze_bar', quantity: 1 }],
      result: { itemId: 'bronze_helmet', quantity: 1 },
      experience: 12.5
    },
    {
      id: 'bronze_chainmail_smith',
      name: 'Bronze chainmail',
      requiredLevel: 11,
      bars: [{ itemId: 'bronze_bar', quantity: 3 }],
      result: { itemId: 'bronze_chainmail', quantity: 1 },
      experience: 37.5
    },
    {
      id: 'bronze_platelegs_smith',
      name: 'Bronze platelegs',
      requiredLevel: 16,
      bars: [{ itemId: 'bronze_bar', quantity: 3 }],
      result: { itemId: 'bronze_platelegs', quantity: 1 },
      experience: 37.5
    },

    // Iron items
    {
      id: 'iron_dagger_smith',
      name: 'Iron dagger',
      requiredLevel: 15,
      bars: [{ itemId: 'iron_bar', quantity: 1 }],
      result: { itemId: 'iron_dagger', quantity: 1 },
      experience: 25
    },
    {
      id: 'iron_sword_smith',
      name: 'Iron sword',
      requiredLevel: 19,
      bars: [{ itemId: 'iron_bar', quantity: 1 }],
      result: { itemId: 'iron_sword', quantity: 1 },
      experience: 25
    },
    {
      id: 'iron_mace_smith',
      name: 'Iron mace',
      requiredLevel: 17,
      bars: [{ itemId: 'iron_bar', quantity: 1 }],
      result: { itemId: 'iron_mace', quantity: 1 },
      experience: 25
    },
    {
      id: 'iron_battleaxe_smith',
      name: 'Iron battleaxe',
      requiredLevel: 25,
      bars: [{ itemId: 'iron_bar', quantity: 3 }],
      result: { itemId: 'iron_battleaxe', quantity: 1 },
      experience: 75
    },
    {
      id: 'iron_helmet_smith',
      name: 'Iron helmet',
      requiredLevel: 15,
      bars: [{ itemId: 'iron_bar', quantity: 1 }],
      result: { itemId: 'iron_helmet', quantity: 1 },
      experience: 25
    },
    {
      id: 'iron_chainmail_smith',
      name: 'Iron chainmail',
      requiredLevel: 26,
      bars: [{ itemId: 'iron_bar', quantity: 3 }],
      result: { itemId: 'iron_chainmail', quantity: 1 },
      experience: 75
    },
    {
      id: 'iron_platelegs_smith',
      name: 'Iron platelegs',
      requiredLevel: 31,
      bars: [{ itemId: 'iron_bar', quantity: 3 }],
      result: { itemId: 'iron_platelegs', quantity: 1 },
      experience: 75
    },

    // Steel items (similar pattern continues for other metals)
    {
      id: 'steel_sword_smith',
      name: 'Steel sword',
      requiredLevel: 34,
      bars: [{ itemId: 'steel_bar', quantity: 1 }],
      result: { itemId: 'steel_sword', quantity: 1 },
      experience: 37.5
    },
    {
      id: 'steel_helmet_smith',
      name: 'Steel helmet',
      requiredLevel: 30,
      bars: [{ itemId: 'steel_bar', quantity: 1 }],
      result: { itemId: 'steel_helmet', quantity: 1 },
      experience: 37.5
    },
    {
      id: 'steel_chainmail_smith',
      name: 'Steel chainmail',
      requiredLevel: 41,
      bars: [{ itemId: 'steel_bar', quantity: 3 }],
      result: { itemId: 'steel_chainmail', quantity: 1 },
      experience: 112.5
    },
    {
      id: 'steel_platelegs_smith',
      name: 'Steel platelegs',
      requiredLevel: 46,
      bars: [{ itemId: 'steel_bar', quantity: 3 }],
      result: { itemId: 'steel_platelegs', quantity: 1 },
      experience: 112.5
    }
  ];

  /**
   * Create a furnace mesh for smelting
   */
  public createFurnaceMesh(): THREE.Group {
    const furnace = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.BoxGeometry(2, 1, 2);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.5;
    base.castShadow = true;
    furnace.add(base);
    
    // Furnace body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.75;
    body.castShadow = true;
    furnace.add(body);
    
    // Chimney
    const chimneyGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2);
    const chimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.y = 3.5;
    chimney.castShadow = true;
    furnace.add(chimney);

    // Store furnace data
    furnace.userData = { type: 'furnace', canSmelt: true };
    
    return furnace;
  }

  /**
   * Create an anvil mesh for smithing
   */
  public createAnvilMesh(): THREE.Group {
    const anvil = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.BoxGeometry(1, 0.5, 1);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.25;
    base.castShadow = true;
    anvil.add(base);
    
    // Anvil body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 0.3, 0.8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.65;
    body.castShadow = true;
    anvil.add(body);
    
    // Horn
    const hornGeometry = new THREE.ConeGeometry(0.1, 0.6, 8);
    const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });
    const horn = new THREE.Mesh(hornGeometry, hornMaterial);
    horn.position.set(0.8, 0.65, 0);
    horn.rotation.z = Math.PI / 2;
    horn.castShadow = true;
    anvil.add(horn);

    // Store anvil data
    anvil.userData = { type: 'anvil', canSmith: true };
    
    return anvil;
  }

  /**
   * Get available smelting recipes for a given smithing level
   */
  public getAvailableSmeltingRecipes(smithingLevel: number): SmeltingRecipe[] {
    return this.smeltingRecipes.filter(recipe => recipe.requiredLevel <= smithingLevel);
  }

  /**
   * Get available smithing recipes for a given smithing level
   */
  public getAvailableSmithingRecipes(smithingLevel: number): SmithingRecipe[] {
    return this.smithingRecipes.filter(recipe => recipe.requiredLevel <= smithingLevel);
  }

  /**
   * Check if player has required materials for smelting
   */
  public canSmelt(recipe: SmeltingRecipe, inventory: InventorySlot[]): boolean {
    for (const material of recipe.materials) {
      const found = inventory.find(slot => 
        slot.item && 
        slot.item.id === material.itemId && 
        slot.item.quantity >= material.quantity
      );
      if (!found) return false;
    }
    return true;
  }

  /**
   * Check if player has required bars for smithing
   */
  public canSmith(recipe: SmithingRecipe, inventory: InventorySlot[]): boolean {
    for (const bar of recipe.bars) {
      const found = inventory.find(slot => 
        slot.item && 
        slot.item.id === bar.itemId && 
        slot.item.quantity >= bar.quantity
      );
      if (!found) return false;
    }
    return true;
  }

  /**
   * Get smelting recipe by ID
   */
  public getSmeltingRecipe(recipeId: string): SmeltingRecipe | undefined {
    return this.smeltingRecipes.find(recipe => recipe.id === recipeId);
  }

  /**
   * Get smithing recipe by ID
   */
  public getSmithingRecipe(recipeId: string): SmithingRecipe | undefined {
    return this.smithingRecipes.find(recipe => recipe.id === recipeId);
  }

  /**
   * Get all furnaces in the scene
   */
  public getFurnaces(): THREE.Group[] {
    return this.furnaces;
  }

  /**
   * Add a furnace to the scene at a specific position
   */
  public addFurnace(scene: THREE.Scene, position: THREE.Vector3): THREE.Group {
    const furnace = this.createFurnaceMesh();
    furnace.position.copy(position);
    scene.add(furnace);
    this.furnaces.push(furnace);
    return furnace;
  }
}
