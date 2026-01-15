
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, LayoutDashboard, Home, FileText, LogOut, User, Save, Loader2, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';

import AdminServicesManager from '@/components/admin/AdminServicesManager.jsx';
import AdminTestsManager from '@/components/admin/AdminTestsManager.jsx';

import AdminSettings from '@/components/admin/AdminSettings';
import AdminLogin from '@/components/admin/AdminLogin';
import UpdatePassword from '@/components/admin/UpdatePassword';
import { useToast } from '@/components/ui/use-toast';

import { supabase } from '@/lib/customSupabaseClient';

const AdminPage = () => {
  const [mainTab, setMainTab] = useState('services');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [username, setUsername] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        const nameFromMetadata = session.user.user_metadata?.username || session.user.user_metadata?.full_name;
        setUsername(nameFromMetadata || session.user.email || 'Admin');
      }
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      setIsAuthenticated(!!session);
      if (session?.user) {
        const nameFromMetadata = session.user.user_metadata?.username || session.user.user_metadata?.full_name;
        setUsername(nameFromMetadata || session.user.email || 'Admin');
      } else {
        setUsername('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    // Session state is handled by the subscription above
    toast({ title: "Welcome back", description: "You have successfully logged in." });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged Out", description: "See you next time." });
  };



  if (checkingAuth) {
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

  if (!isAuthenticated) {
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
        <title>Configure | EDGE2 Invoicing</title>
      </Helmet>

      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12 relative">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Configure</h1>
            <p className="text-gray-500 mt-1">Manage services and tests</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center hidden md:flex">
              <User className="w-4 h-4 mr-2" />
              {`Logged in as ${username || 'Admin'}`}
            </div>



            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

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

              <option value="tabs">Services</option>
              <option value="tests">Tests</option>

              <option value="settings">Security</option>
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
                value="settings"
                className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
              >
                <UserCog className="w-4 h-4" /> Security
              </TabsTrigger>
            </TabsList>
          </div>



          <TabsContent value="services" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminServicesManager />
          </TabsContent>

          <TabsContent value="tests" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminTestsManager />
          </TabsContent>



          <TabsContent value="settings" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;
