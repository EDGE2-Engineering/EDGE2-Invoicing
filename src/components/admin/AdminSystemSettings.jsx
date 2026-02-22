
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ruler, Hash, CreditCard, FileText, Axe, Building2, ClipboardList } from 'lucide-react';
import AdminUnitTypesManager from './AdminUnitTypesManager';
import AdminHSNCodesManager from './AdminHSNCodesManager';
import AdminSettingsManager from './AdminSettingsManager';
import AdminTermsManager from './AdminTermsManager';
import AdminTechnicalsManager from './AdminTechnicalsManager';
import AdminDepartmentsManager from './AdminDepartmentsManager';

const AdminSystemSettings = () => {
    return (
        <div className="space-y-4">
            <Tabs defaultValue="unit_types" className="w-full">
                <div className="flex justify-center mb-6">
                    <TabsList className="bg-white p-1 border border-gray-200 rounded-xl shadow-sm h-auto inline-flex flex-wrap justify-center">
                        <TabsTrigger
                            value="unit_types"
                            className="px-2 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
                        >
                            <Ruler className="w-4 h-4" /> Units
                        </TabsTrigger>
                        <TabsTrigger
                            value="hsn_codes"
                            className="px-2 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
                        >
                            <Hash className="w-4 h-4" /> Codes
                        </TabsTrigger>

                        <TabsTrigger
                            value="terms"
                            className="px-2 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" /> T&C
                        </TabsTrigger>
                        <TabsTrigger
                            value="technicals"
                            className="px-2 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
                        >
                            <Axe className="w-4 h-4" /> Technicals
                        </TabsTrigger>

                        <TabsTrigger
                            value="payment_settings"
                            className="px-2 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
                        >
                            <CreditCard className="w-4 h-4" /> Payment
                        </TabsTrigger>
                        <TabsTrigger
                            value="departments"
                            className="px-2 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
                        >
                            <Building2 className="w-4 h-4" /> Departments
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="unit_types" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <AdminUnitTypesManager />
                </TabsContent>

                <TabsContent value="hsn_codes" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <AdminHSNCodesManager />
                </TabsContent>

                <TabsContent value="payment_settings" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <AdminSettingsManager />
                </TabsContent>

                <TabsContent value="terms" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <AdminTermsManager />
                </TabsContent>

                <TabsContent value="technicals" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <AdminTechnicalsManager />
                </TabsContent>


                <TabsContent value="departments" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <AdminDepartmentsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminSystemSettings;
