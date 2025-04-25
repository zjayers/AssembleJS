# Drag & Drop Interfaces

<iframe src="https://placeholder-for-assemblejs-drag-drop-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

## Overview

Drag and drop interfaces provide intuitive user experiences for various operations like reordering lists, moving items between containers, and file uploads. This cookbook demonstrates how to implement smooth, accessible drag and drop functionality in AssembleJS applications.

## Prerequisites

- Basic knowledge of AssembleJS components and blueprints
- Familiarity with DOM manipulation and event handling
- Understanding of basic accessibility principles

## Implementation Steps

### Step 1: Generate the Project Structure with ASM CLI

Start by using the ASM CLI to scaffold your project and generate the necessary components:

```bash
# If you haven't already, create a new AssembleJS project
npx asmgen new my-drag-drop-project

# Navigate to your project
cd my-drag-drop-project

# Generate a sortable list component using ASM CLI
npx asmgen component drag-drop sortable-list --template react
```

This will create a component structure with the following files:
- `src/components/drag-drop/sortable-list/sortable-list.view.tsx`
- `src/components/drag-drop/sortable-list/sortable-list.client.ts`
- `src/components/drag-drop/sortable-list/sortable-list.styles.scss`

### Step 2: Create a Data Service for List Items

Generate a service to manage our list data:

```bash
npx asmgen service list-data
```

Implement the list data service:

```typescript
// src/services/list-data.service.ts
import { Service } from 'asmbl';

export interface ListItem {
  id: string;
  text: string;
  order: number;
  color?: string;
  container?: string;
}

export class ListDataService extends Service {
  private items: Map<string, ListItem[]> = new Map();
  
  constructor() {
    super();
    // Initialize with some default data
    this.items.set('todos', [
      { id: '1', text: 'Learn AssembleJS', order: 0, color: '#4a90e2' },
      { id: '2', text: 'Create drag & drop component', order: 1, color: '#50c878' },
      { id: '3', text: 'Implement accessibility features', order: 2, color: '#f39c12' },
      { id: '4', text: 'Write unit tests', order: 3, color: '#e74c3c' },
      { id: '5', text: 'Deploy application', order: 4, color: '#9b59b6' }
    ]);
    
    this.items.set('inProgress', [
      { id: '6', text: 'Setup project structure', order: 0, color: '#3498db' },
      { id: '7', text: 'Design component interface', order: 1, color: '#2ecc71' }
    ]);
    
    this.items.set('completed', [
      { id: '8', text: 'Research drag & drop libraries', order: 0, color: '#95a5a6' }
    ]);
  }
  
  /**
   * Get all items for a specific list
   */
  getItems(listId: string): ListItem[] {
    return [...(this.items.get(listId) || [])].sort((a, b) => a.order - b.order);
  }
  
  /**
   * Get all lists and their items
   */
  getAllLists(): Record<string, ListItem[]> {
    const result: Record<string, ListItem[]> = {};
    
    for (const [listId, items] of this.items.entries()) {
      result[listId] = [...items].sort((a, b) => a.order - b.order);
    }
    
    return result;
  }
  
  /**
   * Add a new item to a list
   */
  addItem(listId: string, text: string): ListItem {
    const items = this.items.get(listId) || [];
    
    const newItem: ListItem = {
      id: Date.now().toString(),
      text,
      order: items.length,
      color: this.getRandomColor(),
      container: listId
    };
    
    items.push(newItem);
    this.items.set(listId, items);
    
    return newItem;
  }
  
  /**
   * Update an item's text
   */
  updateItemText(itemId: string, text: string): boolean {
    for (const [listId, items] of this.items.entries()) {
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        items[itemIndex].text = text;
        this.items.set(listId, items);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Delete an item
   */
  deleteItem(itemId: string): boolean {
    for (const [listId, items] of this.items.entries()) {
      const filteredItems = items.filter(item => item.id !== itemId);
      
      if (filteredItems.length !== items.length) {
        // Reorder remaining items
        filteredItems.forEach((item, index) => {
          item.order = index;
        });
        
        this.items.set(listId, filteredItems);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Reorder items within the same list
   */
  reorderItems(listId: string, itemId: string, newIndex: number): boolean {
    const items = this.items.get(listId);
    
    if (!items) {
      return false;
    }
    
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return false;
    }
    
    // Get the item to move
    const [item] = items.splice(itemIndex, 1);
    
    // Insert at new position
    items.splice(newIndex, 0, item);
    
    // Update order of all items
    items.forEach((item, index) => {
      item.order = index;
    });
    
    this.items.set(listId, items);
    
    return true;
  }
  
  /**
   * Move an item from one list to another
   */
  moveItem(sourceListId: string, targetListId: string, itemId: string, newIndex: number): boolean {
    const sourceItems = this.items.get(sourceListId);
    const targetItems = this.items.get(targetListId) || [];
    
    if (!sourceItems) {
      return false;
    }
    
    const itemIndex = sourceItems.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return false;
    }
    
    // Remove from source list
    const [item] = sourceItems.splice(itemIndex, 1);
    
    // Update order of remaining source items
    sourceItems.forEach((sourceItem, index) => {
      sourceItem.order = index;
    });
    
    // Update the container property
    item.container = targetListId;
    
    // Insert into target list
    targetItems.splice(newIndex, 0, item);
    
    // Update order of all target items
    targetItems.forEach((targetItem, index) => {
      targetItem.order = index;
    });
    
    // Save changes
    this.items.set(sourceListId, sourceItems);
    this.items.set(targetListId, targetItems);
    
    return true;
  }
  
  /**
   * Generate a random color for new items
   */
  private getRandomColor(): string {
    const colors = [
      '#4a90e2', '#50c878', '#f39c12', '#e74c3c', '#9b59b6',
      '#3498db', '#2ecc71', '#e67e22', '#c0392b', '#8e44ad'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
```

