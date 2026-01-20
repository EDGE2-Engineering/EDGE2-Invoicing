import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const ClientsContext = createContext();

const initialClients = [
    { id: 'C1', clientName: 'Indus Towers Ltd.', clientAddress: '', email: '', phone: '' },
    { id: 'C2', clientName: 'Reliance Jio Infocomm Ltd.', clientAddress: '', email: '', phone: '' },
    { id: 'C3', clientName: 'ATC Telecom Infrastructure Pvt. Ltd.', clientAddress: '', email: '', phone: '' }
];

export const ClientsProvider = ({ children }) => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    const mapFromDb = useCallback((c) => {
        if (!c) return null;
        return {
            ...c,
            id: c.id,
            clientName: c.client_name || c.clientName || '',
            clientAddress: c.client_address || c.clientAddress || '',
            email: c.email || '',
            phone: c.phone || '',
            createdAt: c.created_at || new Date().toISOString()
        };
    }, []);

    const mapToDb = useCallback((c) => ({
        id: c.id,
        client_name: c.clientName,
        client_address: c.clientAddress,
        email: c.email,
        phone: c.phone
    }), []);

    const fetchClients = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.warn("Supabase fetch error (clients):", error.message);
                const stored = localStorage.getItem('clients');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setClients(parsed);
                            return;
                        }
                    } catch (e) { }
                }
                if (clients.length === 0) setClients(initialClients);
                return;
            }

            if (data && data.length > 0) {
                const mappedData = data.map(mapFromDb);
                setClients(mappedData);
            } else {
                const stored = localStorage.getItem('clients');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setClients(parsed);
                            return;
                        }
                    } catch (e) { }
                }
                setClients(initialClients);
            }
        } catch (error) {
            console.error("Error loading clients:", error);
            if (clients.length === 0) setClients(initialClients);
        } finally {
            setLoading(false);
        }
    }, [mapFromDb]);

    useEffect(() => {
        fetchClients();
        const handleStorageChange = () => {
            const stored = localStorage.getItem('clients');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) setClients(parsed);
                } catch (e) { }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fetchClients]);

    useEffect(() => {
        if (clients.length > 0) {
            localStorage.setItem('clients', JSON.stringify(clients));
        }
    }, [clients]);

    const updateClient = async (updatedClient) => {
        // Check for duplicate client names
        if (updatedClient.clientName) {
            const existingWithName = clients.find(
                c => c.id !== updatedClient.id && c.clientName.toLowerCase() === updatedClient.clientName.toLowerCase()
            );
            if (existingWithName) {
                throw new Error(`Client name "${updatedClient.clientName}" already exists.`);
            }
        }

        const previousClients = [...clients];
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));

        try {
            const dbPayload = mapToDb(updatedClient);
            const { id, ...updates } = dbPayload;
            updates.updated_at = new Date().toISOString();

            const { error, data } = await supabase
                .from('clients')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) {
                console.error("Supabase Update Failed (clients):", error);
                setClients(previousClients);
                throw new Error(`Failed to update client: ${error.message}`);
            }

            if (data && data.length > 0) {
                const updated = mapFromDb(data[0]);
                setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
            }
        } catch (err) {
            console.error("Update Client Exception:", err);
            setClients(previousClients);
            throw err;
        }
    };

    const addClient = async (newClient) => {
        // Check for duplicate client names
        if (newClient.clientName) {
            const existingWithName = clients.find(
                c => c.clientName.toLowerCase() === newClient.clientName.toLowerCase()
            );
            if (existingWithName) {
                throw new Error(`Client name "${newClient.clientName}" already exists.`);
            }
        }

        const tempId = newClient.id || `cli_${Date.now()}`;
        const clientWithId = { ...newClient, id: tempId, created_at: new Date().toISOString() };

        const previousClients = [...clients];
        setClients(prev => [...prev, clientWithId]);

        try {
            const dbPayload = mapToDb(clientWithId);
            dbPayload.created_at = new Date().toISOString();
            dbPayload.updated_at = new Date().toISOString();

            const { error, data } = await supabase
                .from('clients')
                .insert(dbPayload)
                .select();

            if (error) {
                console.error("Supabase Add Failed (clients):", error);
                setClients(previousClients);
                throw new Error(`Failed to add client: ${error.message}`);
            }

            if (data && data.length > 0) {
                const added = mapFromDb(data[0]);
                setClients(prev => prev.map(c => c.id === tempId ? added : c));
            }
        } catch (err) {
            console.error("Add Client Exception:", err);
            setClients(previousClients);
            throw err;
        }
    };

    const deleteClient = async (id) => {
        const previousClients = [...clients];
        setClients(prev => prev.filter(c => c.id !== id));

        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) {
                console.error("Supabase Delete Failed (clients):", error);
                setClients(previousClients);
                throw new Error(`Failed to delete client: ${error.message}`);
            }
        } catch (err) {
            console.error("Delete Client Exception:", err);
            setClients(previousClients);
            throw err;
        }
    };

    return (
        <ClientsContext.Provider value={{ clients, loading, updateClient, addClient, deleteClient, setClients, refreshClients: fetchClients }}>
            {children}
        </ClientsContext.Provider>
    );
};

export const useClients = () => React.useContext(ClientsContext);
