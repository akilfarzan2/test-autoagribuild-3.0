import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminPortalPage from './pages/AdminPortalPage';
import MechanicPortalPage from './pages/MechanicPortalPage';
import PartsPortalPage from './pages/PartsPortalPage';
import JobCardsDatabasePage from './pages/JobCardsDatabasePage';
import CustomerDatabasePage from './pages/CustomerDatabasePage';
import ComingSoonPage from './components/ComingSoonPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Wrench, Package, Users, FileText, BarChart3, Home } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <Header onToggleSidebar={toggleSidebar} />
      
      <Routes>
        <Route path="/" element={<Navigate to="/admin-portal" replace />} />
        <Route path="/admin-portal" element={<AdminPortalPage />} />
        <Route path="/mechanic-portal" element={<MechanicPortalPage />} />
        <Route path="/parts-portal" element={<PartsPortalPage />} />
        <Route path="/job-cards-database" element={<JobCardsDatabasePage />} />
        <Route path="/customer-database" element={<CustomerDatabasePage />} />
        <Route path="/parts-database" element={
          <ComingSoonPage
            title="Parts Database"
            icon={FileText}
            message="Detailed parts catalog and tracking system in progress"
            bgColor="bg-white"
            textColor="text-gray-800"
            iconBgColor="bg-yellow-100"
            iconColor="text-yellow-600"
            animationClass=""
          />
        } />
        <Route path="/resources" element={
          <ComingSoonPage
            title="Resources"
            icon={BarChart3}
            message="Resource management and analytics dashboard being built"
            bgColor="bg-white"
            textColor="text-gray-800"
            iconBgColor="bg-teal-100"
            iconColor="text-teal-600"
            animationClass=""
          />
        } />
        <Route path="/settings" element={
          <ComingSoonPage
            title="Settings"
            icon={Home}
            message="System configuration and preferences panel coming soon"
            bgColor="bg-white"
            textColor="text-gray-800"
            iconBgColor="bg-gray-100"
            iconColor="text-gray-600"
            animationClass=""
          />
        } />
      </Routes>
    </div>
  );
}

export default App;