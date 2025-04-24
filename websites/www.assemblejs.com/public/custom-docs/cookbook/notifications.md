# User Notifications

This guide provides comprehensive information about implementing user notifications in AssembleJS applications.

## Overview

Effective notifications enhance user experience by providing timely information, feedback, and alerts. This cookbook demonstrates how to implement various types of notifications in AssembleJS applications, from simple toast messages to complex notification centers.

## Prerequisites

- Basic knowledge of AssembleJS
- Understanding of component lifecycle
- Familiarity with event-driven architecture

## Implementation Steps

### 1. Create a Notification Service

First, let's create a service to manage notifications across your application:

```typescript
// services/notification.service.ts
import { Service } from 'assemblejs';

export interface NotificationOptions {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number; // milliseconds
  dismissible?: boolean;
  actions?: Array<{
    label: string;
    callback: () => void;
  }>;
}

export class NotificationService extends Service {
  private static _instance: NotificationService;
  private _notifications: Map<string, NotificationOptions> = new Map();
  private _listeners: Set<(notifications: NotificationOptions[]) => void> = new Set();
  
  constructor() {
    super('notification');
    if (NotificationService._instance) {
      return NotificationService._instance;
    }
    NotificationService._instance = this;
  }
  
  public show(options: NotificationOptions): string {
    const id = options.id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification = {
      ...options,
      id,
      dismissible: options.dismissible ?? true,
      duration: options.duration ?? (options.type === 'error' ? 0 : 5000) // 0 means it won't auto-dismiss
    };
    
    this._notifications.set(id, notification);
    this._notifyListeners();
    
    if (notification.duration > 0) {
      setTimeout(() => this.dismiss(id), notification.duration);
    }
    
    return id;
  }
  
  public dismiss(id: string): void {
    if (this._notifications.has(id)) {
      this._notifications.delete(id);
      this._notifyListeners();
    }
  }
  
  public dismissAll(): void {
    this._notifications.clear();
    this._notifyListeners();
  }
  
  public subscribe(callback: (notifications: NotificationOptions[]) => void): () => void {
    this._listeners.add(callback);
    callback(this.getAll());
    
    return () => {
      this._listeners.delete(callback);
    };
  }
  
  public getAll(): NotificationOptions[] {
    return Array.from(this._notifications.values());
  }
  
  private _notifyListeners(): void {
    const notifications = this.getAll();
    this._listeners.forEach(listener => listener(notifications));
  }
}
```

### 2. Create Toast Notification Components

Now, let's create components for displaying toast notifications:

```typescript
// Generate the component structure using AssembleJS CLI
// $ asm
// > Generate component
// > common
// > toast-notification
// > preact
```

```typescript
// components/common/toast-notification/toast-notification.client.ts
import { BlueprintClient } from 'assemblejs';
import type { NotificationOptions } from '../../../services/notification.service';

interface ToastNotificationProps {
  notification: NotificationOptions;
  onDismiss: (id: string) => void;
}

export default class ToastNotificationClient extends BlueprintClient {
  constructor() {
    super('toast-notification');
    
    this.onMount(() => {
      this.handleAnimation();
    });
  }
  
  private handleAnimation(): void {
    const toastElement = document.querySelector(`[data-notification-id="${this.getProps().notification.id}"]`);
    if (toastElement) {
      // Add entry animation
      toastElement.classList.add('toast-enter');
      
      // Set up exit animation when dismissed
      this.onDismiss(() => {
        toastElement.classList.add('toast-exit');
        toastElement.addEventListener('animationend', () => {
          const props = this.getProps() as ToastNotificationProps;
          props.onDismiss(props.notification.id);
        }, { once: true });
      });
    }
  }
  
  public dismiss(): void {
    this.emitEvent('dismiss');
  }
}
```

```tsx
// components/common/toast-notification/toast-notification.view.tsx
import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import type { NotificationOptions } from '../../../services/notification.service';

interface ToastProps {
  notification: NotificationOptions;
  onDismiss: (id: string) => void;
}

export default function ToastNotification({ notification, onDismiss }: ToastProps) {
  useEffect(() => {
    // Accessible focus management
    const toastElement = document.querySelector(`[data-notification-id="${notification.id}"]`);
    if (toastElement instanceof HTMLElement) {
      toastElement.focus();
    }
    
    return () => {
      // Return focus to the element that had focus before the toast appeared
      if (document.activeElement === toastElement) {
        document.body.focus();
      }
    };
  }, [notification.id]);
  
  const handleDismiss = () => {
    onDismiss(notification.id);
  };
  
  const handleActionClick = (callback: () => void) => {
    callback();
    onDismiss(notification.id);
  };
  
  return (
    <div 
      class={`toast toast-${notification.type}`} 
      role="alert"
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
      data-notification-id={notification.id}
      tabIndex={0}
    >
      <div class="toast-content">
        {notification.title && <div class="toast-title">{notification.title}</div>}
        <div class="toast-message">{notification.message}</div>
      </div>
      
      {notification.actions && notification.actions.length > 0 && (
        <div class="toast-actions">
          {notification.actions.map((action, index) => (
            <button 
              key={index} 
              class="toast-action-btn"
              onClick={() => handleActionClick(action.callback)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      
      {notification.dismissible && (
        <button 
          class="toast-dismiss" 
          aria-label="Dismiss notification"
          onClick={handleDismiss}
        >
          ×
        </button>
      )}
    </div>
  );
}
```

```scss
// components/common/toast-notification/toast-notification.styles.scss
.toast {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;
  max-width: 100%;
  width: 350px;
  pointer-events: auto;
  position: relative;
  
  &.toast-info {
    background-color: #e6f7ff;
    border-left: 4px solid #1890ff;
  }
  
  &.toast-success {
    background-color: #f6ffed;
    border-left: 4px solid #52c41a;
  }
  
  &.toast-warning {
    background-color: #fffbe6;
    border-left: 4px solid #faad14;
  }
  
  &.toast-error {
    background-color: #fff1f0;
    border-left: 4px solid #f5222d;
  }
  
  .toast-content {
    flex: 1;
  }
  
  .toast-title {
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .toast-message {
    font-size: 14px;
  }
  
  .toast-actions {
    margin-top: 8px;
    display: flex;
    gap: 8px;
  }
  
  .toast-action-btn {
    background: transparent;
    border: 1px solid currentColor;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    
    &:hover {
      opacity: 0.85;
    }
  }
  
  .toast-dismiss {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
    margin-left: 8px;
    opacity: 0.5;
    align-self: flex-start;
    line-height: 1;
    
    &:hover {
      opacity: 1;
    }
  }
}

@keyframes toastEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes toastExit {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

.toast-enter {
  animation: toastEnter 0.3s ease forwards;
}

.toast-exit {
  animation: toastExit 0.3s ease forwards;
}
```

### 3. Create a Toast Container Component

Next, create a container component to manage multiple toast notifications:

```typescript
// Generate the component structure using AssembleJS CLI
// $ asm
// > Generate component
// > common
// > toast-container
// > preact
```

```typescript
// components/common/toast-container/toast-container.client.ts
import { BlueprintClient } from 'assemblejs';
import { NotificationService, NotificationOptions } from '../../../services/notification.service';

export default class ToastContainerClient extends BlueprintClient {
  private notificationService: NotificationService;
  private unsubscribe: () => void;
  
  constructor() {
    super('toast-container');
    
    this.notificationService = new NotificationService();
    
    this.onMount(() => {
      this.unsubscribe = this.notificationService.subscribe(this.updateNotifications.bind(this));
    });
    
    this.onUnmount(() => {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    });
  }
  
  private updateNotifications(notifications: NotificationOptions[]): void {
    this.setProps({ notifications });
  }
  
  public dismissNotification(id: string): void {
    this.notificationService.dismiss(id);
  }
}
```

```tsx
// components/common/toast-container/toast-container.view.tsx
import { h } from 'preact';
import ToastNotification from '../toast-notification/toast-notification.view';
import type { NotificationOptions } from '../../../services/notification.service';

interface ToastContainerProps {
  notifications: NotificationOptions[];
  dismissNotification: (id: string) => void;
}

export default function ToastContainer({ notifications, dismissNotification }: ToastContainerProps) {
  return (
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      {notifications.map(notification => (
        <ToastNotification 
          key={notification.id} 
          notification={notification} 
          onDismiss={dismissNotification} 
        />
      ))}
    </div>
  );
}
```

