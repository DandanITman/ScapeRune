import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { QuestSystem } from '../../systems/QuestSystem';
import type { Quest, QuestCategory, QuestDifficulty, PlayerQuestProgress } from '../../types/quest';
import { COOKS_ASSISTANT, SHEEP_SHEARER } from '../../data/quests';

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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-amber-100 to-amber-200 border-4 border-amber-600 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] flex">
        {/* Quest List */}
        <div className="w-1/3 border-r-2 border-amber-600 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-amber-900">Quest Journal</h2>
            <button
              onClick={onClose}
              className="text-amber-900 hover:text-red-600 text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as QuestCategory | 'All')}
              className="w-full p-2 border-2 border-amber-600 rounded bg-white"
            >
              <option value="All">All Quests</option>
              <option value="Free">Free Quests</option>
              <option value="Members">Members Quests</option>
              <option value="Miniquest">Miniquests</option>
            </select>
          </div>

          {/* Quest Statistics */}
          <div className="mb-4 p-2 bg-amber-50 border border-amber-400 rounded text-sm">
            <div className="text-amber-800">
              <div>Total Quest Points: {Object.values(questProgress).reduce((sum, p) => p.completed ? sum + (allQuests.find(q => q.id === p.questId)?.questPoints || 0) : sum, 0)}</div>
              <div>Completed: {Object.values(questProgress).filter(p => p.completed).length}</div>
              <div>In Progress: {Object.values(questProgress).filter(p => !p.completed && p.currentStage).length}</div>
            </div>
          </div>

          {/* Quest List */}
          <div className="space-y-1">
            {filteredQuests.map((quest) => {
              const status = getQuestStatus(quest);
              const progress = getQuestProgress(quest);
              
              return (
                <div
                  key={quest.id}
                  onClick={() => setSelectedQuest(quest)}
                  className={`p-2 border border-amber-400 rounded cursor-pointer transition-colors ${
                    selectedQuest?.id === quest.id 
                      ? 'bg-amber-300' 
                      : 'bg-amber-50 hover:bg-amber-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStatusIcon(status)}</span>
                      <div>
                        <div className="font-medium text-amber-900">{quest.name}</div>
                        <div className="text-xs text-amber-700">
                          <span style={{ color: getDifficultyColor(quest.difficulty) }}>
                            {quest.difficulty}
                          </span>
                          {' • '}
                          {quest.questPoints} QP
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {progress && !progress.completed && (
                    <div className="mt-1 text-xs text-amber-600">
                      Stage: {allQuests.find(q => q.id === quest.id)?.stages.find(s => s.id === progress.currentStage)?.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quest Details */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedQuest ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-amber-900">{selectedQuest.name}</h3>
                <div className="flex items-center space-x-2">
                  <span 
                    className="px-2 py-1 rounded text-white text-sm font-medium"
                    style={{ backgroundColor: getDifficultyColor(selectedQuest.difficulty) }}
                  >
                    {selectedQuest.difficulty}
                  </span>
                  <span className="text-amber-700">{selectedQuest.questPoints} QP</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-amber-800">{selectedQuest.description}</p>
              </div>

              {/* Quest Status */}
              <div className="mb-4 p-3 bg-amber-50 border border-amber-400 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getStatusIcon(getQuestStatus(selectedQuest))}</span>
                  <span className="font-medium text-amber-900">
                    {getQuestStatus(selectedQuest) === 'not_started' && 'Not Started'}
                    {getQuestStatus(selectedQuest) === 'in_progress' && 'In Progress'}
                    {getQuestStatus(selectedQuest) === 'completed' && 'Completed'}
                  </span>
                </div>

                {getQuestStatus(selectedQuest) === 'not_started' && (
                  <button
                    onClick={() => handleStartQuest(selectedQuest)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
                  >
                    Start Quest
                  </button>
                )}
              </div>

              {/* Quest Progress */}
              {getQuestProgress(selectedQuest) && (
                <div className="mb-4">
                  <h4 className="font-bold text-amber-900 mb-2">Progress</h4>
                  <div className="space-y-2">
                    {selectedQuest.stages.map((stage) => {
                      const progress = getQuestProgress(selectedQuest)!;
                      const isCurrentStage = stage.id === progress.currentStage;
                      const isCompleted = progress.completedStages.includes(stage.id);
                      
                      return (
                        <div key={stage.id} className={`p-2 border rounded ${
                          isCompleted ? 'bg-green-100 border-green-400' :
                          isCurrentStage ? 'bg-blue-100 border-blue-400' :
                          'bg-gray-100 border-gray-400'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span>
                              {isCompleted ? '✅' : isCurrentStage ? '🔄' : '⭕'}
                            </span>
                            <span className="font-medium">{stage.name}</span>
                          </div>
                          
                            {isCurrentStage && (
                            <div className="mt-2 space-y-1">
                              {stage.objectives.map((objective) => {
                                const objProgress = progress.objectiveProgress[objective.id] || 0;
                                const quantity = objective.quantity || 1;
                                return (
                                  <div key={objective.id} className="text-sm text-gray-700">
                                    <div className="flex justify-between">
                                      <span>{objective.description}</span>
                                      <span>
                                        {objProgress}/{quantity}
                                        {objProgress >= quantity ? ' ✅' : ''}
                                      </span>
                                    </div>
                                    {quantity > 1 && (
                                      <div className="w-full bg-gray-300 rounded-full h-2 mt-1">
                                        <div 
                                          className="bg-blue-600 h-2 rounded-full transition-all"
                                          style={{ width: `${Math.min(100, (objProgress / quantity) * 100)}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {selectedQuest.requirements.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold text-amber-900 mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {selectedQuest.requirements.map((req, index) => (
                      <li key={index} className="text-amber-800 text-sm">
                        • {req.type === 'skill' && `${req.skill} level ${req.level}`}
                        {req.type === 'quest' && `Complete: ${req.questId}`}
                        {req.type === 'item' && `Have: ${req.quantity} ${req.itemId}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rewards */}
              <div className="mb-4">
                <h4 className="font-bold text-amber-900 mb-2">Rewards</h4>
                <ul className="space-y-1">
                  {selectedQuest.rewards.map((reward, index) => (
                    <li key={index} className="text-amber-800 text-sm">
                      • {reward.type === 'experience' && `${reward.amount} ${reward.skill} XP`}
                      {reward.type === 'money' && `${reward.amount} coins`}
                      {reward.type === 'item' && `${reward.quantity} ${reward.itemId}`}
                      {reward.type === 'access' && `Access to: ${reward.accessId}`}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quest Info */}
              <div className="text-xs text-amber-600 space-y-1">
                <div>Released: {selectedQuest.released}</div>
                <div>Length: {selectedQuest.originalLength}</div>
                <div>Category: {selectedQuest.category}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-amber-700">
              <div className="text-center">
                <div className="text-4xl mb-2">📖</div>
                <div>Select a quest to view details</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
