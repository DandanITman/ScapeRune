import React from 'react';
import { useGameStore } from '../store/gameStore';
import './CombatStylePanel.css';

const CombatStylePanel: React.FC = () => {
  const { combatStyle, setCombatStyle } = useGameStore();

  const combatStyles = [
    {
      name: 'accurate',
      label: 'Accurate',
      description: '+3 Attack bonus, gives Attack XP'
    },
    {
      name: 'aggressive',
      label: 'Aggressive',
      description: '+3 Strength bonus, gives Strength XP'
    },
    {
      name: 'defensive',
      label: 'Defensive',
      description: '+3 Defense bonus, gives Defense XP'
    },
    {
      name: 'controlled',
      label: 'Controlled',
      description: '+1 to all bonuses, gives shared XP'
    }
  ];

  return (
    <div className="combat-style-panel">
      <h3>Combat Style</h3>
      <div className="combat-styles">
        {combatStyles.map((style) => (
          <button
            key={style.name}
            className={`combat-style-button ${combatStyle === style.name ? 'active' : ''}`}
            onClick={() => setCombatStyle(style.name as 'accurate' | 'aggressive' | 'defensive' | 'controlled')}
          >
            <div className="style-name">{style.label}</div>
            <div className="style-description">{style.description}</div>
          </button>
        ))}
      </div>
      <div className="current-style">
        Current: <strong>{combatStyles.find(s => s.name === combatStyle)?.label}</strong>
      </div>
    </div>
  );
};

export default CombatStylePanel;
