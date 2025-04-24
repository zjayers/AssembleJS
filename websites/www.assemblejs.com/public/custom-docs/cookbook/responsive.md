# Responsive Layouts

This guide demonstrates how to implement responsive layouts in AssembleJS applications to provide optimal user experiences across different devices and screen sizes.

## Overview

Responsive design is essential for modern web applications, ensuring that your interface adapts to various screen sizes, from large desktop monitors to small mobile devices. AssembleJS provides tools and patterns to create truly responsive applications with device-specific optimizations.

## Prerequisites

- AssembleJS project set up
- Basic understanding of CSS media queries
- Familiarity with CSS Grid and Flexbox

## Implementation Steps

### 1. Create a Device Detection Service

First, let's create a service to help with device detection and responsive behavior:

```bash
asm service Device
```

This will launch the service generator. When prompted, select options to create the device service.

Now let's implement the service:

```typescript
// src/services/device.service.ts
import { Service } from '@assemblejs/core';

export interface DeviceBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface DeviceOptions {
  breakpoints?: Partial<DeviceBreakpoints>;
  watchResize?: boolean;
}

export class DeviceService extends Service {
  private options: DeviceOptions;
  private currentBreakpoint: string = 'md';
  private listeners: Set<() => void> = new Set();
  private width: number = 0;
  private height: number = 0;
  private breakpoints: DeviceBreakpoints;
  private resizeHandler: () => void;
  
  initialize(options: DeviceOptions = {}) {
    this.options = {
      watchResize: true,
      ...options
    };
    
    // Set default breakpoints (Bootstrap-like)
    this.breakpoints = {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400,
      ...(options.breakpoints || {})
    };
    
    // Initialize only in browser
    if (typeof window !== 'undefined') {
      // Get initial dimensions
      this.updateDimensions();
      
      // Set up resize listener if enabled
      if (this.options.watchResize) {
        this.resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
      }
    }
    
    return this;
  }
  
  private updateDimensions() {
    // Get current window dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    // Determine current breakpoint
    const oldBreakpoint = this.currentBreakpoint;
    
    if (this.width >= this.breakpoints.xxl) {
      this.currentBreakpoint = 'xxl';
    } else if (this.width >= this.breakpoints.xl) {
      this.currentBreakpoint = 'xl';
    } else if (this.width >= this.breakpoints.lg) {
      this.currentBreakpoint = 'lg';
    } else if (this.width >= this.breakpoints.md) {
      this.currentBreakpoint = 'md';
    } else if (this.width >= this.breakpoints.sm) {
      this.currentBreakpoint = 'sm';
    } else {
      this.currentBreakpoint = 'xs';
    }
    
    // Notify listeners if breakpoint changed
    if (oldBreakpoint !== this.currentBreakpoint) {
      this.notifyListeners();
    }
  }
  
  private handleResize() {
    // Debounce resize events for better performance
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      this.updateDimensions();
    }, 100);
  }
  
  private resizeTimeout: any;
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
  
  // Clean up on service destruction
  destroy() {
    if (typeof window !== 'undefined' && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    this.listeners.clear();
  }
  
  // Public API
  
  getWidth(): number {
    return this.width;
  }
  
  getHeight(): number {
    return this.height;
  }
  
  getBreakpoint(): string {
    return this.currentBreakpoint;
  }
  
  isBreakpoint(breakpoint: string): boolean {
    return this.currentBreakpoint === breakpoint;
  }
  
  isBreakpointUp(breakpoint: keyof DeviceBreakpoints): boolean {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpoints.indexOf(this.currentBreakpoint);
    const targetIndex = breakpoints.indexOf(breakpoint);
    
    return currentIndex >= targetIndex;
  }
  
  isBreakpointDown(breakpoint: keyof DeviceBreakpoints): boolean {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpoints.indexOf(this.currentBreakpoint);
    const targetIndex = breakpoints.indexOf(breakpoint);
    
    return currentIndex <= targetIndex;
  }
  
  isMobile(): boolean {
    return this.isBreakpointDown('sm');
  }
  
  isTablet(): boolean {
    return this.isBreakpoint('md') || this.isBreakpoint('sm');
  }
  
  isDesktop(): boolean {
    return this.isBreakpointUp('lg');
  }
  
  // Subscription API
  
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  // Additional device detection
  
  isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      ((navigator as any).msMaxTouchPoints > 0)
    );
  }
  
  getOrientation(): 'portrait' | 'landscape' {
    if (typeof window === 'undefined') return 'portrait';
    
    return this.height > this.width ? 'portrait' : 'landscape';
  }
  
  // Media query matching
  
  matchesMediaQuery(query: string): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    
    return window.matchMedia(query).matches;
  }
  
  // Get CSS breakpoint value
  
  getBreakpointValue(breakpoint: keyof DeviceBreakpoints): number {
    return this.breakpoints[breakpoint];
  }
}
```

### 2. Create Responsive Layout Components

Now, let's create some responsive layout components:

```bash
asm component layout responsive-container
```

This will launch the component generator. When prompted, select options to create the responsive container component.

Now, let's implement the component:

```tsx
// components/layout/responsive-container/responsive-container.view.tsx
import { h } from 'preact';
import { ViewContext } from '@assemblejs/core';
import { DeviceService } from '../../../services/device.service';
import { useState, useEffect } from 'preact/hooks';

export interface ResponsiveContainerProps {
  children: any;
  fluid?: boolean;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  maxWidth?: string | number;
}

export default function ResponsiveContainer({ 
  context,
  children,
  fluid = false,
  breakpoint,
  className = '',
  maxWidth
}: ResponsiveContainerProps & { context: ViewContext }) {
  const deviceService = context.services?.get(DeviceService);
  const [currentBreakpoint, setCurrentBreakpoint] = useState(
    deviceService?.getBreakpoint() || 'md'
  );
  
  useEffect(() => {
    if (!deviceService) return;
    
    // Update breakpoint state when it changes
    const unsubscribe = deviceService.subscribe(() => {
      setCurrentBreakpoint(deviceService.getBreakpoint());
    });
    
    return unsubscribe;
  }, [deviceService]);
  
  // Determine container class based on fluid prop and breakpoint
  let containerClass = fluid ? 'container-fluid' : 'container';
  
  if (breakpoint && !fluid) {
    containerClass = `container-${breakpoint}`;
  }
  
  // Calculate inline styles if maxWidth provided
  const style: any = {};
  if (maxWidth) {
    style.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
  }
  
  return (
    <div className={`${containerClass} ${className}`} style={style}>
      {children}
    </div>
  );
}
```

