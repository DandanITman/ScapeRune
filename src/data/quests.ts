import type { Quest } from '../types/quest';

export const COOKS_ASSISTANT: Quest = {
  id: 'cooks_assistant',
  name: "Cook's Assistant",
  description: "The cook in Lumbridge castle's kitchen needs help making a cake for the Duke's birthday party.",
  difficulty: 'Beginner',
  questPoints: 1,
  category: 'Free',
  released: 'January 2001',
  originalLength: 'Short',
  startNpcId: 'cook',
  requirements: [],
  rewards: [
    {
      type: 'experience',
      skill: 'cooking',
      amount: 300
    },
    {
      type: 'money',
      amount: 25
    },
    {
      type: 'access',
      accessType: 'feature',
      accessId: 'lumbridge_kitchen'
    }
  ],
  stages: [
    {
      id: 'talk_to_cook',
      name: 'Talk to the Cook',
      description: 'Speak to the cook in Lumbridge castle kitchen',
      objectives: [
        {
          id: 'initial_talk',
          description: 'Talk to the cook',
          type: 'talk',
          targetId: 'cook',
          targetName: 'Cook',
          quantity: 1,
          currentProgress: 0,
          completed: false
        }
      ],
      dialogue: {
        npcId: 'cook',
        beforeText: "Hello! I'm in a terrible mess. The Duke wants me to make him a birthday cake, but I've forgotten to buy some of the ingredients!",
        afterText: "Great! I need milk, an egg, and flour. Please bring them to me as quickly as you can!"
      },
      autoComplete: true
    },
    {
      id: 'collect_ingredients',
      name: 'Collect Ingredients',
      description: 'Gather milk, an egg, and flour for the cook',
      objectives: [
        {
          id: 'get_milk',
          description: 'Get a bucket of milk (milk a cow)',
          type: 'collect',
          targetId: 'bucket_of_milk',
          targetName: 'Bucket of milk',
          quantity: 1,
          currentProgress: 0,
          completed: false
        },
        {
          id: 'get_egg',
          description: 'Get an egg (from chickens)',
          type: 'collect',
          targetId: 'egg',
          targetName: 'Egg',
          quantity: 1,
          currentProgress: 0,
          completed: false
        },
        {
          id: 'get_flour',
          description: 'Get flour (from wheat at mill)',
          type: 'collect',
          targetId: 'pot_of_flour',
          targetName: 'Pot of flour',
          quantity: 1,
          currentProgress: 0,
          completed: false
        }
      ],
      dialogue: {
        npcId: 'cook',
        beforeText: "Have you brought me the ingredients I need? I need milk, an egg, and flour.",
        afterText: "Perfect! You've got everything I need. Thank you so much!"
      }
    },
    {
      id: 'return_to_cook',
      name: 'Return to Cook',
      description: 'Bring all ingredients back to the cook',
      objectives: [
        {
          id: 'deliver_ingredients',
          description: 'Give the ingredients to the cook',
          type: 'deliver',
          targetId: 'cook',
          targetName: 'Cook',
          quantity: 1,
          currentProgress: 0,
          completed: false
        }
      ],
      dialogue: {
        npcId: 'cook',
        afterText: "Wonderful! I can make the cake now. The Duke will be so pleased! Here's a little something for your trouble."
      },
      autoComplete: true
    }
  ]
};

export const SHEEP_SHEARER: Quest = {
  id: 'sheep_shearer',
  name: 'Sheep Shearer',
  description: 'Help Fred the Farmer gather wool for his spinning wheel.',
  difficulty: 'Beginner',
  questPoints: 1,
  category: 'Free',
  released: 'January 2001',
  originalLength: 'Short',
  startNpcId: 'fred_farmer',
  requirements: [],
  rewards: [
    {
      type: 'experience',
      skill: 'crafting',
      amount: 150
    },
    {
      type: 'money',
      amount: 60
    },
    {
      type: 'item',
      itemId: 'ball_of_wool',
      quantity: 20
    }
  ],
  stages: [
    {
      id: 'talk_to_fred',
      name: 'Talk to Fred the Farmer',
      description: 'Speak to Fred near the sheep pen',
      objectives: [
        {
          id: 'initial_talk',
          description: 'Talk to Fred the Farmer',
          type: 'talk',
          targetId: 'fred_farmer',
          targetName: 'Fred the Farmer',
          quantity: 1,
          currentProgress: 0,
          completed: false
        }
      ],
      dialogue: {
        npcId: 'fred_farmer',
        beforeText: "I'm afraid I have rather a problem. I am a sheep farmer but I need to get my sheep sheared before I can sell the wool.",
        afterText: "Please could you shear my sheep for me? I need 20 balls of wool."
      },
      autoComplete: true
    },
    {
      id: 'shear_sheep',
      name: 'Shear the Sheep',
      description: 'Shear sheep to collect 20 balls of wool',
      objectives: [
        {
          id: 'collect_wool',
          description: 'Collect 20 balls of wool from sheep',
          type: 'collect',
          targetId: 'ball_of_wool',
          targetName: 'Ball of wool',
          quantity: 20,
          currentProgress: 0,
          completed: false
        }
      ],
      dialogue: {
        npcId: 'fred_farmer',
        beforeText: "How are you getting on with shearing my sheep? I need 20 balls of wool.",
        afterText: "Excellent work! You've got all the wool I need. Here's your payment!"
      }
    },
    {
      id: 'return_to_fred',
      name: 'Return to Fred',
      description: 'Give the wool to Fred the Farmer',
      objectives: [
        {
          id: 'deliver_wool',
          description: 'Give 20 balls of wool to Fred',
          type: 'deliver',
          targetId: 'fred_farmer',
          targetName: 'Fred the Farmer',
          quantity: 20,
          currentProgress: 0,
          completed: false
        }
      ],
      dialogue: {
        npcId: 'fred_farmer',
        afterText: "Thank you so much! Here's some money for your help, and you can keep some wool for yourself."
      },
      autoComplete: true
    }
  ]
};

// Additional quest items that need to be added to inventory
export const QUEST_ITEMS = {
  bucket_of_milk: {
    id: 'bucket_of_milk',
    name: 'Bucket of milk',
    icon: '🥛',
    description: 'A bucket full of creamy milk.',
    type: 'consumable' as const,
    stackable: false,
    value: 5,
    questItem: true
  },
  egg: {
    id: 'egg',
    name: 'Egg',
    icon: '🥚',
    description: 'A fresh chicken egg.',
    type: 'consumable' as const,
    stackable: true,
    value: 3,
    questItem: true
  },
  pot_of_flour: {
    id: 'pot_of_flour',
    name: 'Pot of flour',
    icon: '🫙',
    description: 'A pot filled with fine flour.',
    type: 'consumable' as const,
    stackable: false,
    value: 10,
    questItem: true
  },
  ball_of_wool: {
    id: 'ball_of_wool',
    name: 'Ball of wool',
    icon: '🧶',
    description: 'A ball of soft wool.',
    type: 'material' as const,
    stackable: true,
    value: 3,
    questItem: false // Can be used outside of quest
  },
  shears: {
    id: 'shears',
    name: 'Shears',
    icon: '✂️',
    description: 'Used for shearing sheep.',
    type: 'tool' as const,
    stackable: false,
    value: 1
  }
};

export default { COOKS_ASSISTANT, SHEEP_SHEARER, QUEST_ITEMS };
