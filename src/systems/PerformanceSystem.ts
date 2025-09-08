import * as THREE from 'three';

export interface PerformanceSettings {
  enableLOD: boolean; // Level of Detail
  enableFrustumCulling: boolean;
  enableOcclusionCulling: boolean;
  maxDrawCalls: number;
  targetFPS: number;
  enableObjectPooling: boolean;
}

export interface PerformanceStats {
  fps: number;
  frameTime: number;
  memoryUsage: {
    geometries: number;
    textures: number;
    programs: number;
  };
  renderStats: {
    calls: number;
    triangles: number;
    points: number;
    lines: number;
  };
}

export class PerformanceSystem {
  private settings: PerformanceSettings;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  
  // Performance monitoring
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private frameTime = 0;
  
  // Object management
  private objectPool: Map<string, THREE.Object3D[]> = new Map();
  private activeObjects: Set<THREE.Object3D> = new Set();
  private lodGroups: THREE.LOD[] = [];
  
  // Culling
  private frustum = new THREE.Frustum();
  private cameraMatrix = new THREE.Matrix4();

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    this.settings = {
      enableLOD: true,
      enableFrustumCulling: true,
      enableOcclusionCulling: false, // More complex to implement
      maxDrawCalls: 1000,
      targetFPS: 60,
      enableObjectPooling: true
    };