```typescript
// components/layout/responsive-container/responsive-container.client.ts
export default function() {
  // Client-side functionality not needed for this component
}
```

```scss
// components/layout/responsive-container/responsive-container.styles.scss
.container,
.container-fluid,
.container-sm,
.container-md,
.container-lg,
.container-xl,
.container-xxl {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding-right: 1rem;
  padding-left: 1rem;
}

@media (min-width: 576px) {
  .container,
  .container-sm {
    max-width: 540px;
  }
}

@media (min-width: 768px) {
  .container,
  .container-sm,
  .container-md {
    max-width: 720px;
  }
}

@media (min-width: 992px) {
  .container,
  .container-sm,
  .container-md,
  .container-lg {
    max-width: 960px;
  }
}

@media (min-width: 1200px) {
  .container,
  .container-sm,
  .container-md,
  .container-lg,
  .container-xl {
    max-width: 1140px;
  }
}

@media (min-width: 1400px) {
  .container,
  .container-sm,
  .container-md,
  .container-lg,
  .container-xl,
  .container-xxl {
    max-width: 1320px;
  }
}
```

### 3. Create a Responsive Grid System

Let's create responsive grid components:

```bash
asm component layout responsive-grid
```

This will launch the component generator. When prompted, select options to create the responsive grid component.

Now, let's implement the component:

```tsx
// components/layout/responsive-grid/responsive-grid.view.tsx
import { h } from 'preact';
import { ViewContext } from '@assemblejs/core';
import { DeviceService } from '../../../services/device.service';
import { useState, useEffect } from 'preact/hooks';

export interface ResponsiveGridProps {
  children: any;
  columns?: number | Record<string, number>;
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
  className?: string;
}

export default function ResponsiveGrid({
  context,
  children,
  columns = 12,
  gap = '1rem',
  rowGap,
  columnGap,
  className = ''
}: ResponsiveGridProps & { context: ViewContext }) {
  const deviceService = context.services?.get(DeviceService);
  const [currentBreakpoint, setCurrentBreakpoint] = useState(
    deviceService?.getBreakpoint() || 'md'
  );
  
  useEffect(() => {
    if (!deviceService) return;
    
    // Update breakpoint state when it changes
    const unsubscribe = deviceService.subscribe(() => {
      setCurrentBreakpoint(deviceService.getBreakpoint());
    });
    
    return unsubscribe;
  }, [deviceService]);
  
  // Calculate grid template columns based on columns prop
  let gridTemplateColumns = '';
  
  if (typeof columns === 'number') {
    gridTemplateColumns = `repeat(${columns}, 1fr)`;
  } else if (typeof columns === 'object') {
    // If columns is an object, use appropriate breakpoint
    const breakpointsOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentBreakpointIndex = breakpointsOrder.indexOf(currentBreakpoint);
    
    // Find the closest breakpoint that has a defined column value
    let columnsValue = 12; // Default
    
    for (let i = currentBreakpointIndex; i >= 0; i--) {
      const breakpoint = breakpointsOrder[i];
      if (columns[breakpoint] !== undefined) {
        columnsValue = columns[breakpoint];
        break;
      }
    }
    
    gridTemplateColumns = `repeat(${columnsValue}, 1fr)`;
  }
  
  // Calculate gap styles
  const gapStyle = gap ? { gap } : {};
  const rowGapStyle = rowGap ? { rowGap } : {};
  const columnGapStyle = columnGap ? { columnGap } : {};
  
  const style = {
    display: 'grid',
    gridTemplateColumns,
    ...gapStyle,
    ...rowGapStyle,
    ...columnGapStyle
  };
  
  return (
    <div className={`responsive-grid ${className}`} style={style}>
      {children}
    </div>
  );
}
```

```typescript
// components/layout/responsive-grid/responsive-grid.client.ts
export default function() {
  // Client-side functionality not needed for this component
}
```

```scss
// components/layout/responsive-grid/responsive-grid.styles.scss
.responsive-grid {
  display: grid;
  width: 100%;
  
  // Utility classes for grid items
  [class*="col-"] {
    grid-column: span var(--columns, 12);
  }
  
  @for $i from 1 through 12 {
    .col-#{$i} {
      --columns: #{$i};
    }
  }
  
  @media (min-width: 576px) {
    @for $i from 1 through 12 {
      .col-sm-#{$i} {
        --columns: #{$i};
      }
    }
  }
  
  @media (min-width: 768px) {
    @for $i from 1 through 12 {
      .col-md-#{$i} {
        --columns: #{$i};
      }
    }
  }
  
  @media (min-width: 992px) {
    @for $i from 1 through 12 {
      .col-lg-#{$i} {
        --columns: #{$i};
      }
    }
  }
  
  @media (min-width: 1200px) {
    @for $i from 1 through 12 {
      .col-xl-#{$i} {
        --columns: #{$i};
      }
    }
  }
  
  @media (min-width: 1400px) {
    @for $i from 1 through 12 {
      .col-xxl-#{$i} {
        --columns: #{$i};
      }
    }
  }
  
  // Utility classes for grid item offset
  @for $i from 0 through 11 {
    .offset-#{$i} {
      grid-column-start: #{$i + 1};
    }
  }
  
  @media (min-width: 576px) {
    @for $i from 0 through 11 {
      .offset-sm-#{$i} {
        grid-column-start: #{$i + 1};
      }
    }
  }
  
  @media (min-width: 768px) {
    @for $i from 0 through 11 {
      .offset-md-#{$i} {
        grid-column-start: #{$i + 1};
      }
    }
  }
  
  @media (min-width: 992px) {
    @for $i from 0 through 11 {
      .offset-lg-#{$i} {
        grid-column-start: #{$i + 1};
      }
    }
  }
  
  @media (min-width: 1200px) {
    @for $i from 0 through 11 {
      .offset-xl-#{$i} {
        grid-column-start: #{$i + 1};
      }
    }
  }
  
  @media (min-width: 1400px) {
    @for $i from 0 through 11 {
      .offset-xxl-#{$i} {
        grid-column-start: #{$i + 1};
      }
    }
  }
}
```

