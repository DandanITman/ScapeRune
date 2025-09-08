export interface SpecialAttack {
  id: string;
  name: string;
  description: string;
  energyCost: number; // Percentage of special attack energy consumed (0-100)
  damageMultiplier: number; // Damage multiplier (1.0 = normal damage, 1.5 = 50% more)
  accuracy: number; // Hit chance modifier (1.0 = normal, 1.2 = 20% more accurate)
  effect?: SpecialEffect;
  animation?: string;
  soundEffect?: string;
  cooldown?: number; // Cooldown in seconds (if applicable)
}

export interface SpecialEffect {
  type: 'damage' | 'heal' | 'drain' | 'boost' | 'poison' | 'stun' | 'knockback' | 'teleport';
  value?: number; // Effect strength
  duration?: number; // Effect duration in seconds
  chance?: number; // Chance of effect occurring (0.0-1.0)
  target?: 'self' | 'enemy' | 'both';
}

export interface SpecialAttackResult {
  success: boolean;
  hit: boolean;
  damage: number;
  effect?: string;
  message: string;
  energyUsed: number;
  criticalHit?: boolean;
}

export interface SpecialAttackEnergy {
  current: number; // Current energy (0-100)
  maximum: number; // Maximum energy (always 100)
  regenRate: number; // Energy regeneration per second
}

