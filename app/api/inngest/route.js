import { serve } from "inngest/next";
import { inngest, syncuserCreation, syncUserDeletion, syncUserUpdation } from "@/config/inngest";

// Create an API that serves the Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncuserCreation,    // Sync user creation function
    syncUserUpdation,    // Sync user updation function
    syncUserDeletion,    // Sync user deletion function
  ],
});
