
import React, { useState, useEffect } from 'react';
import { useClients } from '@/contexts/ClientsContext';
import { useServices } from '@/contexts/ServicesContext';
import { useTests } from '@/contexts/TestsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Save, Trash2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdminClientPricingManager = () => {
    const { clients } = useClients();
    const { services, clientServicePrices, updateClientServicePrice, deleteClientServicePrice } = useServices();
    const { tests, clientTestPrices, updateClientTestPrice, deleteClientTestPrice } = useTests();
    const { toast } = useToast();

    const [selectedClientId, setSelectedClientId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('services');

    const selectedClient = clients.find(c => c.id === selectedClientId);

    const filteredServices = services.filter(s =>
        s.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTests = tests.filter(t =>
        t.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.materials.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePriceChange = async (itemId, price, type) => {
        if (!selectedClientId) return;

        try {
            if (type === 'service') {
                await updateClientServicePrice(selectedClientId, itemId, Number(price));
            } else {
                await updateClientTestPrice(selectedClientId, itemId, Number(price));
            }
            toast({
                title: "Price updated",
                description: `Successfully updated price for the client.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update price.",
                variant: "destructive"
            });
        }
    };

    const handleRemovePrice = async (itemId, type) => {
        if (!selectedClientId) return;

        try {
            if (type === 'service') {
                await deleteClientServicePrice(selectedClientId, itemId);
            } else {
                await deleteClientTestPrice(selectedClientId, itemId);
            }
            toast({
                title: "Price removed",
                description: `Client-specific price removed. Default price will be used.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove price.",
                variant: "destructive"
            });
        }
    };

    const getClientPrice = (itemId, type) => {
        if (type === 'service') {
            return clientServicePrices.find(p => p.client_id === selectedClientId && p.service_id === itemId)?.price;
        } else {
            return clientTestPrices.find(p => p.client_id === selectedClientId && p.test_id === itemId)?.price;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                        <Label>Select Client</Label>
                        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a client to manage prices" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.clientName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative">
                        <Label>Search Items</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                className="pl-10"
                                placeholder="Search by name or material..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {!selectedClientId ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
                    <ShieldAlert className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-blue-900 font-semibold text-lg">No Client Selected</h3>
                    <p className="text-blue-600">Please select a client from the dropdown above to manage their specific prices.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Managing Prices for: <span className="text-primary">{selectedClient?.clientName}</span>
                                </h2>
                                <TabsList className="bg-white border border-gray-200">
                                    <TabsTrigger value="services">Services</TabsTrigger>
                                    <TabsTrigger value="tests">Tests</TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <TabsContent value="services" className="p-0 m-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Service Name</th>
                                            <th className="px-6 py-4 font-semibold">Default Price</th>
                                            <th className="px-6 py-4 font-semibold">Price for Client</th>
                                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredServices.map(service => {
                                            const clientPrice = getClientPrice(service.id, 'service');
                                            return (
                                                <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{service.serviceType}</div>
                                                        <div className="text-gray-500 text-xs">HSN: {service.hsnCode}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        ₹{service.price.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 w-48">
                                                        <Input
                                                            type="number"
                                                            placeholder={`₹${service.price}`}
                                                            value={clientPrice ?? ''}
                                                            onChange={(e) => handlePriceChange(service.id, e.target.value, 'service')}
                                                            className={clientPrice ? "border-primary/50 bg-primary/5 shadow-sm" : "border-gray-200"}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {clientPrice && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemovePrice(service.id, 'service')}
                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>

                        <TabsContent value="tests" className="p-0 m-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Test Name & Material</th>
                                            <th className="px-6 py-4 font-semibold">Default Price</th>
                                            <th className="px-6 py-4 font-semibold">Price for Client</th>
                                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredTests.map(test => {
                                            const clientPrice = getClientPrice(test.id, 'test');
                                            return (
                                                <tr key={test.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{test.testType}</div>
                                                        <div className="text-gray-500 text-xs">{test.materials} | HSN: {test.hsnCode}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        ₹{test.price.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 w-48">
                                                        <Input
                                                            type="number"
                                                            placeholder={`₹${test.price}`}
                                                            value={clientPrice ?? ''}
                                                            onChange={(e) => handlePriceChange(test.id, e.target.value, 'test')}
                                                            className={clientPrice ? "border-primary/50 bg-primary/5 shadow-sm" : "border-gray-200"}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {clientPrice && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemovePrice(test.id, 'test')}
                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
};

export default AdminClientPricingManager;
