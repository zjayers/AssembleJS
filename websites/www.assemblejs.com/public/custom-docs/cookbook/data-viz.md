# Data Visualization

<iframe src="https://placeholder-for-assemblejs-data-viz-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

## Overview

Data visualization is a powerful way to represent complex information visually. This cookbook demonstrates how to integrate chart libraries with AssembleJS to create interactive, responsive, and performant data visualizations.

## Prerequisites

- Basic knowledge of AssembleJS components and services
- Familiarity with JavaScript and TypeScript
- Understanding of basic charting concepts

## Implementation Steps

### Step 1: Generate the Project Structure with ASM CLI

Start by using the ASM CLI to scaffold your project and generate the necessary components:

```bash
# If you haven't already, create a new AssembleJS project
npx asmgen new my-data-viz-project

# Navigate to your project
cd my-data-viz-project

# Generate the chart component using ASM CLI
npx asmgen component charts bar-chart --template react
```

This will create a component structure with the following files:
- `src/components/charts/bar-chart/bar-chart.view.tsx`
- `src/components/charts/bar-chart/bar-chart.client.ts`
- `src/components/charts/bar-chart/bar-chart.styles.scss`

### Step 2: Install Chart.js Library

We'll use Chart.js, a popular and lightweight charting library:

```bash
npm install chart.js
```

### Step 3: Create a Data Service for Analytics

Generate a service to manage our chart data:

```bash
npx asmgen service analytics
```

Implement the analytics service:

```typescript
// src/services/analytics.service.ts
import { Service } from 'asmbl';

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export class AnalyticsService extends Service {
  /**
   * Get sales data for bar chart
   */
  getSalesData(): ChartData {
    return {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [{
        label: 'Sales 2023',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }, {
        label: 'Sales 2022',
        data: [9, 12, 8, 4, 6, 5],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }]
    };
  }
  
  /**
   * Get traffic data for line chart
   */
  getTrafficData(): ChartData {
    return {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [{
        label: 'Website Traffic',
        data: [2500, 3200, 4100, 3800, 5200, 6100],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2
      }]
    };
  }
  
  /**
   * Get category distribution for pie chart
   */
  getCategoryData(): ChartData {
    return {
      labels: ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Beauty'],
      datasets: [{
        label: 'Sales by Category',
        data: [35, 25, 15, 15, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    };
  }
  
  /**
   * Fetch real data from an API
   * In a real application, you would connect to your actual data sources
   */
  async fetchRealTimeData(dataType: 'sales' | 'traffic' | 'category'): Promise<ChartData> {
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data based on type
    switch (dataType) {
      case 'sales':
        return this.getSalesData();
      case 'traffic':
        return this.getTrafficData();
      case 'category':
        return this.getCategoryData();
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }
}
```

### Step 4: Create a Factory for the Bar Chart

Generate a factory for our bar chart:

```bash
npx asmgen factory charts/bar-chart
```

Implement the factory:

```typescript
// src/components/charts/bar-chart/bar-chart.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { AnalyticsService, ChartData } from '../../../services/analytics.service';

export class BarChartFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get analytics service
    const analyticsService = context.services.get('analyticsService') as AnalyticsService;
    
    try {
      // Set loading state
      context.data.set('loading', true);
      context.data.set('error', null);
      
      // Get the chart type from parameters or default to 'sales'
      const chartType = (context.params.get('type') as 'sales' | 'traffic' | 'category') || 'sales';
      
      // Fetch data based on chart type
      const chartData = await analyticsService.fetchRealTimeData(chartType);
      
      // Get chart options from parameters or use defaults
      const chartTitle = context.params.get('title') as string || 'Sales Data';
      const stacked = context.params.get('stacked') === 'true';
      
      // Configure chart options
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: chartTitle
          },
          legend: {
            position: 'top' as const
          }
        },
        scales: {
          x: {
            stacked
          },
          y: {
            stacked,
            beginAtZero: true
          }
        }
      };
      
      // Set data for the component
      context.data.set('chartData', chartData);
      context.data.set('options', options);
      context.data.set('chartType', chartType);
      context.data.set('loading', false);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      context.data.set('error', 'Failed to load chart data');
      context.data.set('loading', false);
    }
  }
}
```

### Step 5: Implement the Bar Chart View