### Step 3: Create a Factory for the Sortable List

Generate a factory for our sortable list:

```bash
npx asmgen factory drag-drop/sortable-list
```

Implement the factory:

```typescript
// src/components/drag-drop/sortable-list/sortable-list.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { ListDataService, ListItem } from '../../../services/list-data.service';

export class SortableListFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get the list data service
    const listDataService = context.services.get('listDataService') as ListDataService;
    
    // Get the list ID from parameters or use default
    const listId = context.params.get('listId') as string || 'todos';
    
    // Get the list title from parameters or generate from listId
    const title = context.params.get('title') as string || 
      listId.charAt(0).toUpperCase() + listId.slice(1);
    
    // Get list items
    const items = listDataService.getItems(listId);
    
    // Set data for the component
    context.data.set('listId', listId);
    context.data.set('title', title);
    context.data.set('items', items);
    
    // Set configuration options
    context.data.set('allowReordering', context.params.get('allowReordering') !== 'false');
    context.data.set('allowDragOut', context.params.get('allowDragOut') !== 'false');
    context.data.set('allowDragIn', context.params.get('allowDragIn') !== 'false');
    context.data.set('itemHeight', parseInt(context.params.get('itemHeight') as string || '60'));
  }
}
```

### Step 4: Implement the Sortable List View

Edit the React component view for the sortable list:

```tsx
// src/components/drag-drop/sortable-list/sortable-list.view.tsx
import React from 'react';

interface ListItem {
  id: string;
  text: string;
  order: number;
  color?: string;
}

interface SortableListProps {
  data: {
    listId: string;
    title: string;
    items: ListItem[];
    allowReordering: boolean;
    allowDragOut: boolean;
    allowDragIn: boolean;
    itemHeight: number;
  };
}

const SortableList: React.FC<SortableListProps> = ({ data }) => {
  const { 
    listId, 
    title, 
    items, 
    allowReordering,
    allowDragOut,
    allowDragIn,
    itemHeight
  } = data;
  
  return (
    <div 
      className="sortable-list-container" 
      data-list-id={listId}
      data-allow-reordering={allowReordering.toString()}
      data-allow-drag-out={allowDragOut.toString()}
      data-allow-drag-in={allowDragIn.toString()}
    >
      <div className="sortable-list-header">
        <h3>{title}</h3>
        <span className="item-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="sortable-list-actions">
        <input 
          type="text"
          className="new-item-input"
          placeholder="Add new item..."
          aria-label={`Add new item to ${title}`}
        />
        <button 
          className="add-item-button"
          aria-label={`Add item to ${title}`}
        >
          Add
        </button>
      </div>
      
      <ul 
        className="sortable-list"
        data-is-empty={items.length === 0 ? 'true' : 'false'}
      >
        {items.length === 0 ? (
          <li className="empty-list-placeholder">
            Drag items here or add a new one
          </li>
        ) : (
          items.map(item => (
            <li 
              key={item.id}
              className="sortable-item"
              data-id={item.id}
              draggable={allowReordering || allowDragOut}
              style={{ 
                height: `${itemHeight}px`,
                borderLeftColor: item.color
              }}
            >
              <div className="item-content">
                <span className="item-text">{item.text}</span>
                <div className="item-actions">
                  <button 
                    className="edit-item-button"
                    aria-label={`Edit item: ${item.text}`}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-item-button"
                    aria-label={`Delete item: ${item.text}`}
                  >
                    &times;
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
      
      {/* Drag placeholder for visual feedback */}
      <div className="drag-placeholder" aria-hidden="true"></div>
    </div>
  );
};

export default SortableList;
```

### Step 5: Implement the Client-Side Code

Edit the client file to implement the drag and drop functionality:

```typescript
// src/components/drag-drop/sortable-list/sortable-list.client.ts
import { Blueprint } from 'asmbl';
import { ListDataService, ListItem } from '../../../services/list-data.service';

interface DragState {
  draggedItem: HTMLElement | null;
  draggedItemId: string | null;
  draggedItemListId: string | null;
  dragOverList: HTMLElement | null;
  dragOverListId: string | null;
  dragPlaceholder: HTMLElement | null;
  startY: number;
  dragOverIndex: number;
  itemHeight: number;
}

export class SortableListClient extends Blueprint {
  private listDataService: ListDataService | null = null;
  private listContainer: HTMLElement | null = null;
  private listElement: HTMLUListElement | null = null;
  private newItemInput: HTMLInputElement | null = null;
  private addItemButton: HTMLButtonElement | null = null;
  private dragPlaceholder: HTMLElement | null = null;
  
  // List configuration
  private listId: string = '';
  private allowReordering: boolean = true;
  private allowDragOut: boolean = true;
  private allowDragIn: boolean = true;
  private itemHeight: number = 60;
  
  // Drag state
  private dragState: DragState = {
    draggedItem: null,
    draggedItemId: null,
    draggedItemListId: null,
    dragOverList: null,
    dragOverListId: null,
    dragPlaceholder: null,
    startY: 0,
    dragOverIndex: -1,
    itemHeight: 60
  };
  
  protected override onMount(): void {
    super.onMount();
    
    // Get services
    this.listDataService = this.services.get('listDataService') as ListDataService;
    
    // Get configuration from context
    this.listId = this.context.get('listId') || 'todos';
    this.allowReordering = this.context.get('allowReordering') !== false;
    this.allowDragOut = this.context.get('allowDragOut') !== false;
    this.allowDragIn = this.context.get('allowDragIn') !== false;
    this.itemHeight = this.context.get('itemHeight') || 60;
    
    // Update drag state with item height
    this.dragState.itemHeight = this.itemHeight;
    
    // Get DOM elements
    this.listContainer = this.root;
    this.listElement = this.root.querySelector('.sortable-list');
    this.newItemInput = this.root.querySelector('.new-item-input');
    this.addItemButton = this.root.querySelector('.add-item-button');
    this.dragPlaceholder = this.root.querySelector('.drag-placeholder');
    
    // Set up event listeners
    this.setupDragAndDropEvents();
    this.setupItemActions();
    this.setupAddItemEvents();
  }
  
  private setupDragAndDropEvents(): void {
    if (!this.listElement) return;
    
    // Events for the draggable items
    const setupItemDragEvents = (item: HTMLElement) => {
      // Only set up drag events if allowed
      if (this.allowReordering || this.allowDragOut) {
        item.addEventListener('dragstart', this.handleDragStart.bind(this));
        item.addEventListener('dragend', this.handleDragEnd.bind(this));
      }
    };
    
    // Set up drag events for existing items
    this.listElement.querySelectorAll('.sortable-item').forEach(item => {
      setupItemDragEvents(item as HTMLElement);
    });
    
    // Set up drop zone events on the list container
    if (this.allowReordering || this.allowDragIn) {
      this.listElement.addEventListener('dragover', this.handleDragOver.bind(this));
      this.listElement.addEventListener('dragleave', this.handleDragLeave.bind(this));
      this.listElement.addEventListener('drop', this.handleDrop.bind(this));
    }
    
    // Set up a MutationObserver to watch for new items
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && 
                (node as HTMLElement).classList.contains('sortable-item')) {
              setupItemDragEvents(node as HTMLElement);
            }
          });
        }
      });
    });
    
    observer.observe(this.listElement, { childList: true });
  }
  
  private setupItemActions(): void {
    if (!this.listElement) return;
    
    // Edit item
    this.listElement.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      if (target.closest('.edit-item-button')) {
        const item = target.closest('.sortable-item') as HTMLElement;
        const itemId = item?.dataset.id;
        
        if (itemId) {
          this.editItem(itemId, item);
        }
      }
    });
    
    // Delete item
    this.listElement.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      if (target.closest('.delete-item-button')) {
        const item = target.closest('.sortable-item') as HTMLElement;
        const itemId = item?.dataset.id;
        
        if (itemId) {
          this.deleteItem(itemId, item);
        }
      }
    });
  }
  
  private setupAddItemEvents(): void {
    if (!this.addItemButton || !this.newItemInput) return;
    
    // Add item on button click
    this.addItemButton.addEventListener('click', () => {
      this.addNewItem();
    });
    
    // Add item on Enter key
    this.newItemInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.addNewItem();
      }
    });
  }
  
  private handleDragStart(event: DragEvent): void {
    if (!event.dataTransfer) return;
    
    const target = event.target as HTMLElement;
    const item = target.closest('.sortable-item') as HTMLElement;
    
    if (!item) return;
    
    // Store references to the dragged item
    this.dragState.draggedItem = item;
    this.dragState.draggedItemId = item.dataset.id || null;
    this.dragState.draggedItemListId = this.listId;
    this.dragState.startY = event.clientY;
    
    // Set data for cross-list dragging
    event.dataTransfer.setData('text/plain', JSON.stringify({
      itemId: item.dataset.id,
      listId: this.listId
    }));
    
    // Set drag effect
    event.dataTransfer.effectAllowed = 'move';
    
    // Add a class to the item being dragged
    item.classList.add('dragging');
    
    // Use a custom drag image if needed
    // event.dataTransfer.setDragImage(customImage, 0, 0);
    
    // Set a timeout to hide the original element
    setTimeout(() => {
      item.style.opacity = '0.4';
    }, 0);
  }
  
  private handleDragOver(event: DragEvent): void {
    // Prevent default to allow drop
    event.preventDefault();
    
    if (!event.dataTransfer || !this.listElement) return;
    
    // Set drop effect
    event.dataTransfer.dropEffect = 'move';
    
    // Determine if we're dragging within the same list or from another list
    let sourceListId: string | null = this.dragState.draggedItemListId;
    let itemId: string | null = this.dragState.draggedItemId;
    
    // If draggedItemListId is null, try to get it from the transfer data
    // This happens when dragging between different list components
    if (!sourceListId || !itemId) {
      try {
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        sourceListId = data.listId;
        itemId = data.itemId;
        
        // Update the drag state with the new info
        this.dragState.draggedItemListId = sourceListId;
        this.dragState.draggedItemId = itemId;
      } catch (e) {
        // Invalid data, can't proceed
        return;
      }
    }
    
    // Check if we can accept this drop
    const isSameList = sourceListId === this.listId;
    if ((isSameList && !this.allowReordering) || (!isSameList && !this.allowDragIn)) {
      return;
    }
    
    // Update the list we're currently dragging over
    this.dragState.dragOverList = this.listElement;
    this.dragState.dragOverListId = this.listId;
    
    // Calculate the index to insert the item
    const listRect = this.listElement.getBoundingClientRect();
    const mouseY = event.clientY - listRect.top;
    
    // Get the list of visible items that are not being dragged
    const visibleItems = Array.from(
      this.listElement.querySelectorAll('.sortable-item:not(.dragging)')
    ) as HTMLElement[];
    
    // Handle empty list
    if (visibleItems.length === 0) {
      this.dragState.dragOverIndex = 0;
      this.showDragPlaceholder(0);
      return;
    }
    
    // Find the index based on mouse position
    const itemHeight = this.dragState.itemHeight;
    const insertIndex = Math.min(
      Math.floor(mouseY / itemHeight),
      visibleItems.length
    );
    
    this.dragState.dragOverIndex = insertIndex;
    this.showDragPlaceholder(insertIndex);
  }
  
  private handleDragLeave(event: DragEvent): void {
    // Only handle if we're leaving the list (not an item within the list)
    if (event.target === this.listElement || !this.listElement?.contains(event.relatedTarget as Node)) {
      this.hideDragPlaceholder();
      this.dragState.dragOverList = null;
      this.dragState.dragOverListId = null;
      this.dragState.dragOverIndex = -1;
    }
  }
  
  private handleDrop(event: DragEvent): void {
    // Prevent default browser behavior
    event.preventDefault();
    
    if (!this.listDataService) return;
    
    const sourceListId = this.dragState.draggedItemListId;
    const targetListId = this.dragState.dragOverListId;
    const itemId = this.dragState.draggedItemId;
    const insertIndex = this.dragState.dragOverIndex;
    
    // Make sure we have all the required data
    if (!sourceListId || !targetListId || !itemId || insertIndex < 0) {
      this.resetDragState();
      return;
    }
    
    // Handle the drop based on whether it's within the same list or between lists
    if (sourceListId === targetListId) {
      // Same list - reorder items
      this.listDataService.reorderItems(sourceListId, itemId, insertIndex);
      
      // Update the UI
      this.updateListItems();
    } else {
      // Different lists - move item between lists
      this.listDataService.moveItem(sourceListId, targetListId, itemId, insertIndex);
      
      // If we're handling a drop from another component, we need to 
      // use a custom event to notify other components to update
      if (this.dragState.draggedItem === null) {
        // Create and dispatch a custom event for cross-component updates
        const updateEvent = new CustomEvent('listitem:moved', {
          bubbles: true,
          detail: {
            sourceListId,
            targetListId,
            itemId,
            insertIndex
          }
        });
        
        this.root.dispatchEvent(updateEvent);
      }
      
      // Update this list's UI
      this.updateListItems();
    }
    
    // Clean up
    this.hideDragPlaceholder();
    this.resetDragState();
  }
  
  private handleDragEnd(event: Event): void {
    const item = event.target as HTMLElement;
    
    if (item) {
      // Reset the item's styles
      item.classList.remove('dragging');
      item.style.opacity = '1';
    }
    
    // Clean up
    this.hideDragPlaceholder();
    this.resetDragState();
  }
  
  private showDragPlaceholder(index: number): void {
    if (!this.dragPlaceholder || !this.listElement) return;
    
    const items = this.listElement.querySelectorAll('.sortable-item:not(.dragging)');
    
    // Position the placeholder
    if (index === 0) {
      // Insert at the beginning
      this.listElement.insertBefore(this.dragPlaceholder, this.listElement.firstChild);
    } else if (index >= items.length) {
      // Insert at the end
      this.listElement.appendChild(this.dragPlaceholder);
    } else {
      // Insert before the item at the specified index
      this.listElement.insertBefore(this.dragPlaceholder, items[index]);
    }
    
    // Show the placeholder
    this.dragPlaceholder.style.display = 'block';
    this.dragPlaceholder.style.height = `${this.dragState.itemHeight}px`;
  }
  
  private hideDragPlaceholder(): void {
    if (this.dragPlaceholder) {
      this.dragPlaceholder.style.display = 'none';
      
      // Remove it from the DOM to avoid interfering with the list layout
      if (this.dragPlaceholder.parentNode) {
        this.dragPlaceholder.parentNode.removeChild(this.dragPlaceholder);
      }
      
      // Re-add it to the container for future use
      this.listContainer?.appendChild(this.dragPlaceholder);
    }
  }
  
  private resetDragState(): void {
    this.dragState = {
      draggedItem: null,
      draggedItemId: null,
      draggedItemListId: null,
      dragOverList: null,
      dragOverListId: null,
      dragPlaceholder: null,
      startY: 0,
      dragOverIndex: -1,
      itemHeight: this.itemHeight
    };
  }
  
  private addNewItem(): void {
    if (!this.listDataService || !this.newItemInput) return;
    
    const text = this.newItemInput.value.trim();
    
    if (text) {
      // Add the item to the data service
      this.listDataService.addItem(this.listId, text);
      
      // Clear the input
      this.newItemInput.value = '';
      
      // Update the UI
      this.updateListItems();
      
      // Focus the input for the next item
      this.newItemInput.focus();
    }
  }
  
  private editItem(itemId: string, itemElement: HTMLElement): void {
    if (!this.listDataService) return;
    
    const textElement = itemElement.querySelector('.item-text');
    if (!textElement) return;
    
    const currentText = textElement.textContent || '';
    
    // Create an input element for editing
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'edit-item-input';
    
    // Replace the text with the input
    textElement.innerHTML = '';
    textElement.appendChild(input);
    
    // Focus the input
    input.focus();
    
    // Select all text
    input.select();
    
    // Handle saving the edit
    const saveEdit = () => {
      const newText = input.value.trim();
      
      if (newText && newText !== currentText) {
        // Update the item text
        this.listDataService?.updateItemText(itemId, newText);
      }
      
      // Restore the text element
      textElement.innerHTML = newText || currentText;
      
      // Remove event listeners
      input.removeEventListener('blur', saveEdit);
      input.removeEventListener('keydown', handleKeyDown);
    };
    
    // Handle key events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        // Restore original text without saving
        textElement.innerHTML = currentText;
        input.removeEventListener('blur', saveEdit);
        input.removeEventListener('keydown', handleKeyDown);
      }
    };
    
    // Add event listeners
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', handleKeyDown);
  }
  
  private deleteItem(itemId: string, itemElement: HTMLElement): void {
    if (!this.listDataService) return;
    
    // Add a fade-out animation
    itemElement.classList.add('deleting');
    
    // Delete after animation completes
    setTimeout(() => {
      // Delete the item from the data service
      this.listDataService?.deleteItem(itemId);
      
      // Update the UI
      this.updateListItems();
    }, 300);
  }
  
  private updateListItems(): void {
    if (!this.listDataService || !this.listElement) return;
    
    // Get updated items
    const items = this.listDataService.getItems(this.listId);
    
    // Update the count in the header
    const countElement = this.root.querySelector('.item-count');
    if (countElement) {
      countElement.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
    }
    
    // Update the empty state
    this.listElement.setAttribute('data-is-empty', items.length === 0 ? 'true' : 'false');
    
    // Clear existing items (except the placeholder)
    const placeholder = this.listElement.querySelector('.empty-list-placeholder');
    this.listElement.innerHTML = '';
    
    // Add empty placeholder if needed
    if (items.length === 0 && placeholder) {
      this.listElement.appendChild(placeholder);
      return;
    }
    
    // Add updated items
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'sortable-item';
      li.dataset.id = item.id;
      li.draggable = this.allowReordering || this.allowDragOut;
      li.style.height = `${this.itemHeight}px`;
      li.style.borderLeftColor = item.color || '#4a90e2';
      
      li.innerHTML = `
        <div class="item-content">
          <span class="item-text">${item.text}</span>
          <div class="item-actions">
            <button 
              class="edit-item-button"
              aria-label="Edit item: ${item.text}"
            >
              Edit
            </button>
            <button 
              class="delete-item-button"
              aria-label="Delete item: ${item.text}"
            >
              &times;
            </button>
          </div>
        </div>
      `;
      
      this.listElement.appendChild(li);
    });
  }
  
  // Listen for cross-component update events
  protected override onDestroy(): void {
    super.onDestroy();
    
    // Clean up event listeners if needed
  }
}

export default SortableListClient;
```

