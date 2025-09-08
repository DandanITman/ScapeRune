import * as THREE from 'three';
import type { Scene } from 'three';

export interface AgilityObstacle {
  id: string;
  name: string;
  type: 'log' | 'rope' | 'wall' | 'gap' | 'pipe' | 'ledge';
  levelRequired: number;
  experience: number;
  successRate: number; // Base success rate (0-1)
  failDamage: number; // Damage taken on failure
  position: THREE.Vector3;
  mesh?: THREE.Object3D;
}

export interface AgilityCourse {
  id: string;
  name: string;
  location: string;
  obstacles: AgilityObstacle[];
  completionBonus: number; // Bonus XP for completing full course
  levelRequired: number;
}

export interface AgilityResult {
  success: boolean;
  experience: number;
  damage?: number;
  message: string;
  leveledUp?: boolean;
  newLevel?: number;
}

export class AgilitySystem {
  private scene: Scene;
  private obstacles: Map<string, AgilityObstacle> = new Map();
  private courses: Map<string, AgilityCourse> = new Map();
  private playerProgress: Map<string, number> = new Map(); // Course progress tracking

  constructor(scene: Scene) {
    this.scene = scene;
    this.initializeObstacles();
    this.initializeCourses();
  }

  /**
   * Initialize agility obstacles with authentic RSC data
   */
  private initializeObstacles(): void {
    const obstacleData: AgilityObstacle[] = [
      // Lumbridge Agility Course (Low level)
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
      },
      {
        id: 'lumbridge_gap',
        name: 'Gap Jump',
        type: 'gap',
        levelRequired: 8,
        experience: 15,
        successRate: 0.8,
        failDamage: 5,
        position: new THREE.Vector3(3, 0, 18)
      },
      {
        id: 'lumbridge_pipe',
        name: 'Pipe Crawl',
        type: 'pipe',
        levelRequired: 10,
        experience: 17.5,
        successRate: 0.9,
        failDamage: 2,
        position: new THREE.Vector3(5, 0, 15)
      },

      // Draynor Agility Course (Medium level)
      {
        id: 'draynor_rooftop',
        name: 'Rooftop Jump',
        type: 'gap',
        levelRequired: 20,
        experience: 25,
        successRate: 0.75,
        failDamage: 8,
        position: new THREE.Vector3(20, 3, 20)
      },
      {
        id: 'draynor_ledge',
        name: 'Narrow Ledge',
        type: 'ledge',
        levelRequired: 25,
        experience: 30,
        successRate: 0.7,
        failDamage: 10,
        position: new THREE.Vector3(23, 3, 18)
      }
    ];

