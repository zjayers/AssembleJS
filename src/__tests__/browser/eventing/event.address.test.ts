import { describe, it, expect } from "@jest/globals";
import type { EventAddress } from "../../../browser/eventing/event.address";
import type { BlueprintEvent } from "../../../browser/eventing/blueprint.event";

describe("EventAddress Type", () => {
  it("should be a simplified version of BlueprintEvent without payload", () => {
    // Create a proper EventAddress
    const address: EventAddress = {
      channel: "test-channel",
      topic: "test-topic",
    };

    // Verify structure
    expect(address.channel).toBe("test-channel");
    expect(address.topic).toBe("test-topic");

    // Ensure payload doesn't exist on the type
    // TypeScript would catch this, but we can verify it at runtime too
    expect("payload" in address).toBe(false);
  });

  it("should be extractable from a BlueprintEvent", () => {
    // Create a BlueprintEvent
    const event: BlueprintEvent<string> = {
      channel: "test-channel",
      topic: "test-topic",
      payload: "test-payload",
    };

    // Extract EventAddress from BlueprintEvent
    const address: EventAddress = {
      channel: event.channel,
      topic: event.topic,
    };

    // Verify the extracted address
    expect(address.channel).toBe("test-channel");
    expect(address.topic).toBe("test-topic");
    expect("payload" in address).toBe(false);
  });

  it("should be usable with different channel and topic combinations", () => {
    // Create different EventAddress combinations
    const address1: EventAddress = {
      channel: "user-channel",
      topic: "user-created",
    };

    const address2: EventAddress = {
      channel: "user-channel",
      topic: "user-deleted",
    };

    const address3: EventAddress = {
      channel: "product-channel",
      topic: "product-created",
    };

    // Verify they're unique addresses
    expect(address1).not.toEqual(address2);
    expect(address1).not.toEqual(address3);
    expect(address2).not.toEqual(address3);

    // Verify they have correct structure
    expect(address1.channel).toBe("user-channel");
    expect(address1.topic).toBe("user-created");

    expect(address2.channel).toBe("user-channel");
    expect(address2.topic).toBe("user-deleted");

    expect(address3.channel).toBe("product-channel");
    expect(address3.topic).toBe("product-created");
  });

  it("should be compatible with empty strings for channel and topic", () => {
    // Though not recommended, empty strings should be valid
    const address: EventAddress = {
      channel: "",
      topic: "",
    };

    expect(address.channel).toBe("");
    expect(address.topic).toBe("");
  });

  it("should only require channel and topic properties", () => {
    // Creating a minimal EventAddress with only required properties
    const minimalAddress: EventAddress = {
      channel: "minimal-channel",
      topic: "minimal-topic",
    };

    // Adding any other property should cause type errors in TypeScript
    // We can verify the object only has the expected properties
    const propertyCount = Object.keys(minimalAddress).length;
    expect(propertyCount).toBe(2);
    expect("channel" in minimalAddress).toBe(true);
    expect("topic" in minimalAddress).toBe(true);
  });
});
