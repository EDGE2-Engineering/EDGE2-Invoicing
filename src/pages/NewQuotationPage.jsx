
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
        quoteNumber: `EDGE2-${Math.floor(Math.random() * 10000).toString().padStart(6, '0')}`
    });

    const [items, setItems] = useState([]);
    const [newItemType, setNewItemType] = useState('service'); // 'service' or 'test'
    const [selectedItemId, setSelectedItemId] = useState('');
    const [qty, setQty] = useState(1);
    const [documentType, setDocumentType] = useState('Quotation'); // 'Invoice' or 'Quotation'
    const [discount, setDiscount] = useState(0);

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
                        <h1 className="text-1xl font-bold text-gray-900">New Quotation</h1>
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
                                    <Label>{documentType} Number</Label>
                                    <Input
                                        value={clientDetails.quoteNumber}
                                        onChange={e => setClientDetails({ ...clientDetails, quoteNumber: e.target.value })}
                                        placeholder="Enter number"
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
                                    Add Item
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
                                <div className="flex justify-between items-start border-b pb-4 mb-4">
                                    <div className="w-[20%]">
                                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                            {documentType.toUpperCase()}
                                        </h3>
                                        <p className="text-gray-500 mt-1 text-sm">
                                            #{clientDetails.quoteNumber}
                                        </p>
                                    </div>

                                    <div className="w-[80%] flex items-center gap-4 text-right">
                                        <div className="text-right">
                                            <h2 className="font-bold text-xl">
                                                EDGE2 Engineering Solutions India Pvt. Ltd.
                                            </h2>
                                            <p className="text-gray-600 text-sm">
                                                Shivaganga Arcade, B35/130, 6th Cross, 6th Block,
                                                Vishweshwaraiah Layout, Ullal Upanagar. Bangalore - 560056, Karnataka
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                <span className="font-bold">PAN:</span> AACCE1702A, <span className="font-bold">GSTIN:</span> 29AACCE1702A1ZD
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                <span className="font-bold">Phone:</span> 09448377127 / 09880973810 / 080-50056086
                                            </p>
                                            <p className="text-gray-600 text-sm flex justify-end gap-4">
                                                <span><span className="font-bold">Email:</span> info@edge2.in</span>
                                                <span><span className="font-bold">Website:</span> https://edge2.in</span>
                                            </p>
                                        </div>
                                        <img
                                            src="/edge2-logo.png"
                                            alt="EDGE2 Logo"
                                            className="w-20 h-20 object-contain"
                                        />
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
                                            <th className="text-left py-3 font-semibold text-gray-600 pr-4">Description</th>
                                            <th className="text-right py-3 font-semibold text-gray-600 pr-4">Price</th>
                                            <th className="text-right py-3 font-semibold text-gray-600 pr-4">Qty</th>
                                            <th className="text-right py-3 font-semibold text-gray-600 pr-4">Total</th>
                                            <th className="w-10 print:hidden"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-50">
                                                <td className="py-2 text-gray-900">
                                                    <p className="font-medium pr-4">{item.description}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                                                </td>
                                                <td className="py-2 text-right text-gray-600 pr-4">₹{item.price}</td>
                                                <td className="py-2 px-2 text-right text-gray-600 text-xs pr-4">{item.qty} {item.unit}</td>
                                                <td className="py-2 text-right font-medium text-gray-900 pr-4">₹{item.total.toLocaleString()}</td>
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
                                        {discount > 0 && (
                                            <div className="flex justify-between text-green-600 font-medium">
                                                <span>Discount ({discount}%)</span>
                                                <span>- ₹{(calculateTotal() * (discount / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tax (18%)</span>
                                            <span>₹{((calculateTotal() * (1 - discount / 100)) * 0.18).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t border-gray-100">
                                            <span>Total</span>
                                            <span>₹{((calculateTotal() * (1 - discount / 100)) * 1.18).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-2 border-t text-center text-gray-500 text-sm">
                                    <h2 className="font-semibold text-left">Bank Details:</h2>
                                    <p className="text-left">
                                        <br />
                                        Name: Edge2 Engineering Solutions India Pvt. Ltd.
                                        <br />
                                        A/c. No: 560321000022687
                                        <br />
                                        IFSC Code: UBIN0907634
                                        <br />
                                        Branch: Bangalore- Peenya
                                        <br />
                                        Bank: Union Bank of India	</p>
                                </div>

                                <div className="mt-4 pt-2 border-t text-center text-gray-500 text-sm">
                                    <h2 className="font-semibold text-left"> Payment Terms:	</h2>
                                    <div className="text-left text-xs">
                                        <ul className="list-disc"> 
                                            <li>Advance Payment of 60% + GST(18%) along with Work order as mobilization advance.</li>				
                                            <li>Mobilization of Men and Machines shall be done in 3-5 days after the confirmation of Advance Payment.</li>				
                                            <li>Balance Payment to be done after completion of field work.</li>		
                                        </ul>		
                                    </div>
                                </div>


                                <div className="mt-4 pt-2 border-t text-center text-gray-500 text-sm">
                                    <h2 className="font-semibold text-left"> Terms & Conditions:	</h2>
                                    <div className="text-left text-xs">
                                        <ul className="list-disc"> 			
<li>     You will give free access to our Engineer / Technicians/Machines for carrying out assigned job at your site.		</li>		    
<li> Borehole location free from underground services shall be provided by you. We are not responsible for any   damage to underground services.				
</li>		
<li> You will provide water for drilling and demostic purpose at site, free of cost.				
</li>		
<li> We require measurable site layout drawing for Borehole location drawing.				
</li>		
<li>UDS sampling will be done at every 1.0 m interval below EGL wherever possible, SPT Test will be conducted at every 1.5 m interval, thereafter or change in soil strata. Further sampling and testing will be performed based on the geotechnical attributes of the subsoil with an engineer's judgment appointed from Edge2. 				
</li>				
<li>Drilling in Granite, boulders or gravels will be charged 3000.00 Rs per meter if it occurs at Ground Level. Such strata are challenging to drill and drilling may have to be terminated in some cases, in such scenarios if drilling stops and client wants another borehole to be drilled, It will be charged extra. 				
</li>				
<li>Any quantities exceeding the quantities mentioned above will be subject to additional charges. 				
</li>				
<li>These rates are excluding all bentonite charges &  Steel Casing required for drilling. For the cases of excessive seepage, or borehole collapse the required bentonite and casing will be charged Extra. 				
</li>				
<li>Billing will be made based on actual items involved in drilling and testing as per site conditions.				
</li>				
<li>The rates quoted in this offer are valid only for the quantum of this scope of quotation. If there is any reduction in the quantity, the rates are subject to an increase accordingly and present quotation stands invalid. 				
</li>				
<li>All the underground utility services shall be checked and marked by the client prior to start of the testing. We shall not be responsible for any damage caused to them during field activity.				
</li>				
<li>If our men and equipment are idle for want of test location clearance, delays in appropriate permissions, delays in providing execution requisites, delays in payments or delays in providing the requisites in clients scope etc. an idling charge, delay in on ground location of all points etc. of Rs 6500.00 shall pay extra per day per machine. 				
</li>				
<li>Client’s site representative shall receive our Engineer at nearest Bus Station so as to avoid delays in search of site location. 				
</li>				
<li>After submission of draft report client will comment on report within 3 days & give confirmation of final report within 5 days of submission of draft report. 				
</li>				
<li>Above quotation is valid for 15 days from date of submission.				
</li>				
<li>Rates given above will be subjected to appropriate taxes as applicable.				
</li>				
<li>Above quotation refers to the expenses for the assigned work only. All the other requirements such as entry passes, registrations, barricades, traffic safety cone etc. for our mens to work at site shall be in client scope.  If there are any special safety norms beyond gloves, shoes, and helmets, the client should inform the team in advance. 				
</li>				
<li>We need proper access to site (for mobilization), proper permissions from the authorities for drilling at site, complete locations of drilling on ground as well as on plan well before the commencement of the work and sufficient working space before the commencement of the work. 				
</li>				
<li>If any work at the factory then all the safety norms related documents are arranged by the client. 				
</li>				
<li>Any specific terms or requirements pertaining to COVID 19 shall be readily mentioned in the scope of the work before accepting the quotations. If such requirements are raised after finalization/ at commencement/ during execution of work additional expenses attributed to those will be charged extra. 				
</li>				
<li>Responsibilities pertaining to underground utilities will be borne by the client, and locations of execution shall be chosen by the client accordingly. 				
</li>				
<li>If any objections occur through public or social activities or illegal matters during execution of the work, Edge2 Engineering Solutions India  Pvt. Ltd.  will not be responsible, all the responsibility will be taken by the Client. At the same time similar possibilities shall also be clearly mentioned by the client well before the commencement of work to  Edge2 Engineering Solutions India  Pvt. Ltd., failing to which the client will be responsible for all the losses incurred to men and equipment of Edge2. 				
</li>				
</ul>		
                                    </div>
                                </div>

                                <div className="mt-4 pt-2 border-t text-center text-gray-500 text-sm">
                                    <h2 className="font-semibold text-left py-2">Technicals:</h2>
                                    <div className="text-left text-xs">
                                        <ul className="list-disc"> 
                                            <li> All the field investigation work will be carried out as per IS1892:1979 and relevant Indian Standards.</li>				
                                            <li> Boring / drilling in all kinds of soils will be carried out , the diameter of borehole shall be min 150/100 mm.</li>				
                                            <li> The standard penetrations tests will be conducted as per IS 2131-1981 at depths 1.0/1.5 intervals </li>					
                                            <li> The Undisturbed / Disturebed soil will be taken at every 1.0/1.5m or at wherever strata changes by using 100 mm diameter, 400 mm long thin walled Shellby tubes.  The ends of the tubes shall be sealed with wax  and marked properly.  If UDS is not obtained due to hard strata or sandy strata, the same is  replaced by SPT.  The depth at which UDS collected and nos. of samples collected shall be recorded in borelogs.	</li>				
                                            <li> Bulk disturbed samples will be collected wherever UDS cannot be taken at every 1.0 m/1.5m intervals or wherever change of strata is encountered.		</li>			
                                            <li> The standing water table level (if encountered) and location cordinates will be recorded during field investigations in  the bore logs.</li>					
                                            <li> The laboratory tests will be carried out as per relevant IS codes.				</li>	
                                            <li> Submission of technical report: The technical report will be submitted including detailed borelogs, discussions, recommendations regarding Safe Bearing capacity as per IS 6403 – 1982, IS 8009 Part I – 1980, IS 12070 - 1987				</li>	
                                            </ul>		
                                    </div>
                                    <h2 className="font-semibold text-left py-2">Auger:</h2>
                                    <div className="text-left text-xs">
                                        <ul className="list-disc"> 
                                            <li>The Undisturbed / Disturebed soil will be taken at every 1.0/1.5m or at wherever strata changes by using 100 mm diameter, 400 mm long thin walled Shellby tubes.  The ends of the tubes shall be sealed with wax  and marked properly.  If UDS is not obtained due to hard strata or sandy strata,the same is  replaced by SPT.  The depth at which UDS collected and nos. of samples collected shall be recorded in borelogs.</li>					
                                            <li>Bulk disturbed samples will be collected wherever UDS cannot be taken at every 1m/1.5m intervals or wherever change of strata is encountered.</li>					
                                            <li>The standing water table level (if encountered) and location cordinates will be recorded during field investigations in the bore logs.</li>					
                                            <li>The laboratory tests will be carried out as per relevant IS codes.</li>					
                                            <li>Submission of technical report.The technical report will be submitted including detailed borelogs, discussions, recommendations regarding Safe Bearing capacity as per IS 6403 – 1982, IS 8009 Part I – 1980, IS 12070 - 1987.</li>					
                                        </ul>		
                                    </div>
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
