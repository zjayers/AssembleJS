# AssembleJS Storefront Tutorial Guide

This document serves as a guide for creating an e-commerce storefront application using AssembleJS. As a user, I'll follow these instructions while Claude provides guidance. We'll build this together in interactive mode, documenting each step so other users can follow the same path later.

## Goals

1. Create a storefront project from scratch using AssembleJS CLI
2. Implement essential e-commerce features like product listing, search, cart, and checkout
3. Learn how to build modular UI components with AssembleJS
4. Understand server-side and client-side interactions in the framework
5. Document the process step-by-step

## Implementation Plan

1. Generate a new project using `asmgen` or `asm` shorthand commands
2. Create the necessary blueprints (pages) for product listing, product details, cart, and checkout
3. Create reusable components for product cards, navigation, search, cart, etc.
4. Implement controllers and services for product management and cart operations
5. Create models for product and order data
6. Style the application with SCSS
7. Test the application

## Command Reference

We'll use the following CLI commands throughout this tutorial:

| Command | Description |
|---------|-------------|
| `npx asm p <name>` | Create a new project |
| `npx asm b <name>` | Create a blueprint |
| `npx asm c <name>` | Create a component |
| `npx asm ctrl <name>` | Create a controller |
| `npx asm s <name>` | Create a service |
| `npx asm m <name>` | Create a model |
| `npx asm serve` | Start the development server |

## Multi-framework Implementation

A key feature of this tutorial will be demonstrating AssembleJS's ability to work with multiple UI frameworks in a single application. We'll implement different components using various frameworks:

1. Home page and Product Card - Preact
2. Navigation - Plain HTML 
3. Footer - EJS
4. About page - Markdown
5. Product Details page - React
6. Cart Dropdown - Vue
7. Checkout Form - Svelte

This approach will showcase how AssembleJS enables seamless integration of different UI technologies within a single coherent application.

Claude will guide me through the full interactive process, and we'll document each step in the tutorial file.