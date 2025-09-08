import type { InventoryItem } from '../types/inventory';

export type CombatStyleName = 'accurate' | 'aggressive' | 'defensive' | 'controlled' | 'cast' | 'rapid' | 'longrange' | 'poison';

export interface CombatStyleDefinition {
  name: CombatStyleName;
  label: string;
  description: string;
  attackBonus: number;
  strengthBonus: number;
  defenseBonus: number;
  attackSpeedModifier: number; // Multiplier for attack speed (1.0 = normal, 0.8 = faster, 1.2 = slower)
  rangeBonus?: number; // For ranged weapons
  xpDistribution: {
    attack?: number;
    strength?: number;
    defense?: number;
    ranged?: number;
    magic?: number;
  };
  requirements?: {
    weaponTypes?: string[];
    itemIds?: string[];
  };
}

export type WeaponCategory = 'sword' | 'dagger' | 'axe' | 'mace' | 'battleaxe' | '2h_sword' | 'staff' | 'bow' | 'crossbow' | 'unarmed';

export const COMBAT_STYLE_DEFINITIONS: Record<CombatStyleName, CombatStyleDefinition> = {
  accurate: {
    name: 'accurate',
    label: 'Accurate',
    description: '+3 Attack bonus, Attack XP only',
    attackBonus: 3,
    strengthBonus: 0,
    defenseBonus: 0,
    attackSpeedModifier: 1.0,
    xpDistribution: { attack: 4 }
  },
  
  aggressive: {
    name: 'aggressive',
    label: 'Aggressive',
    description: '+3 Strength bonus, Strength XP only',
    attackBonus: 0,
    strengthBonus: 3,
    defenseBonus: 0,
    attackSpeedModifier: 1.0,
    xpDistribution: { strength: 4 }
  },
  
  defensive: {
    name: 'defensive',
    label: 'Defensive',
    description: '+3 Defense bonus, Defense XP only',
    attackBonus: 0,
    strengthBonus: 0,
    defenseBonus: 3,
    attackSpeedModifier: 1.0,
    xpDistribution: { defense: 4 }
  },
  
  controlled: {
    name: 'controlled',
    label: 'Controlled',
    description: '+1 to all bonuses, shared XP',
    attackBonus: 1,
    strengthBonus: 1,
    defenseBonus: 1,
    attackSpeedModifier: 1.0,
    xpDistribution: { attack: 1.33, strength: 1.33, defense: 1.33 }
  },
  
  cast: {
    name: 'cast',
    label: 'Cast',
    description: 'Enable spell casting, Magic XP',
    attackBonus: 0,
    strengthBonus: 0,
    defenseBonus: 0,
    attackSpeedModifier: 1.0,
    xpDistribution: { magic: 4 },
    requirements: { weaponTypes: ['staff'] }
  },
  
  rapid: {
    name: 'rapid',
    label: 'Rapid',
    description: 'Faster attacks, Ranged XP only',
    attackBonus: 0,
    strengthBonus: 0,
    defenseBonus: 0,
    attackSpeedModifier: 0.8, // 20% faster attacks
    rangeBonus: 0,
    xpDistribution: { ranged: 4 },
    requirements: { weaponTypes: ['bow', 'crossbow'] }
  },
  
  longrange: {
    name: 'longrange',
    label: 'Long Range',
    description: '+3 Range bonus, slower attacks, shared XP',
    attackBonus: 0,
    strengthBonus: 0,
    defenseBonus: 0,
    attackSpeedModifier: 1.2, // 20% slower attacks
    rangeBonus: 3,
    xpDistribution: { ranged: 2, defense: 2 },
    requirements: { weaponTypes: ['bow', 'crossbow'] }
  },
  
  poison: {
    name: 'poison',
    label: 'Poison',
    description: 'Chance to poison target, Strength XP',
    attackBonus: 0,
    strengthBonus: 2,
    defenseBonus: 0,
    attackSpeedModifier: 1.0,
    xpDistribution: { strength: 4 },
    requirements: { itemIds: ['poisoned_dagger', 'poisoned_spear'] } // Would need to add these items
  }
};

export const WEAPON_COMBAT_STYLES: Record<WeaponCategory, CombatStyleName[]> = {
  sword: ['accurate', 'aggressive', 'defensive', 'controlled'],
  dagger: ['accurate', 'aggressive', 'defensive'],
  axe: ['accurate', 'aggressive', 'controlled'],
  mace: ['accurate', 'aggressive', 'defensive'],
  battleaxe: ['accurate', 'aggressive'],
  '2h_sword': ['accurate', 'aggressive'],
  staff: ['accurate', 'aggressive', 'defensive', 'cast'],
  bow: ['accurate', 'rapid', 'longrange'],
  crossbow: ['accurate', 'rapid', 'longrange'],
  unarmed: ['accurate', 'aggressive', 'defensive']
};

