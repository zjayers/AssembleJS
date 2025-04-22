import path from "path";
import type { NodePlopAPI, ActionType, AddActionConfig } from "plop";
import fs from "fs-extra";

// Define a custom action type that includes our custom properties
type CustomActionType = AddActionConfig | ActionType;
// Define any needed type that's not exported from plop
type PlopData = Record<string, any>;
type ActionsArray = Array<CustomActionType>;

// Use path.dirname with fileURLToPath directly where needed
// This approach avoids the unused __dirname variable

/**
 * Available deployment targets
 */
enum DeploymentTarget {
  DOCKER = "docker",
  AWS = "aws",
  NETLIFY = "netlify",
  CLOUDFLARE = "cloudflare",
  KUBERNETES = "kubernetes",
  DIGITALOCEAN = "digitalocean",
  AZURE = "azure",
}

/**
 * Available Docker configurations
 */
enum DockerConfig {
  BASIC = "basic",
  COMPOSE = "compose",
  SWARM = "swarm",
}

/**
 * Available CI/CD providers
 */
enum CICDProvider {
  GITHUB = "github",
  GITLAB = "gitlab",
  BITBUCKET = "bitbucket",
  JENKINS = "jenkins",
  CIRCLECI = "circleci",
  TRAVIS = "travis",
  NONE = "none",
}

/**
 * Available Documentation formats
 */
enum DocumentationFormat {
  STANDARD = "standard",
  API = "api",
  FULL = "full",
  NONE = "none",
}

/**
 * Available config formats
 */
enum ConfigFormat {
  YAML = "yaml",
  JSON = "json",
  ENV = "env",
  JS = "js",
}

/**
 * Handle deployment configuration
 * @param {NodePlopAPI} plop - The Plop API instance
 */
