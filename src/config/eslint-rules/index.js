/**
 * @fileoverview AssembleJS ESLint Rules
 * @author AssembleJS Team
 */
"use strict";

module.exports = {
  "enforce-assemblejs-events": require("./enforce-assemblejs-events"),
  "prefer-server-params": require("./prefer-server-params"),
  "typed-component-interfaces": require("./typed-component-interfaces"),
  "proper-controller-lifecycle": require("./proper-controller-lifecycle"),
};
