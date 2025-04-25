# Performance Profiling

This guide demonstrates how to implement effective performance profiling and optimization in AssembleJS applications.

## Overview

Performance has a direct impact on user experience and business metrics. This cookbook will show you how to measure, profile, and optimize AssembleJS applications to ensure fast load times, smooth interactions, and efficient resource usage.

## Prerequisites

- AssembleJS project set up
- Basic understanding of web performance metrics
- Familiarity with browser developer tools

## Implementation Steps

### 1. Create a Performance Monitoring Service

First, let's create a service to centralize performance monitoring:

```bash
asm service Performance
```

This will launch the service generator. When prompted, select options to create the performance service.

Now let's implement the service:

```typescript
// src/services/performance.service.ts
import { Service } from '@assemblejs/core';

export interface PerformanceOptions {
  enableCoreProfiling?: boolean;
  enableNetworkProfiling?: boolean;
  enableMemoryProfiling?: boolean;
  enableRenderProfiling?: boolean;
  reportingEndpoint?: string;
  samplingRate?: number;
  analyticsId?: string;
}

export class PerformanceService extends Service {
  private options: PerformanceOptions;
  private metrics: Record<string, any> = {};
  private marks: Set<string> = new Set();

  initialize(options: PerformanceOptions = {}) {
    this.options = {
      enableCoreProfiling: true,
      enableNetworkProfiling: true,
      enableMemoryProfiling: false,
      enableRenderProfiling: false,
      samplingRate: 1.0, // 100% of users
      ...options
    };

    // Initialize only in browser
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.measureCoreWebVitals();
      this.setupReporting();
    }

    return this;
  }

  private initializeObservers() {
    // Only run for a percentage of users based on sampling rate
    if (Math.random() > this.options.samplingRate) {
      return;
    }

    // Performance Observer to track longtasks, paint metrics, etc.
    if (typeof PerformanceObserver !== 'undefined') {
      // Long Tasks Observer
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.metrics.longTasks = this.metrics.longTasks || [];
            this.metrics.longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
            
            // Report long task over 100ms as potentially problematic
            if (entry.duration > 100) {
              console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.error('Long task observer not supported', e);
      }

      // First Input Delay Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            // Report FID
            this.metrics.fid = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.error('FID observer not supported', e);
      }

      // Layout Shifts Observer
      try {
        const clsObserver = new PerformanceObserver((list) => {
          this.metrics.layoutShifts = this.metrics.layoutShifts || [];
          
          list.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) {
              this.metrics.layoutShifts.push({
                value: entry.value,
                startTime: entry.startTime,
                sources: entry.sources
              });
            }
          });
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.error('CLS observer not supported', e);
      }

      // Resource Timing Observer
      if (this.options.enableNetworkProfiling) {
        try {
          const resourceObserver = new PerformanceObserver((list) => {
            this.metrics.resources = this.metrics.resources || [];
            
            list.getEntries().forEach(entry => {
              if (entry.initiatorType && ['fetch', 'xmlhttprequest', 'resource'].includes(entry.initiatorType)) {
                this.metrics.resources.push({
                  name: entry.name,
                  duration: entry.duration,
                  transferSize: (entry as any).transferSize,
                  startTime: entry.startTime,
                  initiatorType: entry.initiatorType
                });
              }
            });
          });
          resourceObserver.observe({ entryTypes: ['resource'] });
        } catch (e) {
          console.error('Resource observer not supported', e);
        }
      }
    }

    // Memory usage tracking
    if (this.options.enableMemoryProfiling && (performance as any).memory) {
      setInterval(() => {
        this.metrics.memory = this.metrics.memory || [];
        this.metrics.memory.push({
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
          timestamp: Date.now()
        });
      }, 5000); // Sample every 5 seconds
    }
  }

  private measureCoreWebVitals() {
    // Largest Contentful Paint
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.error('LCP measurement not supported', e);
    }

    // Calculate CLS score periodically
    setInterval(() => {
      if (this.metrics.layoutShifts && this.metrics.layoutShifts.length > 0) {
        this.metrics.cls = this.metrics.layoutShifts.reduce(
          (total: number, shift: any) => total + shift.value, 
          0
        );
      }
    }, 2000);

    // Interaction to Next Paint (INP)
    if ('interactionCount' in performance) {
      const processInteractions = () => {
        // @ts-ignore - TypeScript might not recognize the newer INP API
        const entries = performance.getEntriesByType('event');
        
        if (entries.length > 0) {
          const maxDurationEntry = entries.reduce(
            (max: any, entry: any) => entry.duration > max.duration ? entry : max, 
            entries[0]
          );
  
          this.metrics.inp = maxDurationEntry.duration;
        }
      };
  
      try {
        new PerformanceObserver((list) => {
          processInteractions();
        }).observe({ type: 'event', durationThreshold: 16 }); // 16ms threshold (targeting 60fps)
      } catch (e) {
        console.error('INP measurement not supported', e);
      }
    }
  }

  private setupReporting() {
    // Send metrics on page visibility change (when the user leaves the page)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.options.reportingEndpoint) {
        // Calculate Core Web Vitals scores
        const coreWebVitals = {
          lcp: this.metrics.lcp,
          fid: this.metrics.fid,
          cls: this.metrics.cls,
          inp: this.metrics.inp
        };

        // Categorize performance based on Web Vitals thresholds
        const lcpScore = this.metrics.lcp < 2500 ? 'good' : (this.metrics.lcp < 4000 ? 'needs-improvement' : 'poor');
        const fidScore = this.metrics.fid < 100 ? 'good' : (this.metrics.fid < 300 ? 'needs-improvement' : 'poor');
        const clsScore = this.metrics.cls < 0.1 ? 'good' : (this.metrics.cls < 0.25 ? 'needs-improvement' : 'poor');
        
        // Use sendBeacon to report metrics even if the page is unloading
        if (navigator.sendBeacon) {
          const data = {
            url: window.location.href,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            coreWebVitals,
            scores: { lcp: lcpScore, fid: fidScore, cls: clsScore },
            metrics: this.metrics,
            analyticsId: this.options.analyticsId
          };
          
          navigator.sendBeacon(this.options.reportingEndpoint, JSON.stringify(data));
        }
      }
    });
  }

  // API for custom performance marks
  mark(name: string) {
    if (typeof performance === 'undefined') return;
    
    const markName = `asm_${name}`;
    performance.mark(markName);
    this.marks.add(markName);
    
    return this;
  }

  measure(name: string, startMark?: string, endMark?: string) {
    if (typeof performance === 'undefined') return;
    
    const fullName = `asm_${name}`;
    const fullStartMark = startMark ? `asm_${startMark}` : undefined;
    const fullEndMark = endMark ? `asm_${endMark}` : undefined;
    
    try {
      performance.measure(fullName, fullStartMark, fullEndMark);
    } catch (e) {
      console.error(`Failed to measure ${name}`, e);
    }
    
    return this;
  }

  // Retrieve measured durations
  getDuration(name: string): number {
    if (typeof performance === 'undefined') return 0;
    
    const entries = performance.getEntriesByName(`asm_${name}`, 'measure');
    
    if (entries.length === 0) {
      return 0;
    }
    
    return entries[entries.length - 1].duration;
  }

  // Track component render times
  trackRender(componentName: string, startTime: number) {
    const duration = performance.now() - startTime;
    
    this.metrics.componentRenders = this.metrics.componentRenders || {};
    this.metrics.componentRenders[componentName] = this.metrics.componentRenders[componentName] || [];
    this.metrics.componentRenders[componentName].push({
      duration,
      timestamp: Date.now()
    });
    
    // Log slow renders (over 16ms - which would cause frame drops)
    if (duration > 16) {
      console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  // Get current metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Clear performance data
  clearMarks() {
    if (typeof performance === 'undefined') return;
    
    this.marks.forEach(mark => {
      performance.clearMarks(mark);
    });
    
    this.marks.clear();
    
    return this;
  }
}
```

