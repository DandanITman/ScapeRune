import type { InventorySlot } from '../types/inventory';
import type { ShopItem } from './NPCSystem';

export interface ShopTransaction {
  itemId: string;
  itemName: string;
  quantity: number;
  pricePerItem: number;
  totalPrice: number;
  type: 'buy' | 'sell';
}

export class ShopSystem {
  private playerGold: number = 1000; // Starting gold
  
  constructor() {}

  /**
   * Get player's current gold
   */
  public getPlayerGold(): number {
    return this.playerGold;
  }

  /**
   * Set player's gold amount
   */
  public setPlayerGold(amount: number): void {
    this.playerGold = Math.max(0, amount);
  }

  /**
   * Add gold to player
   */
  public addGold(amount: number): void {
    this.playerGold += amount;
  }

  /**
   * Remove gold from player
   */
  public removeGold(amount: number): boolean {
    if (this.playerGold >= amount) {
      this.playerGold -= amount;
      return true;
    }
    return false;
  }

  /**
   * Buy item from shop
   */
  public buyItem(
    shopItems: ShopItem[], 
    itemId: string, 
    quantity: number = 1,
    addItemToInventory: (itemId: string, quantity: number) => boolean
  ): { success: boolean; message: string; transaction?: ShopTransaction } {
    
    const shopItem = shopItems.find(item => item.itemId === itemId);
    if (!shopItem) {
      return { success: false, message: 'Item not found in shop.' };
    }

    // Check if enough stock
    if (shopItem.stock < quantity) {
      return { 
        success: false, 
        message: `Not enough ${shopItem.name} in stock. Only ${shopItem.stock} available.` 
      };
    }

    const totalCost = shopItem.buyPrice * quantity;

    // Check if player has enough gold
    if (this.playerGold < totalCost) {
      return { 
        success: false, 
        message: `You need ${totalCost} gold coins but only have ${this.playerGold}.` 
      };
    }

    // Try to add to inventory
    if (!addItemToInventory(shopItem.itemId, quantity)) {
      return { success: false, message: 'Your inventory is full!' };
    }

    // Complete transaction
    this.playerGold -= totalCost;
    shopItem.stock -= quantity;

    const transaction: ShopTransaction = {
      itemId: shopItem.itemId,
      itemName: shopItem.name,
      quantity: quantity,
      pricePerItem: shopItem.buyPrice,
      totalPrice: totalCost,
      type: 'buy'
    };

    return {
      success: true,
      message: `Bought ${quantity} ${shopItem.name}(s) for ${totalCost} gold coins.`,
      transaction
    };
  }

  /**
   * Sell item to shop
   */
  public sellItem(
    shopItems: ShopItem[],
    playerInventory: InventorySlot[],
    slotIndex: number,
    quantity: number = 1,
    removeItemFromInventory: (slotIndex: number, quantity: number) => boolean
  ): { success: boolean; message: string; transaction?: ShopTransaction } {
    
    if (slotIndex < 0 || slotIndex >= playerInventory.length) {
      return { success: false, message: 'Invalid inventory slot.' };
    }

    const inventorySlot = playerInventory[slotIndex];
    if (!inventorySlot.item) {
      return { success: false, message: 'No item in this slot.' };
    }

    const item = inventorySlot.item;
    const actualQuantity = Math.min(quantity, item.quantity);

    // Find shop item to determine sell price
    const shopItem = shopItems.find(shopItem => shopItem.itemId === item.id);
    if (!shopItem) {
      return { 
        success: false, 
        message: `The shop doesn't buy ${item.name}.` 
      };
    }

    // Check if shop can accept more stock
    const maxCanBuy = shopItem.maxStock - shopItem.stock;
    if (maxCanBuy <= 0) {
      return { 
        success: false, 
        message: `The shop already has enough ${item.name}.` 
      };
    }

    const actualSellQuantity = Math.min(actualQuantity, maxCanBuy);
    const totalValue = shopItem.sellPrice * actualSellQuantity;

    // Remove item(s) from inventory
    if (!removeItemFromInventory(slotIndex, actualSellQuantity)) {
      return { success: false, message: 'Failed to remove item from inventory.' };
    }

    // Complete transaction
    this.playerGold += totalValue;
    shopItem.stock += actualSellQuantity;

    const transaction: ShopTransaction = {
      itemId: item.id,
      itemName: item.name,
      quantity: actualSellQuantity,
      pricePerItem: shopItem.sellPrice,
      totalPrice: totalValue,
      type: 'sell'
    };

    return {
      success: true,
      message: `Sold ${actualSellQuantity} ${item.name}(s) for ${totalValue} gold coins.`,
      transaction
    };
  }

