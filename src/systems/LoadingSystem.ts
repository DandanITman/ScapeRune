import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface LoadingProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentItem: string;
  stage: string;
}

export interface AssetDefinition {
  id: string;
  type: 'texture' | 'model' | 'audio' | 'data';
  url: string;
  priority: 'high' | 'medium' | 'low';
  preload: boolean;
}

export class LoadingSystem {
  private loadingManager: THREE.LoadingManager;
  private textureLoader: THREE.TextureLoader;
  private gltfLoader: GLTFLoader;
  
  private assets: Map<string, any> = new Map();
  private assetDefinitions: AssetDefinition[] = [];
  private loadingProgress: LoadingProgress = {
    loaded: 0,
    total: 0,
    percentage: 0,
    currentItem: '',
    stage: 'Initializing'
  };
  
  private progressCallbacks: ((progress: LoadingProgress) => void)[] = [];
  private completionCallbacks: (() => void)[] = [];
  
  private isLoading = false;
  private hasLoaded = false;

  constructor() {
    this.setupLoadingManager();
    this.setupLoaders();
    this.initializeAssetDefinitions();
  }

  private setupLoadingManager() {
    this.loadingManager = new THREE.LoadingManager(
      // onLoad
      () => {
        this.hasLoaded = true;
        this.isLoading = false;
        this.updateProgress('Complete', '', 100);
        this.completionCallbacks.forEach(callback => callback());
      },
      // onProgress
      (url, loaded, total) => {
        this.updateProgress('Loading Assets', url, (loaded / total) * 100);
      },
      // onError
      (url) => {
        console.error(`Failed to load asset: ${url}`);
      }
    );
  }

