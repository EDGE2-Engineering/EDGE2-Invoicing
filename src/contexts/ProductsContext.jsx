
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { initialProducts } from '@/data/products';

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper to map DB snake_case to app camelCase safely
    const mapFromDb = useCallback((p) => {
        if (!p) return null;
        return {
            ...p,
            id: p.id,
            title: p.title || '',
            category: p.category || '',
            price: Number(p.price) || 0,
            weight: p.weight || '',
            stock: Number(p.stock) || 0,
            description: p.description || '',
            ingredients: p.ingredients || '',
            benefits: p.benefits || '',
            images: p.images || [],
            featured: p.featured || false,
            status: p.status || 'In Stock',
            createdAt: p.created_at || new Date().toISOString()
        };
    }, []);

    // Helper to map app camelCase to DB snake_case
    const mapToDb = useCallback((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price,
        weight: p.weight,
        stock: p.stock,
        description: p.description,
        ingredients: p.ingredients,
        benefits: p.benefits,
        images: p.images,
        featured: p.featured,
        status: p.status
    }), []);

    const fetchProducts = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.warn("Supabase fetch error:", error.message);
                // Fallback to local
                if (products.length === 0) setProducts(initialProducts);
                return;
            }

            if (data && data.length > 0) {
                const mappedData = data.map(mapFromDb);
                setProducts(mappedData);
            } else {
                setProducts(initialProducts);
            }
        } catch (error) {
            console.error("Error loading products:", error);
            if (products.length === 0) setProducts(initialProducts);
        } finally {
            setLoading(false);
        }
    }, [mapFromDb]);

    // Initial fetch and Realtime Subscription
    useEffect(() => {
        fetchProducts();

        const channelName = `public:products:${Date.now()}`;
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newRecord = mapFromDb(payload.new);
                        setProducts((prev) => {
                            if (prev.find(p => p.id === newRecord.id)) return prev;
                            return [...prev, newRecord];
                        });
                    }
                    else if (payload.eventType === 'UPDATE') {
                        const updatedRecord = mapFromDb(payload.new);
                        setProducts((prev) => {
                            return prev.map((item) => item.id === payload.new.id ? updatedRecord : item);
                        });
                    }
                    else if (payload.eventType === 'DELETE') {
                        setProducts((prev) =>
                            prev.filter((item) => item.id !== payload.old.id)
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchProducts, mapFromDb]);

    const updateProduct = async (updatedProduct) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));

        try {
            const dbPayload = mapToDb(updatedProduct);
            const { id, ...updates } = dbPayload;

            const { error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id);

            if (error) {
                console.error("Supabase Update Failed:", error);
                fetchProducts();
                throw error;
            }
        } catch (err) {
            console.error("Update Product Exception:", err);
            fetchProducts();
            throw err;
        }
    };

    const addProduct = async (newProduct) => {
        const tempId = newProduct.id || `prod_${Date.now()}`;
        const productWithId = {
            ...newProduct,
            id: tempId,
            created_at: new Date().toISOString()
        };

        setProducts(prev => [...prev, productWithId]);

        try {
            const { error } = await supabase.from('products').insert(mapToDb(productWithId));
            if (error) {
                console.error("Add failed", error);
                fetchProducts();
                throw error;
            }
        } catch (err) {
            console.error("Add Exception", err);
            fetchProducts();
            throw err;
        }
    };

    const deleteProduct = async (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));

        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) {
                console.error("Delete failed", error);
                fetchProducts();
                throw error;
            }
        } catch (err) {
            fetchProducts();
            throw err;
        }
    };

    return (
        <ProductsContext.Provider value={{
            products,
            loading,
            updateProduct,
            addProduct,
            deleteProduct,
            setProducts,
            refreshProducts: fetchProducts
        }}>
            {children}
        </ProductsContext.Provider>
    );
};

export const useProducts = () => React.useContext(ProductsContext);