### 2. Create a Component Profiler Higher-Order Component (HOC)

Let's create a utility to profile component render performance:

```typescript
// src/utils/profiler.utils.ts
import { h, ComponentType, VNode } from 'preact';
import { useRef, useEffect } from 'preact/hooks';
import { PerformanceService } from '../services/performance.service';

// HOC for profiling component render times
export function withProfiling<P>(
  Component: ComponentType<P>,
  performanceService: PerformanceService,
  options: { name?: string; threshold?: number } = {}
) {
  const componentName = options.name || Component.displayName || Component.name || 'Unknown';
  const threshold = options.threshold || 16; // Default threshold of 16ms (60fps)
  
  return (props: P): VNode => {
    const startTimeRef = useRef(0);
    
    useEffect(() => {
      const renderTime = performance.now() - startTimeRef.current;
      performanceService.trackRender(componentName, startTimeRef.current);
      
      if (renderTime > threshold) {
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    });
    
    startTimeRef.current = performance.now();
    return h(Component, props);
  };
}

// Hook for measuring component operations
export function useProfiler(performanceService: PerformanceService, componentName: string) {
  return {
    measureOperation: (operationName: string, operation: () => any) => {
      const fullName = `${componentName}.${operationName}`;
      performanceService.mark(`${fullName}.start`);
      
      const result = operation();
      
      performanceService.mark(`${fullName}.end`);
      performanceService.measure(fullName, `${fullName}.start`, `${fullName}.end`);
      
      return result;
    }
  };
}
```

### 3. Create a Performance Dashboard Component

Let's create a performance dashboard to visualize metrics:

```bash
asm component developer performance-dashboard
```

This will launch the component generator. When prompted, select options to create the performance dashboard component.

Now, let's implement the component:

```tsx
// components/developer/performance-dashboard/performance-dashboard.view.tsx
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { ViewContext } from '@assemblejs/core';
import { PerformanceService } from '../../../services/performance.service';

export default function PerformanceDashboard({ context }: { context: ViewContext }) {
  const performanceService = context.services.get(PerformanceService);
  const [metrics, setMetrics] = useState<any>({});
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'core' | 'components' | 'network' | 'memory'>('core');
  
  // Update metrics periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      setMetrics(performanceService.getMetrics());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const formatMs = (ms?: number) => {
    if (ms === undefined) return 'N/A';
    return `${ms.toFixed(2)}ms`;
  };
  
  const getCoreVitalClass = (metric: string, value?: number) => {
    if (value === undefined) return 'unknown';
    
    switch (metric) {
      case 'lcp':
        return value < 2500 ? 'good' : (value < 4000 ? 'warning' : 'poor');
      case 'fid':
      case 'inp':
        return value < 100 ? 'good' : (value < 300 ? 'warning' : 'poor');
      case 'cls':
        return value < 0.1 ? 'good' : (value < 0.25 ? 'warning' : 'poor');
      default:
        return 'unknown';
    }
  };
  
  const renderCoreMetrics = () => {
    return (
      <div className="core-metrics">
        <h3>Core Web Vitals</h3>
        
        <div className="metrics-grid">
          <div className={`metric-card ${getCoreVitalClass('lcp', metrics.lcp)}`}>
            <div className="metric-name">LCP</div>
            <div className="metric-value">{formatMs(metrics.lcp)}</div>
            <div className="metric-desc">Largest Contentful Paint</div>
          </div>
          
          <div className={`metric-card ${getCoreVitalClass('fid', metrics.fid)}`}>
            <div className="metric-name">FID</div>
            <div className="metric-value">{formatMs(metrics.fid)}</div>
            <div className="metric-desc">First Input Delay</div>
          </div>
          
          <div className={`metric-card ${getCoreVitalClass('cls', metrics.cls)}`}>
            <div className="metric-name">CLS</div>
            <div className="metric-value">{metrics.cls?.toFixed(4) || 'N/A'}</div>
            <div className="metric-desc">Cumulative Layout Shift</div>
          </div>
          
          <div className={`metric-card ${getCoreVitalClass('inp', metrics.inp)}`}>
            <div className="metric-name">INP</div>
            <div className="metric-value">{formatMs(metrics.inp)}</div>
            <div className="metric-desc">Interaction to Next Paint</div>
          </div>
        </div>
        
        <div className="page-metrics">
          <div className="metric-row">
            <div className="metric-label">Navigation Start:</div>
            <div className="metric-value">
              {performance?.timing?.navigationStart 
                ? new Date(performance.timing.navigationStart).toLocaleTimeString() 
                : 'N/A'}
            </div>
          </div>
          <div className="metric-row">
            <div className="metric-label">DOM Complete:</div>
            <div className="metric-value">
              {performance?.timing?.domComplete && performance?.timing?.navigationStart
                ? `${(performance.timing.domComplete - performance.timing.navigationStart)}ms`
                : 'N/A'}
            </div>
          </div>
          <div className="metric-row">
            <div className="metric-label">Load Event:</div>
            <div className="metric-value">
              {performance?.timing?.loadEventEnd && performance?.timing?.navigationStart
                ? `${(performance.timing.loadEventEnd - performance.timing.navigationStart)}ms`
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderComponentMetrics = () => {
    const componentRenders = metrics.componentRenders || {};
    const components = Object.keys(componentRenders);
    
    if (components.length === 0) {
      return <div className="empty-state">No component render data collected yet</div>;
    }
    
    return (
      <div className="component-metrics">
        <h3>Component Render Performance</h3>
        
        <table className="metrics-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Renders</th>
              <th>Last Render</th>
              <th>Average</th>
              <th>Max</th>
            </tr>
          </thead>
          <tbody>
            {components.map(component => {
              const renders = componentRenders[component];
              const count = renders.length;
              const lastRender = renders[count - 1]?.duration || 0;
              const totalDuration = renders.reduce((sum: number, r: any) => sum + r.duration, 0);
              const avgDuration = totalDuration / count;
              const maxDuration = Math.max(...renders.map((r: any) => r.duration));
              
              const getRowClass = (duration: number) => {
                if (duration > 16) return 'poor';
                if (duration > 8) return 'warning';
                return 'good';
              };
              
              return (
                <tr key={component} className={getRowClass(lastRender)}>
                  <td>{component}</td>
                  <td>{count}</td>
                  <td>{formatMs(lastRender)}</td>
                  <td>{formatMs(avgDuration)}</td>
                  <td>{formatMs(maxDuration)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderNetworkMetrics = () => {
    const resources = metrics.resources || [];
    
    if (resources.length === 0) {
      return <div className="empty-state">No network requests collected yet</div>;
    }
    
    // Group by type
    const byType: Record<string, any[]> = {};
    
    resources.forEach((resource: any) => {
      const type = resource.initiatorType || 'other';
      byType[type] = byType[type] || [];
      byType[type].push(resource);
    });
    
    return (
      <div className="network-metrics">
        <h3>Network Performance</h3>
        
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-title">Total Requests</div>
            <div className="summary-value">{resources.length}</div>
          </div>
          <div className="summary-card">
            <div className="summary-title">Total Size</div>
            <div className="summary-value">
              {(resources.reduce((sum: number, r: any) => sum + (r.transferSize || 0), 0) / 1024).toFixed(2)} KB
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-title">Avg Request Time</div>
            <div className="summary-value">
              {formatMs(resources.reduce((sum: number, r: any) => sum + r.duration, 0) / resources.length)}
            </div>
          </div>
        </div>
        
        <h4>Request Details</h4>
        
        <div className="network-tabs">
          {Object.keys(byType).map(type => (
            <button 
              key={type} 
              className={`network-tab ${activeNetworkTab === type ? 'active' : ''}`}
              onClick={() => setActiveNetworkTab(type)}
            >
              {type} ({byType[type].length})
            </button>
          ))}
        </div>
        
        <div className="network-content">
          <table className="metrics-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Duration</th>
                <th>Size</th>
                <th>Started At</th>
              </tr>
            </thead>
            <tbody>
              {(byType[activeNetworkTab] || []).map((resource: any, index: number) => (
                <tr key={index}>
                  <td className="url-cell" title={resource.name}>{resource.name.split('/').pop()}</td>
                  <td>{formatMs(resource.duration)}</td>
                  <td>{resource.transferSize ? `${(resource.transferSize / 1024).toFixed(2)} KB` : 'N/A'}</td>
                  <td>{formatMs(resource.startTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const renderMemoryMetrics = () => {
    const memory = metrics.memory || [];
    
    if (memory.length === 0) {
      return <div className="empty-state">No memory data collected yet</div>;
    }
    
    const latest = memory[memory.length - 1];
    const mbUsed = latest.usedJSHeapSize / (1024 * 1024);
    const mbTotal = latest.totalJSHeapSize / (1024 * 1024);
    const mbLimit = latest.jsHeapSizeLimit / (1024 * 1024);
    const usagePercentage = (mbUsed / mbLimit) * 100;
    
    return (
      <div className="memory-metrics">
        <h3>Memory Usage</h3>
        
        <div className="memory-gauge">
          <div className="gauge-title">
            JS Heap Usage: {mbUsed.toFixed(2)}MB / {mbLimit.toFixed(2)}MB
          </div>
          
          <div className="gauge-container">
            <div 
              className={`gauge-fill ${usagePercentage > 80 ? 'critical' : (usagePercentage > 60 ? 'warning' : '')}`}
              style={{width: `${usagePercentage}%`}}
            ></div>
          </div>
          
          <div className="gauge-label">{usagePercentage.toFixed(1)}% Used</div>
        </div>
        
        <h4>Memory Over Time</h4>
        
        <div className="memory-chart-container">
          {/* Simple chart representation - in a real app this could use a proper chart library */}
          <div className="memory-chart">
            {memory.map((sample: any, index: number) => {
              const height = (sample.usedJSHeapSize / latest.jsHeapSizeLimit) * 100;
              return (
                <div 
                  key={index} 
                  className="memory-bar" 
                  style={{height: `${height}%`}}
                  title={`${(sample.usedJSHeapSize / (1024 * 1024)).toFixed(2)}MB at ${new Date(sample.timestamp).toLocaleTimeString()}`}
                ></div>
              );
            })}
          </div>
          <div className="chart-y-axis">
            <div>{mbLimit.toFixed(0)}MB</div>
            <div>{(mbLimit * 0.75).toFixed(0)}MB</div>
            <div>{(mbLimit * 0.5).toFixed(0)}MB</div>
            <div>{(mbLimit * 0.25).toFixed(0)}MB</div>
            <div>0MB</div>
          </div>
        </div>
      </div>
    );
  };
  
  // State for network tab
  const [activeNetworkTab, setActiveNetworkTab] = useState('fetch');
  
  if (!isOpen) {
    return (
      <button 
        className="performance-toggle-button"
        onClick={() => setIsOpen(true)}
      >
        Show Performance
      </button>
    );
  }
  
  return (
    <div className="performance-dashboard">
      <div className="dashboard-header">
        <h2>Performance Dashboard</h2>
        <button 
          className="close-button"
          onClick={() => setIsOpen(false)}
        >
          Close
        </button>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${tab === 'core' ? 'active' : ''}`}
          onClick={() => setTab('core')}
        >
          Core Vitals
        </button>
        <button 
          className={`tab-button ${tab === 'components' ? 'active' : ''}`}
          onClick={() => setTab('components')}
        >
          Components
        </button>
        <button 
          className={`tab-button ${tab === 'network' ? 'active' : ''}`}
          onClick={() => setTab('network')}
        >
          Network
        </button>
        <button 
          className={`tab-button ${tab === 'memory' ? 'active' : ''}`}
          onClick={() => setTab('memory')}
        >
          Memory
        </button>
      </div>
      
      <div className="dashboard-content">
        {tab === 'core' && renderCoreMetrics()}
        {tab === 'components' && renderComponentMetrics()}
        {tab === 'network' && renderNetworkMetrics()}
        {tab === 'memory' && renderMemoryMetrics()}
      </div>
    </div>
  );
}
```

```typescript
// components/developer/performance-dashboard/performance-dashboard.client.ts
export default function() {
  // Component is initialized by the view file
  console.log('Performance dashboard initialized');
}
```

```scss
// components/developer/performance-dashboard/performance-dashboard.styles.scss
.performance-dashboard {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 80%;
  max-width: 1000px;
  height: 80vh;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 8px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    
    h2 {
      margin: 0;
      font-size: 18px;
      color: #343a40;
    }
    
    .close-button {
      background: none;
      border: none;
      color: #6c757d;
      font-size: 14px;
      cursor: pointer;
      
      &:hover {
        color: #343a40;
      }
    }
  }
  
  .dashboard-tabs {
    display: flex;
    background-color: #f1f3f5;
    border-bottom: 1px solid #e9ecef;
    
    .tab-button {
      padding: 10px 20px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      font-size: 14px;
      color: #495057;
      cursor: pointer;
      
      &:hover {
        background-color: #e9ecef;
      }
      
      &.active {
        border-bottom-color: #4263eb;
        color: #4263eb;
        font-weight: 500;
      }
    }
  }
  
  .dashboard-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    
    h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 16px;
      color: #343a40;
    }
    
    h4 {
      font-size: 14px;
      color: #495057;
      margin: 1.5rem 0 0.5rem;
    }
  }
  
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
    
    .metric-card {
      border-radius: 8px;
      padding: 15px;
      display: flex;
      flex-direction: column;
      
      &.good {
        background-color: #d3f9d8;
        border: 1px solid #8ce99a;
      }
      
      &.warning {
        background-color: #fff3bf;
        border: 1px solid #ffe066;
      }
      
      &.poor {
        background-color: #ffe3e3;
        border: 1px solid #ffa8a8;
      }
      
      &.unknown {
        background-color: #e9ecef;
        border: 1px solid #ced4da;
      }
      
      .metric-name {
        font-weight: bold;
        font-size: 14px;
        color: #495057;
      }
      
      .metric-value {
        font-size: 24px;
        font-weight: 500;
        margin: 8px 0;
        color: #212529;
      }
      
      .metric-desc {
        font-size: 12px;
        color: #6c757d;
      }
    }
  }
  
  .page-metrics {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 15px;
    
    .metric-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .metric-label {
        font-weight: 500;
        color: #495057;
      }
      
      .metric-value {
        color: #212529;
      }
    }
  }
  
  .metrics-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    
    th, td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }
    
    th {
      color: #495057;
      font-weight: 500;
      white-space: nowrap;
    }
    
    tr.good td {
      background-color: rgba(211, 249, 216, 0.3);
    }
    
    tr.warning td {
      background-color: rgba(255, 243, 191, 0.3);
    }
    
    tr.poor td {
      background-color: rgba(255, 227, 227, 0.3);
    }
    
    .url-cell {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #6c757d;
    font-style: italic;
    border: 1px dashed #ced4da;
    border-radius: 8px;
  }
  
  .summary-cards {
    display: flex;
    margin-bottom: 20px;
    
    .summary-card {
      flex: 1;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      margin-right: 15px;
      
      &:last-child {
        margin-right: 0;
      }
      
      .summary-title {
        font-size: 12px;
        color: #6c757d;
        margin-bottom: 5px;
      }
      
      .summary-value {
        font-size: 18px;
        font-weight: 500;
        color: #212529;
      }
    }
  }
  
  .network-tabs {
    display: flex;
    border-bottom: 1px solid #e9ecef;
    margin-bottom: 15px;
    overflow-x: auto;
    
    .network-tab {
      padding: 8px 15px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      font-size: 13px;
      color: #495057;
      cursor: pointer;
      white-space: nowrap;
      
      &:hover {
        background-color: #f8f9fa;
      }
      
      &.active {
        border-bottom-color: #4263eb;
        color: #4263eb;
      }
    }
  }
  
  .memory-gauge {
    margin-bottom: 20px;
    
    .gauge-title {
      font-size: 14px;
      margin-bottom: 5px;
      color: #495057;
    }
    
    .gauge-container {
      height: 20px;
      background-color: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
      
      .gauge-fill {
        height: 100%;
        background-color: #4263eb;
        transition: width 0.3s ease;
        
        &.warning {
          background-color: #fd7e14;
        }
        
        &.critical {
          background-color: #fa5252;
        }
      }
    }
    
    .gauge-label {
      text-align: right;
      font-size: 12px;
      color: #6c757d;
      margin-top: 5px;
    }
  }
  
  .memory-chart-container {
    display: flex;
    height: 200px;
    
    .memory-chart {
      flex: 1;
      display: flex;
      align-items: flex-end;
      border-bottom: 1px solid #ced4da;
      border-left: 1px solid #ced4da;
      
      .memory-bar {
        flex: 1;
        background-color: rgba(66, 99, 235, 0.7);
        margin: 0 1px;
        transition: height 0.3s ease;
        
        &:hover {
          background-color: rgba(66, 99, 235, 1);
        }
      }
    }
    
    .chart-y-axis {
      width: 60px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-right: 10px;
      font-size: 12px;
      color: #6c757d;
      text-align: right;
    }
  }
}

