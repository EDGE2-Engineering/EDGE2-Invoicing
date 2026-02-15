import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Save, Search, Download, Upload, AlertCircle, Mail, Phone } from 'lucide-react';
import { useClients } from '@/contexts/ClientsContext';
import { useAuth } from '@/contexts/AuthContext';
import { sendTelegramNotification } from '@/lib/notifier';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
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

const AdminClientsManager = () => {
    const { clients, updateClient, addClient, deleteClient, setClients } = useClients();
    const { user } = useAuth();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingClient, setEditingClient] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, clientId: null, clientName: '' });
    const fileImportRef = useRef(null);

    const filteredClients = (clients || []).filter(c =>
        (c.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.clientAddress?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.id?.toString().toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleEdit = (client) => {
        setEditingClient({ ...client });
        setIsAddingNew(false);
    };

    const handleAddNew = () => {
        setEditingClient({
            clientName: '',
            clientAddress: '',
            email: '',
            phone: ''
        });
        setIsAddingNew(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (isAddingNew) {
                await addClient(editingClient);
                toast({ title: "Client Added", description: "New client has been successfully added." });

                // Telegram Notification
                const message = `👥 *New Client Added*\n\nName: \`${editingClient.clientName}\`\nAdded By: \`${user?.fullName || 'Unknown'}\``;
                sendTelegramNotification(message);
            } else {
                await updateClient(editingClient);
                toast({ title: "Client Updated", description: "Client details have been updated." });

                // Telegram Notification
                const message = `✏️ *Client Updated*\n\nName: \`${editingClient.clientName}\`\nUpdated By: \`${user?.fullName || 'Unknown'}\``;
                sendTelegramNotification(message);
            }
            setEditingClient(null);
            setIsAddingNew(false);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save client. " + error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (client) => {
        setDeleteConfirmation({
            isOpen: true,
            clientId: client.id,
            clientName: client.clientName
        });
    };

    const confirmDelete = async () => {
        if (deleteConfirmation.clientId) {
            try {
                await deleteClient(deleteConfirmation.clientId);
                toast({ title: "Client Deleted", description: "The client has been removed.", variant: "destructive" });

                // Telegram Notification
                const message = `🗑️ *Client Deleted*\n\nName: \`${deleteConfirmation.clientName}\`\nDeleted By: \`${user?.fullName || 'Unknown'}\``;
                sendTelegramNotification(message);
            } catch (error) {
                console.error(error);
                toast({ title: "Error", description: "Failed to delete client: " + error.message, variant: "destructive" });
            }
        }
        setDeleteConfirmation({ isOpen: false, clientId: null, clientName: '' });
    };

    const handleChange = (field, value) => {
        setEditingClient(prev => ({ ...prev, [field]: value }));
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(clients, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `clients_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: "Export Successful", description: "Backup downloaded." });
    };

    const handleImportClick = () => {
        if (window.confirm("Warning: Importing data will OVERWRITE all current clients. This cannot be undone. Do you want to continue?")) {
            fileImportRef.current?.click();
        }
    };

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (Array.isArray(importedData)) {
                    setClients(importedData);
                    // Also update localStorage immediately
                    localStorage.setItem('clients', JSON.stringify(importedData));
                    toast({ title: "Import Successful", description: `Imported ${importedData.length} clients.` });
                } else {
                    toast({ title: "Import Failed", description: "Invalid JSON format: Expected an array.", variant: "destructive" });
                }
            } catch (error) {
                console.error("Import error:", error);
                toast({ title: "Import Failed", description: "Could not parse JSON file.", variant: "destructive" });
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    };

    if (editingClient) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm animate-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold">{isAddingNew ? 'Add New Client' : 'Edit Client'}</h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setEditingClient(null)} disabled={isSaving}>
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

                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label>Client Name</Label>
                        <Textarea
                            rows={2}
                            value={editingClient.clientName || ''}
                            onChange={(e) => handleChange('clientName', e.target.value)}
                            placeholder="Enter client name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Textarea
                            rows={2}
                            value={editingClient.clientAddress || ''}
                            onChange={(e) => handleChange('clientAddress', e.target.value)}
                            placeholder="Enter client address"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={editingClient.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="Enter email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={editingClient.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="Enter phone"
                            />
                        </div>
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
                        placeholder="Search Clients..."
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
                        <Plus className="w-4 h-4 mr-2" /> Add Client
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Client Name</th>
                            <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.length > 0 ? (
                            filteredClients.map((client) => (
                                <tr key={client.id} className="border-b hover:bg-gray-50 transition-colors">

                                    {/* Single content column */}
                                    <td className="py-3 px-4">
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                                            <p className="font-semibold text-gray-900">
                                                {client.clientName}
                                            </p>
                                            <div className="w-full"></div>
                                            <p className="" title={client.clientAddress}>
                                                <span className="font-semibold text-gray-900">Address:</span>{' '}
                                                {client.clientAddress}
                                            </p>
                                            <div className="w-full"></div>
                                            <p className="flex items-center">
                                                <Mail className="w-4 h-4 mr-2 text-blue-500" />
                                                <span className="font-semibold text-gray-900 mr-1">Email:</span>
                                                {client.email}
                                            </p>
                                            <div className="w-full"></div>
                                            <p className="flex items-center">
                                                <Phone className="w-4 h-4 mr-2 text-green-500" />
                                                <span className="font-semibold text-gray-900 mr-1">Phone:</span>
                                                {client.phone}
                                            </p>

                                        </div>
                                    </td>

                                    {/* Actions column */}
                                    <td className="py-1 px-1 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                                                <Edit className="w-4 h-4 text-gray-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(client)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="py-8 text-center text-gray-500">
                                    {searchTerm
                                        ? 'No clients found matching your search.'
                                        : 'No clients added yet.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmation({ isOpen: false, clientId: null, clientName: '' })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-red-600">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Delete Client?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirmation.clientName}</span>?
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

export default AdminClientsManager;