### 4. Create a Responsive Hook

Let's create a custom hook for responsive behavior in components:

```typescript
// src/hooks/useResponsive.ts
import { useState, useEffect } from 'preact/hooks';
import { DeviceService } from '../services/device.service';

export function useResponsive(deviceService: DeviceService) {
  const [breakpoint, setBreakpoint] = useState(deviceService.getBreakpoint());
  const [width, setWidth] = useState(deviceService.getWidth());
  const [height, setHeight] = useState(deviceService.getHeight());
  const [isMobile, setIsMobile] = useState(deviceService.isMobile());
  const [isTablet, setIsTablet] = useState(deviceService.isTablet());
  const [isDesktop, setIsDesktop] = useState(deviceService.isDesktop());
  const [orientation, setOrientation] = useState(deviceService.getOrientation());
  
  useEffect(() => {
    // Update state when device metrics change
    const unsubscribe = deviceService.subscribe(() => {
      setBreakpoint(deviceService.getBreakpoint());
      setWidth(deviceService.getWidth());
      setHeight(deviceService.getHeight());
      setIsMobile(deviceService.isMobile());
      setIsTablet(deviceService.isTablet());
      setIsDesktop(deviceService.isDesktop());
      setOrientation(deviceService.getOrientation());
    });
    
    return unsubscribe;
  }, [deviceService]);
  
  // Helper functions
  const isBreakpoint = (bp: string) => breakpoint === bp;
  const isBreakpointUp = (bp: string) => deviceService.isBreakpointUp(bp as any);
  const isBreakpointDown = (bp: string) => deviceService.isBreakpointDown(bp as any);
  const matchesMediaQuery = (query: string) => deviceService.matchesMediaQuery(query);
  
  return {
    breakpoint,
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    isBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    matchesMediaQuery
  };
}
```

### 5. Create a Responsive Media Component

Let's create a component for responsive images and videos:

```bash
asm component media responsive-media
```

This will launch the component generator. When prompted, select options to create the responsive media component.

Now, let's implement the component:

```tsx
// components/media/responsive-media/responsive-media.view.tsx
import { h } from 'preact';
import { ViewContext } from '@assemblejs/core';
import { DeviceService } from '../../../services/device.service';
import { useState, useEffect } from 'preact/hooks';
import { useResponsive } from '../../../hooks/useResponsive';

export interface ResponsiveMediaProps {
  src: string;
  type?: 'image' | 'video';
  sources?: Array<{
    src: string;
    media?: string;
    type?: string;
  }>;
  alt?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: string;
  lazy?: boolean;
  className?: string;
}

export default function ResponsiveMedia({
  context,
  src,
  type = 'image',
  sources = [],
  alt = '',
  width,
  height,
  objectFit = 'cover',
  lazy = true,
  className = ''
}: ResponsiveMediaProps & { context: ViewContext }) {
  const deviceService = context.services.get(DeviceService);
  const { isMobile } = useResponsive(deviceService);
  
  const style: any = {
    objectFit,
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto'
  };
  
  // Handle image rendering
  if (type === 'image') {
    // If we have multiple sources (art direction/responsive images)
    if (sources.length > 0) {
      return (
        <picture className={`responsive-media ${className}`}>
          {sources.map((source, index) => (
            <source key={index} srcSet={source.src} media={source.media} type={source.type} />
          ))}
          <img 
            src={src}
            alt={alt}
            loading={lazy ? 'lazy' : 'eager'}
            style={style}
            className="responsive-media__img"
          />
        </picture>
      );
    }
    
    // Simple responsive image
    return (
      <img 
        src={src}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        style={style}
        className={`responsive-media responsive-media__img ${className}`}
      />
    );
  }
  
  // Handle video rendering
  if (type === 'video') {
    return (
      <div className={`responsive-media responsive-media__container ${className}`}>
        <video
          src={src}
          controls={!isMobile} // Hide controls on mobile by default
          playsInline
          preload="metadata"
          style={style}
          className="responsive-media__video"
          muted={isMobile} // Mute on mobile to allow autoplay
        >
          {sources.map((source, index) => (
            <source key={index} src={source.src} type={source.type} />
          ))}
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
  
  return null;
}
```

```typescript
// components/media/responsive-media/responsive-media.client.ts
export default function() {
  // Optional: Add advanced client-side functionality for videos
  const videos = document.querySelectorAll('.responsive-media__video');
  
  // Initialize intersection observer for video autoplay
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target as HTMLVideoElement;
        
        if (entry.isIntersecting) {
          // Video is in view, try to play it if it's paused
          if (video.paused) {
            video.play().catch(() => {
              // Autoplay may be blocked, that's okay
            });
          }
        } else {
          // Video is out of view, pause it
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, { threshold: 0.5 });
    
    // Observe all videos
    videos.forEach(video => {
      videoObserver.observe(video);
    });
  }
}
```

```scss
// components/media/responsive-media/responsive-media.styles.scss
.responsive-media {
  display: block;
  max-width: 100%;
  
  &__container {
    position: relative;
    overflow: hidden;
    width: 100%;
    
    // 16:9 aspect ratio by default
    padding-top: 56.25%;
    
    // Make video position absolute to maintain aspect ratio
    .responsive-media__video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }
  }
  
  &__img {
    display: block;
    max-width: 100%;
    height: auto;
  }
  
  &__video {
    max-width: 100%;
  }
  
  // Common aspect ratios as utility classes
  &.aspect-1-1 {
    aspect-ratio: 1 / 1;
    
    &.responsive-media__container {
      padding-top: 100%;
    }
  }
  
  &.aspect-4-3 {
    aspect-ratio: 4 / 3;
    
    &.responsive-media__container {
      padding-top: 75%;
    }
  }
  
  &.aspect-16-9 {
    aspect-ratio: 16 / 9;
    
    &.responsive-media__container {
      padding-top: 56.25%;
    }
  }
  
  &.aspect-21-9 {
    aspect-ratio: 21 / 9;
    
    &.responsive-media__container {
      padding-top: 42.85%;
    }
  }
}
```

