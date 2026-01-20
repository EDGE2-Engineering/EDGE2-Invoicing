
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { initialServices } from '@/data/services';

export const ServicesContext = createContext();

export const ServicesProvider = ({ children }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const mapFromDb = useCallback((s) => {
        if (!s) return null;
        return {
            ...s,
            id: s.id,
            serviceType: s.service_type || s.serviceType || '',
            price: Number(s.price) || 0,
            unit: s.unit || '',
            qty: Number(s.qty) || 1,
            methodOfSampling: s.method_of_sampling || s.methodOfSampling || 'NA',
            numBHs: Number(s.num_bhs ?? s.numBHs ?? 0) || 0,
            measure: s.measure || s.measureType || 'NA',
            hsnCode: s.hsn_code || s.hsnCode || '',
            createdAt: s.created_at || new Date().toISOString()
        };
    }, []);

    const mapToDb = useCallback((s) => ({
        id: s.id,
        service_type: s.serviceType,
        price: s.price,
        unit: s.unit,
        qty: s.qty,
        method_of_sampling: s.methodOfSampling || s.method_of_sampling || 'NA',
        num_bhs: typeof s.numBHs === 'number' ? s.numBHs : Number(s.num_bhs ?? 0),
        measure: s.measure || 'NA',
        hsn_code: s.hsnCode || s.hsn_code || ''
    }), []);

    const fetchServices = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.warn("Supabase fetch error (services):", error.message);
                const stored = localStorage.getItem('services');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setServices(parsed);
                            return;
                        }
                    } catch (e) { }
                }
                if (services.length === 0) setServices(initialServices);
                return;
            }

            if (data && data.length > 0) {
                const mappedData = data.map(mapFromDb);
                setServices(mappedData);
            } else {
                const stored = localStorage.getItem('services');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setServices(parsed);
                            return;
                        }
                    } catch (e) { }
                }
                setServices(initialServices);
            }
        } catch (error) {
            console.error("Error loading services:", error);
            if (services.length === 0) setServices(initialServices);
        } finally {
            setLoading(false);
        }
    }, [mapFromDb]);

    useEffect(() => {
        fetchServices();
        const handleStorageChange = () => {
            const stored = localStorage.getItem('services');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) setServices(parsed);
                } catch (e) { }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fetchServices]);

    useEffect(() => {
        if (services.length > 0) {
            localStorage.setItem('services', JSON.stringify(services));
        }
    }, [services]);

    const updateService = async (updatedService) => {
        // Check for HSN code collision
        if (updatedService.hsnCode) {
            const existingWithSameHsn = services.find(
                s => s.id !== updatedService.id && s.hsnCode === updatedService.hsnCode
            );
            if (existingWithSameHsn) {
                throw new Error(`HSN code "${updatedService.hsnCode}" is already used by another service: "${existingWithSameHsn.serviceType}"`);
            }
        }

        // Store the previous state to revert if update fails
        const previousServices = [...services];

        // Optimistically update local state
        setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));

        try {
            const dbPayload = mapToDb(updatedService);
            const { id, ...updates } = dbPayload;

            // Add updated_at timestamp
            updates.updated_at = new Date().toISOString();

            const { error, data } = await supabase
                .from('services')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) {
                console.error("Supabase Update Failed (services):", error);
                // Revert local state on error
                setServices(previousServices);
                throw new Error(`Failed to update service: ${error.message}`);
            }

            // Update local state with the returned data to ensure consistency
            if (data && data.length > 0) {
                const updated = mapFromDb(data[0]);
                setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
            }
        } catch (err) {
            console.error("Update Service Exception:", err);
            // Revert local state on error
            setServices(previousServices);
            throw err;
        }
    };

    const addService = async (newService) => {
        // Check for HSN code collision
        if (newService.hsnCode) {
            const existingWithSameHsn = services.find(
                s => s.hsnCode === newService.hsnCode
            );
            if (existingWithSameHsn) {
                throw new Error(`HSN code "${newService.hsnCode}" is already used by another service: "${existingWithSameHsn.serviceType}"`);
            }
        }

        const tempId = newService.id || `srv_${Date.now()}`;
        const serviceWithId = { ...newService, id: tempId, created_at: new Date().toISOString() };

        // Store the previous state to revert if insert fails
        const previousServices = [...services];

        // Optimistically update local state
        setServices(prev => [...prev, serviceWithId]);

        try {
            const dbPayload = mapToDb(serviceWithId);
            dbPayload.created_at = new Date().toISOString();
            dbPayload.updated_at = new Date().toISOString();

            const { error, data } = await supabase
                .from('services')
                .insert(dbPayload)
                .select();

            if (error) {
                console.error("Supabase Add Failed (services):", error);
                // Revert local state on error
                setServices(previousServices);
                throw new Error(`Failed to add service: ${error.message}`);
            }

            // Update local state with the returned data to ensure consistency
            if (data && data.length > 0) {
                const added = mapFromDb(data[0]);
                setServices(prev => prev.map(s => s.id === tempId ? added : s));
            }
        } catch (err) {
            console.error("Add Service Exception:", err);
            // Revert local state on error
            setServices(previousServices);
            throw err;
        }
    };

    const deleteService = async (id) => {
        // Store the previous state to revert if delete fails
        const previousServices = [...services];
        const serviceToDelete = services.find(s => s.id === id);

        // Optimistically update local state
        setServices(prev => prev.filter(s => s.id !== id));

        try {
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

            if (error) {
                console.error("Supabase Delete Failed (services):", error);
                // Revert local state on error
                setServices(previousServices);
                throw new Error(`Failed to delete service: ${error.message}`);
            }
        } catch (err) {
            console.error("Delete Service Exception:", err);
            // Revert local state on error
            setServices(previousServices);
            throw err;
        }
    };

    return (
        <ServicesContext.Provider value={{ services, loading, updateService, addService, deleteService, setServices, refreshServices: fetchServices }}>
            {children}
        </ServicesContext.Provider>
    );
};

export const useServices = () => React.useContext(ServicesContext);
