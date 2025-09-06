import * as THREE from 'three';

export interface CombatStats {
  attack: number;
  defense: number;
  strength: number;
  hits: number;
  currentHits: number;
}

export interface CombatEquipment {
  weaponAim: number;
  weaponPower: number;
  armour: number;
}

export type CombatStyle = 'accurate' | 'aggressive' | 'defensive' | 'controlled';

export interface CombatResult {
  hit: boolean;
  damage: number;
  attackXp: number;
  strengthXp: number;
  defenseXp: number;
  hitsXp: number;
}

export interface Combatant {
  stats: CombatStats;
  equipment: CombatEquipment;
  style: CombatStyle;
  isPlayer: boolean;
  position: THREE.Vector3;
  name: string;
}

export class CombatSystem {
  // RuneScape Classic Combat Formulas Implementation
  
  /**
   * Calculate attack value for hit chance
   */
  private calculateAttackValue(attacker: Combatant): number {
    const { stats, equipment, style, isPlayer } = attacker;
    
    // Prayer bonus (none implemented yet, so 1.00)
    const prayerBonus = 1.00;
    
    // Bonus constant: 8 for players, 0 for NPCs
    const bonusConstant = isPlayer ? 8 : 0;
    
    // Style bonus: +3 accurate, +1 controlled, 0 others
    const styleBonus = style === 'accurate' ? 3 : (style === 'controlled' ? 1 : 0);
    
    // Calculate base value
    const baseValue = Math.floor(stats.attack * prayerBonus) + bonusConstant + styleBonus;
    
    // Apply weapon aim bonus
    const weaponAim = isPlayer ? equipment.weaponAim : 0;
    
    return baseValue * (weaponAim + 64);
  }
  
  /**
   * Calculate defense value for hit chance
   */
  private calculateDefenseValue(defender: Combatant): number {
    const { stats, equipment, style, isPlayer } = defender;
    
    // Prayer bonus (none implemented yet, so 1.00)
    const prayerBonus = 1.00;
    
    // Bonus constant: 8 for players, 0 for NPCs
    const bonusConstant = isPlayer ? 8 : 0;
    
    // Style bonus: +3 defensive, +1 controlled, 0 others
    const styleBonus = style === 'defensive' ? 3 : (style === 'controlled' ? 1 : 0);
    
    // Calculate base value
    const baseValue = Math.floor(stats.defense * prayerBonus) + bonusConstant + styleBonus;
    
    // Apply armour bonus
    const armour = isPlayer ? equipment.armour : 0;
    
    return baseValue * (armour + 64);
  }
  
  /**
   * Calculate strength value for damage
   */
  private calculateStrengthValue(attacker: Combatant): number {
    const { stats, equipment, style, isPlayer } = attacker;
    
    // Prayer bonus (none implemented yet, so 1.00)
    const prayerBonus = 1.00;
    
    // Bonus constant: 8 for players, 0 for NPCs
    const bonusConstant = isPlayer ? 8 : 0;
    
    // Style bonus: +3 aggressive, +1 controlled, 0 others
    const styleBonus = style === 'aggressive' ? 3 : (style === 'controlled' ? 1 : 0);
    
    // Calculate base value
    const baseValue = Math.floor(stats.strength * prayerBonus) + bonusConstant + styleBonus;
    
    // Apply weapon power bonus
    const weaponPower = isPlayer ? equipment.weaponPower : 0;
    
    return baseValue * (weaponPower + 64);
  }
  
  /**
   * Calculate hit chance using RSC formula
   */
  private calculateHitChance(attackValue: number, defenseValue: number): number {
    if (attackValue > defenseValue) {
      return 1 - ((defenseValue + 2) / (2 * (attackValue + 1)));
    } else {
      return attackValue / (2 * (defenseValue + 1));
    }
  }
  
  /**
   * Calculate maximum hit
   */
  private calculateMaxHit(strengthValue: number): number {
    return Math.floor((strengthValue + 320) / 640);
  }
  
  /**
   * Calculate actual damage dealt
   */
  private calculateDamage(strengthValue: number): number {
    const randomStrength = Math.floor(Math.random() * (strengthValue + 1));
    return Math.floor((randomStrength + 320) / 640);
  }
  
  /**
   * Calculate experience gained from combat
   */
  private calculateExperience(attacker: Combatant, damage: number, killed: boolean): { attack: number, strength: number, defense: number, hits: number } {
    const { style } = attacker;
    
    // Base XP is damage dealt * 4 for most skills
    const baseXp = damage * 4;
    
    // Hits XP is always damage * 4 / 3 (rounded down)
    const hitsXp = Math.floor(damage * 4 / 3);
    
    let attackXp = 0;
    let strengthXp = 0;
    let defenseXp = 0;
    
    // XP distribution based on combat style
    switch (style) {
      case 'accurate':
        attackXp = baseXp;
        break;
      case 'aggressive':
        strengthXp = baseXp;
        break;
      case 'defensive':
        defenseXp = baseXp;
        break;
      case 'controlled':
        // Split XP between attack, strength, and defense
        const splitXp = Math.floor(baseXp / 3);
        attackXp = splitXp;
        strengthXp = splitXp;
        defenseXp = splitXp;
        break;
    }
    
    return { attack: attackXp, strength: strengthXp, defense: defenseXp, hits: hitsXp };
  }
  
  /**
   * Perform a combat round
   */
  public performAttack(attacker: Combatant, defender: Combatant): CombatResult {
    // Calculate combat values
    const attackValue = this.calculateAttackValue(attacker);
    const defenseValue = this.calculateDefenseValue(defender);
    const strengthValue = this.calculateStrengthValue(attacker);
    
    // Determine if hit lands
    const hitChance = this.calculateHitChance(attackValue, defenseValue);
    const hit = Math.random() < hitChance;
    
    let damage = 0;
    let xp = { attack: 0, strength: 0, defense: 0, hits: 0 };
    
    if (hit) {
      damage = this.calculateDamage(strengthValue);
      
      // Apply damage to defender
      defender.stats.currentHits = Math.max(0, defender.stats.currentHits - damage);
      
      // Calculate experience if attacker is a player
      if (attacker.isPlayer) {
        const killed = defender.stats.currentHits <= 0;
        xp = this.calculateExperience(attacker, damage, killed);
      }
    }
    
    return {
      hit,
      damage,
      attackXp: xp.attack,
      strengthXp: xp.strength,
      defenseXp: xp.defense,
      hitsXp: xp.hits
    };
  }
  
  /**
   * Get combat stats for common NPCs
   */
  public static getNPCStats(npcName: string): CombatStats {
    const npcStats: Record<string, CombatStats> = {
      'Goblin': { attack: 2, defense: 1, strength: 1, hits: 5, currentHits: 5 },
      'Cow': { attack: 1, defense: 1, strength: 2, hits: 8, currentHits: 8 },
      'Chicken': { attack: 1, defense: 1, strength: 1, hits: 3, currentHits: 3 },
      'Rat': { attack: 1, defense: 1, strength: 1, hits: 1, currentHits: 1 }
    };
    
    return npcStats[npcName] || { attack: 1, defense: 1, strength: 1, hits: 1, currentHits: 1 };
  }
  
  /**
   * Get default equipment for NPCs (no bonuses)
   */
  public static getNPCEquipment(): CombatEquipment {
    return { weaponAim: 0, weaponPower: 0, armour: 0 };
  }
}
