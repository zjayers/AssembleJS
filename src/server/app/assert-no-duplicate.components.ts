import type { BlueprintServerOptions } from "../../types/blueprint.server.options";

/**
 * Assert there are no components registered twice.
 * @param {BlueprintServerOptions} userOpts - The user options to use.
 * @author Zach Ayers
 */
export function assertNoDuplicateComponents(
  userOpts: BlueprintServerOptions
): void {
  // Ensure no components are added twice to the manifest
  userOpts.manifest.components?.forEach((component) => {
    let componentCount = 0;
    // Check Component Path only exists once
    userOpts.manifest.components?.forEach((comparator) => {
      if (component.path === comparator.path) {
        componentCount++;
        if (componentCount > 1) {
          throw new Error(
            `[ ${component.path} ] declared more than once in component manifest!`
          );
        }
      }

      // Check Component Views only exist once
      component.views.forEach((view) => {
        let viewCount = 0;

        comparator.views.forEach((comparatorView) => {
          if (view.viewName === comparatorView.viewName) {
            viewCount++;
            if (viewCount > 1) {
              throw new Error(
                `[ ${component.path} -> ${view.viewName} ] declared more than once in component manifest!`
              );
            }
          }
        });
      });
    });
  });
}
