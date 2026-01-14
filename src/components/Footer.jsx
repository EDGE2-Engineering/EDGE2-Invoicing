
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ClipboardCheck } from 'lucide-react';
import { initialSiteContent } from '@/data/siteContent';

const Footer = () => {
  const content = initialSiteContent;

  return (
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ClipboardCheck className="w-8 h-8" />
              <span className="text-xl font-bold">{content.global?.siteName || "EDGE2 MTR"}</span>
            </div>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              {content.global?.footerAbout}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-400">{content.global?.address}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-primary flex-shrink-0" />
                <span className="text-gray-400">{content.global?.contactPhone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-primary flex-shrink-0" />
                <span className="text-gray-400">{content.global?.contactEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} {content.global?.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
