
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Info, CheckCircle2, Ban } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageGallery from '@/components/ImageGallery';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/contexts/ProductsContext';

import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const ProductDetailPage = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const { products } = useProducts();


    const product = products.find(p => p.id === id);



    if (!products || products.length === 0) {
        return (
            <>
                <Navbar />
                <div className="container mx-auto px-4 py-12 text-center">
                    <p>Loading product details...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Navbar />
                <div className="container mx-auto px-4 py-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
                    <Link to="/" className="text-primary hover:underline mt-4 inline-block">Return to Home</Link>
                </div>
                <Footer />
            </>
        );
    }

    const isInStock = product.status === 'In Stock';

    return (
        <>
            <Helmet>
                <title>{product.title} | EDGE2 MTR</title>
                <meta name="description" content={`Buy ${product.title} - ${product.description}`} />
            </Helmet>

            <Navbar />

            <div className="bg-white py-4 border-b">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link to="/" className="inline-flex items-center text-primary transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Products
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Images Section */}
                    <div>
                        <ImageGallery images={product.images} />
                    </div>

                    {/* Details Section */}
                    <div>
                        <div className="mb-6">
                            <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                {product.category}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">{product.title}</h1>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                                <span className="text-gray-500 text-lg">/ {product.weight}</span>
                            </div>

                            <div className="mt-4">
                                <div className={cn(
                                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                                    isInStock ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                                )}>
                                    {isInStock ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                                    {product.status}
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-700 text-lg leading-relaxed mb-8">
                            {product.description}
                        </p>

                        <div className="space-y-6 mb-8">
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
                                    <Info className="w-4 h-4 mr-2" /> Benefits
                                </h3>
                                <p className="text-yellow-800 text-sm">{product.benefits}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Ingredients</h3>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded">{product.ingredients}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button size="lg" variant="outline" className="flex-1">
                                Contact for Bulk Order
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default ProductDetailPage;