Edit the React component view for the bar chart:

```tsx
// src/components/charts/bar-chart/bar-chart.view.tsx
import React from 'react';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

interface BarChartProps {
  data: {
    chartData: ChartData;
    options: any;
    chartType: string;
    loading: boolean;
    error: string | null;
  };
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const { chartData, options, chartType, loading, error } = data;
  
  if (loading) {
    return <div className="chart-loading">Loading chart data...</div>;
  }
  
  if (error) {
    return <div className="chart-error">{error}</div>;
  }
  
  return (
    <div className="chart-container">
      <div className="chart-actions">
        <div className="chart-type-selector">
          <label htmlFor="chart-type">Chart Type:</label>
          <select id="chart-type" defaultValue={chartType}>
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>
        </div>
        <button id="refresh-chart" className="refresh-button">
          Refresh Data
        </button>
      </div>
      
      {/* Chart canvas - will be initialized in client code */}
      <div className="chart-wrapper">
        <canvas id="chart-canvas" width="400" height="300"></canvas>
      </div>
    </div>
  );
};

export default BarChart;
```

### Step 6: Implement the Client-Side Code

Edit the client file to initialize and handle the Chart.js integration:

```typescript
// src/components/charts/bar-chart/bar-chart.client.ts
import { Blueprint } from 'asmbl';
import { AnalyticsService, ChartData } from '../../../services/analytics.service';
import Chart from 'chart.js/auto';

export class BarChartClient extends Blueprint {
  private chart: Chart | null = null;
  private chartData: ChartData | null = null;
  private analyticsService: AnalyticsService | null = null;
  private chartCanvas: HTMLCanvasElement | null = null;
  private chartTypeSelector: HTMLSelectElement | null = null;
  private refreshButton: HTMLButtonElement | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    // Get dependencies
    this.analyticsService = this.services.get('analyticsService') as AnalyticsService;
    
    // Get chart data from context
    this.chartData = this.context.get('chartData');
    const options = this.context.get('options');
    
    // Get DOM elements
    this.chartCanvas = this.root.querySelector('#chart-canvas');
    this.chartTypeSelector = this.root.querySelector('#chart-type');
    this.refreshButton = this.root.querySelector('#refresh-chart');
    
    // Initialize chart if we have everything we need
    if (this.chartCanvas && this.chartData) {
      this.initializeChart(this.chartData, options);
    }
    
    // Add event listeners
    this.chartTypeSelector?.addEventListener('change', this.handleChartTypeChange.bind(this));
    this.refreshButton?.addEventListener('click', this.handleRefresh.bind(this));
    
    // Listen for window resize to make the chart responsive
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  protected override onUnmount(): void {
    super.onUnmount();
    
    // Clean up resources
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
  
  private initializeChart(data: ChartData, options: any): void {
    if (!this.chartCanvas) return;
    
    // Get current chart type
    const chartType = this.chartTypeSelector?.value || 'bar';
    
    // Destroy existing chart if any
    if (this.chart) {
      this.chart.destroy();
    }
    
    // Create new chart
    const ctx = this.chartCanvas.getContext('2d');
    if (!ctx) return;
    
    this.chart = new Chart(ctx, {
      type: chartType as 'bar' | 'line' | 'pie',
      data,
      options
    });
  }
  
  private async handleChartTypeChange(): Promise<void> {
    if (!this.chartTypeSelector || !this.chart || !this.chartData) return;
    
    const newChartType = this.chartTypeSelector.value as 'bar' | 'line' | 'pie';
    
    // Update chart type
    this.chart.config.type = newChartType;
    
    // For pie charts, we need to adjust the data format slightly
    if (newChartType === 'pie' && this.chartData.datasets.length > 1) {
      // For pie charts, we can only have one dataset
      // So we'll use just the first dataset
      const firstDataset = this.chartData.datasets[0];
      this.chart.data.datasets = [{
        ...firstDataset,
        backgroundColor: Array.isArray(firstDataset.backgroundColor) 
          ? firstDataset.backgroundColor 
          : this.generateColors(this.chartData.labels.length)
      }];
    } else {
      // Restore original datasets for other chart types
      this.chart.data.datasets = this.chartData.datasets;
    }
    
    // Update the chart
    this.chart.update();
  }
  
  private async handleRefresh(): Promise<void> {
    if (!this.analyticsService || !this.chartTypeSelector) return;
    
    // Show loading state
    if (this.refreshButton) {
      this.refreshButton.disabled = true;
      this.refreshButton.textContent = 'Loading...';
    }
    
    try {
      // Get the current chart type
      const currentType = this.context.get('chartType') || 'sales';
      
      // Fetch fresh data
      const newData = await this.analyticsService.fetchRealTimeData(
        currentType as 'sales' | 'traffic' | 'category'
      );
      
      // Update chart data
      this.chartData = newData;
      
      if (this.chart) {
        this.chart.data.labels = newData.labels;
        this.chart.data.datasets = newData.datasets;
        this.chart.update();
      }
    } catch (error) {
      console.error('Error refreshing chart data:', error);
    } finally {
      // Reset button state
      if (this.refreshButton) {
        this.refreshButton.disabled = false;
        this.refreshButton.textContent = 'Refresh Data';
      }
    }
  }
  
  private handleResize(): void {
    // Update chart on window resize
    if (this.chart) {
      this.chart.resize();
    }
  }
  
  private generateColors(count: number): string[] {
    // Generate random colors for pie chart segments
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(`hsl(${(i * 360) / count}, 70%, 60%)`);
    }
    return colors;
  }
}

export default BarChartClient;
```

