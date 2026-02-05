
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Lock, ClipboardCheck, Settings, LogOut, User } from 'lucide-react';
import { initialSiteContent } from '@/data/siteContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';



import { useAuth } from '@/contexts/AuthContext';


const Navbar = () => {
  const { user, logout, isStandard } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const content = initialSiteContent;

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "See you next time." });
  };

  const navItems = [
    { path: '/new-quotation', label: 'Create New', icon: ClipboardCheck, roles: ['admin'] },
    { path: '/', label: 'Configure', icon: Settings, roles: ['admin'] }
  ].filter(item => !item.roles || (item.roles.includes('admin') && !isStandard()));

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-primary">
              <ClipboardCheck className="w-8 h-8" />
            </span>
            <span className="text-xl font-bold text-gray-900 hidden sm:inline-block">
              {content.global?.siteName || "EDGE2 Invoicing"}
            </span>
            <span className="text-sm font-bold text-gray-900 sm:hidden">
              {content.global?.siteName || "EDGE2 Invoicing"}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 transition-colors text-sm font-medium ${isActive(item.path)
                  ? 'text-primary'
                  : 'text-gray-700 hover:text-primary'
                  }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            {user && (
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center">
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  {user?.fullName || user?.username || 'Admin'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden gap-4">

            <button
              className="text-gray-700"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              {user && (
                <>
                  <div className="flex items-center space-x-3 py-3 px-4 rounded-lg bg-blue-50 text-blue-700 mb-2">
                    <User className="w-5 h-5" />
                    <span className="font-medium text-sm">
                      Logged in as {user?.fullName || user?.username || 'Admin'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
