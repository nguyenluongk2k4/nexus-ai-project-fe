import React, { useState } from 'react';
import { ImageViewer } from './ImageViewer';

interface ImageGridProps {
    images: string[];
    maxDisplay?: number;
    className?: string;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, maxDisplay = 4, className = '' }) => {
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);

    if (!images || images.length === 0) return null;

    const displayImages = images.slice(0, maxDisplay);
    const hiddenCount = images.length - maxDisplay;

    // Grid layout logic based on number of images
    const getGridClass = () => {
        const count = displayImages.length;
        if (count === 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-2';
        if (count === 3) return 'grid-cols-2'; // First item spans 2 rows
        return 'grid-cols-2 grid-rows-2'; // 4 or more
    };

    const getItemClass = (index: number, count: number) => {
        if (count === 1) return 'h-[300px] sm:h-[400px] col-span-1 rounded-xl';

        // For exactly 3 images, make the first one take full left column
        if (count === 3 && index === 0) return 'row-span-2 h-full rounded-l-xl';
        if (count === 3 && index === 1) return 'h-[150px] sm:h-[200px] rounded-tr-xl';
        if (count === 3 && index === 2) return 'h-[150px] sm:h-[200px] rounded-br-xl';

        // For 2 images
        if (count === 2) {
            return `h-[250px] sm:h-[300px] ${index === 0 ? 'rounded-l-xl' : 'rounded-r-xl'}`;
        }

        // For 4+ images
        if (count >= 4) {
            if (index === 0) return 'h-[150px] sm:h-[200px] rounded-tl-xl';
            if (index === 1) return 'h-[150px] sm:h-[200px] rounded-tr-xl';
            if (index === 2) return 'h-[150px] sm:h-[200px] rounded-bl-xl';
            if (index === 3) return 'h-[150px] sm:h-[200px] rounded-br-xl';
        }

        return 'h-full';
    };

    return (
        <>
            <div className={`grid gap-1 overflow-hidden mt-3 ${getGridClass()} ${className}`}>
                {displayImages.map((src, index) => {
                    const isLastDisplay = index === maxDisplay - 1;
                    const hasMore = hiddenCount > 0;

                    return (
                        <div
                            key={index}
                            className={`relative cursor-pointer group ${getItemClass(index, displayImages.length)}`}
                            onClick={() => setViewerIndex(index)}
                        >
                            <img
                                src={src}
                                alt={`Post graphic ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />

                            {/* Overlay for interaction */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                            {/* +N counter overlay on the last image if there are more */}
                            {isLastDisplay && hasMore && (
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center text-white text-2xl sm:text-3xl font-semibold tracking-wide hover:bg-black/40 transition-colors">
                                    +{hiddenCount}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Lightbox Viewer */}
            {viewerIndex !== null && (
                <ImageViewer
                    images={images}
                    initialIndex={viewerIndex}
                    onClose={() => setViewerIndex(null)}
                />
            )}
        </>
    );
};
