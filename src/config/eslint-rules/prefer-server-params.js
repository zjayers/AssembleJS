/**
 * @fileoverview Rule to enforce using AssembleJS context for parameters instead of direct URL manipulation
 * @author AssembleJS Team
 */
"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce using AssembleJS context for parameters instead of URL manipulation",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [], // no options
    messages: {
      useServerParams:
        "Use this.context.params.query instead of direct URL parameter access",
      avoidLocationHref:
        "Avoid direct window.location.href manipulation for navigation",
    },
  },

  create: function (context) {
    return {
      // Check for URLSearchParams constructor
      "NewExpression[callee.name='URLSearchParams']": function (node) {
        // Check if it's using window.location.search
        if (
          node.arguments.length > 0 &&
          node.arguments[0].type === "MemberExpression" &&
          node.arguments[0].object &&
          (node.arguments[0].object.name === "window" ||
            (node.arguments[0].object.type === "MemberExpression" &&
              node.arguments[0].object.object &&
              node.arguments[0].object.object.name === "window" &&
              node.arguments[0].object.property &&
              node.arguments[0].object.property.name === "location")) &&
          node.arguments[0].property &&
          node.arguments[0].property.name === "search"
        ) {
          context.report({
            node,
            messageId: "useServerParams",
            fix: function (fixer) {
              // Look for the .get('paramName') pattern
              if (
                node.parent &&
                node.parent.type === "CallExpression" &&
                node.parent.callee.type === "MemberExpression" &&
                node.parent.callee.property.name === "get" &&
                node.parent.arguments.length > 0 &&
                node.parent.arguments[0].type === "Literal"
              ) {
                const paramName = node.parent.arguments[0].value;
                return fixer.replaceText(
                  node.parent,
                  `this.context.params.query.${paramName}`
                );
              }

              // If we can't fix it automatically, just report the issue
              return null;
            },
          });
        }
      },

      // Check for direct window.location.href assignments
      "AssignmentExpression[left.type='MemberExpression'][left.property.name='href']":
        function (node) {
          // Check if it's assigning to window.location.href
          if (
            node.left.object &&
            node.left.object.type === "MemberExpression" &&
            node.left.object.object &&
            node.left.object.object.name === "window" &&
            node.left.object.property &&
            node.left.object.property.name === "location"
          ) {
            context.report({
              node,
              messageId: "avoidLocationHref",
            });
          }
        },

      // Also check for direct location.href assignments (without window prefix)
      "AssignmentExpression[left.type='MemberExpression'][left.property.name='href'][left.object.name='location']":
        function (node) {
          context.report({
            node,
            messageId: "avoidLocationHref",
          });
        },
    };
  },
};
