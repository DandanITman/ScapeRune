import * as THREE from 'three';

export interface GraphicsSettings {
  shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  renderDistance: number; // 50-200
  particleEffects: boolean;
  postProcessing: boolean;
  antiAliasing: boolean;
  vsync: boolean;
}

export class GraphicsEnhancementSystem {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private settings: GraphicsSettings;
  private shadowMapSize: Map<string, number> = new Map();
  private textureFilters: Map<string, THREE.TextureFilter> = new Map();
  private particleSystems: THREE.Group[] = [];
  private postProcessingEnabled: boolean = false;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    
    // Default settings
    this.settings = {
      shadowQuality: 'medium',
      textureQuality: 'medium',
      renderDistance: 100,
      particleEffects: true,
      postProcessing: false,
      antiAliasing: true,
      vsync: true
    };

    this.initializeGraphicsSettings();
    this.setupShadowMaps();
    this.setupTextureFilters();
  }

  private initializeGraphicsSettings(): void {
    // Configure renderer based on settings
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.antialias = this.settings.antiAliasing;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Enable tone mapping for better lighting
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    // Enable physically correct lights
    this.renderer.physicallyCorrectLights = true;
  }

  private setupShadowMaps(): void {
    this.shadowMapSize.set('low', 512);
    this.shadowMapSize.set('medium', 1024);
    this.shadowMapSize.set('high', 2048);
    this.shadowMapSize.set('ultra', 4096);
  }

  private setupTextureFilters(): void {
    this.textureFilters.set('low', THREE.NearestFilter);
    this.textureFilters.set('medium', THREE.LinearFilter);
    this.textureFilters.set('high', THREE.LinearMipmapLinearFilter);
    this.textureFilters.set('ultra', THREE.LinearMipmapLinearFilter);
  }

  public updateSettings(newSettings: Partial<GraphicsSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.applySettings();
  }

  private applySettings(): void {
    this.applyShadowQuality();
    this.applyTextureQuality();
    this.applyRenderDistance();
    this.applyParticleEffects();
    this.applyAntiAliasing();
    this.applyPostProcessing();
  }

  private applyShadowQuality(): void {
    const shadowMapSize = this.shadowMapSize.get(this.settings.shadowQuality) || 1024;
    
    // Update all lights with shadows
    this.scene.traverse((child) => {
      if (child instanceof THREE.DirectionalLight || 
          child instanceof THREE.SpotLight || 
          child instanceof THREE.PointLight) {
        if (child.shadow) {
          child.shadow.mapSize.width = shadowMapSize;
          child.shadow.mapSize.height = shadowMapSize;
          child.shadow.needsUpdate = true;
        }
      }
    });
  }

  private applyTextureQuality(): void {
    const filter = this.textureFilters.get(this.settings.textureQuality) || THREE.LinearFilter;
    
    // Update all textures in the scene
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.Material) {
          this.updateMaterialTextures(child.material, filter);
        } else if (Array.isArray(child.material)) {
          child.material.forEach(material => this.updateMaterialTextures(material, filter));
        }
      }
    });
  }

  private updateMaterialTextures(material: THREE.Material, filter: THREE.TextureFilter): void {
    if ('map' in material && material.map) {
      material.map.minFilter = filter;
      material.map.magFilter = filter;
      material.map.needsUpdate = true;
    }
    if ('normalMap' in material && material.normalMap) {
      material.normalMap.minFilter = filter;
      material.normalMap.magFilter = filter;
      material.normalMap.needsUpdate = true;
    }
    if ('roughnessMap' in material && material.roughnessMap) {
      material.roughnessMap.minFilter = filter;
      material.roughnessMap.magFilter = filter;
      material.roughnessMap.needsUpdate = true;
    }
  }

  private applyRenderDistance(): void {
    // Update fog and camera far plane based on render distance
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.far = this.settings.renderDistance;
    }
    
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.far = this.settings.renderDistance + 50;
      this.camera.updateProjectionMatrix();
    }

    // Update LOD (Level of Detail) for distant objects
    this.updateLOD();
  }

  private updateLOD(): void {
    this.scene.traverse((child) => {
      if (child.userData.isLODObject) {
        const distance = this.camera.position.distanceTo(child.position);
        const lodLevel = this.calculateLODLevel(distance);
        this.applyLODLevel(child, lodLevel);
      }
    });
  }

  private calculateLODLevel(distance: number): number {
    const renderDistance = this.settings.renderDistance;
    if (distance < renderDistance * 0.3) return 0; // High detail
    if (distance < renderDistance * 0.6) return 1; // Medium detail
    if (distance < renderDistance * 0.9) return 2; // Low detail
    return 3; // Very low detail or culled
  }

  private applyLODLevel(object: THREE.Object3D, level: number): void {
    // Apply LOD based on distance
    if (level === 3) {
      object.visible = false;
      return;
    }
    
    object.visible = true;
    
    if (object instanceof THREE.Mesh) {
      // Adjust material detail based on LOD level
      if (object.material instanceof THREE.Material) {
        this.adjustMaterialLOD(object.material, level);
      }
    }
  }

  private adjustMaterialLOD(material: THREE.Material, level: number): void {
    // Reduce material complexity for distant objects
    if ('roughness' in material) {
      material.roughness = level === 0 ? 0.5 : 0.8; // Less detailed materials for distant objects
    }
    if ('metalness' in material) {
      material.metalness = level === 0 ? material.metalness : 0; // Remove metallic effects for distant objects
    }
  }

  private applyParticleEffects(): void {
    this.particleSystems.forEach(system => {
      system.visible = this.settings.particleEffects;
    });
  }

  private applyAntiAliasing(): void {
    // Note: Antialias setting requires renderer recreation, so we'll just store the setting
    // This would typically be applied on next renderer initialization
    console.log(`Antialiasing ${this.settings.antiAliasing ? 'enabled' : 'disabled'} - requires restart`);
  }

  private applyPostProcessing(): void {
    this.postProcessingEnabled = this.settings.postProcessing;
    // Post-processing would be implemented with libraries like three/examples/jsm/postprocessing
    console.log(`Post-processing ${this.postProcessingEnabled ? 'enabled' : 'disabled'}`);
  }

  public addParticleSystem(particleSystem: THREE.Group): void {
    this.particleSystems.push(particleSystem);
    particleSystem.visible = this.settings.particleEffects;
  }

  public removeParticleSystem(particleSystem: THREE.Group): void {
    const index = this.particleSystems.indexOf(particleSystem);
    if (index > -1) {
      this.particleSystems.splice(index, 1);
    }
  }

  public createEnhancedLighting(): void {
    // Remove existing lights
    const lightsToRemove: THREE.Light[] = [];
    this.scene.traverse((child) => {
      if (child instanceof THREE.Light) {
        lightsToRemove.push(child);
      }
    });
    lightsToRemove.forEach(light => this.scene.remove(light));

    // Add enhanced lighting setup
    this.addSunlight();
    this.addAmbientLighting();
    this.addAreaLights();
  }

  private addSunlight(): void {
    const sunlight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunlight.position.set(50, 100, 50);
    sunlight.castShadow = true;
    
    const shadowMapSize = this.shadowMapSize.get(this.settings.shadowQuality) || 1024;
    sunlight.shadow.mapSize.width = shadowMapSize;
    sunlight.shadow.mapSize.height = shadowMapSize;
    sunlight.shadow.camera.near = 0.5;
    sunlight.shadow.camera.far = 500;
    sunlight.shadow.camera.left = -100;
    sunlight.shadow.camera.right = 100;
    sunlight.shadow.camera.top = 100;
    sunlight.shadow.camera.bottom = -100;
    
    this.scene.add(sunlight);
  }

  private addAmbientLighting(): void {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
    
    // Add hemisphere light for more natural ambient lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.4);
    hemisphereLight.position.set(0, 50, 0);
    this.scene.add(hemisphereLight);
  }

  private addAreaLights(): void {
    // Add some area lights for buildings and special areas
    const areaLight1 = new THREE.PointLight(0xffaa44, 0.5, 30);
    areaLight1.position.set(25, 5, 5); // Near blacksmith
    areaLight1.castShadow = true;
    this.scene.add(areaLight1);

    const areaLight2 = new THREE.PointLight(0x4444ff, 0.3, 25);
    areaLight2.position.set(-15, 3, -25); // Near bank
    areaLight2.castShadow = true;
    this.scene.add(areaLight2);
  }

  public createParticleEffects(): void {
    if (!this.settings.particleEffects) return;

    // Create magical sparkles around the world
    this.createMagicSparkles();
    
    // Create dust particles
    this.createDustParticles();
    
    // Create fire effects for smithing areas
    this.createFireEffects();
  }

  private createMagicSparkles(): void {
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 50;
    const positions = new Float32Array(sparkleCount * 3);
    
    for (let i = 0; i < sparkleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;     // x
      positions[i + 1] = Math.random() * 20 + 2;      // y
      positions[i + 2] = (Math.random() - 0.5) * 100; // z
    }
    
    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const sparkleMaterial = new THREE.PointsMaterial({
      color: 0x88aaff,
      size: 0.5,
      transparent: true,
      opacity: 0.8,
      alphaTest: 0.1
    });
    
    const sparkleSystem = new THREE.Points(sparkleGeometry, sparkleMaterial);
    sparkleSystem.userData.isParticleSystem = true;
    
    const sparkleGroup = new THREE.Group();
    sparkleGroup.add(sparkleSystem);
    
    this.scene.add(sparkleGroup);
    this.addParticleSystem(sparkleGroup);
  }

  private createDustParticles(): void {
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 30;
    const positions = new Float32Array(dustCount * 3);
    
    for (let i = 0; i < dustCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80;       // x
      positions[i + 1] = Math.random() * 10 + 1;       // y
      positions[i + 2] = (Math.random() - 0.5) * 80;   // z
    }
    
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const dustMaterial = new THREE.PointsMaterial({
      color: 0xccaa88,
      size: 0.3,
      transparent: true,
      opacity: 0.4,
      alphaTest: 0.1
    });
    
    const dustSystem = new THREE.Points(dustGeometry, dustMaterial);
    
    const dustGroup = new THREE.Group();
    dustGroup.add(dustSystem);
    
    this.scene.add(dustGroup);
    this.addParticleSystem(dustGroup);
  }

  private createFireEffects(): void {
    // Create fire particle effect near smithing area
    const fireGeometry = new THREE.BufferGeometry();
    const fireCount = 20;
    const positions = new Float32Array(fireCount * 3);
    
    for (let i = 0; i < fireCount * 3; i += 3) {
      positions[i] = 25 + (Math.random() - 0.5) * 5;     // x (near blacksmith)
      positions[i + 1] = Math.random() * 8 + 2;          // y
      positions[i + 2] = 5 + (Math.random() - 0.5) * 5;  // z
    }
    
    fireGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const fireMaterial = new THREE.PointsMaterial({
      color: 0xff4400,
      size: 0.8,
      transparent: true,
      opacity: 0.7,
      alphaTest: 0.1
    });
    
    const fireSystem = new THREE.Points(fireGeometry, fireMaterial);
    
    const fireGroup = new THREE.Group();
    fireGroup.add(fireSystem);
    
    this.scene.add(fireGroup);
    this.addParticleSystem(fireGroup);
  }

  public animateParticles(): void {
    if (!this.settings.particleEffects) return;

    this.particleSystems.forEach(system => {
      system.children.forEach(child => {
        if (child instanceof THREE.Points) {
          // Animate particles by rotating and moving them
          child.rotation.y += 0.002;
          
          const positions = child.geometry.attributes.position;
          if (positions) {
            const array = positions.array as Float32Array;
            for (let i = 1; i < array.length; i += 3) {
              array[i] += Math.sin(Date.now() * 0.001 + i) * 0.01; // Floating motion
            }
            positions.needsUpdate = true;
          }
        }
      });
    });
  }

  public getSettings(): GraphicsSettings {
    return { ...this.settings };
  }

  public getPerformanceInfo(): { fps: number; triangles: number; calls: number } {
    return {
      fps: 60, // Would be calculated from actual frame timing
      triangles: this.renderer.info.render.triangles,
      calls: this.renderer.info.render.calls
    };
  }

  public dispose(): void {
    this.particleSystems.forEach(system => {
      this.scene.remove(system);
    });
    this.particleSystems.clear();
  }
}
