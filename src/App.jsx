import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { ProductsProvider } from '@/contexts/ProductsContext';



import ProductDetailPage from '@/pages/ProductDetailPage';


import AdminPage from '@/pages/AdminPage';
import NewReportPage from '@/pages/NewReportPage';



function App() {
  return (
    <HelmetProvider>
      <ProductsProvider>
        <Router>
          <Helmet>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
          </Helmet>
          <div className="min-h-screen bg-[#F5F1ED]">
            <Routes>
              <Route path="/" element={<AdminPage />} />
              <Route
                path="/new-report"
                element={
                  <ProtectedRoute>
                    <NewReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <ProtectedRoute>
                    <ProductDetailPage />
                  </ProtectedRoute>
                }
              />
              {/* Redirect old admin route to root */}
              <Route path="/admin" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </ProductsProvider>

    </HelmetProvider >
  );
}

export default App;