export class SpecialAttacksSystem {
  // RuneScape Classic Inspired Special Attacks
  private specialAttacks: Record<string, SpecialAttack> = {
    // Dagger Specials - Fast, accurate strikes
    precise_stab: {
      id: 'precise_stab',
      name: 'Precise Stab',
      description: 'A precise stab that never misses and deals extra damage.',
      energyCost: 25,
      damageMultiplier: 1.2,
      accuracy: 2.0, // Always hits
      animation: 'stab',
      soundEffect: 'blade_strike'
    },

    poison_strike: {
      id: 'poison_strike',
      name: 'Poison Strike',
      description: 'A venomous strike that poisons the enemy.',
      energyCost: 30,
      damageMultiplier: 1.1,
      accuracy: 1.1,
      effect: {
        type: 'poison',
        value: 2, // 2 damage per tick
        duration: 30, // 30 seconds
        chance: 0.8, // 80% chance
        target: 'enemy'
      },
      animation: 'poison_stab',
      soundEffect: 'poison_hiss'
    },

    // Sword Specials - Balanced offensive abilities
    power_slash: {
      id: 'power_slash',
      name: 'Power Slash',
      description: 'A powerful slash that deals heavy damage.',
      energyCost: 40,
      damageMultiplier: 1.5,
      accuracy: 0.9, // Slightly less accurate
      animation: 'heavy_slash',
      soundEffect: 'sword_clash'
    },

    whirlwind: {
      id: 'whirlwind',
      name: 'Whirlwind',
      description: 'A spinning attack that can hit multiple enemies.',
      energyCost: 50,
      damageMultiplier: 1.3,
      accuracy: 1.0,
      effect: {
        type: 'knockback',
        value: 1, // Knockback distance
        duration: 2, // Stun duration
        chance: 0.6,
        target: 'enemy'
      },
      animation: 'spin_attack',
      soundEffect: 'whoosh'
    },

    // Axe Specials - High damage, slow attacks
    crushing_blow: {
      id: 'crushing_blow',
      name: 'Crushing Blow',
      description: 'A devastating overhead strike.',
      energyCost: 45,
      damageMultiplier: 1.8,
      accuracy: 0.8, // Lower accuracy but high damage
      effect: {
        type: 'stun',
        duration: 3, // 3 second stun
        chance: 0.4,
        target: 'enemy'
      },
      animation: 'overhead_strike',
      soundEffect: 'crushing_impact'
    },

    berserker_rage: {
      id: 'berserker_rage',
      name: 'Berserker Rage',
      description: 'Enter a rage that boosts attack and strength temporarily.',
      energyCost: 60,
      damageMultiplier: 1.0,
      accuracy: 1.0,
      effect: {
        type: 'boost',
        value: 1.2, // 20% boost to attack and strength
        duration: 15, // 15 seconds
        chance: 1.0,
        target: 'self'
      },
      animation: 'rage_roar',
      soundEffect: 'battle_cry'
    },

    // Mace Specials - Prayer and defensive abilities
    prayer_drain: {
      id: 'prayer_drain',
      name: 'Prayer Drain',
      description: 'A strike that drains enemy prayer points.',
      energyCost: 35,
      damageMultiplier: 1.1,
      accuracy: 1.0,
      effect: {
        type: 'drain',
        value: 10, // Drain 10 prayer points
        duration: 0,
        chance: 0.7,
        target: 'enemy'
      },
      animation: 'holy_strike',
      soundEffect: 'divine_chime'
    },

    divine_protection: {
      id: 'divine_protection',
      name: 'Divine Protection',
      description: 'Grants temporary defense boost and prayer point restoration.',
      energyCost: 50,
      damageMultiplier: 1.0,
      accuracy: 1.0,
      effect: {
        type: 'heal',
        value: 15, // Restore 15 prayer points
        duration: 10, // 10 second defense boost
        chance: 1.0,
        target: 'self'
      },
      animation: 'divine_shield',
      soundEffect: 'holy_blessing'
    },

    // 2-Handed Sword Specials - Massive damage abilities
    devastating_strike: {
      id: 'devastating_strike',
      name: 'Devastating Strike',
      description: 'A slow but incredibly powerful attack.',
      energyCost: 75,
      damageMultiplier: 2.2,
      accuracy: 0.7, // Low accuracy but massive damage
      animation: 'devastating_blow',
      soundEffect: 'thunderous_impact'
    },

    blade_barrier: {
      id: 'blade_barrier',
      name: 'Blade Barrier',
      description: 'Create a defensive stance that reflects damage.',
      energyCost: 80,
      damageMultiplier: 0.5, // Reduced damage during defense
      accuracy: 1.0,
      effect: {
        type: 'boost',
        value: 1.5, // 50% defense boost
        duration: 20, // 20 seconds
        chance: 1.0,
        target: 'self'
      },
      animation: 'defensive_stance',
      soundEffect: 'steel_ring'
    },

    // Scimitar Specials - Fast, combo attacks
    double_strike: {
      id: 'double_strike',
      name: 'Double Strike',
      description: 'Two quick strikes in succession.',
      energyCost: 35,
      damageMultiplier: 0.8, // Each hit does 80% damage (160% total)
      accuracy: 1.1,
      animation: 'double_slash',
      soundEffect: 'rapid_strikes'
    },

    lightning_slash: {
      id: 'lightning_slash',
      name: 'Lightning Slash',
      description: 'An incredibly fast strike that can bypass armor.',
      energyCost: 40,
      damageMultiplier: 1.3,
      accuracy: 1.3, // High accuracy
      effect: {
        type: 'damage',
        value: 0.2, // Bypass 20% of armor
        chance: 1.0,
        target: 'enemy'
      },
      animation: 'lightning_fast',
      soundEffect: 'swift_cut'
    },

    // Staff Specials - Magic-based abilities
    mana_burn: {
      id: 'mana_burn',
      name: 'Mana Burn',
      description: 'Drains enemy magic energy and deals magic damage.',
      energyCost: 45,
      damageMultiplier: 1.2,
      accuracy: 1.0,
      effect: {
        type: 'drain',
        value: 20, // Drain magic energy
        chance: 0.8,
        target: 'enemy'
      },
      animation: 'arcane_burst',
      soundEffect: 'magical_drain'
    },

    elemental_surge: {
      id: 'elemental_surge',
      name: 'Elemental Surge',
      description: 'Channel elemental energy for a powerful magic attack.',
      energyCost: 55,
      damageMultiplier: 1.6,
      accuracy: 1.1,
      animation: 'elemental_blast',
      soundEffect: 'elemental_roar'
    },

    // Ranged Specials - Bow and crossbow abilities
    piercing_shot: {
      id: 'piercing_shot',
      name: 'Piercing Shot',
      description: 'An arrow that pierces through armor.',
      energyCost: 30,
      damageMultiplier: 1.4,
      accuracy: 1.2,
      effect: {
        type: 'damage',
        value: 0.3, // Bypass 30% of armor
        chance: 1.0,
        target: 'enemy'
      },
      animation: 'piercing_arrow',
      soundEffect: 'arrow_whistle'
    },

    explosive_shot: {
      id: 'explosive_shot',
      name: 'Explosive Shot',
      description: 'An explosive arrow that deals area damage.',
      energyCost: 50,
      damageMultiplier: 1.5,
      accuracy: 0.9,
      effect: {
        type: 'knockback',
        value: 2, // Knockback distance
        chance: 0.7,
        target: 'enemy'
      },
      animation: 'explosive_arrow',
      soundEffect: 'explosion'
    },

    multi_shot: {
      id: 'multi_shot',
      name: 'Multi Shot',
      description: 'Fire multiple arrows simultaneously.',
      energyCost: 60,
      damageMultiplier: 0.7, // Each arrow does 70% damage
      accuracy: 0.8,
      animation: 'multi_arrow',
      soundEffect: 'multiple_shots'
    }
  };

