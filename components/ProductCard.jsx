'use client';
import React from 'react';
import { useAppContext } from '../context/AppContext';
import Image from 'next/image';
import { useClerk } from "@clerk/nextjs";

const ProductCard = ({ product }) => {
    const { addToCart, router, user } = useAppContext();
    const { openSignIn } = useClerk();
    
    const handleProductClick = () => {
        router.push(`/product/${product._id}`);
    };
    
    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!user) {
            // Redirect to sign in if user is not authenticated
            openSignIn();
        } else {
            addToCart(product._id);
        }
    };
    
    return (
        <div className="group cursor-pointer transition-all duration-300 hover:shadow-md rounded-lg p-3">
            <div className="relative h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden" onClick={handleProductClick}>
                <Image 
                    src={Array.isArray(product.image) ? product.image[0] : product.image} 
                    alt={product.name} 
                    layout="fill" 
                    objectFit="contain"
                    className="transition-transform duration-300 group-hover:scale-105" 
                />
            </div>
            <h3 className="font-medium text-gray-800 line-clamp-1" onClick={handleProductClick}>{product.name}</h3>
            <div className="mt-2 flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-400 line-through">${product.originalPrice}</p>
                    <p className="font-medium">${product.offerPrice}</p>
                </div>
                <button 
                    onClick={handleAddToCart}
                    className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;