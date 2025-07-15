import React from 'react';
import { Link } from 'react-router-dom';
import { X, Settings, FileText, Users, BarChart3, Wrench, Package, Home } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigationItems = [
    { name: 'Admin Portal', href: '/admin-portal', icon: Settings },
    { name: 'Mechanic Portal', href: '/mechanic-portal', icon: Wrench },
    { name: 'Parts Portal', href: '/parts-portal', icon: Package },
    { name: 'Job Cards Database', href: '/job-cards-database', icon: FileText },
    { name: 'Customer Database', href: '/customer-database', icon: Users },
    { name: 'Parts Database', href: '/parts-database', icon: FileText },
    { name: 'Resources', href: '/resources', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Home },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AutoAgri</h2>
                <p className="text-xs text-gray-500">Navigation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    window.location.pathname === item.href
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 w-5 h-5 ${
                    window.location.pathname === item.href ? 'text-blue-700' : 'text-gray-400'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>AutoAgri Australia</p>
              <p>Job Card Management System</p>
              <p className="mt-1">Designed by Monarc Labs</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;