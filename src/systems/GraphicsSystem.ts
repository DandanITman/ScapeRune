import * as THREE from 'three';

export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface GraphicsSettings {
  quality: GraphicsQuality;
  enableShadows: boolean;
  smoothCamera: boolean;
  enableVSync: boolean;
  enableFog: boolean;
  antialias: boolean;
}

export class GraphicsSystem {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private settings: GraphicsSettings;
  private directionalLight?: THREE.DirectionalLight;
  private ambientLight?: THREE.AmbientLight;
  private fog?: THREE.Fog;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    this.renderer = renderer;
    this.scene = scene;
    
    // Default settings
    this.settings = {
      quality: 'medium',
      enableShadows: true,
      smoothCamera: true,
      enableVSync: false,
      enableFog: true,
      antialias: true
    };

    this.initializeGraphics();
  }

  private initializeGraphics() {
    this.setupLighting();
    this.setupFog();
    this.setupShadows();
    this.setupRenderer();
  }

  private setupLighting() {
    // Enhanced lighting system
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.4); // Soft ambient light
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(50, 100, 50);
    this.directionalLight.castShadow = true;
    
    // Enhanced shadow settings
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    
    this.scene.add(this.directionalLight);
  }

  private setupFog() {
    if (this.settings.enableFog) {
      this.fog = new THREE.Fog(0xcccccc, 100, 300);
      this.scene.fog = this.fog;
    }
  }

  private setupShadows() {
    if (this.settings.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
    }
  }

  private setupRenderer() {
    // Enhanced renderer settings
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.antialias = this.settings.antialias;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  updateSettings(newSettings: Partial<GraphicsSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.applySettings();
  }

  private applySettings() {
    // Apply quality settings
    this.applyQualitySettings();
    
    // Apply shadow settings
    if (this.settings.enableShadows) {
      this.enableShadows();
    } else {
      this.disableShadows();
    }

    // Apply fog settings
    if (this.settings.enableFog) {
      this.enableFog();
    } else {
      this.disableFog();
    }

    // Apply VSync settings
    if (this.settings.enableVSync) {
      this.enableVSync();
    } else {
      this.disableVSync();
    }
  }

  private applyQualitySettings() {
    switch (this.settings.quality) {
      case 'low':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        if (this.directionalLight) {
          this.directionalLight.shadow.mapSize.setScalar(512);
        }
        this.renderer.antialias = false;
        break;

      case 'medium':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        if (this.directionalLight) {
          this.directionalLight.shadow.mapSize.setScalar(1024);
        }
        this.renderer.antialias = true;
        break;

      case 'high':
        this.renderer.setPixelRatio(window.devicePixelRatio);
        if (this.directionalLight) {
          this.directionalLight.shadow.mapSize.setScalar(2048);
        }
        this.renderer.antialias = true;
        break;
    }
  }

  private enableShadows() {
    this.renderer.shadowMap.enabled = true;
    if (this.directionalLight) {
      this.directionalLight.castShadow = true;
    }
  }

  private disableShadows() {
    this.renderer.shadowMap.enabled = false;
    if (this.directionalLight) {
      this.directionalLight.castShadow = false;
    }
  }

  private enableFog() {
    if (!this.fog) {
      this.fog = new THREE.Fog(0xcccccc, 100, 300);
    }
    this.scene.fog = this.fog;
  }

  private disableFog() {
    this.scene.fog = null;
  }

  private enableVSync() {
    // Note: VSync is typically controlled at the browser/OS level
    // This is more of a placeholder for future implementation
    console.log('VSync enabled');
  }

  private disableVSync() {
    console.log('VSync disabled');
  }

  // Enhanced visual effects
  addPostProcessing() {
    // This could be extended with post-processing effects
    // For now, we'll focus on basic enhancements
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      memoryUsage: this.renderer.info.memory,
      renderCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      points: this.renderer.info.render.points,
      lines: this.renderer.info.render.lines
    };
  }

  // Update rendering settings for specific objects
  enhanceObject(object: THREE.Object3D) {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enable shadow casting and receiving
        child.castShadow = this.settings.enableShadows;
        child.receiveShadow = this.settings.enableShadows;

        // Enhanced material properties
        if (child.material instanceof THREE.MeshLambertMaterial || 
            child.material instanceof THREE.MeshPhongMaterial) {
          child.material.transparent = false;
          child.material.opacity = 1;
        }
      }
    });
  }

  // Resize handling with quality considerations
  handleResize(width: number, height: number) {
    this.renderer.setSize(width, height);
    
    // Adjust pixel ratio based on quality setting
    switch (this.settings.quality) {
      case 'low':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        break;
      case 'medium':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        break;
      case 'high':
        this.renderer.setPixelRatio(window.devicePixelRatio);
        break;
    }
  }

  getSettings(): GraphicsSettings {
    return { ...this.settings };
  }
}
