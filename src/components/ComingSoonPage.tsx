import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  icon: LucideIcon;
  message: string;
  bgColor: string;
  textColor: string;
  iconBgColor: string;
  iconColor: string;
  animationClass: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  title,
  icon: Icon,
  message,
  bgColor,
  textColor,
  iconBgColor,
  iconColor,
  animationClass
}) => {
  return (
    <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated Icon */}
        <div className={`inline-flex items-center justify-center w-32 h-32 ${iconBgColor} rounded-full mb-8`}>
          <Icon className={`w-16 h-16 ${iconColor}`} />
        </div>

        {/* Title */}
        <h1 className={`text-4xl md:text-5xl font-bold ${textColor} mb-6 animate-fadeIn`}>
          {title}
        </h1>

        {/* Message */}
        <p className={`text-xl md:text-2xl ${textColor} opacity-80 mb-8 animate-fadeIn`} style={{ animationDelay: '0.2s' }}>
          {message}
        </p>

        {/* Progress Indicator */}
        <div className="w-full max-w-md mx-auto mb-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '35%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Development in progress...</p>
        </div>

        {/* Features Coming Soon */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto animate-fadeIn`} style={{ animationDelay: '0.6s' }}>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 text-sm font-bold">1</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">Advanced Features</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 text-sm font-bold">2</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">Intuitive Interface</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 text-sm font-bold">3</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">Seamless Integration</p>
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-12 animate-fadeIn`} style={{ animationDelay: '0.8s' }}>
          <p className="text-sm text-gray-500">
            AutoAgri Australia • Designed by Monarc Labs
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;