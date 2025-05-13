const { Inngest } = require("inngest");
const connectDB = require("./db");
const User = require("@/models/user");

// Initialize Inngest client
const inngest = new Inngest({ id: "stella" });

// User Created Function
const syncuserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      if (!id || !email_addresses || !email_addresses.length) {
        throw new Error("Invalid event data");
      }

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        imageUrl: image_url || "",
      };

      await connectDB();
      await User.create(userData);
      console.log("✅ User created successfully");
    } catch (err) {
      console.error("❌ Error in user creation:", err);
      throw err;
    }
  }
);

// User Updated Function
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      if (!id || !email_addresses || !email_addresses.length) {
        throw new Error("Invalid event data");
      }

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        imageUrl: image_url || "",
      };

      await connectDB();
      await User.findByIdAndUpdate(id, userData);
      console.log("✅ User updated successfully");
    } catch (err) {
      console.error("❌ Error in user update:", err);
      throw err;
    }
  }
);

// User Deleted Function
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;

      if (!id) {
        throw new Error("Invalid event data");
      }

      await connectDB();
      await User.findByIdAndDelete(id);
      console.log("✅ User deleted successfully");
    } catch (err) {
      console.error("❌ Error in user deletion:", err);
      throw err;
    }
  }
);

module.exports = {
  inngest,
  syncuserCreation,
  syncUserUpdation,
  syncUserDeletion,
};