    obstacleData.forEach(obstacle => {
      this.obstacles.set(obstacle.id, obstacle);
      this.createObstacleMesh(obstacle);
    });
  }

  /**
   * Initialize agility courses
   */
  private initializeCourses(): void {
    const courseData: AgilityCourse[] = [
      {
        id: 'lumbridge_course',
        name: 'Lumbridge Agility Course',
        location: 'lumbridge',
        levelRequired: 1,
        completionBonus: 50,
        obstacles: [
          this.obstacles.get('lumbridge_log')!,
          this.obstacles.get('lumbridge_rope')!,
          this.obstacles.get('lumbridge_wall')!,
          this.obstacles.get('lumbridge_gap')!,
          this.obstacles.get('lumbridge_pipe')!
        ]
      },
      {
        id: 'draynor_course',
        name: 'Draynor Rooftop Course',
        location: 'draynor',
        levelRequired: 20,
        completionBonus: 100,
        obstacles: [
          this.obstacles.get('draynor_rooftop')!,
          this.obstacles.get('draynor_ledge')!
        ]
      }
    ];

    courseData.forEach(course => {
      this.courses.set(course.id, course);
    });
  }

  /**
   * Create 3D mesh for agility obstacle
   */
  private createObstacleMesh(obstacle: AgilityObstacle): void {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (obstacle.type) {
      case 'log':
        geometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 8);
        material = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        break;
      case 'rope':
        geometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
        material = new THREE.MeshLambertMaterial({ color: 0xD2691E }); // Rope color
        break;
      case 'wall':
        geometry = new THREE.BoxGeometry(5, 2, 0.5);
        material = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray stone
        break;
      case 'gap': {
        // Create a visual indicator for the gap (two platforms)
        const group = new THREE.Group();
        const platform1 = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.2, 2),
          new THREE.MeshLambertMaterial({ color: 0x654321 })
        );
        const platform2 = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.2, 2),
          new THREE.MeshLambertMaterial({ color: 0x654321 })
        );
        platform1.position.set(-2, 0, 0);
        platform2.position.set(2, 0, 0);
        group.add(platform1);
        group.add(platform2);
        obstacle.mesh = group;
        group.position.copy(obstacle.position);
        group.userData = { type: 'agility_obstacle', obstacleId: obstacle.id, name: obstacle.name };
        this.scene.add(group);
        return;
      }
      case 'pipe':
        geometry = new THREE.CylinderGeometry(0.8, 0.8, 4, 8);
        material = new THREE.MeshLambertMaterial({ color: 0x696969 }); // Dark gray
        break;
      case 'ledge':
        geometry = new THREE.BoxGeometry(6, 0.3, 1);
        material = new THREE.MeshLambertMaterial({ color: 0x8B7355 }); // Ledge color
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshLambertMaterial({ color: 0xFF0000 }); // Red fallback
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(obstacle.position);
    mesh.userData = { type: 'agility_obstacle', obstacleId: obstacle.id, name: obstacle.name };
    
    // Rotate log to lie horizontally
    if (obstacle.type === 'log') {
      mesh.rotation.z = Math.PI / 2;
    }
    
    obstacle.mesh = mesh;
    this.scene.add(mesh);
  }

  /**
   * Attempt to use an agility obstacle
   */
  public useObstacle(
    obstacleId: string, 
    playerLevel: number, 
    addExperience: (skill: string, xp: number) => { newLevel?: number }
  ): AgilityResult {
    const obstacle = this.obstacles.get(obstacleId);
    if (!obstacle) {
      return {
        success: false,
        experience: 0,
        message: 'Unknown obstacle.'
      };
    }

    // Check level requirement
    if (playerLevel < obstacle.levelRequired) {
      return {
        success: false,
        experience: 0,
        message: `You need level ${obstacle.levelRequired} Agility to use this obstacle.`
      };
    }

    // Calculate success rate based on level
    const levelBonus = Math.min((playerLevel - obstacle.levelRequired) * 0.02, 0.15);
    const actualSuccessRate = Math.min(obstacle.successRate + levelBonus, 0.99);
    const success = Math.random() < actualSuccessRate;

    if (success) {
      // Successful attempt
      const result = addExperience('agility', obstacle.experience);
      
      return {
        success: true,
        experience: obstacle.experience,
        message: `You successfully navigate the ${obstacle.name.toLowerCase()}.`,
        leveledUp: !!result.newLevel,
        newLevel: result.newLevel
      };
    } else {
      // Failed attempt
      return {
        success: false,
        experience: 0,
        damage: obstacle.failDamage,
        message: `You fail to navigate the ${obstacle.name.toLowerCase()} and take ${obstacle.failDamage} damage.`
      };
    }
  }

  /**
   * Check if player can complete a course
   */
  public canCompleteCourse(courseId: string, playerLevel: number): boolean {
    const course = this.courses.get(courseId);
    if (!course) return false;
    
    return playerLevel >= course.levelRequired;
  }

  /**
   * Get course progress for a player
   */
  public getCourseProgress(courseId: string): number {
    return this.playerProgress.get(courseId) || 0;
  }

  /**
   * Update course progress
   */
  public updateCourseProgress(courseId: string, obstacleIndex: number): void {
    this.playerProgress.set(courseId, obstacleIndex);
  }

  /**
   * Complete a course and get bonus XP
   */
  public completeCourse(
    courseId: string,
    addExperience: (skill: string, xp: number) => { newLevel?: number }
  ): AgilityResult | null {
    const course = this.courses.get(courseId);
    if (!course) return null;

    // Reset course progress
    this.playerProgress.delete(courseId);

    // Award bonus experience
    const result = addExperience('agility', course.completionBonus);

    return {
      success: true,
      experience: course.completionBonus,
      message: `Congratulations! You have completed the ${course.name} and received ${course.completionBonus} bonus experience!`,
      leveledUp: !!result.newLevel,
      newLevel: result.newLevel
    };
  }

  /**
   * Get all obstacles
   */
  public getObstacles(): Map<string, AgilityObstacle> {
    return this.obstacles;
  }

  /**
   * Get all courses
   */
  public getCourses(): Map<string, AgilityCourse> {
    return this.courses;
  }

  /**
   * Get obstacle by ID
   */
  public getObstacle(obstacleId: string): AgilityObstacle | undefined {
    return this.obstacles.get(obstacleId);
  }

  /**
   * Get course by ID
   */
  public getCourse(courseId: string): AgilityCourse | undefined {
    return this.courses.get(courseId);
  }

  /**
   * Load agility obstacles for a specific location
   */
  public loadObstaclesForLocation(location: string): void {
    // Filter and show obstacles for specific location
    this.obstacles.forEach(obstacle => {
      if (obstacle.mesh) {
        if (location === 'lumbridge' && obstacle.id.startsWith('lumbridge_')) {
          obstacle.mesh.visible = true;
        } else if (location === 'draynor' && obstacle.id.startsWith('draynor_')) {
          obstacle.mesh.visible = true;
        } else {
          obstacle.mesh.visible = false;
        }
      }
    });
  }

  /**
   * Clear all obstacles from scene
   */
  public clearObstacles(): void {
    this.obstacles.forEach(obstacle => {
      if (obstacle.mesh && obstacle.mesh.parent) {
        this.scene.remove(obstacle.mesh);
      }
    });
  }
}
