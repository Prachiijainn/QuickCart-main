'use client';
import { productsDummyData } from "../assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppContextProvider = (props) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY;
    const router = useRouter();

    const { user } = useUser();
    const { getToken } = useAuth();

    const [products, setProducts] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [loadingUser, setLoadingUser] = useState(true); // Track user data loading

    const fetchProductData = useCallback(async () => {
        try {
            const{data} = await axios.get('/api/product/list')
             if (data.success){
                setProducts(data.products)
             }
             else{
                toast.error(data.message)
             }


        } catch (error) {
            toast.error(error.message)
            
        }
    }, []);

    const fetchUserData = useCallback(async () => {
        setLoadingUser(true);
        try {
            if (!user) {
                console.log("No user found in context");
                setLoadingUser(false);
                return;
            }

            // Check both types of role metadata for consistency with middleware
            const hasSellerRole = user?.publicMetadata?.role === 'seller' || 
                (Array.isArray(user?.privateMetadata?.roles) && user.privateMetadata.roles.includes('seller'));
            
            if (hasSellerRole) {
                setIsSeller(true);
            } else {
                setIsSeller(false);
            }

            console.log("Fetching user data for:", user.id);
            try {
                const { data } = await axios.get('/api/user/data');
                
                if (data.success) {
                    setUserData(data.user);
                    setCartItems(data.user.cartItems || {});
                } else {
                    console.error("Error response:", data);
                    toast.error(data.message || "Failed to fetch user data");
                    setUserData(null);
                    setCartItems({});
                    setIsSeller(false);
                }
            } catch (error) {
                console.error("Error fetching user data:", error.response?.data || error.message);
                // Don't show an error toast for 401 errors when not logged in
                if (error.response?.status !== 401) {
                    toast.error(error.response?.data?.message || "Failed to fetch user data");
                }
                setUserData(null);
                setCartItems({});
                setIsSeller(false);
            }
        } catch (error) {
            console.error("Error in user data logic:", error);
            setUserData(null);
            setCartItems({});
            setIsSeller(false);
        } finally {
            setLoadingUser(false);
        }
    }, [user]);

    const updateCartOnServer = useCallback(async (updatedCartItems) => {
        try {
            const token = await getToken();
            console.log("Token being sent:", token);
            await axios.put('/api/user/cart', { cartItems: updatedCartItems }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Optionally provide more granular success messages if needed
        } catch (error) {
            toast.error('Failed to sync cart with server.');
            // Consider more sophisticated error handling, e.g., retries or local storage backup
        }
    }, [getToken]);

    const addToCart = useCallback(
        async (itemId) => {
            if (!user) {
                // Handle unauthenticated users (this shouldn't normally happen due to our UI checks)
                toast.error('Please sign in to add items to cart');
                return;
            }

            const updatedCart = { ...cartItems };
            updatedCart[itemId] = (updatedCart[itemId] || 0) + 1;
            setCartItems(updatedCart);
            updateCartOnServer(updatedCart); // Update immediately
             if (user) {
                try {
                    const token = await getToken

                    await axios.post('/api/cart/update', {cartData},{headers : {Authorization:`Bearer ${token}` }})
                    toast.success('Item added to cart!');

                } catch (error) {
                    toast.error (error.message)
                }
                
             }
        },
        [cartItems, updateCartOnServer, user]
    );

    const updateCartQuantity = useCallback(
        async (itemId, quantity) => {
            if (!user) {
                // Handle unauthenticated users
                toast.error('Please sign in to update your cart');
                return;
            }

            const updatedCart = { ...cartItems };
            if (quantity === 0) {
                delete updatedCart[itemId];
            } else {
                updatedCart[itemId] = quantity;
            }
            setCartItems(updatedCart);
            updateCartOnServer(updatedCart); // Update immediately
            toast.success('Cart updated!');
            try {
                    const token = await getToken

                    await axios.post('/api/cart/update', {cartData},{headers : {Authorization:`Bearer ${token}` }})
                    toast.success('Item added to cart!');

                } catch (error) {
                    toast.error (error.message)
                }
        },
        [cartItems, updateCartOnServer, user]
    );

    const getCartCount = useCallback(() => {
        return Object.values(cartItems).reduce((total, count) => total + count, 0);
    }, [cartItems]);

    const getCartAmount = useCallback(() => {
        return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
            const itemInfo = products.find((product) => product._id === itemId);
            return itemInfo ? total + itemInfo.offerPrice * quantity : total;
        }, 0);
    }, [cartItems, products]);

    useEffect(() => {
        fetchProductData();
    }, [fetchProductData]);

    useEffect(() => {
        if (user) {
            fetchUserData();
        } else {
            setLoadingUser(false); // If no user, stop loading
            setUserData(null);
            setCartItems({});
            setIsSeller(false);
        }
    }, [user, fetchUserData]);

    const value = {
        user,
        getToken,
        currency,
        router,
        isSeller,
        setIsSeller,
        userData,
        fetchUserData,
        products,
        fetchProductData,
        cartItems,
        setCartItems,
        addToCart,
        updateCartQuantity,
        getCartCount,
        getCartAmount,
        loadingUser, // Expose loading state
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};