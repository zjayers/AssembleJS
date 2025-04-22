/**
 * @fileoverview Rule to enforce using AssembleJS events system instead of native DOM events
 * @author AssembleJS Team
 */
"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce using AssembleJS events system instead of native DOM events",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [], // no options
    messages: {
      useAssembleJSEvents:
        "Use events.emit() instead of dispatchEvent() for custom events",
      useAssembleJSEventListeners:
        "Use events.on() instead of addEventListener() for custom events",
      useAssembleJSRemoveListeners:
        "Use events.off() instead of removeEventListener() for custom events",
    },
  },

  create: function (context) {
    return {
      // Check for dispatchEvent calls
      "CallExpression[callee.property.name='dispatchEvent']": function (node) {
        // Look for new CustomEvent
        if (
          node.arguments.length > 0 &&
          node.arguments[0].type === "NewExpression" &&
          node.arguments[0].callee.name === "CustomEvent"
        ) {
          // Get the event name and data
          const eventNameNode = node.arguments[0].arguments[0];
          const eventName = eventNameNode.value;
          let detail = null;

          // Extract detail if available
          if (
            node.arguments[0].arguments.length > 1 &&
            node.arguments[0].arguments[1].type === "ObjectExpression"
          ) {
            const detailProp = node.arguments[0].arguments[1].properties.find(
              (prop) => prop.key.name === "detail"
            );

            if (detailProp) {
              detail = context.getSourceCode().getText(detailProp.value);
            }
          }

          context.report({
            node,
            messageId: "useAssembleJSEvents",
            fix: function (fixer) {
              // Create the events.emit() replacement
              let replacement;
              if (detail) {
                replacement = `events.emit('${eventName}', ${detail})`;
              } else {
                replacement = `events.emit('${eventName}')`;
              }

              return fixer.replaceText(node, replacement);
            },
          });
        }
      },

      // Check for addEventListener calls
      "CallExpression[callee.property.name='addEventListener']": function (
        node
      ) {
        if (
          node.arguments.length >= 2 &&
          node.arguments[0].type === "Literal" &&
          typeof node.arguments[0].value === "string" &&
          // Check if this is a custom event (contains ':')
          node.arguments[0].value.includes(":")
        ) {
          const eventName = node.arguments[0].value;
          const handlerExpression = context
            .getSourceCode()
            .getText(node.arguments[1]);

          context.report({
            node,
            messageId: "useAssembleJSEventListeners",
            fix: function (fixer) {
              return fixer.replaceText(
                node,
                `events.on('${eventName}', ${handlerExpression})`
              );
            },
          });
        }
      },

      // Check for removeEventListener calls
      "CallExpression[callee.property.name='removeEventListener']": function (
        node
      ) {
        if (
          node.arguments.length >= 2 &&
          node.arguments[0].type === "Literal" &&
          typeof node.arguments[0].value === "string" &&
          // Check if this is a custom event (contains ':')
          node.arguments[0].value.includes(":")
        ) {
          const eventName = node.arguments[0].value;
          const handlerExpression = context
            .getSourceCode()
            .getText(node.arguments[1]);

          context.report({
            node,
            messageId: "useAssembleJSRemoveListeners",
            fix: function (fixer) {
              return fixer.replaceText(
                node,
                `events.off('${eventName}', ${handlerExpression})`
              );
            },
          });
        }
      },
    };
  },
};