export class EnhancedCombatStyleSystem {
  
  /**
   * Get the weapon category based on the item
   */
  static getWeaponCategory(weapon: InventoryItem | null): WeaponCategory {
    if (!weapon) return 'unarmed';
    
    const weaponId = weapon.id.toLowerCase();
    
    // Check weapon type by ID patterns
    if (weaponId.includes('dagger')) return 'dagger';
    if (weaponId.includes('battleaxe')) return 'battleaxe';
    if (weaponId.includes('2h_sword') || weaponId.includes('two_handed')) return '2h_sword';
    if (weaponId.includes('axe')) return 'axe';
    if (weaponId.includes('mace') || weaponId.includes('hammer')) return 'mace';
    if (weaponId.includes('staff') || weaponId.includes('wand')) return 'staff';
    if (weaponId.includes('bow')) return 'bow';
    if (weaponId.includes('crossbow')) return 'crossbow';
    if (weaponId.includes('sword') || weaponId.includes('blade')) return 'sword';
    
    // Default to sword for most melee weapons
    return 'sword';
  }
  
  /**
   * Get available combat styles for a weapon
   */
  static getAvailableStyles(weapon: InventoryItem | null): CombatStyleName[] {
    const category = this.getWeaponCategory(weapon);
    return WEAPON_COMBAT_STYLES[category] || WEAPON_COMBAT_STYLES.unarmed;
  }
  
  /**
   * Check if a combat style is valid for the current weapon
   */
  static isStyleValidForWeapon(style: CombatStyleName, weapon: InventoryItem | null): boolean {
    const availableStyles = this.getAvailableStyles(weapon);
    return availableStyles.includes(style);
  }
  
  /**
   * Get the definition for a combat style
   */
  static getStyleDefinition(style: CombatStyleName): CombatStyleDefinition {
    return COMBAT_STYLE_DEFINITIONS[style];
  }
  
  /**
   * Get the default combat style for a weapon
   */
  static getDefaultStyleForWeapon(weapon: InventoryItem | null): CombatStyleName {
    const availableStyles = this.getAvailableStyles(weapon);
    return availableStyles[0] || 'accurate';
  }
  
  /**
   * Get style bonuses for combat calculations
   */
  static getStyleBonuses(style: CombatStyleName): {
    attack: number;
    strength: number;
    defense: number;
    ranged?: number;
  } {
    const def = COMBAT_STYLE_DEFINITIONS[style];
    return {
      attack: def.attackBonus,
      strength: def.strengthBonus,
      defense: def.defenseBonus,
      ranged: def.rangeBonus
    };
  }
  
  /**
   * Get attack speed modifier for combat timing
   */
  static getAttackSpeedModifier(style: CombatStyleName): number {
    return COMBAT_STYLE_DEFINITIONS[style].attackSpeedModifier;
  }
  
  /**
   * Get XP distribution for the combat style
   */
  static getXpDistribution(style: CombatStyleName): Record<string, number> {
    return COMBAT_STYLE_DEFINITIONS[style].xpDistribution;
  }
  
  /**
   * Auto-switch to a valid combat style when weapon changes
   */
  static autoSwitchStyle(currentStyle: CombatStyleName, newWeapon: InventoryItem | null): CombatStyleName {
    const availableStyles = this.getAvailableStyles(newWeapon);
    
    // If current style is valid for new weapon, keep it
    if (availableStyles.includes(currentStyle)) {
      return currentStyle;
    }
    
    // Try to find a similar style
    const stylePreferences: Record<CombatStyleName, CombatStyleName[]> = {
      accurate: ['accurate'],
      aggressive: ['aggressive'],
      defensive: ['defensive'],
      controlled: ['controlled', 'accurate'],
      cast: ['cast', 'accurate'],
      rapid: ['rapid', 'accurate'],
      longrange: ['longrange', 'accurate'],
      poison: ['poison', 'aggressive']
    };
    
    const preferences = stylePreferences[currentStyle] || ['accurate'];
    
    for (const preferred of preferences) {
      if (availableStyles.includes(preferred)) {
        return preferred;
      }
    }
    
    // Fall back to first available style
    return availableStyles[0] || 'accurate';
  }
}

export default EnhancedCombatStyleSystem;