export default function deployPlopfile(plop: NodePlopAPI) {
  // Add custom helper functions
  plop.setHelper("currentYear", () => new Date().getFullYear());
  plop.setHelper("lowerCase", (text: string) => text.toLowerCase());

  // Register custom actions
  plop.setActionType("updatePackageJson", (answers) => {
    const data = answers as Record<string, any>;
    if (!data) return "Package.json not updated: no data provided";

    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return "package.json file not found";
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

      // Add default values
      const defaultPort = "3000";
      const projectName = data?.projectName || "assembly-project";
      const projectPort = data?.projectPort || defaultPort;

      // Add deployment scripts
      packageJson.scripts = packageJson.scripts || {};

      // Add production deployment scripts
      packageJson.scripts["prod:build"] = "asm-build";
      packageJson.scripts["prod:start"] = "node lib/server.js";

      // Add target-specific configurations
      if (data?.target === DeploymentTarget.DOCKER) {
        packageJson.scripts["docker:build"] =
          "docker build -t " + projectName + " .";
        packageJson.scripts["docker:run"] =
          "docker run -p " +
          projectPort +
          ":" +
          projectPort +
          " " +
          projectName;

        if (data?.dockerConfig === DockerConfig.COMPOSE) {
          packageJson.scripts["docker:up"] = "docker-compose up -d";
          packageJson.scripts["docker:down"] = "docker-compose down";
        }
      }

      // Save updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      return "package.json updated successfully";
    } catch (error) {
      return "Error updating package.json: " + (error as Error).message;
    }
  });

  // Register the generator
  plop.setGenerator("deploy", {
    description: "Configure project for deployment",
    prompts: [
      {
        type: "list",
        name: "target",
        message: "Select deployment target:",
        choices: Object.values(DeploymentTarget),
      },
      {
        type: "input",
        name: "projectName",
        message: "Project name (for container/app naming):",
        default: path.basename(process.cwd()),
      },
      {
        type: "input",
        name: "projectPort",
        message: "Port to expose:",
        default: "3000",
      },
      {
        type: "list",
        name: "dockerConfig",
        message: "Select Docker configuration:",
        choices: Object.values(DockerConfig),
        when: (answers) => answers.target === DeploymentTarget.DOCKER,
      },
      {
        type: "confirm",
        name: "useNginx",
        message: "Add Nginx as a reverse proxy?",
        default: false,
        when: (answers) =>
          answers.target === DeploymentTarget.DOCKER ||
          answers.target === DeploymentTarget.KUBERNETES,
      },
      {
        type: "list",
        name: "cicd",
        message: "Select CI/CD provider:",
        choices: Object.values(CICDProvider),
      },
      {
        type: "list",
        name: "documentation",
        message: "Generate documentation:",
        choices: Object.values(DocumentationFormat),
      },
      {
        type: "list",
        name: "configFormat",
        message: "Configuration format:",
        choices: Object.values(ConfigFormat),
        default: ConfigFormat.ENV,
      },
    ],
    actions: function (data?: PlopData): ActionsArray {
      const actions = [
        {
          type: "updatePackageJson",
        } as CustomActionType,
      ];

      // Add target-specific actions
      if (!data) return actions; // Early return if no data
      switch (data?.target) {
        case DeploymentTarget.DOCKER:
          // Docker configuration files
          actions.push({
            type: "add",
            path: "{{cwd}}/Dockerfile",
            templateFile:
              "../templates/deployment/docker/Dockerfile.{{dockerConfig}}.hbs",
          } as CustomActionType);

          actions.push({
            type: "add",
            path: "{{cwd}}/.dockerignore",
            templateFile: "../templates/deployment/docker/.dockerignore.hbs",
          } as CustomActionType);

          // Add docker-compose if needed
          if (data?.dockerConfig === DockerConfig.COMPOSE) {
            actions.push({
              type: "add",
              path: "{{cwd}}/docker-compose.yml",
              templateFile:
                "../templates/deployment/docker/docker-compose.yml.hbs",
            } as CustomActionType);
          }

          // Add Nginx config if needed
          if (data?.useNginx) {
            actions.push({
              type: "add",
              path: "{{cwd}}/deploy/nginx/nginx.conf",
              templateFile: "../templates/deployment/docker/nginx.conf.hbs",
            } as CustomActionType);
          }
          break;

        case DeploymentTarget.AWS:
          // AWS configuration files
          actions.push({
            type: "add",
            path: "{{cwd}}/.ebextensions/nodecommand.config",
            templateFile: "../templates/deployment/aws/nodecommand.config.hbs",
          } as CustomActionType);

          actions.push({
            type: "add",
            path: "{{cwd}}/.elasticbeanstalk/config.yml",
            templateFile: "../templates/deployment/aws/eb-config.yml.hbs",
          } as CustomActionType);
          break;

        case DeploymentTarget.NETLIFY:
          // Netlify configuration
          actions.push({
            type: "add",
            path: "{{cwd}}/netlify.toml",
            templateFile: "../templates/deployment/netlify/netlify.toml.hbs",
          } as CustomActionType);
          break;

        case DeploymentTarget.CLOUDFLARE:
          // Cloudflare Workers configuration
          actions.push({
            type: "add",
            path: "{{cwd}}/wrangler.toml",
            templateFile:
              "../templates/deployment/cloudflare/wrangler.toml.hbs",
          } as CustomActionType);
          break;

        case DeploymentTarget.KUBERNETES:
          // Kubernetes manifests
          actions.push({
            type: "add",
            path: "{{cwd}}/k8s/deployment.yaml",
            templateFile:
              "../templates/deployment/kubernetes/deployment.yaml.hbs",
          } as CustomActionType);

          actions.push({
            type: "add",
            path: "{{cwd}}/k8s/service.yaml",
            templateFile: "../templates/deployment/kubernetes/service.yaml.hbs",
          } as CustomActionType);

          actions.push({
            type: "add",
            path: "{{cwd}}/k8s/configmap.yaml",
            templateFile:
              "../templates/deployment/kubernetes/configmap.yaml.hbs",
          } as CustomActionType);

          // Add Nginx ingress if needed
          if (data?.useNginx) {
            actions.push({
              type: "add",
              path: "{{cwd}}/k8s/ingress.yaml",
              templateFile:
                "../templates/deployment/kubernetes/ingress.yaml.hbs",
            } as CustomActionType);
          }
          break;

        case DeploymentTarget.DIGITALOCEAN:
          // Digital Ocean App Platform
          actions.push({
            type: "add",
            path: "{{cwd}}/.do/app.yaml",
            templateFile: "../templates/deployment/digitalocean/app.yaml.hbs",
          } as CustomActionType);
          break;

        case DeploymentTarget.AZURE:
          // Azure App Service
          actions.push({
            type: "add",
            path: "{{cwd}}/.azure/config.yml",
            template: `# Azure App Service configuration\nversion: 1.0\nappname: {{projectName}}\nport: {{projectPort}}\n`,
          } as CustomActionType);

          actions.push({
            type: "add",
            path: "{{cwd}}/web.config",
            templateFile: "../templates/deployment/azure/web.config.hbs",
          } as CustomActionType);
          break;
      }

      // Add CI/CD configuration
      if (data?.cicd && data.cicd !== CICDProvider.NONE) {
        switch (data.cicd) {
          case CICDProvider.GITHUB:
            actions.push({
              type: "add",
              path: "{{cwd}}/.github/workflows/main.yml",
              templateFile:
                "../templates/deployment/cicd/github-actions.yml.hbs",
            } as CustomActionType);
            break;

          case CICDProvider.GITLAB:
            actions.push({
              type: "add",
              path: "{{cwd}}/.gitlab-ci.yml",
              templateFile: "../templates/deployment/cicd/gitlab-ci.yml.hbs",
            } as CustomActionType);
            break;

          case CICDProvider.BITBUCKET:
            actions.push({
              type: "add",
              path: "{{cwd}}/bitbucket-pipelines.yml",
              templateFile:
                "../templates/deployment/cicd/bitbucket-pipelines.yml.hbs",
            } as CustomActionType);
            break;

          case CICDProvider.JENKINS:
            actions.push({
              type: "add",
              path: "{{cwd}}/Jenkinsfile",
              templateFile: "../templates/deployment/cicd/Jenkinsfile.hbs",
            } as CustomActionType);
            break;

          case CICDProvider.CIRCLECI:
            actions.push({
              type: "add",
              path: "{{cwd}}/.circleci/config.yml",
              templateFile: "../templates/deployment/cicd/circle-ci.yml.hbs",
            } as CustomActionType);
            break;

          case CICDProvider.TRAVIS:
            actions.push({
              type: "add",
              path: "{{cwd}}/.travis.yml",
              templateFile: "../templates/deployment/cicd/travis.yml.hbs",
            } as CustomActionType);
            break;
        }
      }

      // Add documentation
      if (
        data?.documentation &&
        data.documentation !== DocumentationFormat.NONE
      ) {
        // Common documentation files
        actions.push({
          type: "add",
          path: "{{cwd}}/docs/README.md",
          templateFile: "../templates/deployment/docs/README.md.hbs",
        } as CustomActionType);

        actions.push({
          type: "add",
          path: "{{cwd}}/docs/DEPLOYMENT.md",
          templateFile: "../templates/deployment/docs/DEPLOYMENT.md.hbs",
        } as CustomActionType);

        // Specific documentation formats
        if (data.documentation === DocumentationFormat.API) {
          actions.push({
            type: "add",
            path: "{{cwd}}/docs/API.md",
            templateFile: "../templates/deployment/docs/API.md.hbs",
          } as CustomActionType);
        } else if (data.documentation === DocumentationFormat.FULL) {
          actions.push({
            type: "add",
            path: "{{cwd}}/docs/API.md",
            templateFile: "../templates/deployment/docs/API.md.hbs",
          } as CustomActionType);

          actions.push({
            type: "add",
            path: "{{cwd}}/docs/ARCHITECTURE.md",
            templateFile: "../templates/deployment/docs/ARCHITECTURE.md.hbs",
          } as CustomActionType);

          actions.push({
            type: "add",
            path: "{{cwd}}/docs/TROUBLESHOOTING.md",
            templateFile: "../templates/deployment/docs/TROUBLESHOOTING.md.hbs",
          } as CustomActionType);
        }
      }

      // Add configuration files
      let configExtension = ".env";
      let configTemplatePath = "../templates/deployment/config/config.env.hbs";

      if (data?.configFormat === ConfigFormat.YAML) {
        configExtension = ".yml";
        configTemplatePath = "../templates/deployment/config/config.yml.hbs";
      } else if (data?.configFormat === ConfigFormat.JSON) {
        configExtension = ".json";
        configTemplatePath = "../templates/deployment/config/config.json.hbs";
      } else if (data?.configFormat === ConfigFormat.JS) {
        configExtension = ".js";
        configTemplatePath = "../templates/deployment/config/config.js.hbs";
      }

      actions.push({
        type: "add",
        path: `{{cwd}}/config/config.${configExtension}`,
        templateFile: configTemplatePath,
      } as CustomActionType);

      return actions;
    },
  });
}
