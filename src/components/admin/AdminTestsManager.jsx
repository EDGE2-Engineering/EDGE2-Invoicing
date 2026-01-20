
import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Save, Search, Download, Upload, AlertCircle } from 'lucide-react';
import { useTests } from '@/contexts/TestsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const AdminTestsManager = () => {
    const { tests, updateTest, addTest, deleteTest, setTests } = useTests();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTest, setEditingTest] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, testId: null, testType: '' });
    const fileImportRef = useRef(null);

    const filteredTests = tests.filter(t =>
        (t.testType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.price?.toString() || '').includes(searchTerm) ||
        (t.hsnCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.group?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.id?.toString().toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleEdit = (test) => {
        setEditingTest({ ...test });
        setIsAddingNew(false);
    };

    const handleAddNew = () => {
        setEditingTest({
            testType: '',
            materials: '',
            group: '',
            testMethodSpecification: '',
            numDays: 0,
            price: 0,
            hsnCode: ''
        });
        setIsAddingNew(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (isAddingNew) {
                await addTest(editingTest);
                toast({ title: "Test Added", description: "New test has been created." });
            } else {
                await updateTest(editingTest);
                toast({ title: "Changes Saved", description: "Test details updated successfully." });
            }
            setEditingTest(null);
            setIsAddingNew(false);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save test. " + error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (test) => {
        setDeleteConfirmation({
            isOpen: true,
            testId: test.id,
            testType: test.testType
        });
    };

    const confirmDelete = async () => {
        if (deleteConfirmation.testId) {
            await deleteTest(deleteConfirmation.testId);
            toast({ title: "Test Deleted", description: "The test has been removed.", variant: "destructive" });
        }
        setDeleteConfirmation({ isOpen: false, testId: null, testType: '' });
    };

    const handleChange = (field, value) => {
        setEditingTest(prev => ({ ...prev, [field]: value }));
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(tests, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tests_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: "Export Successful", description: "Backup downloaded." });
    };

    const handleImportClick = () => {
        if (window.confirm("Warning: Importing data will OVERWRITE all current tests. This cannot be undone. Do you want to continue?")) {
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
                    setTests(importedData);
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

    const groups = ['Physical', 'Chemical'];

    if (editingTest) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm animate-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold">{isAddingNew ? 'Add New Test' : 'Edit Test'}</h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setEditingTest(null)} disabled={isSaving}>
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
                        <Label>Test Type</Label>
                        <Input
                            value={editingTest.testType}
                            onChange={(e) => handleChange('testType', e.target.value)}
                            placeholder="e.g. Organic Impurities Analysis"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Materials</Label>
                        <Input
                            value={editingTest.materials}
                            onChange={(e) => handleChange('materials', e.target.value)}
                            placeholder="e.g. Aggregate (Coarse)"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Group</Label>
                        <Select value={editingTest.group} onValueChange={(val) => handleChange('group', val)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Group" />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Test Method Specification</Label>
                        <Input
                            value={editingTest.testMethodSpecification}
                            onChange={(e) => handleChange('testMethodSpecification', e.target.value)}
                            placeholder="e.g. IS2385 (Part2)"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Num Days</Label>
                        <Input
                            type="number"
                            value={editingTest.numDays}
                            onChange={(e) => handleChange('numDays', Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Price (₹)</Label>
                        <Input
                            type="number"
                            value={editingTest.price}
                            onChange={(e) => handleChange('price', Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>HSN Code</Label>
                        <Input
                            value={editingTest.hsnCode || ''}
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
                        placeholder="Search tests..."
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
                        <Plus className="w-4 h-4 mr-2" /> Add Test
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Test Type</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600 hidden md:table-cell">Materials</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600 hidden md:table-cell">Method</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Price</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">HSN Code</th>
                            <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTests.map((test) => (
                            <tr key={test.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                    <p className="font-medium text-gray-900">{test.testType}</p>
                                    <p className="text-xs text-gray-500 md:hidden">{test.materials}</p>
                                </td>
                                <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{test.materials}</td>
                                <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{test.testMethodSpecification || '-'}</td>
                                <td className="py-3 px-4 text-gray-700">₹{test.price.toLocaleString()}</td>
                                <td className="py-3 px-4 text-gray-600">{test.hsnCode || '-'}</td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(test)}>
                                            <Edit className="w-4 h-4 text-gray-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(test)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmation({ isOpen: false, testId: null, testType: '' })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-red-600">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Delete Test?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirmation.testType}</span>?
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

export default AdminTestsManager;
