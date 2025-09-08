import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { MinimalGameEngine } from '../engine/MinimalGameEngine';
import { WorldSystem } from '../systems/WorldSystem';
import { NPCSystem } from '../systems/NPCSystem';
import { BankingSystem } from '../systems/BankingSystem';
import { ShopSystem } from '../systems/ShopSystem';
import { TutorialIslandSystem } from '../systems/TutorialIslandSystem';
import { useGameStore } from '../store/gameStore';
import GameInterface from './GameInterface';
import CombatUI from './CombatUI';
import { BankPanel } from './BankPanel';
import { ShopPanel } from './ShopPanel';
import { TutorialPanel } from './TutorialPanel';
import type { FloatingText, HealthBar } from './CombatUI';
import type { ShopItem } from '../systems/NPCSystem';
import * as THREE from 'three';

// Define combat event types for better type safety
interface CombatEvent {
  type: 'player_attack' | 'npc_attack';
  result: {
    success: boolean;
    damage: number;
    xp?: {
      attack: number;
      strength: number;
      defense: number;
      hits: number;
    };
    npcDead?: boolean;
    playerDead?: boolean;
  };
  npc: THREE.Object3D;
}

const Game: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | MinimalGameEngine | null>(null);
  const worldSystemRef = useRef<WorldSystem | null>(null);
  const npcSystemRef = useRef<NPCSystem | null>(null);
  const bankingSystemRef = useRef<BankingSystem | null>(null);
  const shopSystemRef = useRef<ShopSystem | null>(null);
  const tutorialSystemRef = useRef<TutorialIslandSystem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState<string>('Initializing...');
  const [showTutorial, setShowTutorial] = useState(false); // Tutorial disabled by default for Phase 8 testing
  
  const { setGameLoaded, addExperience, updateCurrentHits } = useGameStore();
  
  // Use minimal engine for testing
  const useMinimalEngine = false;

  // Camera controls  
  const keysPressed = useRef<Set<string>>(new Set());
  const cameraRotationSpeed = 0.02;
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  
  // Suppress unused variable warnings for these state setters that are used in event handlers
  void targetPosition;
  void isMoving;
  const [clickIndicator, setClickIndicator] = useState<{x: number, y: number, show: boolean}>({x: 0, y: 0, show: false});
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, show: boolean, npc?: THREE.Object3D}>({x: 0, y: 0, show: false});
  
  // Combat UI state
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [healthBars, setHealthBars] = useState<HealthBar[]>([]);
  
  // Magic spell state - get selectedSpell from store instead of local state
  const { selectedSpell } = useGameStore();
  const [spellAnimations, setSpellAnimations] = useState<{id: string, x: number, y: number, type: string}[]>([]);
  
  // Cursor feedback state
  const [cursorFeedback, setCursorFeedback] = useState<{x: number, y: number, type: 'interact' | 'attack' | null}>({ x: 0, y: 0, type: null });
  const [hoveredNPC, setHoveredNPC] = useState<THREE.Object3D | null>(null);
  
  // Store world positions for health bar entities to update their screen positions
  const healthBarEntities = useRef<Map<string, THREE.Vector3>>(new Map());

  // World building UI state
  const [showBankPanel, setShowBankPanel] = useState(false);
  const [showShopPanel, setShowShopPanel] = useState(false);
  const [currentShopItems, setCurrentShopItems] = useState<ShopItem[]>([]);
  const [currentShopName, setCurrentShopName] = useState<string>('');

  // Helper function to add floating text
  const addFloatingText = useCallback((text: string, type: 'damage' | 'miss' | 'xp' | 'heal', screenX: number, screenY: number) => {
    const newText: FloatingText = {
      id: `${Date.now()}_${Math.random()}`,
      text,
      type,
      x: screenX,
      y: screenY,
      timestamp: Date.now()
    };
    setFloatingTexts(prev => [...prev, newText]);
  }, []);

  // Helper function to remove floating text
  const removeFloatingText = (id: string) => {
    setFloatingTexts(prev => prev.filter(text => text.id !== id));
  };

  // Helper function to remove health bar
  const removeHealthBar = (id: string) => {
    setHealthBars(prev => prev.filter(bar => bar.id !== id));
    healthBarEntities.current.delete(id);
  };

  // Helper function to get screen position from world position
  const getScreenPosition = useCallback((worldPosition: THREE.Vector3): { x: number, y: number } => {
    if (!gameEngineRef.current || useMinimalEngine) return { x: 0, y: 0 };
    
    const engine = gameEngineRef.current as GameEngine;
    const camera = engine.getCamera();
    const renderer = engine.getRenderer();
    
    if (!camera || !renderer) return { x: 0, y: 0 };

    const vector = worldPosition.clone();
    vector.project(camera);

    const canvas = renderer.domElement;
    const x = (vector.x * 0.5 + 0.5) * canvas.clientWidth;
    const y = (vector.y * -0.5 + 0.5) * canvas.clientHeight;

    return { x, y };
  }, [useMinimalEngine]);

  // Helper function to update health bars
  const updateHealthBar = useCallback((id: string, name: string, currentHealth: number, maxHealth: number, worldPosition: THREE.Vector3, isPlayer: boolean = false) => {
    // Store the world position for continuous screen position updates
    healthBarEntities.current.set(id, worldPosition.clone());
    
    // Calculate initial screen position
    const screenPos = getScreenPosition(worldPosition);
    
    const newHealthBar: HealthBar = {
      id,
      name,
      currentHealth,
      maxHealth,
      x: screenPos.x,
      y: screenPos.y,
      isPlayer
    };
    
    setHealthBars(prev => {
      const filtered = prev.filter(bar => bar.id !== id);
      return [...filtered, newHealthBar];
    });
  }, [getScreenPosition]);

  // Skill interaction handlers
  const handleWoodcutting = useCallback((tree: THREE.Group) => {
    if (!gameEngineRef.current || useMinimalEngine) return;
    
    const engine = gameEngineRef.current as GameEngine;
    const woodcuttingSystem = engine.getWoodcuttingSystem();
    const { player, addItemToInventory } = useGameStore.getState();
    
    // Default equipment (bronze axe for now)
    const equipment = {
      axeType: 'bronze' as const,
      axeBonus: 1
    };
    
    // Find the tree in the woodcutting system
    const systemTree = woodcuttingSystem.getTrees().find(t => 
      t.mesh === tree || (t.position.distanceTo(tree.position) < 1)
    );
    
    if (!systemTree) {
      console.error('Tree not found in woodcutting system');
      return;
    }
    
    // Attempt to chop the tree
    const result = woodcuttingSystem.chopTree(systemTree, player.stats.woodcutting, equipment, addItemToInventory);
    
    // Get screen positions for floating text
    const treeScreenPos = getScreenPosition(tree.position);
    const playerPos = engine.getPlayerPosition();
    const playerScreenPos = getScreenPosition(playerPos);
    
    if (result.success) {
      // Apply woodcutting XP to game store
      addExperience('woodcutting', result.experience);
      
      // Show XP over player's head
      addFloatingText(`+${result.experience} Woodcutting XP`, 'xp', playerScreenPos.x, playerScreenPos.y - 30);
      
      // Show logs gained over tree
      setTimeout(() => {
        addFloatingText(`+1 ${result.logs}`, 'heal', treeScreenPos.x, treeScreenPos.y - 50);
      }, 500);
      
      console.log(result.message);
      
      // Hide the tree visually if it was chopped down
      if (tree) {
        tree.visible = false;
        
        // Show tree respawn after some time
        setTimeout(() => {
          tree.visible = true;
          addFloatingText('Tree respawned!', 'heal', treeScreenPos.x, treeScreenPos.y);
        }, systemTree.respawnTime || 30000);
      }
    } else {
      // Show failure message
      addFloatingText(result.message, 'miss', treeScreenPos.x, treeScreenPos.y);
      console.log(result.message);
    }
  }, [useMinimalEngine, getScreenPosition, addExperience, addFloatingText]);

  const handleMining = useCallback((rock: THREE.Group) => {
    if (!gameEngineRef.current || useMinimalEngine) return;
    
    const engine = gameEngineRef.current as GameEngine;
    const miningSystem = engine.getMiningSystem();
    const { player, addItemToInventory } = useGameStore.getState();
    
    // Default equipment (bronze pickaxe for now)
    const equipment = {
      pickaxeType: 'bronze' as const,
      pickaxeLevel: 1,
      swingsPerClick: 1
    };
    
    // Find the rock in the mining system
    const systemRock = miningSystem.getRocks().find(r => 
      r.mesh === rock || (r.position.distanceTo(rock.position) < 1)
    );
    
    if (!systemRock) {
      console.error('Rock not found in mining system');
      return;
    }
    
    // Attempt to mine the rock
    const result = miningSystem.mineRock(systemRock, player.stats.mining, equipment, addItemToInventory);
    
    // Get screen positions for floating text
    const rockScreenPos = getScreenPosition(rock.position);
    const playerPos = engine.getPlayerPosition();
    const playerScreenPos = getScreenPosition(playerPos);
    
    if (result.success) {
      // Apply mining XP to game store
      addExperience('mining', result.experience);
      
      // Show XP over player's head
      addFloatingText(`+${result.experience} Mining XP`, 'xp', playerScreenPos.x, playerScreenPos.y - 30);
      
      // Show ore gained over rock
      setTimeout(() => {
        addFloatingText(`+1 ${result.ore}`, 'heal', rockScreenPos.x, rockScreenPos.y - 50);
        
        // Show gem if found
        if (result.gem) {
          setTimeout(() => {
            addFloatingText(`+1 ${result.gem}`, 'heal', rockScreenPos.x, rockScreenPos.y - 70);
          }, 200);
        }
      }, 500);
      
      console.log(result.message);
      
      // Hide the rock temporarily if it was mined
      if (rock) {
        rock.visible = false;
        
        // Show rock respawn effect
        const oreType = miningSystem.getOreType(systemRock.type);
        if (oreType) {
          setTimeout(() => {
            rock.visible = true;
            const sparkles = miningSystem.addRockRespawnEffect(systemRock);
            if (sparkles) {
              rock.add(sparkles);
            }
            addFloatingText('Rock respawned!', 'heal', rockScreenPos.x, rockScreenPos.y);
          }, oreType.respawnTime);
        }
      }
    } else {
      // Show failure message
      addFloatingText(result.message, 'miss', rockScreenPos.x, rockScreenPos.y);
      console.log(result.message);
    }
  }, [useMinimalEngine, getScreenPosition, addExperience, addFloatingText]);

  const handleFishing = useCallback((spot: THREE.Group) => {
    if (!gameEngineRef.current || useMinimalEngine) return;
    
    const engine = gameEngineRef.current as GameEngine;
    const fishingSystem = engine.getFishingSystem();
    const { player, addItemToInventory } = useGameStore.getState();
    
    // Default equipment (small net for now)
    const equipment = {
      toolType: 'net' as const,
      levelRequired: 1,
      hasBait: true
    };
    
    // Find the fishing spot in the fishing system
    const systemSpot = fishingSystem.getFishingSpots().find(s => 
      s.mesh === spot || (s.position.distanceTo(spot.position) < 1)
    );
    
    if (!systemSpot) {
      console.error('Fishing spot not found in fishing system');
      return;
    }
    
    // Attempt to fish
    const result = fishingSystem.fish(systemSpot, player.stats.fishing, equipment, addItemToInventory);
    
    // Get screen positions for floating text
    const spotScreenPos = getScreenPosition(spot.position);
    const playerPos = engine.getPlayerPosition();
    const playerScreenPos = getScreenPosition(playerPos);
    
    if (result.success) {
      // Apply fishing XP to game store
      addExperience('fishing', result.experience);
      
      // Show XP over player's head
      addFloatingText(`+${result.experience} Fishing XP`, 'xp', playerScreenPos.x, playerScreenPos.y - 30);
      
      // Show fish caught over fishing spot
      setTimeout(() => {
        addFloatingText(`+1 ${result.fish}`, 'heal', spotScreenPos.x, spotScreenPos.y - 50);
        
        // Show other item if caught (boots, gloves, etc.)
        if (result.otherItem) {
          setTimeout(() => {
            addFloatingText(`+1 ${result.otherItem}`, 'heal', spotScreenPos.x, spotScreenPos.y - 70);
          }, 200);
        }
      }, 500);
      
      console.log(result.message);
    } else {
      // Show failure message
      addFloatingText(result.message, 'miss', spotScreenPos.x, spotScreenPos.y);
      console.log(result.message);
    }
  }, [useMinimalEngine, getScreenPosition, addExperience, addFloatingText]);

  // Handler for dropping items from inventory
  const handleDropItem = useCallback((slotIndex: number, quantity: number = 1) => {
    if (!gameEngineRef.current || useMinimalEngine) return;
    
    const engine = gameEngineRef.current as GameEngine;
    const { player, removeItemFromInventory } = useGameStore.getState();
    const item = player.inventory[slotIndex]?.item;
    
    if (!item) return;
    
    // Get the player's current position
    const playerPosition = engine.getPlayerPosition();
    
    // Create dropped item data
    const droppedItem = {
      id: `dropped_${Date.now()}_${Math.random()}`,
      itemId: item.id,
      name: item.name,
      quantity: Math.min(quantity, item.quantity),
      noted: false, // Items dropped from inventory are not noted
      position: {
        x: playerPosition.x + (Math.random() - 0.5) * 2, // Random position near player
        y: playerPosition.y,
        z: playerPosition.z + (Math.random() - 0.5) * 2
      }
    };
    
    // Add the dropped item to the engine's drop system
    engine.addDroppedItem(droppedItem);
    
    // Remove the item from the inventory
    removeItemFromInventory(slotIndex, quantity);
    
    console.log(`Dropped ${quantity}x ${item.name} at player position`);
  }, [useMinimalEngine]);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    console.log('Initializing game with container:', gameContainerRef.current);

    try {
      setLoadingStep('Creating game engine...');
      if (!gameContainerRef.current) {
        throw new Error('Container not found');
      }
      
      if (useMinimalEngine) {
        console.log('Using minimal engine...');
        gameEngineRef.current = new MinimalGameEngine(gameContainerRef.current);
      } else {
        console.log('Using full game engine...');
        gameEngineRef.current = new GameEngine(gameContainerRef.current);
      }
      console.log('GameEngine created successfully');
      
      setLoadingStep('Loading world systems...');
      
      // Initialize world and NPC systems for full engine
      if (!useMinimalEngine && gameEngineRef.current) {
        const engine = gameEngineRef.current as GameEngine;
        const scene = engine.getScene();
        
        if (scene) {
          // Initialize world system
          worldSystemRef.current = new WorldSystem(scene);
          
          // Initialize NPC system  
          npcSystemRef.current = new NPCSystem(scene);
          
          // Initialize banking system
          bankingSystemRef.current = new BankingSystem();
          
          // Initialize shop system  
          shopSystemRef.current = new ShopSystem();
          
          // Load main world for Phase 8 testing, tutorial system available but not default
          if (showTutorial) {
            setLoadingStep('Loading Tutorial Island...');
            tutorialSystemRef.current = new TutorialIslandSystem(scene);
            console.log('Tutorial Island loaded successfully');
          } else {
            // Load Lumbridge town
            worldSystemRef.current.loadTown('lumbridge');
            worldSystemRef.current.createTownPaths('lumbridge');
            
            // Spawn town NPCs
            npcSystemRef.current.spawnTownNPCs('lumbridge');
            console.log('Main world loaded successfully');
          }
          
          console.log('World systems loaded successfully');
        }
      }
      
      setLoadingStep('Starting game loop...');
      gameEngineRef.current.start();
      console.log('GameEngine started');
      
      // Test rendering after a short delay
      setTimeout(() => {
        console.log('Testing render after 1 second...');
        if (gameEngineRef.current && !useMinimalEngine) {
          console.log('Full engine renderer test completed');
        }
      }, 1000);
      
      // Complete initialization immediately for minimal engine
      setLoadingStep('Loading complete!');
      setGameLoaded(true);
      setIsLoaded(true);
      setHasError(false);
      console.log('Game initialization complete');
    } catch (error) {
      console.error('Failed to initialize game:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setHasError(true);
      setIsLoaded(false);
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
      }
    };
  }, [setGameLoaded, showTutorial, useMinimalEngine]);

  // Handle keyboard input (camera rotation)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.key.toLowerCase());
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase());
    };

    // Camera rotation update loop
    const updateCamera = () => {
      if (!gameEngineRef.current || useMinimalEngine) return;

      const engine = gameEngineRef.current as GameEngine;
      
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
        engine.rotateCamera(-cameraRotationSpeed);
      }
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
        engine.rotateCamera(cameraRotationSpeed);
      }

      // Update health bar screen positions based on their world positions
      setHealthBars(prev => {
        return prev.map(healthBar => {
          const worldPos = healthBarEntities.current.get(healthBar.id);
          if (worldPos) {
            const screenPos = getScreenPosition(worldPos);
            return {
              ...healthBar,
              x: screenPos.x,
              y: screenPos.y
            };
          }
          return healthBar;
        });
      });

      requestAnimationFrame(updateCamera);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Add mouse move handler for cursor feedback
    const handleMouseMove = (event: MouseEvent) => {
      const container = gameContainerRef.current;
      const engine = gameEngineRef.current as GameEngine;
      if (!container || !engine || useMinimalEngine) return;
      
      const rect = container.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Check what's under the cursor
      const clickedNPC = engine.getClickedNPC(mouseX, mouseY, rect.width, rect.height);
      const clickedTree = engine.getClickedTree(mouseX, mouseY, rect.width, rect.height);
      const clickedRock = engine.getClickedRock(mouseX, mouseY, rect.width, rect.height);
      
      // Handle NPC hovering and outline
      if (clickedNPC && clickedNPC !== hoveredNPC) {
        // Remove outline from previous NPC
        if (hoveredNPC) {
          engine.setNPCOutline(hoveredNPC, false);
        }
        // Add outline to new NPC
        engine.setNPCOutline(clickedNPC, true);
        setHoveredNPC(clickedNPC);
      } else if (!clickedNPC && hoveredNPC) {
        // Remove outline when not hovering any NPC
        engine.setNPCOutline(hoveredNPC, false);
        setHoveredNPC(null);
      }
      
      if (clickedNPC) {
        // Show attack cursor for NPCs
        setCursorFeedback({ x: mouseX, y: mouseY, type: 'attack' });
      } else if (clickedTree || clickedRock) {
        // Show interact cursor for resources
        setCursorFeedback({ x: mouseX, y: mouseY, type: 'interact' });
      } else {
        // Clear cursor feedback
        setCursorFeedback({ x: 0, y: 0, type: null });
      }
    };
    
    const container = gameContainerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    updateCamera();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [cameraRotationSpeed, useMinimalEngine, getScreenPosition, hoveredNPC]);

  // Tutorial progression checking
  useEffect(() => {
    if (!tutorialSystemRef.current || !gameEngineRef.current || useMinimalEngine) return;
    
    const engine = gameEngineRef.current as GameEngine;
    const checkProgression = () => {
      const playerPos = engine.getPlayerPosition();
      tutorialSystemRef.current?.checkStepProgression({
        x: playerPos.x,
        y: playerPos.y,
        z: playerPos.z
      });
    };
    
    const interval = setInterval(checkProgression, 1000);
    return () => clearInterval(interval);
  }, [useMinimalEngine]);

  // Handle mouse clicks (movement, NPC interaction, and context menus)
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!gameEngineRef.current || useMinimalEngine) return;
      
      const container = gameContainerRef.current;
      if (!container) return;

      // Close any open context menu
      setContextMenu({x: 0, y: 0, show: false});

      const engine = gameEngineRef.current as GameEngine;
      const rect = container.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Show click feedback
      setClickIndicator({x: mouseX, y: mouseY, show: true});
      setTimeout(() => setClickIndicator(prev => ({...prev, show: false})), 500);

      // First check if we clicked a dropped item for pickup
      const clickedDroppedItem = engine.getClickedDroppedItem(mouseX, mouseY, rect.width, rect.height);
      if (clickedDroppedItem) {
        const dropData = clickedDroppedItem.userData.dropData;
        console.log(`Clicked dropped item: ${dropData.name} x${dropData.quantity}`);
        
        // Move to item and pick it up
        const itemPos = clickedDroppedItem.position.clone();
        engine.movePlayerTo(itemPos);
        setTargetPosition(itemPos);
        setIsMoving(true);
        
        // Pick up item after reaching it
        setTimeout(() => {
          const success = engine.pickupDroppedItem(clickedDroppedItem);
          if (success) {
            // Show pickup message
            const itemScreenPos = getScreenPosition(clickedDroppedItem.position);
            addFloatingText(`+${dropData.quantity} ${dropData.name}`, 'heal', itemScreenPos.x, itemScreenPos.y);
          } else {
            // Show inventory full message
            const playerPos = engine.getPlayerPosition();
            const playerScreenPos = getScreenPosition(playerPos);
            addFloatingText('Inventory full!', 'miss', playerScreenPos.x, playerScreenPos.y);
          }
        }, 1000);
        
        return;
      }

      // Then check if we clicked an NPC
      const clickedNPC = engine.getClickedNPC(mouseX, mouseY, rect.width, rect.height);
      if (clickedNPC) {
        const npcName = clickedNPC.userData.name;
        
        // Check if we have a spell selected - if so, cast it instead of attacking
        if (selectedSpell) {
          console.log(`Casting ${selectedSpell} on ${npcName}!`);
          
          // Get player stats and inventory for spell casting
          const playerStats = { magic: useGameStore.getState().player.stats.magic };
          const inventory = useGameStore.getState().player.inventory;
          
          // Try to cast the spell
          const success = engine.castSpellOnTarget(selectedSpell, clickedNPC, playerStats, inventory);
          
          if (success) {
            // Add spell animation
            const spellAnimation = {
              id: `spell_${Date.now()}`,
              x: mouseX,
              y: mouseY,
              type: selectedSpell
            };
            setSpellAnimations(prev => [...prev, spellAnimation]);
            
            // Remove animation after 1 second
            setTimeout(() => {
              setSpellAnimations(prev => prev.filter(anim => anim.id !== spellAnimation.id));
            }, 1000);
            
            // Add XP for magic (assuming 10xp per cast for now)
            addExperience('magic', 10);
            
            // Show floating magic XP text
            const playerPos = engine.getPlayerPosition();
            const playerScreenPos = getScreenPosition(playerPos);
            setTimeout(() => {
              addFloatingText(`+10 Magic`, 'xp', playerScreenPos.x, playerScreenPos.y - 60);
            }, 300);
            
            console.log(`Successfully cast ${selectedSpell} on ${npcName}!`);
          } else {
            console.log(`Failed to cast ${selectedSpell} - insufficient runes or invalid target`);
          }
          
          return; // Don't do regular attack if we cast a spell
        }
        
        // Regular attack logic (unchanged)
        console.log(`Left-clicked NPC: ${npcName} - Attacking!`);
        
        // Move to NPC and attack
        const npcPos = clickedNPC.position.clone();
        npcPos.x += 1.5; // Stand close to NPC for combat
        engine.movePlayerTo(npcPos);
        setTargetPosition(npcPos);
        setIsMoving(true);
        
        // Start combat after reaching NPC
        setTimeout(() => {
          const playerStats = useGameStore.getState().getCombatStats();
          const combatStyle = useGameStore.getState().combatStyle;
          // Check if already in combat
          if (engine.isInCombat()) {
            engine.stopCombat();
          }
          
          // Start continuous combat
          engine.startCombat(clickedNPC, playerStats, combatStyle, (event: CombatEvent) => {
            const { type, result, npc } = event;
            
            if (type === 'player_attack') {
              const combatResult = result;
              const npcName = npc.userData.name || 'NPC';
          
          if (combatResult.success) {
            // Note: message variable is used for debugging but not displayed directly
            // The actual UI feedback is shown through floating text
            const debugMessage = `💥 You hit the ${npcName} for ${combatResult.damage} damage!`;
            
            if (combatResult.npcDead) {
              console.log(debugMessage + `\n\n� You have defeated the ${npcName}!`);
            }
            
            // Add experience gained
            const xp = combatResult.xp;
            if (xp) {
              // Apply XP to game store
              if (xp.attack > 0) addExperience('attack', xp.attack);
              if (xp.strength > 0) addExperience('strength', xp.strength);
              if (xp.defense > 0) addExperience('defense', xp.defense);
              if (xp.hits > 0) addExperience('hits', xp.hits);
            
                // Get screen position for floating text
                const npcScreenPos = getScreenPosition(npc.position);
                const playerPos = engine.getPlayerPosition();
                const playerScreenPos = getScreenPosition(playerPos);
                
                // Show damage number above NPC
                addFloatingText(`${combatResult.damage}`, 'damage', npcScreenPos.x, npcScreenPos.y - 20);
                
                // Show XP gains over player's head with slight delay and offset
                const xpMessages: string[] = [];
                if (xp.attack > 0) xpMessages.push(`+${xp.attack} Att`);
                if (xp.strength > 0) xpMessages.push(`+${xp.strength} Str`);
                if (xp.defense > 0) xpMessages.push(`+${xp.defense} Def`);
                if (xp.hits > 0) xpMessages.push(`+${xp.hits} HP`);
                
                xpMessages.forEach((msg, index) => {
                  setTimeout(() => {
                    addFloatingText(msg, 'xp', playerScreenPos.x + (index * 30 - 45), playerScreenPos.y - 40);
                  }, 300 + index * 100);
                });
            }
            // Update health bar for NPC - position above the NPC's head
            const npcStats = clickedNPC.userData.stats;
            const healthBarPosition = npc.position.clone();
            healthBarPosition.y += 1.2; // Offset above the NPC's head
            updateHealthBar(
              `npc_${clickedNPC.id}`, 
              npcName, 
              npcStats.currentHits || 0, 
              npcStats.hits || 10, 
              healthBarPosition
            );
            
            if (combatResult.npcDead) {
              // Remove health bar when NPC dies
              setTimeout(() => {
                removeHealthBar(`npc_${clickedNPC.id}`);
              }, 2000);
            }
          } else {
            // Get screen position for floating text
            const npcScreenPos = getScreenPosition(npc.position);
            // Show miss text
            addFloatingText('Miss!', 'miss', npcScreenPos.x, npcScreenPos.y - 20);
          }
        } else if (type === 'npc_attack') {
          // Handle NPC attacking player
          const attackResult = result;
          const playerPos = engine.getPlayerPosition();
          const playerScreenPos = getScreenPosition(playerPos);
          
          if (attackResult.success) {
            // Show damage taken by player
            addFloatingText(`${attackResult.damage}`, 'damage', playerScreenPos.x, playerScreenPos.y - 20);
            
            // Update player health bar
            const playerPos = engine.getPlayerPosition();
            updateHealthBar(
              'player',
              'You',
              playerStats.currentHits,
              playerStats.hits,
              playerPos,
              true
            );
            
            if (attackResult.playerDead) {
              // Show death message
              setTimeout(() => {
                addFloatingText('You have died!', 'damage', playerScreenPos.x, playerScreenPos.y + 20);
              }, 500);
              
              // Remove player health bar
              setTimeout(() => {
                removeHealthBar('player');
              }, 3000);
            }
          } else {
            // NPC missed
            addFloatingText('Miss!', 'miss', playerScreenPos.x, playerScreenPos.y - 20);
          }
        }
      });
    }, 1000);
        
        return;
      }

      // Check if we clicked a tree
      const clickedTree = engine.getClickedTree(mouseX, mouseY, rect.width, rect.height);
      if (clickedTree) {
        console.log('Clicked tree - starting woodcutting');
        
        // Move to tree and start woodcutting
        const treePos = clickedTree.position.clone();
        treePos.x += 2; // Stand next to tree
        engine.movePlayerTo(treePos);
        setTargetPosition(treePos);
        setIsMoving(true);
        
        // Start woodcutting after reaching tree
        setTimeout(() => {
          handleWoodcutting(clickedTree);
        }, 1000);
        
        return;
      }

      // Check if we clicked a rock
      const clickedRock = engine.getClickedRock(mouseX, mouseY, rect.width, rect.height);
      if (clickedRock) {
        console.log('Clicked rock - starting mining');
        
        // Move to rock and start mining
        const rockPos = clickedRock.position.clone();
        rockPos.x += 2; // Stand next to rock
        engine.movePlayerTo(rockPos);
        setTargetPosition(rockPos);
        setIsMoving(true);
        
        // Start mining after reaching rock
        setTimeout(() => {
          handleMining(clickedRock);
        }, 1000);
        
        return;
      }

      // Check if we clicked a fishing spot
      const clickedFishingSpot = engine.getClickedFishingSpot(mouseX, mouseY, rect.width, rect.height);
      if (clickedFishingSpot) {
        console.log('Clicked fishing spot - starting fishing');
        
        // Move to fishing spot and start fishing
        const spotPos = clickedFishingSpot.position.clone();
        spotPos.x += 2; // Stand next to spot
        engine.movePlayerTo(spotPos);
        setTargetPosition(spotPos);
        setIsMoving(true);
        
        // Start fishing after reaching spot
        setTimeout(() => {
          handleFishing(clickedFishingSpot);
        }, 1000);
        
        return;
      }

      // If no interactive object clicked, move to ground
      const groundPos = engine.getGroundPosition(mouseX, mouseY, rect.width, rect.height);
      if (groundPos) {
        // Stop combat if player moves away
        if (engine.isInCombat()) {
          engine.stopCombat();
        }
        
        // Start smooth movement to clicked position
        engine.movePlayerTo(groundPos);
        setTargetPosition(groundPos);
        setIsMoving(true);
      }
    };

    const handleRightClick = (event: MouseEvent) => {
      event.preventDefault(); // Prevent browser context menu
      
      if (!gameEngineRef.current || useMinimalEngine) return;
      
      const container = gameContainerRef.current;
      if (!container) return;

      const engine = gameEngineRef.current as GameEngine;
      const rect = container.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Check if we right-clicked an NPC
      const clickedNPC = engine.getClickedNPC(mouseX, mouseY, rect.width, rect.height);
      if (clickedNPC) {
        // Show context menu
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          show: true,
          npc: clickedNPC
        });
        return;
      }

      // Check if we right-clicked a dropped item
      const clickedDroppedItem = engine.getClickedDroppedItem(mouseX, mouseY, rect.width, rect.height);
      if (clickedDroppedItem) {
        // Show item context menu
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          show: true,
          npc: clickedDroppedItem // Store as npc for simplicity
        });
        return;
      }

      // Check if we right-clicked a tree
      const clickedTree = engine.getClickedTree(mouseX, mouseY, rect.width, rect.height);
      if (clickedTree) {
        // Show tree context menu
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          show: true,
          npc: clickedTree
        });
        return;
      }
    };

    const container = gameContainerRef.current;
    if (container) {
      container.addEventListener('click', handleClick);
      container.addEventListener('contextmenu', handleRightClick);
      container.style.cursor = 'pointer';

    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('contextmenu', handleRightClick);
    };
  }
}, [setTargetPosition, setIsMoving, addExperience, getScreenPosition, handleFishing, handleMining, handleWoodcutting, useMinimalEngine, addFloatingText, updateHealthBar, selectedSpell]);  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleDocumentClick = () => {
      setContextMenu({x: 0, y: 0, show: false});
    };

    if (contextMenu.show) {
      document.addEventListener('click', handleDocumentClick);
      return () => document.removeEventListener('click', handleDocumentClick);
    }
  }, [contextMenu.show]);

  // Prayer drain and special energy regeneration update loop
  useEffect(() => {
    const { updatePrayerDrain, updateSpecialAttackEnergy } = useGameStore.getState();
    let lastTime = Date.now();

    const updatePrayerLoop = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      // Update prayer drain and special energy regeneration
      updatePrayerDrain(deltaTime);
      updateSpecialAttackEnergy(deltaTime);

      // Continue the loop
      requestAnimationFrame(updatePrayerLoop);
    };

    updatePrayerLoop();
    
    // No cleanup needed for requestAnimationFrame loop as it doesn't need to be cancelled
  }, []);

  // Handle context menu actions
  const handleContextAction = (action: string, npc: THREE.Object3D) => {
    setContextMenu({x: 0, y: 0, show: false});
    
    if (!gameEngineRef.current || useMinimalEngine) return;
    const engine = gameEngineRef.current as GameEngine;

    // Handle tutorial island interactions
    if (tutorialSystemRef.current && npc.userData) {
      if (npc.userData.type === 'npc' && action === 'talk') {
        tutorialSystemRef.current.handleNPCInteraction(npc.userData.id);
        return;
      }
      
      if (npc.userData.type === 'interactable') {
        if (tutorialSystemRef.current.canInteractWith(npc.userData.id)) {
          tutorialSystemRef.current.handleInteraction(npc.userData.id);
          return;
        }
      }
    }

    // Handle dropped item interactions
    if (npc.userData && npc.userData.type === 'dropped_item') {
      const dropData = npc.userData.dropData;
      
      switch (action) {
        case 'take': {
          // Move to item and pick it up
          const itemPos = npc.position.clone();
          engine.movePlayerTo(itemPos);
          setTargetPosition(itemPos);
          setIsMoving(true);
          
          setTimeout(() => {
            const success = engine.pickupDroppedItem(npc as THREE.Mesh);
            if (success) {
              // Show pickup message
              const itemScreenPos = getScreenPosition(npc.position);
              if (dropData) {
                addFloatingText(`+${dropData.quantity} ${dropData.name}`, 'heal', itemScreenPos.x, itemScreenPos.y);
              }
            } else {
              // Show inventory full message
              const playerPos = engine.getPlayerPosition();
              const playerScreenPos = getScreenPosition(playerPos);
              addFloatingText('Inventory full!', 'miss', playerScreenPos.x, playerScreenPos.y);
            }
          }, 1000);
          break;
        }
          
        case 'examine': {
          if (dropData) {
            alert(`${dropData.name}: ${dropData.itemId.replace(/_/g, ' ')}`);
          }
          break;
        }
      }
      return;
    }

    if (npc.userData.type === 'tree') {
      if (action === 'chop') {
        const treePos = npc.position.clone();
        treePos.x += 2;
        engine.movePlayerTo(treePos);
        setTargetPosition(treePos);
        setIsMoving(true);
        
        setTimeout(() => {
          // Get screen position for floating text
          const treeScreenPos = getScreenPosition(npc.position);
          const playerPos = engine.getPlayerPosition();
          const playerScreenPos = getScreenPosition(playerPos);
          
          // Apply woodcutting XP to game store
          addExperience('woodcutting', 25);
          
          // Show woodcutting XP over player's head
          addFloatingText('+25 Woodcutting XP', 'xp', playerScreenPos.x, playerScreenPos.y - 30);
          
          // Show logs gained over tree
          setTimeout(() => {
            addFloatingText('+1 Logs', 'heal', treeScreenPos.x, treeScreenPos.y - 50);
          }, 500);
        }, 1000);
      }
      return;
    }

    // Handle building interactions
    if (npc.userData.type === 'building') {
      const buildingType = npc.userData.buildingType;
      const buildingName = npc.userData.name;
      
      switch (action) {
        case 'enter':
          if (buildingType === 'bank') {
            setShowBankPanel(true);
          } else if (buildingType === 'shop') {
            // Get shop items from NPC system
            if (npcSystemRef.current) {
              const shopkeeperNPCs = ['lumbridge_shopkeeper'];
              const shopkeeper = shopkeeperNPCs.find(id => npcSystemRef.current?.getNPC(id));
              
              if (shopkeeper) {
                const npcData = npcSystemRef.current.getNPC(shopkeeper);
                if (npcData && npcData.shopItems) {
                  setCurrentShopItems(npcData.shopItems);
                  setCurrentShopName(buildingName);
                  setShowShopPanel(true);
                }
              }
            }
          }
          break;
          
        case 'examine':
          alert(`This is ${buildingName}.`);
          break;
      }
      return;
    }

    // Handle NPC interactions with new dialogue system
    if (npc.userData.type === 'npc') {
      const npcId = npc.userData.npcId;
      
      switch (action) {
        case 'talk':
          if (npcSystemRef.current) {
            const npcData = npcSystemRef.current.getNPC(npcId);
            if (npcData && npcData.dialogue.length > 0) {
              // Use first dialogue node for now - could be expanded to full dialogue system
              const firstDialogue = npcData.dialogue[0];
              
              // Simple dialogue display - could be enhanced with proper dialogue UI
              let dialogueText = `${npcData.name}: "${firstDialogue.text}"`;
              
              if (firstDialogue.options.length > 0) {
                dialogueText += '\n\nOptions:';
                firstDialogue.options.forEach((option, index) => {
                  dialogueText += `\n${index + 1}. ${option.text}`;
                });
                
                // Handle simple dialogue options
                const choice = prompt(dialogueText + '\n\nEnter your choice (1-' + firstDialogue.options.length + '):');
                const choiceIndex = parseInt(choice || '1') - 1;
                
                if (choiceIndex >= 0 && choiceIndex < firstDialogue.options.length) {
                  const selectedOption = firstDialogue.options[choiceIndex];
                  
                  // Handle option actions
                  switch (selectedOption.action) {
                    case 'shop':
                      if (npcData.shopItems) {
                        setCurrentShopItems(npcData.shopItems);
                        setCurrentShopName(npcData.name);
                        setShowShopPanel(true);
                      }
                      break;
                      
                    case 'bank':
                      setShowBankPanel(true);
                      break;
                      
                    case 'close':
                      // Do nothing, dialogue closes
                      break;
                  }
                }
              } else {
                alert(dialogueText);
              }
            }
          }
          break;
      }
      return;
    }

    // Handle NPC actions (legacy system for existing NPCs)
    const npcPos = npc.position.clone();
    
    switch (action) {
      case 'talk':
        npcPos.x += 1;
        engine.movePlayerTo(npcPos);
        setTargetPosition(npcPos);
        setIsMoving(true);
        
        setTimeout(() => {
          // Use chat bubble instead of alert
          engine.interactWithNPC(npc);
        }, 1000);
        break;
        
      case 'attack':
        npcPos.x += 1.5;
        engine.movePlayerTo(npcPos);
        setTargetPosition(npcPos);
        setIsMoving(true);
        
        setTimeout(() => {
          const playerStats = useGameStore.getState().getCombatStats();
          const combatStyle = useGameStore.getState().combatStyle;
          // Check if already in combat
          if (engine.isInCombat()) {
            engine.stopCombat();
          }
          
          // Start continuous combat
          engine.startCombat(npc, playerStats, combatStyle, (event: CombatEvent) => {
            const { type, result, npc: targetNpc } = event;
            
            if (type === 'player_attack') {
              const combatResult = result;
              const npcName = targetNpc.userData.name || 'NPC';
              
              if (combatResult.success) {
            // Note: message variable is used for debugging but not displayed directly
            // The actual UI feedback is shown through floating text
            const debugMessage = `💥 You hit the ${npcName} for ${combatResult.damage} damage!`;
            
            if (combatResult.npcDead) {
              console.log(debugMessage + `\n\n� You have defeated the ${npcName}!`);
            }
            
            // Add experience gained
            const xp = combatResult.xp;
            if (xp) {
              // Apply XP to game store
              if (xp.attack > 0) addExperience('attack', xp.attack);
              if (xp.strength > 0) addExperience('strength', xp.strength);
              if (xp.defense > 0) addExperience('defense', xp.defense);
              if (xp.hits > 0) addExperience('hits', xp.hits);
            
                // Get screen position for floating text
                const npcScreenPos = getScreenPosition(npc.position);
                const playerPos = engine.getPlayerPosition();
                const playerScreenPos = getScreenPosition(playerPos);
                
                // Show damage number above NPC
                addFloatingText(`${combatResult.damage}`, 'damage', npcScreenPos.x, npcScreenPos.y - 20);
                
                // Show XP gains over player's head with slight delay and offset
                const xpMessages: string[] = [];
                if (xp.attack > 0) xpMessages.push(`+${xp.attack} Att`);
                if (xp.strength > 0) xpMessages.push(`+${xp.strength} Str`);
                if (xp.defense > 0) xpMessages.push(`+${xp.defense} Def`);
                if (xp.hits > 0) xpMessages.push(`+${xp.hits} HP`);
                
                xpMessages.forEach((msg, index) => {
                  setTimeout(() => {
                    addFloatingText(msg, 'xp', playerScreenPos.x + (index * 30 - 45), playerScreenPos.y - 40);
                  }, 300 + index * 100);
                });
            }
            // Update health bar for NPC - position above the NPC's head
            const npcScreenPos = getScreenPosition(npc.position);
            const npcStats = npc.userData.stats;
            const healthBarPosition = targetNpc.position.clone();
            healthBarPosition.y += 1.2; // Offset above the NPC's head
            updateHealthBar(
              `npc_${npc.id}`, 
              npcName, 
              npcStats.currentHits || 0, 
              npcStats.hits || 10, 
              healthBarPosition
            );
            
            if (combatResult.npcDead) {
                  // Show death message
                  setTimeout(() => {
                    addFloatingText(`${npcName} defeated!`, 'xp', npcScreenPos.x, npcScreenPos.y + 20);
                  }, 500);
                  
                  // Remove health bar when NPC dies
                  setTimeout(() => {
                    removeHealthBar(`npc_${npc.id}`);
                  }, 2000);
                }
              } else {
                // Get screen position for floating text
                const npcScreenPos = getScreenPosition(targetNpc.position);
                // Show miss text
                addFloatingText('Miss!', 'miss', npcScreenPos.x, npcScreenPos.y - 20);
              }
            } else if (type === 'npc_attack') {
              // Handle NPC attacking player
              const attackResult = result;
              const playerPos = engine.getPlayerPosition();
              const playerScreenPos = getScreenPosition(playerPos);
              
              if (attackResult.success) {
                // Update player health in store
                updateCurrentHits(attackResult.damage);
                
                // Get updated player stats
                const updatedPlayerStats = useGameStore.getState().getCombatStats();
                
                // Show damage taken by player
                addFloatingText(`${attackResult.damage}`, 'damage', playerScreenPos.x, playerScreenPos.y - 20);
                
                // Update player health bar - position above the player's head
                const playerPos = engine.getPlayerPosition();
                const playerHealthBarPosition = playerPos.clone();
                playerHealthBarPosition.y += 1.2; // Offset above the player's head
                updateHealthBar(
                  'player',
                  'You',
                  updatedPlayerStats.currentHits,
                  updatedPlayerStats.hits,
                  playerHealthBarPosition,
                  true
                );
                
                if (attackResult.playerDead) {
                  // Show death message
                  setTimeout(() => {
                    addFloatingText('You have died!', 'damage', playerScreenPos.x, playerScreenPos.y + 20);
                  }, 500);
                  
                  // Remove player health bar
                  setTimeout(() => {
                    removeHealthBar('player');
                  }, 3000);
                }
              } else {
                // NPC missed
                addFloatingText('Miss!', 'miss', playerScreenPos.x, playerScreenPos.y - 20);
              }
            }
          });
        }, 1000);
        break;
        
      case 'examine': {
        const npcName = npc.userData.name;
        let examineText = `It's a ${npcName}.`;
        
        if (npcName === 'Goblin') examineText = "A small, green, and very ugly humanoid.";
        else if (npcName === 'Cow') examineText = "A dairy cow. Holy cow!";
        else if (npcName === 'Chicken') examineText = "A farmyard chicken.";
        else if (npcName === 'Rat') examineText = "Yuck, a rat!";
        
        alert(examineText);
        break;
      }
    }
  };

  // Force loaded state for testing
  const forceLoaded = true;

  console.log('Game component render:', { hasError, isLoaded, forceLoaded, loadingStep });

  if (hasError) {
    return (
      <div className="game-error">
        <h2>Failed to Initialize Game</h2>
        <p>{errorMessage}</p>
        <p>Your browser may not support WebGL or Three.js</p>
        <p>Please try:</p>
        <ul>
          <li>Using a modern browser (Chrome, Firefox, Safari, Edge)</li>
          <li>Enabling hardware acceleration</li>
          <li>Updating your graphics drivers</li>
        </ul>
      </div>
    );
  }

  if (!isLoaded && !forceLoaded) {
    return (
      <div className="game-loading">
        <h2>Loading RuneScape Classic...</h2>
        <p>{loadingStep}</p>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div 
        ref={gameContainerRef}
        className="game-canvas"
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          background: '#000',
          overflow: 'hidden'
        }}
      />
      
      {/* Click feedback indicator */}
      {clickIndicator.show && (
        <div style={{
          position: 'absolute',
          left: clickIndicator.x - 10,
          top: clickIndicator.y - 10,
          width: '20px',
          height: '20px',
          border: '2px solid #ffff00',
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'clickPulse 0.5s ease-out',
          zIndex: 1000
        }} />
      )}
      
      {/* RuneScape-style context menu */}
      {contextMenu.show && (
        <div style={{
          position: 'fixed',
          left: contextMenu.x,
          top: contextMenu.y,
          background: '#c6b895',
          border: '2px outset #d4c4a8',
          borderRadius: '0',
          fontFamily: 'serif',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#000',
          zIndex: 2000,
          minWidth: '120px',
          boxShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {contextMenu.npc?.userData?.type === 'dropped_item' ? (
            <>
              <div 
                onClick={() => contextMenu.npc && handleContextAction('take', contextMenu.npc)}
                style={{
                  padding: '4px 8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #a69982'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#d4c4a8'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
              >
                Take {contextMenu.npc?.userData.dropData?.name}
              </div>
              <div 
                onClick={() => contextMenu.npc && handleContextAction('examine', contextMenu.npc)}
                style={{
                  padding: '4px 8px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#d4c4a8'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
              >
                Examine
              </div>
            </>
          ) : contextMenu.npc?.userData.type === 'tree' ? (
            <>
              <div 
                onClick={() => contextMenu.npc && handleContextAction('chop', contextMenu.npc)}
                style={{
                  padding: '4px 8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #a69982'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#d4c4a8'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
              >
                Chop Tree
              </div>
              <div 
                onClick={() => contextMenu.npc && handleContextAction('examine', contextMenu.npc)}
                style={{
                  padding: '4px 8px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#d4c4a8'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
              >
                Examine
              </div>
            </>
          ) : (
            <>
              <div 
                onClick={() => contextMenu.npc && handleContextAction('talk', contextMenu.npc)}
                style={{
                  padding: '4px 8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #a69982'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#d4c4a8'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
              >
                Talk
              </div>
              <div 
                onClick={() => contextMenu.npc && handleContextAction('attack', contextMenu.npc)}
                style={{
                  padding: '4px 8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #a69982'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#d4c4a8'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
              >
                Attack
              </div>
              <div 
                onClick={() => contextMenu.npc && handleContextAction('examine', contextMenu.npc)}
                style={{
                  padding: '4px 8px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#d4c4a8'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
              >
                Examine
              </div>
            </>
          )}
        </div>
      )}
      
      {/* RuneScape Classic UI */}
      <GameInterface 
        onDropItem={handleDropItem} 
        addFloatingText={addFloatingText} 
        getScreenPosition={(pos) => getScreenPosition(new THREE.Vector3(pos.x, pos.y, pos.z))} 
      />
      
      {/* Combat UI with floating damage and health bars */}
      <CombatUI 
        floatingTexts={floatingTexts}
        healthBars={healthBars}
        onTextComplete={removeFloatingText}
      />
      
      {/* Spell animations */}
      {spellAnimations.map(animation => (
        <div 
          key={animation.id}
          style={{
            position: 'absolute',
            left: animation.x - 25,
            top: animation.y - 25,
            width: '50px',
            height: '50px',
            pointerEvents: 'none',
            zIndex: 1500,
            animation: 'spellCast 1s ease-out forwards'
          }}
        >
          {animation.type === 'wind_strike' && (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(192,255,192,0.8) 0%, rgba(128,255,128,0.6) 30%, rgba(64,192,64,0.4) 60%, transparent 100%)',
              borderRadius: '50%',
              border: '2px solid #40ff40',
              boxShadow: '0 0 20px #40ff40'
            }} />
          )}
        </div>
      ))}
      
      {/* Cursor feedback */}
      {cursorFeedback.type && (
        <div style={{
          position: 'absolute',
          left: cursorFeedback.x - 8,
          top: cursorFeedback.y - 8,
          width: '16px',
          height: '16px',
          pointerEvents: 'none',
          zIndex: 1600,
          borderRadius: '50%',
          border: `2px solid ${cursorFeedback.type === 'attack' ? '#ff4040' : '#ffff40'}`,
          animation: 'cursorPulse 1.6s ease-in-out infinite'
        }} />
      )}
      {!useMinimalEngine && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '250px',
          color: 'white',
          background: 'rgba(0,0,0,0.5)',
          padding: '8px',
          fontFamily: 'monospace',
          fontSize: '10px'
        }}>
          <p>A/D: Rotate camera</p>
          <p>Left-click: Move/Attack</p>
          <p>Right-click: Context menu</p>
          <p>RuneScape Classic!</p>
          <button 
            onClick={() => setShowTutorial(!showTutorial)}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              background: showTutorial ? '#e74c3c' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            {showTutorial ? 'Exit Tutorial' : 'Start Tutorial'}
          </button>
        </div>
      )}
      
      {/* CSS for animations */}
      <style>{`
        @keyframes clickPulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes spellCast {
          0% {
            transform: scale(0.2);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes cursorPulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
        }
      `}</style>
      
      {/* Bank Panel */}
      {showBankPanel && (
        <BankPanel 
          onClose={() => setShowBankPanel(false)}
        />
      )}
      
      {/* Shop Panel */}
      {showShopPanel && (
        <ShopPanel 
          shopItems={currentShopItems}
          shopName={currentShopName}
          onClose={() => setShowShopPanel(false)}
        />
      )}
      
      {/* Tutorial Panel */}
      {showTutorial && tutorialSystemRef.current && (
        <TutorialPanel 
          tutorialSystem={tutorialSystemRef.current}
        />
      )}
    </div>
  );
};

export default Game;
