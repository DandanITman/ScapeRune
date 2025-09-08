import React from 'react';
import { useGameStore } from '../store/gameStore';
import { EnhancedCombatStyleSystem, COMBAT_STYLE_DEFINITIONS } from '../systems/EnhancedCombatStyleSystem';
import type { CombatStyleName } from '../systems/EnhancedCombatStyleSystem';
import './CombatStylePanel.css';

const CombatStylePanel: React.FC = () => {
  const { combatStyle, setCombatStyle, player } = useGameStore();

  const currentWeapon = player.equipment.weapon || null;
  const availableStyles = EnhancedCombatStyleSystem.getAvailableStyles(currentWeapon);
  const weaponCategory = EnhancedCombatStyleSystem.getWeaponCategory(currentWeapon);

  const combatStyles = availableStyles.map(styleName => {
    const definition = COMBAT_STYLE_DEFINITIONS[styleName];
    return {
      name: styleName,
      label: definition.label,
      description: definition.description,
      definition
    };
  });

  const handleStyleChange = (newStyle: CombatStyleName) => {
    setCombatStyle(newStyle);
  };

  const isCurrentStyleValid = EnhancedCombatStyleSystem.isStyleValidForWeapon(combatStyle as CombatStyleName, currentWeapon);

  return (
    <div className="combat-style-panel">
      <h3>Combat Style</h3>
      
      <div className="weapon-info">
        <div className="weapon-name">
          {currentWeapon ? currentWeapon.name : 'Unarmed'}
        </div>
        <div className="weapon-category">
          Category: <span className="category-name">{weaponCategory.replace('_', ' ')}</span>
        </div>
      </div>

      {!isCurrentStyleValid && (
        <div className="style-warning">
          ⚠️ Current style not available for this weapon
        </div>
      )}
      
      <div className="combat-styles">
        {combatStyles.map((style) => (
          <button
            key={style.name}
            className={`combat-style-button ${combatStyle === style.name ? 'active' : ''}`}
            onClick={() => handleStyleChange(style.name)}
          >
            <div className="style-header">
              <span className="style-name">{style.label}</span>
              {style.definition.attackSpeedModifier !== 1.0 && (
                <span className="speed-indicator">
                  {style.definition.attackSpeedModifier < 1.0 ? '⚡' : '🐌'}
                </span>
              )}
            </div>
            <div className="style-bonuses">
              {style.definition.attackBonus > 0 && <span className="bonus">+{style.definition.attackBonus} ATK</span>}
              {style.definition.strengthBonus > 0 && <span className="bonus">+{style.definition.strengthBonus} STR</span>}
              {style.definition.defenseBonus > 0 && <span className="bonus">+{style.definition.defenseBonus} DEF</span>}
              {style.definition.rangeBonus && style.definition.rangeBonus > 0 && <span className="bonus">+{style.definition.rangeBonus} RNG</span>}
            </div>
            <div className="style-description">{style.description}</div>
          </button>
        ))}
      </div>
      
      <div className="current-style">
        Current: <strong>{combatStyles.find(s => s.name === combatStyle)?.label || 'Invalid'}</strong>
        {!isCurrentStyleValid && <span className="invalid-indicator"> (Invalid for weapon)</span>}
      </div>

      <div className="auto-switch-note">
        💡 Combat style auto-switches when changing weapons
      </div>
    </div>
  );
};

export default CombatStylePanel;
