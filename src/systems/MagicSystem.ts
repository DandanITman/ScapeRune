import * as THREE from 'three';

export interface MagicSpell {
  id: string;
  name: string;
  description: string;
  type: 'combat' | 'utility';
  level: number;
  experience: number;
  runes: { [runeId: string]: number };
  maxHit?: number;
  effect?: string;
  cooldown?: number;
}

export interface SpellCastResult {
  success: boolean;
  experience: number;
  damage?: number;
  effect?: string;
  message: string;
  runesUsed: { [runeId: string]: number };
}

export interface MagicTarget {
  type: 'npc' | 'player' | 'ground' | 'item';
  position: THREE.Vector3;
  mesh?: THREE.Mesh;
  name?: string;
}

export class MagicSystem {
  // RuneScape Classic Spells
  private spells: Record<string, MagicSpell> = {
    // Combat Spells
    wind_strike: {
      id: 'wind_strike',
      name: 'Wind Strike',
      description: 'A basic wind spell that can hit up to 2 damage.',
      type: 'combat',
      level: 1,
      experience: 5.5,
      runes: { air_rune: 1, mind_rune: 1 },
      maxHit: 2
    },
    
    water_strike: {
      id: 'water_strike',
      name: 'Water Strike',
      description: 'A basic water spell that can hit up to 4 damage.',
      type: 'combat',
      level: 5,
      experience: 7.5,
      runes: { water_rune: 1, air_rune: 1, mind_rune: 1 },
      maxHit: 4
    },
    
    earth_strike: {
      id: 'earth_strike',
      name: 'Earth Strike',
      description: 'A basic earth spell that can hit up to 6 damage.',
      type: 'combat',
      level: 9,
      experience: 9.5,
      runes: { earth_rune: 2, air_rune: 1, mind_rune: 1 },
      maxHit: 6
    },
    
    fire_strike: {
      id: 'fire_strike',
      name: 'Fire Strike',
      description: 'A basic fire spell that can hit up to 8 damage.',
      type: 'combat',
      level: 13,
      experience: 11.5,
      runes: { fire_rune: 3, air_rune: 2, mind_rune: 1 },
      maxHit: 8
    },
    
    wind_bolt: {
      id: 'wind_bolt',
      name: 'Wind Bolt',
      description: 'A mid-level wind spell that can hit up to 9 damage.',
      type: 'combat',
      level: 17,
      experience: 13.5,
      runes: { air_rune: 2, chaos_rune: 1 },
      maxHit: 9
    },
    
    water_bolt: {
      id: 'water_bolt',
      name: 'Water Bolt',
      description: 'A mid-level water spell that can hit up to 10 damage.',
      type: 'combat',
      level: 23,
      experience: 16.5,
      runes: { water_rune: 2, air_rune: 2, chaos_rune: 1 },
      maxHit: 10
    },
    
    earth_bolt: {
      id: 'earth_bolt',
      name: 'Earth Bolt',
      description: 'A mid-level earth spell that can hit up to 11 damage.',
      type: 'combat',
      level: 29,
      experience: 19.5,
      runes: { earth_rune: 3, air_rune: 2, chaos_rune: 1 },
      maxHit: 11
    },
    
    fire_bolt: {
      id: 'fire_bolt',
      name: 'Fire Bolt',
      description: 'A mid-level fire spell that can hit up to 12 damage.',
      type: 'combat',
      level: 35,
      experience: 22.5,
      runes: { fire_rune: 4, air_rune: 3, chaos_rune: 1 },
      maxHit: 12
    },
    
    wind_blast: {
      id: 'wind_blast',
      name: 'Wind Blast',
      description: 'A high-level wind spell that can hit up to 13 damage.',
      type: 'combat',
      level: 41,
      experience: 25.5,
      runes: { air_rune: 3, death_rune: 1 },
      maxHit: 13
    },
    
    water_blast: {
      id: 'water_blast',
      name: 'Water Blast',
      description: 'A high-level water spell that can hit up to 14 damage.',
      type: 'combat',
      level: 47,
      experience: 28.5,
      runes: { water_rune: 3, air_rune: 3, death_rune: 1 },
      maxHit: 14
    },
    
    earth_blast: {
      id: 'earth_blast',
      name: 'Earth Blast',
      description: 'A high-level earth spell that can hit up to 15 damage.',
      type: 'combat',
      level: 53,
      experience: 31.5,
      runes: { earth_rune: 4, air_rune: 3, death_rune: 1 },
      maxHit: 15
    },
    
    fire_blast: {
      id: 'fire_blast',
      name: 'Fire Blast',
      description: 'A high-level fire spell that can hit up to 16 damage.',
      type: 'combat',
      level: 59,
      experience: 34.5,
      runes: { fire_rune: 5, air_rune: 4, death_rune: 1 },
      maxHit: 16
    },
    
    // Utility Spells
    varrock_teleport: {
      id: 'varrock_teleport',
      name: 'Varrock Teleport',
      description: 'Teleports you to the center of Varrock.',
      type: 'utility',
      level: 25,
      experience: 35,
      runes: { law_rune: 1, air_rune: 3, fire_rune: 1 },
      effect: 'teleport_varrock'
    },
    
    lumbridge_teleport: {
      id: 'lumbridge_teleport',
      name: 'Lumbridge Teleport',
      description: 'Teleports you to Lumbridge.',
      type: 'utility',
      level: 31,
      experience: 41,
      runes: { law_rune: 1, air_rune: 3, earth_rune: 1 },
      effect: 'teleport_lumbridge'
    },
    
    falador_teleport: {
      id: 'falador_teleport',
      name: 'Falador Teleport',
      description: 'Teleports you to Falador.',
      type: 'utility',
      level: 37,
      experience: 47,
      runes: { law_rune: 1, air_rune: 3, water_rune: 1 },
      effect: 'teleport_falador'
    }
  };

