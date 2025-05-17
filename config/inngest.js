import { Inngest } from "inngest";
import connectDB from "./db";
import User from "../models/user";
import Order from "../models/order";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "quickcart",
  eventKey: process.env.INNGEST_EVENT_KEY,
  // Use a consistent endpoint
  endpoint: process.env.INNGEST_ENDPOINT || 'https://api.inngest.com'
});

// User Created Function
export const syncuserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      // Validate event data structure
      if (!event.data || !event.data.id || !event.data.email_addresses) {
        throw new Error("Invalid event data");
      }

      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        imageUrl: image_url || "", // Handle possible null/undefined image_url
      };

      await connectDB();
      await User.create(userData);
      console.log("User created successfully");
    } catch (error) {
      console.error("Error creating user:", error);
      throw error; // Optionally rethrow if needed
    }
  }
);

// User Updated Function
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      // Validate event data structure
      if (!event.data || !event.data.id || !event.data.email_addresses) {
        throw new Error("Invalid event data");
      }

      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        imageUrl: image_url || "", // Handle possible null/undefined image_url
      };

      await connectDB();
      await User.findByIdAndUpdate(id, userData);
      console.log("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      throw error; // Optionally rethrow if needed
    }
  }
);

// User Deleted Function
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      // Validate event data structure
      if (!event.data || !event.data.id) {
        throw new Error("Invalid event data");
      }

      const { id } = event.data;

      await connectDB();
      await User.findByIdAndDelete(id);
      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error; // Optionally rethrow if needed
    }
  }
);

// inngest function for order processing
export const processOrderEvents = inngest.createFunction(
  { 
    id: "process-order-events",
    batchEvents: {
      maxSize: 5,
      timeout: '5s'
    }
  },
  { event: "order/created" },
  async ({ events }) => {
    try {
      console.log(`Processing ${events.length} order events`);
      
      // Check if we have events to process
      if (!events || events.length === 0) {
        console.log("No events to process");
        return { success: true, processed: 0 };
      }
      
      // Connect to database
      await connectDB();
      
      // Process each order event (e.g., send confirmation emails, update inventory, etc.)
      const processedEvents = [];
      
      for (const event of events) {
        if (!event.data || !event.data.orderId) {
          console.warn("Event missing data or orderId:", event);
          continue;
        }
        
        try {
          const { orderId, userId } = event.data;
          
          // Find the order in the database
          const order = await Order.findById(orderId);
          
          if (!order) {
            console.warn(`Order not found: ${orderId}`);
            continue;
          }
          
          // Example: Update order status to "processing"
          order.status = "processing";
          await order.save();
          
          console.log(`Updated order ${orderId} status to processing`);
          
          // Here you could add more processing logic:
          // - Send confirmation email
          // - Update inventory
          // - Create shipping label
          // - etc.
          
          processedEvents.push({
            orderId,
            userId,
            status: "processing"
          });
          
        } catch (error) {
          console.error(`Error processing order event:`, error);
        }
      }
      
      console.log(`Successfully processed ${processedEvents.length} order events`);
      
      return { 
        success: true, 
        processed: processedEvents.length,
        events: processedEvents
      };
      
    } catch (error) {
      console.error("Error in batch order processing:", error);
      return { success: false, error: error.message };
    }
  }
);

// Function to update order status
export const updateOrderStatus = inngest.createFunction(
  { id: "update-order-status" },
  { event: "order/status.updated" },
  async ({ event }) => {
    try {
      // Validate event data
      if (!event.data || !event.data.orderId || !event.data.status) {
        throw new Error("Invalid event data - orderId and status are required");
      }

      const { orderId, status, userId } = event.data;

      await connectDB();
      
      // Find and update the order
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }
      
      // Security check - ensure userId matches
      if (userId && order.userId !== userId) {
        throw new Error(`Unauthorized: User ${userId} does not own order ${orderId}`);
      }
      
      // Update status if different
      if (order.status !== status) {
        const previousStatus = order.status;
        order.status = status;
        await order.save();
        
        console.log(`Updated order ${orderId} status from "${previousStatus}" to "${status}"`);
        
        // Here you could add notification logic based on status changes
        // For example, send an email when status changes to "shipped"
        
        return {
          success: true,
          orderId,
          previousStatus,
          newStatus: status
        };
      } else {
        console.log(`Order ${orderId} status already set to "${status}" - no update needed`);
        return {
          success: true,
          orderId,
          status,
          changed: false
        };
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      return { success: false, error: error.message };
    }
  }
);

// Test function to verify connection
export const testConnectionFunction = inngest.createFunction(
  { id: "test-connection" },
  { event: "test/connection" },
  async ({ event }) => {
    console.log("Received test connection event:", event);
    
    try {
      // Test database connection
      await connectDB();
      console.log("Database connection successful");
      
      // Return success result
      return { 
        success: true,
        message: "Connection test successful",
        receivedAt: Date.now(),
        eventData: event.data
      };
    } catch (error) {
      console.error("Error in test connection:", error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
);