export const CONSTANTS = {
  welcomeBanner: `
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░█████╗░░██████╗░██████╗███████╗███╗░░░███╗██████╗░██╗░░░░░███████╗░░░░░
░░░░░██╔══██╗██╔════╝██╔════╝██╔════╝████╗░████║██╔══██╗██║░░░░░██╔════╝░░░░░
░░░░░███████║╚█████╗░╚█████╗░█████╗░░██╔████╔██║██████╦╝██║░░░░░█████╗░░░░░░░
░░░░░██╔══██║░╚═══██╗░╚═══██╗██╔══╝░░██║╚██╔╝██║██╔══██╗██║░░░░░██╔══╝░░░░░░░
░░░░░██║░░██║██████╔╝██████╔╝███████╗██║░╚═╝░██║██████╦╝███████╗███████╗░░░░░
░░░░░╚═╝░░╚═╝╚═════╝░╚═════╝░╚══════╝╚═╝░░░░░╚═╝╚═════╝░╚══════╝╚══════╝░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░  ░░  ░░  ░░  ░░  Component-Based UI Assembly Made Easy  ░░  ░░  ░░  ░░  ░░
  ░░  ░░  ░░  ░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ░░  ░░  ░░  ░░`,
  welcomeBannerLogoOnly: `
 █████╗  ██████╗ ██████╗███████╗███╗   ███╗██████╗ ██╗     ███████╗
██╔══██╗██╔════╝██╔════╝██╔════╝████╗ ████║██╔══██╗██║     ██╔════╝
███████║╚█████╗ ╚█████╗ █████╗  ██╔████╔██║██████╦╝██║     █████╗  
██╔══██║ ╚═══██╗ ╚═══██╗██╔══╝  ██║╚██╔╝██║██╔══██╗██║     ██╔══╝  
██║  ██║██████╔╝██████╔╝███████╗██║ ╚═╝ ██║██████╦╝███████╗███████╗
╚═╝  ╚═╝╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═════╝ ╚══════╝╚══════╝`,
  welcomeBannerConsoleSeparator: `░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`,
  welcomeBannerSlim: `AssembleJS CLI - You Can Build It` + "\n",
  branding: {
    gold: "#bdba5a",
    blue: "#0095c5",
    green: "#01abab",
    yellow: "#ceaa2e",
    purple: "#8858e0",
    orange: "#d0663d",
    puse: "#a4b95a",
    cyan: "#3a737e",
  },
  env: <{ [key: string]: { key: string; value?: unknown } }>{
    prefix: { key: "ASSEMBLEJS_" },
    host: { key: "ASSEMBLEJS_HOST", value: "0.0.0.0" },
    port: { key: "ASSEMBLEJS_PORT", value: 3000 },
    environment: { key: "ASSEMBLEJS_ENVIRONMENT", value: "local" },
    enableRequestLogging: {
      key: "ASSEMBLEJS_ENABLE_REQUEST_LOGS",
      value: false,
    },
    logLevel: { key: "ASSEMBLEJS_LOG_LEVEL", value: "info" },
    basicAuthUser: { key: "ASSEMBLEJS_BASIC_AUTH_USER", value: "test" },
    basicAuthPassword: { key: "ASSEMBLEJS_BASIC_AUTH_PASSWORD", value: "test" },
    jwtSecret: {
      key: "ASSEMBLEJS_JWT_SECRET",
      value: "assemblejs-jwt-secret-key-change-in-production",
    },
    jwtExpiresIn: { key: "ASSEMBLEJS_JWT_EXPIRES_IN", value: 3600 },
    cookieSecret: {
      key: "ASSEMBLEJS_COOKIE_SECRET",
      value: "assemblejs-cookie-secret-key-change-in-production",
    },
  },
  buildOutputFolder: "dist",
  dataIdPrefix: "__ASSEMBLEJS_DATA__",
  defaultHTMLTitle: "AssembleJS",
  defaultLoggerClassName: "assemblejs:core",
  eventingGlobalChannel: "assemblejs:global:events",
  eventingGlobalComponentChannel: "assemblejs:global:components",
  eventingGlobalBlueprintChannel: "assemblejs:global:blueprint",
  eventingGlobalTopic: "assemblejs:global:msg",
  componentClassIdentifier: "assemblejs-component",
  componentDataIdentifier: "data-component-target",
  componentIdHeader: "x-assemblejs-component-id",
  componentIdIdentifier: "id",
  componentNameIdentifier: "data-component-name",
  componentNestIdentifier: "data-component-nest-level",
  componentUrlIdentifier: "data-component-url",
  componentViewIdentifier: "data-component-view",
  htmlWrapperTag: "section",
  blueprintIdHeader: "x-assemblejs-blueprint-id",
  nestLevelHeader: "x-assemblejs-nest-level",

  // Developer tools
  developerToolsPath: "/__asmbl__",
  designerPath: "/__asmbl__/designer",
  developerPanelPrefix: "__assemblejs_dev_panel__",
  developerRoutes: ["/__asmbl__/designer", "/__asmbl__/assets/*"],
};
