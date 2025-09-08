import type { InventoryItem } from '../types/inventory';

export interface Herb {
  id: string;
  name: string;
  unfinishedPotionId: string; // ID of unfinished potion when herb is added to vial of water
  levelRequired: number;
  experience: number; // XP for cleaning the herb
}

export interface SecondaryIngredient {
  id: string;
  name: string;
  type: 'ingredient' | 'catalyst';
}

export interface HerbloreRecipe {
  id: string;
  name: string;
  unfinishedPotionId: string;
  secondaryIngredientId: string;
  resultPotionId: string;
  levelRequired: number;
  experience: number;
  effect?: PotionEffect;
}

export interface PotionEffect {
  type: 'heal' | 'boost_stat' | 'restore_stat' | 'cure_poison' | 'protection';
  statType?: string; // For stat boosts/restores
  amount: number;
  duration?: number; // For temporary effects (seconds)
}

export interface HerbloreResult {
  success: boolean;
  experience: number;
  resultItem?: InventoryItem;
  message: string;
  leveledUp?: boolean;
  newLevel?: number;
}

export class HerbloreSystem {
  private herbs: Map<string, Herb> = new Map();
  private secondaryIngredients: Map<string, SecondaryIngredient> = new Map();
  private recipes: Map<string, HerbloreRecipe> = new Map();

  constructor() {
    this.initializeHerbs();
    this.initializeSecondaryIngredients();
    this.initializeRecipes();
  }

  /**
   * Initialize herbs with authentic RSC data
   */
  private initializeHerbs(): void {
    const herbData: Herb[] = [
      {
        id: 'guam_leaf',
        name: 'Guam Leaf',
        unfinishedPotionId: 'unfinished_guam_potion',
        levelRequired: 3,
        experience: 2.5
      },
      {
        id: 'marrentill',
        name: 'Marrentill',
        unfinishedPotionId: 'unfinished_marrentill_potion',
        levelRequired: 5,
        experience: 3.75
      },
      {
        id: 'tarromin',
        name: 'Tarromin',
        unfinishedPotionId: 'unfinished_tarromin_potion',
        levelRequired: 11,
        experience: 5
      },
      {
        id: 'harralander',
        name: 'Harralander',
        unfinishedPotionId: 'unfinished_harralander_potion',
        levelRequired: 20,
        experience: 6.25
      },
      {
        id: 'ranarr_weed',
        name: 'Ranarr Weed',
        unfinishedPotionId: 'unfinished_ranarr_potion',
        levelRequired: 25,
        experience: 7.5
      },
      {
        id: 'irit_leaf',
        name: 'Irit Leaf',
        unfinishedPotionId: 'unfinished_irit_potion',
        levelRequired: 40,
        experience: 8.75
      },
      {
        id: 'avantoe',
        name: 'Avantoe',
        unfinishedPotionId: 'unfinished_avantoe_potion',
        levelRequired: 48,
        experience: 10
      },
      {
        id: 'kwuarm',
        name: 'Kwuarm',
        unfinishedPotionId: 'unfinished_kwuarm_potion',
        levelRequired: 54,
        experience: 11.25
      },
      {
        id: 'cadantine',
        name: 'Cadantine',
        unfinishedPotionId: 'unfinished_cadantine_potion',
        levelRequired: 65,
        experience: 12.5
      },
      {
        id: 'dwarf_weed',
        name: 'Dwarf Weed',
        unfinishedPotionId: 'unfinished_dwarf_weed_potion',
        levelRequired: 70,
        experience: 13.75
      }
    ];

    herbData.forEach(herb => {
      this.herbs.set(herb.id, herb);
    });
  }

  /**
   * Initialize secondary ingredients
   */
  private initializeSecondaryIngredients(): void {
    const ingredientData: SecondaryIngredient[] = [
      // Common ingredients
      { id: 'eye_of_newt', name: 'Eye of Newt', type: 'ingredient' },
      { id: 'red_spiders_eggs', name: "Red Spider's Eggs", type: 'ingredient' },
      { id: 'limpwurt_root', name: 'Limpwurt Root', type: 'ingredient' },
      { id: 'unicorn_horn_dust', name: 'Unicorn Horn Dust', type: 'ingredient' },
      { id: 'white_berries', name: 'White Berries', type: 'ingredient' },
      { id: 'snape_grass', name: 'Snape Grass', type: 'ingredient' },
      { id: 'chocolate_dust', name: 'Chocolate Dust', type: 'ingredient' },
      { id: 'wine_of_zamorak', name: 'Wine of Zamorak', type: 'ingredient' },
      { id: 'jangerberries', name: 'Jangerberries', type: 'ingredient' },
      { id: 'potato_cactus', name: 'Potato Cactus', type: 'ingredient' },
      
      // Catalysts
      { id: 'barbarian_herblore', name: 'Barbarian Herblore', type: 'catalyst' }
    ];

    ingredientData.forEach(ingredient => {
      this.secondaryIngredients.set(ingredient.id, ingredient);
    });
  }