  private setupLoaders() {
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);
  }

  private initializeAssetDefinitions() {
    this.assetDefinitions = [
      // Core UI Textures
      {
        id: 'ui_inventory_bg',
        type: 'texture',
        url: '/textures/ui/inventory_bg.png',
        priority: 'high',
        preload: true
      },
      {
        id: 'ui_button_normal',
        type: 'texture',
        url: '/textures/ui/button_normal.png',
        priority: 'high',
        preload: true
      },
      
      // Character Models
      {
        id: 'player_model',
        type: 'model',
        url: '/models/characters/player.glb',
        priority: 'high',
        preload: true
      },
      
      // Monster Models
      {
        id: 'rat_model',
        type: 'model',
        url: '/models/monsters/rat.glb',
        priority: 'medium',
        preload: true
      },
      {
        id: 'goblin_model',
        type: 'model',
        url: '/models/monsters/goblin.glb',
        priority: 'medium',
        preload: false
      },
      
      // Resource Models (existing)
      {
        id: 'ores_model',
        type: 'model',
        url: '/models/resources/ores.glb',
        priority: 'high',
        preload: true
      },
      {
        id: 'trees_model',
        type: 'model',
        url: '/models/resources/trees.glb',
        priority: 'high',
        preload: true
      },
      
      // Environment Textures
      {
        id: 'grass_texture',
        type: 'texture',
        url: '/textures/environment/grass.jpg',
        priority: 'high',
        preload: true
      },
      {
        id: 'stone_texture',
        type: 'texture',
        url: '/textures/environment/stone.jpg',
        priority: 'medium',
        preload: true
      },
      {
        id: 'water_texture',
        type: 'texture',
        url: '/textures/environment/water.jpg',
        priority: 'medium',
        preload: false
      },
      
      // Item Textures
      {
        id: 'items_spritesheet',
        type: 'texture',
        url: '/textures/items/items.png',
        priority: 'high',
        preload: true
      },
      
      // Audio Files (placeholders)
      {
        id: 'music_main_theme',
        type: 'audio',
        url: '/sounds/music/scape_main.ogg',
        priority: 'low',
        preload: false
      },
      {
        id: 'sound_ui_click',
        type: 'audio',
        url: '/sounds/ui/click.ogg',
        priority: 'medium',
        preload: false
      },
      
      // Game Data
      {
        id: 'item_definitions',
        type: 'data',
        url: '/data/items.json',
        priority: 'high',
        preload: true
      },
      {
        id: 'quest_data',
        type: 'data',
        url: '/data/quests.json',
        priority: 'medium',
        preload: false
      }
    ];
  }

  private updateProgress(stage: string, currentItem: string, percentage: number) {
    this.loadingProgress = {
      ...this.loadingProgress,
      stage,
      currentItem: currentItem.split('/').pop() || currentItem,
      percentage: Math.round(percentage)
    };
    
    this.progressCallbacks.forEach(callback => callback(this.loadingProgress));
  }

  // Public API
  async loadCriticalAssets(): Promise<void> {
    if (this.hasLoaded || this.isLoading) return;
    
    this.isLoading = true;
    this.updateProgress('Loading Critical Assets', '', 0);
    
    const criticalAssets = this.assetDefinitions.filter(asset => 
      asset.preload && asset.priority === 'high'
    );
    
    this.loadingProgress.total = criticalAssets.length;
    
    return new Promise((resolve, reject) => {
      let loadedCount = 0;
      
      const onAssetLoaded = () => {
        loadedCount++;
        this.loadingProgress.loaded = loadedCount;
        this.updateProgress(
          'Loading Critical Assets',
          '',
          (loadedCount / criticalAssets.length) * 100
        );
        
        if (loadedCount >= criticalAssets.length) {
          resolve();
        }
      };
      
      const onAssetError = (error: any) => {
        console.warn('Failed to load critical asset:', error);
        onAssetLoaded(); // Continue loading even if one asset fails
      };
      
      criticalAssets.forEach(asset => {
        this.loadAsset(asset)
          .then(onAssetLoaded)
          .catch(onAssetError);
      });
    });
  }

  async loadAllAssets(): Promise<void> {
    this.updateProgress('Loading All Assets', '', 0);
    
    const allAssets = this.assetDefinitions.filter(asset => asset.preload);
    this.loadingProgress.total = allAssets.length;
    
    return new Promise((resolve, reject) => {
      let loadedCount = 0;
      
      const onAssetLoaded = () => {
        loadedCount++;
        this.loadingProgress.loaded = loadedCount;
        this.updateProgress(
          'Loading All Assets',
          '',
          (loadedCount / allAssets.length) * 100
        );
        
        if (loadedCount >= allAssets.length) {
          resolve();
        }
      };
      
      const onAssetError = (error: any) => {
        console.warn('Failed to load asset:', error);
        onAssetLoaded();
      };
      
      allAssets.forEach(asset => {
        this.loadAsset(asset)
          .then(onAssetLoaded)
          .catch(onAssetError);
      });
    });
  }

  private async loadAsset(asset: AssetDefinition): Promise<any> {
    try {
      let loadedAsset: any;
      
      switch (asset.type) {
        case 'texture':
          loadedAsset = await this.loadTexture(asset.url);
          break;
        case 'model':
          loadedAsset = await this.loadModel(asset.url);
          break;
        case 'audio':
          loadedAsset = await this.loadAudio(asset.url);
          break;
        case 'data':
          loadedAsset = await this.loadData(asset.url);
          break;
        default:
          throw new Error(`Unknown asset type: ${asset.type}`);
      }
      
      this.assets.set(asset.id, loadedAsset);
      return loadedAsset;
    } catch (error) {
      console.warn(`Failed to load asset ${asset.id}:`, error);
      // Create placeholder assets for graceful fallback
      this.assets.set(asset.id, this.createPlaceholder(asset.type));
      throw error;
    }
  }

  private loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        resolve,
        undefined,
        () => {
          // Create a simple colored texture as fallback
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 64;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#8B4513'; // Brown color
          ctx.fillRect(0, 0, 64, 64);
          
          const texture = new THREE.CanvasTexture(canvas);
          resolve(texture);
        }
      );
    });
  }

  private loadModel(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => resolve(gltf.scene),
        undefined,
        () => {
          // Create a simple placeholder model
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshLambertMaterial({ color: 0x808080 });
          const mesh = new THREE.Mesh(geometry, material);
          const group = new THREE.Group();
          group.add(mesh);
          resolve(group);
        }
      );
    });
  }

  private loadAudio(url: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.addEventListener('canplaythrough', () => resolve(audio));
      audio.addEventListener('error', () => {
        // Create silent placeholder
        const silentAudio = new Audio();
        silentAudio.volume = 0;
        resolve(silentAudio);
      });
      audio.src = url;
    });
  }

  private loadData(url: string): Promise<any> {
    return fetch(url)
      .then(response => response.json())
      .catch(() => {
        // Return empty object as fallback
        return {};
      });
  }

  private createPlaceholder(type: string): any {
    switch (type) {
      case 'texture':
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#FF00FF'; // Magenta to indicate missing texture
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
      
      case 'model':
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({ color: 0xFF00FF });
        const mesh = new THREE.Mesh(geometry, material);
        const group = new THREE.Group();
        group.add(mesh);
        return group;
      
      case 'audio':
        const audio = new Audio();
        audio.volume = 0;
        return audio;
      
      case 'data':
        return {};
      
      default:
        return null;
    }
  }

  // Asset retrieval
  getAsset(id: string): any {
    return this.assets.get(id);
  }

  hasAsset(id: string): boolean {
    return this.assets.has(id);
  }

  // Lazy loading for non-critical assets
  async loadAssetById(id: string): Promise<any> {
    if (this.hasAsset(id)) {
      return this.getAsset(id);
    }
    
    const definition = this.assetDefinitions.find(asset => asset.id === id);
    if (!definition) {
      throw new Error(`Asset definition not found: ${id}`);
    }
    
    return this.loadAsset(definition);
  }

  // Progress tracking
  onProgress(callback: (progress: LoadingProgress) => void) {
    this.progressCallbacks.push(callback);
  }

  onComplete(callback: () => void) {
    this.completionCallbacks.push(callback);
  }

  getProgress(): LoadingProgress {
    return { ...this.loadingProgress };
  }

  isLoadingComplete(): boolean {
    return this.hasLoaded;
  }

  // Memory management
  disposeAsset(id: string) {
    const asset = this.assets.get(id);
    if (asset) {
      if (asset instanceof THREE.Texture) {
        asset.dispose();
      } else if (asset instanceof THREE.Object3D) {
        asset.traverse((child: any) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
      this.assets.delete(id);
    }
  }

  disposeAll() {
    this.assets.forEach((asset, id) => {
      this.disposeAsset(id);
    });
    this.assets.clear();
  }

  // Cache management
  getCacheSize(): number {
    return this.assets.size;
  }

  getCachedAssets(): string[] {
    return Array.from(this.assets.keys());
  }

  // Preload specific asset categories
  async preloadCategory(category: 'ui' | 'models' | 'textures' | 'audio'): Promise<void> {
    const categoryAssets = this.assetDefinitions.filter(asset => {
      return asset.id.startsWith(category) || asset.type === category.slice(0, -1);
    });
    
    return Promise.all(
      categoryAssets.map(asset => this.loadAsset(asset))
    ).then(() => {});
  }
}
