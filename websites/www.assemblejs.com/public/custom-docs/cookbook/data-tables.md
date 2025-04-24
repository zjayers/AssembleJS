# Data Tables & Grids

<iframe src="https://placeholder-for-assemblejs-data-tables-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

## Overview

Data tables and grids are complex UI components that require careful implementation for optimal performance and usability. This cookbook demonstrates how to build efficient, feature-rich tables in AssembleJS with features like sorting, filtering, pagination, and more.

## Prerequisites

- Basic knowledge of AssembleJS components and blueprints
- Familiarity with React component patterns
- Understanding of data manipulation concepts (sorting, filtering, etc.)

## Implementation Steps

### Step 1: Generate the Project Structure with ASM CLI

Start by using the ASM CLI to scaffold your project and generate the necessary components. This is the recommended approach for all AssembleJS components rather than creating them manually:

```bash
# If you haven't already, create a new AssembleJS project
npx asmgen new my-data-table-project

# Navigate to your project
cd my-data-table-project

# Generate the data table component using ASM CLI
npx asmgen component table data-table --template react
```

This will create a component structure with the following files:
- `src/components/table/data-table/data-table.view.tsx`
- `src/components/table/data-table/data-table.client.ts`
- `src/components/table/data-table/data-table.styles.scss`

### Step 2: Create a Data Service

We'll need a service to fetch and manage our data. Generate it using the ASM CLI:

```bash
npx asmgen service data
```

Now implement the data service:

```typescript
// src/services/data.service.ts
import { Service } from 'asmbl';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

export interface TableState {
  data: User[];
  filteredData: User[];
  page: number;
  pageSize: number;
  totalItems: number;
  sortField: keyof User | null;
  sortDirection: 'asc' | 'desc';
  filters: Record<string, string>;
  selectedRows: Set<number>;
}

export class DataService extends Service {
  private users: User[] = [];
  private loading: boolean = false;
  
  /**
   * Fetch users from API
   */
  async fetchUsers(): Promise<User[]> {
    if (this.users.length > 0) {
      return this.users;
    }
    
    this.loading = true;
    
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      this.users = await response.json();
      return this.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    } finally {
      this.loading = false;
    }
  }
  
  /**
   * Get initial table state
   */
  getInitialState(): TableState {
    return {
      data: [],
      filteredData: [],
      page: 1,
      pageSize: 5,
      totalItems: 0,
      sortField: null,
      sortDirection: 'asc',
      filters: {},
      selectedRows: new Set<number>()
    };
  }
  
  /**
   * Apply filters to data
   */
  applyFilters(
    data: User[],
    filters: Record<string, string>
  ): User[] {
    // If no filters, return original data
    if (Object.keys(filters).length === 0) {
      return [...data];
    }
    
    // Apply each filter
    return data.filter(item => {
      return Object.entries(filters).every(([field, value]) => {
        if (!value) return true;
        
        const fieldValue = String(item[field as keyof User] || '').toLowerCase();
        return fieldValue.includes(value.toLowerCase());
      });
    });
  }
  
  /**
   * Apply sorting to data
   */
  applySorting(
    data: User[],
    field: keyof User | null,
    direction: 'asc' | 'desc'
  ): User[] {
    if (!field) {
      return [...data];
    }
    
    return [...data].sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // Fall back to generic comparison
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  /**
   * Apply pagination to data
   */
  applyPagination(
    data: User[],
    page: number,
    pageSize: number
  ): User[] {
    const startIndex = (page - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }
  
  /**
   * Process table data with filters, sorting, and pagination
   */
  processTableData(state: TableState): {
    data: User[];
    totalItems: number;
  } {
    // Apply filters
    const filteredData = this.applyFilters(state.data, state.filters);
    
    // Apply sorting
    const sortedData = this.applySorting(
      filteredData,
      state.sortField,
      state.sortDirection
    );
    
    // Apply pagination
    const paginatedData = this.applyPagination(
      sortedData,
      state.page,
      state.pageSize
    );
    
    return {
      data: paginatedData,
      totalItems: filteredData.length
    };
  }
}
```

### Step 3: Create a Factory for the Data Table

Generate the factory using the ASM CLI:

```bash
npx asmgen factory table/data-table
```

Now implement the factory:

```typescript
// src/components/table/data-table/data-table.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { DataService, TableState } from '../../../services/data.service';

export class DataTableFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get the data service
    const dataService = context.services.get('dataService') as DataService;
    
    // Initialize table state
    const initialState = dataService.getInitialState();
    
    try {
      // Set loading state
      context.data.set('loading', true);
      
      // Fetch users
      const users = await dataService.fetchUsers();
      
      // Update table state with fetched data
      const tableState: TableState = {
        ...initialState,
        data: users,
        filteredData: users,
        totalItems: users.length
      };
      
      // Process the data (apply filters, sorting, pagination)
      const processedData = dataService.processTableData(tableState);
      
      // Set the component data
      context.data.set('tableData', processedData.data);
      context.data.set('totalItems', processedData.totalItems);
      context.data.set('currentPage', tableState.page);
      context.data.set('pageSize', tableState.pageSize);
      context.data.set('sortField', tableState.sortField);
      context.data.set('sortDirection', tableState.sortDirection);
      context.data.set('loading', false);
      
      // Pass full data to client for client-side operations
      context.data.set('allData', users);
      
    } catch (error) {
      console.error('Error initializing data table:', error);
      context.data.set('error', 'Failed to load data');
      context.data.set('loading', false);
    }
  }
}
```

### Step 4: Implement the Data Table View

Edit the React component view for the data table:

```tsx
// src/components/table/data-table/data-table.view.tsx
import React from 'react';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

interface DataTableProps {
  data: {
    tableData: User[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    sortField: keyof User | null;
    sortDirection: 'asc' | 'desc';
    loading: boolean;
    error?: string;
  };
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const {
    tableData,
    totalItems,
    currentPage,
    pageSize,
    sortField,
    sortDirection,
    loading,
    error
  } = data;
  
  const totalPages = Math.ceil(totalItems / pageSize);
  
  if (loading) {
    return <div className="data-table-loading">Loading data...</div>;
  }
  
  if (error) {
    return <div className="data-table-error">{error}</div>;
  }
  
  if (tableData.length === 0) {
    return <div className="data-table-empty">No data available</div>;
  }
  
  return (
    <div className="data-table-container">
      <div className="data-table-toolbar">
        <div className="data-table-search">
          <input
            type="text"
            placeholder="Search..."
            id="global-search"
            className="search-input"
          />
        </div>
        <div className="data-table-actions">
          <button id="refresh-button" className="action-button">
            Refresh
          </button>
        </div>
      </div>
      
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-select">
                <input type="checkbox" id="select-all" />
              </th>
              <th
                className={`sortable ${sortField === 'name' ? 'sorted-' + sortDirection : ''}`}
                data-field="name"
              >
                Name
                <span className="sort-icon">⇅</span>
              </th>
              <th
                className={`sortable ${sortField === 'username' ? 'sorted-' + sortDirection : ''}`}
                data-field="username"
              >
                Username
                <span className="sort-icon">⇅</span>
              </th>
              <th
                className={`sortable ${sortField === 'email' ? 'sorted-' + sortDirection : ''}`}
                data-field="email"
              >
                Email
                <span className="sort-icon">⇅</span>
              </th>
              <th
                className={`sortable ${sortField === 'phone' ? 'sorted-' + sortDirection : ''}`}
                data-field="phone"
              >
                Phone
                <span className="sort-icon">⇅</span>
              </th>
              <th
                className={`sortable ${sortField === 'website' ? 'sorted-' + sortDirection : ''}`}
                data-field="website"
              >
                Website
                <span className="sort-icon">⇅</span>
              </th>
              <th className="col-actions">Actions</th>
            </tr>
            <tr className="filter-row">
              <th></th>
              <th><input type="text" className="filter-input" data-field="name" placeholder="Filter name..." /></th>
              <th><input type="text" className="filter-input" data-field="username" placeholder="Filter username..." /></th>
              <th><input type="text" className="filter-input" data-field="email" placeholder="Filter email..." /></th>
              <th><input type="text" className="filter-input" data-field="phone" placeholder="Filter phone..." /></th>
              <th><input type="text" className="filter-input" data-field="website" placeholder="Filter website..." /></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tableData.map(user => (
              <tr key={user.id} data-id={user.id}>
                <td className="col-select">
                  <input type="checkbox" className="row-select" data-id={user.id} />
                </td>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                <td>{user.phone}</td>
                <td><a href={`https://${user.website}`} target="_blank" rel="noreferrer">{user.website}</a></td>
                <td className="col-actions">
                  <button className="action-button view-button" data-id={user.id}>
                    View
                  </button>
                  <button className="action-button edit-button" data-id={user.id}>
                    Edit
                  </button>
                  <button className="action-button delete-button" data-id={user.id}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="data-table-pagination">
        <div className="pagination-info">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </div>
        <div className="pagination-controls">
          <button 
            className="pagination-button" 
            disabled={currentPage === 1}
            data-page="prev"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-button ${page === currentPage ? 'active' : ''}`}
              data-page={page}
            >
              {page}
            </button>
          ))}
          
          <button 
            className="pagination-button" 
            disabled={currentPage === totalPages}
            data-page="next"
          >
            Next
          </button>
        </div>
        <div className="pagination-size">
          <label>
            Show 
            <select id="page-size" value={pageSize}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            entries
          </label>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
```