.performance-toggle-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 15px;
  background-color: #4263eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  z-index: 9998;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #3b5bdb;
  }
}
```

### 4. Register the Service and Component in Your Server

Update your server.ts file to register the new service and component:

```typescript
// src/server.ts
import { createBlueprintServer } from '@assemblejs/core';
import { PerformanceService } from './services/performance.service';
import { vaviteHttpServer } from 'vavite/http-server';
import { viteDevServer } from 'vavite/vite-dev-server';

const server = createBlueprintServer({
  // HTTP and development server configuration
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  // Register components
  components: [
    // ... other components
    {
      name: 'developer/performance-dashboard',
      // Only register routes in development mode
      routes: process.env.NODE_ENV === 'development' ? ['/_dashboard/performance'] : []
    }
  ],
  
  // Register services
  services: [
    // ... other services
    {
      type: PerformanceService,
      options: {
        enableCoreProfiling: true,
        enableNetworkProfiling: true,
        // Only enable memory profiling in development
        enableMemoryProfiling: process.env.NODE_ENV === 'development',
        enableRenderProfiling: process.env.NODE_ENV === 'development',
        // In production, you might want to send metrics to your analytics service
        reportingEndpoint: process.env.NODE_ENV === 'production' 
          ? 'https://api.example.com/performance-metrics' 
          : undefined,
        // Sample only a percentage of users in production
        samplingRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
      }
    }
  ]
});

