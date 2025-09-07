import * as THREE from 'three';

// Dialogue interfaces
export interface DialogueOption {
  text: string;
  action?: 'shop' | 'bank' | 'quest' | 'info' | 'close';
  nextDialogue?: string;
  requirements?: {
    level?: { [skill: string]: number };
    items?: { id: string; quantity: number }[];
    questComplete?: string[];
  };
}

export interface DialogueNode {
  id: string;
  text: string;
  options: DialogueOption[];
  isEnd?: boolean;
}

export interface NPCData {
  id: string;
  name: string;
  type: 'merchant' | 'banker' | 'citizen' | 'guard' | 'quest_giver';
  position: THREE.Vector3;
  color: number;
  dialogue: DialogueNode[];
  shopItems?: ShopItem[];
  respawnTime?: number;
}

export interface ShopItem {
  itemId: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  maxStock: number;
}

export class NPCSystem {
  private npcs: Map<string, NPCData> = new Map();
  private npcMeshes: Map<string, THREE.Group> = new Map();
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeNPCs();
  }

  /**
   * Initialize all NPCs
   */
  private initializeNPCs(): void {
    // Lumbridge NPCs
    const shopkeeper: NPCData = {
      id: 'lumbridge_shopkeeper',
      name: 'Shop Keeper',
      type: 'merchant',
      position: new THREE.Vector3(-8, 1, -3),
      color: 0x0066CC,
      dialogue: [
        {
          id: 'greeting',
          text: "Welcome to my general store! Would you like to see what I have for sale?",
          options: [
            { text: "Yes, I'd like to see your wares.", action: 'shop' },
            { text: "Tell me about your store.", nextDialogue: 'info' },
            { text: "Not right now, thanks.", action: 'close' }
          ]
        },
        {
          id: 'info',
          text: "I sell all sorts of useful items for adventurers. Tools, food, basic supplies - you name it!",
          options: [
            { text: "Can I see your shop?", action: 'shop' },
            { text: "Thanks for the information.", action: 'close' }
          ]
        }
      ],
      shopItems: [
        { itemId: 'bread', name: 'Bread', buyPrice: 12, sellPrice: 4, stock: 10, maxStock: 10 },
        { itemId: 'tinderbox', name: 'Tinderbox', buyPrice: 1, sellPrice: 1, stock: 5, maxStock: 5 },
        { itemId: 'rope', name: 'Rope', buyPrice: 18, sellPrice: 6, stock: 3, maxStock: 3 },
        { itemId: 'knife', name: 'Knife', buyPrice: 6, sellPrice: 2, stock: 2, maxStock: 2 },
        { itemId: 'chisel', name: 'Chisel', buyPrice: 14, sellPrice: 4, stock: 2, maxStock: 2 }
      ]
    };

    const banker: NPCData = {
      id: 'lumbridge_banker',
      name: 'Banker',
      type: 'banker',
      position: new THREE.Vector3(-15, 1, -3),
      color: 0x800080,
      dialogue: [
        {
          id: 'greeting',
          text: "Good day! Welcome to the Bank of Lumbridge. How may I help you?",
          options: [
            { text: "I'd like to access my bank account.", action: 'bank' },
            { text: "What is a bank?", nextDialogue: 'info' },
            { text: "Nothing right now.", action: 'close' }
          ]
        },
        {
          id: 'info',
          text: "A bank is a secure place to store your items. You can deposit items here and withdraw them later from any bank in the world!",
          options: [
            { text: "That sounds useful! Let me access my account.", action: 'bank' },
            { text: "I'll come back later.", action: 'close' }
          ]
        }
      ]
    };

    const duke: NPCData = {
      id: 'duke_horacio',
      name: 'Duke Horacio',
      type: 'quest_giver',
      position: new THREE.Vector3(0, 4, -15),
      color: 0xFF6B35,
      dialogue: [
        {
          id: 'greeting',
          text: "Greetings, brave adventurer! I am Duke Horacio, ruler of Lumbridge. Welcome to my castle!",
          options: [
            { text: "Thank you, Your Grace. Do you have any tasks for me?", nextDialogue: 'quests' },
            { text: "Tell me about Lumbridge.", nextDialogue: 'info' },
            { text: "I must be going.", action: 'close' }
          ]
        },
        {
          id: 'info',
          text: "Lumbridge is a peaceful town, perfect for new adventurers. We have a bank, shops, and many friendly folk.",
          options: [
            { text: "Do you have any quests for me?", nextDialogue: 'quests' },
            { text: "Thank you for the information.", action: 'close' }
          ]
        },
        {
          id: 'quests',
          text: "I'm afraid I don't have any tasks at the moment. Perhaps you could speak with the cook - I heard she needs help!",
          options: [
            { text: "I'll go speak with her.", action: 'close' },
            { text: "Thanks for the suggestion.", action: 'close' }
          ]
        }
      ]
    };

    const priest: NPCData = {
      id: 'father_aereck',
      name: 'Father Aereck',
      type: 'citizen',
      position: new THREE.Vector3(15, 1, -3),
      color: 0x8B4513,
      dialogue: [
        {
          id: 'greeting',
          text: "Blessings upon you, child. Welcome to the Lumbridge Church. May I help you find peace?",
          options: [
            { text: "Can you heal me?", nextDialogue: 'healing' },
            { text: "Tell me about prayer.", nextDialogue: 'prayer_info' },
            { text: "I'm just looking around.", action: 'close' }
          ]
        },
        {
          id: 'healing',
          text: "I can restore your prayer points, but your health must be healed through food or rest.",
          options: [
            { text: "Please restore my prayer.", action: 'close' },
            { text: "Tell me about prayer.", nextDialogue: 'prayer_info' },
            { text: "Thank you.", action: 'close' }
          ]
        },
        {
          id: 'prayer_info',
          text: "Prayer is a powerful skill that allows you to commune with the gods and gain their blessings in combat.",
          options: [
            { text: "How do I train prayer?", nextDialogue: 'prayer_training' },
            { text: "Interesting, thank you.", action: 'close' }
          ]
        },
        {
          id: 'prayer_training',
          text: "You can train prayer by burying bones. Each bone buried will grant you prayer experience.",
          options: [
            { text: "Thank you for the advice.", action: 'close' }
          ]
        }
      ]
    };

    // Add NPCs to the system
    this.npcs.set('lumbridge_shopkeeper', shopkeeper);
    this.npcs.set('lumbridge_banker', banker);
    this.npcs.set('duke_horacio', duke);
    this.npcs.set('father_aereck', priest);
  }

  /**
   * Create NPC mesh
   */
  public createNPCMesh(npcData: NPCData): THREE.Group {
    const npcGroup = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: npcData.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    body.castShadow = true;
    npcGroup.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.25);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBC4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.75;
    head.castShadow = true;
    npcGroup.add(head);

    // Different accessories based on NPC type
    switch (npcData.type) {
      case 'banker':
        // Add hat
        const hatGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.3);
        const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 2.1;
        npcGroup.add(hat);
        break;
        
      case 'merchant':
        // Add apron
        const apronGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.1);
        const apronMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const apron = new THREE.Mesh(apronGeometry, apronMaterial);
        apron.position.set(0, 0.75, 0.35);
        npcGroup.add(apron);
        break;
        
      case 'quest_giver':
        // Add crown
        const crownGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.2);
        const crownMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.y = 2.15;
        npcGroup.add(crown);
        break;
    }

    // Store NPC data
    npcGroup.userData = {
      type: 'npc',
      npcId: npcData.id,
      name: npcData.name,
      npcType: npcData.type,
      canTalk: true,
      dialogue: npcData.dialogue,
      shopItems: npcData.shopItems
    };

    npcGroup.position.copy(npcData.position);
    return npcGroup;
  }

  /**
   * Spawn all NPCs for a town
   */
  public spawnTownNPCs(townId: string): void {
    if (townId === 'lumbridge') {
      // Spawn Lumbridge NPCs
      const npcIds = ['lumbridge_shopkeeper', 'lumbridge_banker', 'duke_horacio', 'father_aereck'];
      
      npcIds.forEach(npcId => {
        const npcData = this.npcs.get(npcId);
        if (npcData) {
          const npcMesh = this.createNPCMesh(npcData);
          this.scene.add(npcMesh);
          this.npcMeshes.set(npcId, npcMesh);
        }
      });
    }
  }

  /**
   * Remove all NPCs from scene
   */
  public clearAllNPCs(): void {
    for (const npcMesh of this.npcMeshes.values()) {
      this.scene.remove(npcMesh);
    }
    this.npcMeshes.clear();
  }

  /**
   * Get NPC data by ID
   */
  public getNPC(npcId: string): NPCData | undefined {
    return this.npcs.get(npcId);
  }

  /**
   * Get dialogue node by ID for an NPC
   */
  public getDialogueNode(npcId: string, nodeId: string): DialogueNode | undefined {
    const npc = this.npcs.get(npcId);
    if (!npc) return undefined;
    
    return npc.dialogue.find(node => node.id === nodeId);
  }

  /**
   * Get shop items for merchant NPC
   */
  public getShopItems(npcId: string): ShopItem[] | undefined {
    const npc = this.npcs.get(npcId);
    return npc?.shopItems;
  }

  /**
   * Update shop stock
   */
  public updateShopStock(npcId: string, itemId: string, change: number): void {
    const npc = this.npcs.get(npcId);
    if (!npc || !npc.shopItems) return;

    const item = npc.shopItems.find(item => item.itemId === itemId);
    if (item) {
      item.stock = Math.max(0, Math.min(item.maxStock, item.stock + change));
    }
  }

  /**
   * Get all NPCs
   */
  public getAllNPCs(): Map<string, NPCData> {
    return this.npcs;
  }
}
