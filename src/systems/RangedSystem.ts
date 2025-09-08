import * as THREE from 'three';

export interface RangedWeapon {
  id: string;
  name: string;
  description: string;
  type: 'shortbow' | 'longbow' | 'crossbow';
  level: number;
  rangedBonus: number;
  ammoType: 'arrow' | 'bolt';
  requiredArrows: string[];
  speed: number; // attack speed
}

export interface Ammunition {
  id: string;
  name: string;
  description: string;
  type: 'arrow' | 'bolt';
  level: number;
  rangedStrength: number;
  minimumBow: string; // minimum bow type required
  breakChance: number; // chance arrow breaks on use (0.0 - 1.0)
}

export interface RangedAttackResult {
  success: boolean;
  damage: number;
  arrowBroken: boolean;
  experience: number;
  message: string;
  ammoUsed: string;
}

export interface RangedTarget {
  type: 'npc' | 'player' | 'ground';
  position: THREE.Vector3;
  mesh?: THREE.Mesh;
  name?: string;
}

export class RangedSystem {
  // RuneScape Classic Ranged Weapons
  private weapons: Record<string, RangedWeapon> = {
    // Shortbows
    shortbow: {
      id: 'shortbow',
      name: 'Shortbow',
      description: 'A short wooden bow.',
      type: 'shortbow',
      level: 1,
      rangedBonus: 8,
      ammoType: 'arrow',
      requiredArrows: ['bronze_arrow', 'iron_arrow', 'steel_arrow', 'mithril_arrow', 'adamant_arrow', 'rune_arrow'],
      speed: 3.0
    },
    
    oak_shortbow: {
      id: 'oak_shortbow',
      name: 'Oak shortbow',
      description: 'A shortbow made from oak.',
      type: 'shortbow',
      level: 5,
      rangedBonus: 12,
      ammoType: 'arrow',
      requiredArrows: ['bronze_arrow', 'iron_arrow', 'steel_arrow', 'mithril_arrow', 'adamant_arrow', 'rune_arrow'],
      speed: 3.0
    },
    
    willow_shortbow: {
      id: 'willow_shortbow',
      name: 'Willow shortbow',
      description: 'A shortbow made from willow.',
      type: 'shortbow',
      level: 15,
      rangedBonus: 20,
      ammoType: 'arrow',
      requiredArrows: ['bronze_arrow', 'iron_arrow', 'steel_arrow', 'mithril_arrow', 'adamant_arrow', 'rune_arrow'],
      speed: 3.0
    },
    
    maple_shortbow: {
      id: 'maple_shortbow',
      name: 'Maple shortbow',
      description: 'A shortbow made from maple.',
      type: 'shortbow',
      level: 25,
      rangedBonus: 29,
      ammoType: 'arrow',
      requiredArrows: ['bronze_arrow', 'iron_arrow', 'steel_arrow', 'mithril_arrow', 'adamant_arrow', 'rune_arrow'],
      speed: 3.0
    },
    
    yew_shortbow: {
      id: 'yew_shortbow',
      name: 'Yew shortbow',
      description: 'A shortbow made from yew.',
      type: 'shortbow',
      level: 35,
      rangedBonus: 47,
      ammoType: 'arrow',
      requiredArrows: ['bronze_arrow', 'iron_arrow', 'steel_arrow', 'mithril_arrow', 'adamant_arrow', 'rune_arrow', 'ice_arrow'],
      speed: 3.0
    },
    
    magic_shortbow: {
      id: 'magic_shortbow',
      name: 'Magic shortbow',
      description: 'A shortbow made from magic wood.',
      type: 'shortbow',
      level: 45,
      rangedBonus: 69,
      ammoType: 'arrow',
      requiredArrows: ['bronze_arrow', 'iron_arrow', 'steel_arrow', 'mithril_arrow', 'adamant_arrow', 'rune_arrow', 'ice_arrow'],
      speed: 3.0
    },
    
    // Longbows
    longbow: {
      id: 'longbow',
      name: 'Longbow',
      description: 'A long wooden bow.',
      type: 'longbow',
      level: 1,
      rangedBonus: 10,
      ammoType: 'arrow',
      requiredArrows: ['bronze_arrow', 'iron_arrow', 'steel_arrow', 'mithril_arrow', 'adamant_arrow', 'rune_arrow'],
      speed: 4.2
    },
    
    oak_longbow: {
      id: 'oak_longbow',
      name: 'Oak longbow',
      description: 'A longbow made from oak.',
      type: 'longbow',
      level: 10,
      rangedBonus: 15,
      ammoType: 'arrow',
      requiredArrows: ['bronze_arrow', 'iron_arrow', 'steel_arrow', 'mithril_arrow', 'adamant_arrow', 'rune_arrow'],
      speed: 4.2
    },
    
    willow_longbow: {
      id: 'willow_longbow',
      name: 'Willow longbow',
      description: 'A longbow made from willow.',
      type: 'longbow',
      level: 20,
      rangedBonus: 25,
      ammoType: 'arrow',
      requiredArrows: ['bronze_arrow', 'iron_arrow', 'steel_arrow', 'mithril_arrow', 'adamant_arrow', 'rune_arrow'],
      speed: 4.2
    },
    
    maple_longbow: {
      id: 'maple_longbow',
      name: 'Maple longbow',
      description: 'A longbow made from maple.',
      type: 'longbow',
      level: 30,
      rangedBonus: 37,
      ammoType: 'arrow',
      requiredArrows: ['bronze_arrow', 'iron_arrow', 'steel_arrow', 'mithril_arrow', 'adamant_arrow', 'rune_arrow'],
      speed: 4.2
    },
    
    yew_longbow: {
      id: 'yew_longbow',
      name: 'Yew longbow',
      description: 'A longbow made from yew.',
      type: 'longbow',
      level: 40,
      rangedBonus: 56,
      ammoType: 'arrow',
      requiredArrows: ['bronze_arrow', 'iron_arrow', 'steel_arrow', 'mithril_arrow', 'adamant_arrow', 'rune_arrow', 'ice_arrow'],
      speed: 4.2
    },
    
    magic_longbow: {
      id: 'magic_longbow',
      name: 'Magic longbow',
      description: 'A longbow made from magic wood.',
      type: 'longbow',
      level: 50,
      rangedBonus: 78,
      ammoType: 'arrow',
      requiredArrows: ['bronze_arrow', 'iron_arrow', 'steel_arrow', 'mithril_arrow', 'adamant_arrow', 'rune_arrow', 'ice_arrow'],
      speed: 4.2
    },
    
    // Crossbows
    crossbow: {
      id: 'crossbow',
      name: 'Crossbow',
      description: 'A wooden crossbow.',
      type: 'crossbow',
      level: 1,
      rangedBonus: 14,
      ammoType: 'bolt',
      requiredArrows: ['crossbow_bolt', 'oyster_pearl_bolt'],
      speed: 4.8
    },
    
    phoenix_crossbow: {
      id: 'phoenix_crossbow',
      name: 'Phoenix crossbow',
      description: 'A magical crossbow from the Shield of Arrav quest.',
      type: 'crossbow',
      level: 1,
      rangedBonus: 14,
      ammoType: 'bolt',
      requiredArrows: ['crossbow_bolt', 'oyster_pearl_bolt'],
      speed: 4.8
    }
  };

