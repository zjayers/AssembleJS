/**
 * @fileoverview Rule to enforce proper use of controller lifecycle methods
 * @author AssembleJS Team
 */
"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce proper use of controller lifecycle methods in AssembleJS",
      category: "Best Practices",
      recommended: true,
    },
    fixable: null, // No automatic fix available
    schema: [], // no options
    messages: {
      useOnRequestForParams:
        "Use onRequest method for adding component parameters instead of custom methods",
      registerApiFunctions:
        "API functions should be registered within the register method",
      avoidOnRenderMethod:
        "The onComponentRender method doesn't exist, use onRequest instead",
    },
  },

  create: function (context) {
    return {
      // Check for onComponentRender method which doesn't exist
      "MemberExpression[object.type='ThisExpression'][property.name='onComponentRender']":
        function (node) {
          context.report({
            node,
            messageId: "avoidOnRenderMethod",
          });
        },

      // Check classes that extend BlueprintController
      "ClassDeclaration[superClass.name='BlueprintController']": function (
        node
      ) {
        let hasRegisterMethod = false;
        let hasOnRequestMethod = false;

        // Check all methods in the class
        node.body.body.forEach((member) => {
          if (member.type === "MethodDefinition" && member.kind === "method") {
            // Check for register method
            if (member.key.name === "register") {
              hasRegisterMethod = true;

              // Check if register method has app parameter
              if (!member.value.params || member.value.params.length === 0) {
                context.report({
                  node: member,
                  message: "Register method should accept an app parameter",
                });
              }
            }

            // Check for onRequest method
            if (member.key.name === "onRequest") {
              hasOnRequestMethod = true;

              // Check if onRequest calls super.onRequest
              const hasSuperCall = member.value.body.body.some(
                (stmt) =>
                  stmt.type === "ExpressionStatement" &&
                  stmt.expression.type === "CallExpression" &&
                  stmt.expression.callee.type === "MemberExpression" &&
                  stmt.expression.callee.object.type === "Super" &&
                  stmt.expression.callee.property.name === "onRequest"
              );

              if (!hasSuperCall) {
                context.report({
                  node: member,
                  message: "onRequest method should call super.onRequest()",
                });
              }
            }
          }
        });

        // Recommend adding onRequest if not present
        if (!hasOnRequestMethod) {
          context.report({
            node,
            messageId: "useOnRequestForParams",
          });
        }

        // Recommend adding register if not present
        if (!hasRegisterMethod) {
          context.report({
            node,
            message: "Controller class should implement a register method",
          });
        }
      },
    };
  },
};