### Step 7: Add Styles for the Chart

Add styles for our chart component:

```scss
// src/components/charts/bar-chart/bar-chart.styles.scss
.chart-container {
  margin: 20px 0;
  width: 100%;
  max-width: 1000px;
  font-family: Arial, sans-serif;
  
  // Loading and error states
  .chart-loading,
  .chart-error {
    padding: 30px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 4px;
    margin: 20px 0;
  }
  
  .chart-error {
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
  }
  
  // Chart actions bar
  .chart-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    .chart-type-selector {
      display: flex;
      align-items: center;
      
      label {
        margin-right: 10px;
        font-weight: 500;
      }
      
      select {
        padding: 6px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        
        &:focus {
          outline: none;
          border-color: #4a90e2;
        }
      }
    }
    
    .refresh-button {
      padding: 6px 12px;
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
  
  // Chart wrapper
  .chart-wrapper {
    position: relative;
    height: 400px;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 10px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  // Responsive styles
  @media (max-width: 768px) {
    .chart-actions {
      flex-direction: column;
      align-items: flex-start;
      
      .chart-type-selector,
      .refresh-button {
        margin-bottom: 10px;
        width: 100%;
      }
    }
    
    .chart-wrapper {
      height: 300px;
    }
  }
}
```

### Step 8: Generate and Implement a Line Chart Component

Let's add another chart type using the ASM CLI:

```bash
npx asmgen component charts line-chart --template react
```

Implement the line chart factory:

```typescript
// src/components/charts/line-chart/line-chart.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { AnalyticsService, ChartData } from '../../../services/analytics.service';

export class LineChartFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get analytics service
    const analyticsService = context.services.get('analyticsService') as AnalyticsService;
    
    try {
      // Set loading state
      context.data.set('loading', true);
      context.data.set('error', null);
      
      // Get data for traffic visualization
      const chartData = await analyticsService.fetchRealTimeData('traffic');
      
      // Configure chart options
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Website Traffic'
          },
          legend: {
            position: 'top' as const
          },
          tooltip: {
            mode: 'index' as const,
            intersect: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Visitors'
            }
          }
        },
        elements: {
          line: {
            tension: 0.4 // Adds curve to the line
          }
        }
      };
      
      // Set data for the component
      context.data.set('chartData', chartData);
      context.data.set('options', options);
      context.data.set('loading', false);
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      context.data.set('error', 'Failed to load traffic data');
      context.data.set('loading', false);
    }
  }
}
```

For brevity, the view and client components for the line chart would be similar to the bar chart with minor adjustments, so we won't repeat all the code here.

### Step 9: Register the Components and Service

Update your server.ts to register the chart components and analytics service:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { AnalyticsService } from "./services/analytics.service";
import { BarChartFactory } from "./components/charts/bar-chart/bar-chart.factory";
import { LineChartFactory } from "./components/charts/line-chart/line-chart.factory";

