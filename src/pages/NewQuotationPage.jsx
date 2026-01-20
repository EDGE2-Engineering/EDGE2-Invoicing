
import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Plus, Trash2, Printer, FileText, ArrowLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useServices } from '@/contexts/ServicesContext';
import { useTests } from '@/contexts/TestsContext';
import { useClients } from '@/contexts/ClientsContext';
import { useSettings } from '@/contexts/SettingsContext';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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
import ReactSelect from 'react-select';
import { Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';

const STORAGE_KEY = 'quotation_draft';

const NewQuotationPage = () => {
    const { services } = useServices();
    const { tests } = useTests();
    const { clients } = useClients();
    const { settings } = useSettings();

    const taxCGST = settings?.tax_cgst ? Number(settings.tax_cgst) : 9;
    const taxSGST = settings?.tax_sgst ? Number(settings.tax_sgst) : 9;
    const taxTotalPercent = taxCGST + taxSGST;

    // Load initial state from localStorage
    const loadSavedState = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    quoteDetails: parsed.quoteDetails || {
                        clientName: '',
                        clientAddress: '',
                        contractorName: '',
                        contractorAddress: '',
                        projectName: '',
                        projectAddress: '',
                        email: '',
                        phone: '',
                        date: format(new Date(), 'yyyy-MM-dd'),
                        quoteNumber: `EESPIL/${Math.floor(Math.random() * 10000).toString().padStart(6, '0')}`
                    },
                    items: parsed.items || [],
                    documentType: parsed.documentType || 'Quotation',
                    discount: parsed.discount || 0
                };
            }
        } catch (error) {
            console.error('Error loading saved quotation:', error);
        }
        return {
            quoteDetails: {
                clientName: '',
                clientAddress: '',
                contractorName: '',
                contractorAddress: '',
                projectName: '',
                projectAddress: '',
                email: '',
                phone: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                quoteNumber: `EESPIL/${Math.floor(Math.random() * 10000).toString().padStart(6, '0')}`
            },
            items: [],
            documentType: 'Quotation',
            discount: 0
        };
    };

    const initialState = loadSavedState();

    const [quoteDetails, setQuoteDetails] = useState(initialState.quoteDetails);
    const [items, setItems] = useState(initialState.items);
    const [newItemType, setNewItemType] = useState('service'); // 'service' or 'test'
    const [selectedItemId, setSelectedItemId] = useState('');
    const [qty, setQty] = useState(1);
    const [documentType, setDocumentType] = useState(initialState.documentType); // 'Tax Invoice' or 'Quotation'
    const [discount, setDiscount] = useState(initialState.discount);
    const [comboboxOpen, setComboboxOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [clientNameSelection, setClientNameSelection] = useState(''); // Predefined client or 'Other'
    const [customClientName, setCustomClientName] = useState('');

    // Generate client options from loaded clients
    const CLIENT_OPTIONS = [
        ...(clients || []).map(client => ({
            value: client.clientName,
            label: client.clientName
        })),
        { value: 'Other', label: 'Other' }
    ];

    // Save to localStorage whenever items, quoteDetails, documentType, or discount changes
    useEffect(() => {
        const stateToSave = {
            quoteDetails,
            items,
            documentType,
            discount
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [items, quoteDetails, documentType, discount]);

    // Reset selection and search when switching between Service and Test
    useEffect(() => {
        setSelectedItemId('');
        setSearchValue('');
    }, [newItemType]);

    const handleClear = () => {
        setQuoteDetails({
            clientName: '',
            clientAddress: '',
            contractorName: '',
            contractorAddress: '',
            projectName: '',
            projectAddress: '',
            email: '',
            phone: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            quoteNumber: `EESPIL/${Math.floor(Math.random() * 10000).toString().padStart(6, '0')}`
        });
        setItems([]);
        setDocumentType('Quotation');
        setDiscount(0);
        setSelectedItemId('');
        setQty(1);
        setClientNameSelection('');
        setCustomClientName('');
        localStorage.removeItem(STORAGE_KEY);
        setClearDialogOpen(false);
    };

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${documentType}_${quoteDetails.quoteNumber}`,
    });

    const handleAddItem = () => {
        if (!selectedItemId) return;

        let itemData;
        let description = '';
        let price = 0;
        let unit = 'Nos';

        if (newItemType === 'service') {
            itemData = services.find(s => s.id === selectedItemId);
            if (itemData) {
                description = itemData.serviceType;
                price = itemData.price;
                unit = itemData.unit || 'Nos';
            }
        } else {
            itemData = tests.find(t => t.id === selectedItemId);
            if (itemData) {
                description = `${itemData.testType} - ${itemData.materials}`;
                price = itemData.price;
                unit = 'Test';
            }
        }

        if (itemData) {
            setItems(prev => [...prev, {
                id: Date.now(), // unique ID for row
                sourceId: selectedItemId,
                type: newItemType,
                description,
                unit,
                price: Number(price),
                qty: Number(qty),
                total: Number(price) * Number(qty),
                hsnCode: itemData.hsnCode || '',
                // Include new service fields if it's a service
                ...(newItemType === 'service' && itemData ? {
                    methodOfSampling: itemData.methodOfSampling || itemData.method_of_sampling || 'NA',
                    numBHs: itemData.numBHs ?? itemData.num_bhs ?? 0,
                    measure: itemData.measure || 'NA'
                } : {})
            }]);

            // Reset selection
            setSelectedItemId('');
            setQty(1);
        }
    };

    const handleDeleteItem = (rowId) => {
        setItems(prev => prev.filter(item => item.id !== rowId));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    // Dynamic pagination: Split items across pages
    const ITEMS_PER_FIRST_PAGE = 5; // Very conservative - first page has header, client details, totals, bank details, payment terms
    const ITEMS_PER_CONTINUATION_PAGE = 6; // Continuation pages have more space (just header + table)

    const paginateItems = () => {
        const pages = [];

        if (items.length === 0) {
            // No items, just show the main page
            pages.push({
                items: [],
                pageNumber: 1,
                isFirstPage: true,
                isContinuation: false
            });
        } else if (items.length <= ITEMS_PER_FIRST_PAGE) {
            // All items fit on first page
            pages.push({
                items: items,
                pageNumber: 1,
                isFirstPage: true,
                isContinuation: false
            });
        } else {
            // Need multiple pages
            // First page
            pages.push({
                items: items.slice(0, ITEMS_PER_FIRST_PAGE),
                pageNumber: 1,
                isFirstPage: true,
                isContinuation: false
            });

            // Continuation pages
            let remainingItems = items.slice(ITEMS_PER_FIRST_PAGE);
            let pageNum = 2;

            while (remainingItems.length > 0) {
                const pageItems = remainingItems.slice(0, ITEMS_PER_CONTINUATION_PAGE);
                pages.push({
                    items: pageItems,
                    pageNumber: pageNum,
                    isFirstPage: false,
                    isContinuation: true
                });
                remainingItems = remainingItems.slice(ITEMS_PER_CONTINUATION_PAGE);
                pageNum++;
            }
        }

        return pages;
    };

    const itemPages = paginateItems();
    const totalQuotationPages = itemPages.length;
    const STATIC_PAGES_COUNT = 2; // Terms & Conditions + Technicals
    const totalPages = totalQuotationPages + STATIC_PAGES_COUNT;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-1xl font-bold text-gray-900">Create new {documentType}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setClearDialogOpen(true)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                            <X className="w-4 h-4 mr-2" /> Clear
                        </Button>
                        <Button onClick={handlePrint} className="bg-primary hover:bg-primary-dark">
                            <Printer className="w-4 h-4 mr-2" /> Print / PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Editor */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Client Details Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="mb-4">
                                <Label>Document Type</Label>
                                <Select value={documentType} onValueChange={setDocumentType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tax Invoice">Tax Invoice</SelectItem>
                                        <SelectItem value="Quotation">Quotation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 gap-4 mb-4">
                                <div>
                                    <Label>{documentType} Number</Label>
                                    <Input
                                        value={quoteDetails.quoteNumber}
                                        onChange={e => setQuoteDetails({ ...quoteDetails, quoteNumber: e.target.value })}
                                        placeholder="Enter number"
                                    />
                                </div>
                            </div>
                            {/* <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-primary" />
                                Client Details
                            </h2> */}
                            <div className="space-y-4 border-t pt-2">
                                <div>
                                    <Label>Client Name</Label>
                                    <Select
                                        value={clientNameSelection}
                                        onValueChange={(value) => {
                                            setClientNameSelection(value);
                                            if (value !== 'Other') {
                                                const selectedClient = clients.find(c => c.clientName === value);
                                                setQuoteDetails({
                                                    ...quoteDetails,
                                                    clientName: value,
                                                    clientAddress: selectedClient?.clientAddress || '',
                                                    email: selectedClient?.email || '',
                                                    phone: selectedClient?.phone || ''
                                                });
                                                setCustomClientName('');
                                            } else {
                                                setQuoteDetails({
                                                    ...quoteDetails,
                                                    clientName: customClientName,
                                                    clientAddress: '',
                                                    email: '',
                                                    phone: ''
                                                });
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CLIENT_OPTIONS.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {clientNameSelection === 'Other' && (
                                        <Input
                                            className="mt-2"
                                            value={customClientName}
                                            onChange={e => {
                                                setCustomClientName(e.target.value);
                                                setQuoteDetails({ ...quoteDetails, clientName: e.target.value });
                                            }}
                                            placeholder="Enter custom client name"
                                        />
                                    )}
                                </div>
                                <div>
                                    <Label>Client Address</Label>
                                    <Input
                                        value={quoteDetails.clientAddress}
                                        onChange={e => setQuoteDetails({ ...quoteDetails, clientAddress: e.target.value })}
                                        placeholder="Enter client address"
                                    />
                                </div>
                                <div className="pt-2 border-t">
                                    <Label>Contractor Name</Label>
                                    <Input
                                        value={quoteDetails.contractorName}
                                        onChange={e => setQuoteDetails({ ...quoteDetails, contractorName: e.target.value })}
                                        placeholder="Enter contractor name"
                                    />
                                </div>
                                <div>
                                    <Label>Contractor Address</Label>
                                    <Input
                                        value={quoteDetails.contractorAddress}
                                        onChange={e => setQuoteDetails({ ...quoteDetails, contractorAddress: e.target.value })}
                                        placeholder="Enter contractor address"
                                    />
                                </div>
                                <div className="pt-2 border-t">
                                    <Label>Project Name</Label>
                                    <Input
                                        value={quoteDetails.projectName}
                                        onChange={e => setQuoteDetails({ ...quoteDetails, projectName: e.target.value })}
                                        placeholder="Enter project name"
                                    />
                                </div>
                                <div>
                                    <Label>Project Address</Label>
                                    <Input
                                        value={quoteDetails.projectAddress}
                                        onChange={e => setQuoteDetails({ ...quoteDetails, projectAddress: e.target.value })}
                                        placeholder="Enter project address"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label>Email Address</Label>
                                        <Input
                                            value={quoteDetails.email}
                                            onChange={e => setQuoteDetails({ ...quoteDetails, email: e.target.value })}
                                            placeholder="client@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label>Phone Number</Label>
                                        <Input
                                            value={quoteDetails.phone}
                                            onChange={e => setQuoteDetails({ ...quoteDetails, phone: e.target.value })}
                                            placeholder="Enter phone"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Date</Label>
                                        <Input
                                            className="text-center"
                                            type="date"
                                            value={quoteDetails.date}
                                            onChange={e => setQuoteDetails({ ...quoteDetails, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Discount (%)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={discount}
                                            onChange={e => setDiscount(Number(e.target.value))}
                                            placeholder="Enter discount %"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add Item Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <Plus className="w-5 h-5 mr-2 text-primary" />
                                Add Item
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant={newItemType === 'service' ? 'default' : 'outline'}
                                        onClick={() => { setNewItemType('service'); setSelectedItemId(''); }}
                                        className="w-full"
                                    >
                                        Service
                                    </Button>
                                    <Button
                                        variant={newItemType === 'test' ? 'default' : 'outline'}
                                        onClick={() => { setNewItemType('test'); setSelectedItemId(''); }}
                                        className="w-full"
                                    >
                                        Test
                                    </Button>
                                </div>

                                <div>
                                    <Label>Select {newItemType === 'service' ? 'Service' : 'Test'}</Label>
                                    <ReactSelect
                                        className="mt-1"
                                        classNamePrefix="react-select"
                                        options={newItemType === 'service'
                                            ? services.map(s => ({ value: s.id, label: s.serviceType }))
                                            : tests.map(t => ({ value: t.id, label: `${t.testType} - ${t.materials}` }))
                                        }
                                        value={selectedItemId ? {
                                            value: selectedItemId,
                                            label: newItemType === 'service'
                                                ? services.find(s => s.id === selectedItemId)?.serviceType
                                                : tests.find(t => t.id === selectedItemId)?.testType + ' - ' + tests.find(t => t.id === selectedItemId)?.materials + ''
                                        } : null}
                                        onChange={(option) => setSelectedItemId(option ? option.value : '')}
                                        placeholder={`Search ${newItemType}s...`}
                                        isSearchable
                                        isClearable
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: '#e5e7eb',
                                                borderRadius: '0.75rem',
                                                paddingTop: '2px',
                                                paddingBottom: '2px',
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    borderColor: '#3b82f6'
                                                }
                                            }),
                                            option: (base, state) => ({
                                                ...base,
                                                backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
                                                color: state.isSelected ? 'white' : '#1f2937',
                                                fontSize: '0.875rem'
                                            })
                                        }}
                                    />
                                </div>

                                <div>
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={qty}
                                        onChange={e => setQty(e.target.value)}
                                    />
                                </div>

                                <Button onClick={handleAddItem} className="w-full" disabled={!selectedItemId}>
                                    Add Item
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="lg:col-span-2">
                        <div className="a4-preview-wrapper rounded-xl border border-gray-100 min-h-[600px] print-container shadow-inner">
                            {/* Printable Area Root */}
                            <div ref={componentRef} id="printable-quote-root">
                                {/* Dynamically render quotation pages based on items */}
                                {itemPages.map((page, pageIndex) => (
                                    <div key={`quote-page-${page.pageNumber}`} className="a4-container" id={pageIndex === 0 ? "printable-quote" : undefined}>
                                        <div className="a4-page-content">
                                            {/* Header - only on first page */}
                                            {page.isFirstPage && (
                                                <>
                                                    <div className="flex justify-between items-start border-b pb-4 mb-2">
                                                        <div className="w-[30%]">
                                                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                                                                {documentType.toUpperCase()}
                                                            </h3>
                                                            <p className="text-gray-500 mt-1 text-xs break-all">
                                                                #{quoteDetails.quoteNumber}
                                                            </p>
                                                            <p className="text-gray-500 mt-1 text-xs">
                                                                Date: {format(new Date(quoteDetails.date), 'dd MMM yyyy')}
                                                            </p>
                                                        </div>

                                                        <div className="w-[70%] flex items-center gap-4 text-right">
                                                            <div className="text-right">
                                                                <h2 className="font-bold text-lg">
                                                                    EDGE2 Engineering Solutions India Pvt. Ltd.
                                                                </h2>
                                                                <p className="text-gray-600 text-xs">
                                                                    Shivaganga Arcade, B35/130, 6th Cross, 6th Block,
                                                                    Vishweshwaraiah Layout, Ullal Upanagar,
                                                                </p>
                                                                <p className="text-gray-600 text-xs">
                                                                    Bangalore - 560056, Karnataka
                                                                </p>
                                                                <p className="text-gray-600 text-xs">
                                                                    <span className="font-bold">PAN:</span> AACCE1702A, <span className="font-bold">GSTIN:</span> 29AACCE1702A1ZD
                                                                </p>
                                                                <p className="text-gray-600 text-xs">
                                                                    <span className="font-bold">Phone:</span> 09448377127 / 09880973810 / 080-50056086
                                                                </p>
                                                                <p className="text-gray-600 text-xs flex justify-end gap-4">
                                                                    <span><span className="font-bold">Email:</span> info@edge2.in</span>
                                                                    <span><span className="font-bold">Website:</span> https://edge2.in</span>
                                                                </p>
                                                            </div>
                                                            <img
                                                                src={`${import.meta.env.BASE_URL}edge2-logo.png`}
                                                                alt="EDGE2 Logo"
                                                                className="w-20 h-20 object-contain"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Client, Contractor, Project Details - 3 Columns */}
                                                    <div className="grid grid-cols-3 gap-6 mb-2 text-sm py-0 border-b">
                                                        {/* Column 1: Client */}
                                                        <div className="space-y-1">
                                                            <h3 className="text-gray-500 font-semibold uppercase tracking-wide border-b pb-1 mb-2">
                                                                Client
                                                            </h3>
                                                            <p className="font-bold text-gray-900 text-xs">{quoteDetails.clientName || 'Client Name'}</p>
                                                            <p className="text-gray-600 whitespace-pre-wrap text-xs">{quoteDetails.clientAddress}</p>
                                                            <p className="text-gray-600 mt-1 text-xs">Email: {quoteDetails.email}</p>
                                                            <p className="text-gray-600 text-xs">Phone: {quoteDetails.phone}</p>
                                                        </div>

                                                        {/* Column 2: Contractor */}
                                                        <div className="space-y-1 border-l pl-6">
                                                            <h3 className="text-gray-500 font-semibold uppercase tracking-wide border-b pb-1 mb-2">
                                                                Contractor
                                                            </h3>
                                                            <p className="font-bold text-gray-900 text-xs">{quoteDetails.contractorName || 'Contractor Name'}</p>
                                                            <p className="text-gray-600 whitespace-pre-wrap text-xs">{quoteDetails.contractorAddress}</p>
                                                        </div>

                                                        {/* Column 3: Project */}
                                                        <div className="space-y-1 border-l pl-6">
                                                            <h3 className="text-gray-500 font-semibold uppercase tracking-wide border-b pb-1 mb-2">
                                                                Project Details
                                                            </h3>
                                                            <p className="font-bold text-gray-900 text-xs">{quoteDetails.projectName || 'Project Name'}</p>
                                                            <p className="text-gray-600 whitespace-pre-wrap text-xs">{quoteDetails.projectAddress}</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Continuation page header */}
                                            {page.isContinuation && (
                                                <div className="border-b pb-3 mb-4">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {documentType} #{quoteDetails.quoteNumber} (Continued)
                                                    </h3>
                                                </div>
                                            )}

                                            {/* Table */}
                                            <table className="w-full mb-8">
                                                <thead>
                                                    <tr className="border-b-2 border-gray-100">
                                                        <th className="text-left py-3 font-semibold text-gray-600 pr-4 text-sm">Description</th>
                                                        <th className="text-right py-3 font-semibold text-gray-600 pr-4 text-sm">Price</th>
                                                        <th className="text-right py-3 font-semibold text-gray-600 pr-4 text-sm">Qty</th>
                                                        <th className="text-right py-3 font-semibold text-gray-600 pr-4 text-sm">Total</th>
                                                        <th className="w-10 print:hidden"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {page.items.map((item) => (
                                                        <tr key={item.id} className="border-b border-gray-50">
                                                            <td className="py-2 text-gray-900">
                                                                <p className="font-medium pr-4 text-sm">{item.description}</p>
                                                                <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                                                                {item.hsnCode && (
                                                                    <p className="text-xs text-gray-500">HSN: {item.hsnCode}</p>
                                                                )}
                                                                {item.type === 'service' && (
                                                                    (() => {
                                                                        const values = [
                                                                            item.methodOfSampling && item.methodOfSampling !== 'NA'
                                                                                ? `Method: ${item.methodOfSampling}`
                                                                                : null,

                                                                            typeof item.numBHs === 'number' && item.numBHs > 0
                                                                                ? `BHs: ${item.numBHs}`
                                                                                : null,

                                                                            item.measure && item.measure !== 'NA'
                                                                                ? `Measure: ${item.measure}`
                                                                                : null
                                                                        ].filter(Boolean);

                                                                        return values.length ? (
                                                                            <p className="mt-1 text-xs text-gray-400">
                                                                                {values.join('   |   ')}
                                                                            </p>
                                                                        ) : null;
                                                                    })()
                                                                )}
                                                            </td>
                                                            <td className="py-2 text-right text-gray-600 pr-4 font-medium text-xs">₹{item.price}</td>
                                                            <td className="py-2 px-2 text-right text-gray-600 pr-4 font-medium text-xs">{item.qty} {item.unit}</td>
                                                            <td className="py-2 text-right text-gray-900 pr-4 font-bold text-xs">₹{item.total.toLocaleString()}</td>
                                                            <td className="text-right print:hidden">
                                                                <button
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                    className="text-red-400 hover:text-red-600 p-1"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {page.items.length === 0 && (
                                                        <tr>
                                                            <td colSpan="5" className="py-8 text-center text-gray-400 italic">
                                                                No items added yet.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>

                                            {/* Footer Totals, Bank Details, Payment Terms - only on last quotation page */}
                                            {pageIndex === itemPages.length - 1 && (
                                                <>
                                                    {/* Footer Totals */}
                                                    <div className="flex justify-end">
                                                        <div className="w-64 space-y-3">
                                                            <div className="flex justify-between text-gray-600 text-sm">
                                                                <span>Subtotal</span>
                                                                <span>₹{calculateTotal().toLocaleString()}</span>
                                                            </div>
                                                            {discount > 0 && (
                                                                <div className="flex justify-between text-green-600 text-sm">
                                                                    <span>Discount ({discount}%)</span>
                                                                    <span>- ₹{(calculateTotal() * (discount / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between text-gray-600 text-sm">
                                                                <span>CGST ({taxCGST}%)</span>
                                                                <span>₹{((calculateTotal() * (1 - discount / 100)) * (taxCGST / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                                            </div>
                                                            <div className="flex justify-between text-gray-600 text-sm">
                                                                <span>SGST ({taxSGST}%)</span>
                                                                <span>₹{((calculateTotal() * (1 - discount / 100)) * (taxSGST / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                                            </div>
                                                            <div className="flex justify-between text-gray-600 text-sm font-medium">
                                                                <span>Total Tax Amount</span>
                                                                <span>₹{((calculateTotal() * (1 - discount / 100)) * (taxTotalPercent / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                                            </div>
                                                            <div className="flex justify-between text-l font-bold text-gray-900 pt-4 border-t border-gray-100">
                                                                <span>Total</span>
                                                                <span>₹{((calculateTotal() * (1 - discount / 100)) * (1 + (taxTotalPercent / 100))).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                                            </div>
                                                        </div>
                                                    </div>


                                                </>
                                            )}

                                        </div>
                                        {/* Page Footer */}
                                        <div className="a4-page-footer">
                                            <span>EDGE2 Engineering Solutions India Pvt. Ltd.</span>
                                            <span>{documentType} #{quoteDetails.quoteNumber} | Page {page.pageNumber} of {totalPages}</span>
                                        </div>
                                    </div>
                                ))}

                                {/* Page 2: Bank */}
                                <div className="a4-container">
                                    <div className="a4-page-content">
                                        <div className="text-center text-gray-500 text-sm">
                                            <div className="text-left text-xs">
                                                <div className="mt-0 pt-2 text-center text-gray-500 text-sm">
                                                    <h2 className="font-semibold text-left">Bank Details</h2>
                                                    <table className="w-full text-left text-sm mt-2 border-collapse">
                                                        <tbody>
                                                            <tr>
                                                                <td className="py-1 font-semibold w-32 align-top">Name:</td>
                                                                <td className="py-1 align-top">Edge2 Engineering Solutions India Pvt. Ltd.</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-1 font-semibold align-top">A/c. No:</td>
                                                                <td className="py-1 align-top">560321000022687</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-1 font-semibold align-top">IFSC Code:</td>
                                                                <td className="py-1 align-top">UBIN0907634</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-1 font-semibold align-top">Branch:</td>
                                                                <td className="py-1 align-top">Bangalore - Peenya</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-1 font-semibold align-top">Bank:</td>
                                                                <td className="py-1 align-top">Union Bank of India</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="mt-6 pt-2 border-t text-center text-gray-500 text-sm">
                                                    <h2 className="font-semibold text-left mb-4"> Payment Terms:	</h2>
                                                    <div className="text-left text-xs">
                                                        <ul className="list-disc">
                                                            <li>Advance Payment of 60% + GST({taxTotalPercent}%) along with Work order as mobilization advance.</li>
                                                            <li>Mobilization of Men and Machines shall be done in 3-5 days after the confirmation of Advance Payment.</li>
                                                            <li>Balance Payment to be done after completion of field work.</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Page Footer */}
                                    <div className="a4-page-footer">
                                        <span>EDGE2 Engineering Solutions India Pvt. Ltd.</span>
                                        <span>{documentType} #{quoteDetails.quoteNumber} | Page {totalQuotationPages + 1} of {totalPages}</span>
                                    </div>
                                </div>

                                {/* Page 2: Terms & Conditions */}
                                <div className="a4-container">
                                    <div className="a4-page-content">
                                        <div className="text-center text-gray-500 text-sm">
                                            <h2 className="font-semibold text-left text-lg mb-4">Terms & Conditions</h2>
                                            <div className="text-left text-xs">
                                                <ul className="list-disc space-y-2">
                                                    <li>You will give free access to our Engineer / Technicians/Machines for carrying out assigned job at your site.</li>
                                                    <li>Borehole location free from underground services shall be provided by you. We are not responsible for any damage to underground services.</li>
                                                    <li>You will provide water for drilling and demostic purpose at site, free of cost.</li>
                                                    <li>We require measurable site layout drawing for Borehole location drawing.</li>
                                                    <li>UDS sampling will be done at every 1.0 m interval below EGL wherever possible, SPT Test will be conducted at every 1.5 m interval, thereafter or change in soil strata. Further sampling and testing will be performed based on the geotechnical attributes of the subsoil with an engineer's judgment appointed from Edge2.</li>
                                                    <li>Drilling in Granite, boulders or gravels will be charged 3000.00 Rs per meter if it occurs at Ground Level. Such strata are challenging to drill and drilling may have to be terminated in some cases, in such scenarios if drilling stops and client wants another borehole to be drilled, It will be charged extra.</li>
                                                    <li>Any quantities exceeding the quantities mentioned above will be subject to additional charges.</li>
                                                    <li>These rates are excluding all bentonite charges &  Steel Casing required for drilling. For the cases of excessive seepage, or borehole collapse the required bentonite and casing will be charged Extra.</li>
                                                    <li>Billing will be made based on actual items involved in drilling and testing as per site conditions.</li>
                                                    <li>The rates quoted in this offer are valid only for the quantum of this scope of quotation. If there is any reduction in the quantity, the rates are subject to an increase accordingly and present quotation stands invalid.</li>
                                                    <li>All the underground utility services shall be checked and marked by the client prior to start of the testing. We shall not be responsible for any damage caused to them during field activity.</li>
                                                    <li>If our men and equipment are idle for want of test location clearance, delays in appropriate permissions, delays in providing execution requisites, delays in payments or delays in providing the requisites in clients scope etc. an idling charge, delay in on ground location of all points etc. of Rs 6500.00 shall pay extra per day per machine.</li>
                                                    <li>Client's site representative shall receive our Engineer at nearest Bus Station so as to avoid delays in search of site location.</li>
                                                    <li>After submission of draft report client will comment on report within 3 days & give confirmation of final report within 5 days of submission of draft report.</li>
                                                    <li>Above quotation is valid for 15 days from date of submission.</li>
                                                    <li>Rates given above will be subjected to appropriate taxes as applicable.</li>
                                                    <li>Above quotation refers to the expenses for the assigned work only. All the other requirements such as entry passes, registrations, barricades, traffic safety cone etc. for our mens to work at site shall be in client scope.  If there are any special safety norms beyond gloves, shoes, and helmets, the client should inform the team in advance.</li>
                                                    <li>We need proper access to site (for mobilization), proper permissions from the authorities for drilling at site, complete locations of drilling on ground as well as on plan well before the commencement of the work and sufficient working space before the commencement of the work.</li>
                                                    <li>If any work at the factory then all the safety norms related documents are arranged by the client.</li>
                                                    <li>Any specific terms or requirements pertaining to COVID 19 shall be readily mentioned in the scope of the work before accepting the quotations. If such requirements are raised after finalization/ at commencement/ during execution of work additional expenses attributed to those will be charged extra.</li>
                                                    <li>Responsibilities pertaining to underground utilities will be borne by the client, and locations of execution shall be chosen by the client accordingly.</li>
                                                    <li>If any objections occur through public or social activities or illegal matters during execution of the work, Edge2 Engineering Solutions India  Pvt. Ltd.  will not be responsible, all the responsibility will be taken by the Client. At the same time similar possibilities shall also be clearly mentioned by the client well before the commencement of work to  Edge2 Engineering Solutions India  Pvt. Ltd., failing to which the client will be responsible for all the losses incurred to men and equipment of Edge2.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Page Footer */}
                                    <div className="a4-page-footer">
                                        <span>EDGE2 Engineering Solutions India Pvt. Ltd.</span>
                                        <span>{documentType} #{quoteDetails.quoteNumber} | Page {totalQuotationPages + 1} of {totalPages}</span>
                                    </div>
                                </div>

                                {/* Page 3: Technicals */}
                                <div className="a4-container">
                                    <div className="a4-page-content">
                                        <div className="text-center text-gray-500 text-sm">
                                            <h2 className="font-semibold text-left text-lg mb-4">Technicals</h2>
                                            <div className="text-left text-xs">
                                                <ul className="list-disc space-y-2">
                                                    <li>All the field investigation work will be carried out as per IS1892:1979 and relevant Indian Standards.</li>
                                                    <li>Boring / drilling in all kinds of soils will be carried out , the diameter of borehole shall be min 150/100 mm.</li>
                                                    <li>The standard penetrations tests will be conducted as per IS 2131-1981 at depths 1.0/1.5 intervals</li>
                                                    <li>The Undisturbed / Disturebed soil will be taken at every 1.0/1.5m or at wherever strata changes by using 100 mm diameter, 400 mm long thin walled Shellby tubes.  The ends of the tubes shall be sealed with wax  and marked properly.  If UDS is not obtained due to hard strata or sandy strata, the same is  replaced by SPT.  The depth at which UDS collected and nos. of samples collected shall be recorded in borelogs.</li>
                                                    <li>Bulk disturbed samples will be collected wherever UDS cannot be taken at every 1.0 m/1.5m intervals or wherever change of strata is encountered.</li>
                                                    <li>The standing water table level (if encountered) and location cordinates will be recorded during field investigations in  the bore logs.</li>
                                                    <li>The laboratory tests will be carried out as per relevant IS codes.</li>
                                                    <li>Submission of technical report: The technical report will be submitted including detailed borelogs, discussions, recommendations regarding Safe Bearing capacity as per IS 6403 – 1982, IS 8009 Part I – 1980, IS 12070 - 1987</li>
                                                </ul>
                                            </div>
                                            <h2 className="font-semibold text-left text-base mt-6 mb-3">Auger:</h2>
                                            <div className="text-left text-xs">
                                                <ul className="list-disc space-y-2">
                                                    <li>The Undisturbed / Disturebed soil will be taken at every 1.0/1.5m or at wherever strata changes by using 100 mm diameter, 400 mm long thin walled Shellby tubes.  The ends of the tubes shall be sealed with wax  and marked properly.  If UDS is not obtained due to hard strata or sandy strata,the same is  replaced by SPT.  The depth at which UDS collected and nos. of samples collected shall be recorded in borelogs.</li>
                                                    <li>Bulk disturbed samples will be collected wherever UDS cannot be taken at every 1m/1.5m intervals or wherever change of strata is encountered.</li>
                                                    <li>The standing water table level (if encountered) and location cordinates will be recorded during field investigations in the bore logs.</li>
                                                    <li>The laboratory tests will be carried out as per relevant IS codes.</li>
                                                    <li>Submission of technical report.The technical report will be submitted including detailed borelogs, discussions, recommendations regarding Safe Bearing capacity as per IS 6403 – 1982, IS 8009 Part I – 1980, IS 12070 - 1987.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Page Footer */}
                                    <div className="a4-page-footer">
                                        <span>EDGE2 Engineering Solutions India Pvt. Ltd.</span>
                                        <span>{documentType} #{quoteDetails.quoteNumber} | Page {totalQuotationPages + 2} of {totalPages}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Clear Confirmation Dialog */}
            <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-red-600">
                            Clear {documentType}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to clear all items and start a new {documentType.toLowerCase()}?
                            This action cannot be undone and all your current data will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClear} className="bg-red-600 hover:bg-red-700 text-white">
                            Yes, Clear All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default NewQuotationPage;
