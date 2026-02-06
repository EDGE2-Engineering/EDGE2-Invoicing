
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { TG_NOTIFIER_CONFIG } from '@/data/config';


const AuthContext = createContext();
let lastNotificationTime = 0;


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const notifyLogin = async (username, fullName) => {
        const { BOT_TOKEN, CHAT_ID, RATE_LIMIT_MS } = TG_NOTIFIER_CONFIG;

        const now = Date.now();
        if (now - lastNotificationTime < (RATE_LIMIT_MS || 60000)) return;
        lastNotificationTime = now;

        if (!BOT_TOKEN || BOT_TOKEN.startsWith("YOUR_") || !CHAT_ID) return;

        const message = `🔔 *Login Alert*\n\nUser: \`${fullName}\` (@${username})\nTime: ${new Date().toLocaleString()}`;

        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
        } catch (err) {
            console.error("Failed to send login notification to Telegram", err);
        }
    };

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
                .eq('is_active', true)
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

            // Send login notification via Zapier
            notifyLogin(sessionUser.username, sessionUser.fullName);

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
