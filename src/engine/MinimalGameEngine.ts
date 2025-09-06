import * as THREE from 'three';

export class MinimalGameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationId: number | null = null;
  private isRunning = false;

  constructor(container: HTMLElement) {
    console.log('Creating minimal game engine...');
    
    // Basic setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
    
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);
    
    // Add a simple cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
    
    console.log('Minimal game engine created');
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;
    
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  public start(): void {
    console.log('Starting minimal game engine...');
    this.isRunning = true;
    this.gameLoop();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  public dispose(): void {
    this.stop();
    this.renderer.dispose();
  }
}