  /**
   * Initialize herblore recipes
   */
  private initializeRecipes(): void {
    const recipeData: HerbloreRecipe[] = [
      // Attack potions
      {
        id: 'attack_potion',
        name: 'Attack Potion',
        unfinishedPotionId: 'unfinished_guam_potion',
        secondaryIngredientId: 'eye_of_newt',
        resultPotionId: 'attack_potion',
        levelRequired: 3,
        experience: 25,
        effect: { type: 'boost_stat', statType: 'attack', amount: 3, duration: 300 }
      },
      
      // Antipoison
      {
        id: 'antipoison',
        name: 'Antipoison',
        unfinishedPotionId: 'unfinished_marrentill_potion',
        secondaryIngredientId: 'unicorn_horn_dust',
        resultPotionId: 'antipoison',
        levelRequired: 5,
        experience: 37.5,
        effect: { type: 'cure_poison', amount: 1 }
      },

      // Strength potions
      {
        id: 'strength_potion',
        name: 'Strength Potion',
        unfinishedPotionId: 'unfinished_tarromin_potion',
        secondaryIngredientId: 'limpwurt_root',
        resultPotionId: 'strength_potion',
        levelRequired: 12,
        experience: 50,
        effect: { type: 'boost_stat', statType: 'strength', amount: 3, duration: 300 }
      },

      // Combat potions
      {
        id: 'combat_potion',
        name: 'Combat Potion',
        unfinishedPotionId: 'unfinished_harralander_potion',
        secondaryIngredientId: 'red_spiders_eggs',
        resultPotionId: 'combat_potion',
        levelRequired: 36,
        experience: 84,
        effect: { type: 'boost_stat', statType: 'combat', amount: 4, duration: 300 }
      },

      // Defence potions
      {
        id: 'defence_potion',
        name: 'Defence Potion',
        unfinishedPotionId: 'unfinished_ranarr_potion',
        secondaryIngredientId: 'white_berries',
        resultPotionId: 'defence_potion',
        levelRequired: 30,
        experience: 75,
        effect: { type: 'boost_stat', statType: 'defense', amount: 3, duration: 300 }
      },

      // Prayer potions
      {
        id: 'prayer_potion',
        name: 'Prayer Potion',
        unfinishedPotionId: 'unfinished_ranarr_potion',
        secondaryIngredientId: 'snape_grass',
        resultPotionId: 'prayer_potion',
        levelRequired: 38,
        experience: 87.5,
        effect: { type: 'restore_stat', statType: 'prayer', amount: 7 }
      },

      // Super attack
      {
        id: 'super_attack',
        name: 'Super Attack',
        unfinishedPotionId: 'unfinished_irit_potion',
        secondaryIngredientId: 'eye_of_newt',
        resultPotionId: 'super_attack',
        levelRequired: 45,
        experience: 100,
        effect: { type: 'boost_stat', statType: 'attack', amount: 5, duration: 300 }
      },

      // Super strength
      {
        id: 'super_strength',
        name: 'Super Strength',
        unfinishedPotionId: 'unfinished_kwuarm_potion',
        secondaryIngredientId: 'limpwurt_root',
        resultPotionId: 'super_strength',
        levelRequired: 55,
        experience: 125,
        effect: { type: 'boost_stat', statType: 'strength', amount: 5, duration: 300 }
      },

      // Super defence
      {
        id: 'super_defence',
        name: 'Super Defence',
        unfinishedPotionId: 'unfinished_cadantine_potion',
        secondaryIngredientId: 'white_berries',
        resultPotionId: 'super_defence',
        levelRequired: 66,
        experience: 150,
        effect: { type: 'boost_stat', statType: 'defense', amount: 5, duration: 300 }
      },

      // Ranging potions
      {
        id: 'ranging_potion',
        name: 'Ranging Potion',
        unfinishedPotionId: 'unfinished_dwarf_weed_potion',
        secondaryIngredientId: 'wine_of_zamorak',
        resultPotionId: 'ranging_potion',
        levelRequired: 72,
        experience: 162.5,
        effect: { type: 'boost_stat', statType: 'ranged', amount: 4, duration: 300 }
      }
    ];

    recipeData.forEach(recipe => {
      this.recipes.set(recipe.id, recipe);
    });
  }

  /**
   * Clean a grimy herb
   */
  public cleanHerb(
    grimyHerbId: string,
    playerLevel: number,
    addExperience: (skill: string, xp: number) => { newLevel?: number }
  ): HerbloreResult {
    // Remove "grimy_" prefix to get clean herb ID
    const cleanHerbId = grimyHerbId.replace('grimy_', '');
    const herb = this.herbs.get(cleanHerbId);

    if (!herb) {
      return {
        success: false,
        experience: 0,
        message: 'Unknown herb.'
      };
    }

    if (playerLevel < herb.levelRequired) {
      return {
        success: false,
        experience: 0,
        message: `You need level ${herb.levelRequired} Herblore to clean this herb.`
      };
    }

    const result = addExperience('herblore', herb.experience);

    return {
      success: true,
      experience: herb.experience,
      resultItem: {
        id: cleanHerbId,
        name: herb.name,
        quantity: 1,
        type: 'resource',
        stackable: true,
        value: 10
      },
      message: `You clean the ${herb.name.toLowerCase()}.`,
      leveledUp: !!result.newLevel,
      newLevel: result.newLevel
    };
  }

