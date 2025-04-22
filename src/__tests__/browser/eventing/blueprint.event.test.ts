import { describe, it, expect } from "@jest/globals";
import type { BlueprintEvent } from "../../../browser/eventing/blueprint.event";

describe("BlueprintEvent Interface", () => {
  // Test that the BlueprintEvent interface can be properly implemented
  it("should be implementable with the correct structure", () => {
    // Create an event with a string payload
    const stringEvent: BlueprintEvent<string> = {
      channel: "test-channel",
      topic: "test-topic",
      payload: "test-payload",
    };

    // Verify the structure
    expect(stringEvent.channel).toBe("test-channel");
    expect(stringEvent.topic).toBe("test-topic");
    expect(stringEvent.payload).toBe("test-payload");

    // Create an event with a number payload
    const numberEvent: BlueprintEvent<number> = {
      channel: "test-channel",
      topic: "test-topic",
      payload: 123,
    };

    // Verify the structure
    expect(numberEvent.channel).toBe("test-channel");
    expect(numberEvent.topic).toBe("test-topic");
    expect(numberEvent.payload).toBe(123);

    // Create an event with an object payload
    const objectEvent: BlueprintEvent<{ id: number; name: string }> = {
      channel: "test-channel",
      topic: "test-topic",
      payload: { id: 1, name: "test" },
    };

    // Verify the structure
    expect(objectEvent.channel).toBe("test-channel");
    expect(objectEvent.topic).toBe("test-topic");
    expect(objectEvent.payload).toEqual({ id: 1, name: "test" });
  });

  it("should allow creation of events with complex payloads", () => {
    // Create an event with an array payload
    const arrayEvent: BlueprintEvent<string[]> = {
      channel: "test-channel",
      topic: "test-topic",
      payload: ["item1", "item2", "item3"],
    };

    expect(arrayEvent.payload).toHaveLength(3);
    expect(arrayEvent.payload[0]).toBe("item1");

    // Create an event with a nested object payload
    const complexEvent: BlueprintEvent<{
      users: Array<{
        id: number;
        name: string;
        active: boolean;
      }>;
    }> = {
      channel: "test-channel",
      topic: "test-topic",
      payload: {
        users: [
          { id: 1, name: "Alice", active: true },
          { id: 2, name: "Bob", active: false },
        ],
      },
    };

    expect(complexEvent.payload.users).toHaveLength(2);
    expect(complexEvent.payload.users[0].name).toBe("Alice");
    expect(complexEvent.payload.users[1].active).toBe(false);
  });

  it("should allow using the same channel with different topics", () => {
    // Create two events with the same channel but different topics
    const event1: BlueprintEvent<string> = {
      channel: "user-channel",
      topic: "user-created",
      payload: "New user created",
    };

    const event2: BlueprintEvent<string> = {
      channel: "user-channel",
      topic: "user-deleted",
      payload: "User deleted",
    };

    expect(event1.channel).toBe(event2.channel);
    expect(event1.topic).not.toBe(event2.topic);
  });

  it("should allow using the same topic with different channels", () => {
    // Create two events with different channels but the same topic
    const event1: BlueprintEvent<string> = {
      channel: "user-channel",
      topic: "status-changed",
      payload: "User status changed",
    };

    const event2: BlueprintEvent<string> = {
      channel: "product-channel",
      topic: "status-changed",
      payload: "Product status changed",
    };

    expect(event1.channel).not.toBe(event2.channel);
    expect(event1.topic).toBe(event2.topic);
  });
});