// Create services
const analyticsService = new AnalyticsService();

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'charts',
        views: [
          {
            viewName: 'bar-chart',
            templateFile: 'bar-chart.view.tsx',
            factory: new BarChartFactory()
          },
          {
            viewName: 'line-chart',
            templateFile: 'line-chart.view.tsx',
            factory: new LineChartFactory()
          }
        ]
      }
    ],
    services: [
      {
        name: 'analyticsService',
        service: analyticsService
      }
    ]
  }
});
```

### Step 10: Generate a Dashboard Blueprint

Generate a blueprint for the dashboard that will display our charts:

```bash
npx asmgen blueprint dashboard
```

Implement the dashboard blueprint:

```tsx
// src/blueprints/dashboard/main/main.view.tsx
import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <p>Data visualization examples with AssembleJS</p>
      </header>
      
      <main className="dashboard-content">
        <div className="dashboard-grid">
          <section className="dashboard-card">
            <h2>Sales Comparison</h2>
            <div className="chart-container" data-component="charts/bar-chart" data-params='{"type":"sales","title":"Monthly Sales Comparison","stacked":"false"}'></div>
          </section>
          
          <section className="dashboard-card">
            <h2>Website Traffic</h2>
            <div className="chart-container" data-component="charts/line-chart"></div>
          </section>
          
          <section className="dashboard-card">
            <h2>Sales by Category</h2>
            <div className="chart-container" data-component="charts/bar-chart" data-params='{"type":"category","title":"Sales Distribution by Category"}'></div>
          </section>
          
          <section className="dashboard-card">
            <h2>Monthly Performance</h2>
            <div className="chart-container" data-component="charts/bar-chart" data-params='{"type":"sales","title":"Monthly Sales Performance","stacked":"true"}'></div>
          </section>
        </div>
      </main>
      
      <footer className="dashboard-footer">
        <p>AssembleJS Data Visualization Cookbook Example</p>
      </footer>
    </div>
  );
};

export default Dashboard;
```

Add styles for the dashboard:

```scss
// src/blueprints/dashboard/main/main.styles.scss
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  
  .dashboard-header {
    margin-bottom: 30px;
    text-align: center;
    
    h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #333;
    }
    
    p {
      font-size: 16px;
      color: #666;
    }
  }
  
  .dashboard-content {
    margin-bottom: 40px;
  }
  
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    
    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }
  
  .dashboard-card {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    h2 {
      font-size: 18px;
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
  }
  
  .dashboard-footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    text-align: center;
    color: #666;
  }
}
```

Add the dashboard route to your server.ts:

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
        path: 'dashboard',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/dashboard'
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

### Real-Time Data Updates

To implement real-time data updates:

```typescript
// Add to analytics.service.ts

// Data update interval in milliseconds
private updateInterval: number = 5000;
private listeners: Map<string, Set<Function>> = new Map();

/**
 * Subscribe to real-time data updates
 */
subscribeToUpdates(dataType: 'sales' | 'traffic' | 'category', callback: (data: ChartData) => void): () => void {
  // Create a listener set for this data type if none exists
  if (!this.listeners.has(dataType)) {
    this.listeners.set(dataType, new Set());
    
    // Start the update loop for this data type
    this.startUpdateLoop(dataType);
  }
  
  // Add the callback to the listeners
  const listeners = this.listeners.get(dataType)!;
  listeners.add(callback);
  
  // Return an unsubscribe function
  return () => {
    listeners.delete(callback);
    
    // If no more listeners for this data type, stop the update loop
    if (listeners.size === 0) {
      this.listeners.delete(dataType);
    }
  };
}

private async startUpdateLoop(dataType: 'sales' | 'traffic' | 'category'): Promise<void> {
  const updateData = async () => {
    try {
      // Get the listeners for this data type
      const listeners = this.listeners.get(dataType);
      if (!listeners || listeners.size === 0) return;
      
      // Fetch updated data
      const data = await this.fetchRealTimeData(dataType);
      
      // Notify all listeners
      listeners.forEach(callback => callback(data));
    } catch (error) {
      console.error(`Error updating ${dataType} data:`, error);
    } finally {
      // Schedule the next update if we still have listeners
      if (this.listeners.has(dataType)) {
        setTimeout(updateData, this.updateInterval);
      }
    }
  };
  
  // Start the update loop
  updateData();
}
```

Add real-time updates to the client component:

```typescript
// Add to bar-chart.client.ts

