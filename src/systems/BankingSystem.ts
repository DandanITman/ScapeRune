import type { InventorySlot, InventoryItem } from '../types/inventory';

export interface BankSlot {
  item: InventoryItem | null;
  id: string;
}

export interface BankTab {
  id: string;
  name: string;
  slots: BankSlot[];
}

export class BankingSystem {
  private static readonly BANK_SLOTS_PER_TAB = 48;
  private static readonly MAX_TABS = 8;
  
  private bankTabs: BankTab[] = [];
  private currentTab: number = 0;

  constructor() {
    this.initializeBank();
  }

  /**
   * Initialize bank with default tabs
   */
  private initializeBank(): void {
    // Create main tab
    this.bankTabs.push({
      id: 'main',
      name: 'All Items',
      slots: this.createEmptySlots(BankingSystem.BANK_SLOTS_PER_TAB)
    });

    // Create additional empty tabs
    for (let i = 1; i < BankingSystem.MAX_TABS; i++) {
      this.bankTabs.push({
        id: `tab_${i}`,
        name: `Tab ${i + 1}`,
        slots: this.createEmptySlots(BankingSystem.BANK_SLOTS_PER_TAB)
      });
    }
  }

  /**
   * Create empty bank slots
   */
  private createEmptySlots(count: number): BankSlot[] {
    const slots: BankSlot[] = [];
    for (let i = 0; i < count; i++) {
      slots.push({
        item: null,
        id: `bank_slot_${i}`
      });
    }
    return slots;
  }

  /**
   * Deposit item into bank
   */
  public depositItem(item: InventoryItem, quantity: number = 1): { success: boolean; message: string } {
    const actualQuantity = Math.min(quantity, item.quantity);
    
    // Check if item already exists in bank (for stackable items)
    if (item.stackable) {
      const existingSlot = this.findItemInBank(item.id);
      if (existingSlot) {
        existingSlot.item!.quantity += actualQuantity;
        return {
          success: true,
          message: `Deposited ${actualQuantity} ${item.name}(s) into your bank.`
        };
      }
    }

    // Find empty slot
    const emptySlot = this.findEmptySlot();
    if (!emptySlot) {
      return {
        success: false,
        message: 'Your bank is full! Please make some space.'
      };
    }

    // Deposit item
    emptySlot.item = {
      ...item,
      quantity: actualQuantity
    };

    return {
      success: true,
      message: `Deposited ${actualQuantity} ${item.name}(s) into your bank.`
    };
  }

  /**
   * Withdraw item from bank
   */
  public withdrawItem(slotIndex: number, quantity: number = 1): { success: boolean; item?: InventoryItem; message: string } {
    const currentTabSlots = this.bankTabs[this.currentTab].slots;
    
    if (slotIndex < 0 || slotIndex >= currentTabSlots.length) {
      return { success: false, message: 'Invalid slot index.' };
    }

    const slot = currentTabSlots[slotIndex];
    if (!slot.item) {
      return { success: false, message: 'No item in this slot.' };
    }

    const actualQuantity = Math.min(quantity, slot.item.quantity);
    const withdrawnItem: InventoryItem = {
      ...slot.item,
      quantity: actualQuantity
    };

    // Update bank slot
    slot.item.quantity -= actualQuantity;
    if (slot.item.quantity <= 0) {
      slot.item = null;
    }

    return {
      success: true,
      item: withdrawnItem,
      message: `Withdrew ${actualQuantity} ${withdrawnItem.name}(s) from your bank.`
    };
  }

  /**
   * Deposit all items of a specific type from inventory
   */
  public depositAllOfType(inventory: InventorySlot[], itemId: string): { success: boolean; deposited: number; message: string } {
    let totalDeposited = 0;
    
    // Find all matching items in inventory
    const matchingSlots = inventory.filter(slot => slot.item && slot.item.id === itemId);
    
    if (matchingSlots.length === 0) {
      return {
        success: false,
        deposited: 0,
        message: 'No matching items found in inventory.'
      };
    }

    // Try to deposit each matching item
    for (const slot of matchingSlots) {
      if (slot.item) {
        const result = this.depositItem(slot.item, slot.item.quantity);
        if (result.success) {
          totalDeposited += slot.item.quantity;
        }
      }
    }

    return {
      success: totalDeposited > 0,
      deposited: totalDeposited,
      message: totalDeposited > 0 
        ? `Deposited ${totalDeposited} items into your bank.`
        : 'Failed to deposit items - bank may be full.'
    };
  }

