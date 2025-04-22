import { spawnSync } from "child_process";

/**
 * Synchronously spawn a custom command. Any output from this command will be printed to the console.
 * @param {string} commandToRun - The command to run, in plain text.
 * @category (System)

 * @example ```typescript
 * // Run any command and output STDIO to the console.
 * runner.spawnCommand(`cd ${directoryName} && npm install`);
 * ```
 */
export function spawnCommand(commandToRun: string): void {
  spawnSync(commandToRun, [], {
    shell: true,
    stdio: ["ignore", "inherit", "inherit"],
  });
}
