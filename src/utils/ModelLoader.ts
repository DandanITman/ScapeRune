import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface ModelLoadOptions {
  scale?: number;
  rotation?: THREE.Euler;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export class ModelLoader {
  private loader: GLTFLoader;
  private loadedModels: Map<string, THREE.Group> = new Map();

  constructor() {
    this.loader = new GLTFLoader();
  }

  /**
   * Load a GLTF/GLB model from the specified path
   * @param path - Path to the model file (relative to public folder)
   * @param options - Options for scaling, rotation, shadows, etc.
   * @returns Promise that resolves to a THREE.Group containing the loaded model
   */
  async loadModel(path: string, options: ModelLoadOptions = {}): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      // Check if model is already loaded
      if (this.loadedModels.has(path)) {
        const cachedModel = this.loadedModels.get(path)!;
        const clonedModel = this.cloneModel(cachedModel, options);
        resolve(clonedModel);
        return;
      }

      this.loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          
          // Store original model in cache
          this.loadedModels.set(path, model);
          
          // Create a clone with applied options
          const clonedModel = this.cloneModel(model, options);
          resolve(clonedModel);
        },
        (progress) => {
          console.log(`Loading model ${path}: ${(progress.loaded / progress.total * 100)}% loaded`);
        },
        (error) => {
          console.error(`Error loading model ${path}:`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Load a monster model specifically
   * @param monsterName - Name of the monster (e.g., 'rat', 'goblin')
   * @param options - Model loading options
   * @returns Promise that resolves to the loaded monster model
   */
  async loadMonsterModel(monsterName: string, options: ModelLoadOptions = {}): Promise<THREE.Group> {
    const modelPath = `/models/monsters/${monsterName.toLowerCase()}.glb`;
    
    // Set default options for monsters
    const defaultOptions: ModelLoadOptions = {
      scale: 1,
      castShadow: true,
      receiveShadow: false,
      ...options
    };

    return this.loadModel(modelPath, defaultOptions);
  }

  /**
   * Clone a model and apply options
   * @param originalModel - The original model to clone
   * @param options - Options to apply to the clone
   * @returns Cloned and configured model
   */
  private cloneModel(originalModel: THREE.Group, options: ModelLoadOptions): THREE.Group {
    const clone = originalModel.clone();
    
    // Apply scale
    if (options.scale !== undefined) {
      clone.scale.setScalar(options.scale);
    }
    
    // Apply rotation
    if (options.rotation) {
      clone.rotation.copy(options.rotation);
    }
    
    // Apply shadow settings
    if (options.castShadow !== undefined || options.receiveShadow !== undefined) {
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (options.castShadow !== undefined) {
            child.castShadow = options.castShadow;
          }
          if (options.receiveShadow !== undefined) {
            child.receiveShadow = options.receiveShadow;
          }
        }
      });
    }
    
    return clone;
  }

  /**
   * Check if a model file exists for a given monster
   * @param monsterName - Name of the monster
   * @returns Whether a custom model exists for this monster
   */
  hasCustomModel(monsterName: string): boolean {
    // For now, we'll check our known custom models
    // In a more robust system, this could make an actual file check
    const customModels = ['rat']; // Add more as they become available
    return customModels.includes(monsterName.toLowerCase());
  }

  /**
   * Get the default fallback geometry for a monster when no custom model is available
   * @param monsterName - Name of the monster
   * @returns Default THREE.Geometry for the monster
   */
  getDefaultMonsterGeometry(monsterName: string): THREE.BufferGeometry {
    switch (monsterName.toLowerCase()) {
      case 'rat':
        // Smaller, more rat-like proportions
        return new THREE.CylinderGeometry(0.2, 0.3, 0.8);
      case 'goblin':
        // Medium size, humanoid
        return new THREE.CylinderGeometry(0.3, 0.3, 1.2);
      case 'cow':
        // Larger, wider body
        return new THREE.BoxGeometry(1.2, 0.8, 0.6);
      case 'chicken':
        // Small, compact
        return new THREE.CylinderGeometry(0.2, 0.25, 0.6);
      default:
        // Generic humanoid
        return new THREE.CylinderGeometry(0.3, 0.3, 1.2);
    }
  }

  /**
   * Clear the model cache
   */
  clearCache(): void {
    this.loadedModels.clear();
  }
}

export default ModelLoader;
