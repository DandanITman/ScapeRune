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
   * Calculate effective level (A) for RSC formulas
   */
  private calculateEffectiveLevel(level: number, prayerBonus: number, styleBonus: number, isPlayer: boolean): number {
    // Step 1: Apply prayer bonus and round down
    const prayerLevel = Math.floor(level * prayerBonus);
    
    // Step 2: Add stance bonus
    const stanceLevel = prayerLevel + styleBonus;
    
    // Step 3: Add +8 for players, +0 for NPCs
    const bonusConstant = isPlayer ? 8 : 0;
    const effectiveLevel = stanceLevel + bonusConstant;
    
    return effectiveLevel;
  }

  /**
   * Calculate attack roll using RSC formula: A * (B+64)
   */
  private calculateAttackRoll(attacker: Combatant): number {
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
    
    // Style bonus
    const styleBonuses = EnhancedCombatStyleSystem.getStyleBonuses(style);
    const styleBonus = styleBonuses.attack;
    
    // Calculate effective level (A)
    const effectiveLevel = this.calculateEffectiveLevel(stats.attack, prayerBonus, styleBonus, isPlayer);
    
    // Equipment bonus (B) - much smaller for NPCs
    const equipmentBonus = isPlayer ? equipment.weaponAim : 0;
    
    // RSC Formula: A * (B + 64)
    return effectiveLevel * (equipmentBonus + 64);
  }
  
  /**
   * Calculate defense roll using RSC formula: A * (B+64)
   */
  private calculateDefenseRoll(defender: Combatant): number {
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
    
    // Style bonus
    const styleBonuses = EnhancedCombatStyleSystem.getStyleBonuses(style);
    const styleBonus = styleBonuses.defense;
    
    // Calculate effective level (A)
    const effectiveLevel = this.calculateEffectiveLevel(stats.defense, prayerBonus, styleBonus, isPlayer);
    
    // Equipment bonus (B) - much smaller for NPCs
    const equipmentBonus = isPlayer ? equipment.armour : 0;
    
    // RSC Formula: A * (B + 64)
    return effectiveLevel * (equipmentBonus + 64);
  }

  /**
   * Calculate maximum hit using RSC formula: 0.5 + A * (B+64) / 640
   */
  private calculateMaxHit(attacker: Combatant): number {
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
    
    // Style bonus
    const styleBonuses = EnhancedCombatStyleSystem.getStyleBonuses(style);
    const styleBonus = styleBonuses.strength;
    
    // Calculate effective level (A)
    const effectiveLevel = this.calculateEffectiveLevel(stats.strength, prayerBonus, styleBonus, isPlayer);
    
    // Equipment bonus (B) - much smaller for NPCs  
    const equipmentBonus = isPlayer ? equipment.weaponPower : 0;
    
    // RSC Max Hit Formula: 0.5 + A * (B + 64) / 640
    const maxHit = 0.5 + (effectiveLevel * (equipmentBonus + 64)) / 640;
    
    // Round down to nearest integer
    return Math.floor(maxHit);
  }
  
  /**
   * Calculate hit chance using RSC formula
   */
  private calculateHitChance(attackRoll: number, defenseRoll: number): number {
    // RSC Hit Chance Formula
    if (attackRoll > defenseRoll) {
      return 1 - ((defenseRoll + 2) / (2 * (attackRoll + 1)));
    } else {
      return attackRoll / (2 * (defenseRoll + 1));
    }
  }
  
  /**
   * Calculate actual damage dealt using random roll from 0 to max hit
   */
  private calculateDamage(maxHit: number): number {
    if (maxHit <= 0) return 0;
    
    // Random damage from 0 to max hit (inclusive)
    return Math.floor(Math.random() * (maxHit + 1));
  }
  
  /**
   * Calculate experience gained from combat
   */
  private calculateExperience(attacker: Combatant, damage: number): { attack: number, strength: number, defense: number, hits: number } {
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
   * Perform a combat round using RSC formulas
   */
  public performAttack(attacker: Combatant, defender: Combatant): CombatResult {
    // Calculate combat rolls using RSC formulas
    const attackRoll = this.calculateAttackRoll(attacker);
    const defenseRoll = this.calculateDefenseRoll(defender);
    const maxHit = this.calculateMaxHit(attacker);
    
    // Determine if hit lands
    const hitChance = this.calculateHitChance(attackRoll, defenseRoll);
    const hit = Math.random() < hitChance;
    
    let damage = 0;
    let xp = { attack: 0, strength: 0, defense: 0, hits: 0 };
    
    if (hit) {
      damage = this.calculateDamage(maxHit);
      
      // Apply damage to defender
      defender.stats.currentHits = Math.max(0, defender.stats.currentHits - damage);
      
      // Calculate experience if attacker is a player
      if (attacker.isPlayer) {
        xp = this.calculateExperience(attacker, damage);
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

    // Calculate modified combat values with special attack bonuses using RSC formulas
    const baseAttackRoll = this.calculateAttackRoll(attacker);
    const modifiedAttackRoll = baseAttackRoll * specialAttack.accuracy;
    
    const defenseRoll = this.calculateDefenseRoll(defender);
    const baseMaxHit = this.calculateMaxHit(attacker);
    const modifiedMaxHit = Math.floor(baseMaxHit * specialAttack.damageMultiplier);
    
    // Determine if hit lands using special attack accuracy
    const hitChance = this.calculateHitChance(modifiedAttackRoll, defenseRoll);
    const hit = Math.random() < hitChance;
    
    let damage = 0;
    let xp = { attack: 0, strength: 0, defense: 0, hits: 0 };
    
    if (hit) {
      damage = this.calculateDamage(modifiedMaxHit);
      
      // Apply damage to defender
      defender.stats.currentHits = Math.max(0, defender.stats.currentHits - damage);
      
      // Calculate experience if attacker is a player (special attacks give normal XP)
      if (attacker.isPlayer) {
        xp = this.calculateExperience(attacker, damage);
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
        accuracy: modifiedAttackRoll
      },
      {
        stats: { 
          defense: defender.stats.defense, 
          hitpoints: defender.stats.currentHits 
        },
        armor: defenseRoll
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
   * Get combat stats for common NPCs (RSC balanced for level 3 characters)
   */
  public static getNPCStats(npcName: string): CombatStats {
    const npcStats: Record<string, CombatStats> = {
      // Low level monsters appropriate for level 3 characters
      'Rat': { attack: 1, defense: 1, strength: 1, hits: 1, currentHits: 1 },
      'Chicken': { attack: 1, defense: 1, strength: 1, hits: 3, currentHits: 3 },
      'Cow': { attack: 2, defense: 2, strength: 2, hits: 8, currentHits: 8 },
      'Goblin': { attack: 2, defense: 1, strength: 2, hits: 5, currentHits: 5 },
      
      // Slightly stronger NPCs for progression
      'Giant Rat': { attack: 3, defense: 2, strength: 3, hits: 6, currentHits: 6 },
      'Spider': { attack: 2, defense: 2, strength: 2, hits: 5, currentHits: 5 },
      'Imp': { attack: 2, defense: 2, strength: 2, hits: 8, currentHits: 8 },
      
      // Medium level NPCs
      'Guard': { attack: 15, defense: 12, strength: 14, hits: 25, currentHits: 25 },
      'Knight': { attack: 20, defense: 18, strength: 18, hits: 35, currentHits: 35 },
      'Wizard': { attack: 12, defense: 8, strength: 10, hits: 20, currentHits: 20 },
      'Archer': { attack: 14, defense: 10, strength: 12, hits: 22, currentHits: 22 },
      'Bandit': { attack: 10, defense: 7, strength: 9, hits: 18, currentHits: 18 }
    };
    
    return npcStats[npcName] || { attack: 2, defense: 2, strength: 2, hits: 8, currentHits: 8 };
  }
  
  /**
   * Get default equipment for NPCs (no equipment bonuses for realistic RSC combat)
   */
  public static getNPCEquipment(): CombatEquipment {
    return { 
      weaponAim: 0,     // No weapon bonus - NPCs fight with fists/natural weapons
      weaponPower: 0,   // No power bonus - all damage comes from base stats
      armour: 0         // No armor bonus - natural defense only
    };
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
    const defenseRoll = this.calculateDefenseRoll(defender);
    const hitChance = this.calculateHitChance(rangedAttack, defenseRoll);
    
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
