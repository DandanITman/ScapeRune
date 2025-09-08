import * as THREE from 'three';
import { RangedSystem } from './RangedSystem';
import { PrayerSystem } from './PrayerSystem';
import type { PrayerState } from './PrayerSystem';
import { SpecialAttacksSystem } from './SpecialAttacksSystem';
import type { SpecialAttackResult } from './SpecialAttacksSystem';
import { EnhancedCombatStyleSystem } from './EnhancedCombatStyleSystem';
import type { CombatStyleName } from './EnhancedCombatStyleSystem';

export interface CombatStats {
  attack: number;
  defense: number;
  strength: number;
  hits: number;
  currentHits: number;
  magic?: number;
  ranged?: number;
}

export interface CombatEquipment {
  weaponAim: number;
  weaponPower: number;
  armour: number;
  magicBonus?: number;
  rangedBonus?: number;
}

export type CombatStyle = CombatStyleName;

export interface CombatResult {
  hit: boolean;
  damage: number;
  attackXp: number;
  strengthXp: number;
  defenseXp: number;
  hitsXp: number;
  magicXp?: number;
  rangedXp?: number;
}

export interface Combatant {
  stats: CombatStats;
  equipment: CombatEquipment;
  style: CombatStyle;
  isPlayer: boolean;
  position: THREE.Vector3;
  name: string;
  prayerState?: PrayerState;
}

export class CombatSystem {
  // RuneScape Classic Combat Formulas Implementation
  private prayerSystem: PrayerSystem;
  private specialAttacksSystem: SpecialAttacksSystem;

  constructor() {
    this.prayerSystem = new PrayerSystem();
    this.specialAttacksSystem = new SpecialAttacksSystem();
  }
  