  // Weapon type to special attack mapping
  private weaponSpecials: Record<string, string[]> = {
    'dagger': ['precise_stab', 'poison_strike'],
    'sword': ['power_slash', 'whirlwind'],
    'shortsword': ['double_strike', 'lightning_slash'],
    'longsword': ['power_slash', 'whirlwind'],
    'scimitar': ['double_strike', 'lightning_slash'],
    'axe': ['crushing_blow'],
    'battleaxe': ['crushing_blow', 'berserker_rage'],
    'mace': ['prayer_drain', 'divine_protection'],
    '2h_sword': ['devastating_strike', 'blade_barrier'],
    'staff': ['mana_burn', 'elemental_surge'],
    'bow': ['piercing_shot', 'multi_shot'],
    'crossbow': ['piercing_shot', 'explosive_shot']
  };

  /**
   * Get all available special attacks
   */
  getSpecialAttacks(): Record<string, SpecialAttack> {
    return this.specialAttacks;
  }

  /**
   * Get special attack by ID
   */
  getSpecialAttack(attackId: string): SpecialAttack | null {
    return this.specialAttacks[attackId] || null;
  }

  /**
   * Get special attacks for a weapon type
   */
  getWeaponSpecials(weaponType: string): SpecialAttack[] {
    const specialIds = this.weaponSpecials[weaponType] || [];
    return specialIds.map(id => this.specialAttacks[id]).filter(Boolean);
  }

  /**
   * Check if player can use a special attack
   */
  canUseSpecialAttack(
    attackId: string,
    energy: number,
    weaponType?: string
  ): { canUse: boolean; reason?: string } {
    const attack = this.getSpecialAttack(attackId);
    if (!attack) {
      return { canUse: false, reason: 'Special attack not found' };
    }

    // Check energy requirement
    if (energy < attack.energyCost) {
      return { canUse: false, reason: `Requires ${attack.energyCost}% special attack energy` };
    }

    // Check weapon compatibility
    if (weaponType) {
      const weaponSpecials = this.weaponSpecials[weaponType] || [];
      if (!weaponSpecials.includes(attackId)) {
        return { canUse: false, reason: 'This weapon cannot use this special attack' };
      }
    }

    return { canUse: true };
  }

  /**
   * Perform a special attack
   */
  performSpecialAttack(
    attackId: string,
    attacker: {
      stats: { attack: number; strength: number; defense: number };
      weaponDamage: number;
      accuracy: number;
    },
    defender: {
      stats: { defense: number; hitpoints: number };
      armor: number;
    },
    currentEnergy: number
  ): SpecialAttackResult {
    const attack = this.getSpecialAttack(attackId);
    if (!attack) {
      return {
        success: false,
        hit: false,
        damage: 0,
        message: 'Special attack not found',
        energyUsed: 0
      };
    }

    // Check if enough energy is available
    if (currentEnergy < attack.energyCost) {
      return {
        success: false,
        hit: false,
        damage: 0,
        message: `Requires ${attack.energyCost}% special attack energy`,
        energyUsed: 0
      };
    }

    // Check if special attack hits
    const baseAccuracy = attacker.accuracy * attack.accuracy;
    const hitChance = this.calculateHitChance(baseAccuracy, defender.armor);
    const hit = Math.random() < hitChance;

    let damage = 0;
    let criticalHit = false;
    let effectMessage = '';

    if (hit) {
      // Calculate damage
      const baseDamage = attacker.weaponDamage;
      damage = Math.floor(baseDamage * attack.damageMultiplier);
      
      // Check for critical hit (5% chance for 50% extra damage)
      if (Math.random() < 0.05) {
        damage = Math.floor(damage * 1.5);
        criticalHit = true;
      }

      // Apply special effects
      if (attack.effect) {
        effectMessage = this.applySpecialEffect(attack.effect);
      }
    }

    const message = hit 
      ? `${attack.name} ${criticalHit ? 'critically ' : ''}hits for ${damage} damage!${effectMessage ? ' ' + effectMessage : ''}`
      : `${attack.name} misses!`;

    return {
      success: true,
      hit,
      damage,
      effect: attack.effect?.type,
      message,
      energyUsed: attack.energyCost,
      criticalHit
    };
  }

