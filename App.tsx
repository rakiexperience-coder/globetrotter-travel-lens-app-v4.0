/**
 * @license
 * contributor: SPDX-License-Identifier: Apache-2.0
 * copyright license: @techbaes
*/
import React, { useState, ChangeEvent, DragEvent, useRef } from 'react';
import { motion } from 'framer-motion';
import { generateAngleImage } from './services/geminiService';
import PhonePreviewCard from './components/PolaroidCard';
import Footer from './components/Footer';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { DraggableCardContainer, DraggableCardBody } from './components/ui/draggable-card';
import ItineraryPlanner from './components/ItineraryPlanner';


const SHOT_ANGLES = [
    'Ancient Discovery',
    'Backpacker Explorer',
    'Rooftop Skyline',
    'Luxury Shopping',
    'Aerial View',
    'Street Market Scene',
    'Elegant Dining',
    'First Person Frame',
    'Travel Diaries',
    'Golden Hour Landmark',
    'Luxury Drive POV',
    'Mountain Trek',
    'Balcony View',
    'Cafe Moment',
    'Culinary Session',
    'Hidden Alleyway',
    'Hotel Arrival',
    'Spa Retreat',
    'Mountain Summit',
    'Gallery Visit',
    'Flatlay Essentials',
    'Private Jet View',
    'Resort View',
    'Roadside Moment',
    'Scenic Cruise',
    'Tropical Beach Escape',
    'Street Food Adventure',
    'Water Sports Moment',
    'Window Seat Perspective',
    'Yacht Escape'
].sort();

const INFLUENCER_TYPES = [
    { id: 'general', name: 'General / None' },
    { id: 'ugc', name: 'UGC Traveller' },
    { id: 'lifestyle', name: 'Lifestyle Traveller' },
    { id: 'beauty', name: 'Beauty Globetrotter' },
    { id: 'fashion', name: 'Fashion Traveller' },
    { id: 'foodie', name: 'Culinary Explorer' },
    { id: 'travel', name: 'Travel Creator' },
    { id: 'podcast', name: 'Digital Storyteller' },
    { id: 'luxury', name: 'Luxury Jet Setter' },
    { id: 'tech', name: 'Tech Nomad' },
    { id: 'diy', name: 'Creative Traveller' },
    { id: 'fitness', name: 'Wellness Coach' },
    { id: 'musician', name: 'Music Nomad' },
    { id: 'rapper', name: 'Rapper Traveller' },
    { id: 'genz', name: 'Gen Z Explorer' },
    { id: 'corporate', name: 'Business Jet Setter' },
].sort((a, b) => a.name.localeCompare(b.name));

const GENDER_OPTIONS = [
    { id: 'female', name: 'Female' },
    { id: 'male', name: 'Male' },
    { id: 'non-binary', name: 'Non-binary' },
];


type ImageStatus = 'pending' | 'done' | 'error';
interface GeneratedImage {
    angle: string;
    status: ImageStatus;
    originalUrl?: string;
    displayUrl?: string;
    error?: string;
}

const primaryButtonClasses = "font-poppins font-bold text-lg text-center text-white bg-[#a4823f] py-3 px-8 rounded-lg transform transition-transform duration-200 hover:scale-105 hover:bg-[#8c7337] shadow-md";
const secondaryButtonClasses = "font-poppins font-bold text-lg text-center text-neutral-700 bg-white py-3 px-8 rounded-lg transform transition-transform duration-200 hover:scale-105 hover:bg-neutral-100 shadow-md border border-neutral-200";
const selectClasses = "font-poppins text-base w-full px-5 py-2 border border-[#c8c8c8] rounded-full bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#a4823f]/40 hover:shadow-md hover:shadow-[#a4823f]/20 transition-all";
const inputClasses = "font-poppins text-base w-full px-5 py-2 border border-[#c8c8c8] rounded-full bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#a4823f]/40 hover:shadow-md hover:shadow-[#a4823f]/20 transition-all placeholder:text-neutral-400";


