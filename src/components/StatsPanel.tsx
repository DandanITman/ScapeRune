import React from 'react';
import { useGameStore } from '../store/gameStore';
import './StatsPanel.css';

const StatsPanel: React.FC = () => {
  const { player } = useGameStore();
  const getEquipmentBonuses = useGameStore(state => state.getEquipmentBonuses);
  const { stats, experience } = player;
  const equipmentBonuses = getEquipmentBonuses();

  const skillNames = [
    'attack', 'defense', 'strength', 'hits', 'ranged', 'prayer', 'magic',
    'cooking', 'woodcutting', 'fletching', 'fishing', 'firemaking',
    'crafting', 'smithing', 'mining', 'herblaw', 'agility', 'thieving'
  ] as const;

  // Calculate total level
  const totalLevel = Object.values(stats).reduce((sum, level) => sum + level, 0);

  // Calculate experience to next level
  const expTable = [
    0, 83, 174, 276, 388, 512, 650, 801, 969, 1154, 1358, 1584, 1833, 2107, 2411,
    2746, 3115, 3523, 3973, 4470, 5018, 5624, 6291, 7028, 7842, 8740, 9730, 10824,
    12031, 13363, 14833, 16456, 18247, 20224, 22406, 24815, 27473, 30408, 33648,
    37224, 41171, 45529, 50339, 55649, 61512, 67983, 75127, 83014, 91721, 101333,
    111945, 123660, 136594, 150872, 166636, 184040, 203254, 224466, 247886, 273742,
    302288, 333804, 368599, 407015, 449428, 496254, 547953, 605032, 668051, 737627,
    814445, 899257, 992895, 1096278, 1210421, 1336443, 1475581, 1629200, 1798808,
    1986068, 2192818, 2421087, 2673114, 2951373, 3258594, 3597792, 3972294, 4385776,
    4842295, 5346332, 5902831, 6517253, 7195629, 7944614, 8771558, 9684577, 10692629,
    11805606, 13034431
  ];

  const getExpToNextLevel = (currentExp: number, currentLevel: number): number => {
    if (currentLevel >= 99) return 0;
    return expTable[currentLevel + 1] - currentExp;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="stats-panel">
      <div className="stats-header">
        <h3>Player Statistics</h3>
        <p>Combat Level: {player.combatLevel}</p>
        <p>Total Level: {totalLevel}</p>
      </div>

      {/* Equipment Bonuses Section */}
      <div className="equipment-bonuses">
        <h4>Equipment Bonuses</h4>
        <div className="bonus-row">
          <span>Attack: +{equipmentBonuses.attackBonus}</span>
          <span>Strength: +{equipmentBonuses.strengthBonus}</span>
          <span>Defense: +{equipmentBonuses.defenseBonus}</span>
        </div>
      </div>
      
      <div className="stats-grid">
        {skillNames.map((skill) => {
          const level = stats[skill];
          const exp = experience[skill];
          const expToNext = getExpToNextLevel(exp, level);
          
          return (
            <div key={skill} className="skill-row">
              <div className="skill-info">
                <div className="skill-name">
                  {skill.charAt(0).toUpperCase() + skill.slice(1)}
                </div>
                <div className="skill-level">Level: {level}</div>
              </div>
              <div className="skill-exp">
                <div>Exp: {formatNumber(exp)}</div>
                {level < 99 && (
                  <div className="exp-to-next">
                    To next: {formatNumber(expToNext)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsPanel;
