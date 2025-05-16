import { serve } from "inngest/next";
import { inngest, syncuserCreation, syncUserUpdation, syncUserDeletion, createUserOrder } from "../../config/inngest";

// Serve the API route for Inngest
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncuserCreation,
    syncUserUpdation,
    syncUserDeletion,
    createUserOrder,
  ],
});