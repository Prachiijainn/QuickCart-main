import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const authSeller = async (userId) => {
  try {
    if (!userId) {
      return false;
    }
    
    // Fetch the user using Clerk's client
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Check for seller role in both metadata types for consistency
    const hasPublicSellerRole = user.publicMetadata?.role === 'seller';
    const privateRoles = Array.isArray(user.privateMetadata?.roles) 
      ? user.privateMetadata.roles 
      : [];
    const hasPrivateSellerRole = privateRoles.includes('seller');

    // Return true if user has seller role in either place
    return hasPublicSellerRole || hasPrivateSellerRole;
  } catch (error) {
    console.error('Error checking seller status:', error);
    return false;
  }
};

export default authSeller;