### 6. Create Device-Specific Components

Let's create a component that renders different content based on the device type:

```bash
asm component common device-specific
```

This will launch the component generator. When prompted, select options to create the device-specific component.

Now, let's implement the component:

```tsx
// components/common/device-specific/device-specific.view.tsx
import { h } from 'preact';
import { ViewContext } from '@assemblejs/core';
import { DeviceService } from '../../../services/device.service';
import { useState, useEffect } from 'preact/hooks';

export interface DeviceSpecificProps {
  children: any;
  mobileContent?: any;
  tabletContent?: any;
  desktopContent?: any;
  renderOn?: 'mobile' | 'tablet' | 'desktop' | 'tablet-up' | 'mobile-only' | 'tablet-only' | 'desktop-only';
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  breakpointAction?: 'up' | 'down' | 'only';
}

export default function DeviceSpecific({
  context,
  children,
  mobileContent,
  tabletContent,
  desktopContent,
  renderOn,
  breakpoint,
  breakpointAction = 'only'
}: DeviceSpecificProps & { context: ViewContext }) {
  const deviceService = context.services.get(DeviceService);
  const [shouldRender, setShouldRender] = useState(true);
  const [currentDevice, setCurrentDevice] = useState({
    isMobile: deviceService?.isMobile() || false,
    isTablet: deviceService?.isTablet() || false,
    isDesktop: deviceService?.isDesktop() || false
  });
  
  useEffect(() => {
    if (!deviceService) return;
    
    const evaluate = () => {
      // Determine rendering based on provided props
      let shouldShow = true;
      
      // If specific renderOn property provided
      if (renderOn) {
        switch (renderOn) {
          case 'mobile':
            shouldShow = deviceService.isMobile();
            break;
          case 'tablet':
            shouldShow = deviceService.isTablet();
            break;
          case 'desktop':
            shouldShow = deviceService.isDesktop();
            break;
          case 'tablet-up':
            shouldShow = deviceService.isTablet() || deviceService.isDesktop();
            break;
          case 'mobile-only':
            shouldShow = deviceService.isMobile() && !deviceService.isTablet();
            break;
          case 'tablet-only':
            shouldShow = deviceService.isTablet() && !deviceService.isDesktop();
            break;
          case 'desktop-only':
            shouldShow = deviceService.isDesktop() && !deviceService.isTablet();
            break;
        }
      }
      
      // If specific breakpoint provided
      if (breakpoint) {
        switch (breakpointAction) {
          case 'up':
            shouldShow = deviceService.isBreakpointUp(breakpoint as any);
            break;
          case 'down':
            shouldShow = deviceService.isBreakpointDown(breakpoint as any);
            break;
          case 'only':
            shouldShow = deviceService.isBreakpoint(breakpoint);
            break;
        }
      }
      
      setShouldRender(shouldShow);
      setCurrentDevice({
        isMobile: deviceService.isMobile(),
        isTablet: deviceService.isTablet(),
        isDesktop: deviceService.isDesktop()
      });
    };
    
    // Initial evaluation
    evaluate();
    
    // Subscribe to device changes
    const unsubscribe = deviceService.subscribe(evaluate);
    
    return unsubscribe;
  }, [deviceService, renderOn, breakpoint, breakpointAction]);
  
  if (!shouldRender) {
    return null;
  }
  
  // Render different content based on device type if provided
  if (currentDevice.isMobile && mobileContent !== undefined) {
    return mobileContent;
  }
  
  if (currentDevice.isTablet && tabletContent !== undefined) {
    return tabletContent;
  }
  
  if (currentDevice.isDesktop && desktopContent !== undefined) {
    return desktopContent;
  }
  
  // Default to children
  return children;
}
```

```typescript
// components/common/device-specific/device-specific.client.ts
export default function() {
  // No client-side functionality needed
}
```

### 7. Register the Services and Components in Your Server

Update your server.ts file to register the new service and components:

```typescript
// src/server.ts
import { createBlueprintServer } from '@assemblejs/core';
import { DeviceService } from './services/device.service';
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
      name: 'layout/responsive-container'
    },
    {
      name: 'layout/responsive-grid'
    },
    {
      name: 'media/responsive-media'
    },
    {
      name: 'common/device-specific'
    }
  ],
  
  // Register services
  services: [
    // ... other services
    {
      type: DeviceService,
      options: {
        // Custom breakpoints if needed
        breakpoints: {
          xs: 0,
          sm: 576,
          md: 768,
          lg: 992,
          xl: 1200,
          xxl: 1400
        },
        watchResize: true
      }
    }
  ]
});

// Start the server
server.start();
```

### 8. Create a Responsive Layout Example

Let's create a responsive layout example page:

```bash
asm blueprint responsive example
```

This will launch the blueprint generator. When prompted, select options to create the responsive example blueprint.

Now, let's implement it:

