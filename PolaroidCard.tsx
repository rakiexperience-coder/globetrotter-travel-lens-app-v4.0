/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

type ImageStatus = 'pending' | 'done' | 'error';

interface PhonePreviewCardProps {
    imageUrl?: string;
    caption: string;
    status: ImageStatus;
    error?: string;
    onRegenerate?: () => void;
    onDownload?: () => void;
}

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full">
        <svg className="animate-spin h-8 w-8 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-neutral-500">Generation failed.</p>
    </div>
);

const Placeholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-neutral-500 group-hover:text-neutral-600 transition-colors duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-poppins text-xl font-bold">Upload Photo</span>
    </div>
);

const PhonePreviewCard: React.FC<PhonePreviewCardProps> = ({ imageUrl, caption, status, error, onRegenerate, onDownload }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    useEffect(() => {
        setIsImageLoaded(false);
    }, [imageUrl]);

    // New style for generated images in results view
    if (caption !== 'Your Photo') {
        return (
            <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden w-full h-full">
                {/* Image Container */}
                <div className="w-full aspect-[9/16] bg-neutral-100 relative">
                    {status === 'pending' && <LoadingSpinner />}
                    {status === 'error' && <ErrorDisplay />}
                    {status === 'done' && imageUrl && (
                        <img
                            key={imageUrl}
                            src={imageUrl}
                            alt={caption}
                            onLoad={() => setIsImageLoaded(true)}
                            className={cn(
                                'w-full h-full object-cover transition-opacity duration-500',
                                isImageLoaded ? 'opacity-100' : 'opacity-0'
                            )}
                        />
                    )}
                    {status === 'done' && !imageUrl && <Placeholder />}
                </div>
                {/* Info Container */}
                <div className="p-4 flex flex-col items-center justify-center flex-grow">
                    <p className="font-poppins text-sm text-center text-[#a4823f] font-semibold mb-3 truncate max-w-full">{caption}</p>
                    <div className="h-9 flex items-center"> {/* Fixed height container */}
                        {status === 'done' && imageUrl && (
                            <div className="flex items-center gap-2">
                                {onDownload && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDownload(); }}
                                        className="bg-[#a4823f] hover:bg-[#8c7337] text-white font-medium py-1.5 px-4 rounded-md transition-all text-xs"
                                        aria-label={`Download image for ${caption}`}
                                    >
                                        Download
                                    </button>
                                )}
                                {onRegenerate && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                                        className="bg-white hover:bg-neutral-100 text-[#a4823f] border border-[#a4823f] font-medium py-1.5 px-4 rounded-md transition-all text-xs"
                                        aria-label={`Regenerate image for ${caption}`}
                                    >
                                        Regenerate
                                    </button>
                                )}
                            </div>
                        )}
                        {status === 'error' && onRegenerate && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                                className="bg-[#a4823f] hover:bg-[#8c7337] text-white font-medium py-1.5 px-4 rounded-md transition-all text-xs"
                                aria-label={`Regenerate image for ${caption}`}
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Existing style for the "Your Photo" upload preview card
    const imageContainer = (
        <div className="w-full aspect-[9/16] rounded-xl bg-neutral-200 relative overflow-hidden group border border-[#e4e4e4]/40 shadow-none">
            {status === 'pending' && <LoadingSpinner />}
            {status === 'error' && <ErrorDisplay />}
            {status === 'done' && imageUrl && (
                <>
                    <div className="absolute top-4 right-4 z-30">
                        <div className="relative flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {onDownload && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDownload(); }}
                                    className="p-2 bg-white/60 rounded-full text-neutral-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    aria-label={`Download image for ${caption}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            )}
                            {onRegenerate && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                                    className="p-2 bg-white/60 rounded-full text-neutral-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    aria-label={`Regenerate image for ${caption}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.899 2.186l-1.42.71a5.002 5.002 0 00-8.479-1.554H10a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.899-2.186l1.42-.71a5.002 5.002 0 008.479 1.554H10a1 1 0 110-2h6a1 1 0 011 1v6a1 1 0 01-1 1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    <img
                        key={imageUrl}
                        src={imageUrl}
                        alt={caption}
                        onLoad={() => setIsImageLoaded(true)}
                        className={cn(
                            'w-full h-full object-cover transition-opacity duration-500',
                            isImageLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                    />
                </>
            )}
            {status === 'done' && !imageUrl && <Placeholder />}
        </div>
    );

    return (
        <div className="flex flex-col items-center text-center gap-2">
            {imageContainer}
            <p className="text-sm font-semibold text-neutral-800 mt-2 truncate max-w-full px-2">{caption}</p>
        </div>
    );
};

export default PhonePreviewCard;