```scss
// components/common/toast-container/toast-container.styles.scss
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  pointer-events: none; // Let clicks pass through the container, but toasts themselves can be clicked
  
  // Adjust positioning for mobile devices
  @media (max-width: 768px) {
    width: 100%;
    top: 10px;
    right: 0;
    align-items: center;
    
    .toast {
      width: calc(100% - 20px);
      margin-left: 10px;
      margin-right: 10px;
    }
  }
}
```

### 4. Create Alert Dialog Component

For more important notifications that require user attention:

```typescript
// Generate the component structure using AssembleJS CLI
// $ asm
// > Generate component
// > common
// > alert-dialog
// > preact
```

```typescript
// components/common/alert-dialog/alert-dialog.client.ts
import { BlueprintClient } from 'assemblejs';

export interface AlertDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export default class AlertDialogClient extends BlueprintClient {
  constructor() {
    super('alert-dialog');
    
    this.onMount(() => {
      this.trapFocus();
      this.setupKeyboardListeners();
    });
    
    this.onUnmount(() => {
      this.cleanupKeyboardListeners();
    });
  }
  
  private trapFocus(): void {
    const dialog = document.querySelector('.alert-dialog-content');
    if (dialog) {
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }
  
  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown);
  }
  
  private cleanupKeyboardListeners(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
  
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.handleCancel();
    }
  }
  
  public handleConfirm(): void {
    const props = this.getProps() as AlertDialogOptions;
    if (props.onConfirm) {
      props.onConfirm();
    }
    this.emitEvent('close');
  }
  
  public handleCancel(): void {
    const props = this.getProps() as AlertDialogOptions;
    if (props.onCancel) {
      props.onCancel();
    }
    this.emitEvent('close');
  }
}
```

```tsx
// components/common/alert-dialog/alert-dialog.view.tsx
import { h } from 'preact';
import type { AlertDialogOptions } from './alert-dialog.client';

export default function AlertDialog(props: AlertDialogOptions) {
  const { 
    title, 
    message, 
    confirmLabel = 'OK', 
    cancelLabel = 'Cancel',
    type = 'info'
  } = props;
  
  return (
    <div class="alert-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div class={`alert-dialog-content alert-${type}`}>
        <h3 id="dialog-title" class="alert-dialog-title">{title}</h3>
        <div class="alert-dialog-message">{message}</div>
        <div class="alert-dialog-actions">
          {cancelLabel && (
            <button 
              class="alert-dialog-button alert-dialog-cancel" 
              data-action="cancel"
            >
              {cancelLabel}
            </button>
          )}
          <button 
            class="alert-dialog-button alert-dialog-confirm" 
            data-action="confirm"
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

```scss
// components/common/alert-dialog/alert-dialog.styles.scss
.alert-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: fadeIn 0.2s ease-out;
}

.alert-dialog-content {
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 24px;
  animation: scaleIn 0.2s ease-out;
  
  &.alert-info {
    border-top: 4px solid #1890ff;
  }
  
  &.alert-success {
    border-top: 4px solid #52c41a;
  }
  
  &.alert-warning {
    border-top: 4px solid #faad14;
  }
  
  &.alert-error {
    border-top: 4px solid #f5222d;
  }
}

.alert-dialog-title {
  font-size: 18px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
}

.alert-dialog-message {
  margin-bottom: 24px;
}

.alert-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.alert-dialog-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &.alert-dialog-cancel {
    background-color: transparent;
    border: 1px solid #d9d9d9;
    
    &:hover {
      background-color: #f5f5f5;
    }
  }
  
  &.alert-dialog-confirm {
    background-color: #1890ff;
    border: 1px solid #1890ff;
    color: white;
    
    &:hover {
      background-color: #40a9ff;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.95); 
  }
  to { 
    opacity: 1;
    transform: scale(1); 
  }
}

@media (max-width: 768px) {
  .alert-dialog-content {
    width: calc(100% - 32px);
    margin: 0 16px;
  }
}
```

### 5. Create a Notification Center Component

For collecting and managing all user notifications in one place:

```typescript
// Generate the component structure using AssembleJS CLI
// $ asm
// > Generate component
// > common
// > notification-center
// > preact
```

```typescript
// components/common/notification-center/notification-center.client.ts
import { BlueprintClient } from 'assemblejs';
import { NotificationService, NotificationOptions } from '../../../services/notification.service';

interface NotificationCenterProps {
  isOpen: boolean;
  notifications: NotificationOptions[];
}

export default class NotificationCenterClient extends BlueprintClient {
  private notificationService: NotificationService;
  private unsubscribe: () => void;
  