  /**
   * Calculate attack value for hit chance
   */
  private calculateAttackValue(attacker: Combatant): number {
    const { stats, equipment, style, isPlayer, prayerState } = attacker;
    
    // Prayer bonus calculation
    let prayerBonus = 1.00;
    if (prayerState?.activePrayers) {
      const boostedAttack = this.prayerSystem.applyPrayerBoosts(
        stats.attack, 
        'attack', 
        prayerState.activePrayers
      );
      prayerBonus = boostedAttack / stats.attack;
    }
    
    // Bonus constant: 8 for players, 0 for NPCs
    const bonusConstant = isPlayer ? 8 : 0;
    
    // Enhanced style bonus system
    const styleBonuses = EnhancedCombatStyleSystem.getStyleBonuses(style);
    const styleBonus = styleBonuses.attack;
    
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
    const { stats, equipment, style, isPlayer, prayerState } = defender;
    
    // Prayer bonus calculation
    let prayerBonus = 1.00;
    if (prayerState?.activePrayers) {
      const boostedDefense = this.prayerSystem.applyPrayerBoosts(
        stats.defense, 
        'defense', 
        prayerState.activePrayers
      );
      prayerBonus = boostedDefense / stats.defense;
    }
    
    // Bonus constant: 8 for players, 0 for NPCs
    const bonusConstant = isPlayer ? 8 : 0;
    
    // Enhanced style bonus system
    const styleBonuses = EnhancedCombatStyleSystem.getStyleBonuses(style);
    const styleBonus = styleBonuses.defense;
    
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
    const { stats, equipment, style, isPlayer, prayerState } = attacker;
    
    // Prayer bonus calculation
    let prayerBonus = 1.00;
    if (prayerState?.activePrayers) {
      const boostedStrength = this.prayerSystem.applyPrayerBoosts(
        stats.strength, 
        'strength', 
        prayerState.activePrayers
      );
      prayerBonus = boostedStrength / stats.strength;
    }
    
    // Bonus constant: 8 for players, 0 for NPCs
    const bonusConstant = isPlayer ? 8 : 0;
    
    // Enhanced style bonus system
    const styleBonuses = EnhancedCombatStyleSystem.getStyleBonuses(style);
    const styleBonus = styleBonuses.strength;
    
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
  private calculateExperience(attacker: Combatant, damage: number, _killed: boolean): { attack: number, strength: number, defense: number, hits: number } {
    const { style } = attacker;
    
    // Base XP is damage dealt * 4 for most skills
    const baseXp = damage * 4;
    
    // Hits XP is always damage * 4 / 3 (rounded down)
    const hitsXp = Math.floor(damage * 4 / 3);
    
    let attackXp = 0;
    let strengthXp = 0;
    let defenseXp = 0;
    
    // Enhanced XP distribution based on combat style
    const xpDistribution = EnhancedCombatStyleSystem.getXpDistribution(style);
    
    // For now, just use the first available XP type to maintain compatibility
    if (xpDistribution.attack) {
      attackXp = Math.floor(xpDistribution.attack * baseXp);
    }
    if (xpDistribution.strength) {
      strengthXp = Math.floor(xpDistribution.strength * baseXp);
    }
    if (xpDistribution.defense) {
      defenseXp = Math.floor(xpDistribution.defense * baseXp);
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
   * Perform a special attack
   */
  public performSpecialAttack(
    attacker: Combatant, 
    defender: Combatant, 
    attackId: string,
    weaponType?: string
  ): CombatResult & { specialResult?: SpecialAttackResult } {
    // Check if special attack can be used
    const canUse = this.specialAttacksSystem.canUseSpecialAttack(attackId, 100, weaponType);
    if (!canUse.canUse) {
      // Return a failed attack result
      return {
        hit: false,
        damage: 0,
        attackXp: 0,
        strengthXp: 0,
        defenseXp: 0,
        hitsXp: 0,
        specialResult: {
          success: false,
          hit: false,
          damage: 0,
          message: canUse.reason || 'Cannot use special attack',
          energyUsed: 0
        }
      };
    }

    // Get the special attack definition
    const specialAttack = this.specialAttacksSystem.getSpecialAttack(attackId);
    if (!specialAttack) {
      return {
        hit: false,
        damage: 0,
        attackXp: 0,
        strengthXp: 0,
        defenseXp: 0,
        hitsXp: 0,
        specialResult: {
          success: false,
          hit: false,
          damage: 0,
          message: 'Special attack not found',
          energyUsed: 0
        }
      };
    }

    // Calculate modified combat values with special attack bonuses
    const baseAttackValue = this.calculateAttackValue(attacker);
    const modifiedAttackValue = baseAttackValue * specialAttack.accuracy;
    
    const defenseValue = this.calculateDefenseValue(defender);
    const baseStrengthValue = this.calculateStrengthValue(attacker);
    const modifiedStrengthValue = baseStrengthValue * specialAttack.damageMultiplier;
    
    // Determine if hit lands using special attack accuracy
    const hitChance = this.calculateHitChance(modifiedAttackValue, defenseValue);
    const hit = Math.random() < hitChance;
    
    let damage = 0;
    let xp = { attack: 0, strength: 0, defense: 0, hits: 0 };
    
    if (hit) {
      damage = this.calculateDamage(modifiedStrengthValue);
      
      // Apply damage to defender
      defender.stats.currentHits = Math.max(0, defender.stats.currentHits - damage);
      
      // Calculate experience if attacker is a player (special attacks give normal XP)
      if (attacker.isPlayer) {
        const killed = defender.stats.currentHits <= 0;
        xp = this.calculateExperience(attacker, damage, killed);
      }
    }

    // Create special attack result
    const specialResult = this.specialAttacksSystem.performSpecialAttack(
      attackId,
      {
        stats: { 
          attack: attacker.stats.attack, 
          strength: attacker.stats.strength, 
          defense: attacker.stats.defense 
        },
        weaponDamage: damage,
        accuracy: modifiedAttackValue
      },
      {
        stats: { 
          defense: defender.stats.defense, 
          hitpoints: defender.stats.currentHits 
        },
        armor: defenseValue
      },
      100 // Assume full special energy for now
    );

    return {
      hit,
      damage,
      attackXp: xp.attack,
      strengthXp: xp.strength,
      defenseXp: xp.defense,
      hitsXp: xp.hits,
      specialResult
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

  /**
   * Perform a magic attack
   */
  public performMagicAttack(
    attacker: Combatant, 
    defender: Combatant, 
    spellMaxHit: number
  ): CombatResult {
    // Calculate magic attack values
    const magicLevel = attacker.stats.magic || 1;
    const magicBonus = attacker.equipment.magicBonus || 0;
    
    // Simple magic hit chance calculation
    const hitChance = 0.5 + (magicLevel * 0.01) + (magicBonus * 0.005);
    const hit = Math.random() < Math.min(0.95, hitChance);
    
    let damage = 0;
    let magicXp = 0;
    
    if (hit) {
      damage = Math.floor(Math.random() * (spellMaxHit + 1));
      magicXp = damage * 2; // Magic XP for successful hit
      
      // Apply damage to defender
      defender.stats.currentHits = Math.max(0, defender.stats.currentHits - damage);
    } else {
      magicXp = Math.floor(spellMaxHit / 2); // Half XP for missed spell
    }
    
    // Calculate hits XP
    const hitsXp = hit ? Math.floor(damage * 4 / 3) : 0;
    
    return {
      hit,
      damage,
      attackXp: 0,
      strengthXp: 0,
      defenseXp: 0,
      hitsXp,
      magicXp
    };
  }

  /**
   * Perform a ranged attack using RuneScape Classic mechanics
   */
  performRangedAttack(
    attacker: Combatant,
    defender: Combatant,
    weaponId: string,
    ammoId: string,
    inventory: Record<string, number>
  ): CombatResult & { arrowBroken: boolean; ammoUsed: string } {
    const rangedSystem = new RangedSystem();
    const rangedLevel = attacker.stats.ranged || 1;
    
    // Check if defender is protected from missiles
    const isProtected = defender.prayerState?.activePrayers && 
                       this.prayerSystem.isProtectedFromMissiles(defender.prayerState.activePrayers);
    
    if (isProtected) {
      // Attack is completely blocked by Protect from Missiles
      return {
        hit: false,
        damage: 0,
        attackXp: 0,
        strengthXp: 0,
        defenseXp: 0,
        hitsXp: 0,
        rangedXp: 0,
        arrowBroken: false,
        ammoUsed: ammoId
      };
    }
    
    // Use ranged system to calculate attack
    const rangedResult = rangedSystem.performRangedAttack(
      weaponId,
      ammoId,
      rangedLevel,
      {
        type: 'npc',
        position: defender.position,
        name: defender.name
      },
      inventory
    );

    if (!rangedResult) {
      return {
        hit: false,
        damage: 0,
        attackXp: 0,
        strengthXp: 0,
        defenseXp: 0,
        hitsXp: 0,
        rangedXp: 0,
        arrowBroken: false,
        ammoUsed: ammoId
      };
    }

    // Apply RSC ranged hit chance calculation
    const rangedAttack = rangedSystem.calculateRangedAttack(weaponId, rangedLevel);
    const defenseValue = this.calculateDefenseValue(defender);
    const hitChance = this.calculateHitChance(rangedAttack, defenseValue);
    
    const hit = rangedResult.success && Math.random() < hitChance;
    let damage = 0;
    
    if (hit) {
      damage = rangedResult.damage;
      
      // Apply damage to defender
      defender.stats.currentHits = Math.max(0, defender.stats.currentHits - damage);
    }

    // Calculate experience (4 XP per damage for ranged)
    const rangedXp = hit ? damage * 4 : 0;
    const hitsXp = hit ? Math.floor(damage * 4 / 3) : 0;

    return {
      hit,
      damage,
      attackXp: 0,
      strengthXp: 0,
      defenseXp: 0,
      hitsXp,
      rangedXp,
      arrowBroken: rangedResult.arrowBroken,
      ammoUsed: rangedResult.ammoUsed
    };
  }
}
