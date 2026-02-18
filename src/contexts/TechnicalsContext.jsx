import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const TechnicalsContext = createContext();

export const useTechnicals = () => useContext(TechnicalsContext);

export const TechnicalsProvider = ({ children }) => {
    const [technicals, setTechnicals] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchTechnicals = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('technicals')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setTechnicals(data || []);
        } catch (error) {
            console.error('Error fetching technicals:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTechnical = async (text, type) => {
        try {
            const { data, error } = await supabase
                .from('technicals')
                .insert([{ text, type }])
                .select();

            if (error) throw error;
            setTechnicals(prev => [...prev, ...data]);
            return data;
        } catch (error) {
            console.error('Error adding technical:', error);
            throw error;
        }
    };

    const updateTechnical = async (id, text, type) => {
        try {
            const { data, error } = await supabase
                .from('technicals')
                .update({ text, type, updated_at: new Date() })
                .eq('id', id)
                .select();

            if (error) throw error;
            setTechnicals(prev => prev.map(tech => tech.id === id ? data[0] : tech));
            return data;
        } catch (error) {
            console.error('Error updating technical:', error);
            throw error;
        }
    };

    const deleteTechnical = async (id) => {
        try {
            const { error } = await supabase
                .from('technicals')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setTechnicals(prev => prev.filter(tech => tech.id !== id));
        } catch (error) {
            console.error('Error deleting technical:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchTechnicals();
    }, []);

    return (
        <TechnicalsContext.Provider value={{ technicals, loading, addTechnical, updateTechnical, deleteTechnical, fetchTechnicals }}>
            {children}
        </TechnicalsContext.Provider>
    );
};
