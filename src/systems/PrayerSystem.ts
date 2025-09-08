export interface PrayerData {
  id: string;
  name: string;
  description: string;
  level: number;
  drainRate: number; // Prayer points per second
  effect: PrayerEffect;
  category: 'combat' | 'utility';
}

export interface PrayerEffect {
  type: 'stat_boost' | 'protection' | 'special';
  stat?: 'attack' | 'defense' | 'strength';
  multiplier?: number; // e.g., 1.05 for 5% boost
  protection?: 'missiles' | 'melee';
  special?: string;
}

export interface BoneData {
  id: string;
  name: string;
  experience: number;
  value: number;
}

export interface PrayerState {
  currentPoints: number;
  maxPoints: number;
  activePrayers: Set<string>;
  drainRate: number; // Total drain rate from active prayers
}

export interface PrayerActionResult {
  success: boolean;
  message: string;
  experience?: number;
  pointsRestored?: number;
  pointsUsed?: number;
}

export class PrayerSystem {
  // RuneScape Classic Prayers
  private prayers: Record<string, PrayerData> = {
    // Level 1-19 Prayers
    thick_skin: {
      id: 'thick_skin',
      name: 'Thick Skin',
      description: 'Increases Defense by 5%',
      level: 1,
      drainRate: 1/15, // 1 point per 15 seconds
      effect: {
        type: 'stat_boost',
        stat: 'defense',
        multiplier: 1.05
      },
      category: 'combat'
    },

    burst_of_strength: {
      id: 'burst_of_strength',
      name: 'Burst of Strength',
      description: 'Increases Strength by 5%',
      level: 4,
      drainRate: 1/15,
      effect: {
        type: 'stat_boost',
        stat: 'strength',
        multiplier: 1.05
      },
      category: 'combat'
    },

    clarity_of_thought: {
      id: 'clarity_of_thought',
      name: 'Clarity of Thought',
      description: 'Increases Attack by 5%',
      level: 7,
      drainRate: 1/15,
      effect: {
        type: 'stat_boost',
        stat: 'attack',
        multiplier: 1.05
      },
      category: 'combat'
    },

    // Level 10-19 Prayers
    rock_skin: {
      id: 'rock_skin',
      name: 'Rock Skin',
      description: 'Increases Defense by 10%',
      level: 10,
      drainRate: 1/30,
      effect: {
        type: 'stat_boost',
        stat: 'defense',
        multiplier: 1.10
      },
      category: 'combat'
    },

    superhuman_strength: {
      id: 'superhuman_strength',
      name: 'Superhuman Strength',
      description: 'Increases Strength by 10%',
      level: 13,
      drainRate: 1/30,
      effect: {
        type: 'stat_boost',
        stat: 'strength',
        multiplier: 1.10
      },
      category: 'combat'
    },

    improved_reflexes: {
      id: 'improved_reflexes',
      name: 'Improved Reflexes',
      description: 'Increases Attack by 10%',
      level: 16,
      drainRate: 1/30,
      effect: {
        type: 'stat_boost',
        stat: 'attack',
        multiplier: 1.10
      },
      category: 'combat'
    },

    rapid_restore: {
      id: 'rapid_restore',
      name: 'Rapid Restore',
      description: 'Restore all stats 2x as fast as normal, except Hitpoints & Prayer',
      level: 19,
      drainRate: 1/5,
      effect: {
        type: 'special',
        special: 'rapid_restore'
      },
      category: 'utility'
    },

    // Level 20-29 Prayers
    rapid_heal: {
      id: 'rapid_heal',
      name: 'Rapid Heal',
      description: 'Hits restore 2x as fast as normal',
      level: 22,
      drainRate: 1/10,
      effect: {
        type: 'special',
        special: 'rapid_heal'
      },
      category: 'utility'
    },

    protect_item: {
      id: 'protect_item',
      name: 'Protect Item',
      description: 'Allows one more item to be kept on death (3→4 by default; 0→1 if skulled)',
      level: 25,
      drainRate: 1/10,
      effect: {
        type: 'special',
        special: 'protect_item'
      },
      category: 'utility'
    },

    steel_skin: {
      id: 'steel_skin',
      name: 'Steel Skin',
      description: 'Increases Defense by 15%',
      level: 28,
      drainRate: 1/60,
      effect: {
        type: 'stat_boost',
        stat: 'defense',
        multiplier: 1.15
      },
      category: 'combat'
    },

    // Level 30+ Prayers
    ultimate_strength: {
      id: 'ultimate_strength',
      name: 'Ultimate Strength',
      description: 'Increases Strength by 15%',
      level: 31,
      drainRate: 1/60,
      effect: {
        type: 'stat_boost',
        stat: 'strength',
        multiplier: 1.15
      },
      category: 'combat'
    },

    incredible_reflexes: {
      id: 'incredible_reflexes',
      name: 'Incredible Reflexes',
      description: 'Increases Attack by 15%',
      level: 34,
      drainRate: 1/60,
      effect: {
        type: 'stat_boost',
        stat: 'attack',
        multiplier: 1.15
      },
      category: 'combat'
    },

    paralyze_monster: {
      id: 'paralyze_monster',
      name: 'Paralyze Monster',
      description: 'Stops the monster you are fighting from attacking you; doesn\'t work on players',
      level: 37,
      drainRate: 1/60,
      effect: {
        type: 'special',
        special: 'paralyze_monster'
      },
      category: 'combat'
    },

    protect_from_missiles: {
      id: 'protect_from_missiles',
      name: 'Protect from Missiles',
      description: 'Protects from all ranged attacks; works on players',
      level: 40,
      drainRate: 1/60,
      effect: {
        type: 'protection',
        protection: 'missiles'
      },
      category: 'combat'
    }
  };

