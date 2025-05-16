import { Inngest } from "inngest";
import connectDB from "./db";
import User from "../models/user";
import Order from "../models/order";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "stella" });

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

// inngest function for order creation in database
export const createUserOrder = inngest.createFunction(
  { 
    id: "create-user-order",
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
      
      const orders = events.map((event) => {
        if (!event.data) {
          console.warn("Event missing data:", event);
          return null;
        }
        
        return {
          userId: event.data.userId,
          items: event.data.items || [],
          amount: event.data.amount || 0,
          address: event.data.address || {},
          date: Date.now()
        };
      }).filter(Boolean); // Remove any null entries
      
      if (orders.length === 0) {
        console.log("No valid orders to create");
        return { success: true, processed: 0 };
      }
      
      await connectDB();
      const result = await Order.create(orders);
      console.log(`Successfully created ${orders.length} orders`);
      
      return { 
        success: true, 
        processed: orders.length,
        orderIds: Array.isArray(result) ? result.map(order => order._id) : [result._id]
      };
    } catch (error) {
      console.error("Error creating orders:", error);
      return { success: false, error: error.message };
    }
  }
);