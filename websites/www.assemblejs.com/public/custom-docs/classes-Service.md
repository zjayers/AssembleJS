# Class: Service

Base Service class for AssembleJS services

**`Description`**

Services handle business logic, API communication, and data operations.
They serve as a layer between controllers and external resources like APIs or databases.

**`Author`**

Zachariah Ayers

## Hierarchy

- `Loggable`

  ↳ **`Service`**

## Table of contents

### Methods

- [initialize](Service.md#initialize)

### Constructors

- [constructor](Service.md#constructor)

### Properties

- [log](Service.md#log)

## Methods

### initialize

**initialize**(): `Promise`<`void`\>

Optional initialization method that will be called when the service is registered

**`Description`**

Can be used for setup operations like connecting to databases, initializing clients, etc.

**`Author`**

Zachariah Ayers

#### Returns

`Promise`<`void`\>

A promise that resolves when initialization is complete

#### Defined in

[src/server/abstract/service.ts:19](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/server/abstract/service.ts#L19)

## Constructors

### constructor

`Protected` **new Service**()

Creates a new Loggable instance

**`Description`**

Initializes a ConsoleLogger with the class name for consistent logging

**`Author`**

Zachariah Ayers

#### Inherited from

Loggable.constructor

#### Defined in

[src/server/abstract/loggable.ts:19](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/server/abstract/loggable.ts#L19)

## Properties

### log

 `Protected` `Readonly` **log**: `ConsoleLogger`

#### Inherited from

Loggable.log

#### Defined in

[src/server/abstract/loggable.ts:11](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/server/abstract/loggable.ts#L11)