### Step 5: Implement Client-Side Functionality

Edit the client file to implement the interactive functionality:

```typescript
// src/components/table/data-table/data-table.client.ts
import { Blueprint } from 'asmbl';
import { DataService, User, TableState } from '../../../services/data.service';

export class DataTableClient extends Blueprint {
  private dataService: DataService | null = null;
  private tableState: TableState = {
    data: [],
    filteredData: [],
    page: 1,
    pageSize: 5,
    totalItems: 0,
    sortField: null,
    sortDirection: 'asc',
    filters: {},
    selectedRows: new Set<number>()
  };
  
  // DOM Elements
  private table: HTMLTableElement | null = null;
  private sortHeaders: NodeListOf<HTMLTableCellElement> | null = null;
  private filterInputs: NodeListOf<HTMLInputElement> | null = null;
  private globalSearch: HTMLInputElement | null = null;
  private selectAllCheckbox: HTMLInputElement | null = null;
  private rowCheckboxes: NodeListOf<HTMLInputElement> | null = null;
  private paginationButtons: NodeListOf<HTMLButtonElement> | null = null;
  private pageSizeSelect: HTMLSelectElement | null = null;
  private refreshButton: HTMLButtonElement | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    // Get services
    this.dataService = this.services.get('dataService') as DataService;
    
    // Initialize table state from context data
    this.initializeTableState();
    
    // Get DOM elements
    this.getElements();
    
    // Add event listeners
    this.addEventListeners();
  }
  
  private initializeTableState(): void {
    // Get initial data from context
    const allData = this.context.get('allData') as User[];
    
    this.tableState = {
      data: allData || [],
      filteredData: allData || [],
      page: this.context.get('currentPage') || 1,
      pageSize: this.context.get('pageSize') || 5,
      totalItems: this.context.get('totalItems') || 0,
      sortField: this.context.get('sortField') as keyof User | null,
      sortDirection: this.context.get('sortDirection') as 'asc' | 'desc',
      filters: {},
      selectedRows: new Set<number>()
    };
  }
  
  private getElements(): void {
    this.table = this.root.querySelector('.data-table');
    this.sortHeaders = this.root.querySelectorAll('th.sortable');
    this.filterInputs = this.root.querySelectorAll('.filter-input');
    this.globalSearch = this.root.querySelector('#global-search');
    this.selectAllCheckbox = this.root.querySelector('#select-all');
    this.rowCheckboxes = this.root.querySelectorAll('.row-select');
    this.paginationButtons = this.root.querySelectorAll('.pagination-button');
    this.pageSizeSelect = this.root.querySelector('#page-size');
    this.refreshButton = this.root.querySelector('#refresh-button');
  }
  
  private addEventListeners(): void {
    // Sorting
    this.sortHeaders?.forEach(header => {
      header.addEventListener('click', this.handleSort.bind(this));
    });
    
    // Filtering
    this.filterInputs?.forEach(input => {
      input.addEventListener('input', this.handleFilter.bind(this));
    });
    
    // Global search
    this.globalSearch?.addEventListener('input', this.handleGlobalSearch.bind(this));
    
    // Row selection
    this.selectAllCheckbox?.addEventListener('change', this.handleSelectAll.bind(this));
    this.rowCheckboxes?.forEach(checkbox => {
      checkbox.addEventListener('change', this.handleRowSelect.bind(this));
    });
    
    // Pagination
    this.paginationButtons?.forEach(button => {
      button.addEventListener('click', this.handlePageChange.bind(this));
    });
    
    // Page size
    this.pageSizeSelect?.addEventListener('change', this.handlePageSizeChange.bind(this));
    
    // Refresh data
    this.refreshButton?.addEventListener('click', this.handleRefresh.bind(this));
    
    // Row actions
    this.root.querySelectorAll('.view-button').forEach(button => {
      button.addEventListener('click', this.handleViewAction.bind(this));
    });
    
    this.root.querySelectorAll('.edit-button').forEach(button => {
      button.addEventListener('click', this.handleEditAction.bind(this));
    });
    
    this.root.querySelectorAll('.delete-button').forEach(button => {
      button.addEventListener('click', this.handleDeleteAction.bind(this));
    });
  }
  
  private handleSort(event: Event): void {
    const header = event.currentTarget as HTMLTableCellElement;
    const field = header.dataset.field as keyof User;
    
    // Toggle sort direction or set to 'asc' if sorting a new field
    const direction = 
      field === this.tableState.sortField && this.tableState.sortDirection === 'asc'
        ? 'desc'
        : 'asc';
    
    // Update table state
    this.tableState.sortField = field;
    this.tableState.sortDirection = direction;
    
    // Re-render the table
    this.updateTable();
  }
  
  private handleFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    const field = input.dataset.field as string;
    const value = input.value;
    
    // Update filters
    if (value) {
      this.tableState.filters[field] = value;
    } else {
      delete this.tableState.filters[field];
    }
    
    // Reset to first page when filtering
    this.tableState.page = 1;
    
    // Re-render the table
    this.updateTable();
  }
  
  private handleGlobalSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Clear existing filters
    this.tableState.filters = {};
    
    // Set up global search across all fields
    if (value) {
      // In a real implementation, you'd apply the search across all fields
      // For simplicity, we'll just search the name field
      this.tableState.filters['name'] = value;
    }
    
    // Reset to first page when searching
    this.tableState.page = 1;
    
    // Re-render the table
    this.updateTable();
  }
  
  private handleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    
    // Update all row checkboxes
    this.rowCheckboxes?.forEach(rowCheckbox => {
      rowCheckbox.checked = isChecked;
      
      const id = Number(rowCheckbox.dataset.id);
      if (isChecked) {
        this.tableState.selectedRows.add(id);
      } else {
        this.tableState.selectedRows.delete(id);
      }
    });
    
    // Update selection UI
    this.updateSelectionUI();
  }
  
  private handleRowSelect(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const id = Number(checkbox.dataset.id);
    
    if (checkbox.checked) {
      this.tableState.selectedRows.add(id);
    } else {
      this.tableState.selectedRows.delete(id);
    }
    
    // Update "select all" checkbox
    if (this.selectAllCheckbox) {
      this.selectAllCheckbox.checked = 
        this.rowCheckboxes !== null &&
        this.tableState.selectedRows.size === this.rowCheckboxes.length;
    }
    
    // Update selection UI
    this.updateSelectionUI();
  }
  
  private handlePageChange(event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    const page = button.dataset.page;
    
    if (page === 'prev') {
      this.tableState.page = Math.max(1, this.tableState.page - 1);
    } else if (page === 'next') {
      const maxPage = Math.ceil(this.tableState.totalItems / this.tableState.pageSize);
      this.tableState.page = Math.min(maxPage, this.tableState.page + 1);
    } else {
      this.tableState.page = Number(page);
    }
    
    // Re-render the table
    this.updateTable();
  }
  
  private handlePageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.tableState.pageSize = Number(select.value);
    
    // Reset to first page when changing page size
    this.tableState.page = 1;
    
    // Re-render the table
    this.updateTable();
  }
  
  private handleRefresh(): void {
    // Show loading state
    this.root.querySelector('.data-table-wrapper')?.classList.add('loading');
    
    // Fetch fresh data
    this.dataService?.fetchUsers().then(users => {
      // Update table state
      this.tableState.data = users;
      
      // Re-apply filters and sorting
      this.updateTable();
      
      // Hide loading state
      this.root.querySelector('.data-table-wrapper')?.classList.remove('loading');
    });
  }
  
  private handleViewAction(event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    const id = Number(button.dataset.id);
    
    const user = this.tableState.data.find(u => u.id === id);
    
    if (user) {
      alert(`Viewing user: ${user.name}`);
      // In a real app, you'd navigate to a detail page or show a modal
    }
  }
  
  private handleEditAction(event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    const id = Number(button.dataset.id);
    
    const user = this.tableState.data.find(u => u.id === id);
    
    if (user) {
      alert(`Editing user: ${user.name}`);
      // In a real app, you'd navigate to an edit page or show a modal
    }
  }
  
  private handleDeleteAction(event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    const id = Number(button.dataset.id);
    
    const user = this.tableState.data.find(u => u.id === id);
    
    if (user && confirm(`Are you sure you want to delete ${user.name}?`)) {
      // In a real app, you'd make an API call to delete the user
      // For this example, we'll just remove it from the local data
      
      this.tableState.data = this.tableState.data.filter(u => u.id !== id);
      
      // Re-render the table
      this.updateTable();
    }
  }
  
  private updateTable(): void {
    if (!this.dataService) return;
    
    // Apply filters to get filtered data
    this.tableState.filteredData = this.dataService.applyFilters(
      this.tableState.data,
      this.tableState.filters
    );
    
    // Update total items
    this.tableState.totalItems = this.tableState.filteredData.length;
    
    // Process data for the current page
    const { data: displayData } = this.dataService.processTableData(this.tableState);
    
    // Update the table body with new data
    this.updateTableBody(displayData);
    
    // Update pagination display
    this.updatePaginationUI();
    
    // Update sorting UI
    this.updateSortingUI();
  }
  
  private updateTableBody(data: User[]): void {
    if (!this.table) return;
    
    const tbody = this.table.querySelector('tbody');
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Add new rows
    data.forEach(user => {
      const row = document.createElement('tr');
      row.setAttribute('data-id', String(user.id));
      
      // Add row content
      row.innerHTML = `
        <td class="col-select">
          <input type="checkbox" class="row-select" data-id="${user.id}" ${
            this.tableState.selectedRows.has(user.id) ? 'checked' : ''
          } />
        </td>
        <td>${user.name}</td>
        <td>${user.username}</td>
        <td><a href="mailto:${user.email}">${user.email}</a></td>
        <td>${user.phone}</td>
        <td><a href="https://${user.website}" target="_blank" rel="noreferrer">${user.website}</a></td>
        <td class="col-actions">
          <button class="action-button view-button" data-id="${user.id}">View</button>
          <button class="action-button edit-button" data-id="${user.id}">Edit</button>
          <button class="action-button delete-button" data-id="${user.id}">Delete</button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    // Re-attach event listeners for the new elements
    this.rowCheckboxes = this.root.querySelectorAll('.row-select');
    this.rowCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', this.handleRowSelect.bind(this));
    });
    
    this.root.querySelectorAll('.view-button').forEach(button => {
      button.addEventListener('click', this.handleViewAction.bind(this));
    });
    
    this.root.querySelectorAll('.edit-button').forEach(button => {
      button.addEventListener('click', this.handleEditAction.bind(this));
    });
    
    this.root.querySelectorAll('.delete-button').forEach(button => {
      button.addEventListener('click', this.handleDeleteAction.bind(this));
    });
  }
  
  private updatePaginationUI(): void {
    // Update pagination info text
    const paginationInfo = this.root.querySelector('.pagination-info');
    if (paginationInfo) {
      const start = ((this.tableState.page - 1) * this.tableState.pageSize) + 1;
      const end = Math.min(this.tableState.page * this.tableState.pageSize, this.tableState.totalItems);
      paginationInfo.textContent = `Showing ${start} to ${end} of ${this.tableState.totalItems} entries`;
    }
    
    // Update pagination buttons
    const totalPages = Math.ceil(this.tableState.totalItems / this.tableState.pageSize);
    
    // Clear existing page buttons
    const paginationControls = this.root.querySelector('.pagination-controls');
    if (paginationControls) {
      // Keep the "Previous" button
      const prevButton = paginationControls.querySelector('[data-page="prev"]');
      
      // Keep the "Next" button
      const nextButton = paginationControls.querySelector('[data-page="next"]');
      
      // Clear middle buttons
      paginationControls.innerHTML = '';
      
      // Add "Previous" button back
      if (prevButton) {
        (prevButton as HTMLButtonElement).disabled = this.tableState.page === 1;
        paginationControls.appendChild(prevButton);
      }
      
      // Add page buttons
      for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `pagination-button ${i === this.tableState.page ? 'active' : ''}`;
        button.setAttribute('data-page', String(i));
        button.textContent = String(i);
        button.addEventListener('click', this.handlePageChange.bind(this));
        paginationControls.appendChild(button);
      }
      
      // Add "Next" button back
      if (nextButton) {
        (nextButton as HTMLButtonElement).disabled = this.tableState.page === totalPages;
        paginationControls.appendChild(nextButton);
      }
    }
  }
  
  private updateSortingUI(): void {
    // Remove all sorting classes
    this.sortHeaders?.forEach(header => {
      header.classList.remove('sorted-asc', 'sorted-desc');
    });
    
    // Add sorting class to the current sort header
    if (this.tableState.sortField) {
      const header = this.root.querySelector(`th[data-field="${this.tableState.sortField}"]`);
      header?.classList.add(`sorted-${this.tableState.sortDirection}`);
    }
  }
  
  private updateSelectionUI(): void {
    // Update any UI elements that depend on selection
    const selectedCount = this.tableState.selectedRows.size;
    
    // For example, you might enable/disable bulk action buttons
    const bulkActionButtons = this.root.querySelectorAll('.bulk-action');
    bulkActionButtons.forEach(button => {
      (button as HTMLButtonElement).disabled = selectedCount === 0;
    });
  }
}