  /**
   * Calculate hit chance for special attacks
   */
  private calculateHitChance(attackerAccuracy: number, defenderArmor: number): number {
    // Similar to RSC combat formula but modified for special attacks
    const hitChance = attackerAccuracy / (attackerAccuracy + defenderArmor + 64);
    return Math.min(0.99, Math.max(0.01, hitChance)); // Cap between 1% and 99%
  }

  /**
   * Apply special effect and return description
   */
  private applySpecialEffect(
    effect: SpecialEffect
  ): string {
    if (Math.random() > (effect.chance || 1.0)) {
      return ''; // Effect didn't trigger
    }

    switch (effect.type) {
      case 'poison':
        return `The target is poisoned!`;
      
      case 'drain':
        return `The target loses ${effect.value} prayer points!`;
      
      case 'boost':
        return `Your combat stats are boosted!`;
      
      case 'heal':
        return `You feel rejuvenated!`;
      
      case 'stun':
        return `The target is stunned!`;
      
      case 'knockback':
        return `The target is knocked back!`;
      
      default:
        return '';
    }
  }

  /**
   * Update special attack energy (regeneration)
   */
  updateSpecialEnergy(energy: SpecialAttackEnergy, deltaTime: number): void {
    const regenAmount = energy.regenRate * deltaTime;
    energy.current = Math.min(energy.maximum, energy.current + regenAmount);
  }

  /**
   * Use special attack energy
   */
  useSpecialEnergy(energy: SpecialAttackEnergy, amount: number): boolean {
    if (energy.current >= amount) {
      energy.current -= amount;
      return true;
    }
    return false;
  }

  /**
   * Get special attack categories for UI
   */
  getSpecialAttackCategories(): { 
    offensive: SpecialAttack[]; 
    defensive: SpecialAttack[]; 
    utility: SpecialAttack[] 
  } {
    const offensive: SpecialAttack[] = [];
    const defensive: SpecialAttack[] = [];
    const utility: SpecialAttack[] = [];

    Object.values(this.specialAttacks).forEach(attack => {
      if (attack.effect?.type === 'boost' && attack.effect.target === 'self') {
        defensive.push(attack);
      } else if (attack.effect?.type === 'heal' || attack.effect?.type === 'drain') {
        utility.push(attack);
      } else {
        offensive.push(attack);
      }
    });

    return { offensive, defensive, utility };
  }

  /**
   * Get weapon type from weapon ID
   */
  getWeaponType(weaponId: string): string | null {
    // Map weapon IDs to types - this would be expanded based on your weapon definitions
    const weaponTypeMap: Record<string, string> = {
      'bronze_dagger': 'dagger',
      'iron_dagger': 'dagger',
      'steel_dagger': 'dagger',
      'bronze_sword': 'sword',
      'iron_sword': 'sword',
      'steel_sword': 'sword',
      'bronze_axe': 'axe',
      'iron_axe': 'axe',
      'steel_axe': 'axe',
      'bronze_mace': 'mace',
      'iron_mace': 'mace',
      'steel_mace': 'mace',
      'shortbow': 'bow',
      'longbow': 'bow',
      'crossbow': 'crossbow',
      'staff': 'staff'
    };

    return weaponTypeMap[weaponId] || null;
  }

  /**
   * Calculate special attack energy regeneration rate
   */
  calculateEnergyRegenRate(playerLevel: number): number {
    // Energy regenerates faster at higher levels (1% per 3 seconds at level 1, 1% per 2 seconds at level 99)
    const baseRate = 1/3; // 1% per 3 seconds
    const levelBonus = (playerLevel - 1) * 0.01; // 1% faster per level
    return baseRate + levelBonus;
  }
}