    this.initializePerformanceOptimizations();
  }

  private initializePerformanceOptimizations() {
    // Setup renderer optimizations
    this.optimizeRenderer();
    
    // Setup object pooling
    this.initializeObjectPools();
    
    // Setup performance monitoring
    this.startPerformanceMonitoring();
  }

  private optimizeRenderer() {
    // Enable efficient rendering options
    this.renderer.sortObjects = true;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Optimize render state changes
    this.renderer.state.buffers.stencil.setTest(false);
  }

  private initializeObjectPools() {
    // Create pools for commonly used objects
    const poolTypes = ['tree', 'rock', 'monster', 'item', 'particle'];
    
    poolTypes.forEach(type => {
      this.objectPool.set(type, []);
    });
  }

  private startPerformanceMonitoring() {
    const monitor = () => {
      const now = performance.now();
      this.frameCount++;
      
      if (now - this.lastTime >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastTime = now;
      }
      
      requestAnimationFrame(monitor);
    };
    
    monitor();
  }

  // Level of Detail (LOD) system
  createLODObject(
    highDetail: THREE.Object3D,
    mediumDetail: THREE.Object3D,
    lowDetail: THREE.Object3D,
    distances: [number, number] = [50, 100]
  ): THREE.LOD {
    const lod = new THREE.LOD();
    
    lod.addLevel(highDetail, 0);
    lod.addLevel(mediumDetail, distances[0]);
    lod.addLevel(lowDetail, distances[1]);
    
    this.lodGroups.push(lod);
    return lod;
  }

  // Object pooling
  getPooledObject(type: string): THREE.Object3D | null {
    if (!this.settings.enableObjectPooling) return null;
    
    const pool = this.objectPool.get(type);
    if (pool && pool.length > 0) {
      return pool.pop() || null;
    }
    
    return null;
  }

  returnToPool(type: string, object: THREE.Object3D) {
    if (!this.settings.enableObjectPooling) return;
    
    // Reset object state
    object.position.set(0, 0, 0);
    object.rotation.set(0, 0, 0);
    object.scale.set(1, 1, 1);
    object.visible = true;
    
    // Remove from scene
    if (object.parent) {
      object.parent.remove(object);
    }
    
    const pool = this.objectPool.get(type);
    if (pool) {
      pool.push(object);
    }
  }

  // Frustum culling
  performFrustumCulling() {
    if (!this.settings.enableFrustumCulling) return;
    
    this.cameraMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.cameraMatrix);
    
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const wasVisible = object.visible;
        object.visible = this.frustum.intersectsObject(object);
        
        // Track visibility changes for statistics
        if (wasVisible !== object.visible) {
          if (object.visible) {
            this.activeObjects.add(object);
          } else {
            this.activeObjects.delete(object);
          }
        }
      }
    });
  }

  // Dynamic quality adjustment based on performance
  adjustQualityBasedOnPerformance() {
    if (this.fps < this.settings.targetFPS * 0.8) {
      // Performance is low, reduce quality
      this.reduceQuality();
    } else if (this.fps > this.settings.targetFPS * 1.1) {
      // Performance is good, can increase quality
      this.increaseQuality();
    }
  }

  private reduceQuality() {
    // Reduce shadow map resolution
    this.scene.traverse((object) => {
      if (object instanceof THREE.DirectionalLight) {
        if (object.shadow.mapSize.width > 512) {
          object.shadow.mapSize.multiplyScalar(0.5);
        }
      }
    });
    
    // Reduce LOD distances
    this.lodGroups.forEach(lod => {
      const levels = lod.levels;
      levels.forEach((level, index) => {
        if (index > 0) {
          level.distance = Math.max(level.distance * 0.8, 10);
        }
      });
    });
  }

  private increaseQuality() {
    // Increase shadow map resolution (up to a limit)
    this.scene.traverse((object) => {
      if (object instanceof THREE.DirectionalLight) {
        if (object.shadow.mapSize.width < 2048) {
          object.shadow.mapSize.multiplyScalar(1.25);
        }
      }
    });
    
    // Increase LOD distances
    this.lodGroups.forEach(lod => {
      const levels = lod.levels;
      levels.forEach((level, index) => {
        if (index > 0) {
          level.distance = Math.min(level.distance * 1.2, 200);
        }
      });
    });
  }

  // Batch geometry for better performance
  batchGeometry(objects: THREE.Mesh[]): THREE.InstancedMesh | null {
    if (objects.length === 0) return null;
    
    const referenceGeometry = objects[0].geometry;
    const referenceMaterial = objects[0].material;
    
    // Check if all objects use the same geometry and material
    const canBatch = objects.every(obj => 
      obj.geometry === referenceGeometry && 
      obj.material === referenceMaterial
    );
    
    if (!canBatch) return null;
    
    const instancedMesh = new THREE.InstancedMesh(
      referenceGeometry,
      referenceMaterial,
      objects.length
    );
    
    const matrix = new THREE.Matrix4();
    objects.forEach((obj, index) => {
      obj.updateMatrixWorld();
      matrix.copy(obj.matrixWorld);
      instancedMesh.setMatrixAt(index, matrix);
    });
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    return instancedMesh;
  }

  // Update LOD objects based on camera distance
  updateLOD() {
    if (!this.settings.enableLOD) return;
    
    this.lodGroups.forEach(lod => {
      lod.update(this.camera);
    });
  }

  // Main update method to call each frame
  update() {
    this.updateLOD();
    this.performFrustumCulling();
    this.adjustQualityBasedOnPerformance();
  }

  // Get current performance statistics
  getPerformanceStats(): PerformanceStats {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      memoryUsage: {
        geometries: this.renderer.info.memory.geometries,
        textures: this.renderer.info.memory.textures,
        programs: this.renderer.info.programs?.length || 0
      },
      renderStats: {
        calls: this.renderer.info.render.calls,
        triangles: this.renderer.info.render.triangles,
        points: this.renderer.info.render.points,
        lines: this.renderer.info.render.lines
      }
    };
  }

  // Update settings
  updateSettings(newSettings: Partial<PerformanceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): PerformanceSettings {
    return { ...this.settings };
  }

  // Cleanup methods
  disposeUnusedResources() {
    // Clean up unused textures
    const usedTextures = new Set<THREE.Texture>();
    
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const material = object.material;
        if (Array.isArray(material)) {
          material.forEach(mat => this.collectTextures(mat, usedTextures));
        } else {
          this.collectTextures(material, usedTextures);
        }
      }
    });
    
    // Dispose unused resources
    this.renderer.info.memory.textures = usedTextures.size;
  }

  private collectTextures(material: THREE.Material, textures: Set<THREE.Texture>) {
    if (material instanceof THREE.MeshLambertMaterial || 
        material instanceof THREE.MeshPhongMaterial ||
        material instanceof THREE.MeshStandardMaterial) {
      if (material.map) textures.add(material.map);
      if (material.normalMap) textures.add(material.normalMap);
      // Only check for these properties on materials that support them
      if (material instanceof THREE.MeshStandardMaterial) {
        if (material.roughnessMap) textures.add(material.roughnessMap);
        if (material.metalnessMap) textures.add(material.metalnessMap);
      }
    }
  }

  // Object management helpers
  optimizeObjectForPerformance(object: THREE.Object3D) {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enable frustum culling
        child.frustumCulled = this.settings.enableFrustumCulling;
        
        // Optimize geometry
        if (child.geometry) {
          child.geometry.computeBoundingSphere();
          child.geometry.computeBoundingBox();
        }
        
        // Set up for batching if applicable
        child.userData.canBatch = true;
      }
    });
  }

  // Debug information
  getDebugInfo() {
    return {
      settings: this.settings,
      stats: this.getPerformanceStats(),
      activeObjects: this.activeObjects.size,
      lodGroups: this.lodGroups.length,
      poolSizes: Array.from(this.objectPool.entries()).map(([type, pool]) => ({
        type,
        available: pool.length
      }))
    };
  }
}
