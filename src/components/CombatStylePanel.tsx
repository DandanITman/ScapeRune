import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useDraggable } from '../hooks/useDraggable';
import { EnhancedCombatStyleSystem, COMBAT_STYLE_DEFINITIONS } from '../systems/EnhancedCombatStyleSystem';
import type { CombatStyleName } from '../systems/EnhancedCombatStyleSystem';
import './CombatStylePanel.css';

interface CombatStylePanelProps {
  onClose?: () => void;
}

const CombatStylePanel: React.FC<CombatStylePanelProps> = ({ onClose }) => {
  const { combatStyle, setCombatStyle, player } = useGameStore();
  
  const draggable = useDraggable({ 
    initialPosition: { x: 100, y: 200 } 
  });

  const currentWeapon = player.equipment.weapon || null;
  const availableStyles = EnhancedCombatStyleSystem.getAvailableStyles(currentWeapon);

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
    <div 
      ref={draggable.elementRef}
      className="combat-style-panel"
      style={draggable.style}
    >
      <div 
        className="combat-header drag-handle"
        onMouseDown={draggable.handleMouseDown}
      >
        <h3>Combat Style</h3>
        {onClose && <button className="close-button" onClick={onClose}>×</button>}
      </div>
      
      <div className="weapon-info">
        <div className="weapon-name">
          {currentWeapon ? currentWeapon.name : 'Unarmed'}
        </div>
      </div>

      {!isCurrentStyleValid && (
        <div className="style-warning">
          ⚠️ Invalid for weapon
        </div>
      )}
      
      <div className="combat-styles">
        {combatStyles.map((style) => (
          <button
            key={style.name}
            className={`combat-style-button ${combatStyle === style.name ? 'active' : ''}`}
            onClick={() => handleStyleChange(style.name)}
            title={style.description}
          >
            <div className="style-name">{style.label}</div>
            <div className="style-bonuses">
              {style.definition.attackBonus > 0 && <span>+{style.definition.attackBonus}⚔️</span>}
              {style.definition.strengthBonus > 0 && <span>+{style.definition.strengthBonus}💪</span>}
              {style.definition.defenseBonus > 0 && <span>+{style.definition.defenseBonus}🛡️</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CombatStylePanel;
