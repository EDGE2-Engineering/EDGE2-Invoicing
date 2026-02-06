
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const SavedRecordsManager = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [filterDocType, setFilterDocType] = useState('all');
    const [filterUser, setFilterUser] = useState('all');
    const [filterClient, setFilterClient] = useState('all');
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

    const uniqueUsers = Array.from(new Set(records
        .map(r => r.app_users?.full_name)
        .filter(Boolean)))
        .sort();

    const uniqueClients = Array.from(new Set(records
        .map(r => r.client_name)
        .filter(Boolean)))
        .sort();

    const filteredRecords = records.filter(r => {
        const matchesSearch = (r.quote_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (r.client_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (r.document_type?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Document Type Filter
        if (filterDocType !== 'all' && r.document_type !== filterDocType) return false;

        // User Filter
        if (filterUser !== 'all' && r.app_users?.full_name !== filterUser) return false;

        // Client Filter
        if (filterClient !== 'all' && r.client_name !== filterClient) return false;

        if (fromDate || toDate) {
            const recordDate = new Date(r.created_at);
            recordDate.setHours(0, 0, 0, 0);

            if (fromDate) {
                const start = new Date(fromDate);
                start.setHours(0, 0, 0, 0);
                if (recordDate < start) return false;
            }

            if (toDate) {
                const end = new Date(toDate);
                end.setHours(0, 0, 0, 0);
                if (recordDate > end) return false;
            }
        }

        return true;
    });

    const resetFilters = () => {
        setSearchTerm('');
        setFromDate('');
        setToDate('');
        setFilterDocType('all');
        setFilterUser('all');
        setFilterClient('all');
    };

    if (loading && records.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-gray-500">Loading saved records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Row 1: Search Bar and Total Count */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search by invoice/quote number or client name..."
                        className="pl-10 text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm font-medium text-gray-500">
                    Total: <span className="text-primary">{filteredRecords.length}</span> records
                </div>
            </div>

            {/* Row 2: Advanced Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Apply Filters</span>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dates:</span>
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                className="w-36 h-9 text-xs"
                                value={fromDate}
                                title="From Date"
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                            <span className="text-gray-300">-</span>
                            <Input
                                type="date"
                                className="w-36 h-9 text-xs"
                                value={toDate}
                                title="To Date"
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="h-6 w-px bg-gray-100 hidden sm:block" />

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type:</span>
                        <Select value={filterDocType} onValueChange={setFilterDocType}>
                            <SelectTrigger className="w-36 h-9 text-xs">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Tax Invoice">Tax Invoice</SelectItem>
                                <SelectItem value="Quotation">Quotation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">User:</span>
                        <Select value={filterUser} onValueChange={setFilterUser}>
                            <SelectTrigger className="w-40 h-9 text-xs text-left ">
                                <SelectValue placeholder="All Users" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                {uniqueUsers.map(user => (
                                    <SelectItem key={user} value={user}>{user}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client:</span>
                        <Select value={filterClient} onValueChange={setFilterClient}>
                            <SelectTrigger className="w-80 h-9 text-xs text-left">
                                <SelectValue placeholder="All Clients" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Clients</SelectItem>
                                {uniqueClients.map(client => (
                                    <SelectItem key={client} value={client}>{client}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        disabled={!searchTerm && !fromDate && !toDate && filterDocType === 'all' && filterUser === 'all' && filterClient === 'all'}
                        className="text-gray-500 hover:text-gray-700 h-9 ml-auto"
                    >
                        Reset Filters
                    </Button>
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
