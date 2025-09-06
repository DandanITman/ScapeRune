import React, { useState, useEffect } from 'react';
import './CombatUI.css';

export interface FloatingText {
  id: string;
  text: string;
  type: 'damage' | 'miss' | 'xp' | 'heal';
  x: number;
  y: number;
  timestamp: number;
}

export interface HealthBar {
  id: string;
  name: string;
  currentHealth: number;
  maxHealth: number;
  x: number;
  y: number;
  isPlayer?: boolean;
}

interface CombatUIProps {
  floatingTexts: FloatingText[];
  healthBars: HealthBar[];
  onTextComplete: (id: string) => void;
}

const CombatUI: React.FC<CombatUIProps> = ({ floatingTexts, healthBars, onTextComplete }) => {
  const [visibleTexts, setVisibleTexts] = useState<FloatingText[]>([]);

  useEffect(() => {
    setVisibleTexts(floatingTexts);

    // Auto-remove texts after animation
    floatingTexts.forEach(text => {
      setTimeout(() => {
        onTextComplete(text.id);
      }, 2000);
    });
  }, [floatingTexts, onTextComplete]);

  const getTextStyle = (text: FloatingText) => {
    const age = Date.now() - text.timestamp;
    const opacity = Math.max(0, 1 - (age / 2000));
    const yOffset = -(age / 10); // Float upward

    return {
      position: 'absolute' as const,
      left: text.x,
      top: text.y + yOffset,
      opacity,
      pointerEvents: 'none' as const,
      zIndex: 2000,
      transform: 'translate(-50%, -50%)',
      transition: 'none'
    };
  };

  const getHealthBarPercentage = (health: HealthBar) => {
    return Math.max(0, (health.currentHealth / health.maxHealth) * 100);
  };

  return (
    <div className="combat-ui">
      {/* Floating damage/miss/xp text */}
      {visibleTexts.map(text => (
        <div
          key={text.id}
          className={`floating-text floating-text-${text.type}`}
          style={getTextStyle(text)}
        >
          {text.text}
        </div>
      ))}

      {/* Health bars */}
      {healthBars.map(health => (
        <div
          key={health.id}
          className={`health-bar ${health.isPlayer ? 'player-health' : 'npc-health'}`}
          style={{
            position: 'absolute',
            left: health.x,
            top: health.y - 60,
            transform: 'translate(-50%, 0)',
            zIndex: 1500
          }}
        >
          <div className="health-bar-name">{health.name}</div>
          <div className="health-bar-container">
            <div 
              className="health-bar-fill"
              style={{ width: `${getHealthBarPercentage(health)}%` }}
            />
            <div className="health-bar-text">
              {health.currentHealth}/{health.maxHealth}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CombatUI;
