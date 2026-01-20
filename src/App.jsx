import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { ServicesProvider } from '@/contexts/ServicesContext';
import { TestsProvider } from '@/contexts/TestsContext';
import { ClientsProvider } from '@/contexts/ClientsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';



import ServiceDetailPage from '@/pages/ServiceDetailPage.jsx';
import TestDetailPage from '@/pages/TestDetailPage.jsx';


import AdminPage from '@/pages/AdminPage';
import NewQuotationPage from '@/pages/NewQuotationPage.jsx';




function App() {
  return (
    <HelmetProvider>
      <ServicesProvider>
        <TestsProvider>
          <ClientsProvider>
            <SettingsProvider>
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
                      path="/new-quotation"
                      element={
                        <ProtectedRoute>
                          <NewQuotationPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/service/:id"
                      element={
                        <ProtectedRoute>
                          <ServiceDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/test/:id"
                      element={
                        <ProtectedRoute>
                          <TestDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Redirect old admin route to root */}
                    <Route path="/admin" element={<Navigate to="/" replace />} />
                  </Routes>
                  <Toaster />
                </div>
              </Router>
            </SettingsProvider>
          </ClientsProvider>
        </TestsProvider>
      </ServicesProvider>

    </HelmetProvider >
  );
}

export default App;
