import { serve } from "inngest/next";
import { inngest } from "@/config/inngest";

// Import all your function handlers
import {
  syncuserCreation,
  syncUserUpdation,
  syncUserDeletion,
  processOrderEvents,
  updateOrderStatus,
  testConnectionFunction
} from "@/config/inngest";

// Add serving options for improved reliability
const serverConfig = {
  signingKey: process.env.INNGEST_SIGNING_KEY,
  serveOrigin: true,
  // Log requests to help with debugging
  logLevel: 'info' as const
};

// Create a handler with all functions for automatic processing
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncuserCreation,
    syncUserUpdation,
    syncUserDeletion,
    processOrderEvents,
    updateOrderStatus,
    testConnectionFunction
  ],
  ...serverConfig
}); 