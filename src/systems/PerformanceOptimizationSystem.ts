import * as THREE from 'three';

export interface PerformanceSettings {
  targetFPS: number;
  maxFrameTime: number; // milliseconds
  enableLOD: boolean;
  enableFrustumCulling: boolean;
  enableOcclusion: boolean;
  batchRendering: boolean;
  instancedRendering: boolean;
  memoryOptimization: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  triangles: number;
  drawCalls: number;
  memoryUsage: number;
  cpuUsage: number;
  gpuUsage: number;
}

export class PerformanceOptimizationSystem {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private settings: PerformanceSettings;
  private metrics: PerformanceMetrics;
  private frameTimeHistory: number[] = [];
  private lastFrameTime: number = 0;
  private instancedMeshes: Map<string, THREE.InstancedMesh> = new Map();
  private batchedGeometries: Map<string, THREE.BufferGeometry> = new Map();
  private culledObjects: Set<THREE.Object3D> = new Set();
  private memoryMonitor: number | null = null;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    
    this.settings = {
      targetFPS: 60,
      maxFrameTime: 16.67, // 60fps = 16.67ms per frame
      enableLOD: true,
      enableFrustumCulling: true,
      enableOcclusion: false,
      batchRendering: true,
      instancedRendering: true,
      memoryOptimization: true
    };

    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      triangles: 0,
      drawCalls: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      gpuUsage: 0
    };

    this.initializeOptimizations();
    this.startPerformanceMonitoring();
  }

  private initializeOptimizations(): void {
    // Enable renderer optimizations
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.sortObjects = true;
    this.renderer.autoClear = true;
    
    // Enable frustum culling
    if (this.settings.enableFrustumCulling) {
      this.enableFrustumCulling();
    }
    
    // Setup instanced rendering for common objects
    if (this.settings.instancedRendering) {
      this.setupInstancedRendering();
    }
    
    // Setup batched rendering
    if (this.settings.batchRendering) {
      this.setupBatchedRendering();
    }
    
    // Initialize memory optimization
    if (this.settings.memoryOptimization) {
      this.initializeMemoryOptimization();
    }
  }

  private enableFrustumCulling(): void {
    // Custom frustum culling implementation
    const frustum = new THREE.Frustum();
    const cameraMatrix = new THREE.Matrix4();

    const originalRender = this.renderer.render.bind(this.renderer);
    this.renderer.render = (scene: THREE.Scene, camera: THREE.Camera) => {
      // Update frustum
      cameraMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(cameraMatrix);

      // Cull objects outside frustum
      this.cullObjectsOutsideFrustum(scene, frustum);
      
      // Render normally
      originalRender(scene, camera);
      
      // Restore culled objects
      this.restoreCulledObjects();
    };
  }

  private cullObjectsOutsideFrustum(object: THREE.Object3D, frustum: THREE.Frustum): void {
    if (!object.visible) return;
    
    if (object instanceof THREE.Mesh) {
      // Check if object is in frustum
      object.geometry.computeBoundingSphere();
      if (object.geometry.boundingSphere) {
        const sphere = object.geometry.boundingSphere.clone();
        sphere.applyMatrix4(object.matrixWorld);
        
        if (!frustum.intersectsSphere(sphere)) {
          this.culledObjects.add(object);
          object.visible = false;
        }
      }
    }
    
    // Recursively check children
    object.children.forEach(child => this.cullObjectsOutsideFrustum(child, frustum));
  }

  private restoreCulledObjects(): void {
    this.culledObjects.forEach(object => {
      object.visible = true;
    });
    this.culledObjects.clear();
  }

  private setupInstancedRendering(): void {
    // Setup instanced rendering for common objects like trees, rocks, etc.
    this.createInstancedMesh('tree', 100);
    this.createInstancedMesh('rock', 50);
    this.createInstancedMesh('grass', 200);
  }

  private createInstancedMesh(type: string, count: number): void {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    
    switch (type) {
      case 'tree':
        geometry = new THREE.CylinderGeometry(0.5, 1, 4, 8);
        material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        break;
      case 'rock':
        geometry = new THREE.SphereGeometry(0.8, 8, 6);
        material = new THREE.MeshLambertMaterial({ color: 0x696969 });
        break;
      case 'grass':
        geometry = new THREE.PlaneGeometry(0.5, 1);
        material = new THREE.MeshLambertMaterial({ color: 0x228B22, transparent: true });
        break;
      default:
        return;
    }
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    
    this.instancedMeshes.set(type, instancedMesh);
    this.scene.add(instancedMesh);
  }

  private setupBatchedRendering(): void {
    // Batch similar geometries together
    this.batchSimilarMeshes();
  }

  private batchSimilarMeshes(): void {
    const meshGroups: Map<string, THREE.Mesh[]> = new Map();
    
    // Group meshes by material and geometry type
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const key = this.getMeshBatchKey(object);
        if (!meshGroups.has(key)) {
          meshGroups.set(key, []);
        }
        meshGroups.get(key)!.push(object);
      }
    });
    
    // Create batched geometries for groups with multiple meshes
    meshGroups.forEach((meshes, key) => {
      if (meshes.length > 1) {
        this.createBatchedGeometry(key, meshes);
      }
    });
  }

  private getMeshBatchKey(mesh: THREE.Mesh): string {
    const geometryType = mesh.geometry.constructor.name;
    const materialType = mesh.material instanceof THREE.Material 
      ? mesh.material.constructor.name 
      : 'multi';
    return `${geometryType}_${materialType}`;
  }

  private createBatchedGeometry(key: string, meshes: THREE.Mesh[]): void {
    if (meshes.length === 0) return;
    
    const firstMesh = meshes[0];
    const batchedGeometry = new THREE.BufferGeometry();
    
    // Merge geometries
    const geometries: THREE.BufferGeometry[] = [];
    meshes.forEach(mesh => {
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      geometries.push(geometry);
    });
    
    // Use BufferGeometryUtils.mergeBufferGeometries if available
    // For now, we'll use a simplified approach
    batchedGeometry.copy(firstMesh.geometry);
    
    this.batchedGeometries.set(key, batchedGeometry);
    
    // Create batched mesh
    const batchedMesh = new THREE.Mesh(batchedGeometry, firstMesh.material);
    this.scene.add(batchedMesh);
    
    // Remove original meshes
    meshes.forEach(mesh => {
      this.scene.remove(mesh);
    });
  }

  private initializeMemoryOptimization(): void {
    // Monitor memory usage
    this.startMemoryMonitoring();
    
    // Setup automatic garbage collection hints
    this.setupAutomaticCleanup();
  }

  private startMemoryMonitoring(): void {
    this.memoryMonitor = setInterval(() => {
      this.updateMemoryMetrics();
      
      // Trigger cleanup if memory usage is high
      if (this.metrics.memoryUsage > 500) { // 500MB threshold
        this.performMemoryCleanup();
      }
    }, 5000); // Check every 5 seconds
  }

  private updateMemoryMetrics(): void {
    // Get memory info if available
    if ('memory' in performance) {
      const memory = (performance as typeof performance & { memory?: { usedJSHeapSize: number } }).memory;
      if (memory) {
        this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      }
    }
    
    // Update renderer info
    this.metrics.triangles = this.renderer.info.render.triangles;
    this.metrics.drawCalls = this.renderer.info.render.calls;
  }

  private performMemoryCleanup(): void {
    // Dispose unused geometries and materials
    this.disposeUnusedResources();
    
    // Clear texture cache
    this.clearTextureCache();
    
    // Force garbage collection hint
    if ('gc' in window && typeof (window as typeof window & { gc?: () => void }).gc === 'function') {
      (window as typeof window & { gc: () => void }).gc();
    }
  }

  private disposeUnusedResources(): void {
    const usedGeometries = new Set<THREE.BufferGeometry>();
    const usedMaterials = new Set<THREE.Material>();
    
    // Collect used resources
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        usedGeometries.add(object.geometry);
        if (object.material instanceof THREE.Material) {
          usedMaterials.add(object.material);
        } else if (Array.isArray(object.material)) {
          object.material.forEach(mat => usedMaterials.add(mat));
        }
      }
    });
    
    // Dispose unused resources (this would require tracking all created resources)
    console.log(`Memory cleanup: ${usedGeometries.size} geometries, ${usedMaterials.size} materials in use`);
  }

  private clearTextureCache(): void {
    // Clear Three.js texture cache
    THREE.Cache.clear();
  }

  private setupAutomaticCleanup(): void {
    // Cleanup on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.performMemoryCleanup();
      }
    });
  }

  private startPerformanceMonitoring(): void {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const monitor = () => {
      const currentTime = performance.now();
      frameCount++;
      
      // Calculate frame time
      const frameTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;
      
      // Update frame time history
      this.frameTimeHistory.push(frameTime);
      if (this.frameTimeHistory.length > 60) { // Keep last 60 frames
        this.frameTimeHistory.shift();
      }
      
      // Calculate FPS every second
      if (currentTime - lastTime >= 1000) {
        this.metrics.fps = frameCount;
        this.metrics.frameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
        
        frameCount = 0;
        lastTime = currentTime;
        
        // Auto-adjust quality based on performance
        this.autoAdjustQuality();
      }
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }

  private autoAdjustQuality(): void {
    const targetFPS = this.settings.targetFPS;
    const currentFPS = this.metrics.fps;
    
    // If FPS is significantly below target, reduce quality
    if (currentFPS < targetFPS * 0.8) {
      this.reduceQuality();
    }
    // If FPS is stable above target, potentially increase quality
    else if (currentFPS > targetFPS * 1.1) {
      this.increaseQuality();
    }
  }

  private reduceQuality(): void {
    console.log('Reducing quality to improve performance');
    
    // Reduce shadow map size
    this.scene.traverse((child) => {
      if (child instanceof THREE.Light && child.shadow) {
        const currentSize = child.shadow.mapSize.width;
        if (currentSize > 256) {
          child.shadow.mapSize.setScalar(currentSize / 2);
          child.shadow.needsUpdate = true;
        }
      }
    });
    
    // Reduce render distance
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.far = Math.max(50, this.camera.far * 0.8);
      this.camera.updateProjectionMatrix();
    }
  }

  private increaseQuality(): void {
    console.log('Increasing quality due to good performance');
    
    // Increase shadow map size (with limits)
    this.scene.traverse((child) => {
      if (child instanceof THREE.Light && child.shadow) {
        const currentSize = child.shadow.mapSize.width;
        if (currentSize < 2048) {
          child.shadow.mapSize.setScalar(currentSize * 2);
          child.shadow.needsUpdate = true;
        }
      }
    });
  }

  public updateSettings(newSettings: Partial<PerformanceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.applySettings();
  }

  private applySettings(): void {
    // Apply performance settings
    if (this.settings.enableLOD) {
      this.enableLODSystem();
    }
    
    // Update target FPS
    if (this.settings.targetFPS !== 60) {
      console.log(`Target FPS set to: ${this.settings.targetFPS}`);
    }
  }

  private enableLODSystem(): void {
    // Enable LOD for suitable objects
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && !object.userData.hasLOD) {
        this.addLODToObject(object);
      }
    });
  }

  private addLODToObject(mesh: THREE.Mesh): void {
    const lod = new THREE.LOD();
    
    // High detail (close)
    lod.addLevel(mesh.clone(), 0);
    
    // Medium detail (medium distance)
    const mediumDetail = mesh.clone();
    if (mediumDetail.geometry instanceof THREE.BufferGeometry) {
      // Reduce geometry complexity (simplified)
      mediumDetail.geometry = mediumDetail.geometry.clone();
    }
    lod.addLevel(mediumDetail, 20);
    
    // Low detail (far)
    const lowDetail = mesh.clone();
    if (lowDetail.material instanceof THREE.MeshLambertMaterial) {
      const clonedMaterial = lowDetail.material.clone() as THREE.MeshLambertMaterial;
      clonedMaterial.wireframe = false;
      lowDetail.material = clonedMaterial;
    } else if (lowDetail.material instanceof THREE.MeshPhongMaterial) {
      const clonedMaterial = lowDetail.material.clone() as THREE.MeshPhongMaterial;
      clonedMaterial.wireframe = false;
      lowDetail.material = clonedMaterial;
    } else if (lowDetail.material instanceof THREE.MeshBasicMaterial) {
      const clonedMaterial = lowDetail.material.clone() as THREE.MeshBasicMaterial;
      clonedMaterial.wireframe = false;
      lowDetail.material = clonedMaterial;
    }
    lod.addLevel(lowDetail, 50);
    
    // Replace original mesh with LOD
    const parent = mesh.parent;
    if (parent) {
      parent.remove(mesh);
      parent.add(lod);
      lod.userData.hasLOD = true;
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getSettings(): PerformanceSettings {
    return { ...this.settings };
  }

  public isPerformingWell(): boolean {
    return this.metrics.fps >= this.settings.targetFPS * 0.9;
  }

  public getPerformanceReport(): string {
    return `
Performance Report:
- FPS: ${this.metrics.fps.toFixed(1)}/${this.settings.targetFPS}
- Frame Time: ${this.metrics.frameTime.toFixed(2)}ms
- Triangles: ${this.metrics.triangles.toLocaleString()}
- Draw Calls: ${this.metrics.drawCalls}
- Memory: ${this.metrics.memoryUsage.toFixed(1)}MB
- Performance: ${this.isPerformingWell() ? 'Good' : 'Poor'}
    `.trim();
  }

  public dispose(): void {
    // Clear monitoring interval
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
    }
    
    // Dispose instanced meshes
    this.instancedMeshes.forEach(mesh => {
      mesh.dispose();
      this.scene.remove(mesh);
    });
    this.instancedMeshes.clear();
    
    // Dispose batched geometries
    this.batchedGeometries.forEach(geometry => {
      geometry.dispose();
    });
    this.batchedGeometries.clear();
    
    // Clear frame time history
    this.frameTimeHistory.length = 0;
  }
}
