import viteDevServer from 'vavite/vite-dev-server';
import vaviteHttpServer from 'vavite/http-dev-server';
import { createBlueprintServer } from "asmbl";
import { Card as ProductCard } from './components/product/card/card.view';

/**
 * AssembleJS Server Configuration
 * 
 * This is the main entry point for your AssembleJS application.
 * It creates a server with your components, blueprints, controllers, and services.
 * 
 * Documentation: https://assemblejs.com/docs/getting-started
 * 
 * Configuration options:
 * - serverRoot: The base URL for all server resources
 * - httpServer: The HTTP server instance
 * - devServer: The development server for hot reloading
 * - manifest: Registration of components, controllers, and services
 * 
 * @author Zachariah Ayers
 */
void createBlueprintServer({
  // Server root URL (using import.meta.url for ESM compatibility)
  serverRoot: import.meta.url,
  
  // HTTP and development server configuration
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  // Application manifest - register all your components here
  manifest: {
    // Components are registered here
    // Format: { name: 'component-name', path: 'path/to/component', views: [...] }
    components: [
      {
        path: 'checkout',
        views: [{
          exposeAsBlueprint: true,
          viewName: 'form',
          templateFile: 'form.view.svelte',
        }],
      },
      {
        path: "cart",
        views: [{
          viewName: "dropdown",
          templateFile: "dropdown.view.vue"
        }]
      },
      {
        path: 'about',
        views: [{
          exposeAsBlueprint: true,
          viewName: 'main',
          templateFile: 'main.view.md',
        }],
      },
      {
        path: "footer",
        views: [{
          viewName: "main",
          templateFile: "main.view.ejs"
        ,
        components: [
          {name: "cart", contentUrl: "/cart/dropdown/"}
        ]}]
      },
      {
        path: "navigation",
        views: [{
          viewName: "main",
          templateFile: "main.view.html"
        }]
      },
      {
        path: 'products',
        views: [{
          exposeAsBlueprint: true,
          viewName: 'listing',
          templateFile: 'listing.view.tsx',
        }],
      },
      {
        path: "product",
        views: [{
          viewName: "card",
          template: ProductCard
        ,
        components: [
          {name: "cart", contentUrl: "/cart/dropdown/"},
          {name: "footer", contentUrl: "/footer/main/"},
          {name: "navigation", contentUrl: "/navigation/main/"}
        ]}, {
          exposeAsBlueprint: true,
          viewName: 'details',
          templateFile: 'details.view.jsx',
        }]
      },
      {
        path: 'home',
        views: [{
          exposeAsBlueprint: true,
          viewName: 'welcome',
          templateFile: 'welcome.view.tsx',
        }],
      },],
    
    // Controllers are registered here (automatically added by generator)
    // controllers: [],
    
    // Services are registered here (automatically added by generator)
    // services: []
  },
  
  // Optional configuration
  // hooks: {
  //   onReady: async (server) => {
  //     console.log('Server is ready at', server.address);
  //   },
  //   onError: (error) => {
  //     console.error('Server error:', error);
  //   }
  // }
});