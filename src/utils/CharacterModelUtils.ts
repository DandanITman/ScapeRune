import * as THREE from 'three';

export interface CharacterModelOptions {
  bodyColor?: number;
  skinColor?: number;
  scale?: number;
  clothing?: {
    hat?: { color: number; type: 'hat' | 'helmet' | 'crown' };
    shirt?: { color: number };
    pants?: { color: number };
    accessories?: { type: 'apron' | 'cape'; color: number }[];
  };
}

/**
 * Creates a human-like character model with proper proportions
 * Body parts include: head, torso, arms, legs
 */
export function createHumanCharacterModel(options: CharacterModelOptions = {}): THREE.Group {
  const {
    bodyColor = 0x0066CC,
    skinColor = 0xFFDBC4,
    scale = 1,
    clothing = {}
  } = options;

  const characterGroup = new THREE.Group();

  // Torso (main body)
  const torsoGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.3);
  const torsoMaterial = new THREE.MeshLambertMaterial({ color: clothing.shirt?.color || bodyColor });
  const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
  torso.position.y = 1.0;
  torso.castShadow = true;
  characterGroup.add(torso);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.25);
  const headMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.65;
  head.castShadow = true;
  characterGroup.add(head);

  // Nose (small but visible directional indicator)
  const noseGeometry = new THREE.SphereGeometry(0.08);
  const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6A3 }); // Slightly darker skin tone for visibility
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(0, 1.65, 0.28); // Forward from head center
  nose.castShadow = true;
  characterGroup.add(nose);

  // Arms
  const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6);
  const armMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
  
  // Left arm
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.4, 1.0, 0);
  leftArm.castShadow = true;
  characterGroup.add(leftArm);
  
  // Right arm
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.4, 1.0, 0);
  rightArm.castShadow = true;
  characterGroup.add(rightArm);

  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7);
  const legMaterial = new THREE.MeshLambertMaterial({ color: clothing.pants?.color || 0x8B4513 });
  
  // Left leg
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.15, 0.35, 0);
  leftLeg.castShadow = true;
  characterGroup.add(leftLeg);
  
  // Right leg
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.15, 0.35, 0);
  rightLeg.castShadow = true;
  characterGroup.add(rightLeg);

  // Feet
  const footGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.3);
  const footMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
  
  // Left foot
  const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
  leftFoot.position.set(-0.15, 0.05, 0.05);
  leftFoot.castShadow = true;
  characterGroup.add(leftFoot);
  
  // Right foot
  const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
  rightFoot.position.set(0.15, 0.05, 0.05);
  rightFoot.castShadow = true;
  characterGroup.add(rightFoot);

  // Add clothing accessories
  if (clothing.hat) {
    addHat(characterGroup, clothing.hat);
  }
  
  if (clothing.accessories) {
    clothing.accessories.forEach(accessory => {
      addAccessory(characterGroup, accessory);
    });
  }

  // Scale the entire character
  characterGroup.scale.setScalar(scale);

  return characterGroup;
}

/**
 * Add hat to character
 */
function addHat(characterGroup: THREE.Group, hat: { color: number; type: 'hat' | 'helmet' | 'crown' }): void {
  let hatGeometry: THREE.BufferGeometry;
  
  switch (hat.type) {
    case 'crown':
      hatGeometry = new THREE.CylinderGeometry(0.28, 0.25, 0.15);
      break;
    case 'helmet':
      hatGeometry = new THREE.SphereGeometry(0.28, 8, 8);
      break;
    default: // hat
      hatGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.2);
  }
  
  const hatMaterial = new THREE.MeshLambertMaterial({ color: hat.color });
  const hatMesh = new THREE.Mesh(hatGeometry, hatMaterial);
  hatMesh.position.y = hat.type === 'helmet' ? 1.65 : 1.85;
  hatMesh.castShadow = true;
  characterGroup.add(hatMesh);
}

/**
 * Add accessory to character
 */
function addAccessory(characterGroup: THREE.Group, accessory: { type: 'apron' | 'cape'; color: number }): void {
  let accessoryGeometry: THREE.BufferGeometry;
  let position: THREE.Vector3;
  
  switch (accessory.type) {
    case 'apron':
      accessoryGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.05);
      position = new THREE.Vector3(0, 0.8, 0.18);
      break;
    case 'cape':
      accessoryGeometry = new THREE.BoxGeometry(0.7, 0.8, 0.05);
      position = new THREE.Vector3(0, 1.0, -0.2);
      break;
  }
  
  const accessoryMaterial = new THREE.MeshLambertMaterial({ color: accessory.color });
  const accessoryMesh = new THREE.Mesh(accessoryGeometry, accessoryMaterial);
  accessoryMesh.position.copy(position);
  accessoryMesh.castShadow = true;
  characterGroup.add(accessoryMesh);
}

/**
 * Simple walking animation for characters
 * This modifies the character model to show walking motion
 */
export function animateWalking(characterGroup: THREE.Group, time: number, speed: number = 1): void {
  const children = characterGroup.children;
  
  // Find legs, arms, and feet for animation
  const leftLeg = children.find(child => child.position.x < -0.1 && child.position.y > 0.2 && child.position.y < 0.8);
  const rightLeg = children.find(child => child.position.x > 0.1 && child.position.y > 0.2 && child.position.y < 0.8);
  const leftArm = children.find(child => child.position.x < -0.3 && child.position.y > 0.8);
  const rightArm = children.find(child => child.position.x > 0.3 && child.position.y > 0.8);
  const leftFoot = children.find(child => child.position.x < -0.1 && child.position.y < 0.2);
  const rightFoot = children.find(child => child.position.x > 0.1 && child.position.y < 0.2);
  
  const walkCycle = Math.sin(time * speed * 5) * 0.3;
  
  if (leftLeg) {
    leftLeg.rotation.x = walkCycle;
  }
  if (rightLeg) {
    rightLeg.rotation.x = -walkCycle;
  }
  if (leftArm) {
    leftArm.rotation.x = -walkCycle * 0.5;
  }
  if (rightArm) {
    rightArm.rotation.x = walkCycle * 0.5;
  }
  // Animate feet to follow leg movement
  if (leftFoot) {
    leftFoot.rotation.x = walkCycle * 0.8; // Slightly reduced rotation for feet
  }
  if (rightFoot) {
    rightFoot.rotation.x = -walkCycle * 0.8;
  }
}

/**
 * Stop walking animation and reset pose
 */
export function stopWalking(characterGroup: THREE.Group): void {
  const children = characterGroup.children;
  
  children.forEach(child => {
    if (child.position.y < 1.5) { // legs, arms, and feet
      child.rotation.x = 0;
    }
  });
}