  /**
   * Create unfinished potion (herb + vial of water)
   */
  public createUnfinishedPotion(
    herbId: string,
    playerLevel: number,
    addExperience: (skill: string, xp: number) => { newLevel?: number }
  ): HerbloreResult {
    const herb = this.herbs.get(herbId);

    if (!herb) {
      return {
        success: false,
        experience: 0,
        message: 'Unknown herb.'
      };
    }

    if (playerLevel < herb.levelRequired) {
      return {
        success: false,
        experience: 0,
        message: `You need level ${herb.levelRequired} Herblore to use this herb.`
      };
    }

    // Small XP for creating unfinished potion
    const xp = Math.floor(herb.experience * 0.6);
    const result = addExperience('herblore', xp);

    return {
      success: true,
      experience: xp,
      resultItem: {
        id: herb.unfinishedPotionId,
        name: `Unfinished ${herb.name} Potion`,
        quantity: 1,
        type: 'resource',
        stackable: false,
        value: 5
      },
      message: `You add the ${herb.name.toLowerCase()} to the vial of water.`,
      leveledUp: !!result.newLevel,
      newLevel: result.newLevel
    };
  }

  /**
   * Complete a potion (unfinished potion + secondary ingredient)
   */
  public completePotion(
    recipeId: string,
    playerLevel: number,
    addExperience: (skill: string, xp: number) => { newLevel?: number }
  ): HerbloreResult {
    const recipe = this.recipes.get(recipeId);

    if (!recipe) {
      return {
        success: false,
        experience: 0,
        message: 'Unknown potion recipe.'
      };
    }

    if (playerLevel < recipe.levelRequired) {
      return {
        success: false,
        experience: 0,
        message: `You need level ${recipe.levelRequired} Herblore to make this potion.`
      };
    }

    const result = addExperience('herblore', recipe.experience);

    return {
      success: true,
      experience: recipe.experience,
      resultItem: {
        id: recipe.resultPotionId,
        name: recipe.name,
        quantity: 1,
        type: 'potion',
        stackable: false,
        value: 50,
        healAmount: recipe.effect?.type === 'heal' ? recipe.effect.amount : undefined
      },
      message: `You successfully create a ${recipe.name.toLowerCase()}.`,
      leveledUp: !!result.newLevel,
      newLevel: result.newLevel
    };
  }

  /**
   * Use a potion for its effect
   */
  public usePotion(
    potionId: string,
    currentStats: any
  ): { success: boolean; effect?: PotionEffect; message: string } {
    const recipe = Array.from(this.recipes.values()).find(r => r.resultPotionId === potionId);
    
    if (!recipe || !recipe.effect) {
      return {
        success: false,
        message: 'This potion has no effect.'
      };
    }

    return {
      success: true,
      effect: recipe.effect,
      message: this.getPotionEffectMessage(recipe.name, recipe.effect)
    };
  }

  /**
   * Get potion effect message
   */
  private getPotionEffectMessage(potionName: string, effect: PotionEffect): string {
    switch (effect.type) {
      case 'heal':
        return `You drink the ${potionName.toLowerCase()} and restore ${effect.amount} hitpoints.`;
      case 'boost_stat':
        return `You drink the ${potionName.toLowerCase()} and feel your ${effect.statType} increase by ${effect.amount}.`;
      case 'restore_stat':
        return `You drink the ${potionName.toLowerCase()} and restore ${effect.amount} ${effect.statType} points.`;
      case 'cure_poison':
        return `You drink the ${potionName.toLowerCase()} and cure yourself of poison.`;
      case 'protection':
        return `You drink the ${potionName.toLowerCase()} and feel protected.`;
      default:
        return `You drink the ${potionName.toLowerCase()}.`;
    }
  }

  /**
   * Get all herbs
   */
  public getHerbs(): Map<string, Herb> {
    return this.herbs;
  }

  /**
   * Get all recipes
   */
  public getRecipes(): Map<string, HerbloreRecipe> {
    return this.recipes;
  }

  /**
   * Get all secondary ingredients
   */
  public getSecondaryIngredients(): Map<string, SecondaryIngredient> {
    return this.secondaryIngredients;
  }

  /**
   * Find recipes that can be made with a specific unfinished potion
   */
  public getRecipesForUnfinishedPotion(unfinishedPotionId: string): HerbloreRecipe[] {
    return Array.from(this.recipes.values()).filter(
      recipe => recipe.unfinishedPotionId === unfinishedPotionId
    );
  }

  /**
   * Check if player can make a specific recipe
   */
  public canMakeRecipe(recipeId: string, playerLevel: number): boolean {
    const recipe = this.recipes.get(recipeId);
    return recipe ? playerLevel >= recipe.levelRequired : false;
  }
}
