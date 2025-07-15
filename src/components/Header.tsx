import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Settings, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AutoAgri Australia</h1>
                <p className="text-sm text-gray-500">Job Card Management System - Designed by Monarc Labs</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* New Job Card button moved to AdminPortalPage */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;