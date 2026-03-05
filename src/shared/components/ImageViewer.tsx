import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ImageViewerProps {
    images: string[];
    initialIndex?: number;
    onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ images, initialIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);

    const handlePrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale(1);
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale(1);
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale((prev) => Math.min(prev + 0.5, 3));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale((prev) => Math.max(prev - 0.5, 0.5));
    };

    // Close on escape key
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrevious(e as unknown as React.MouseEvent);
            if (e.key === 'ArrowRight') handleNext(e as unknown as React.MouseEvent);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!images || images.length === 0) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Top Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10" onClick={e => e.stopPropagation()}>
                <div className="text-white/80 font-medium tracking-wide">
                    {currentIndex + 1} / {images.length}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleZoomOut}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut size={20} />
                    </button>
                    <button
                        onClick={handleZoomIn}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-white hover:text-red-400 hover:bg-white/10 rounded-full transition-colors ml-2"
                        title="Close"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Main Image Area */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden p-4 sm:p-12">
                <img
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    style={{ transform: `scale(${scale})` }}
                    className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}
        </div>,
        document.body
    );
};