// Unsubscribe function
private unsubscribe: (() => void) | null = null;

protected override onMount(): void {
  // ...existing code...
  
  // Subscribe to real-time updates if analytics service is available
  if (this.analyticsService) {
    const chartType = this.context.get('chartType') as 'sales' | 'traffic' | 'category';
    this.unsubscribe = this.analyticsService.subscribeToUpdates(
      chartType,
      this.handleDataUpdate.bind(this)
    );
  }
}

protected override onUnmount(): void {
  // ...existing code...
  
  // Unsubscribe from real-time updates
  if (this.unsubscribe) {
    this.unsubscribe();
    this.unsubscribe = null;
  }
}

private handleDataUpdate(newData: ChartData): void {
  // Update chart data
  this.chartData = newData;
  
  // Update the chart if it exists
  if (this.chart) {
    this.chart.data.labels = newData.labels;
    this.chart.data.datasets = newData.datasets;
    this.chart.update();
  }
}
```

### Server-Side Rendering of Charts

For server-side rendering of charts, you can generate static images:

```typescript
// src/services/chart-renderer.service.ts
import { Service } from 'asmbl';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartData } from './analytics.service';

export class ChartRendererService extends Service {
  private renderer: ChartJSNodeCanvas;
  
  constructor() {
    super();
    this.renderer = new ChartJSNodeCanvas({
      width: 800,
      height: 400,
      backgroundColour: 'white'
    });
  }
  
  /**
   * Render a chart to a buffer
   */
  async renderChart(type: 'bar' | 'line' | 'pie', data: ChartData, options: any): Promise<Buffer> {
    const configuration = {
      type,
      data,
      options: {
        ...options,
        animation: false // Disable animation for server-side rendering
      }
    };
    
    return this.renderer.renderToBuffer(configuration);
  }
  
  /**
   * Render a chart to a data URL
   */
  async renderChartToDataUrl(type: 'bar' | 'line' | 'pie', data: ChartData, options: any): Promise<string> {
    const configuration = {
      type,
      data,
      options: {
        ...options,
        animation: false // Disable animation for server-side rendering
      }
    };
    
    return this.renderer.renderToDataURL(configuration);
  }
}
```

### Accessibility Enhancements

To make charts more accessible:

```typescript
// Add to chart options

options: {
  // ...existing options...
  plugins: {
    // ...existing plugins...
    tooltip: {
      callbacks: {
        // Custom tooltip to improve screen reader experience
        label: function(context) {
          const label = context.dataset.label || '';
          const value = context.parsed.y || 0;
          return `${label}: ${value}`;
        }
      }
    }
  },
  // Add ARIA attributes for accessibility
  plugins: [{
    id: 'customAriaLabels',
    beforeInit: (chart) => {
      const canvas = chart.canvas;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${chart.options.plugins.title.text} chart showing data for ${chart.data.labels.join(', ')}`);
    }
  }]
}
```

## Conclusion

This cookbook demonstrated how to create and integrate data visualizations in AssembleJS applications using Chart.js. We used the ASM CLI to generate components, which ensures consistency and adherence to AssembleJS best practices. We covered:

1. **Creating Chart Components** - Using Chart.js for visual representation
2. **Data Management** - Creating a service for chart data
3. **Interactivity** - Allowing users to switch between chart types and refresh data
4. **Real-Time Updates** - Implementing a subscription system for live data
5. **Responsive Design** - Ensuring charts work well on all screen sizes
6. **Accessibility** - Making charts more accessible to all users

For larger applications, consider the following extensions:

1. **Dashboard Customization** - Allow users to customize their dashboard layout
2. **Data Export** - Add options to export chart data as CSV or images
3. **Advanced Filtering** - Implement date ranges and additional filtering options
4. **Multiple Visualization Libraries** - Integrate specialized libraries for specific visualization needs
5. **Drill-Down Capabilities** - Allow users to click on chart elements to see more detailed data

Remember that using the ASM CLI for component generation ensures your components follow AssembleJS best practices and maintain consistency across your application. Always prefer the `npx asmgen` commands for generating new components rather than creating files manually.