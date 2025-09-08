import * as THREE from 'three';

/**
 * Creates a more realistic chicken model
 */
export function createChickenModel(): THREE.Group {
  const chickenGroup = new THREE.Group();

  // Body (egg-shaped, wider at bottom)
  const bodyGeometry = new THREE.SphereGeometry(0.3, 8, 6);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // White feathers
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.scale.set(1, 0.8, 1.2); // Make it more egg-shaped
  body.position.y = 0.3;
  body.castShadow = true;
  chickenGroup.add(body);

  // Head (smaller sphere)
  const headGeometry = new THREE.SphereGeometry(0.15, 8, 6);
  const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 0.6, 0.2);
  head.castShadow = true;
  chickenGroup.add(head);

  // Beak (small cone)
  const beakGeometry = new THREE.ConeGeometry(0.03, 0.08, 4);
  const beakMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 }); // Orange
  const beak = new THREE.Mesh(beakGeometry, beakMaterial);
  beak.position.set(0, 0.6, 0.32);
  beak.rotation.x = Math.PI / 2;
  chickenGroup.add(beak);

  // Comb (red crest on top of head)
  const combGeometry = new THREE.SphereGeometry(0.06, 6, 4);
  const combMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 }); // Red
  const comb = new THREE.Mesh(combGeometry, combMaterial);
  comb.scale.set(1, 1.5, 0.5);
  comb.position.set(0, 0.73, 0.15);
  chickenGroup.add(comb);

  // Wings (flattened spheres on sides)
  const wingGeometry = new THREE.SphereGeometry(0.15, 6, 4);
  const wingMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC }); // Beige
  
  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  leftWing.scale.set(0.3, 0.8, 1.2);
  leftWing.position.set(-0.25, 0.35, 0);
  chickenGroup.add(leftWing);
  
  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  rightWing.scale.set(0.3, 0.8, 1.2);
  rightWing.position.set(0.25, 0.35, 0);
  chickenGroup.add(rightWing);

  // Legs (thin cylinders)
  const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.15);
  const legMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 }); // Orange
  
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.1, 0.08, 0);
  chickenGroup.add(leftLeg);
  
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.1, 0.08, 0);
  chickenGroup.add(rightLeg);

  // Feet (small flat boxes)
  const footGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.12);
  const footMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 });
  
  const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
  leftFoot.position.set(-0.1, 0.01, 0.02);
  chickenGroup.add(leftFoot);
  
  const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
  rightFoot.position.set(0.1, 0.01, 0.02);
  chickenGroup.add(rightFoot);

  // Tail feathers (small cone at back)
  const tailGeometry = new THREE.ConeGeometry(0.1, 0.2, 6);
  const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.position.set(0, 0.4, -0.35);
  tail.rotation.x = -Math.PI / 6; // Angle upward
  chickenGroup.add(tail);

  return chickenGroup;
}

/**
 * Creates a more realistic rat model
 */
export function createRatModel(): THREE.Group {
  const ratGroup = new THREE.Group();

  // Body (elongated oval)
  const bodyGeometry = new THREE.SphereGeometry(0.15, 8, 6);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 }); // Gray
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.scale.set(1.5, 0.8, 1); // Make it elongated
  body.position.y = 0.12;
  body.castShadow = true;
  ratGroup.add(body);

  // Head (smaller oval)
  const headGeometry = new THREE.SphereGeometry(0.08, 8, 6);
  const headMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.scale.set(1.2, 1, 1.3); // Elongated snout
  head.position.set(0, 0.15, 0.18);
  head.castShadow = true;
  ratGroup.add(head);

  // Ears (small cones)
  const earGeometry = new THREE.ConeGeometry(0.03, 0.06, 6);
  const earMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
  
  const leftEar = new THREE.Mesh(earGeometry, earMaterial);
  leftEar.position.set(-0.05, 0.22, 0.15);
  ratGroup.add(leftEar);
  
  const rightEar = new THREE.Mesh(earGeometry, earMaterial);
  rightEar.position.set(0.05, 0.22, 0.15);
  ratGroup.add(rightEar);

  // Tail (long thin cylinder)
  const tailGeometry = new THREE.CylinderGeometry(0.01, 0.02, 0.3);
  const tailMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.position.set(0, 0.08, -0.25);
  tail.rotation.x = Math.PI / 4; // Angle it up slightly
  ratGroup.add(tail);

  // Legs (very small cylinders)
  const legGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.04);
  const legMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
  
  // Front legs
  const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
  frontLeftLeg.position.set(-0.08, 0.02, 0.1);
  ratGroup.add(frontLeftLeg);
  
  const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
  frontRightLeg.position.set(0.08, 0.02, 0.1);
  ratGroup.add(frontRightLeg);
  
  // Back legs
  const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
  backLeftLeg.position.set(-0.08, 0.02, -0.05);
  ratGroup.add(backLeftLeg);
  
  const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
  backRightLeg.position.set(0.08, 0.02, -0.05);
  ratGroup.add(backRightLeg);

  return ratGroup;
}
