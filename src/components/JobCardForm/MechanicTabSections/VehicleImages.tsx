import React, { useState } from 'react';
import { Camera, ChevronDown, ChevronRight, Upload, X, Eye, Trash2, Image as ImageIcon } from 'lucide-react';
import { JobCardFormData } from '../../../types/jobCardTypes';
import { compressImage, formatFileSize, getBase64FileSize } from '../../../utils/imageCompression';

interface VehicleImagesProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: string) => void;
}

interface ImageUploadAreaProps {
  label: string;
  field: keyof JobCardFormData;
  currentImage: string;
  onImageChange: (field: keyof JobCardFormData, value: string) => void;
  onImageView: (image: string, label: string) => void;
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  label,
  field,
  currentImage,
  onImageChange,
  onImageView
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const compressedImage = await compressImage(file);
      onImageChange(field, compressedImage);
    } catch (error) {
      console.error('Error compressing image:', error);
      setUploadError('Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the input value so the same file can be selected again
      event.target.value = '';
    }
  };

  const handleDelete = () => {
    onImageChange(field, '');
    setUploadError(null);
  };

  const handleView = () => {
    if (currentImage) {
      onImageView(currentImage, label);
    }
  };

  const getImageSize = () => {
    if (!currentImage) return null;
    const size = getBase64FileSize(currentImage);
    return formatFileSize(size);
  };

  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors duration-200">
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          <Camera className="w-6 h-6 text-gray-400 mr-2" />
          <h4 className="text-sm font-medium text-gray-700">{label}</h4>
        </div>

        {currentImage ? (
          <div className="space-y-3">
            {/* Image Preview */}
            <div className="relative group">
              <img
                src={currentImage}
                alt={label}
                className="w-full h-32 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                onClick={handleView}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
                <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>

            {/* Image Info */}
            <div className="text-xs text-gray-500">
              Size: {getImageSize()}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleView}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </button>
            </div>

            {/* Replace Button */}
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
              <div className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <Upload className="w-3 h-3 mr-1" />
                {isUploading ? 'Processing...' : 'Replace'}
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Upload Area */}
            <div className="w-full h-32 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No image uploaded</p>
              </div>
            </div>

            {/* Upload Button */}
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
              <div className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 cursor-pointer transition-colors duration-200 disabled:opacity-50">
                <Upload className="w-3 h-3 mr-1" />
                {isUploading ? 'Processing...' : 'Upload Image'}
              </div>
            </label>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
            {uploadError}
          </div>
        )}

        {/* Loading State */}
        {isUploading && (
          <div className="mt-2 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-xs text-gray-600">Compressing image...</span>
          </div>
        )}
      </div>
    </div>
  );
};

const VehicleImages: React.FC<VehicleImagesProps> = ({ 
  jobCardFormData, 
  onJobCardDataChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [modalImage, setModalImage] = useState<{ src: string; label: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleImageChange = (field: keyof JobCardFormData, value: string) => {
    onJobCardDataChange(field, value);
  };

  const handleImageView = (image: string, label: string) => {
    setModalImage({ src: image, label });
    // Reset zoom and pan when opening modal
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
    setIsDragging(false);
  };

  const closeModal = () => {
    setModalImage(null);
    // Reset zoom and pan when closing modal
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
    setIsDragging(false);
  };

  // Handle zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const newZoomLevel = e.deltaY > 0 
      ? Math.max(0.5, zoomLevel - zoomFactor)
      : Math.min(5, zoomLevel + zoomFactor);
    setZoomLevel(newZoomLevel);
  };

  // Handle pan start
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panX,
      y: e.clientY - panY
    });
  };

  // Handle pan move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  // Handle pan end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle mouse leave (stop dragging if mouse leaves the image)
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const imageFields = [
    { label: 'Front View', field: 'image_front' as keyof JobCardFormData },
    { label: 'Back View', field: 'image_back' as keyof JobCardFormData },
    { label: 'Right Side', field: 'image_right_side' as keyof JobCardFormData },
    { label: 'Left Side', field: 'image_left_side' as keyof JobCardFormData },
  ];

  const uploadedCount = imageFields.filter(({ field }) => jobCardFormData[field]).length;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors duration-200 border-b border-purple-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Vehicle Images</h4>
              <p className="text-sm text-purple-600">
                {uploadedCount} of 4 images uploaded
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-6 bg-white animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {imageFields.map(({ label, field }) => (
                <ImageUploadArea
                  key={field}
                  label={label}
                  field={field}
                  currentImage={jobCardFormData[field]}
                  onImageChange={handleImageChange}
                  onImageView={handleImageView}
                />
              ))}
            </div>

            {/* Information Panel */}
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-purple-800 mb-2">Vehicle Images Information</h4>
              <p className="text-xs text-purple-600">
                Upload high-quality images of the vehicle from all four angles. Images are automatically compressed 
                to optimize storage while maintaining visual quality. Click on any uploaded image to view it in full size.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl max-h-full overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
              <button
                onClick={() => setZoomLevel(Math.min(5, zoomLevel + 0.2))}
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                title="Zoom In"
              >
                <span className="text-lg font-bold">+</span>
              </button>
              <button
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                title="Zoom Out"
              >
                <span className="text-lg font-bold">−</span>
              </button>
              <button
                onClick={() => {
                  setZoomLevel(1);
                  setPanX(0);
                  setPanY(0);
                }}
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200 text-xs"
                title="Reset Zoom"
              >
                1:1
              </button>
            </div>

            {/* Zoom Level Indicator */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm">
              {Math.round(zoomLevel * 100)}%
            </div>
            {/* Image */}
            <img
              src={modalImage.src}
              alt={modalImage.label}
              className="max-w-full max-h-full object-contain rounded-lg select-none transition-transform duration-150"
              style={{
                transform: `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`,
                transformOrigin: 'center center',
                cursor: isDragging ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'default')
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              draggable={false}
            />

            {/* Image Label */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-md">
              <p className="text-sm font-medium">{modalImage.label}</p>
            </div>

            {/* Instructions */}
            <div className="absolute top-4 right-16 bg-black bg-opacity-50 text-white px-3 py-2 rounded-md text-xs max-w-48">
              <p className="mb-1">🖱️ Scroll to zoom</p>
              <p>✋ Drag to pan</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VehicleImages;