  /**
   * Get all available spells for a player level
   */
  public getAvailableSpells(playerLevel: number): MagicSpell[] {
    return Object.values(this.spells).filter(spell => spell.level <= playerLevel);
  }

  /**
   * Get a specific spell by ID
   */
  public getSpell(spellId: string): MagicSpell | null {
    return this.spells[spellId] || null;
  }

  /**
   * Check if player can cast a spell
   */
  public canCastSpell(
    spellId: string, 
    playerLevel: number, 
    inventory: { [itemId: string]: number }
  ): { canCast: boolean; reason?: string } {
    const spell = this.getSpell(spellId);
    if (!spell) {
      return { canCast: false, reason: 'Spell not found' };
    }

    // Check level requirement
    if (playerLevel < spell.level) {
      return { canCast: false, reason: `Requires Magic level ${spell.level}` };
    }

    // Check rune requirements
    for (const [runeId, amount] of Object.entries(spell.runes)) {
      if (!inventory[runeId] || inventory[runeId] < amount) {
        return { canCast: false, reason: `Requires ${amount} ${runeId.replace('_', ' ')}` };
      }
    }

    return { canCast: true };
  }

  /**
   * Cast a spell
   */
  public castSpell(
    spellId: string,
    caster: { level: number; position: THREE.Vector3 }
  ): SpellCastResult {
    const spell = this.getSpell(spellId);
    if (!spell) {
      return {
        success: false,
        experience: 0,
        message: 'Spell not found',
        runesUsed: {}
      };
    }

    // Calculate hit chance and damage for combat spells
    if (spell.type === 'combat' && spell.maxHit) {
      const hitChance = this.calculateMagicHitChance(caster.level);
      const hit = Math.random() < hitChance;
      
      if (hit) {
        const damage = this.calculateMagicDamage(spell.maxHit);
        return {
          success: true,
          experience: spell.experience,
          damage,
          message: `Your ${spell.name} hits for ${damage} damage!`,
          runesUsed: spell.runes
        };
      } else {
        return {
          success: true,
          experience: spell.experience / 2, // Half XP for missed spells
          damage: 0,
          message: `Your ${spell.name} misses!`,
          runesUsed: spell.runes
        };
      }
    }

    // Handle utility spells
    if (spell.type === 'utility') {
      return {
        success: true,
        experience: spell.experience,
        effect: spell.effect,
        message: `You cast ${spell.name}!`,
        runesUsed: spell.runes
      };
    }

    return {
      success: false,
      experience: 0,
      message: 'Unknown spell type',
      runesUsed: {}
    };
  }

  /**
   * Calculate magic hit chance (similar to RSC formula)
   */
  private calculateMagicHitChance(casterLevel: number): number {
    // Base hit chance starts at 50% and increases with level
    const hitChance = 0.5 + (casterLevel * 0.01);
    
    // Future: Could incorporate target's magic defense here
    // const targetDefense = target?.magicDefense || 0;
    
    // Cap at 95% (RSC always had some miss chance)
    return Math.min(0.95, hitChance);
  }

  /**
   * Calculate magic damage
   */
  private calculateMagicDamage(maxHit: number): number {
    return Math.floor(Math.random() * (maxHit + 1));
  }

  /**
   * Get spell categories for UI
   */
  public getSpellCategories(): { combat: MagicSpell[]; utility: MagicSpell[] } {
    const combat = Object.values(this.spells).filter(spell => spell.type === 'combat');
    const utility = Object.values(this.spells).filter(spell => spell.type === 'utility');
    
    return { combat, utility };
  }
}
