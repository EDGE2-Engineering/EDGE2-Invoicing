
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { initialTests } from '@/data/tests';

export const TestsContext = createContext();

export const TestsProvider = ({ children }) => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    const mapFromDb = useCallback((t) => {
        if (!t) return null;
        return {
            ...t,
            id: t.id,
            testType: t.test_type || t.testType || '',
            materials: t.materials || '',
            group: t.group || '',
            testMethodSpecification: t.test_method_specification || t.testMethodSpecification || '',
            numDays: Number(t.num_days || t.numDays) || 0,
            price: Number(t.price) || 0,
            hsnCode: t.hsn_code || t.hsnCode || '',
            createdAt: t.created_at || new Date().toISOString()
        };
    }, []);

    const mapToDb = useCallback((t) => ({
        id: t.id,
        test_type: t.testType,
        materials: t.materials,
        group: t.group,
        test_method_specification: t.testMethodSpecification,
        num_days: t.numDays,
        price: t.price,
        hsn_code: t.hsnCode || t.hsn_code || ''
    }), []);

    const fetchTests = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.warn("Supabase fetch error (tests):", error.message);
                const stored = localStorage.getItem('tests');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setTests(parsed);
                            return;
                        }
                    } catch (e) { }
                }
                if (tests.length === 0) setTests(initialTests);
                return;
            }

            if (data && data.length > 0) {
                const mappedData = data.map(mapFromDb);
                setTests(mappedData);
            } else {
                const stored = localStorage.getItem('tests');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setTests(parsed);
                            return;
                        }
                    } catch (e) { }
                }
                setTests(initialTests);
            }
        } catch (error) {
            console.error("Error loading tests:", error);
            if (tests.length === 0) setTests(initialTests);
        } finally {
            setLoading(false);
        }
    }, [mapFromDb]);

    useEffect(() => {
        fetchTests();
        const handleStorageChange = () => {
            const stored = localStorage.getItem('tests');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) setTests(parsed);
                } catch (e) { }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fetchTests]);

    useEffect(() => {
        if (tests.length > 0) {
            localStorage.setItem('tests', JSON.stringify(tests));
        }
    }, [tests]);

    const updateTest = async (updatedTest) => {
        // Check for HSN code collision
        if (updatedTest.hsnCode) {
            const existingWithSameHsn = tests.find(
                t => t.id !== updatedTest.id && t.hsnCode === updatedTest.hsnCode
            );
            if (existingWithSameHsn) {
                throw new Error(`HSN code "${updatedTest.hsnCode}" is already used by another test: "${existingWithSameHsn.testType}"`);
            }
        }

        setTests(prev => prev.map(t => t.id === updatedTest.id ? updatedTest : t));
        try {
            const dbPayload = mapToDb(updatedTest);
            const { id, ...updates } = dbPayload;
            const { error } = await supabase.from('tests').update(updates).eq('id', id);
            if (error) console.warn("Supabase Update Failed (tests):", error.message);
        } catch (err) {
            console.warn("Update Test Exception:", err);
            throw err;
        }
    };

    const addTest = async (newTest) => {
        // Check for HSN code collision
        if (newTest.hsnCode) {
            const existingWithSameHsn = tests.find(
                t => t.hsnCode === newTest.hsnCode
            );
            if (existingWithSameHsn) {
                throw new Error(`HSN code "${newTest.hsnCode}" is already used by another test: "${existingWithSameHsn.testType}"`);
            }
        }

        const tempId = newTest.id || `tst_${Date.now()}`;
        const testWithId = { ...newTest, id: tempId, created_at: new Date().toISOString() };
        setTests(prev => [...prev, testWithId]);
        try {
            const { error } = await supabase.from('tests').insert(mapToDb(testWithId));
            if (error) console.warn("Supabase Add Failed (tests):", error.message);
        } catch (err) {
            console.warn("Add Test Exception:", err);
            throw err;
        }
    };

    const deleteTest = async (id) => {
        setTests(prev => prev.filter(t => t.id !== id));
        try {
            const { error } = await supabase.from('tests').delete().eq('id', id);
            if (error) console.warn("Supabase Delete Failed (tests):", error.message);
        } catch (err) {
            console.warn("Delete Test Exception:", err);
        }
    };

    return (
        <TestsContext.Provider value={{ tests, loading, updateTest, addTest, deleteTest, setTests, refreshTests: fetchTests }}>
            {children}
        </TestsContext.Provider>
    );
};

export const useTests = () => React.useContext(TestsContext);
