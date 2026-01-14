
import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Save, Search, Image as ImageIcon, Download, Upload, AlertCircle } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import ImageUploader from './ImageUploader';

const AdminProductsManager = () => {
    const { products, updateProduct, addProduct, deleteProduct, setProducts } = useProducts();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, productId: null, productTitle: '' });
    const fileImportRef = useRef(null);

    const filteredProducts = products.filter(p =>
        (p.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.id?.toString().toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleEdit = (product) => {
        setEditingProduct({
            ...product,
            images: product.images || []
        });
        setIsAddingNew(false);
    };

    const handleAddNew = () => {
        setEditingProduct({
            title: '',
            category: 'Ghee',
            price: 0,
            weight: '',
            stock: 0,
            description: '',
            ingredients: '',
            benefits: '',
            status: 'In Stock',
            images: [],
            featured: false
        });
        setIsAddingNew(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (isAddingNew) {
                await addProduct(editingProduct);
                toast({ title: "Product Added", description: "New product has been created." });
            } else {
                await updateProduct(editingProduct);
                toast({ title: "Changes Saved", description: "Product details updated successfully." });
            }
            setEditingProduct(null);
            setIsAddingNew(false);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save product. Please try again.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (product) => {
        setDeleteConfirmation({
            isOpen: true,
            productId: product.id,
            productTitle: product.title
        });
    };

    const confirmDelete = async () => {
        if (deleteConfirmation.productId) {
            await deleteProduct(deleteConfirmation.productId);
            toast({ title: "Product Deleted", description: "The product has been removed.", variant: "destructive" });
        }
        setDeleteConfirmation({ isOpen: false, productId: null, productTitle: '' });
    };

    const handleChange = (field, value) => {
        setEditingProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(products, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: "Export Successful", description: "Backup downloaded." });
    };

    const handleImportClick = () => {
        if (window.confirm("Warning: Importing data will OVERWRITE all current products. This cannot be undone. Do you want to continue?")) {
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
                    setProducts(importedData);
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

    const categories = ['Ghee', 'Honey', 'Oil', 'Sweeteners', 'Spices', 'Other'];

    if (editingProduct) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm animate-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold">{isAddingNew ? 'Add New Report' : 'Edit Report'}</h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setEditingProduct(null)} disabled={isSaving}>
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

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="mb-6 bg-gray-100 p-1 flex-wrap h-auto">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="images">Images</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Report Title</Label>
                                <Input value={editingProduct.title} onChange={(e) => handleChange('title', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={editingProduct.category} onValueChange={(val) => handleChange('category', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Price (₹)</Label>
                                <Input
                                    type="number"
                                    value={editingProduct.price}
                                    onChange={(e) => handleChange('price', Number(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Weight/Volume</Label>
                                <Input value={editingProduct.weight} onChange={(e) => handleChange('weight', e.target.value)} placeholder="e.g. 500ml, 1kg" />
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={editingProduct.status} onValueChange={(val) => handleChange('status', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="In Stock">In Stock</SelectItem>
                                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 flex items-center pt-8">
                                <Checkbox
                                    id="featured"
                                    checked={editingProduct.featured}
                                    onCheckedChange={(checked) => handleChange('featured', checked)}
                                />
                                <label htmlFor="featured" className="ml-2 text-sm font-medium">Featured Report</label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={editingProduct.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                        <div className="space-y-2">
                            <Label>Ingredients</Label>
                            <Textarea
                                value={editingProduct.ingredients || ''}
                                onChange={(e) => handleChange('ingredients', e.target.value)}
                                placeholder="List ingredients here..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Benefits</Label>
                            <Textarea
                                value={editingProduct.benefits || ''}
                                onChange={(e) => handleChange('benefits', e.target.value)}
                                placeholder="Health benefits..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Stock Quantity</Label>
                            <Input
                                type="number"
                                value={editingProduct.stock}
                                onChange={(e) => handleChange('stock', Number(e.target.value))}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="images">
                        <div className="space-y-4">
                            <div className="p-4 border rounded bg-gray-50">
                                <h3 className="font-semibold mb-2">Report Images</h3>
                                <p className="text-sm text-gray-500 mb-4">Upload images for this report.</p>
                                <ImageUploader
                                    images={editingProduct.images}
                                    onImagesChange={(newImages) => handleChange('images', newImages)}
                                    multiple={true}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search reports..."
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
                        <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Report</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600 hidden md:table-cell">Price</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                            <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded bg-gray-200 mr-3 overflow-hidden flex-shrink-0">
                                            {product.images && product.images[0] ? (
                                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-4 h-4" /></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 line-clamp-1">{product.title}</p>
                                            <p className="text-xs text-gray-500">{product.category}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-gray-700 hidden md:table-cell">₹{product.price.toLocaleString()}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                            <Edit className="w-4 h-4 text-gray-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmation({ isOpen: false, productId: null, productTitle: '' })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-red-600">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Delete Report?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirmation.productTitle}</span>?
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

export default AdminProductsManager;