  // RuneScape Classic Bones
  private bones: Record<string, BoneData> = {
    bones: {
      id: 'bones',
      name: 'Bones',
      experience: 3.75,
      value: 1
    },

    bat_bones: {
      id: 'bat_bones',
      name: 'Bat bones',
      experience: 4.5,
      value: 2
    },

    big_bones: {
      id: 'big_bones',
      name: 'Big bones',
      experience: 12.5,
      value: 5
    },

    dragon_bones: {
      id: 'dragon_bones',
      name: 'Dragon bones',
      experience: 60,
      value: 30
    }
  };

  /**
   * Get all available prayers
   */
  getPrayers(): Record<string, PrayerData> {
    return this.prayers;
  }

  /**
   * Get all bone types
   */
  getBones(): Record<string, BoneData> {
    return this.bones;
  }

  /**
   * Get prayer by ID
   */
  getPrayer(prayerId: string): PrayerData | null {
    return this.prayers[prayerId] || null;
  }

  /**
   * Get bone data by ID
   */
  getBone(boneId: string): BoneData | null {
    return this.bones[boneId] || null;
  }

  /**
   * Get available prayers for a player level
   */
  getAvailablePrayers(playerLevel: number): PrayerData[] {
    return Object.values(this.prayers).filter(prayer => prayer.level <= playerLevel);
  }

  /**
   * Check if player can activate a prayer
   */
  canActivatePrayer(
    prayerId: string,
    playerLevel: number,
    currentPoints: number,
    activePrayers: Set<string>
  ): { canActivate: boolean; reason?: string } {
    const prayer = this.getPrayer(prayerId);
    if (!prayer) {
      return { canActivate: false, reason: 'Prayer not found' };
    }

    // Check level requirement
    if (playerLevel < prayer.level) {
      return { canActivate: false, reason: `Requires Prayer level ${prayer.level}` };
    }

    // Check if already active
    if (activePrayers.has(prayerId)) {
      return { canActivate: false, reason: 'Prayer already active' };
    }

    // Check if has prayer points
    if (currentPoints <= 0) {
      return { canActivate: false, reason: 'No prayer points remaining' };
    }

    // Check for conflicting prayers (same stat boosts)
    for (const activePrayerId of activePrayers) {
      const activePrayer = this.getPrayer(activePrayerId);
      if (activePrayer && this.prayersConflict(prayer, activePrayer)) {
        return { canActivate: false, reason: `Conflicts with ${activePrayer.name}` };
      }
    }

    return { canActivate: true };
  }

  /**
   * Check if two prayers conflict with each other
   */
  private prayersConflict(prayer1: PrayerData, prayer2: PrayerData): boolean {
    // Stat boost conflicts: can't have multiple stat boosts of same type
    if (prayer1.effect.type === 'stat_boost' && prayer2.effect.type === 'stat_boost') {
      return prayer1.effect.stat === prayer2.effect.stat;
    }

    // Protection conflicts: can't have multiple protection prayers
    if (prayer1.effect.type === 'protection' && prayer2.effect.type === 'protection') {
      return true;
    }

    return false;
  }

  /**
   * Activate a prayer
   */
  activatePrayer(prayerId: string, prayerState: PrayerState): PrayerActionResult {
    const prayer = this.getPrayer(prayerId);
    if (!prayer) {
      return {
        success: false,
        message: 'Prayer not found'
      };
    }

    // Add to active prayers
    prayerState.activePrayers.add(prayerId);
    
    // Update total drain rate
    prayerState.drainRate = this.calculateTotalDrainRate(prayerState.activePrayers);

    return {
      success: true,
      message: `Activated ${prayer.name}`
    };
  }

