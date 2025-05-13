import { serve } from "inngest/next";
import { syncuserCreation, syncUserUpdation, syncUserDeletion } from "@/config/inngest"; 

console.log("syncuserCreation:", syncuserCreation);
console.log("syncUserUpdation:", syncUserUpdation);
console.log("syncUserDeletion:", syncUserDeletion);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncuserCreation,
    syncUserUpdation,
    syncUserDeletion,
  ],
});
