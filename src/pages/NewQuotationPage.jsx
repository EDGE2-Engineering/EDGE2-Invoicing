
import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Plus, Trash2, Printer, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useServices } from '@/contexts/ServicesContext';
import { useTests } from '@/contexts/TestsContext';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';

const NewQuotationPage = () => {
    const { services } = useServices();
    const { tests } = useTests();

    const [clientDetails, setClientDetails] = useState({
        name: '',
        company: '',
        address: '',
        email: '',
        phone: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        quoteNumber: `Q-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    });

    const [items, setItems] = useState([]);
    const [newItemType, setNewItemType] = useState('service'); // 'service' or 'test'
    const [selectedItemId, setSelectedItemId] = useState('');
    const [qty, setQty] = useState(1);
    const [documentType, setDocumentType] = useState('Quotation'); // 'Invoice' or 'Quotation'

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
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
                description = `${itemData.testType} (${itemData.materials})`;
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
                total: Number(price) * Number(qty)
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">New Quotation</h1>
                    </div>
                    <Button onClick={handlePrint} className="bg-primary hover:bg-primary-dark">
                        <Printer className="w-4 h-4 mr-2" /> Print / PDF
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Editor */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Client Details Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-primary" />
                                Client Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <Label>Client Name</Label>
                                    <Input
                                        value={clientDetails.name}
                                        onChange={e => setClientDetails({ ...clientDetails, name: e.target.value })}
                                        placeholder="Enter client name"
                                    />
                                </div>
                                <div>
                                    <Label>Company Name</Label>
                                    <Input
                                        value={clientDetails.company}
                                        onChange={e => setClientDetails({ ...clientDetails, company: e.target.value })}
                                        placeholder="Enter company name"
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        value={clientDetails.email}
                                        onChange={e => setClientDetails({ ...clientDetails, email: e.target.value })}
                                        placeholder="client@example.com"
                                    />
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={clientDetails.date}
                                        onChange={e => setClientDetails({ ...clientDetails, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Document Type</Label>
                                    <Select value={documentType} onValueChange={setDocumentType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Invoice">Invoice</SelectItem>
                                            <SelectItem value="Quotation">Quotation</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                    <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={`Choose ${newItemType}...`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {newItemType === 'service'
                                                ? services.map(s => (
                                                    <SelectItem key={s.id} value={s.id}>{s.serviceType}</SelectItem>
                                                ))
                                                : tests.map(t => (
                                                    <SelectItem key={t.id} value={t.id}>{t.testType} ({t.materials})</SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
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
                                    Add to Quote
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[600px] print-container">

                            {/* Printable Area */}
                            <div ref={componentRef} className="p-8 bg-white" id="printable-quote">
                                {/* Header */}
                                <div className="flex justify-between items-start border-b pb-8 mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{documentType.toUpperCase()}</h3>
                                        <p className="text-gray-500 mt-2">#{clientDetails.quoteNumber}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-right">
                                        <div className="text-right">
                                            <h2 className="font-bold text-xl">EDGE2 Engineering Solutions Pvt. Ltd.</h2>
                                            <p className="text-gray-600">Shivaganga Arcade, B35/130, 6th Cross, 6th Block, Vishweshwaraiah Layout, Ullal Upanagar</p>
                                            <p className="text-gray-600">Bangalore - 560056, Karnataka</p>
                                        </div>
                                        <img src="/edge2-logo.png" alt="EDGE2 Logo" className="w-20 h-20 object-contain" />
                                    </div>
                                </div>

                                {/* Bill To */}
                                <div className="mb-8">
                                    <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2">Bill To</h3>
                                    <div className="text-gray-900">
                                        <p className="font-bold text-lg">{clientDetails.name || 'Client Name'}</p>
                                        <p>{clientDetails.company}</p>
                                        <p>{clientDetails.email}</p>
                                        <p className="mt-2 text-sm text-gray-500">Date: {format(new Date(clientDetails.date), 'dd MMM yyyy')}</p>
                                    </div>
                                </div>

                                {/* Table */}
                                <table className="w-full mb-8">
                                    <thead>
                                        <tr className="border-b-2 border-gray-100">
                                            <th className="text-left py-3 font-semibold text-gray-600">Description</th>
                                            <th className="text-right py-3 font-semibold text-gray-600">Price</th>
                                            <th className="text-right py-3 font-semibold text-gray-600">Qty</th>
                                            <th className="text-right py-3 font-semibold text-gray-600">Total</th>
                                            <th className="w-10 print:hidden"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-50">
                                                <td className="py-4 text-gray-900">
                                                    <p className="font-medium">{item.description}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                                                </td>
                                                <td className="py-4 text-right text-gray-600">₹{item.price}</td>
                                                <td className="py-4 text-right text-gray-600">{item.qty} {item.unit}</td>
                                                <td className="py-4 text-right font-medium text-gray-900">₹{item.total.toLocaleString()}</td>
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
                                        {items.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-gray-400 italic">
                                                    No items added yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Footer Totals */}
                                <div className="flex justify-end">
                                    <div className="w-64 space-y-3">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>₹{calculateTotal().toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tax (18%)</span>
                                            <span>₹{(calculateTotal() * 0.18).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t border-gray-100">
                                            <span>Total</span>
                                            <span>₹{(calculateTotal() * 1.18).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
                                    <p>Thank you for your business!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default NewQuotationPage;
