import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName
}) => {
  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(fileUrl, '_blank');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderPreview = () => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{ maxHeight: '80vh' }}
            />
          </div>
        );
      case 'mp4':
      case 'webm':
      case 'ogg':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <video
              src={fileUrl}
              controls
              className="max-w-full max-h-full rounded-lg"
              style={{ maxHeight: '80vh' }}
            />
          </div>
        );
      case 'mp3':
      case 'wav':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
                {fileName}
              </h3>
              <audio src={fileUrl} controls className="w-full" />
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <iframe
              src={fileUrl}
              className="w-full h-full rounded-lg"
              style={{ minHeight: '80vh' }}
              title={fileName}
            />
          </div>
        );
      case 'txt':
      case 'md':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {fileName}
              </h3>
              <iframe
                src={fileUrl}
                className="w-full h-96 border border-gray-300 dark:border-gray-600 rounded"
                title={fileName}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Preview not available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {fileName}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => window.open(fileUrl, '_blank')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in new tab
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full max-w-6xl max-h-full">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm truncate max-w-xs backdrop-blur-sm">
            {fileName}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors backdrop-blur-sm"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors backdrop-blur-sm"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full h-full pt-16">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};