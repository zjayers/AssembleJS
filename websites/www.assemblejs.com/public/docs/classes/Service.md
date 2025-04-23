# Class: Service

Base Service class for AssembleJS services

**`Description`**

Services handle business logic, API communication, and data operations.
They serve as a layer between controllers and external resources like APIs or databases.

**`Author`**

Zach Ayers

## Hierarchy

- `Loggable`

  ↳ **`Service`**

## Table of contents

### Constructors

- [constructor](Service.md#constructor)

### Methods

- [initialize](Service.md#initialize)

### Properties

- [log](Service.md#log)

## Constructors

### constructor

**new Service**()

Creates a new Loggable instance
Initializes a ConsoleLogger with the class name for consistent logging

#### Inherited from

Loggable.constructor

#### Defined in

[src/server/abstract/loggable.ts:15](https://github.com/zjayers/AssembleJS/blob/986668e/src/server/abstract/loggable.ts#L15)

## Methods

### initialize

**initialize**(): `Promise`<`void`\>

Optional initialization method that will be called when the service is registered
Can be used for setup operations like connecting to databases, initializing clients, etc.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/server/abstract/service.ts:14](https://github.com/zjayers/AssembleJS/blob/986668e/src/server/abstract/service.ts#L14)

## Properties

### log

 `Protected` `Readonly` **log**: `ConsoleLogger`

#### Inherited from

Loggable.log

#### Defined in

[src/server/abstract/loggable.ts:9](https://github.com/zjayers/AssembleJS/blob/986668e/src/server/abstract/loggable.ts#L9)
