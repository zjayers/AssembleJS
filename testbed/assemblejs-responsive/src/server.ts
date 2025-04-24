import viteDevServer from 'vavite/vite-dev-server';
import vaviteHttpServer from 'vavite/http-dev-server';
import { createBlueprintServer } from "asmbl";

/**
 * AssembleJS Server Configuration
 * 
 * This is the main entry point for the Responsive Design cookbook example.
 * It creates a server with components that demonstrate responsive design patterns.
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
    components: [],
    
    // Controllers are registered here (automatically added by generator)
    // controllers: [],
    
    // Services are registered here (automatically added by generator)
    // services: []
  }
});