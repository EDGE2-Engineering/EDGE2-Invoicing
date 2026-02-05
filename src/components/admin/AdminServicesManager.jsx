
import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Save, Search, Download, Upload, AlertCircle } from 'lucide-react';
import { useServices } from '@/contexts/ServicesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminServicesManager = () => {
    const { services, updateService, addService, deleteService, setServices } = useServices();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingService, setEditingService] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, serviceId: null, serviceType: '' });
    const fileImportRef = useRef(null);

    const filteredServices = services.filter(s =>
        (s.serviceType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.price?.toString() || '').includes(searchTerm) ||
        (s.hsnCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.id?.toString().toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleEdit = (service) => {
        setEditingService({ ...service });
        setIsAddingNew(false);
    };

    const handleAddNew = () => {
        setEditingService({
            serviceType: '',
            price: 0,
            unit: '',
            qty: 1,
            methodOfSampling: 'NA',
            numBHs: 0,
            measure: 'NA',
            hsnCode: ''
        });
        setIsAddingNew(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (isAddingNew) {
                await addService(editingService);
                toast({ title: "Service Added", description: "New service has been created." });
            } else {
                await updateService(editingService);
                toast({ title: "Changes Saved", description: "Service details updated successfully." });
            }
            setEditingService(null);
            setIsAddingNew(false);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save service. " + error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (service) => {
        setDeleteConfirmation({
            isOpen: true,
            serviceId: service.id,
            serviceType: service.serviceType
        });
    };

    const confirmDelete = async () => {
        if (deleteConfirmation.serviceId) {
            await deleteService(deleteConfirmation.serviceId);
            toast({ title: "Service Deleted", description: "The service has been removed.", variant: "destructive" });
        }
        setDeleteConfirmation({ isOpen: false, serviceId: null, serviceType: '' });
    };

    const handleChange = (field, value) => {
        setEditingService(prev => ({ ...prev, [field]: value }));
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(services, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `services_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: "Export Successful", description: "Backup downloaded." });
    };

    const handleImportClick = () => {
        if (window.confirm("Warning: Importing data will OVERWRITE all current services. This cannot be undone. Do you want to continue?")) {
            fileImportRef.current?.click();
        }
    };

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (Array.isArray(importedData)) {
                    setServices(importedData);
                    toast({
                        title: "Import Loaded",
                        description: "Data loaded. Save individual changes to persist.",
                    });
                }
            } catch (err) {
                console.error(err);
                toast({ title: "Import Failed", variant: "destructive" });
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    if (editingService) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm animate-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold">{isAddingNew ? 'Add New Service' : 'Edit Service'}</h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setEditingService(null)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-primary hover:bg-primary-dark flex items-center text-white"
                            disabled={isSaving}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Service Type</Label>
                        <Input
                            value={editingService.serviceType}
                            onChange={(e) => handleChange('serviceType', e.target.value)}
                            placeholder="e.g. Drilling Upto 10m"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Price (₹)</Label>
                        <Input
                            type="number"
                            value={editingService.price}
                            onChange={(e) => handleChange('price', Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Unit</Label>
                        <Input
                            value={editingService.unit}
                            onChange={(e) => handleChange('unit', e.target.value)}
                            placeholder="e.g. Per Metre"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Quantity (Default)</Label>
                        <Input
                            type="number"
                            value={editingService.qty}
                            onChange={(e) => handleChange('qty', Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Method of Sampling</Label>
                        <Select
                            value={editingService.methodOfSampling || 'NA'}
                            onValueChange={(value) => handleChange('methodOfSampling', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Rotary">Rotary</SelectItem>
                                <SelectItem value="Hydraulic">Hydraulic</SelectItem>
                                <SelectItem value="Calyx">Calyx</SelectItem>
                                <SelectItem value="NA">NA</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Number of BHs</Label>
                        <Input
                            type="number"
                            min="0"
                            value={editingService.numBHs ?? 0}
                            onChange={(e) => handleChange('numBHs', Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Measure</Label>
                        <Select
                            value={editingService.measure || 'NA'}
                            onValueChange={(value) => handleChange('measure', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select measure" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Per BH">Per BH</SelectItem>
                                <SelectItem value="Per Sample">Per Sample</SelectItem>
                                <SelectItem value="NA">NA</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>HSN Code</Label>
                        <Input
                            value={editingService.hsnCode || ''}
                            onChange={(e) => handleChange('hsnCode', e.target.value)}
                            placeholder="e.g. 998346"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search services..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <input
                        type="file"
                        ref={fileImportRef}
                        onChange={handleImportFile}
                        accept=".json"
                        className="hidden"
                    />
                    <Button variant="outline" onClick={handleImportClick} className="flex-1 sm:flex-none border-gray-300">
                        <Upload className="w-4 h-4 mr-2" /> Import
                    </Button>
                    <Button variant="outline" onClick={handleExport} className="flex-1 sm:flex-none border-gray-300">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button onClick={handleAddNew} className="flex-1 sm:flex-none bg-primary hover:bg-primary-dark text-white">
                        <Plus className="w-4 h-4 mr-2" /> Add Service
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Service Type</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Price</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Unit</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Method</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600"># BHs</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Measure</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">HSN Code</th>
                            <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServices.map((service) => (
                            <tr key={service.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                    <p className="font-small text-sm text-gray-900">{service.serviceType}</p>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">₹{service.price.toLocaleString()}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{service.unit}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{service.methodOfSampling || 'NA'}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{service.numBHs ?? 0}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{service.measure || 'NA'}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{service.hsnCode || '-'}</td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                                            <Edit className="w-4 h-4 text-gray-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(service)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmation({ isOpen: false, serviceId: null, serviceType: '' })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-red-600">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Delete Service?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirmation.serviceType}</span>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Yes, Delete It
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminServicesManager;