  constructor() {
    super('notification-center');
    
    this.notificationService = new NotificationService();
    this.setProps({ isOpen: false, notifications: [] });
    
    this.onMount(() => {
      this.unsubscribe = this.notificationService.subscribe(this.updateNotifications.bind(this));
      document.addEventListener('click', this.handleOutsideClick);
    });
    
    this.onUnmount(() => {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      document.removeEventListener('click', this.handleOutsideClick);
    });
  }
  
  private updateNotifications(notifications: NotificationOptions[]): void {
    this.setProps({ 
      ...this.getProps(),
      notifications 
    });
  }
  
  private handleOutsideClick = (event: MouseEvent): void => {
    const props = this.getProps() as NotificationCenterProps;
    if (!props.isOpen) return;
    
    const centerElement = document.querySelector('.notification-center');
    const bellElement = document.querySelector('.notification-bell');
    
    if (centerElement && bellElement && 
        !centerElement.contains(event.target as Node) && 
        !bellElement.contains(event.target as Node)) {
      this.toggleCenter();
    }
  }
  
  public toggleCenter(): void {
    const props = this.getProps() as NotificationCenterProps;
    this.setProps({
      ...props,
      isOpen: !props.isOpen
    });
  }
  
  public dismissNotification(id: string): void {
    this.notificationService.dismiss(id);
  }
  
  public dismissAll(): void {
    this.notificationService.dismissAll();
  }
  
  public getUnreadCount(): number {
    return (this.getProps() as NotificationCenterProps).notifications.length;
  }
}
```

```tsx
// components/common/notification-center/notification-center.view.tsx
import { h } from 'preact';
import type { NotificationOptions } from '../../../services/notification.service';

interface NotificationCenterProps {
  isOpen: boolean;
  notifications: NotificationOptions[];
  toggleCenter: () => void;
  dismissNotification: (id: string) => void;
  dismissAll: () => void;
}