function App() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedAngles, setSelectedAngles] = useState<string[]>(Array(6).fill(''));
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [downloadMessage, setDownloadMessage] = useState<string>('Creating Zip...');
    const [appState, setAppState] = useState<'idle' | 'image-uploaded' | 'generating' | 'results-shown'>('idle');
    const [projectName, setProjectName] = useState<string>('');
    const [influencerType, setInfluencerType] = useState<string>('general');
    const [gender, setGender] = useState<string>('female');
    const [location, setLocation] = useState<string>('');
    const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
    const [view, setView] = useState<'home' | 'itinerary'>('home');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processUploadedFile = (file: File) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setAppState('image-uploaded');
                setGeneratedImages([]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processUploadedFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processUploadedFile(e.dataTransfer.files[0]);
        }
    };
    
    const handleAngleChange = (index: number, value: string) => {
        const newAngles = [...selectedAngles];
        newAngles[index] = value;
        setSelectedAngles(newAngles);
    };

    const handleGenerateClick = async (
        anglesToGenerate: string[],
        options: { regenerate?: boolean } = {}
    ) => {
        if (!uploadedImage || anglesToGenerate.length === 0) return;

        setIsLoading(true);
        setAppState('generating');
        
        const initialImages: GeneratedImage[] = anglesToGenerate.map(angle => ({
            angle,
            status: 'pending',
        }));
        setGeneratedImages(initialImages);

        const concurrencyLimit = 2;
        const anglesQueue = [...anglesToGenerate.map((angle, index) => ({ angle, index }))];

        const processAngle = async (angle: string, index: number) => {
            try {
                const resultUrl = await generateAngleImage(uploadedImage, angle, { 
                    regenerate: options.regenerate,
                    influencerType: influencerType,
                    gender: gender,
                    location: location,
                 });
                setGeneratedImages(prev => {
                    const newImages = [...prev];
                    newImages[index] = { 
                        ...newImages[index], 
                        status: 'done', 
                        originalUrl: resultUrl, 
                        displayUrl: resultUrl,
                    };
                    return newImages;
                });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                 setGeneratedImages(prev => {
                    const newImages = [...prev];
                    newImages[index] = { ...newImages[index], status: 'error', error: errorMessage };
                    return newImages;
                });
                console.error(`Failed to generate image for ${angle}:`, err);
            }
        };

        const workers = Array(concurrencyLimit).fill(null).map(async () => {
            while (anglesQueue.length > 0) {
                const item = anglesQueue.shift();
                if (item) {
                    await processAngle(item.angle, item.index);
                }
            }
        });

        await Promise.all(workers);

        setIsLoading(false);
        setAppState('results-shown');
    };
    
    const handleRegenerateAlbum = async () => {
        if (!uploadedImage) return;

        // Get 6 new random angles
        const shuffled = [...SHOT_ANGLES].sort(() => 0.5 - Math.random());
        const newAngles = shuffled.slice(0, 6);
        
        await handleGenerateClick(newAngles, { regenerate: true });
    };

    const handleRegenerateAngle = async (index: number) => {
        if (!uploadedImage || index < 0 || index >= generatedImages.length) return;
        
        const imageToRegen = generatedImages[index];
        if (imageToRegen?.status === 'pending') return;
        
        setGeneratedImages(prev => {
            const newImages = [...prev];
            newImages[index] = { ...newImages[index], status: 'pending', displayUrl: undefined, error: undefined };
            return newImages;
        });
        
        try {
            const resultUrl = await generateAngleImage(uploadedImage, imageToRegen.angle, { 
                regenerate: true,
                influencerType: influencerType,
                gender: gender,
                location: location,
            });
            setGeneratedImages(prev => {
                const newImages = [...prev];
                newImages[index] = { 
                    ...newImages[index], 
                    status: 'done', 
                    originalUrl: resultUrl,
                    displayUrl: resultUrl,
                };
                return newImages;
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setGeneratedImages(prev => {
                const newImages = [...prev];
                newImages[index] = { ...newImages[index], status: 'error', error: errorMessage };
                return newImages;
            });
            console.error(`Failed to regenerate image for ${imageToRegen.angle}:`, err);
        }
    };
    
    const handleStartOver = () => {
        setGeneratedImages([]);
        setAppState('image-uploaded');
        setSelectedAngles(Array(6).fill(''));
        setTimeout(() => {
            document.getElementById('shots-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleReset = () => {
        setUploadedImage(null);
        setGeneratedImages([]);
        setSelectedAngles(Array(6).fill(''));
        setProjectName('');
        setInfluencerType('general');
        setGender('female');
        setLocation('');
        setAppState('idle');
    };

    const handleBackToStart = () => {
        setUploadedImage(null);
        setGeneratedImages([]);
        setSelectedAngles(Array(6).fill(''));
        setProjectName('');
        setInfluencerType('general');
        setGender('female');
        setLocation('');
        setIsLoading(false);
        setAppState('idle');
        setView('home');
      };

    const sanitizeForFilename = (name: string): string => {
        const sanitized = name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
        return sanitized || 'UNTITLED';
    };

    const handleDownloadIndividualImage = (index: number) => {
        const image = generatedImages[index];
        if (image?.status === 'done' && image.displayUrl) {
            const link = document.createElement('a');
            const projectFilename = sanitizeForFilename(projectName);
            const angleFilename = image.angle.replace(/\s+/g, '-');
            
            link.href = image.displayUrl;
            link.download = `${projectFilename}-${angleFilename}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDownloadZip = async () => {
        setIsDownloading(true);
        setDownloadMessage('Preparing zip...');

        try {
            const imagesToProcess = generatedImages.filter(img => img.status === 'done' && img.displayUrl);

            if (imagesToProcess.length < generatedImages.length) {
                alert("Please wait for all images to finish generating before downloading.");
                setIsDownloading(false);
                return;
            }
            if (imagesToProcess.length === 0) {
                alert("No images have been generated successfully.");
                setIsDownloading(false);
                return;
            }

            setDownloadMessage('Zipping files...');
            const zip = new JSZip();
            const projectFilename = sanitizeForFilename(projectName);

            const dataUrlToBlob = (dataUrl: string) => {
                const parts = dataUrl.split(',');
                const mimeType = parts[0].match(/:(.*?);/)?.[1];
                const bstr = atob(parts[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new Blob([u8arr], { type: mimeType });
            };

            for (const image of imagesToProcess) {
                if (image.displayUrl) {
                    const angleFilename = image.angle.replace(/\s+/g, '-');
                    const blob = dataUrlToBlob(image.displayUrl);
                    zip.file(`${projectFilename}-${angleFilename}.png`, blob);
                }
            }
            
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${projectFilename}-images.zip`);

        } catch (error) {
            console.error("Failed to create or download zip:", error);
            alert("Sorry, there was an error creating your zip file. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (view === 'itinerary') {
        return <ItineraryPlanner onBack={() => setView('home')} />;
    }

    return (
        <main className="bg-[#f9f9f6] text-[#2a2a2a] min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-x-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-black/[0.05]"></div>
            
            <div className="z-10 flex flex-col items-center justify-center w-full h-full flex-1 min-h-0">
                {appState !== 'idle' && (
                    <div className="text-center mb-4 max-w-2xl mx-auto">
                        <h1 className="text-[30px] md:text-[36px] leading-snug font-serif font-bold text-[#a4823f] mb-2">
                            Globetrotter Travel Lens App
                        </h1>
                        <p className="text-[17px] md:text-[19px] font-serif italic text-[#2a2a2a] mb-3">
                            Capture Every Angle. Curate Your Getaway.
                        </p>
                    </div>
                )}
                
                {appState === 'idle' && (
                    <>
                        <div className="mx-auto max-w-7xl px-4 w-full">
                           <div className="flex flex-col md:flex-row items-center justify-center gap-12 mt-8 hero-container">
                                <div className="w-full md:w-1/2 text-center md:text-left hero-text">
                                    <h1 className="text-[36px] md:text-[42px] leading-tight font-serif font-bold text-[#a4823f] mb-2">
                                        Globetrotter Travel Lens App
                                    </h1>
                                    <p className="text-[18px] md:text-[20px] font-serif italic text-[#2a2a2a] mb-4">
                                        Capture Every Angle. Curate Your Getaway.
                                    </p>
                                    <p className="text-[15px] md:text-[16px] font-poppins text-[#2a2a2a] leading-relaxed">
                                        Step into the world of wanderlust with Globetrotter — your all-in-one AI travel lens and planner.<br />
                                        Upload your photo to create cinematic travel visuals or instantly plan a personalized itinerary for your next getaway — all inspired by your travel mood and destination.
                                    </p>
                                    
                                    <div className="mt-8 flex justify-center md:justify-start">
                                        <div
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragEnter={() => setIsDraggingOver(true)}
                                            onDragLeave={() => setIsDraggingOver(false)}
                                            className={`w-full max-w-lg border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center bg-white/60 hover:border-[#a4823f] transition ${isDraggingOver ? 'border-[#a4823f]' : 'border-[#a4823f]/40'}`}
                                        >
                                            <label htmlFor="file-upload" className="cursor-pointer font-poppins text-base text-neutral-700 hover:text-[#a4823f] transition">
                                                <strong>Click to upload or drag and drop</strong>
                                                <p className="text-sm text-neutral-500 mt-2">PNG, JPG, WEBP, HEIC, or AVIF (MAX. 10MB)</p>
                                            </label>
                                            <input ref={fileInputRef} id="file-upload" type="file" onChange={handleImageUpload} className="hidden" accept="image/png, image/jpeg, image/webp, image/heic, image/avif"/>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                                      <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-3 rounded-xl bg-[#a4823f] text-white font-medium hover:opacity-90 transition-all"
                                      >
                                        Generate My Travel Views
                                      </button>
                                      <button
                                        onClick={() => setView('itinerary')}
                                        className="px-6 py-3 rounded-xl border border-[#a4823f] text-[#a4823f] font-medium hover:bg-[#a4823f] hover:text-white transition-all"
                                      >
                                        Plan My Travel Itinerary
                                      </button>
                                    </div>
                                </div>
                                <div className="flex w-full md:w-1/2 justify-center hero-image">
                                  <img
                                    src="https://i.postimg.cc/YCdNss1z/Gemini-Generated-Image-6kpfu96kpfu96kpf.png"
                                    alt="Travel flatlay with passport and boarding pass"
                                    className="rounded-2xl shadow-lg w-full object-cover border border-[#e4e4e4]"
                                  />
                                </div>
                           </div>
                        </div>

                        <div className="mx-auto max-w-7xl px-4 mt-16 w-full">
                          <div className="text-left md:w-1/2">
                            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#A4823F]">
                              What You’ll Get Instantly
                            </h2>
                        
                            <ul className="mt-4 space-y-3 text-gray-700 text-sm md:text-base list-none">
                              <li className="flex items-start">
                                <span className="mr-2 text-[#A4823F]">✓</span>
                                <span>
                                  <strong>No need for prompts</strong> — simply upload your photo once, and the AI instantly
                                  generates cinematic travel shots from your chosen destinations.
                                </span>
                              </li>
                        
                              <li className="flex items-start">
                                <span className="mr-2 text-[#A4823F]">✓</span>
                                <span>
                                  <strong>Maintain your AI twin’s consistency</strong> — experience your journeys from every
                                  perspective: breathtaking landscapes, cultural hotspots, hidden alleys, rooftop sunsets,
                                  and more — all in seconds.
                                </span>
                              </li>
                        
                              <li className="flex items-start">
                                <span className="mr-2 text-[#A4823F]">✓</span>
                                <span>
                                  <strong>Save or share your travel views anytime, anywhere</strong> — perfect for showcasing
                                  wanderlust-worthy content that’s cohesive, story-driven, and ready for your next post or
                                  digital album.
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="mr-2 text-[#A4823F]">✓</span>
                                <span>
                                  <strong>Plan Your Travel Itinerary —</strong> If you don’t wish to generate visuals, you can still use Globetrotter as your private itinerary designer. Simply enter your destination and let AI craft your ideal travel plan — from cultural escapes to luxury adventures.
                                </span>
                              </li>
                            </ul>
                        
                            <p className="mt-6 text-sm text-gray-500 max-w-md leading-relaxed">
                              By uploading, you agree to use this service responsibly — no harmful or unlawful content.
                              Globetrotter is built to inspire creativity, confidence, and AI-powered visual storytelling — always.
                            </p>
                          </div>
                        </div>
                    </>
                )}

                {appState === 'image-uploaded' && uploadedImage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-8 w-full max-w-4xl px-4"
                    >
                         <div className="w-full max-w-sm">
                             <PhonePreviewCard 
                                imageUrl={uploadedImage} 
                                caption="Your Photo" 
                                status="done"
                             />
                         </div>
                         <div className="w-full max-w-xl space-y-4">
                             <div>
                                <label htmlFor="project-name" className="font-poppins text-neutral-600 text-base mb-2 block text-left">Trip Title</label>
                                 <input
                                    id="project-name"
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="e.g., My Paris Getaway"
                                    className={inputClasses}
                                />
                             </div>
                             <div>
                                <label htmlFor="location" className="font-poppins text-neutral-600 text-base mb-2 block text-left">Location</label>
                                 <input
                                    id="location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g., Santorini, Greece"
                                    className={inputClasses}
                                />
                             </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="influencer-type" className="font-poppins text-neutral-600 text-base mb-2 block text-left">Travel Style</label>
                                    <select
                                        id="influencer-type"
                                        value={influencerType}
                                        onChange={(e) => setInfluencerType(e.target.value)}
                                        className={selectClasses}
                                    >
                                        {INFLUENCER_TYPES.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="gender" className="font-poppins text-neutral-600 text-base mb-2 block text-left">Gender</label>
                                    <select
                                        id="gender"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className={selectClasses}
                                    >
                                        {GENDER_OPTIONS.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                         </div>
                         <div id="shots-section" className="w-full max-w-xl mt-4">
                            <label className="font-poppins text-neutral-600 text-base mb-2 block text-left font-semibold">Select One or More Travel Shots</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {selectedAngles.map((angle, index) => (
                                    <div key={index}>
                                        <label htmlFor={`angle-select-${index}`} className="sr-only">Select angle {index + 1}</label>
                                        <select 
                                            id={`angle-select-${index}`}
                                            value={angle}
                                            onChange={(e) => handleAngleChange(index, e.target.value)}
                                            className={selectClasses}
                                        >
                                            <option value="">Select Shot</option>
                                            {SHOT_ANGLES.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                         </div>
                         <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
                            <button 
                                onClick={handleReset} 
                                className="bg-[#a4823f] hover:bg-[#8c7337] text-white font-semibold py-2 px-6 rounded-md transition-all"
                            >
                                Different Photo
                            </button>
                            <button 
                                onClick={handleBackToStart} 
                                className="bg-[#a4823f] hover:bg-[#8c7337] text-white font-semibold py-2 px-6 rounded-md transition-all"
                            >
                                Back to Start
                            </button>
                            <button 
                                onClick={() => handleGenerateClick(selectedAngles.filter(Boolean))} 
                                disabled={!selectedAngles.some(Boolean)}
                                className="bg-[#a4823f] hover:bg-[#8c7337] text-white font-semibold py-2 px-6 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Generate Shots
                            </button>
                         </div>
                    </motion.div>
                )}

                {(appState === 'generating' || appState === 'results-shown') && (
                     <>
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4 max-w-7xl">
                            {generatedImages.map((image, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                     <PhonePreviewCard
                                        caption={image.angle}
                                        status={image.status}
                                        imageUrl={image.displayUrl}
                                        error={image.error}
                                        onRegenerate={() => handleRegenerateAngle(index)}
                                        onDownload={() => handleDownloadIndividualImage(index)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                        
                         <div className="h-20 mt-4 flex items-center justify-center">
                            {appState === 'results-shown' && (
                                <div className="flex justify-center items-end gap-3 flex-wrap">
                                    <button 
                                        onClick={handleDownloadZip} 
                                        disabled={isDownloading || generatedImages.some(img => img.status !== 'done')} 
                                        className="px-6 py-2 text-sm rounded-full bg-[#a4823f] text-white font-medium hover:bg-[#8f7338] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDownloading ? downloadMessage : 'Download All (ZIP)'}
                                    </button>
                                    <button onClick={handleStartOver} className="px-6 py-2 text-sm rounded-full bg-[#a4823f] text-white font-medium hover:bg-[#8f7338] transition-all">
                                        Start Over
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </main>
    );
}

export default App;