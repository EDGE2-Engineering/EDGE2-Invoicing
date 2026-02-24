
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, LayoutDashboard, Home, FileText, User, Save, Loader2, UserCog, Plus, Database, HandHeart, IndianRupee, Ruler, BriefcaseBusiness, Hash, CreditCard, TestTube, Axe, Package, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

import AdminClientsManager from '@/components/admin/AdminClientsManager.jsx';
import AdminClientPricingManager from '@/components/admin/AdminClientPricingManager.jsx';
import AdminUsersManager from '@/components/admin/AdminUsersManager.jsx';
import AccountsManager from '@/components/admin/AccountsManager.jsx';
import AdminSystemSettings from '@/components/admin/AdminSystemSettings.jsx';
import AdminReportsManager from '@/components/admin/AdminReportsManager.jsx';
import MaterialInwardManager from '@/components/admin/MaterialInwardManager';

import AdminLogin from '@/components/admin/AdminLogin';
import UpdatePassword from '@/components/admin/UpdatePassword';
import { useToast } from '@/components/ui/use-toast';

import { supabase } from '@/lib/customSupabaseClient';

import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSiteContent } from '@/data/config';

const AdminPage = () => {
  const { user, loading, logout, isAdmin, isStandard } = useAuth();
  const siteName = getSiteContent().global?.siteName || "Easy Billing";
  const { tab } = useParams();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState(tab || 'accounts');
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const allowedTabs = ['accounts', 'inward_register', 'reports'];
    if (isStandard() && !allowedTabs.includes(mainTab)) {
      navigate('/settings/accounts');
    }
  }, [user, navigate, mainTab, isStandard]);

  useEffect(() => {
    if (tab) {
      setMainTab(tab);
    }
  }, [tab]);

  const handleTabChange = (value) => {
    setMainTab(value);
    navigate(`/settings/${value}`);
  };

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
          <title>Reset Password | EDGE2 {siteName}</title>
        </Helmet>
        <UpdatePassword />
      </>
    );
  }

  if (!user && !loading) {
    return (
      <>
        <Helmet>
          <title>Admin Login | EDGE2 {siteName}</title>
        </Helmet>
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Settings | EDGE2 {siteName}</title>
      </Helmet>

      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-0 relative">
        <Tabs value={mainTab} onValueChange={handleTabChange} className="w-full space-y-4">
          {/* Show sub-navigation ONLY if we are in a settings-related tab */}
          {(!['inward_register', 'reports', 'accounts'].includes(mainTab)) && (
            <>
              {/* Mobile View: Select Dropdown */}
              <div className="block md:hidden relative">
                <label htmlFor="admin-tabs" className="sr-only">Select a section</label>
                <select
                  id="admin-tabs"
                  value={mainTab}
                  onChange={(e) => handleTabChange(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm outline-none appearance-none"
                >
                  <option value="accounts">Accounts</option>
                  {!isStandard() && <option value="clients">Clients</option>}
                  {!isStandard() && <option value="pricing">Client Pricing</option>}
                  {!isStandard() && <option value="system">System Settings</option>}
                  {!isStandard() && <option value="users">User Management</option>}
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
                  {!isStandard() && (
                    <>
                      <TabsTrigger
                        value="clients"
                        title="Clients"
                        className="px-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2 data-[state=active]:p-2"
                      >
                        <BriefcaseBusiness className="w-4 h-4" /> Clients
                      </TabsTrigger>
                      <TabsTrigger
                        value="pricing"
                        title="Client Pricing"
                        className="px-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2 data-[state=active]:p-2"
                      >
                        <IndianRupee className="w-4 h-4" /> Pricing
                      </TabsTrigger>
                      <TabsTrigger
                        value="system"
                        title="System Settings"
                        className="px-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2 data-[state=active]:p-2"
                      >
                        <Cpu className="w-4 h-4" /> System
                      </TabsTrigger>
                      <TabsTrigger
                        value="users"
                        title="User Management"
                        className="px-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2 data-[state=active]:p-2"
                      >
                        <UserCog className="w-4 h-4" /> Users
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>
              </div>
            </>
          )}

          <TabsContent value="clients" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminClientsManager />
          </TabsContent>

          <TabsContent value="pricing" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminClientPricingManager />
          </TabsContent>

          <TabsContent value="accounts" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AccountsManager />
          </TabsContent>

          <TabsContent value="inward_register" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <MaterialInwardManager />
          </TabsContent>

          <TabsContent value="reports" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminReportsManager />
          </TabsContent>

          <TabsContent value="users" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminUsersManager />
          </TabsContent>

          <TabsContent value="system" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminSystemSettings />
          </TabsContent>
        </Tabs>
      </main >
    </div >
  );
};

export default AdminPage;
