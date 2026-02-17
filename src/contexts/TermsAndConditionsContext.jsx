import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const TermsAndConditionsContext = createContext();

export const useTermsAndConditions = () => useContext(TermsAndConditionsContext);

export const TermsAndConditionsProvider = ({ children }) => {
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchTerms = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('terms_and_conditions')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setTerms(data || []);
        } catch (error) {
            console.error('Error fetching terms:', error);
            // toast({ title: "Error", description: "Failed to fetch terms and conditions.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const addTerm = async (text, type = 'general') => {
        try {
            const { data, error } = await supabase
                .from('terms_and_conditions')
                .insert([{ text, type }])
                .select();

            if (error) throw error;
            setTerms(prev => [...prev, ...data]);
            return data;
        } catch (error) {
            console.error('Error adding term:', error);
            throw error;
        }
    };

    const updateTerm = async (id, text, type) => {
        try {
            const { data, error } = await supabase
                .from('terms_and_conditions')
                .update({ text, type, updated_at: new Date() })
                .eq('id', id)
                .select();

            if (error) throw error;
            setTerms(prev => prev.map(term => term.id === id ? data[0] : term));
            return data;
        } catch (error) {
            console.error('Error updating term:', error);
            throw error;
        }
    };

    const deleteTerm = async (id) => {
        try {
            const { error } = await supabase
                .from('terms_and_conditions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setTerms(prev => prev.filter(term => term.id !== id));
        } catch (error) {
            console.error('Error deleting term:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchTerms();
    }, []);

    return (
        <TermsAndConditionsContext.Provider value={{ terms, loading, addTerm, updateTerm, deleteTerm, fetchTerms }}>
            {children}
        </TermsAndConditionsContext.Provider>
    );
};
