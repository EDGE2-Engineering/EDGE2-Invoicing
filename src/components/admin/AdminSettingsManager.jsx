import React, { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';

const AdminSettingsManager = () => {
    const { settings, updateSetting, loading } = useSettings();
    const { toast } = useToast();
    const [localSettings, setLocalSettings] = useState({
        tax_cgst: '',
        tax_sgst: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!loading && settings) {
            setLocalSettings({
                tax_cgst: settings.tax_cgst,
                tax_sgst: settings.tax_sgst
            });
        }
    }, [loading, settings]);

    const handleChange = (field, value) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSetting('tax_cgst', localSettings.tax_cgst);
            await updateSetting('tax_sgst', localSettings.tax_sgst);
            toast({ title: "Settings Saved", description: "Tax configurations updated successfully." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold">Tax Configuration</h2>
                    <p className="text-gray-500 text-sm mt-1">Configure global tax rates for invoices.</p>
                </div>
                <Button
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary-dark flex items-center text-white"
                    disabled={isSaving}
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
                <div className="space-y-2">
                    <Label>CGST (%)</Label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={localSettings.tax_cgst}
                        onChange={(e) => handleChange('tax_cgst', e.target.value)}
                        placeholder="e.g. 9"
                    />
                    <p className="text-xs text-gray-500">Central Goods and Services Tax percentage.</p>
                </div>

                <div className="space-y-2">
                    <Label>SGST (%)</Label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={localSettings.tax_sgst}
                        onChange={(e) => handleChange('tax_sgst', e.target.value)}
                        placeholder="e.g. 9"
                    />
                    <p className="text-xs text-gray-500">State Goods and Services Tax percentage.</p>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between bg-blue-50 p-4 rounded-md text-blue-800 text-sm">
                <div>
                    <span className="font-semibold">Total Tax:</span> {Number(localSettings.tax_cgst) + Number(localSettings.tax_sgst)}%
                </div>
                <div>
                    Changes will apply to new invoices immediately.
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsManager;
