/**
 * @fileoverview Rule to enforce proper typing in AssembleJS component classes
 * @author AssembleJS Team
 */
"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce proper typing in AssembleJS component classes",
      category: "Type Safety",
      recommended: true,
    },
    fixable: null, // or "code" if this rule provides an automatic fix
    schema: [], // no options
    messages: {
      useProperComponentTypes:
        "Component class should extend Blueprint with explicit type parameters",
      definedTypedInterfaces:
        "Define proper interfaces for component data and parameters",
    },
  },

  create: function (context) {
    return {
      // Check classes that extend Blueprint
      "ClassDeclaration[superClass.name='Blueprint']": function (node) {
        // Check if it has type parameters
        if (
          !node.superTypeParameters ||
          !node.superTypeParameters.params ||
          node.superTypeParameters.params.length < 2 // Should have at least 2 type params
        ) {
          context.report({
            node,
            messageId: "useProperComponentTypes",
          });
        }

        // Check if the type parameters are just 'any' or 'unknown'
        else if (
          node.superTypeParameters.params.some(
            (param) =>
              param.type === "TSTypeReference" &&
              param.typeName &&
              (param.typeName.name === "any" ||
                param.typeName.name === "unknown")
          )
        ) {
          context.report({
            node,
            messageId: "definedTypedInterfaces",
          });
        }
      },

      // Detect when Blueprint is imported but not used with proper types
      "ImportDeclaration[source.value='asmbl']": function (node) {
        // Check if Blueprint is imported
        const hasBlueprint = node.specifiers.some(
          (specifier) =>
            specifier.imported && specifier.imported.name === "Blueprint"
        );

        if (hasBlueprint) {
          // Flag this import for later check against class declarations
          context.markVariable &&
            context.markVariable("importedBlueprint", true);
        }
      },
    };
  },
};
