
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session in localStorage
        const storedUser = localStorage.getItem('app_session');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('app_session');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const { data, error } = await supabase
                .from('app_users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();

            if (error || !data) {
                throw new Error("Invalid username or password");
            }

            const sessionUser = {
                id: data.id,
                username: data.username,
                fullName: data.full_name,
                role: data.role
            };

            setUser(sessionUser);
            localStorage.setItem('app_session', JSON.stringify(sessionUser));
            return sessionUser;
        } catch (err) {
            console.error("Login error:", err.message);
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('app_session');
    };

    const isAdmin = () => user?.role === 'admin';
    const isStandard = () => user?.role === 'standard';

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isStandard }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
