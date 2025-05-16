'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAppContext } from '../../context/AppContext';
import useRequireAuth from '../../hooks/useRequireAuth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

const Checkout = () => {
  // This will redirect to sign-in if not authenticated
  const { user, isLoaded } = useRequireAuth();
  const { cartItems, products, getCartAmount, getToken } = useAppContext();
  const router = useRouter();
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's saved address
    const fetchAddress = async () => {
      try {
        if (user) {
          const token = await getToken();
          const { data } = await axios.get('/api/user/address', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (data.success) {
            setAddress(data.address);
          }
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [user, getToken]);

  const cartItemsArray = Object.entries(cartItems || {})
    .map(([itemId, quantity]) => {
      const product = products.find((product) => product._id === itemId);
      return { product, quantity };
    })
    .filter(item => item.product);

  const subtotal = getCartAmount();
  const shipping = 5.00;
  const total = subtotal + shipping;

  // If still loading auth state, show loading indicator
  if (!isLoaded || loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      const token = await getToken();
      // Here you would make an API call to place the order
      // For now, just show a success message
      toast.success('Order placed successfully!');
      // Redirect to orders page
      router.push('/my-orders');
    } catch (error) {
      toast.error('Failed to place order: ' + error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-10">
        <h1 className="text-3xl font-medium pb-4 border-b">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white p-6 border rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Shipping Address</h2>
                {!address && (
                  <button 
                    onClick={() => router.push('/add-address')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Add Address
                  </button>
                )}
                {address && (
                  <button 
                    onClick={() => router.push('/add-address')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Change
                  </button>
                )}
              </div>
              
              {address ? (
                <div className="p-4 border rounded">
                  <p className="font-medium">{address.fullName}</p>
                  <p>{address.area}</p>
                  <p>{address.city}, {address.state} {address.pincode}</p>
                  <p>Phone: {address.phoneNumber}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No shipping address found</p>
                  <button 
                    onClick={() => router.push('/add-address')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Shipping Address
                  </button>
                </div>
              )}
            </div>
            
            {/* Payment Method */}
            <div className="bg-white p-6 border rounded-lg">
              <h2 className="text-xl font-medium mb-4">Payment Method</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="credit-card" 
                    name="payment-method" 
                    className="mr-2"
                    defaultChecked 
                  />
                  <label htmlFor="credit-card">Credit Card</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="paypal" 
                    name="payment-method" 
                    className="mr-2" 
                  />
                  <label htmlFor="paypal">PayPal</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="cod" 
                    name="payment-method" 
                    className="mr-2" 
                  />
                  <label htmlFor="cod">Cash on Delivery</label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-gray-50 p-6 rounded-lg h-fit">
            <h2 className="text-xl font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItemsArray.map(({ product, quantity }) => (
                <div key={product._id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                    <Image 
                      src={Array.isArray(product.image) ? product.image[0] : product.image}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{product.name}</p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Qty: {quantity}</span>
                      <span>${product.offerPrice * quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={handlePlaceOrder}
              disabled={!address}
              className={`w-full py-3 mt-6 rounded-lg font-medium text-white ${
                address ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {address ? 'Place Order' : 'Add address to continue'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout; 