  /**
   * Deactivate a prayer
   */
  deactivatePrayer(prayerId: string, prayerState: PrayerState): PrayerActionResult {
    const prayer = this.getPrayer(prayerId);
    if (!prayer) {
      return {
        success: false,
        message: 'Prayer not found'
      };
    }

    // Remove from active prayers
    prayerState.activePrayers.delete(prayerId);
    
    // Update total drain rate
    prayerState.drainRate = this.calculateTotalDrainRate(prayerState.activePrayers);

    return {
      success: true,
      message: `Deactivated ${prayer.name}`
    };
  }

  /**
   * Calculate total prayer drain rate from active prayers
   */
  private calculateTotalDrainRate(activePrayers: Set<string>): number {
    let totalDrain = 0;
    for (const prayerId of activePrayers) {
      const prayer = this.getPrayer(prayerId);
      if (prayer) {
        totalDrain += prayer.drainRate;
      }
    }
    return totalDrain;
  }

  /**
   * Bury bones for experience
   */
  buryBones(boneId: string, quantity: number = 1): PrayerActionResult {
    const bone = this.getBone(boneId);
    if (!bone) {
      return {
        success: false,
        message: 'Bone type not found'
      };
    }

    const totalExperience = bone.experience * quantity;
    const boneText = quantity === 1 ? bone.name : `${quantity} ${bone.name}`;

    return {
      success: true,
      message: `You bury the ${boneText}`,
      experience: totalExperience
    };
  }

  /**
   * Restore prayer points at an altar
   */
  restoreAtAltar(altarType: 'normal' | 'monastery' = 'normal'): PrayerActionResult {
    const bonusPoints = altarType === 'monastery' ? 2 : 0;
    
    return {
      success: true,
      message: `You pray at the altar and feel spiritually renewed`,
      pointsRestored: -1, // Special value meaning "restore to max"
      pointsUsed: bonusPoints // Bonus points for monastery altar
    };
  }

  /**
   * Calculate maximum prayer points based on level
   */
  calculateMaxPrayerPoints(prayerLevel: number): number {
    // RSC formula: Prayer level = max prayer points
    return prayerLevel;
  }

  /**
   * Apply stat boost from prayers
   */
  applyPrayerBoosts(
    baseStat: number,
    statType: 'attack' | 'defense' | 'strength',
    activePrayers: Set<string>
  ): number {
    let multiplier = 1.0;

    for (const prayerId of activePrayers) {
      const prayer = this.getPrayer(prayerId);
      if (prayer && 
          prayer.effect.type === 'stat_boost' && 
          prayer.effect.stat === statType && 
          prayer.effect.multiplier) {
        multiplier = prayer.effect.multiplier;
        break; // Only one stat boost prayer can be active per stat
      }
    }

    return Math.floor(baseStat * multiplier);
  }

  /**
   * Check if protected from missiles
   */
  isProtectedFromMissiles(activePrayers: Set<string>): boolean {
    return activePrayers.has('protect_from_missiles');
  }

  /**
   * Check if monster is paralyzed
   */
  isMonsterParalyzed(activePrayers: Set<string>): boolean {
    return activePrayers.has('paralyze_monster');
  }

  /**
   * Update prayer points based on drain rate
   */
  updatePrayerPoints(prayerState: PrayerState, deltaTime: number): void {
    if (prayerState.activePrayers.size === 0) {
      return; // No drain if no prayers active
    }

    const pointsToLose = prayerState.drainRate * deltaTime;
    prayerState.currentPoints = Math.max(0, prayerState.currentPoints - pointsToLose);

    // Deactivate all prayers if out of points
    if (prayerState.currentPoints <= 0) {
      prayerState.activePrayers.clear();
      prayerState.drainRate = 0;
    }
  }

  /**
   * Get prayer categories for UI
   */
  getPrayerCategories(): { combat: PrayerData[]; utility: PrayerData[] } {
    const combat = Object.values(this.prayers).filter(prayer => prayer.category === 'combat');
    const utility = Object.values(this.prayers).filter(prayer => prayer.category === 'utility');
    
    return { combat, utility };
  }

  /**
   * Get prayer drain time estimate
   */
  getDrainTimeEstimate(prayerState: PrayerState): number {
    if (prayerState.drainRate <= 0) {
      return Infinity;
    }
    return prayerState.currentPoints / prayerState.drainRate;
  }

  /**
   * Get prayer requirements text
   */
  getPrayerRequirements(prayerId: string): string {
    const prayer = this.getPrayer(prayerId);
    if (!prayer) return '';
    
    return `Requires level ${prayer.level} Prayer`;
  }
}
