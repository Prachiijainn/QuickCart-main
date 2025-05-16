'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SetSellerRole() {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState('Loading...');
  
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      setStatus('Please sign in to use this utility');
      return;
    }
    
    // Show current user metadata
    const publicRole = user.publicMetadata?.role;
    const privateRoles = Array.isArray(user.privateMetadata?.roles) 
      ? user.privateMetadata.roles 
      : [];
    
    setStatus(`Current status:
      - Public role: ${publicRole || 'Not set'}
      - Private roles: ${privateRoles.length ? privateRoles.join(', ') : 'None'}
    `);
  }, [user, isLoaded]);
  
  const setSellerRole = async () => {
    try {
      if (!user) {
        toast.error('Please sign in first');
        return;
      }
      
      // Set both types of role metadata for compatibility
      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          role: 'seller'
        },
        privateMetadata: {
          ...user.privateMetadata,
          roles: ['seller']
        }
      });
      
      toast.success('Seller role added successfully!');
      
      // Update status display
      setStatus(`Seller role added successfully!
        - Public role: seller
        - Private roles: seller
      `);
      
    } catch (error) {
      console.error('Error setting seller role:', error);
      toast.error('Failed to set seller role: ' + error.message);
    }
  };
  
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Set Seller Role Utility</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4 whitespace-pre-line">
        {status}
      </div>
      
      <button 
        onClick={setSellerRole}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Set Seller Role
      </button>
      
      <div className="mt-6">
        <a href="/seller" className="text-blue-600 hover:underline">
          Go to Seller Dashboard
        </a>
      </div>
    </div>
  );
} 