export default DataTableClient;
```

### Step 6: Style the Data Table

Add the styles for the data table:

```scss
// src/components/table/data-table/data-table.styles.scss
.data-table-container {
  font-family: Arial, sans-serif;
  margin: 20px 0;
  
  // Loading and error states
  .data-table-loading,
  .data-table-error,
  .data-table-empty {
    padding: 30px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 4px;
    margin: 20px 0;
  }
  
  .data-table-error {
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
  }
  
  // Toolbar
  .data-table-toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    
    .data-table-search {
      .search-input {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 250px;
        font-size: 14px;
        
        &:focus {
          outline: none;
          border-color: #4a90e2;
        }
      }
    }
    
    .data-table-actions {
      .action-button {
        padding: 8px 12px;
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        
        &:hover {
          background-color: #3a7bc8;
        }
        
        &:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
      }
    }
  }
  
  // Table wrapper
  .data-table-wrapper {
    overflow-x: auto;
    position: relative;
    
    &.loading::after {
      content: "Loading...";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
    }
  }
  
  // Table styles
  .data-table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    thead {
      th {
        background-color: #f2f2f2;
        font-weight: bold;
        position: sticky;
        top: 0;
        z-index: 10;
        
        &.sortable {
          cursor: pointer;
          user-select: none;
          
          .sort-icon {
            opacity: 0.3;
            margin-left: 5px;
          }
          
          &:hover {
            background-color: #e5e5e5;
            
            .sort-icon {
              opacity: 0.6;
            }
          }
          
          &.sorted-asc, &.sorted-desc {
            background-color: #e0e0e0;
            
            .sort-icon {
              opacity: 1;
            }
          }
          
          &.sorted-asc .sort-icon::after {
            content: "↑";
          }
          
          &.sorted-desc .sort-icon::after {
            content: "↓";
          }
        }
      }
      
      .filter-row {
        th {
          padding: 5px;
          
          .filter-input {
            width: 100%;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
            
            &:focus {
              outline: none;
              border-color: #4a90e2;
            }
          }
        }
      }
    }
    
    tbody {
      tr {
        &:hover {
          background-color: #f5f5f5;
        }
        
        &.selected {
          background-color: #e3f2fd;
        }
      }
    }
    
    // Column specific styles
    .col-select {
      width: 40px;
      text-align: center;
    }
    
    .col-actions {
      width: 180px;
      white-space: nowrap;
      
      .action-button {
        padding: 4px 8px;
        border: none;
        border-radius: 3px;
        font-size: 12px;
        margin-right: 5px;
        cursor: pointer;
        
        &.view-button {
          background-color: #4a90e2;
          color: white;
          
          &:hover {
            background-color: #3a7bc8;
          }
        }
        
        &.edit-button {
          background-color: #f0ad4e;
          color: white;
          
          &:hover {
            background-color: #ec971f;
          }
        }
        
        &.delete-button {
          background-color: #d9534f;
          color: white;
          
          &:hover {
            background-color: #c9302c;
          }
        }
      }
    }
  }
  
  // Pagination
  .data-table-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    font-size: 14px;
    
    .pagination-info {
      color: #666;
    }
    
    .pagination-controls {
      .pagination-button {
        padding: 5px 10px;
        margin: 0 2px;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 3px;
        font-size: 14px;
        cursor: pointer;
        
        &:hover:not(:disabled) {
          background-color: #e9ecef;
        }
        
        &.active {
          background-color: #4a90e2;
          color: white;
          border-color: #4a90e2;
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
    
    .pagination-size {
      select {
        padding: 5px;
        margin: 0 5px;
        border: 1px solid #ddd;
        border-radius: 3px;
      }
    }
  }
  
  // Responsive styles
  @media (max-width: 768px) {
    .data-table {
      // Make the table scrollable horizontally
      display: block;
      width: 100%;
      overflow-x: auto;
      
      // Adjust column widths for mobile
      th, td {
        min-width: 120px;
      }
      
      .col-actions {
        min-width: 180px;
      }
    }
    
    .data-table-pagination {
      flex-direction: column;
      
      .pagination-info,
      .pagination-controls,
      .pagination-size {
        margin-bottom: 10px;
      }
    }
  }
}
```

### Step 7: Register the Component and Service

Update your server.ts to register the data table component and its dependencies:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { DataService } from "./services/data.service";
import { DataTableFactory } from "./components/table/data-table/data-table.factory";

// Create services
const dataService = new DataService();

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'table',
        views: [{
          viewName: 'data-table',
          templateFile: 'data-table.view.tsx',
          factory: new DataTableFactory()
        }]
      }
    ],
    services: [
      {
        name: 'dataService',
        service: dataService
      }
    ]
  }
});
```

### Step 8: Create a Blueprint to Display the Data Table

Generate a blueprint to display our data table:

```bash
npx asmgen blueprint data-table
```

Now implement the blueprint:

```tsx
// src/blueprints/data-table/main/main.view.tsx
import React from 'react';

const DataTablePage: React.FC = () => {
  return (
    <div className="data-table-page">
      <header className="header">
        <h1>AssembleJS Data Table Example</h1>
        <p>A fully-featured data table with sorting, filtering, and pagination</p>
      </header>
      
      <main className="main-content">
        <section className="description">
          <h2>Features</h2>
          <ul>
            <li>Sorting by clicking column headers</li>
            <li>Filtering by column or global search</li>
            <li>Pagination with customizable page size</li>
            <li>Row selection with bulk actions</li>
            <li>Responsive design for all screen sizes</li>
          </ul>
        </section>
        
        <section className="example">
          <h2>Example</h2>
          <div className="data-table-wrapper" data-component="table/data-table"></div>
        </section>
      </main>
      
      <footer className="footer">
        <p>AssembleJS Data Table Cookbook Example</p>
      </footer>
    </div>
  );
};

export default DataTablePage;
```

Add the blueprint route to your server.ts:

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
        path: 'data-table',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/data-table'
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

### Virtual Scrolling for Large Datasets

For very large datasets, implement virtual scrolling to render only the visible rows:

```typescript
// Add to data-table.client.ts

private initializeVirtualScroll(): void {
  const tableWrapper = this.root.querySelector('.data-table-wrapper');
  if (!tableWrapper) return;
  
  // Calculate visible rows based on viewport height
  const rowHeight = 40; // Approximate height of each row in pixels
  const visibleHeight = tableWrapper.clientHeight;
  const visibleRows = Math.ceil(visibleHeight / rowHeight);
  
  // Add buffer rows above and below
  const bufferRows = 5;
  const totalRenderedRows = visibleRows + bufferRows * 2;
  
  // Track scroll position
  let lastScrollTop = 0;
  
  tableWrapper.addEventListener('scroll', () => {
    const scrollTop = tableWrapper.scrollTop;
    
    // Only update if scrolled enough to show new rows
    if (Math.abs(scrollTop - lastScrollTop) > rowHeight / 2) {
      lastScrollTop = scrollTop;
      
      // Calculate first visible row
      const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferRows);
      
      // Update virtual window
      this.updateVirtualWindow(startIndex, totalRenderedRows);
    }
  });
}

private updateVirtualWindow(startIndex: number, count: number): void {
  if (!this.dataService) return;
  
  // Get the total dataset after filtering and sorting
  const processedData = this.dataService.applySorting(
    this.dataService.applyFilters(this.tableState.data, this.tableState.filters),
    this.tableState.sortField,
    this.tableState.sortDirection
  );
  
  // Get the slice of data to render
  const endIndex = Math.min(startIndex + count, processedData.length);
  const visibleData = processedData.slice(startIndex, endIndex);
  
  // Update the table body with just the visible rows
  this.updateTableBody(visibleData);
  
  // Set the position of the tbody to create the illusion of scrolling
  const tbody = this.table?.querySelector('tbody');
  if (tbody) {
    tbody.style.transform = `translateY(${startIndex * 40}px)`;
  }
}
```

### Editable Cells

Implement inline cell editing functionality:

```typescript
// Add to data-table.client.ts

private enableCellEditing(): void {
  // Find cells that should be editable
  const editableCells = this.root.querySelectorAll('td.editable');
  
  editableCells.forEach(cell => {
    // Add double-click listener
    cell.addEventListener('dblclick', this.handleCellEdit.bind(this));
  });
}

private handleCellEdit(event: Event): void {
  const cell = event.currentTarget as HTMLTableCellElement;
  const row = cell.closest('tr');
  const userId = Number(row?.dataset.id);
  const field = cell.dataset.field as keyof User;
  const currentValue = cell.textContent || '';
  
  // Create input element
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentValue;
  input.className = 'cell-edit-input';
  
  // Replace cell content with input
  cell.textContent = '';
  cell.appendChild(input);
  
  // Focus the input
  input.focus();
  input.select();
  
  // Save on enter or blur
  const saveChanges = () => {
    const newValue = input.value;
    
    // Update the data
    const user = this.tableState.data.find(u => u.id === userId);
    if (user) {
      user[field] = newValue;
    }
    
    // Update the cell
    cell.textContent = newValue;
    
    // Remove event listeners
    input.removeEventListener('blur', saveChanges);
    input.removeEventListener('keydown', handleKeyDown);
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveChanges();
    } else if (e.key === 'Escape') {
      // Cancel editing
      cell.textContent = currentValue;
      input.removeEventListener('blur', saveChanges);
      input.removeEventListener('keydown', handleKeyDown);
    }
  };
  
  input.addEventListener('blur', saveChanges);
  input.addEventListener('keydown', handleKeyDown);
}
```

### Column Resizing

Add column resizing functionality:

```typescript
// Add to data-table.client.ts

private enableColumnResizing(): void {
  const headers = this.root.querySelectorAll('th');
  
  headers.forEach(header => {
    // Create resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    header.appendChild(resizeHandle);
    
    // Track resize state
    let startX: number;
    let startWidth: number;
    
    // Mouse down on resize handle
    resizeHandle.addEventListener('mousedown', (e) => {
      startX = e.pageX;
      startWidth = header.offsetWidth;
      
      // Add event listeners for resize tracking
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      
      // Prevent text selection during resize
      e.preventDefault();
    });
    
    // Handle mouse movement during resize
    const onMouseMove = (e: MouseEvent) => {
      const width = startWidth + (e.pageX - startX);
      
      // Enforce minimum width
      if (width >= 50) {
        header.style.width = `${width}px`;
      }
    };
    
    // Clean up event listeners on mouse up
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  });
}
```

## Conclusion

This cookbook demonstrated how to build a full-featured data table component in AssembleJS, leveraging the ASM CLI for efficient component generation. The implementation includes:

1. **Sorting** - Click on column headers to sort the table
2. **Filtering** - Filter by column or use global search
3. **Pagination** - Navigate through large datasets with customizable page sizes
4. **Row Selection** - Select individual rows or all rows for bulk actions
5. **Row Actions** - View, edit, or delete individual rows
6. **Responsive Design** - Works on all screen sizes

For larger projects, this approach could be extended with:

1. **Expandable Rows** - Show additional details for each row
2. **CSV/Excel Export** - Allow users to download the data
3. **Custom Column Settings** - Let users choose which columns to display
4. **Drag and Drop Column Reordering** - Allow users to reorder columns
5. **Local Storage Persistence** - Save user preferences between sessions

Remember that using the ASM CLI for component generation ensures your components follow AssembleJS best practices and maintain consistency across your application. Always prefer the `npx asmgen` commands for generating new components rather than creating files manually.