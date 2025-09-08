import React, { useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import type { AgilityObstacle, AgilityCourse } from '../systems/AgilitySystem';
import './AgilityPanel.css';

interface AgilityPanelProps {
  onClose: () => void;
}

export const AgilityPanel: React.FC<AgilityPanelProps> = ({ onClose }) => {
  const { player } = useGameStore();
  const [selectedTab, setSelectedTab] = useState<'obstacles' | 'courses'>('obstacles');
  const [selectedObstacle, setSelectedObstacle] = useState<AgilityObstacle | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<AgilityCourse | null>(null);

  // Mock data for demonstration - in real implementation, this would come from AgilitySystem
  const obstacles: AgilityObstacle[] = [
    {
      id: 'lumbridge_log',
      name: 'Log Balance',
      type: 'log',
      levelRequired: 1,
      experience: 7.5,
      successRate: 0.95,
      failDamage: 2,
      position: new THREE.Vector3(-5, 0, 15)
    },
    {
      id: 'lumbridge_rope',
      name: 'Rope Swing',
      type: 'rope',
      levelRequired: 1,
      experience: 10,
      successRate: 0.9,
      failDamage: 3,
      position: new THREE.Vector3(-3, 0, 18)
    },
    {
      id: 'lumbridge_wall',
      name: 'Low Wall',
      type: 'wall',
      levelRequired: 5,
      experience: 12.5,
      successRate: 0.85,
      failDamage: 4,
      position: new THREE.Vector3(0, 0, 20)
    }
  ];

  const courses: AgilityCourse[] = [
    {
      id: 'lumbridge_course',
      name: 'Lumbridge Agility Course',
      location: 'lumbridge',
      levelRequired: 1,
      completionBonus: 50,
      obstacles: obstacles
    }
  ];

  const getObstacleIcon = (type: string): string => {
    switch (type) {
      case 'log': return '🪵';
      case 'rope': return '🪢';
      case 'wall': return '🧱';
      case 'gap': return '🕳️';
      case 'pipe': return '🔧';
      case 'ledge': return '🪨';
      default: return '❓';
    }
  };

  const canUseObstacle = (obstacle: AgilityObstacle): boolean => {
    return player.stats.agility >= obstacle.levelRequired;
  };

  const canCompleteCourse = (course: AgilityCourse): boolean => {
    return player.stats.agility >= course.levelRequired;
  };

  return (
    <div className="agility-panel">
      <div className="agility-header">
        <h2>Agility Training</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="agility-tabs">
        <button 
          className={`tab ${selectedTab === 'obstacles' ? 'active' : ''}`}
          onClick={() => setSelectedTab('obstacles')}
        >
          Obstacles
        </button>
        <button 
          className={`tab ${selectedTab === 'courses' ? 'active' : ''}`}
          onClick={() => setSelectedTab('courses')}
        >
          Courses
        </button>
      </div>

      <div className="agility-content">
        {selectedTab === 'obstacles' && (
          <div className="obstacles-tab">
            <div className="obstacles-list">
              <h3>Available Obstacles</h3>
              {obstacles.map(obstacle => (
                <div 
                  key={obstacle.id}
                  className={`obstacle-item ${canUseObstacle(obstacle) ? 'available' : 'locked'} ${selectedObstacle?.id === obstacle.id ? 'selected' : ''}`}
                  onClick={() => setSelectedObstacle(obstacle)}
                >
                  <div className="obstacle-icon">{getObstacleIcon(obstacle.type)}</div>
                  <div className="obstacle-info">
                    <div className="obstacle-name">{obstacle.name}</div>
                    <div className="obstacle-level">Level {obstacle.levelRequired}</div>
                    <div className="obstacle-xp">{obstacle.experience} XP</div>
                  </div>
                  <div className="obstacle-status">
                    {canUseObstacle(obstacle) ? '✅' : '🔒'}
                  </div>
                </div>
              ))}
            </div>

            {selectedObstacle && (
              <div className="obstacle-details">
                <h3>{selectedObstacle.name}</h3>
                <div className="obstacle-stats">
                  <div className="stat-row">
                    <span>Type:</span>
                    <span>{selectedObstacle.type}</span>
                  </div>
                  <div className="stat-row">
                    <span>Level Required:</span>
                    <span>{selectedObstacle.levelRequired}</span>
                  </div>
                  <div className="stat-row">
                    <span>Experience:</span>
                    <span>{selectedObstacle.experience} XP</span>
                  </div>
                  <div className="stat-row">
                    <span>Success Rate:</span>
                    <span>{Math.round(selectedObstacle.successRate * 100)}%</span>
                  </div>
                  <div className="stat-row">
                    <span>Fail Damage:</span>
                    <span>{selectedObstacle.failDamage} HP</span>
                  </div>
                </div>
                
                <div className="obstacle-description">
                  Navigate this {selectedObstacle.type} obstacle to gain Agility experience. 
                  Higher Agility levels increase your success rate.
                </div>

                {canUseObstacle(selectedObstacle) ? (
                  <button className="use-obstacle-btn">
                    Use {selectedObstacle.name}
                  </button>
                ) : (
                  <div className="requirement-warning">
                    You need level {selectedObstacle.levelRequired} Agility to use this obstacle.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'courses' && (
          <div className="courses-tab">
            <div className="courses-list">
              <h3>Agility Courses</h3>
              {courses.map(course => (
                <div 
                  key={course.id}
                  className={`course-item ${canCompleteCourse(course) ? 'available' : 'locked'} ${selectedCourse?.id === course.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="course-icon">🏃</div>
                  <div className="course-info">
                    <div className="course-name">{course.name}</div>
                    <div className="course-location">{course.location}</div>
                    <div className="course-level">Level {course.levelRequired}</div>
                    <div className="course-bonus">Bonus: {course.completionBonus} XP</div>
                  </div>
                  <div className="course-status">
                    {canCompleteCourse(course) ? '✅' : '🔒'}
                  </div>
                </div>
              ))}
            </div>

            {selectedCourse && (
              <div className="course-details">
                <h3>{selectedCourse.name}</h3>
                <div className="course-stats">
                  <div className="stat-row">
                    <span>Location:</span>
                    <span>{selectedCourse.location}</span>
                  </div>
                  <div className="stat-row">
                    <span>Level Required:</span>
                    <span>{selectedCourse.levelRequired}</span>
                  </div>
                  <div className="stat-row">
                    <span>Completion Bonus:</span>
                    <span>{selectedCourse.completionBonus} XP</span>
                  </div>
                  <div className="stat-row">
                    <span>Obstacles:</span>
                    <span>{selectedCourse.obstacles.length}</span>
                  </div>
                </div>

                <div className="course-obstacles">
                  <h4>Course Obstacles:</h4>
                  {selectedCourse.obstacles.map((obstacle, index) => (
                    <div key={obstacle.id} className="course-obstacle">
                      <span className="obstacle-number">{index + 1}.</span>
                      <span className="obstacle-icon">{getObstacleIcon(obstacle.type)}</span>
                      <span className="obstacle-name">{obstacle.name}</span>
                      <span className="obstacle-xp">({obstacle.experience} XP)</span>
                    </div>
                  ))}
                </div>

                <div className="course-description">
                  Complete all obstacles in sequence to earn the full course bonus. 
                  Total XP: {selectedCourse.obstacles.reduce((sum, o) => sum + o.experience, 0) + selectedCourse.completionBonus}
                </div>

                {canCompleteCourse(selectedCourse) ? (
                  <button className="start-course-btn">
                    Start Course
                  </button>
                ) : (
                  <div className="requirement-warning">
                    You need level {selectedCourse.levelRequired} Agility to attempt this course.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="agility-footer">
        <div className="current-level">
          Agility Level: {player.stats.agility} 
          ({player.experience.agility?.toLocaleString() || 0} XP)
        </div>
        <div className="agility-tip">
          💡 Tip: Higher Agility levels increase success rates and unlock new obstacles!
        </div>
      </div>
    </div>
  );
};