```tsx
// blueprints/responsive/example/example.view.tsx
import { h } from 'preact';
import { ViewContext } from '@assemblejs/core';
import { DeviceService } from '../../../services/device.service';
import { useResponsive } from '../../../hooks/useResponsive';

export default function ResponsiveExample({ context }: { context: ViewContext }) {
  const deviceService = context.services.get(DeviceService);
  const { 
    breakpoint, 
    width, 
    height, 
    isMobile, 
    isTablet, 
    isDesktop, 
    orientation 
  } = useResponsive(deviceService);
  
  return (
    <div className="responsive-example">
      <div data-component="layout/responsive-container">
        <h1>Responsive Layout Example</h1>
        
        <div className="device-info">
          <h2>Device Information</h2>
          <ul>
            <li><strong>Breakpoint:</strong> {breakpoint}</li>
            <li><strong>Width:</strong> {width}px</li>
            <li><strong>Height:</strong> {height}px</li>
            <li><strong>Device Type:</strong> {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</li>
            <li><strong>Orientation:</strong> {orientation}</li>
          </ul>
        </div>
        
        <h2>Responsive Grid Example</h2>
        <div data-component="layout/responsive-grid" columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="1rem">
          <div className="grid-item">Item 1</div>
          <div className="grid-item">Item 2</div>
          <div className="grid-item">Item 3</div>
          <div className="grid-item">Item 4</div>
          <div className="grid-item">Item 5</div>
          <div className="grid-item">Item 6</div>
          <div className="grid-item">Item 7</div>
          <div className="grid-item">Item 8</div>
        </div>
        
        <h2>Responsive Media Example</h2>
        <div data-component="media/responsive-media"
          type="image"
          src="/images/default.jpg"
          sources={[
            { src: '/images/mobile.jpg', media: '(max-width: 576px)' },
            { src: '/images/tablet.jpg', media: '(max-width: 992px)' },
            { src: '/images/desktop.jpg', media: '(min-width: 993px)' }
          ]}
          alt="Responsive image example"
          className="aspect-16-9"
        ></div>
        
        <h2>Device-Specific Content</h2>
        <div data-component="common/device-specific" renderOn="mobile">
          <div className="device-content mobile">
            <h3>Mobile Content</h3>
            <p>This content is optimized for mobile devices.</p>
          </div>
        </div>
        
        <div data-component="common/device-specific" renderOn="tablet">
          <div className="device-content tablet">
            <h3>Tablet Content</h3>
            <p>This content is optimized for tablet devices.</p>
          </div>
        </div>
        
        <div data-component="common/device-specific" renderOn="desktop">
          <div className="device-content desktop">
            <h3>Desktop Content</h3>
            <p>This content is optimized for desktop devices.</p>
          </div>
        </div>
        
        <h2>Responsive Typography</h2>
        <div className="typography-example">
          <h1 className="responsive-heading-1">Heading 1</h1>
          <h2 className="responsive-heading-2">Heading 2</h2>
          <h3 className="responsive-heading-3">Heading 3</h3>
          <p className="responsive-body">This is a paragraph with responsive font size.</p>
        </div>
      </div>
    </div>
  );
}
```

```scss
// blueprints/responsive/example/example.styles.scss
.responsive-example {
  padding: 1rem 0;
  
  h1, h2 {
    margin-bottom: 1.5rem;
  }
  
  .device-info {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        margin-bottom: 0.5rem;
      }
    }
  }
  
  .grid-item {
    background-color: #e9ecef;
    padding: 2rem;
    border-radius: 4px;
    text-align: center;
    
    &:nth-child(odd) {
      background-color: #dee2e6;
    }
  }
  
  .device-content {
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    
    &.mobile {
      background-color: #d1ecf1;
    }
    
    &.tablet {
      background-color: #fff3cd;
    }
    
    &.desktop {
      background-color: #d4edda;
    }
  }
  
  .typography-example {
    margin: 2rem 0;
    
    .responsive-heading-1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      line-height: 1.2;
    }
    
    .responsive-heading-2 {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      line-height: 1.3;
    }
    
    .responsive-heading-3 {
      font-size: clamp(1.25rem, 3vw, 1.75rem);
      line-height: 1.4;
    }
    
    .responsive-body {
      font-size: clamp(1rem, 2vw, 1.125rem);
      line-height: 1.6;
      max-width: 70ch;
    }
  }
}
```

## Advanced Topics

### 1. Implementing CSS Variables for Responsive Design

Create a SCSS file with responsive CSS variables:

```scss
// src/styles/_responsive-variables.scss

:root {
  // Base spacing unit (for consistent spacing throughout the app)
  --spacing-unit: 0.25rem;
  
  // Spacing scale
  --spacing-1: calc(var(--spacing-unit) * 1);  // 0.25rem
  --spacing-2: calc(var(--spacing-unit) * 2);  // 0.5rem
  --spacing-3: calc(var(--spacing-unit) * 4);  // 1rem
  --spacing-4: calc(var(--spacing-unit) * 6);  // 1.5rem
  --spacing-5: calc(var(--spacing-unit) * 8);  // 2rem
  --spacing-6: calc(var(--spacing-unit) * 12); // 3rem
  --spacing-7: calc(var(--spacing-unit) * 16); // 4rem
  --spacing-8: calc(var(--spacing-unit) * 24); // 6rem
  
  // Typography
  --font-size-base: 1rem;
  --line-height-base: 1.5;
  
  // Font scale
  --font-size-xs: calc(var(--font-size-base) * 0.75);    // 0.75rem
  --font-size-sm: calc(var(--font-size-base) * 0.875);   // 0.875rem
  --font-size-md: var(--font-size-base);                 // 1rem
  --font-size-lg: calc(var(--font-size-base) * 1.25);    // 1.25rem
  --font-size-xl: calc(var(--font-size-base) * 1.5);     // 1.5rem
  --font-size-2xl: calc(var(--font-size-base) * 1.75);   // 1.75rem
  --font-size-3xl: calc(var(--font-size-base) * 2);      // 2rem
  --font-size-4xl: calc(var(--font-size-base) * 2.5);    // 2.5rem
  --font-size-5xl: calc(var(--font-size-base) * 3);      // 3rem
  
  // Container sizes (matching Bootstrap-like breakpoints)
  --container-max-width: 100%;
  --container-padding: var(--spacing-3);
  
  // Border radius
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 1rem;
  --border-radius-full: 9999px;
  
  // Shadows
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  
  // Z-index
  --z-index-dropdown: 1000;
  --z-index-sticky: 1020;
  --z-index-fixed: 1030;
  --z-index-modal-backdrop: 1040;
  --z-index-modal: 1050;
  --z-index-popover: 1060;
  --z-index-tooltip: 1070;
}

// Small devices (landscape phones)
@media (min-width: 576px) {
  :root {
    --container-max-width: 540px;
    --container-padding: var(--spacing-4);
    --font-size-base: 1rem;
  }
}

// Medium devices (tablets)
@media (min-width: 768px) {
  :root {
    --container-max-width: 720px;
    --spacing-unit: 0.3rem;
    --font-size-base: 1.0625rem;
  }
}

// Large devices (desktops)
@media (min-width: 992px) {
  :root {
    --container-max-width: 960px;
    --container-padding: var(--spacing-5);
    --font-size-base: 1.125rem;
  }
}

// Extra large devices
@media (min-width: 1200px) {
  :root {
    --container-max-width: 1140px;
    --spacing-unit: 0.35rem;
  }
}

// XXL devices
@media (min-width: 1400px) {
  :root {
    --container-max-width: 1320px;
  }
}
```

