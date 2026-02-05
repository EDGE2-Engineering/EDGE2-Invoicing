
import React, { useState, useEffect } from 'react';
import { Search, Trash2, ExternalLink, FileText, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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

const SavedRecordsManager = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, recordId: null, quoteNumber: '' });
    const { toast } = useToast();
    const navigate = useNavigate();

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('saved_records')
                .select('*, app_users(full_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRecords(data || []);
        } catch (error) {
            console.error('Error fetching records:', error);
            toast({
                title: "Error",
                description: "Failed to load saved records. " + error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleDeleteClick = (record) => {
        setDeleteConfirmation({
            isOpen: true,
            recordId: record.id,
            quoteNumber: record.quote_number
        });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation.recordId) return;

        try {
            const { error } = await supabase
                .from('saved_records')
                .delete()
                .eq('id', deleteConfirmation.recordId);

            if (error) throw error;

            toast({ title: "Record Deleted", description: "The record has been removed.", variant: "destructive" });
            fetchRecords();
        } catch (error) {
            console.error('Error deleting record:', error);
            toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" });
        } finally {
            setDeleteConfirmation({ isOpen: false, recordId: null, quoteNumber: '' });
        }
    };

    const handleOpen = (recordId) => {
        navigate(`/new-quotation?id=${recordId}`);
    };

    const filteredRecords = records.filter(r =>
        (r.quote_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (r.client_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (r.document_type?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (loading && records.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-gray-500">Loading saved records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search by invoice/quote number or client name..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500">
                    Total: {filteredRecords.length} records
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Date</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Document #</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Type</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Created By</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Client</th>
                                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-gray-500">
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {format(new Date(record.created_at), 'dd MMM yyyy')}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-sm text-gray-900">{record.quote_number}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${record.document_type === 'Tax Invoice'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {record.document_type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {record.app_users?.full_name || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {record.client_name || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-primary hover:text-primary-dark hover:bg-primary/10"
                                                    onClick={() => handleOpen(record.id)}
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-1" /> Open
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteClick(record)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmation({ isOpen: false, recordId: null, quoteNumber: '' })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-red-600">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Delete Saved Record?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirmation.quoteNumber}</span>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SavedRecordsManager;