  private ammunition: Record<string, Ammunition> = {
    // Arrows
    bronze_arrow: {
      id: 'bronze_arrow',
      name: 'Bronze arrow',
      description: 'An arrow with a bronze tip.',
      type: 'arrow',
      level: 1,
      rangedStrength: 1,
      minimumBow: 'shortbow',
      breakChance: 0.1
    },
    
    iron_arrow: {
      id: 'iron_arrow',
      name: 'Iron arrow',
      description: 'An arrow with an iron tip.',
      type: 'arrow',
      level: 1,
      rangedStrength: 4,
      minimumBow: 'shortbow',
      breakChance: 0.1
    },
    
    steel_arrow: {
      id: 'steel_arrow',
      name: 'Steel arrow',
      description: 'An arrow with a steel tip.',
      type: 'arrow',
      level: 5,
      rangedStrength: 7,
      minimumBow: 'oak_shortbow',
      breakChance: 0.1
    },
    
    mithril_arrow: {
      id: 'mithril_arrow',
      name: 'Mithril arrow',
      description: 'An arrow with a mithril tip.',
      type: 'arrow',
      level: 15,
      rangedStrength: 12,
      minimumBow: 'willow_shortbow',
      breakChance: 0.1
    },
    
    adamant_arrow: {
      id: 'adamant_arrow',
      name: 'Adamant arrow',
      description: 'An arrow with an adamant tip.',
      type: 'arrow',
      level: 25,
      rangedStrength: 19,
      minimumBow: 'maple_shortbow',
      breakChance: 0.1
    },
    
    rune_arrow: {
      id: 'rune_arrow',
      name: 'Rune arrow',
      description: 'An arrow with a rune tip.',
      type: 'arrow',
      level: 35,
      rangedStrength: 31,
      minimumBow: 'yew_shortbow',
      breakChance: 0.1
    },
    
    ice_arrow: {
      id: 'ice_arrow',
      name: 'Ice arrow',
      description: 'A magical ice arrow.',
      type: 'arrow',
      level: 35,
      rangedStrength: 29,
      minimumBow: 'yew_shortbow',
      breakChance: 0.15
    },
    
    lit_arrow: {
      id: 'lit_arrow',
      name: 'Lit arrow',
      description: 'An arrow with a lit tip, used for special purposes.',
      type: 'arrow',
      level: 1,
      rangedStrength: 1,
      minimumBow: 'shortbow',
      breakChance: 1.0 // Always breaks
    },
    
    // Bolts
    crossbow_bolt: {
      id: 'crossbow_bolt',
      name: 'Crossbow bolt',
      description: 'A standard crossbow bolt.',
      type: 'bolt',
      level: 1,
      rangedStrength: 10,
      minimumBow: 'crossbow',
      breakChance: 0.1
    },
    
    oyster_pearl_bolt: {
      id: 'oyster_pearl_bolt',
      name: 'Oyster pearl bolt',
      description: 'A crossbow bolt tipped with oyster pearl.',
      type: 'bolt',
      level: 1,
      rangedStrength: 12,
      minimumBow: 'crossbow',
      breakChance: 0.08
    }
  };