### 2. Creating a Touch-Friendly Navigation Component

Let's create a responsive, touch-friendly navigation component:

```tsx
// components/navigation/responsive-nav/responsive-nav.view.tsx
import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { ViewContext } from '@assemblejs/core';
import { DeviceService } from '../../../services/device.service';
import { useResponsive } from '../../../hooks/useResponsive';

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  icon?: string;
}

export interface ResponsiveNavProps {
  items: NavItem[];
  logo?: string;
  logoAlt?: string;
  className?: string;
  theme?: 'light' | 'dark';
  position?: 'fixed' | 'sticky' | 'static';
  collapsible?: boolean;
}

export default function ResponsiveNav({
  context,
  items,
  logo,
  logoAlt = 'Logo',
  className = '',
  theme = 'light',
  position = 'static',
  collapsible = true
}: ResponsiveNavProps & { context: ViewContext }) {
  const deviceService = context.services.get(DeviceService);
  const { isMobile, isTablet } = useResponsive(deviceService);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  
  const isTouch = deviceService.isTouchDevice();
  const isMobileNavigation = isMobile || (isTablet && collapsible);
  
  // Close menu when clicking outside
  useEffect(() => {
    if (!isMobileNavigation) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileNavigation]);
  
  // Close mobile menu on navigation
  useEffect(() => {
    const handleNavigation = () => {
      if (isMobileNavigation) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('popstate', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [isMobileNavigation]);
  
  const toggleNav = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleSubmenu = (item: string) => {
    if (activeSubmenu === item) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(item);
    }
  };
  
  const renderNavItems = (navItems: NavItem[], isMobile: boolean, level = 0) => {
    return (
      <ul className={`nav-menu ${level > 0 ? 'submenu' : ''} ${level > 0 && isMobile ? 'submenu-mobile' : ''}`}>
        {navItems.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          const isActiveSubmenu = activeSubmenu === item.label;
          
          return (
            <li 
              key={index}
              className={`nav-item ${hasChildren ? 'has-children' : ''} ${isActiveSubmenu ? 'active' : ''}`}
            >
              <a href={item.href} className="nav-link">
                {item.icon && <span className="nav-icon">{item.icon}</span>}
                <span className="nav-label">{item.label}</span>
                
                {hasChildren && (
                  <button 
                    className="submenu-toggle"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSubmenu(item.label);
                    }}
                    aria-expanded={isActiveSubmenu}
                    aria-label={`Toggle ${item.label} submenu`}
                  >
                    <span className="arrow"></span>
                  </button>
                )}
              </a>
              
              {hasChildren && (isTouch ? isActiveSubmenu : true) && (
                renderNavItems(item.children!, isMobile, level + 1)
              )}
            </li>
          );
        })}
      </ul>
    );
  };
  
  return (
    <nav 
      ref={navRef}
      className={`
        responsive-nav 
        ${theme === 'dark' ? 'nav-dark' : 'nav-light'} 
        ${position === 'fixed' ? 'fixed' : position === 'sticky' ? 'sticky' : ''}
        ${isMobileNavigation ? 'mobile' : 'desktop'}
        ${isOpen ? 'open' : ''}
        ${className}
      `}
    >
      <div className="nav-container">
        <div className="nav-header">
          {logo && (
            <a href="/" className="nav-logo">
              <img src={logo} alt={logoAlt} />
            </a>
          )}
          
          {isMobileNavigation && (
            <button 
              className="nav-toggle" 
              onClick={toggleNav}
              aria-expanded={isOpen}
              aria-label="Toggle navigation"
            >
              <span className="toggle-icon"></span>
            </button>
          )}
        </div>
        
        <div className={`nav-content ${isOpen ? 'visible' : ''}`}>
          {renderNavItems(items, isMobileNavigation)}
        </div>
      </div>
    </nav>
  );
}
```

