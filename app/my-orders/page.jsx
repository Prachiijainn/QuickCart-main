'use client';
import React from 'react';
import Navbar from '../../components/Navbar';
import { useAppContext } from '../../context/AppContext';
import useRequireAuth from '../../hooks/useRequireAuth';
import Image from 'next/image';
import { orderDummyData } from '../../assets/assets';
import Link from 'next/link';

const MyOrders = () => {
  // This will redirect to sign-in if not authenticated
  const { user, isLoaded } = useRequireAuth();
  const { router } = useAppContext();

  // In a real app, you would fetch orders from your API
  const orders = orderDummyData || [];

  // If still loading auth state, show loading indicator
  if (!isLoaded) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-10">
        <h1 className="text-3xl font-medium pb-4 border-b">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-medium mt-8">No orders yet</h2>
            <p className="text-gray-500 mt-2">Start shopping to see your orders here</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">{order._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">${order.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item._id} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                          <Image 
                            src={Array.isArray(item.product.image) ? item.product.image[0] : item.product.image}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Qty: {item.quantity}</span>
                            <span>${item.product.offerPrice * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <p className="text-gray-600">
                      {order.address.fullName}<br />
                      {order.address.area}<br />
                      {order.address.city}, {order.address.state} {order.address.pincode}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrders;