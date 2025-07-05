import { createRouteHandler } from 'uploadthing/next';
import { customFileRouter } from '@/services/uploadthing/router';

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: customFileRouter
  // Apply an (optional) custom config:
  // config: { ... },
});