```scss
// components/navigation/responsive-nav/responsive-nav.styles.scss
.responsive-nav {
  width: 100%;
  z-index: var(--z-index-sticky);
  
  &.sticky {
    position: sticky;
    top: 0;
  }
  
  &.fixed {
    position: fixed;
    top: 0;
    left: 0;
  }
  
  &.nav-light {
    background-color: #fff;
    color: #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    .nav-link {
      color: #333;
      
      &:hover {
        color: #3498db;
      }
    }
    
    .nav-toggle .toggle-icon,
    .nav-toggle .toggle-icon::before,
    .nav-toggle .toggle-icon::after {
      background-color: #333;
    }
    
    .submenu-toggle .arrow::before {
      border-color: #333;
    }
  }
  
  &.nav-dark {
    background-color: #222;
    color: #fff;
    
    .nav-link {
      color: #fff;
      
      &:hover {
        color: #3498db;
      }
    }
    
    .nav-toggle .toggle-icon,
    .nav-toggle .toggle-icon::before,
    .nav-toggle .toggle-icon::after {
      background-color: #fff;
    }
    
    .submenu-toggle .arrow::before {
      border-color: #fff;
    }
  }
  
  .nav-container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: 0 var(--container-padding);
  }
  
  .nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
  }
  
  .nav-logo {
    img {
      max-height: 40px;
      display: block;
    }
  }
  
  .nav-toggle {
    display: none;
    background: none;
    border: none;
    padding: 10px;
    cursor: pointer;
    position: relative;
    
    .toggle-icon {
      display: block;
      width: 24px;
      height: 2px;
      position: relative;
      transition: background-color 0.3s;
      
      &::before,
      &::after {
        content: '';
        position: absolute;
        left: 0;
        width: 100%;
        height: 2px;
        transition: transform 0.3s;
      }
      
      &::before {
        top: -8px;
      }
      
      &::after {
        bottom: -8px;
      }
    }
  }
  
  .nav-menu {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    
    .nav-item {
      position: relative;
      
      &.has-children {
        > .nav-link {
          padding-right: 1.5rem;
        }
      }
      
      &.active {
        > .nav-link {
          color: #3498db;
        }
      }
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      padding: 1rem;
      text-decoration: none;
      transition: color 0.3s;
      
      .nav-icon {
        margin-right: 0.5rem;
      }
    }
    
    .submenu {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 200px;
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1;
      
      .nav-item {
        width: 100%;
      }
      
      .nav-link {
        padding: 0.75rem 1rem;
      }
      
      .submenu {
        top: 0;
        left: 100%;
      }
    }
    
    .nav-item:hover > .submenu,
    .submenu.active {
      display: block;
    }
  }
  
  .submenu-toggle {
    background: none;
    border: none;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    padding: 0.5rem;
    cursor: pointer;
    
    .arrow {
      display: block;
      width: 10px;
      height: 10px;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        width: 8px;
        height: 8px;
        border-right: 2px solid;
        border-bottom: 2px solid;
        transform: rotate(45deg);
      }
    }
  }
  
  // Mobile style
  &.mobile {
    .nav-toggle {
      display: block;
    }
    
    &.open {
      .nav-toggle {
        .toggle-icon {
          background-color: transparent;
          
          &::before {
            transform: rotate(45deg) translate(5px, 5px);
          }
          
          &::after {
            transform: rotate(-45deg) translate(5px, -5px);
          }
        }
      }
    }
    
    .nav-content {
      display: none;
      
      &.visible {
        display: block;
      }
    }
    
    .nav-menu {
      flex-direction: column;
      
      .submenu {
        position: static;
        display: none;
        background-color: transparent;
        box-shadow: none;
        padding-left: 1rem;
        
        &.active {
          display: block;
        }
      }
      
      .submenu-mobile {
        display: block;
        padding-left: 1.5rem;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-out;
      }
      
      .nav-item.active > .submenu-mobile {
        max-height: 1000px;
        transition: max-height 0.5s ease-in;
      }
      
      .submenu-toggle {
        .arrow::before {
          transform: rotate(45deg);
          transition: transform 0.3s;
        }
      }
      
      .nav-item.active > .nav-link .submenu-toggle {
        .arrow::before {
          transform: rotate(-135deg);
        }
      }
    }
  }
}

// Medium devices (tablets) and up
@media (min-width: 768px) {
  .responsive-nav {
    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .nav-header {
      padding: 0;
    }
    
    &:not(.mobile) {
      .nav-content {
        flex: 1;
        display: flex;
        justify-content: flex-end;
      }
      
      .nav-menu {
        .submenu-toggle {
          .arrow::before {
            transform: rotate(-45deg);
          }
        }
        
        .submenu .submenu-toggle {
          .arrow::before {
            transform: rotate(-135deg);
          }
        }
      }
    }
  }
}
```

### 3. Creating a Responsive Table Component

Let's create a component that handles responsive tables:

```tsx
// components/data/responsive-table/responsive-table.view.tsx
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { ViewContext } from '@assemblejs/core';
import { DeviceService } from '../../../services/device.service';
import { useResponsive } from '../../../hooks/useResponsive';

export interface TableColumn {
  header: string;
  accessor: string;
  priority?: 'high' | 'medium' | 'low';
  render?: (value: any, row: any) => any;
}

export interface ResponsiveTableProps {
  columns: TableColumn[];
  data: any[];
  caption?: string;
  className?: string;
  mode?: 'stack' | 'scroll' | 'collapse';
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  sortable?: boolean;
}

export default function ResponsiveTable({
  context,
  columns,
  data,
  caption,
  className = '',
  mode = 'stack',
  striped = false,
  bordered = false,
  hoverable = false,
  sortable = false
}: ResponsiveTableProps & { context: ViewContext }) {
  const deviceService = context.services.get(DeviceService);
  const { isMobile, isTablet } = useResponsive(deviceService);
  
  const [visibleColumns, setVisibleColumns] = useState(columns);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortedData, setSortedData] = useState(data);
  
  // Adjust visible columns based on screen size
  useEffect(() => {
    if (isMobile) {
      // On mobile, only show high priority columns
      setVisibleColumns(columns.filter(col => col.priority === 'high' || !col.priority));
    } else if (isTablet) {
      // On tablet, show high and medium priority columns
      setVisibleColumns(columns.filter(col => col.priority !== 'low'));
    } else {
      // On desktop, show all columns
      setVisibleColumns(columns);
    }
  }, [isMobile, isTablet, columns]);
  
  // Handle sorting
  useEffect(() => {
    if (sortField) {
      const sorted = [...data].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        // Handle nullish values
        if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
        
        // Handle different types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        return sortDirection === 'asc' 
          ? (aValue > bValue ? 1 : -1) 
          : (aValue > bValue ? -1 : 1);
      });
      
      setSortedData(sorted);
    } else {
      setSortedData(data);
    }
  }, [data, sortField, sortDirection]);
  
  const handleSort = (accessor: string) => {
    if (!sortable) return;
    
    if (sortField === accessor) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(accessor);
      setSortDirection('asc');
    }
  };
  
  // Render for stack mode (card layout on mobile)
  if (isMobile && mode === 'stack') {
    return (
      <div className={`responsive-table table-stack ${className}`}>
        {caption && <div className="table-caption">{caption}</div>}
        
        <div className="table-cards">
          {sortedData.map((row, rowIndex) => (
            <div 
              key={rowIndex} 
              className={`table-card ${rowIndex % 2 === 0 && striped ? 'striped' : ''} ${bordered ? 'bordered' : ''}`}
            >
              {visibleColumns.map((column, colIndex) => (
                <div key={colIndex} className="card-field">
                  <div className="card-label">{column.header}</div>
                  <div className="card-value">
                    {column.render 
                      ? column.render(row[column.accessor], row) 
                      : row[column.accessor]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Render for scroll mode (horizontally scrollable table)
  if ((isMobile || isTablet) && mode === 'scroll') {
    return (
      <div className={`responsive-table table-scroll ${className}`}>
        {caption && <caption>{caption}</caption>}
        
        <div className="table-scroll-container">
          <table className={`
            ${striped ? 'striped' : ''} 
            ${bordered ? 'bordered' : ''} 
            ${hoverable ? 'hoverable' : ''}
          `}>
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index} 
                    className={`${sortable ? 'sortable' : ''} ${sortField === column.accessor ? 'sorted' : ''}`}
                    onClick={() => handleSort(column.accessor)}
                  >
                    <div className="th-content">
                      {column.header}
                      {sortable && (
                        <span className={`sort-icon ${sortField === column.accessor ? sortDirection : ''}`}></span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {column.render 
                        ? column.render(row[column.accessor], row) 
                        : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  // Default render (collapse mode or desktop)
  return (
    <div className={`responsive-table ${className}`}>
      <table className={`
        ${striped ? 'striped' : ''} 
        ${bordered ? 'bordered' : ''} 
        ${hoverable ? 'hoverable' : ''}
        ${mode === 'collapse' ? 'collapsible' : ''}
      `}>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {visibleColumns.map((column, index) => (
              <th 
                key={index} 
                className={`
                  ${column.priority || ''} 
                  ${sortable ? 'sortable' : ''} 
                  ${sortField === column.accessor ? 'sorted' : ''}
                `}
                onClick={() => handleSort(column.accessor)}
                data-label={column.header}
              >
                <div className="th-content">
                  {column.header}
                  {sortable && (
                    <span className={`sort-icon ${sortField === column.accessor ? sortDirection : ''}`}></span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {visibleColumns.map((column, colIndex) => (
                <td 
                  key={colIndex} 
                  className={column.priority || ''} 
                  data-label={column.header}
                >
                  {column.render 
                    ? column.render(row[column.accessor], row) 
                    : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```scss