  /**
   * Find item in bank by ID
   */
  private findItemInBank(itemId: string): BankSlot | null {
    for (const tab of this.bankTabs) {
      for (const slot of tab.slots) {
        if (slot.item && slot.item.id === itemId) {
          return slot;
        }
      }
    }
    return null;
  }

  /**
   * Find first empty slot in current tab
   */
  private findEmptySlot(): BankSlot | null {
    const currentTabSlots = this.bankTabs[this.currentTab].slots;
    
    for (const slot of currentTabSlots) {
      if (!slot.item) {
        return slot;
      }
    }

    // If current tab is full, try other tabs
    for (let i = 0; i < this.bankTabs.length; i++) {
      if (i === this.currentTab) continue;
      
      for (const slot of this.bankTabs[i].slots) {
        if (!slot.item) {
          return slot;
        }
      }
    }

    return null;
  }

  /**
   * Get current tab's slots
   */
  public getCurrentTabSlots(): BankSlot[] {
    return this.bankTabs[this.currentTab].slots;
  }

  /**
   * Switch to different tab
   */
  public switchTab(tabIndex: number): boolean {
    if (tabIndex < 0 || tabIndex >= this.bankTabs.length) {
      return false;
    }
    
    this.currentTab = tabIndex;
    return true;
  }

  /**
   * Get all tabs
   */
  public getTabs(): BankTab[] {
    return this.bankTabs;
  }

  /**
   * Get current tab index
   */
  public getCurrentTabIndex(): number {
    return this.currentTab;
  }

  /**
   * Search for items in bank
   */
  public searchBank(searchTerm: string): BankSlot[] {
    const results: BankSlot[] = [];
    
    for (const tab of this.bankTabs) {
      for (const slot of tab.slots) {
        if (slot.item && slot.item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push(slot);
        }
      }
    }
    
    return results;
  }

  /**
   * Get total items in bank
   */
  public getTotalItems(): number {
    let total = 0;
    
    for (const tab of this.bankTabs) {
      for (const slot of tab.slots) {
        if (slot.item) {
          total += slot.item.quantity;
        }
      }
    }
    
    return total;
  }

  /**
   * Get bank capacity info
   */
  public getBankInfo(): { usedSlots: number; totalSlots: number; usedPercentage: number } {
    let usedSlots = 0;
    const totalSlots = this.bankTabs.length * BankingSystem.BANK_SLOTS_PER_TAB;
    
    for (const tab of this.bankTabs) {
      for (const slot of tab.slots) {
        if (slot.item) {
          usedSlots++;
        }
      }
    }
    
    return {
      usedSlots,
      totalSlots,
      usedPercentage: Math.round((usedSlots / totalSlots) * 100)
    };
  }

  /**
   * Organize bank (sort items)
   */
  public organizeBank(): void {
    // Collect all items from all tabs
    const allItems: InventoryItem[] = [];
    
    for (const tab of this.bankTabs) {
      for (const slot of tab.slots) {
        if (slot.item) {
          allItems.push({ ...slot.item });
          slot.item = null;
        }
      }
    }

    // Sort items by type, then by name
    allItems.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return a.name.localeCompare(b.name);
    });

    // Place sorted items back into main tab first
    let slotIndex = 0;
    let tabIndex = 0;
    
    for (const item of allItems) {
      if (slotIndex >= BankingSystem.BANK_SLOTS_PER_TAB) {
        slotIndex = 0;
        tabIndex++;
        
        if (tabIndex >= this.bankTabs.length) {
          break; // Bank is full
        }
      }
      
      this.bankTabs[tabIndex].slots[slotIndex].item = item;
      slotIndex++;
    }
  }
}
