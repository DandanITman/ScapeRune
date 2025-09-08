import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { ThievingTarget } from '../systems/ThievingSystem';
import './ThievingPanel.css';

interface ThievingPanelProps {
  onClose: () => void;
}

export const ThievingPanel: React.FC<ThievingPanelProps> = ({ onClose }) => {
  const { player } = useGameStore();
  const [selectedTab, setSelectedTab] = useState<'npcs' | 'stalls' | 'chests'>('npcs');
  const [selectedTarget, setSelectedTarget] = useState<ThievingTarget | null>(null);

  // Mock data for demonstration - in real implementation, this would come from ThievingSystem
  const npcTargets: ThievingTarget[] = [
    {
      id: 'man',
      name: 'Man',
      type: 'npc',
      levelRequired: 1,
      experience: 8,
      successRate: 0.6,
      lootTable: [
        { itemId: 'coins', name: 'Coins', quantity: { min: 1, max: 3 }, rarity: 0.6 }
      ],
      stunTime: 5
    },
    {
      id: 'farmer',
      name: 'Farmer',
      type: 'npc',
      levelRequired: 10,
      experience: 14.5,
      successRate: 0.7,
      lootTable: [
        { itemId: 'coins', name: 'Coins', quantity: { min: 5, max: 9 }, rarity: 0.7 },
        { itemId: 'potato_seed', name: 'Potato Seed', quantity: { min: 1, max: 2 }, rarity: 0.3 }
      ],
      stunTime: 5
    },
    {
      id: 'guard',
      name: 'Guard',
      type: 'npc',
      levelRequired: 40,
      experience: 46.8,
      successRate: 0.8,
      lootTable: [
        { itemId: 'coins', name: 'Coins', quantity: { min: 20, max: 30 }, rarity: 0.8 },
        { itemId: 'bread', name: 'Bread', quantity: { min: 1, max: 1 }, rarity: 0.4 }
      ],
      stunTime: 5
    }
  ];

  const stallTargets: ThievingTarget[] = [
    {
      id: 'baker_stall',
      name: 'Baker Stall',
      type: 'stall',
      levelRequired: 5,
      experience: 16,
      successRate: 0.8,
      lootTable: [
        { itemId: 'bread', name: 'Bread', quantity: { min: 1, max: 1 }, rarity: 0.8 },
        { itemId: 'cake', name: 'Cake', quantity: { min: 1, max: 1 }, rarity: 0.2 }
      ],
      respawnTime: 3
    },
    {
      id: 'silk_stall',
      name: 'Silk Stall',
      type: 'stall',
      levelRequired: 20,
      experience: 24,
      successRate: 0.6,
      lootTable: [
        { itemId: 'silk', name: 'Silk', quantity: { min: 1, max: 1 }, rarity: 1.0 }
      ],
      respawnTime: 5
    },
    {
      id: 'gem_stall',
      name: 'Gem Stall',
      type: 'stall',
      levelRequired: 75,
      experience: 160,
      successRate: 0.4,
      lootTable: [
        { itemId: 'sapphire', name: 'Sapphire', quantity: { min: 1, max: 1 }, rarity: 0.4 },
        { itemId: 'emerald', name: 'Emerald', quantity: { min: 1, max: 1 }, rarity: 0.3 },
        { itemId: 'ruby', name: 'Ruby', quantity: { min: 1, max: 1 }, rarity: 0.2 },
        { itemId: 'diamond', name: 'Diamond', quantity: { min: 1, max: 1 }, rarity: 0.1 }
      ],
      respawnTime: 10
    }
  ];

  const chestTargets: ThievingTarget[] = [
    {
      id: 'mans_chest',
      name: "Man's Chest",
      type: 'chest',
      levelRequired: 13,
      experience: 25,
      successRate: 0.9,
      lootTable: [
        { itemId: 'coins', name: 'Coins', quantity: { min: 25, max: 50 }, rarity: 0.9 },
        { itemId: 'iron_ore', name: 'Iron Ore', quantity: { min: 1, max: 1 }, rarity: 0.1 }
      ],
      respawnTime: 60
    },
    {
      id: 'nature_chest',
      name: 'Nature Chest',
      type: 'chest',
      levelRequired: 28,
      experience: 25,
      successRate: 0.5,
      lootTable: [
        { itemId: 'nature_rune', name: 'Nature Rune', quantity: { min: 1, max: 1 }, rarity: 1.0 }
      ],
      respawnTime: 180
    }
  ];

  const getTargetIcon = (type: string): string => {
    switch (type) {
      case 'npc': return '👤';
      case 'stall': return '🏪';
      case 'chest': return '📦';
      default: return '❓';
    }
  };

  const getTargetsByType = () => {
    switch (selectedTab) {
      case 'npcs': return npcTargets;
      case 'stalls': return stallTargets;
      case 'chests': return chestTargets;
      default: return [];
    }
  };

  const canThieveTarget = (target: ThievingTarget): boolean => {
    return player.stats.thieving >= target.levelRequired;
  };

  const getSuccessRate = (target: ThievingTarget): number => {
    const level = player.stats.thieving;
    const baseRate = Math.min(0.95, 0.3 + (level - target.levelRequired) * 0.02);
    return Math.max(0.1, baseRate);
  };

  const formatCooldown = (respawnTime?: number): string => {
    if (!respawnTime) return 'None';
    if (respawnTime < 60) return `${respawnTime}s`;
    return `${Math.floor(respawnTime / 60)}m ${respawnTime % 60}s`;
  };

  return (
    <div className="thieving-panel">
      <div className="thieving-header">
        <h2>Thieving</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="thieving-tabs">
        <button 
          className={`tab ${selectedTab === 'npcs' ? 'active' : ''}`}
          onClick={() => setSelectedTab('npcs')}
        >
          NPCs
        </button>
        <button 
          className={`tab ${selectedTab === 'stalls' ? 'active' : ''}`}
          onClick={() => setSelectedTab('stalls')}
        >
          Stalls
        </button>
        <button 
          className={`tab ${selectedTab === 'chests' ? 'active' : ''}`}
          onClick={() => setSelectedTab('chests')}
        >
          Chests
        </button>
      </div>

      <div className="thieving-content">
        <div className="targets-list">
          <h3>{selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}</h3>
          {getTargetsByType().map(target => (
            <div 
              key={target.id}
              className={`target-item ${canThieveTarget(target) ? 'available' : 'locked'} ${selectedTarget?.id === target.id ? 'selected' : ''}`}
              onClick={() => setSelectedTarget(target)}
            >
              <div className="target-icon">{getTargetIcon(target.type)}</div>
              <div className="target-info">
                <div className="target-name">{target.name}</div>
                <div className="target-level">Level {target.levelRequired}</div>
                <div className="target-xp">{target.experience} XP</div>
              </div>
              <div className="target-status">
                {canThieveTarget(target) ? '✅' : '🔒'}
              </div>
            </div>
          ))}
        </div>

        {selectedTarget && (
          <div className="target-details">
            <h3>{selectedTarget.name}</h3>
            <div className="target-stats">
              <div className="stat-row">
                <span>Type:</span>
                <span>{selectedTarget.type}</span>
              </div>
              <div className="stat-row">
                <span>Level Required:</span>
                <span>{selectedTarget.levelRequired}</span>
              </div>
              <div className="stat-row">
                <span>Experience:</span>
                <span>{selectedTarget.experience} XP</span>
              </div>
              <div className="stat-row">
                <span>Success Rate:</span>
                <span>{Math.round(getSuccessRate(selectedTarget) * 100)}%</span>
              </div>
              <div className="stat-row">
                <span>Cooldown:</span>
                <span>{formatCooldown(selectedTarget.respawnTime)}</span>
              </div>
              {selectedTarget.stunTime && selectedTarget.stunTime > 0 && (
                <div className="stat-row">
                  <span>Stun Time:</span>
                  <span>{selectedTarget.stunTime}s</span>
                </div>
              )}
            </div>

            <div className="loot-table">
              <h4>Possible Loot:</h4>
              {selectedTarget.lootTable.map((loot, index) => (
                <div key={index} className="loot-item">
                  <span className="loot-icon">📦</span>
                  <span className="loot-name">{loot.name}</span>
                  <span className="loot-chance">{Math.round(loot.rarity * 100)}%</span>
                  <span className="loot-amount">
                    {loot.quantity.min === loot.quantity.max 
                      ? loot.quantity.min 
                      : `${loot.quantity.min}-${loot.quantity.max}`}
                  </span>
                </div>
              ))}
            </div>

            <div className="target-description">
              {selectedTarget.type === 'npc' && 'Pickpocket this NPC to steal coins and items. Be careful not to get caught!'}
              {selectedTarget.type === 'stall' && 'Steal items from this market stall. Guards may pursue you if caught.'}
              {selectedTarget.type === 'chest' && 'Carefully pick the lock on this chest to access valuable items inside.'}
            </div>

            {canThieveTarget(selectedTarget) ? (
              <button className="thieve-btn">
                {selectedTarget.type === 'npc' ? 'Pickpocket' : 
                 selectedTarget.type === 'stall' ? 'Steal From' : 
                 'Pick Lock'}
              </button>
            ) : (
              <div className="requirement-warning">
                You need level {selectedTarget.levelRequired} Thieving to attempt this.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="thieving-footer">
        <div className="current-level">
          Thieving Level: {player.stats.thieving} 
          ({player.experience.thieving?.toLocaleString() || 0} XP)
        </div>
        <div className="thieving-tip">
          💡 Tip: Higher Thieving levels increase success rates and unlock new targets!
        </div>
      </div>
    </div>
  );
};