export default function NotificationCenter({ 
  isOpen, 
  notifications, 
  toggleCenter, 
  dismissNotification,
  dismissAll
}: NotificationCenterProps) {
  const unreadCount = notifications.length;
  
  return (
    <div class="notification-center-wrapper">
      <button 
        class="notification-bell" 
        onClick={toggleCenter}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
        </svg>
        {unreadCount > 0 && (
          <span class="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div 
          class="notification-center" 
          role="region" 
          aria-label="Notification center"
        >
          <div class="notification-center-header">
            <h3 class="notification-center-title">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                class="notification-center-clear" 
                onClick={dismissAll}
                aria-label="Clear all notifications"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div class="notification-center-content">
            {notifications.length === 0 ? (
              <div class="notification-center-empty">
                No notifications
              </div>
            ) : (
              <ul class="notification-list">
                {notifications.map(notification => (
                  <li 
                    key={notification.id} 
                    class={`notification-item notification-${notification.type}`}
                  >
                    <div class="notification-item-content">
                      <div class="notification-item-title">{notification.title}</div>
                      <div class="notification-item-message">{notification.message}</div>
                    </div>
                    <button 
                      class="notification-item-dismiss" 
                      onClick={() => dismissNotification(notification.id)}
                      aria-label="Dismiss notification"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

```scss
// components/common/notification-center/notification-center.styles.scss
.notification-center-wrapper {
  position: relative;
}

.notification-bell {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 8px;
  
  svg {
    fill: currentColor;
  }
  
  &:hover svg {
    fill: #1890ff;
  }
}

.notification-count {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #f5222d;
  color: white;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 1.5;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-center {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  
  &:before {
    content: '';
    position: absolute;
    top: -4px;
    right: 12px;
    width: 8px;
    height: 8px;
    background-color: white;
    transform: rotate(45deg);
    box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.04);
  }
}

.notification-center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.notification-center-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.notification-center-clear {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
}

.notification-center-content {
  flex: 1;
  overflow-y: auto;
}

.notification-center-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-size: 14px;
}

.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.notification-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.notification-info {
    border-left: 3px solid #1890ff;
  }
  
  &.notification-success {
    border-left: 3px solid #52c41a;
  }
  
  &.notification-warning {
    border-left: 3px solid #faad14;
  }
  
  &.notification-error {
    border-left: 3px solid #f5222d;
  }
}

.notification-item-content {
  flex: 1;
}

.notification-item-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.notification-item-message {
  font-size: 14px;
}

.notification-item-dismiss {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.5;
  align-self: flex-start;
  padding: 0 4px;
  
  &:hover {
    opacity: 1;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .notification-center {
    width: 100%;
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 12px 12px 0 0;
    max-height: 60vh;
    
    &:before {
      display: none;
    }
  }
}
```

### 6. Implement Push Notifications Service

For web push notifications (requires HTTPS):

```typescript
// services/push-notification.service.ts
import { Service } from 'assemblejs';
import { NotificationService, NotificationOptions } from './notification.service';

export class PushNotificationService extends Service {
  private static _instance: PushNotificationService;
  private _notificationService: NotificationService;
  private _serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  
  constructor() {
    super('push-notification');
    
    if (PushNotificationService._instance) {
      return PushNotificationService._instance;
    }
    
    PushNotificationService._instance = this;
    this._notificationService = new NotificationService();
  }
  
  public async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }
    
    try {
      this._serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }
  
  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return 'denied';
    }
    
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    
    if (Notification.permission !== 'denied') {
      return await Notification.requestPermission();
    }
    
    return 'denied';
  }
  
  public async subscribeUserToPush(): Promise<boolean> {
    if (!this._serviceWorkerRegistration) {
      await this.initialize();
    }
    
    if (!this._serviceWorkerRegistration) {
      return false;
    }
    
    try {
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        return false;
      }
      
      const existingSubscription = await this._serviceWorkerRegistration.pushManager.getSubscription();
      
      if (existingSubscription) {
        return true;
      }
      
      // Get public VAPID key from the server
      const response = await fetch('/api/push/public-key');
      const vapidPublicKey = await response.text();
      const convertedVapidKey = this._urlBase64ToUint8Array(vapidPublicKey);
      
      // Subscribe the user
      const subscription = await this._serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      
      // Send the subscription to the server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
      
      return true;
    } catch (error) {
      console.error('Failed to subscribe the user:', error);
      return false;
    }
  }
  
  public async unsubscribeFromPush(): Promise<boolean> {
    if (!this._serviceWorkerRegistration) {
      return false;
    }
    
    try {
      const subscription = await this._serviceWorkerRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        return true;
      }
      
      // Send the unsubscribe request to the server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
      
      await subscription.unsubscribe();
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe the user:', error);
      return false;
    }
  }
  
  public showLocalNotification(options: NotificationOptions): void {
    // Show notification in the app if the user is currently on the page
    this._notificationService.show(options);
    
    // Also show a browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(options.title, {
        body: options.message,
        icon: '/favicon.ico'
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }
  
  // Helper function to convert base64 to Uint8Array (needed for VAPID keys)
  private _urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}
```

### 7. Create Server-Side Controllers

For handling server-side notification logic and push subscription management:

```typescript
// Generate the controller using AssembleJS CLI
// $ asm
// > Generate controller
// > notification
```

```typescript
// controllers/notification.controller.ts
import { BlueprintController } from 'assemblejs';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export default class NotificationController extends BlueprintController {
  private vapidKeys: {
    publicKey: string;
    privateKey: string;
  };
  private subscriptionsPath: string;
  private subscriptions: PushSubscription[] = [];
  
  constructor() {
    super({
      name: 'notification',
      path: '/api/push'
    });
    
    // Initialize VAPID keys (should be stored securely in production)
    this.vapidKeys = webpush.generateVAPIDKeys();
    
    // Configure web-push
    webpush.setVapidDetails(
      'mailto:admin@example.com', // Use a real email in production
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    );
    
    // Path to store subscriptions (in production, use a database instead)
    this.subscriptionsPath = path.join(process.cwd(), 'data', 'push-subscriptions.json');
    this.loadSubscriptions();
    
    // Register routes
    this.registerRoutes();
  }
  
  private registerRoutes(): void {
    // Get VAPID public key
    this.addRoute({
      method: 'GET',
      path: '/public-key',
      handler: async (request, reply) => {
        return reply.send(this.vapidKeys.publicKey);
      }
    });
    
    // Subscribe to push notifications
    this.addRoute({
      method: 'POST',
      path: '/subscribe',
      handler: async (request, reply) => {
        const subscription = request.body as PushSubscription;
        
        if (!subscription || !subscription.endpoint) {
          return reply.status(400).send({ error: 'Invalid subscription' });
        }
        
        // Store subscription
        this.addSubscription(subscription);
        
        // Send a welcome notification
        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title: 'Notifications Enabled',
              message: 'You have successfully enabled push notifications!',
              type: 'success'
            })
          );
          
          return reply.status(201).send({ success: true });
        } catch (error) {
          console.error('Error sending push notification:', error);
          return reply.status(500).send({ error: 'Failed to send test notification' });
        }
      }
    });
    
    // Unsubscribe from push notifications
    this.addRoute({
      method: 'POST',
      path: '/unsubscribe',
      handler: async (request, reply) => {
        const subscription = request.body as PushSubscription;
        
        if (!subscription || !subscription.endpoint) {
          return reply.status(400).send({ error: 'Invalid subscription' });
        }
        
        this.removeSubscription(subscription);
        return reply.status(200).send({ success: true });
      }
    });
    
    // Send notification to all subscribers (protected endpoint, add auth in production)
    this.addRoute({
      method: 'POST',
      path: '/send',
      handler: async (request, reply) => {
        const { title, message, type = 'info' } = request.body;
        
        if (!title || !message) {
          return reply.status(400).send({ error: 'Title and message are required' });
        }
        
        const failedSubscriptions: string[] = [];
        
        // Send to all subscriptions
        await Promise.all(
          this.subscriptions.map(async (subscription) => {
            try {
              await webpush.sendNotification(
                subscription,
                JSON.stringify({ title, message, type })
              );
            } catch (error) {
              console.error('Error sending push notification:', error);
              failedSubscriptions.push(subscription.endpoint);
              
              // If subscription is expired or invalid, remove it
              if (error.statusCode === 404 || error.statusCode === 410) {
                this.removeSubscription(subscription);
              }
            }
          })
        );
        
        return reply.status(200).send({
          success: true,
          sent: this.subscriptions.length - failedSubscriptions.length,
          failed: failedSubscriptions.length
        });
      }
    });
  }
  
  private addSubscription(subscription: PushSubscription): void {
    // Check if subscription already exists
    const existingIndex = this.subscriptions.findIndex(
      sub => sub.endpoint === subscription.endpoint
    );
    
    if (existingIndex !== -1) {
      this.subscriptions[existingIndex] = subscription;
    } else {
      this.subscriptions.push(subscription);
    }
    
    this.saveSubscriptions();
  }
  
  private removeSubscription(subscription: PushSubscription): void {
    this.subscriptions = this.subscriptions.filter(
      sub => sub.endpoint !== subscription.endpoint
    );
    
    this.saveSubscriptions();
  }
  
  private loadSubscriptions(): void {
    try {
      if (fs.existsSync(this.subscriptionsPath)) {
        const data = fs.readFileSync(this.subscriptionsPath, 'utf8');
        this.subscriptions = JSON.parse(data);
      } else {
        // Ensure directory exists
        const dir = path.dirname(this.subscriptionsPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        this.subscriptions = [];
        this.saveSubscriptions();
      }
    } catch (error) {
      console.error('Error loading push subscriptions:', error);
      this.subscriptions = [];
    }
  }
  
  private saveSubscriptions(): void {
    try {
      fs.writeFileSync(
        this.subscriptionsPath,
        JSON.stringify(this.subscriptions, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Error saving push subscriptions:', error);
    }
  }
}
```

### 8. Create Service Worker for Push Notifications

```javascript
// public/service-worker.js
self.addEventListener('push', function(event) {
  if (!event.data) {
    console.log('Push event has no data');
    return;
  }
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.message,
      icon: '/favicon.ico',
      badge: '/badge-icon.png',
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const url = event.notification.data.url;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // If a window client already exists, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
```

### 9. Usage Examples

Here's how to use the notification system in your application:

```typescript
// Example of showing toast notifications
import { NotificationService } from '../services/notification.service';

const notificationService = new NotificationService();

// Simple info notification
notificationService.show({
  title: 'Information',
  message: 'Your profile has been updated successfully.',
  type: 'info'
});

// Success notification with custom duration
notificationService.show({
  title: 'Success',
  message: 'Your changes have been saved.',
  type: 'success',
  duration: 3000
});

// Warning notification
notificationService.show({
  title: 'Warning',
  message: 'Your session will expire in 5 minutes.',
  type: 'warning'
});

// Error notification with an action
notificationService.show({
  title: 'Error',
  message: 'Failed to save changes. Please try again.',
  type: 'error',
  duration: 0, // won't auto-dismiss
  actions: [{
    label: 'Try Again',
    callback: () => saveChanges()
  }]
});
```

```typescript
// Example of using alert dialog
import { AlertDialogClient } from '../components/common/alert-dialog/alert-dialog.client';

// Create and show an alert dialog
const showConfirmDialog = () => {
  const alertDialog = document.createElement('div');
  alertDialog.id = 'alert-dialog-container';
  document.body.appendChild(alertDialog);
  
  const client = new AlertDialogClient();
  client.createView(alertDialog, {
    title: 'Confirm Action',
    message: 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    type: 'warning',
    onConfirm: () => {
      // Handle confirm action
      deleteItem();
    },
    onCancel: () => {
      // Handle cancel action
      console.log('Action cancelled');
    }
  });
  
  client.onEvent('close', () => {
    document.body.removeChild(alertDialog);
  });
};
```

## Advanced Topics

### 1. Notification Persistence

For notifications that should persist between sessions, you can store them in localStorage or IndexedDB:

```typescript
// Add methods to NotificationService
public saveNotificationsToStorage(): void {
  const notifications = this.getAll();
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }
}

public loadNotificationsFromStorage(): void {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const notifications = JSON.parse(stored) as NotificationOptions[];
      notifications.forEach(notification => {
        if (!this._notifications.has(notification.id)) {
          this._notifications.set(notification.id, notification);
        }
      });
      this._notifyListeners();
    }
  }
}
```

### 2. User Preferences Management

Allow users to customize their notification preferences:

```typescript
// services/notification-preferences.service.ts
import { Service } from 'assemblejs';

export interface NotificationPreferences {
  allowToasts: boolean;
  allowPush: boolean;
  allowEmail: boolean;
  categories: {
    [category: string]: {
      enabled: boolean;
      channels: {
        toast: boolean;
        push: boolean;
        email: boolean;
      }
    }
  }
}

export class NotificationPreferencesService extends Service {
  private static _instance: NotificationPreferencesService;
  private _preferences: NotificationPreferences;
  
  constructor() {
    super('notification-preferences');
    
    if (NotificationPreferencesService._instance) {
      return NotificationPreferencesService._instance;
    }
    
    NotificationPreferencesService._instance = this;
    
    // Default preferences
    this._preferences = {
      allowToasts: true,
      allowPush: true,
      allowEmail: true,
      categories: {
        'system': {
          enabled: true,
          channels: { toast: true, push: true, email: true }
        },
        'marketing': { 
          enabled: true,
          channels: { toast: true, push: false, email: true }
        },
        'activity': {
          enabled: true,
          channels: { toast: true, push: true, email: true }
        }
      }
    };
    
    this.loadPreferences();
  }
  
  public getPreferences(): NotificationPreferences {
    return { ...this._preferences };
  }
  
  public updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this._preferences = { ...this._preferences, ...preferences };
    this.savePreferences();
  }
  
  public updateCategoryPreferences(category: string, preferences: any): void {
    if (!this._preferences.categories[category]) {
      this._preferences.categories[category] = {
        enabled: true,
        channels: { toast: true, push: true, email: true }
      };
    }
    
    this._preferences.categories[category] = {
      ...this._preferences.categories[category],
      ...preferences
    };
    
    this.savePreferences();
  }
  
  public canNotify(category: string, channel: 'toast' | 'push' | 'email'): boolean {
    if (!this._preferences.categories[category]) {
      return true; // Default to true if category not specified
    }
    
    const categoryPref = this._preferences.categories[category];
    if (!categoryPref.enabled) {
      return false;
    }
    
    switch (channel) {
      case 'toast':
        return this._preferences.allowToasts && categoryPref.channels.toast;
      case 'push':
        return this._preferences.allowPush && categoryPref.channels.push;
      case 'email':
        return this._preferences.allowEmail && categoryPref.channels.email;
      default:
        return true;
    }
  }
  
  private savePreferences(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('notification-preferences', JSON.stringify(this._preferences));
    }
    
    // For authenticated users, you might want to save to the server
    if (this.isAuthenticated()) {
      this.savePreferencesToServer();
    }
  }
  
  private loadPreferences(): void {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('notification-preferences');
      if (stored) {
        try {
          this._preferences = {
            ...this._preferences,
            ...JSON.parse(stored)
          };
        } catch (error) {
          console.error('Error parsing notification preferences:', error);
        }
      }
    }
    
    // For authenticated users, you might want to load from the server
    if (this.isAuthenticated()) {
      this.loadPreferencesFromServer();
    }
  }
  
  private isAuthenticated(): boolean {
    // Check if user is authenticated
    return false; // Implement your authentication check
  }
  
  private async savePreferencesToServer(): Promise<void> {
    try {
      await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this._preferences)
      });
    } catch (error) {
      console.error('Error saving notification preferences to server:', error);
    }
  }
  
  private async loadPreferencesFromServer(): Promise<void> {
    try {
      const response = await fetch('/api/user/notification-preferences');
      if (response.ok) {
        const data = await response.json();
        this._preferences = {
          ...this._preferences,
          ...data
        };
      }
    } catch (error) {
      console.error('Error loading notification preferences from server:', error);
    }
  }
}
```

### 3. Accessibility Considerations

Ensuring your notification system is accessible to all users:

- Use ARIA roles and attributes to make notifications work with screen readers
- Ensure proper color contrast ratios for all notification types
- Make sure notifications don't disappear too quickly for users who read slowly
- Provide keyboard navigation for notification centers
- Allow users to pause or disable animations if they prefer

```typescript
// Enhanced accessibility in the NotificationService

// Add to NotificationService class
public configure(options: {
  minDisplayTime?: number;  // For users who read slowly
  reduceMotion?: boolean;   // Respect prefers-reduced-motion
  highContrast?: boolean;   // Enhance contrast for visually impaired users
}): void {
  this._config = {
    ...this._config,
    ...options
  };
  
  // Apply CSS classes to the document based on configuration
  if (typeof document !== 'undefined') {
    if (options.reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    if (options.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }
}

// Add to the mount function of your toast container
this.onMount(() => {
  // Check user's system preferences for reduced motion
  if (typeof window !== 'undefined' && window.matchMedia) {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      this.notificationService.configure({ reduceMotion: true });
    }
    
    motionQuery.addEventListener('change', (e) => {
      this.notificationService.configure({ reduceMotion: e.matches });
    });
  }
});
```

```scss
// Add to your CSS for reduced motion support
@media (prefers-reduced-motion: reduce) {
  .toast-enter,
  .toast-exit,
  .alert-dialog-overlay,
  .alert-dialog-content {
    animation: none !important;
    transition: none !important;
  }
}

// Classes that can be toggled based on user preferences
html.reduce-motion {
  .toast-enter,
  .toast-exit,
  .alert-dialog-overlay,
  .alert-dialog-content {
    animation: none !important;
    transition: none !important;
  }
}

html.high-contrast {
  .toast {
    &.toast-info {
      background-color: #0050b3;
      color: white;
      border-left-color: #69c0ff;
    }
    
    &.toast-success {
      background-color: #237804;
      color: white;
      border-left-color: #95de64;
    }
    
    &.toast-warning {
      background-color: #ad6800;
      color: white;
      border-left-color: #ffd666;
    }
    
    &.toast-error {
      background-color: #a8071a;
      color: white;
      border-left-color: #ff7875;
    }
  }
}
```

## Conclusion

Implementing a comprehensive notification system in AssembleJS enhances the user experience by providing timely information and feedback. This cookbook demonstrated how to create a complete notification system with toast notifications, alert dialogs, a notification center, and push notifications.

By following the implementation steps and exploring the advanced topics, you've learned how to:

1. Create a centralized notification service
2. Implement toast notifications for non-intrusive messages
3. Build alert dialogs for important user interactions
4. Develop a notification center to manage all user notifications
5. Set up web push notifications for engaging users even when they're not on your site
6. Ensure notifications are accessible to all users
7. Manage user notification preferences

Remember to test your notification system thoroughly across different devices and browsers to ensure a consistent user experience. Pay special attention to mobile responsiveness and screen reader compatibility.

For further enhancements, consider implementing:

- Analytics to track notification engagement
- A/B testing for notification content and styling
- Intelligent notification timing based on user behavior
- Integration with external notification services

You can also explore how to integrate your notification system with other AssembleJS features like the event system for triggering notifications based on application events.

To get started quickly with notifications in your project, use the AssembleJS CLI:

```
$ asm
```

Then follow the interactive prompts to generate the necessary components and services for your notification system.