  /**
   * Get all available ranged weapons
   */
  getWeapons(): Record<string, RangedWeapon> {
    return this.weapons;
  }

  /**
   * Get all available ammunition
   */
  getAmmunition(): Record<string, Ammunition> {
    return this.ammunition;
  }

  /**
   * Get weapon by ID
   */
  getWeapon(weaponId: string): RangedWeapon | null {
    return this.weapons[weaponId] || null;
  }

  /**
   * Get ammunition by ID
   */
  getAmmo(ammoId: string): Ammunition | null {
    return this.ammunition[ammoId] || null;
  }

  /**
   * Check if player can use a ranged weapon
   */
  canUseWeapon(weaponId: string, rangedLevel: number): boolean {
    const weapon = this.getWeapon(weaponId);
    if (!weapon) return false;
    
    return rangedLevel >= weapon.level;
  }

  /**
   * Check if ammunition is compatible with weapon
   */
  isAmmoCompatible(weaponId: string, ammoId: string): boolean {
    const weapon = this.getWeapon(weaponId);
    const ammo = this.getAmmo(ammoId);
    
    if (!weapon || !ammo) return false;
    
    // Check if ammo type matches weapon
    if (weapon.ammoType !== ammo.type) return false;
    
    // Check if weapon supports this arrow type
    return weapon.requiredArrows.includes(ammoId);
  }

  /**
   * Get the best available ammunition from inventory
   */
  getBestAmmo(weaponId: string, inventory: Record<string, number>): string | null {
    const weapon = this.getWeapon(weaponId);
    if (!weapon) return null;

    // Sort ammunition by ranged strength (highest first)
    const availableAmmo = weapon.requiredArrows
      .filter(ammoId => inventory[ammoId] && inventory[ammoId] > 0)
      .map(ammoId => ({ id: ammoId, ammo: this.getAmmo(ammoId)! }))
      .sort((a, b) => b.ammo.rangedStrength - a.ammo.rangedStrength);

    return availableAmmo.length > 0 ? availableAmmo[0].id : null;
  }

