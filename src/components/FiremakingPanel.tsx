import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useDraggable } from '../hooks/useDraggable';
import type { FireType } from '../systems/FiremakingSystem';
import './FiremakingPanel.css';

interface FiremakingPanelProps {
  onClose: () => void;
}

export const FiremakingPanel: React.FC<FiremakingPanelProps> = ({ onClose }) => {
  const { player } = useGameStore();
  const [selectedFire, setSelectedFire] = useState<FireType | null>(null);
  
  const draggable = useDraggable({ 
    initialPosition: { x: 250, y: 120 } 
  });

  // Mock data for demonstration - in real implementation, this would come from FiremakingSystem
  const fires: FireType[] = [
    {
      id: 'normal_logs',
      name: 'Normal Logs',
      logId: 'normal_logs',
      levelRequired: 1,
      experience: 40,
      burnTime: 60,
      lightChance: 0.5
    },
    {
      id: 'achey_logs',
      name: 'Achey Tree Logs',
      logId: 'achey_logs',
      levelRequired: 1,
      experience: 40,
      burnTime: 60,
      lightChance: 0.5
    },
    {
      id: 'oak_logs',
      name: 'Oak Logs',
      logId: 'oak_logs',
      levelRequired: 15,
      experience: 60,
      burnTime: 90,
      lightChance: 0.6
    },
    {
      id: 'willow_logs',
      name: 'Willow Logs',
      logId: 'willow_logs',
      levelRequired: 30,
      experience: 90,
      burnTime: 120,
      lightChance: 0.7
    },
    {
      id: 'maple_logs',
      name: 'Maple Logs',
      logId: 'maple_logs',
      levelRequired: 45,
      experience: 135,
      burnTime: 180,
      lightChance: 0.75
    },
    {
      id: 'yew_logs',
      name: 'Yew Logs',
      logId: 'yew_logs',
      levelRequired: 60,
      experience: 202.5,
      burnTime: 240,
      lightChance: 0.8
    },
    {
      id: 'magic_logs',
      name: 'Magic Logs',
      logId: 'magic_logs',
      levelRequired: 75,
      experience: 303.8,
      burnTime: 300,
      lightChance: 0.85
    }
  ];

  const getFireIcon = (fire: FireType): string => {
    switch (fire.logId) {
      case 'normal_logs': return '🪵';
      case 'achey_logs': return '🪵';
      case 'oak_logs': return '🌳';
      case 'willow_logs': return '🌿';
      case 'maple_logs': return '🍁';
      case 'yew_logs': return '🌲';
      case 'magic_logs': return '✨';
      default: return '🔥';
    }
  };

  const canLightFire = (fire: FireType): boolean => {
    return player.stats.firemaking >= fire.levelRequired;
  };

  const getActualLightChance = (fire: FireType): number => {
    const level = player.stats.firemaking;
    const bonus = Math.max(0, (level - fire.levelRequired) * 0.01);
    return Math.min(0.99, fire.lightChance + bonus);
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  return (
    <div 
      ref={draggable.elementRef}
      className="firemaking-panel"
      style={draggable.style}
    >
      <div 
        className="firemaking-header drag-handle"
        onMouseDown={draggable.handleMouseDown}
      >
        <h2>Firemaking</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="firemaking-content">
        <div className="fires-list">
          <h3>Available Logs</h3>
          {fires.map(fire => (
            <div 
              key={fire.id}
              className={`fire-item ${canLightFire(fire) ? 'available' : 'locked'} ${selectedFire?.id === fire.id ? 'selected' : ''}`}
              onClick={() => setSelectedFire(fire)}
            >
              <div className="fire-icon">{getFireIcon(fire)}</div>
              <div className="fire-info">
                <div className="fire-name">{fire.name}</div>
                <div className="fire-level">Level {fire.levelRequired}</div>
                <div className="fire-xp">{fire.experience} XP</div>
              </div>
              <div className="fire-status">
                {canLightFire(fire) ? '✅' : '🔒'}
              </div>
            </div>
          ))}
        </div>

        {selectedFire && (
          <div className="fire-details">
            <h3>{selectedFire.name}</h3>
            <div className="fire-stats">
              <div className="stat-row">
                <span>Level Required:</span>
                <span>{selectedFire.levelRequired}</span>
              </div>
              <div className="stat-row">
                <span>Experience:</span>
                <span>{selectedFire.experience} XP</span>
              </div>
              <div className="stat-row">
                <span>Burn Time:</span>
                <span>{formatTime(selectedFire.burnTime)}</span>
              </div>
              <div className="stat-row">
                <span>Base Light Chance:</span>
                <span>{Math.round(selectedFire.lightChance * 100)}%</span>
              </div>
              <div className="stat-row">
                <span>Your Light Chance:</span>
                <span>{Math.round(getActualLightChance(selectedFire) * 100)}%</span>
              </div>
            </div>

            <div className="fire-description">
              Light these logs to create a fire for cooking or warmth. Higher level logs 
              burn longer and provide more experience, but require more skill to light successfully.
              <br /><br />
              <strong>Uses:</strong>
              <ul>
                <li>🍖 Cooking food</li>
                <li>💡 Providing light in dark areas</li>
                <li>🏠 Warmth and comfort</li>
                <li>📈 Training Firemaking skill</li>
              </ul>
            </div>

            <div className="fire-requirements">
              <h4>Required Items:</h4>
              <div className="requirement-item">
                <span className="requirement-icon">🔥</span>
                <span className="requirement-name">Tinderbox</span>
              </div>
              <div className="requirement-item">
                <span className="requirement-icon">{getFireIcon(selectedFire)}</span>
                <span className="requirement-name">{selectedFire.name}</span>
              </div>
            </div>

            {canLightFire(selectedFire) ? (
              <button className="light-fire-btn">
                Light Fire
              </button>
            ) : (
              <div className="requirement-warning">
                You need level {selectedFire.levelRequired} Firemaking to light this type of fire.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="firemaking-footer">
        <div className="current-level">
          Firemaking Level: {player.stats.firemaking} 
          ({player.experience.firemaking?.toLocaleString() || 0} XP)
        </div>
        <div className="firemaking-tip">
          💡 Tip: Higher Firemaking levels increase your success rate and unlock stronger logs!
        </div>
      </div>
    </div>
  );
};
