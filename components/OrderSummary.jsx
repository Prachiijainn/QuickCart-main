import { addressDummyData } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const OrderSummary = () => {
  const { 
    currency, 
    router, 
    getCartCount, 
    getCartAmount, 
    getToken,
    user,
    userAddresses,
    selectedAddress,
    setSelectedAddress,
    addressesLoading,
    fetchUserAddresses,
    cartItems,
    products
  } = useAppContext();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // Display addresses - use the context's addresses or fall back to dummy data for testing
  const displayAddresses = userAddresses && userAddresses.length > 0 
    ? userAddresses 
    : addressDummyData;
  
  // Debug logging
  useEffect(() => {
    console.log("OrderSummary - Current userAddresses:", userAddresses);
    console.log("OrderSummary - Selected address:", selectedAddress);
    console.log("OrderSummary - Loading state:", addressesLoading);
    console.log("OrderSummary - Display addresses:", displayAddresses);
  }, [userAddresses, selectedAddress, addressesLoading, displayAddresses]);

  const handleAddressSelect = (address) => {
    console.log("Selected address:", address);
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (getCartCount() === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Format cart items for the order
      const orderItems = Object.entries(cartItems).map(([productId, quantity]) => {
        return {
          product: productId,
          quantity: quantity
        };
      });

      console.log("Placing order with items:", orderItems);
      console.log("Delivery address:", selectedAddress);

      const token = await getToken();
      const { data } = await axios.post('/api/order/create', {
        items: orderItems,
        address: selectedAddress
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        // Remove success toast as there's already a success page
        // toast.success("Order placed successfully!");
        // Redirect to order confirmation page
        router.push('/order-placed');
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Manual fetch addresses button for testing
  const handleManualFetch = () => {
    fetchUserAddresses();
    toast.success("Manually refreshing addresses...");
  };

  // Fetch addresses when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log("Fetching addresses on mount/user change");
      fetchUserAddresses();
    }
  }, [user, fetchUserAddresses]);

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {addressesLoading ? (
                <span>Loading addresses...</span>
              ) : selectedAddress ? (
                <span>
                  {selectedAddress.fullName}, {selectedAddress.area}, {selectedAddress.city}, {selectedAddress.state}
                </span>
              ) : (
                <span>Select Address</span>
              )}
              <svg className={`w-5 h-5 inline float-right transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {displayAddresses.length > 0 ? (
                  displayAddresses.map((address, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                      onClick={() => handleAddressSelect(address)}
                    >
                      {address.fullName}, {address.area}, {address.city}, {address.state}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-400">No addresses available</li>
                )}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center text-orange-600 font-medium"
                >
                  + Add New Address
                </li>
                {/* Debug button - only for development */}
                <li
                  onClick={handleManualFetch}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center text-blue-500"
                >
                  Refresh Addresses
                </li>
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700">
              Apply
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">{currency}{getCartAmount()}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">{currency}{Math.floor(getCartAmount() * 0.02)}</p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>{currency}{getCartAmount() + Math.floor(getCartAmount() * 0.02)}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={createOrder} 
        disabled={isPlacingOrder || !selectedAddress || getCartCount() === 0}
        className={`w-full ${isPlacingOrder || !selectedAddress || getCartCount() === 0 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-orange-600 hover:bg-orange-700'} text-white py-3 mt-5 transition-colors`}
      >
        {isPlacingOrder ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
};

export default OrderSummary;