### Step 6: Add Styles for the Sortable List

Add styles for our sortable list component:

```scss
// src/components/drag-drop/sortable-list/sortable-list.styles.scss
.sortable-list-container {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f8f9fa;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 500px;
  
  .sortable-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    
    .item-count {
      font-size: 14px;
      color: #666;
      background: #e9ecef;
      padding: 2px 8px;
      border-radius: 12px;
    }
  }
  
  .sortable-list-actions {
    display: flex;
    margin-bottom: 15px;
    
    .new-item-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px 0 0 4px;
      font-size: 14px;
      
      &:focus {
        outline: none;
        border-color: #4a90e2;
      }
    }
    
    .add-item-button {
      padding: 8px 15px;
      background-color: #4a90e2;
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      font-size: 14px;
      
      &:hover {
        background-color: #3a7bc8;
      }
    }
  }
  
  .sortable-list {
    list-style: none;
    padding: 0;
    margin: 0;
    min-height: 60px;
    
    &[data-is-empty="true"] {
      border: 2px dashed #ced4da;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .empty-list-placeholder {
        padding: 20px;
        text-align: center;
        color: #6c757d;
        font-style: italic;
      }
    }
  }
  
  .sortable-item {
    border: 1px solid #dee2e6;
    border-left: 4px solid #4a90e2;
    border-radius: 4px;
    background-color: white;
    margin-bottom: 8px;
    cursor: grab;
    position: relative;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.3s;
    
    &:hover {
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    &.dragging {
      opacity: 0.4;
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
    }
    
    &.deleting {
      opacity: 0;
      transform: translateX(30px);
    }
    
    .item-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 15px;
      height: 100%;
    }
    
    .item-text {
      font-size: 15px;
      color: #333;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .item-actions {
      display: flex;
      opacity: 0;
      transition: opacity 0.2s;
      
      .edit-item-button,
      .delete-item-button {
        background: none;
        border: none;
        font-size: 14px;
        cursor: pointer;
        padding: 5px;
        color: #6c757d;
        
        &:hover {
          color: #343a40;
        }
      }
      
      .delete-item-button {
        font-size: 18px;
        
        &:hover {
          color: #dc3545;
        }
      }
    }
    
    &:hover .item-actions {
      opacity: 1;
    }
    
    .edit-item-input {
      width: 100%;
      padding: 6px;
      border: 1px solid #4a90e2;
      border-radius: 3px;
      font-size: 15px;
      
      &:focus {
        outline: none;
      }
    }
  }
  
  .drag-placeholder {
    display: none;
    background-color: rgba(74, 144, 226, 0.1);
    border: 2px dashed #4a90e2;
    border-radius: 4px;
    margin-bottom: 8px;
  }
}

/* Accessibility styles for keyboard users */
.sortable-list-container:focus-within {
  outline: 2px solid #4a90e2;
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Step 7: Create a Kanban Board Component

Generate a kanban board component that uses multiple sortable lists:

```bash
npx asmgen component drag-drop kanban-board --template react
```

Implement the kanban board factory:

```typescript
// src/components/drag-drop/kanban-board/kanban-board.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { ListDataService } from '../../../services/list-data.service';

export class KanbanBoardFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get the list data service
    const listDataService = context.services.get('listDataService') as ListDataService;
    
    // Get all lists
    const lists = listDataService.getAllLists();
    
    // Set component data
    context.data.set('lists', lists);
    
    // Set configuration options
    context.data.set('allowCrossListDrag', context.params.get('allowCrossListDrag') !== 'false');
  }
}
```

Implement the kanban board view:

```tsx
// src/components/drag-drop/kanban-board/kanban-board.view.tsx
import React from 'react';

interface ListItem {
  id: string;
  text: string;
  order: number;
  color?: string;
}

type ListsMap = Record<string, ListItem[]>;

interface KanbanBoardProps {
  data: {
    lists: ListsMap;
    allowCrossListDrag: boolean;
  };
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ data }) => {
  const { lists, allowCrossListDrag } = data;
  
  const listIds = Object.keys(lists);
  
  // Format list IDs for display
  const formatListName = (id: string): string => {
    return id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1');
  };
  
  return (
    <div className="kanban-board">
      <h2 className="kanban-board-title">Task Board</h2>
      
      <div className="kanban-board-lists">
        {listIds.map(listId => (
          <div key={listId} className="kanban-list-wrapper">
            <div 
              data-component="drag-drop/sortable-list" 
              data-params={JSON.stringify({
                listId,
                title: formatListName(listId),
                allowDragOut: allowCrossListDrag,
                allowDragIn: allowCrossListDrag
              })}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
```

Add styles for the kanban board:

```scss
// src/components/drag-drop/kanban-board/kanban-board.styles.scss
.kanban-board {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
  
  .kanban-board-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }
  
  .kanban-board-lists {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: flex-start;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
  
  .kanban-list-wrapper {
    flex: 1;
    min-width: 300px;
    max-width: 500px;
    
    @media (max-width: 768px) {
      width: 100%;
      max-width: 100%;
    }
  }
}
```

### Step 8: Register the Components and Service

Update your server.ts to register all components:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { ListDataService } from "./services/list-data.service";
import { SortableListFactory } from "./components/drag-drop/sortable-list/sortable-list.factory";
import { KanbanBoardFactory } from "./components/drag-drop/kanban-board/kanban-board.factory";

// Create the list data service
const listDataService = new ListDataService();

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'drag-drop',
        views: [
          {
            viewName: 'sortable-list',
            templateFile: 'sortable-list.view.tsx',
            factory: new SortableListFactory()
          },
          {
            viewName: 'kanban-board',
            templateFile: 'kanban-board.view.tsx',
            factory: new KanbanBoardFactory()
          }
        ]
      }
    ],
    services: [
      {
        name: 'listDataService',
        service: listDataService
      }
    ]
  }
});
```

### Step 9: Create a Blueprint to Display the Components

Generate a blueprint to display our drag and drop components:

```bash
npx asmgen blueprint drag-drop
```

Implement the blueprint:

```tsx
// src/blueprints/drag-drop/main/main.view.tsx
import React from 'react';

const DragDropDemo: React.FC = () => {
  return (
    <div className="drag-drop-demo">
      <header className="header">
        <h1>Drag & Drop in AssembleJS</h1>
        <p>Examples of drag and drop functionality</p>
      </header>
      
      <main className="main-content">
        <section className="demo-section">
          <h2>Kanban Board</h2>
          <p>Drag tasks between different lists to update their status.</p>
          
          <div className="kanban-container" data-component="drag-drop/kanban-board"></div>
        </section>
        
        <section className="demo-section">
          <h2>Sortable List</h2>
          <p>A simple sortable list example with drag and drop reordering.</p>
          
          <div className="sortable-list-demo" data-component="drag-drop/sortable-list" data-params='{"listId":"sortableDemo", "title":"Sortable List Demo", "allowDragOut":"false"}'></div>
        </section>
      </main>
      
      <footer className="footer">
        <p>AssembleJS Drag & Drop Cookbook Example</p>
      </footer>
    </div>
  );
};

export default DragDropDemo;
```

Add the blueprint route to server.ts:

```typescript
// src/server.ts
// ... existing code

void createBlueprintServer({
  // ... existing configuration
  
  manifest: {
    components: [
      // ... existing components
    ],
    blueprints: [
      {
        path: 'drag-drop',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/drag-drop'
        }]
      }
    ],
    services: [
      // ... existing services
    ]
  }
});
```

## Advanced Topics

### Keyboard Accessibility

To enhance keyboard accessibility, add keyboard navigation to the sortable list client:

```typescript
// Add to sortable-list.client.ts

private setupKeyboardControls(): void {
  if (!this.listElement) return;
  
  this.listElement.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement;
    const item = target.closest('.sortable-item') as HTMLElement;
    
    if (!item) return;
    
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.moveItemUp(item);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveItemDown(item);
        break;
      case 'Home':
        event.preventDefault();
        this.moveItemToTop(item);
        break;
      case 'End':
        event.preventDefault();
        this.moveItemToBottom(item);
        break;
    }
  });
  
  // Make items focusable
  this.listElement.querySelectorAll('.sortable-item').forEach(item => {
    item.setAttribute('tabindex', '0');
  });
}

private moveItemUp(item: HTMLElement): void {
  if (!this.listDataService || !this.listElement) return;
  
  const itemId = item.dataset.id;
  if (!itemId) return;
  
  // Get all items
  const items = Array.from(this.listElement.querySelectorAll('.sortable-item'));
  const currentIndex = items.indexOf(item);
  
  // Can't move up if already at the top
  if (currentIndex <= 0) return;
  
  // Move the item up in the data service
  this.listDataService.reorderItems(this.listId, itemId, currentIndex - 1);
  
  // Update the UI
  this.updateListItems();
  
  // Focus the item in its new position
  setTimeout(() => {
    const updatedItems = this.listElement?.querySelectorAll('.sortable-item');
    if (updatedItems && updatedItems[currentIndex - 1]) {
      (updatedItems[currentIndex - 1] as HTMLElement).focus();
    }
  }, 0);
}

// Similar implementations for moveItemDown, moveItemToTop, moveItemToBottom
```

### Touch Device Support

To enhance touch device support, add touch event handling:

```typescript
// Add to sortable-list.client.ts

private setupTouchEvents(): void {
  if (!this.listElement) return;
  
  let touchStartY = 0;
  let touchCurrentY = 0;
  let touchedItem: HTMLElement | null = null;
  let placeholder: HTMLElement | null = null;
  
  // Create touch start handler
  const handleTouchStart = (event: TouchEvent) => {
    const target = event.target as HTMLElement;
    touchedItem = target.closest('.sortable-item') as HTMLElement;
    
    if (!touchedItem) return;
    
    // Record start position
    touchStartY = event.touches[0].clientY;
    touchCurrentY = touchStartY;
    
    // Create placeholder
    placeholder = document.createElement('div');
    placeholder.className = 'drag-placeholder';
    placeholder.style.height = `${touchedItem.offsetHeight}px`;
    
    // Add dragging class to item
    touchedItem.classList.add('dragging');
    
    // Insert placeholder
    touchedItem.parentNode?.insertBefore(placeholder, touchedItem.nextSibling);
    
    // Add touch move and end listeners
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };
  
  // Create touch move handler
  const handleTouchMove = (event: TouchEvent) => {
    event.preventDefault();
    
    if (!touchedItem || !placeholder) return;
    
    // Update current position
    touchCurrentY = event.touches[0].clientY;
    
    // Calculate movement
    const deltaY = touchCurrentY - touchStartY;
    
    // Move the dragged item
    touchedItem.style.transform = `translateY(${deltaY}px)`;
    
    // Update placeholder position
    const items = Array.from(this.listElement!.querySelectorAll('.sortable-item:not(.dragging)'));
    let newIndex = items.findIndex(item => {
      const rect = item.getBoundingClientRect();
      return touchCurrentY < rect.top + rect.height / 2;
    });
    
    if (newIndex === -1) {
      newIndex = items.length;
    }
    
    // Move placeholder
    if (newIndex < items.length) {
      this.listElement?.insertBefore(placeholder, items[newIndex]);
    } else {
      this.listElement?.appendChild(placeholder);
    }
  };
  
  // Create touch end handler
  const handleTouchEnd = () => {
    if (!touchedItem || !placeholder || !this.listDataService) return;
    
    // Reset item style
    touchedItem.style.transform = '';
    touchedItem.classList.remove('dragging');
    
    // Get the new index
    const items = Array.from(this.listElement!.querySelectorAll('.sortable-item'));
    const fromIndex = items.indexOf(touchedItem);
    
    // Get the placeholder index
    const placeholderIndex = Array.from(this.listElement!.children).indexOf(placeholder);
    
    // Move the item in the data model
    const itemId = touchedItem.dataset.id;
    if (itemId) {
      let toIndex = placeholderIndex;
      if (fromIndex < placeholderIndex) {
        toIndex -= 1;
      }
      
      this.listDataService.reorderItems(this.listId, itemId, toIndex);
      
      // Update the UI
      this.updateListItems();
    }
    
    // Remove placeholder
    if (placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
    
    // Remove touch handlers
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    
    // Reset variables
    touchedItem = null;
    placeholder = null;
  };
  
  // Add touch start listener to list items
  this.listElement.addEventListener('touchstart', handleTouchStart);
}
```

### File Upload via Drag and Drop

To implement file upload via drag and drop:

```typescript
// Create a file-drop component

// src/components/drag-drop/file-drop/file-drop.client.ts
import { Blueprint } from 'asmbl';

export class FileDropClient extends Blueprint {
  private dropZone: HTMLElement | null = null;
  private fileInput: HTMLInputElement | null = null;
  private fileList: HTMLElement | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    this.dropZone = this.root.querySelector('.file-drop-zone');
    this.fileInput = this.root.querySelector('.file-input');
    this.fileList = this.root.querySelector('.file-list');
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    if (!this.dropZone || !this.fileInput) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dropZone?.addEventListener(eventName, this.preventDefaults, false);
      document.body.addEventListener(eventName, this.preventDefaults, false);
    });
    
    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropZone?.addEventListener(eventName, this.highlight.bind(this), false);
    });
    
    // Remove highlight when item is dragged away or dropped
    ['dragleave', 'drop'].forEach(eventName => {
      this.dropZone?.addEventListener(eventName, this.unhighlight.bind(this), false);
    });
    
    // Handle dropped files
    this.dropZone?.addEventListener('drop', this.handleDrop.bind(this), false);
    
    // Handle file input change
    this.fileInput?.addEventListener('change', this.handleFiles.bind(this), false);
    
    // Handle click on drop zone
    this.dropZone?.addEventListener('click', () => {
      this.fileInput?.click();
    });
  }
  
  private preventDefaults(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
  }
  
  private highlight(): void {
    this.dropZone?.classList.add('highlight');
  }
  
  private unhighlight(): void {
    this.dropZone?.classList.remove('highlight');
  }
  
  private handleDrop(e: DragEvent): void {
    const dt = e.dataTransfer;
    if (dt && dt.files) {
      this.handleFiles(dt.files);
    }
  }
  
  private handleFiles(e: Event | FileList): void {
    let files: FileList;
    
    if (e instanceof Event && (e.target as HTMLInputElement).files) {
      files = (e.target as HTMLInputElement).files!;
    } else if (e instanceof FileList) {
      files = e;
    } else {
      return;
    }
    
    this.updateFileList(files);
    this.uploadFiles(files);
  }
  
  private updateFileList(files: FileList): void {
    if (!this.fileList) return;
    
    // Clear file list
    this.fileList.innerHTML = '';
    
    if (files.length === 0) {
      this.fileList.innerHTML = '<li class="no-files">No files selected</li>';
      return;
    }
    
    // Add each file to the list
    Array.from(files).forEach(file => {
      const li = document.createElement('li');
      
      const fileInfo = document.createElement('div');
      fileInfo.className = 'file-info';
      
      const fileName = document.createElement('span');
      fileName.className = 'file-name';
      fileName.textContent = file.name;
      
      const fileSize = document.createElement('span');
      fileSize.className = 'file-size';
      fileSize.textContent = this.formatFileSize(file.size);
      
      fileInfo.appendChild(fileName);
      fileInfo.appendChild(fileSize);
      
      const progress = document.createElement('div');
      progress.className = 'progress';
      
      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      progressBar.setAttribute('data-file-name', file.name);
      
      progress.appendChild(progressBar);
      
      li.appendChild(fileInfo);
      li.appendChild(progress);
      
      this.fileList.appendChild(li);
    });
  }
  
  private uploadFiles(files: FileList): void {
    // In a real implementation, you would upload the files to a server
    // This is a simulated upload
    
    Array.from(files).forEach(file => {
      const progressBar = this.root.querySelector(`.progress-bar[data-file-name="${file.name}"]`) as HTMLElement;
      
      if (!progressBar) return;
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
          clearInterval(interval);
          progressBar.classList.add('complete');
        }
      }, 100);
    });
  }
  
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
```

## Conclusion

This cookbook demonstrated how to implement interactive drag and drop interfaces in AssembleJS applications using the ASM CLI for component generation. We covered:

1. **Basic Drag and Drop** - Using the native HTML5 drag and drop API
2. **Sortable Lists** - Creating reorderable list components
3. **Kanban Board** - Building a system for dragging items between containers
4. **Touch Support** - Making it work on mobile devices
5. **Keyboard Accessibility** - Ensuring it works for keyboard-only users
6. **File Upload** - Using drag and drop for file uploading

For production applications, consider the following enhancements:

1. **Animations** - Add smoother animations for drag and drop operations
2. **Performance Optimization** - Use virtualization for large lists
3. **External Libraries** - For more complex use cases, integrate libraries like SortableJS or react-beautiful-dnd
4. **Persistence** - Add real data persistence through APIs
5. **Enhanced Accessibility** - Add ARIA attributes and screen reader announcements

Remember that using the ASM CLI for component generation ensures your components follow AssembleJS best practices and maintain consistency across your application. Always prefer the `npx asmgen` commands for generating new components rather than creating files manually.