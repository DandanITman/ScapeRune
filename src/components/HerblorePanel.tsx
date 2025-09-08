import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useDraggable } from '../hooks/useDraggable';
import type { Herb, HerbloreRecipe, PotionEffect } from '../systems/HerbloreSystem';
import './HerblorePanel.css';

interface HerblorePanelProps {
  onClose: () => void;
}

export const HerblorePanel: React.FC<HerblorePanelProps> = ({ onClose }) => {
  const { player } = useGameStore();
  const [selectedTab, setSelectedTab] = useState<'herbs' | 'potions'>('herbs');
  const [selectedHerb, setSelectedHerb] = useState<Herb | null>(null);
  const [selectedPotion, setSelectedPotion] = useState<HerbloreRecipe | null>(null);
  
  const draggable = useDraggable({ 
    initialPosition: { x: 200, y: 100 } 
  });

  // Mock data for demonstration - in real implementation, this would come from HerbloreSystem
  const herbs: Herb[] = [
    {
      id: 'guam',
      name: 'Guam',
      unfinishedPotionId: 'guam_potion_unf',
      levelRequired: 1,
      experience: 2.5
    },
    {
      id: 'marrentill',
      name: 'Marrentill',
      unfinishedPotionId: 'marrentill_potion_unf',
      levelRequired: 5,
      experience: 3.8
    },
    {
      id: 'tarromin',
      name: 'Tarromin',
      unfinishedPotionId: 'tarromin_potion_unf',
      levelRequired: 11,
      experience: 5
    },
    {
      id: 'harralander',
      name: 'Harralander',
      unfinishedPotionId: 'harralander_potion_unf',
      levelRequired: 20,
      experience: 6.3
    },
    {
      id: 'ranarr',
      name: 'Ranarr',
      unfinishedPotionId: 'ranarr_potion_unf',
      levelRequired: 25,
      experience: 7.5
    }
  ];

  const potions: HerbloreRecipe[] = [
    {
      id: 'attack_potion',
      name: 'Attack Potion',
      unfinishedPotionId: 'guam_potion_unf',
      secondaryIngredientId: 'eye_of_newt',
      resultPotionId: 'attack_potion',
      levelRequired: 3,
      experience: 25,
      effect: {
        type: 'boost_stat',
        statType: 'attack',
        amount: 3,
        duration: 600
      }
    },
    {
      id: 'antipoison',
      name: 'Antipoison',
      unfinishedPotionId: 'marrentill_potion_unf',
      secondaryIngredientId: 'unicorn_horn_dust',
      resultPotionId: 'antipoison',
      levelRequired: 5,
      experience: 37.5,
      effect: {
        type: 'cure_poison',
        amount: 1
      }
    },
    {
      id: 'strength_potion',
      name: 'Strength Potion',
      unfinishedPotionId: 'tarromin_potion_unf',
      secondaryIngredientId: 'limpwurt_root',
      resultPotionId: 'strength_potion',
      levelRequired: 12,
      experience: 50,
      effect: {
        type: 'boost_stat',
        statType: 'strength',
        amount: 3,
        duration: 600
      }
    },
    {
      id: 'prayer_potion',
      name: 'Prayer Potion',
      unfinishedPotionId: 'ranarr_potion_unf',
      secondaryIngredientId: 'snape_grass',
      resultPotionId: 'prayer_potion',
      levelRequired: 38,
      experience: 87.5,
      effect: {
        type: 'restore_stat',
        statType: 'prayer',
        amount: 25
      }
    }
  ];

  const getHerbIcon = (): string => {
    return '🌿'; // All herbs start as grimy
  };

  const getPotionIcon = (potion: HerbloreRecipe): string => {
    const effectType = potion.effect?.type;
    switch (effectType) {
      case 'boost_stat': return '⚔️';
      case 'restore_stat': return '🙏';
      case 'cure_poison': return '🧪';
      case 'heal': return '❤️';
      default: return '🧪';
    }
  };

  const canCleanHerb = (herb: Herb): boolean => {
    return player.stats.herblaw >= herb.levelRequired;
  };

  const canMakePotion = (potion: HerbloreRecipe): boolean => {
    return player.stats.herblaw >= potion.levelRequired;
  };

  const formatEffect = (effect: PotionEffect): string => {
    switch (effect.type) {
      case 'boost_stat':
        return `+${effect.amount} ${effect.statType} for ${effect.duration}s`;
      case 'restore_stat':
        return `Restores ${effect.amount}% ${effect.statType}`;
      case 'cure_poison':
        return 'Cures poison';
      case 'heal':
        return `Restores ${effect.amount} HP`;
      default:
        return 'Unknown effect';
    }
  };

  return (
    <div 
      ref={draggable.elementRef}
      className="herblore-panel"
      style={draggable.style}
    >
      <div 
        className="herblore-header drag-handle"
        onMouseDown={draggable.handleMouseDown}
      >
        <h2>Herblore</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="herblore-tabs">
        <button 
          className={`tab ${selectedTab === 'herbs' ? 'active' : ''}`}
          onClick={() => setSelectedTab('herbs')}
        >
          Herbs
        </button>
        <button 
          className={`tab ${selectedTab === 'potions' ? 'active' : ''}`}
          onClick={() => setSelectedTab('potions')}
        >
          Potions
        </button>
      </div>

      <div className="herblore-content">
        {selectedTab === 'herbs' && (
          <div className="herbs-tab">
            <div className="herbs-list">
              <h3>Available Herbs</h3>
              {herbs.map(herb => (
                <div 
                  key={herb.id}
                  className={`herb-item ${canCleanHerb(herb) ? 'available' : 'locked'} ${selectedHerb?.id === herb.id ? 'selected' : ''}`}
                  onClick={() => setSelectedHerb(herb)}
                >
                  <div className="herb-icon">{getHerbIcon()}</div>
                  <div className="herb-info">
                    <div className="herb-name">{herb.name}</div>
                    <div className="herb-level">Level {herb.levelRequired}</div>
                    <div className="herb-xp">{herb.experience} XP</div>
                  </div>
                  <div className="herb-status">
                    {canCleanHerb(herb) ? '✅' : '🔒'}
                  </div>
                </div>
              ))}
            </div>

            {selectedHerb && (
              <div className="herb-details">
                <h3>{selectedHerb.name}</h3>
                <div className="herb-stats">
                  <div className="stat-row">
                    <span>Level Required:</span>
                    <span>{selectedHerb.levelRequired}</span>
                  </div>
                  <div className="stat-row">
                    <span>Experience:</span>
                    <span>{selectedHerb.experience} XP</span>
                  </div>
                  <div className="stat-row">
                    <span>Status:</span>
                    <span>Grimy</span>
                  </div>
                  <div className="stat-row">
                    <span>Clean Name:</span>
                    <span>Clean {selectedHerb.name}</span>
                  </div>
                </div>

                <div className="herb-description">
                  This herb needs to be cleaned before it can be used in potion making. 
                  Cleaning herbs provides Herblore experience.
                </div>

                {canCleanHerb(selectedHerb) ? (
                  <button className="clean-herb-btn">
                    Clean Herb
                  </button>
                ) : (
                  <div className="requirement-warning">
                    You need level {selectedHerb.levelRequired} Herblore to clean this herb.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'potions' && (
          <div className="potions-tab">
            <div className="potions-list">
              <h3>Potion Recipes</h3>
              {potions.map(potion => (
                <div 
                  key={potion.id}
                  className={`potion-item ${canMakePotion(potion) ? 'available' : 'locked'} ${selectedPotion?.id === potion.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPotion(potion)}
                >
                  <div className="potion-icon">{getPotionIcon(potion)}</div>
                  <div className="potion-info">
                    <div className="potion-name">{potion.name}</div>
                    <div className="potion-level">Level {potion.levelRequired}</div>
                    <div className="potion-xp">{potion.experience} XP</div>
                  </div>
                  <div className="potion-status">
                    {canMakePotion(potion) ? '✅' : '🔒'}
                  </div>
                </div>
              ))}
            </div>

            {selectedPotion && (
              <div className="potion-details">
                <h3>{selectedPotion.name}</h3>
                <div className="potion-stats">
                  <div className="stat-row">
                    <span>Level Required:</span>
                    <span>{selectedPotion.levelRequired}</span>
                  </div>
                  <div className="stat-row">
                    <span>Experience:</span>
                    <span>{selectedPotion.experience} XP</span>
                  </div>
                  <div className="stat-row">
                    <span>Effect:</span>
                    <span>{selectedPotion.effect ? formatEffect(selectedPotion.effect) : 'No effect'}</span>
                  </div>
                </div>

                <div className="potion-recipe">
                  <h4>Recipe:</h4>
                  <div className="recipe-step">
                    <span className="step-number">1.</span>
                    <span className="step-text">
                      Add clean herb to vial of water
                    </span>
                  </div>
                  <div className="recipe-step">
                    <span className="step-number">2.</span>
                    <span className="step-text">
                      Add {selectedPotion.secondaryIngredientId.replace('_', ' ')} to unfinished potion
                    </span>
                  </div>
                </div>

                <div className="recipe-ingredients">
                  <h4>Required Ingredients:</h4>
                  <div className="ingredient-item">
                    <span className="ingredient-icon">🍃</span>
                    <span className="ingredient-name">Clean herb</span>
                  </div>
                  <div className="ingredient-item">
                    <span className="ingredient-icon">🧪</span>
                    <span className="ingredient-name">{selectedPotion.secondaryIngredientId.replace('_', ' ')}</span>
                  </div>
                  <div className="ingredient-item">
                    <span className="ingredient-icon">🫗</span>
                    <span className="ingredient-name">Vial of water</span>
                  </div>
                </div>

                <div className="potion-description">
                  {selectedPotion.effect 
                    ? `This potion provides: ${formatEffect(selectedPotion.effect)}`
                    : 'This potion has no special effect.'
                  }
                </div>

                {canMakePotion(selectedPotion) ? (
                  <button className="make-potion-btn">
                    Make {selectedPotion.name}
                  </button>
                ) : (
                  <div className="requirement-warning">
                    You need level {selectedPotion.levelRequired} Herblore to make this potion.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="herblore-footer">
        <div className="current-level">
          Herblore Level: {player.stats.herblaw} 
          ({player.experience.herblaw?.toLocaleString() || 0} XP)
        </div>
        <div className="herblore-tip">
          💡 Tip: Clean herbs before making potions. Higher levels unlock more powerful recipes!
        </div>
      </div>
    </div>
  );
};
