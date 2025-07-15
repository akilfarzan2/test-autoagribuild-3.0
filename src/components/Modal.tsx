import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CheckCircle, X, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'success',
  children
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          titleColor: 'text-green-800',
          buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        };
      case 'error':
        return {
          icon: <X className="w-12 h-12 text-red-500" />,
          titleColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      case 'info':
        return {
          icon: <Info className="w-12 h-12 text-blue-500" />,
          titleColor: 'text-blue-800',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
      default:
        return {
          icon: <CheckCircle className="w-12 h-12 text-blue-500" />,
          titleColor: 'text-blue-800',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
    }
  };

  const { icon, titleColor, buttonColor } = getIconAndColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-100 flex-shrink-0">
          <div className="flex justify-center mb-4">
            {icon}
          </div>
          <h3 className={`text-xl font-bold ${titleColor} mb-2`}>
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 text-center flex-1 overflow-y-auto min-h-0">
          <div className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
            <ReactMarkdown>{message}</ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          {children ? (
            children
          ) : (
            <button
              onClick={onClose}
              className={`w-full px-6 py-3 ${buttonColor} text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 transform hover:scale-105 active:scale-95`}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;