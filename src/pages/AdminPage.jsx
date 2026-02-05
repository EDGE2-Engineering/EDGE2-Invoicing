
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, LayoutDashboard, Home, FileText, User, Save, Loader2, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';

import AdminServicesManager from '@/components/admin/AdminServicesManager.jsx';
import AdminTestsManager from '@/components/admin/AdminTestsManager.jsx';
import AdminClientsManager from '@/components/admin/AdminClientsManager.jsx';

import AdminSettingsManager from '@/components/admin/AdminSettingsManager.jsx';
import AdminClientPricingManager from '@/components/admin/AdminClientPricingManager.jsx';
import AdminUsersManager from '@/components/admin/AdminUsersManager.jsx';
import SavedRecordsManager from '@/components/admin/SavedRecordsManager.jsx';

import AdminLogin from '@/components/admin/AdminLogin';
import UpdatePassword from '@/components/admin/UpdatePassword';
import { useToast } from '@/components/ui/use-toast';

import { supabase } from '@/lib/customSupabaseClient';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AdminPage = () => {
  const { user, loading, logout, isStandard } = useAuth();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState('services');
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (isStandard()) {
      navigate('/new-quotation');
    }
  }, [user, navigate]);

  const handleLoginSuccess = () => {
    toast({ title: "Welcome back", description: "You have successfully logged in." });
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isPasswordRecovery) {
    return (
      <>
        <Helmet>
          <title>Reset Password | EDGE2 Invoicing</title>
        </Helmet>
        <UpdatePassword />
      </>
    );
  }

  if (!user && !loading) {
    return (
      <>
        <Helmet>
          <title>Admin Login | EDGE2 Invoicing</title>
        </Helmet>
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Settings | EDGE2 Invoicing</title>
      </Helmet>

      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-0 relative">
        {/* <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage everything</p>
          </div>
        </div> */}

        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full space-y-8">
          {/* Mobile View: Select Dropdown */}
          <div className="block md:hidden relative">
            <label htmlFor="admin-tabs" className="sr-only">Select a section</label>
            <select
              id="admin-tabs"
              value={mainTab}
              onChange={(e) => setMainTab(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm outline-none appearance-none"
            >

              <option value="services">Services</option>
              <option value="tests">Tests</option>
              <option value="clients">Clients</option>
              <option value="pricing">Client Pricing</option>
              <option value="app_settings">App Settings</option>
              <option value="saved_records">Saved Records</option>
              <option value="users">User Management</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Desktop View: Tabs List */}
          <div className="hidden md:flex justify-center">
            <TabsList className="bg-white p-1 border border-gray-200 rounded-xl shadow-sm h-auto inline-flex">

              <TabsTrigger
                value="services"
                className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
              >
                <Home className="w-4 h-4" /> Services
              </TabsTrigger>

              <TabsTrigger
                value="tests"
                className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Tests
              </TabsTrigger>

              <TabsTrigger
                value="clients"
                className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Clients
              </TabsTrigger>

              <TabsTrigger
                value="pricing"
                className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" /> Client Pricing
              </TabsTrigger>

              <TabsTrigger
                value="app_settings"
                className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
              >
                <Settings className="w-4 h-4" /> App Settings
              </TabsTrigger>

              <TabsTrigger
                value="saved_records"
                className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Saved Records
              </TabsTrigger>

              <TabsTrigger
                value="users"
                className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
              >
                <UserCog className="w-4 h-4" /> Users
              </TabsTrigger>

            </TabsList>
          </div>



          <TabsContent value="services" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminServicesManager />
          </TabsContent>

          <TabsContent value="tests" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminTestsManager />
          </TabsContent>

          <TabsContent value="clients" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminClientsManager />
          </TabsContent>

          <TabsContent value="pricing" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminClientPricingManager />
          </TabsContent>



          <TabsContent value="app_settings" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminSettingsManager />
          </TabsContent>

          <TabsContent value="saved_records" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <SavedRecordsManager />
          </TabsContent>

          <TabsContent value="users" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminUsersManager />
          </TabsContent>
        </Tabs>
      </main >

      <Footer />
    </div >
  );
};

export default AdminPage;
