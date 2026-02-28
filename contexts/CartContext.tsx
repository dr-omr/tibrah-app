/**
 * Cart Context — Centralized shopping cart state management
 * Provides cart operations (add, remove, update, clear) app-wide
 * Persists via db.entities.CartItem with React Query caching
 */

import React, { createContext, useContext, useCallback, ReactNode, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CartItem {
    id: string;
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    image_url?: string;
}

interface CartContextType {
    /** All items in the cart */
    items: CartItem[];
    /** Whether the cart is loading */
    isLoading: boolean;
    /** Total number of items (sum of quantities) */
    totalItems: number;
    /** Total price of all items */
    totalPrice: number;
    /** Subtotal before any discounts */
    subtotal: number;
    /** Add product to cart (or increment if exists) */
    addToCart: (product: { id: string; name: string; price: number; image_url?: string; in_stock?: boolean }) => void;
    /** Remove item from cart entirely */
    removeFromCart: (itemId: string) => void;
    /** Update item quantity */
    updateQuantity: (itemId: string, quantity: number) => void;
    /** Clear all items from cart */
    clearCart: () => void;
    /** Check if a product is in the cart */
    isInCart: (productId: string) => boolean;
    /** Get quantity of a product in the cart */
    getQuantity: (productId: string) => number;
    /** Whether any mutation is in progress */
    isMutating: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════

const CartContext = createContext<CartContextType | null>(null);

// ═══════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════

interface CartProviderProps {
    children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
    const queryClient = useQueryClient();

    // Fetch cart items
    const { data: rawItems = [], isLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: () => db.entities.CartItem.list(),
        staleTime: 30 * 1000, // 30 seconds
    });

    const items: CartItem[] = rawItems as CartItem[];

    // Computed values
    const totalItems = useMemo(
        () => items.reduce((sum, item) => sum + (item.quantity || 1), 0),
        [items]
    );

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
        [items]
    );

    const totalPrice = subtotal; // Can add shipping/discount logic here later

    // Add to cart mutation
    const addMutation = useMutation({
        mutationFn: async (product: { id: string; name: string; price: number; image_url?: string; in_stock?: boolean }) => {
            if (product.in_stock === false) {
                throw new Error('هذا المنتج غير متوفر حالياً');
            }

            const currentCart = queryClient.getQueryData<CartItem[]>(['cart']) || [];
            const existingItem = currentCart.find(item => item.product_id === product.id);

            if (existingItem) {
                return db.entities.CartItem.update(existingItem.id, {
                    quantity: existingItem.quantity + 1,
                });
            }

            return db.entities.CartItem.create({
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                quantity: 1,
                image_url: product.image_url || '',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('تمت الإضافة للسلة ✅');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'حدث خطأ أثناء الإضافة');
        },
    });

    // Remove from cart mutation
    const removeMutation = useMutation({
        mutationFn: (itemId: string) => db.entities.CartItem.delete(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('تم إزالة المنتج من السلة');
        },
    });

    // Update quantity mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, quantity }: { id: string; quantity: number }): Promise<void> => {
            if (quantity <= 0) {
                await db.entities.CartItem.delete(id);
            } else {
                await db.entities.CartItem.update(id, { quantity });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    // Clear cart mutation
    const clearMutation = useMutation({
        mutationFn: async () => {
            const currentCart = queryClient.getQueryData<CartItem[]>(['cart']) || [];
            await Promise.all(currentCart.map(item => db.entities.CartItem.delete(item.id)));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('تم تفريغ السلة');
        },
    });

    // Actions
    const addToCart = useCallback(
        (product: { id: string; name: string; price: number; image_url?: string; in_stock?: boolean }) => {
            addMutation.mutate(product);
        },
        [addMutation]
    );

    const removeFromCart = useCallback(
        (itemId: string) => {
            removeMutation.mutate(itemId);
        },
        [removeMutation]
    );

    const updateQuantity = useCallback(
        (itemId: string, quantity: number) => {
            updateMutation.mutate({ id: itemId, quantity });
        },
        [updateMutation]
    );

    const clearCart = useCallback(() => {
        clearMutation.mutate();
    }, [clearMutation]);

    const isInCart = useCallback(
        (productId: string) => items.some(item => item.product_id === productId),
        [items]
    );

    const getQuantity = useCallback(
        (productId: string) => {
            const item = items.find(i => i.product_id === productId);
            return item?.quantity || 0;
        },
        [items]
    );

    const isMutating = addMutation.isPending || removeMutation.isPending ||
        updateMutation.isPending || clearMutation.isPending;

    const value: CartContextType = {
        items,
        isLoading,
        totalItems,
        totalPrice,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getQuantity,
        isMutating,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export function useCart(): CartContextType {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

export default CartContext;
