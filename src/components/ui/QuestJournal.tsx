import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { QuestSystem } from '../../systems/QuestSystem';
import type { Quest, QuestCategory, QuestDifficulty, PlayerQuestProgress } from '../../types/quest';
import { COOKS_ASSISTANT, SHEEP_SHEARER } from '../../data/quests';
import './QuestJournal.css';

interface QuestJournalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestJournal: React.FC<QuestJournalProps> = ({ isOpen, onClose }) => {
  const { questProgress } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<QuestCategory | 'All'>('All');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  // All available quests
  const allQuests: Quest[] = [COOKS_ASSISTANT, SHEEP_SHEARER];

  const filteredQuests = allQuests.filter(quest => 
    selectedCategory === 'All' || quest.category === selectedCategory
  );

  const getQuestStatus = (quest: Quest): 'not_started' | 'in_progress' | 'completed' => {
    const progress = questProgress[quest.id];
    if (!progress) return 'not_started';
    if (progress.completed) return 'completed';
    return 'in_progress';
  };

  const getQuestProgress = (quest: Quest): PlayerQuestProgress | undefined => {
    return questProgress[quest.id];
  };

  const getDifficultyColor = (difficulty: QuestDifficulty): string => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Experienced': return '#F44336';
      case 'Master': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: 'not_started' | 'in_progress' | 'completed'): string => {
    switch (status) {
      case 'not_started': return '⭕';
      case 'in_progress': return '🔄';
      case 'completed': return '✅';
    }
  };

  const handleStartQuest = (quest: Quest) => {
    QuestSystem.getInstance().startQuest(quest.id);
  };

  if (!isOpen) return null;

  return (
    <div className="quest-journal-overlay">
      <div className="quest-scroll">
        <div className="scroll-header">
          <h2 className="scroll-title">Quest Journal</h2>
          <button className="close-scroll" onClick={onClose}>×</button>
        </div>
        
        <div className="scroll-content">
          {/* Quest Categories */}
          <div className="quest-categories">
            {(['All', 'Free', 'Members'] as const).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
            
            {/* Quest Statistics */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.3)',
              border: '1px solid #8B4513',
              borderRadius: '6px',
              padding: '8px',
              marginTop: '10px',
              fontSize: '10px',
              color: '#654321'
            }}>
              <div>QP: {Object.values(questProgress).reduce((sum, p) => p.completed ? sum + (allQuests.find(q => q.id === p.questId)?.questPoints || 0) : sum, 0)}</div>
              <div>Done: {Object.values(questProgress).filter(p => p.completed).length}</div>
              <div>Active: {Object.values(questProgress).filter(p => !p.completed && p.currentStage).length}</div>
            </div>
          </div>

          {/* Quest List */}
          <div className="quest-list">
            {filteredQuests.map((quest) => {
              const status = getQuestStatus(quest);
              const progress = getQuestProgress(quest);
              
              return (
                <div
                  key={quest.id}
                  onClick={() => setSelectedQuest(quest)}
                  className={`quest-item ${selectedQuest?.id === quest.id ? 'selected' : ''}`}
                >
                  <div className="quest-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="quest-status-icon">{getStatusIcon(status)}</span>
                      <span className="quest-name">{quest.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="quest-points">{quest.questPoints} QP</span>
                      <span 
                        className="quest-difficulty"
                        style={{ 
                          backgroundColor: getDifficultyColor(quest.difficulty),
                          color: 'white'
                        }}
                      >
                        {quest.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  {progress && !progress.completed && (
                    <div className="quest-progress">
                      Current: {allQuests.find(q => q.id === quest.id)?.stages.find(s => s.id === progress.currentStage)?.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quest Details */}
          <div className="quest-details">
            {selectedQuest ? (
              <div className="quest-details-content">
                <div className="quest-details-header">
                  <h3 className="quest-details-title">{selectedQuest.name}</h3>
                  <div className="quest-badges">
                    <span 
                      className="quest-difficulty"
                      style={{ 
                        backgroundColor: getDifficultyColor(selectedQuest.difficulty),
                        color: 'white'
                      }}
                    >
                      {selectedQuest.difficulty}
                    </span>
                    <span className="quest-points">{selectedQuest.questPoints} QP</span>
                  </div>
                </div>

                {/* Quest Description */}
                <div className="quest-section">
                  <p>{selectedQuest.description}</p>
                </div>

                {/* Quest Status */}
                <div className="quest-section">
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid #D2B48C',
                    borderRadius: '6px',
                    padding: '10px',
                    marginBottom: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{getStatusIcon(getQuestStatus(selectedQuest))}</span>
                      <span style={{ fontWeight: 'bold' }}>
                        {getQuestStatus(selectedQuest) === 'not_started' && 'Not Started'}
                        {getQuestStatus(selectedQuest) === 'in_progress' && 'In Progress'}
                        {getQuestStatus(selectedQuest) === 'completed' && 'Completed'}
                      </span>
                    </div>

                    {getQuestStatus(selectedQuest) === 'not_started' && (
                      <button
                        onClick={() => handleStartQuest(selectedQuest)}
                        style={{
                          background: '#32CD32',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Start Quest
                      </button>
                    )}
                  </div>
                </div>

                {/* Quest Progress */}
                {(() => {
                  const progress = getQuestProgress(selectedQuest);
                  if (progress) {
                    return (
                      <div className="quest-section">
                        <h4>Progress</h4>
                        <ul className="quest-stages">
                          {selectedQuest.stages.map((stage) => {
                            const isCompleted = progress.completedStages.includes(stage.id);
                            const isCurrentStage = progress.currentStage === stage.id;
                            
                            return (
                              <li key={stage.id} className="quest-stage">
                                <div className="quest-stage-header">
                                  <span>
                                    {isCompleted ? '✅' : isCurrentStage ? '🔄' : '⭕'}
                                  </span>
                                  <span>{stage.name}</span>
                                </div>
                                
                                {isCurrentStage && (
                                  <div className="quest-objectives">
                                    {stage.objectives.map((objective) => {
                                      const objProgress = progress.objectiveProgress[objective.id] || 0;
                                      const quantity = objective.quantity || 1;
                                      return (
                                        <div key={objective.id} className="quest-objective">
                                          <span>{objective.description}</span>
                                          <span>
                                            {objProgress}/{quantity}
                                            {objProgress >= quantity ? ' ✅' : ''}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Requirements */}
                {selectedQuest.requirements.length > 0 && (
                  <div className="quest-section">
                    <h4>Requirements</h4>
                    <ul className="requirements-list">
                      {selectedQuest.requirements.map((req, index) => (
                        <li key={index}>
                          {req.type === 'skill' && `${req.skill} level ${req.level}`}
                          {req.type === 'quest' && `Complete: ${req.questId}`}
                          {req.type === 'item' && `Have: ${req.quantity} ${req.itemId}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Rewards */}
                <div className="quest-section">
                  <h4>Rewards</h4>
                  <ul className="rewards-list">
                    {selectedQuest.rewards.map((reward, index) => (
                      <li key={index}>
                        {reward.type === 'experience' && `${reward.amount} ${reward.skill} XP`}
                        {reward.type === 'money' && `${reward.amount} coins`}
                        {reward.type === 'item' && `${reward.quantity} ${reward.itemId}`}
                        {reward.type === 'access' && `Access to: ${reward.accessId}`}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quest Info */}
                <div className="quest-section">
                  <div style={{ fontSize: '12px', color: '#8B4513', opacity: 0.8 }}>
                    <div>Released: {selectedQuest.released}</div>
                    <div>Length: {selectedQuest.originalLength}</div>
                    <div>Category: {selectedQuest.category}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="quest-placeholder">
                <div className="quest-placeholder-icon">�</div>
                <div className="quest-placeholder-text">Select a quest to view details</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