  /**
   * Get buy price for item
   */
  public getBuyPrice(shopItems: ShopItem[], itemId: string): number | null {
    const shopItem = shopItems.find(item => item.itemId === itemId);
    return shopItem ? shopItem.buyPrice : null;
  }

  /**
   * Get sell price for item
   */
  public getSellPrice(shopItems: ShopItem[], itemId: string): number | null {
    const shopItem = shopItems.find(item => item.itemId === itemId);
    return shopItem ? shopItem.sellPrice : null;
  }

  /**
   * Check if shop accepts item for selling
   */
  public canSellToShop(shopItems: ShopItem[], itemId: string): boolean {
    return shopItems.some(shopItem => shopItem.itemId === itemId);
  }

  /**
   * Get item stock in shop
   */
  public getItemStock(shopItems: ShopItem[], itemId: string): number {
    const shopItem = shopItems.find(item => item.itemId === itemId);
    return shopItem ? shopItem.stock : 0;
  }

  /**
   * Restock shop items (called periodically)
   */
  public restockShop(shopItems: ShopItem[]): void {
    shopItems.forEach(item => {
      if (item.stock < item.maxStock) {
        // Restock 1 item every call (can be adjusted)
        item.stock = Math.min(item.maxStock, item.stock + 1);
      }
    });
  }

  /**
   * Get shop value of inventory (for display purposes)
   */
  public getInventoryShopValue(
    shopItems: ShopItem[], 
    playerInventory: InventorySlot[]
  ): number {
    let totalValue = 0;

    playerInventory.forEach(slot => {
      if (slot.item) {
        const sellPrice = this.getSellPrice(shopItems, slot.item.id);
        if (sellPrice !== null) {
          totalValue += sellPrice * slot.item.quantity;
        }
      }
    });

    return totalValue;
  }

  /**
   * Calculate profit/loss for potential transaction
   */
  public calculateProfit(shopItems: ShopItem[], itemId: string): number | null {
    const shopItem = shopItems.find(item => item.itemId === itemId);
    if (!shopItem) return null;

    return shopItem.sellPrice - shopItem.buyPrice;
  }

  /**
   * Get recommended action for item (buy low, sell high)
   */
  public getRecommendedAction(shopItems: ShopItem[], itemId: string): 'buy' | 'sell' | 'hold' | null {
    const profit = this.calculateProfit(shopItems, itemId);
    if (profit === null) return null;

    if (profit > 0) return 'buy'; // Good profit margin
    if (profit < -5) return 'sell'; // Poor profit margin
    return 'hold'; // Neutral
  }

  /**
   * Bulk buy multiple items
   */
  public bulkBuy(
    shopItems: ShopItem[],
    purchases: { itemId: string; quantity: number }[],
    addItemToInventory: (itemId: string, quantity: number) => boolean
  ): { success: boolean; message: string; transactions: ShopTransaction[] } {
    
    const transactions: ShopTransaction[] = [];
    let totalCost = 0;

    // Calculate total cost first
    for (const purchase of purchases) {
      const shopItem = shopItems.find(item => item.itemId === purchase.itemId);
      if (!shopItem) {
        return { 
          success: false, 
          message: `${purchase.itemId} not found in shop.`,
          transactions: []
        };
      }

      if (shopItem.stock < purchase.quantity) {
        return { 
          success: false, 
          message: `Not enough ${shopItem.name} in stock.`,
          transactions: []
        };
      }

      totalCost += shopItem.buyPrice * purchase.quantity;
    }

    // Check if player has enough gold
    if (this.playerGold < totalCost) {
      return { 
        success: false, 
        message: `You need ${totalCost} gold coins but only have ${this.playerGold}.`,
        transactions: []
      };
    }

    // Execute all purchases
    for (const purchase of purchases) {
      const result = this.buyItem(shopItems, purchase.itemId, purchase.quantity, addItemToInventory);
      if (result.success && result.transaction) {
        transactions.push(result.transaction);
      } else {
        // Rollback previous purchases if any fail
        // This is simplified - in a real implementation you'd want proper transaction rollback
        return { 
          success: false, 
          message: `Failed to buy ${purchase.itemId}: ${result.message}`,
          transactions: []
        };
      }
    }

    return {
      success: true,
      message: `Successfully purchased ${purchases.length} different items for ${totalCost} gold coins.`,
      transactions
    };
  }
}
