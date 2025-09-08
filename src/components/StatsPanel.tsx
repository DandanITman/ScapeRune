import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useDraggable } from '../hooks/useDraggable';
import './StatsPanel.css';

interface StatsPanelProps {
  onSkillClick?: (skillName: string) => void;
  onClose?: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ onSkillClick, onClose }) => {
  const { player } = useGameStore();
  const { stats } = player;
  
  const draggable = useDraggable({ 
    initialPosition: { x: 10, y: 60 } 
  });

  const skillNames = [
    'attack', 'defense', 'strength', 'hits', 'ranged', 'prayer', 'magic',
    'cooking', 'woodcutting', 'fletching', 'fishing', 'firemaking',
    'crafting', 'smithing', 'mining', 'herblaw', 'agility', 'thieving'
  ] as const;

  // Skill icons mapping
  const skillIcons: Record<string, string> = {
    'attack': '⚔️',
    'defense': '🛡️',
    'strength': '💪',
    'hits': '❤️',
    'ranged': '🏹',
    'prayer': '🙏',
    'magic': '✨',
    'cooking': '🍳',
    'woodcutting': '🪓',
    'fletching': '🪶',
    'fishing': '🎣',
    'firemaking': '🔥',
    'crafting': '🧵',
    'smithing': '🔨',
    'mining': '⛏️',
    'herblaw': '🧪',
    'agility': '🤸',
    'thieving': '🥷'
  };

  // Skills that have dedicated panels
  const skillsWithPanels = ['firemaking', 'herblaw', 'agility', 'thieving', 'smithing', 'ranged'];

  const handleSkillClick = (skillName: string) => {
    if (skillsWithPanels.includes(skillName) && onSkillClick) {
      onSkillClick(skillName);
    }
  };

  // Calculate total level
  const totalLevel = Object.values(stats).reduce((sum, level) => sum + level, 0);

  return (
    <div 
      ref={draggable.elementRef}
      className="stats-panel"
      style={draggable.style}
    >
      <div 
        className="stats-header drag-handle"
        onMouseDown={draggable.handleMouseDown}
      >
        <h3>Stats</h3>
        {onClose && <button className="close-button" onClick={onClose}>×</button>}
      </div>

      <div className="stats-summary">
        <span>Combat: {player.combatLevel}</span>
        <span>Total: {totalLevel}</span>
      </div>
      
      <div className="skills-grid">
        {skillNames.map((skill) => {
          const level = stats[skill];
          const hasPanel = skillsWithPanels.includes(skill);
          
          return (
            <div 
              key={skill} 
              className={`skill-card ${hasPanel ? 'clickable' : ''}`}
              onClick={() => handleSkillClick(skill)}
              title={hasPanel ? `Click to open ${skill} panel` : `${skill.charAt(0).toUpperCase() + skill.slice(1)} - Level ${level}`}
            >
              <div className="skill-icon">{skillIcons[skill]}</div>
              <div className="skill-level">{level}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsPanel;
