import * as THREE from 'three';

export const testWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (error) {
    return false;
  }
};

export const createTestScene = (container: HTMLElement): THREE.WebGLRenderer | null => {
  try {
    // Create a simple test scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xff0000); // Red background for testing
    
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Add a simple cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    camera.position.z = 5;
    
    // Render once
    renderer.render(scene, camera);
    
    console.log('Test WebGL scene created successfully');
    return renderer;
  } catch (error) {
    console.error('Test WebGL scene failed:', error);
    return null;
  }
};
