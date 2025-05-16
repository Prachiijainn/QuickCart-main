'use client';
import React from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '../context/AppContext';

const HomeProducts = () => {
    const { products } = useAppContext();
    
    return (
        <div className="py-10">
            <h2 className="text-2xl font-medium mb-8">Popular Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default HomeProducts;