// components/data/responsive-table/responsive-table.styles.scss
.responsive-table {
  width: 100%;
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    caption {
      caption-side: top;
      font-weight: bold;
      margin-bottom: 0.5rem;
      text-align: left;
    }
    
    th, td {
      padding: 0.75rem;
      text-align: left;
      vertical-align: top;
    }
    
    th {
      font-weight: bold;
      border-bottom: 2px solid #ddd;
      
      &.sortable {
        cursor: pointer;
        user-select: none;
        
        .th-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .sort-icon {
          display: inline-block;
          width: 0;
          height: 0;
          margin-left: 0.5rem;
          vertical-align: middle;
          content: "";
          border-top: 4px solid #000;
          border-right: 4px solid transparent;
          border-bottom: 0;
          border-left: 4px solid transparent;
          opacity: 0.3;
          
          &.asc {
            opacity: 1;
            transform: rotate(180deg);
          }
          
          &.desc {
            opacity: 1;
          }
        }
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
    }
    
    tbody tr {
      border-bottom: 1px solid #ddd;
    }
    
    &.striped {
      tbody tr:nth-child(odd) {
        background-color: rgba(0, 0, 0, 0.025);
      }
    }
    
    &.bordered {
      th, td {
        border: 1px solid #ddd;
      }
    }
    
    &.hoverable {
      tbody tr:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
  }
  
  .table-scroll-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 1rem;
    
    &::after {
      content: '→';
      position: sticky;
      right: 0;
      display: block;
      width: 24px;
      height: 24px;
      background-color: rgba(0, 0, 0, 0.1);
      text-align: center;
      line-height: 24px;
      color: #000;
      border-radius: 50%;
      opacity: 0.5;
      margin: 0.5rem 0;
    }
  }
  
  // Card style for mobile stack view
  .table-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    
    .table-caption {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .table-card {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      &.striped:nth-child(odd) {
        background-color: #f9f9f9;
      }
      
      &.bordered {
        border: 1px solid #ddd;
      }
      
      .card-field {
        display: flex;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
        
        &:last-child {
          border-bottom: none;
        }
        
        .card-label {
          flex: 0 0 40%;
          font-weight: bold;
          padding-right: 1rem;
        }
        
        .card-value {
          flex: 1;
        }
      }
    }
  }
}

// Collapsible table styles for smaller screens
@media (max-width: 767px) {
  .responsive-table {
    table.collapsible {
      thead {
        display: none;
      }
      
      tbody {
        tr {
          display: block;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 1rem;
          padding: 0.5rem;
          
          td {
            display: flex;
            text-align: right;
            border: none;
            padding: 0.5rem;
            border-bottom: 1px solid #eee;
            
            &::before {
              content: attr(data-label);
              font-weight: bold;
              margin-right: auto;
              text-align: left;
            }
            
            &:last-child {
              border-bottom: none;
            }
          }
        }
      }
    }
  }
}

// Hide low priority columns on mobile
@media (max-width: 576px) {
  .responsive-table table th.low,
  .responsive-table table td.low {
    display: none;
  }
}

// Hide low priority columns on tablet
@media (min-width: 577px) and (max-width: 991px) {
  .responsive-table table th.low,
  .responsive-table table td.low {
    display: none;
  }
}
```

## Conclusion

Responsive design in AssembleJS enables you to create applications that work flawlessly across all devices. This cookbook has covered:

- Creating a device detection service for responsive behavior
- Building responsive layout components using CSS Grid and Flexbox
- Implementing media-specific components with art direction
- Building device-specific interfaces for optimal user experience
- Using CSS variables for consistent responsive design
- Creating touch-friendly navigation and interactive elements
- Advanced responsive techniques for tables and complex layouts

By following these patterns, you can create truly responsive AssembleJS applications that adapt gracefully to any screen size, from large desktop monitors to small mobile devices.

For further information on structuring your AssembleJS projects with responsive design in mind, refer to the [Project Structure](../project-structure) documentation.