// Start the server
server.start();
```

### 5. Create a Bundle Analyzer Blueprint

To analyze your bundle size, let's create a visualization blueprint:

```bash
asm blueprint developer bundle-analyzer
```

This will launch the blueprint generator. When prompted, select options to create the bundle analyzer blueprint.

Now, let's implement it:

```tsx
// blueprints/developer/bundle-analyzer/bundle-analyzer.view.tsx
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { ViewContext } from '@assemblejs/core';

interface ChunkInfo {
  id: string;
  name: string;
  size: number;
  imported: boolean;
  modules: ModuleInfo[];
}

interface ModuleInfo {
  id: string;
  name: string;
  size: number;
  chunks: string[];
}

export default function BundleAnalyzer({ context }: { context: ViewContext }) {
  const [chunks, setChunks] = useState<ChunkInfo[]>([]);
  const [selectedChunk, setSelectedChunk] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch bundle stats
  useEffect(() => {
    async function fetchBundleStats() {
      try {
        const response = await fetch('/_stats/bundle.json');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch bundle stats: ${response.status}`);
        }
        
        const stats = await response.json();
        processStats(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bundle stats');
        setLoading(false);
      }
    }
    
    fetchBundleStats();
  }, []);
  
  // Process webpack stats
  function processStats(stats: any) {
    try {
      const processedChunks: ChunkInfo[] = [];
      
      if (stats.chunks) {
        // Webpack 5 format
        stats.chunks.forEach((chunk: any) => {
          const modules = (chunk.modules || []).map((module: any) => ({
            id: module.id,
            name: module.name,
            size: module.size,
            chunks: [chunk.id]
          }));
          
          processedChunks.push({
            id: chunk.id,
            name: chunk.names?.[0] || chunk.id,
            size: chunk.size,
            imported: chunk.initial || false,
            modules
          });
        });
      } else if (stats.assets) {
        // Simpler format
        stats.assets.forEach((asset: any) => {
          processedChunks.push({
            id: asset.name,
            name: asset.name,
            size: asset.size,
            imported: true,
            modules: []
          });
        });
      }
      
      // Sort by size descending
      processedChunks.sort((a, b) => b.size - a.size);
      
      setChunks(processedChunks);
      
      // Select the largest chunk by default
      if (processedChunks.length > 0) {
        setSelectedChunk(processedChunks[0].id);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to process bundle stats');
      setLoading(false);
    }
  }
  
  function formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }
  
  function getColorForSize(bytes: number): string {
    if (bytes < 10 * 1024) {  // < 10KB
      return '#4caf50';
    } else if (bytes < 50 * 1024) {  // < 50KB
      return '#8bc34a';
    } else if (bytes < 100 * 1024) {  // < 100KB
      return '#ffeb3b';
    } else if (bytes < 250 * 1024) {  // < 250KB
      return '#ff9800';
    } else if (bytes < 500 * 1024) {  // < 500KB
      return '#ff5722';
    } else {  // >= 500KB
      return '#f44336';
    }
  }
  
  function renderChunksList() {
    return (
      <div className="chunks-list">
        <h3>Chunks ({chunks.length})</h3>
        <div className="chunks-container">
          {chunks.map(chunk => (
            <div 
              key={chunk.id}
              className={`chunk-item ${selectedChunk === chunk.id ? 'selected' : ''}`}
              onClick={() => setSelectedChunk(chunk.id)}
            >
              <div className="chunk-header">
                <div className="chunk-name">{chunk.name}</div>
                <div className="chunk-size">{formatSize(chunk.size)}</div>
              </div>
              <div 
                className="chunk-bar"
                style={{
                  backgroundColor: getColorForSize(chunk.size),
                  width: `${Math.max(5, Math.min(100, (chunk.size / chunks[0].size) * 100))}%`
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  function renderModulesList() {
    if (!selectedChunk) {
      return <div className="no-chunk-selected">Please select a chunk to view its modules</div>;
    }
    
    const chunk = chunks.find(c => c.id === selectedChunk);
    
    if (!chunk) {
      return <div className="error">Chunk not found</div>;
    }
    
    const sortedModules = [...chunk.modules].sort((a, b) => b.size - a.size);
    
    return (
      <div className="modules-list">
        <h3>Modules in {chunk.name} ({chunk.modules.length})</h3>
        
        {sortedModules.length === 0 ? (
          <div className="no-modules">No detailed module information available</div>
        ) : (
          <div className="modules-container">
            {sortedModules.map(module => (
              <div key={module.id} className="module-item">
                <div className="module-header">
                  <div className="module-name" title={module.name}>
                    {module.name.split('/').slice(-3).join('/')}
                  </div>
                  <div className="module-size">{formatSize(module.size)}</div>
                </div>
                <div 
                  className="module-bar"
                  style={{
                    backgroundColor: getColorForSize(module.size),
                    width: `${Math.max(5, Math.min(100, (module.size / sortedModules[0].size) * 100))}%`
                  }}
                ></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Build a treemap chart
  function renderTreemap() {
    if (chunks.length === 0) {
      return null;
    }
    
    // Calculate the total size
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    
    // Padding and width/height settings
    const padding = 2;
    const width = 1000;
    const height = 600;
    
    // Create rectangular blocks for the treemap
    const blocks: any[] = [];
    let x = 0;
    let y = 0;
    let rowHeight = 0;
    
    chunks.forEach(chunk => {
      // Calculate proportional width and height
      const blockArea = (chunk.size / totalSize) * (width * height);
      
      // Try to make it somewhat square-ish using a heuristic
      const blockWidth = Math.max(50, Math.sqrt(blockArea * (width / height)));
      
      // Check if we need to move to the next row
      if (x + blockWidth > width) {
        x = 0;
        y += rowHeight + padding;
        rowHeight = 0;
      }
      
      // Calculate actual height based on area and width
      const blockHeight = Math.max(50, blockArea / blockWidth);
      
      blocks.push({
        id: chunk.id,
        name: chunk.name,
        size: chunk.size,
        x,
        y,
        width: blockWidth - padding,
        height: blockHeight - padding
      });
      
      // Update variables for next iteration
      x += blockWidth + padding;
      rowHeight = Math.max(rowHeight, blockHeight);
    });
    
    return (
      <div className="treemap-container">
        <h3>Bundle Composition</h3>
        <svg width={width} height={height} className="treemap">
          {blocks.map(block => (
            <g 
              key={block.id}
              onClick={() => setSelectedChunk(block.id)}
              className={selectedChunk === block.id ? 'selected' : ''}
            >
              <rect
                x={block.x}
                y={block.y}
                width={block.width}
                height={block.height}
                fill={getColorForSize(block.size)}
                rx={4}
                ry={4}
                className="treemap-rect"
              />
              <text
                x={block.x + block.width / 2}
                y={block.y + block.height / 2}
                textAnchor="middle"
                className="treemap-text"
              >
                {block.name.length > 15 ? block.name.slice(0, 12) + '...' : block.name}
              </text>
              <text
                x={block.x + block.width / 2}
                y={block.y + block.height / 2 + 15}
                textAnchor="middle"
                className="treemap-subtext"
              >
                {formatSize(block.size)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  }
  
  if (loading) {
    return <div className="loading">Loading bundle statistics...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Bundle Stats</h2>
        <p>{error}</p>
        <p>To generate bundle stats, run:</p>
        <pre>asm build --stats</pre>
      </div>
    );
  }
  
  return (
    <div className="bundle-analyzer">
      <h2>Bundle Size Analyzer</h2>
      
      <div className="total-size">
        Total Bundle Size: {formatSize(chunks.reduce((sum, chunk) => sum + chunk.size, 0))}
      </div>
      
      {renderTreemap()}
      
      <div className="lists-container">
        {renderChunksList()}
        {renderModulesList()}
      </div>
    </div>
  );
}
```

```scss
// blueprints/developer/bundle-analyzer/bundle-analyzer.styles.scss
.bundle-analyzer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  
  h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #212529;
  }
  
  h3 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #343a40;
  }
  
  .loading {
    text-align: center;
    margin: 50px 0;
    font-size: 18px;
    color: #6c757d;
  }
  
  .error-container {
    text-align: center;
    margin: 50px 0;
    padding: 30px;
    border: 1px solid #f8d7da;
    background-color: #fff5f5;
    border-radius: 8px;
    
    h2 {
      color: #e03131;
      margin-bottom: 15px;
    }
    
    p {
      margin-bottom: 15px;
      color: #495057;
    }
    
    pre {
      display: inline-block;
      padding: 10px 15px;
      background-color: #f8f9fa;
      border-radius: 4px;
      color: #212529;
      font-family: monospace;
    }
  }
  
  .total-size {
    font-size: 18px;
    margin-bottom: 20px;
    padding: 10px 15px;
    background-color: #e9ecef;
    border-radius: 8px;
    display: inline-block;
  }
  
  .treemap-container {
    margin-bottom: 30px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
    
    .treemap {
      border: 1px solid #e9ecef;
      background-color: #f8f9fa;
      border-radius: 8px;
      
      .treemap-rect {
        stroke: white;
        stroke-width: 1;
        transition: opacity 0.2s ease;
      }
      
      .treemap-text {
        fill: white;
        font-size: 12px;
        font-weight: bold;
        pointer-events: none;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      }
      
      .treemap-subtext {
        fill: rgba(255, 255, 255, 0.8);
        font-size: 10px;
        pointer-events: none;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      }
      
      g {
        cursor: pointer;
        
        &:hover .treemap-rect {
          stroke: #4263eb;
          stroke-width: 2;
          filter: brightness(1.1);
        }
        
        &.selected .treemap-rect {
          stroke: #4263eb;
          stroke-width: 3;
          filter: brightness(1.1);
        }
      }
    }
  }
  
  .lists-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .chunks-list, .modules-list {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
  }
  
  .chunks-container, .modules-container {
    max-height: 500px;
    overflow-y: auto;
  }
  
  .chunk-item, .module-item {
    margin-bottom: 10px;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 10px;
    cursor: pointer;
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    &.selected {
      border-color: #4263eb;
      background-color: rgba(66, 99, 235, 0.05);
    }
  }
  
  .chunk-header, .module-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .chunk-name, .module-name {
      font-weight: 500;
      color: #343a40;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .chunk-size, .module-size {
      color: #495057;
      font-family: monospace;
      white-space: nowrap;
    }
  }
  
  .chunk-bar, .module-bar {
    height: 8px;
    border-radius: 4px;
  }
  
  .no-chunk-selected, .no-modules {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #6c757d;
    font-style: italic;
    border: 1px dashed #ced4da;
    border-radius: 8px;
  }
}
```

### 6. Add Routes to Generate Bundle Stats

Update your build script to generate bundle stats:

```typescript
// src/scripts/build.ts
import { build } from 'vite';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

async function buildWithStats() {
  const startTime = Date.now();
  
  // Build the application with Vite
  const result = await build({
    mode: process.env.NODE_ENV || 'production',
    build: {
      // ... your build options
      
      // Add bundle analysis
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['preact', 'preact/hooks'],
            // Add other chunks as needed
          }
        }
      }
    }
  });
  
  // Generate stats file from the build result
  const stats = {
    buildTime: Date.now() - startTime,
    assets: Object.entries(result.output || {})
      .filter(([_, chunk]) => chunk.type === 'chunk' || chunk.type === 'asset')
      .map(([id, chunk]) => ({
        id,
        name: chunk.fileName,
        size: chunk.type === 'chunk' ? 
          (chunk.code ? chunk.code.length : 0) : 
          (chunk.source ? 
            (typeof chunk.source === 'string' ? 
              chunk.source.length : 
              chunk.source.byteLength) 
            : 0),
        type: chunk.type
      }))
  };
  
  // Create stats directory if it doesn't exist
  const statsDir = resolve(process.cwd(), 'dist', '_stats');
  mkdirSync(statsDir, { recursive: true });
  
  // Write stats to file
  writeFileSync(
    resolve(statsDir, 'bundle.json'),
    JSON.stringify(stats, null, 2)
  );
  
  console.log(`Bundle stats written to dist/_stats/bundle.json`);
}

buildWithStats().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
```

### 7. Set Up a Controller for Performance and Bundle Stats

Create a controller to serve performance metrics and bundle statistics:

```bash
asm controller DevTools
```

This will launch the controller generator. When prompted, select options to create the DevTools controller.

Now, let's implement the controller:

```typescript
// src/controllers/dev-tools.controller.ts
import { BlueprintController } from '@assemblejs/core';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export class DevToolsController extends BlueprintController {
  initialize() {
    // Only register routes in development mode or with the DEBUG flag
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      this.registerRoutes();
    }
  }
  
  private registerRoutes() {
    // Serve bundle stats
    this.server.get('/_stats/bundle.json', async (request, reply) => {
      const statsPath = resolve(process.cwd(), 'dist', '_stats', 'bundle.json');
      
      if (existsSync(statsPath)) {
        try {
          const stats = readFileSync(statsPath, 'utf-8');
          return reply
            .type('application/json')
            .send(stats);
        } catch (error) {
          return reply
            .code(500)
            .send({
              error: 'Failed to read bundle stats',
              message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
      } else {
        return reply
          .code(404)
          .send({
            error: 'Bundle stats not found',
            message: 'Run "asm build --stats" to generate bundle statistics'
          });
      }
    });
    
    // API to receive performance metrics from clients
    this.server.post('/api/performance', async (request, reply) => {
      const metrics = request.body;
      
      // In a real application, you would save these metrics to a database
      // For now, we'll just log them to the console
      if (process.env.NODE_ENV === 'development') {
        console.log('Received performance metrics:', metrics);
      }
      
      return reply.send({ success: true });
    });
  }
}
```

### 8. Update the Server Configuration

Update your server.ts file to register the new controller and routes:

```typescript
// src/server.ts
import { createBlueprintServer } from '@assemblejs/core';
import { PerformanceService } from './services/performance.service';
import { DevToolsController } from './controllers/dev-tools.controller';
import { vaviteHttpServer } from 'vavite/http-server';
import { viteDevServer } from 'vavite/vite-dev-server';

const server = createBlueprintServer({
  // HTTP and development server configuration
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  // Register controllers
  controllers: [
    // ... other controllers
    DevToolsController
  ],
  
  // Register components
  components: [
    // ... other components
    {
      name: 'developer/performance-dashboard',
      routes: process.env.NODE_ENV === 'development' ? ['/_dashboard/performance'] : []
    }
  ],
  
  // Register blueprints
  blueprints: [
    // ... other blueprints
    {
      name: 'developer/bundle-analyzer',
      routes: process.env.NODE_ENV === 'development' ? ['/_dashboard/bundle'] : []
    }
  ],
  
  // Register services
  services: [
    // ... other services
    {
      type: PerformanceService,
      options: {
        enableCoreProfiling: true,
        enableNetworkProfiling: true,
        enableMemoryProfiling: process.env.NODE_ENV === 'development',
        enableRenderProfiling: process.env.NODE_ENV === 'development',
        reportingEndpoint: process.env.NODE_ENV === 'production' 
          ? '/api/performance' 
          : undefined,
        samplingRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
      }
    }
  ]
});

// Start the server
server.start();
```

## Advanced Topics

### 1. Implementing Real User Monitoring (RUM)

For production monitoring of real users, enhance the performance service:

```typescript
// Add to the PerformanceService

// Add RUM functionality to track user sessions
enableRealUserMonitoring() {
  if (typeof window === 'undefined') return;
  
  // Generate a unique session ID
  const sessionId = Math.random().toString(36).substring(2, 15);
  
  // Track page navigations
  this.trackNavigation();
  
  // Track user interactions
  this.trackInteractions();
  
  // Track errors
  this.trackErrors();
  
  return sessionId;
}

private trackNavigation() {
  // Track route changes in SPA
  window.addEventListener('popstate', () => {
    this.recordPageView();
  });
  
  // Override history methods to track SPA navigation
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = (...args) => {
    originalPushState.apply(history, args);
    this.recordPageView();
  };
  
  history.replaceState = (...args) => {
    originalReplaceState.apply(history, args);
    this.recordPageView();
  };
  
  // Record initial page view
  this.recordPageView();
}

private recordPageView() {
  this.metrics.pageViews = this.metrics.pageViews || [];
  
  const pageView = {
    url: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer,
    timestamp: Date.now()
  };
  
  this.metrics.pageViews.push(pageView);
  
  // Reset performance metrics for the new page
  performance.mark('page_start');
  
  // Immediately send previous page's data if available
  if (this.options.reportingEndpoint && this.metrics.pageViews.length > 1) {
    this.sendMetrics();
  }
}

private trackInteractions() {
  // Track user clicks
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    
    this.metrics.interactions = this.metrics.interactions || [];
    
    this.metrics.interactions.push({
      type: 'click',
      element: target.tagName,
      id: target.id,
      class: target.className,
      path: window.location.pathname,
      timestamp: Date.now()
    });
  });
}

private trackErrors() {
  window.addEventListener('error', (event) => {
    this.metrics.errors = this.metrics.errors || [];
    
    this.metrics.errors.push({
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: Date.now(),
      path: window.location.pathname
    });
    
    // Send error metrics immediately
    if (this.options.reportingEndpoint) {
      this.sendMetrics();
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    this.metrics.errors = this.metrics.errors || [];
    
    this.metrics.errors.push({
      message: 'Unhandled Promise Rejection',
      reason: event.reason?.toString() || 'Unknown reason',
      timestamp: Date.now(),
      path: window.location.pathname
    });
    
    // Send error metrics immediately
    if (this.options.reportingEndpoint) {
      this.sendMetrics();
    }
  });
}

private sendMetrics() {
  if (!this.options.reportingEndpoint) return;
  
  // Clone metrics to avoid modifications during sending
  const metrics = JSON.parse(JSON.stringify(this.metrics));
  
  // Add user agent and other browser information
  metrics.browser = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screen: {
      width: window.screen.width,
      height: window.screen.height
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
  
  // Use fetch or navigator.sendBeacon to send data
  const canUseBeacon = this.options.reportingEndpoint && 
    navigator.sendBeacon && 
    navigator.sendBeacon.bind(navigator);
  
  if (canUseBeacon) {
    navigator.sendBeacon(this.options.reportingEndpoint, JSON.stringify(metrics));
  } else {
    fetch(this.options.reportingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metrics),
      keepalive: true
    }).catch(err => console.error('Failed to send metrics:', err));
  }
}
```

### 2. Implementing Per-Route Performance Tracking

To track performance on a per-route basis, add this functionality to the performance service:

```typescript
// Add to the PerformanceService

// Track route-specific performance metrics
trackRoute(routePath: string) {
  if (typeof window === 'undefined' || !performance.mark) return;
  
  // Start timing for the route
  performance.mark(`route_${routePath}_start`);
  
  // Store the current route
  this.currentRoute = routePath;
  
  // Initialize route metrics
  this.metrics.routes = this.metrics.routes || {};
  this.metrics.routes[routePath] = this.metrics.routes[routePath] || {
    renders: 0,
    totalRenderTime: 0,
    networkRequests: 0,
    errors: 0,
    lastRendered: Date.now()
  };
  
  // Return a function to end route tracking
  return () => {
    if (typeof window === 'undefined' || !performance.mark) return;
    
    performance.mark(`route_${routePath}_end`);
    
    try {
      performance.measure(
        `route_${routePath}`,
        `route_${routePath}_start`,
        `route_${routePath}_end`
      );
      
      const entries = performance.getEntriesByName(`route_${routePath}`, 'measure');
      
      if (entries.length > 0) {
        const routeRenderTime = entries[entries.length - 1].duration;
        
        // Update route metrics
        this.metrics.routes[routePath].renders++;
        this.metrics.routes[routePath].totalRenderTime += routeRenderTime;
        this.metrics.routes[routePath].lastRendered = Date.now();
        
        // Log slow routes (over 300ms)
        if (routeRenderTime > 300) {
          console.warn(`Slow route render detected for ${routePath}: ${routeRenderTime.toFixed(2)}ms`);
        }
      }
    } catch (e) {
      console.error(`Failed to measure route ${routePath}:`, e);
    }
  };
}

// Get metrics for a specific route
getRouteMetrics(routePath: string) {
  if (!this.metrics.routes || !this.metrics.routes[routePath]) {
    return null;
  }
  
  return { ...this.metrics.routes[routePath] };
}
```

### 3. Implementing Time-to-Interactive Tracking

Track Time-to-Interactive (TTI) as a key user experience metric:

```typescript
// Add to the PerformanceService

measureTimeToInteractive() {
  if (typeof window === 'undefined') return;
  
  // We need a few prerequisites
  if (!window.requestIdleCallback) {
    // Polyfill for requestIdleCallback
    (window as any).requestIdleCallback = (callback: any) => {
      const start = Date.now();
      return setTimeout(() => {
        callback({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
        });
      }, 1);
    };
  }
  
  const navigationStart = performance.timing?.navigationStart || performance.timeOrigin;
  let tti = 0;
  let ttiTimer: any = null;
  let longTasksObserver: PerformanceObserver | null = null;
  let firstInputObserver: PerformanceObserver | null = null;
  let lastLongTaskEnd = 0;
  
  // Function to detect TTI
  const checkTTI = () => {
    const currentTime = performance.now();
    
    // We consider the page interactive if:
    // 1. First contentful paint has happened
    // 2. DOM Content Loaded has fired
    // 3. No long tasks in the past 5 seconds
    // 4. Network is relatively quiet (no more than 2 in-flight requests)
    
    if (
      this.metrics.fcp && 
      document.readyState === 'complete' && 
      (currentTime - lastLongTaskEnd) >= 5000
    ) {
      tti = performance.now();
      this.metrics.tti = tti;
      
      // Clean up observers
      if (longTasksObserver) {
        longTasksObserver.disconnect();
      }
      
      if (firstInputObserver) {
        firstInputObserver.disconnect();
      }
      
      clearTimeout(ttiTimer);
      
      if (this.options.enableConsoleLogging) {
        console.log(`Time to Interactive: ${(tti - navigationStart).toFixed(2)}ms`);
      }
    } else {
      // Check again in 100ms
      ttiTimer = setTimeout(checkTTI, 100);
    }
  };
  
  // Observe long tasks
  try {
    longTasksObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        lastLongTaskEnd = entry.startTime + entry.duration;
      });
    });
    longTasksObserver.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    console.warn('Long tasks observer not supported', e);
  }
  
  // Start checking for TTI
  window.addEventListener('load', () => {
    // Start checking for TTI 50ms after load
    setTimeout(checkTTI, 50);
  });
}
```

### 4. Memory Leak Detection

Add a utility to detect memory leaks in components:

```typescript
// Add to utils/profiler.utils.ts

// Monitor component instances for potential memory leaks
export function monitorComponentInstances(
  componentName: string, 
  performanceService: PerformanceService,
  instanceCount: { current: number }
) {
  // Start tracking
  let intervalId: number;
  let maxInstances = 0;
  let consecutiveHighCounts = 0;
  
  const startMonitoring = () => {
    intervalId = window.setInterval(() => {
      // Update max instances
      if (instanceCount.current > maxInstances) {
        maxInstances = instanceCount.current;
      }
      
      // Check for potential memory leak (consistently high instance count)
      if (instanceCount.current > 0 && instanceCount.current >= maxInstances) {
        consecutiveHighCounts++;
        
        // If we have a consistently high count for a while, warn about potential leak
        if (consecutiveHighCounts > 5) {
          console.warn(
            `Potential memory leak detected in ${componentName}. ` + 
            `${instanceCount.current} instances have been created and not garbage collected.`
          );
          
          // Record the potential leak
          performanceService.metrics.memoryLeaks = performanceService.metrics.memoryLeaks || [];
          performanceService.metrics.memoryLeaks.push({
            component: componentName,
            instanceCount: instanceCount.current,
            timestamp: Date.now()
          });
          
          // Reset counter to avoid spamming the console
          consecutiveHighCounts = 0;
        }
      } else {
        // Reset the counter since instances were garbage collected
        consecutiveHighCounts = 0;
      }
    }, 10000); // Check every 10 seconds
  };
  
  const stopMonitoring = () => {
    clearInterval(intervalId);
  };
  
  // Start monitoring right away
  startMonitoring();
  
  // Return the stop function
  return stopMonitoring;
}
```

## Conclusion

Performance profiling and optimization in AssembleJS provides the tools needed to deliver fast, efficient applications. This cookbook has covered:

- Creating a comprehensive performance monitoring service
- Implementing real-time performance dashboards
- Tracking core web vitals and user-centric metrics
- Analyzing bundle size and component rendering performance
- Advanced techniques like memory leak detection and real user monitoring

By following these patterns, you can identify and resolve performance bottlenecks in your AssembleJS applications, leading to better user experiences and business outcomes.

For more information on optimizing AssembleJS applications, refer to the [Performance Optimization](../performance-optimization) documentation.