  /**
   * Calculate ranged attack bonus
   */
  calculateRangedAttack(weaponId: string, rangedLevel: number): number {
    const weapon = this.getWeapon(weaponId);
    if (!weapon) return 0;

    // RSC ranged attack formula: (ranged_level * 1.5) + weapon_bonus
    return Math.floor(rangedLevel * 1.5) + weapon.rangedBonus;
  }

  /**
   * Calculate ranged strength bonus
   */
  calculateRangedStrength(weaponId: string, ammoId: string, rangedLevel: number): number {
    const weapon = this.getWeapon(weaponId);
    const ammo = this.getAmmo(ammoId);
    
    if (!weapon || !ammo) return 0;

    // RSC ranged strength formula: (ranged_level * 0.25) + ammo_strength
    return Math.floor(rangedLevel * 0.25) + ammo.rangedStrength;
  }

  /**
   * Calculate maximum ranged hit
   */
  calculateMaxHit(weaponId: string, ammoId: string, rangedLevel: number): number {
    const strengthBonus = this.calculateRangedStrength(weaponId, ammoId, rangedLevel);
    
    // RSC ranged max hit formula
    return Math.floor((rangedLevel + strengthBonus) * 0.325) + 1;
  }

  /**
   * Perform a ranged attack
   */
  performRangedAttack(
    weaponId: string,
    ammoId: string,
    rangedLevel: number,
    target: RangedTarget,
    inventory: Record<string, number>
  ): RangedAttackResult | null {
    const weapon = this.getWeapon(weaponId);
    const ammo = this.getAmmo(ammoId);
    
    if (!weapon || !ammo) {
      return null;
    }

    // Check if player has ammunition
    if (!inventory[ammoId] || inventory[ammoId] <= 0) {
      return {
        success: false,
        damage: 0,
        arrowBroken: false,
        experience: 0,
        message: `You have no ${ammo.name}s left!`,
        ammoUsed: ammoId
      };
    }

    // Check compatibility
    if (!this.isAmmoCompatible(weaponId, ammoId)) {
      return {
        success: false,
        damage: 0,
        arrowBroken: false,
        experience: 0,
        message: `${ammo.name} is not compatible with ${weapon.name}!`,
        ammoUsed: ammoId
      };
    }

    // Calculate damage
    const maxHit = this.calculateMaxHit(weaponId, ammoId, rangedLevel);
    const damage = Math.floor(Math.random() * (maxHit + 1));
    
    // Check if arrow breaks
    const arrowBroken = Math.random() < ammo.breakChance;
    
    // Calculate experience (4 * damage dealt)
    const experience = damage * 4;

    return {
      success: true,
      damage,
      arrowBroken,
      experience,
      message: `You shot ${target.name || 'the target'} for ${damage} damage!`,
      ammoUsed: ammoId
    };
  }

  /**
   * Get attack speed for weapon (in game ticks)
   */
  getAttackSpeed(weaponId: string): number {
    const weapon = this.getWeapon(weaponId);
    return weapon ? weapon.speed : 4.0;
  }

  /**
   * Check if target is in range
   */
  isInRange(attackerPos: THREE.Vector3, targetPos: THREE.Vector3, maxRange: number = 8): boolean {
    const distance = attackerPos.distanceTo(targetPos);
    return distance <= maxRange;
  }

  /**
   * Get ranged equipment requirements text
   */
  getWeaponRequirements(weaponId: string): string {
    const weapon = this.getWeapon(weaponId);
    if (!weapon) return '';
    
    return `Requires level ${weapon.level} Ranged`;
  }

  /**
   * Get ammunition requirements text
   */
  getAmmoRequirements(ammoId: string): string {
    const ammo = this.getAmmo(ammoId);
    if (!ammo) return '';
    
    return `Requires ${ammo.minimumBow} or better`;
  }
}
