import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const SettingsContext = createContext();

export const useSettings = () => {
    return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        tax_cgst: 9,
        tax_sgst: 9
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('*');

            if (error) {
                console.warn("Supabase Fetch Failed (settings), using defaults:", error);
                return;
            }

            if (data && data.length > 0) {
                const newSettings = {};
                data.forEach(item => {
                    // Try to parse numbers, otherwise keep as string
                    const numVal = Number(item.setting_value);
                    newSettings[item.setting_key] = isNaN(numVal) ? item.setting_value : numVal;
                });
                setSettings(prev => ({ ...prev, ...newSettings }));
            }
        } catch (err) {
            console.error("Fetch Settings Exception:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSetting = async (key, value) => {
        // Optimistic update
        setSettings(prev => ({ ...prev, [key]: value }));

        try {
            const { error } = await supabase
                .from('app_settings')
                .upsert({
                    setting_key: key,
                    setting_value: String(value),
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error(`Failed to update setting ${key}:`, error);
                // Re-fetch to revert if needed, or implement proper revert logic
                await fetchSettings();
                throw error;
            }
        } catch (err) {
            console.error("Update Setting Exception:", err);
            throw err;
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, loading, fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
