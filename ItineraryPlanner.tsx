/**
 * @license
 * contributor: SPDX-License-Identifier: Apache-2.0
 * copyright license: @techbaes
*/
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateItinerary } from '../services/geminiService';
import Footer from './Footer';
import { downloadItineraryPDF } from '../utils/pdf';

// Re-using styles from App.tsx for consistency
const inputClasses = "font-poppins text-base w-full px-5 py-2 border border-[#c8c8c8] rounded-full bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#a4823f]/40 hover:shadow-md hover:shadow-[#a4823f]/20 transition-all placeholder:text-neutral-400";

const ItineraryPlanner: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [destination, setDestination] = useState('');
    const [duration, setDuration] = useState('');
    const [travelStyle, setTravelStyle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [itinerary, setItinerary] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (itinerary) {
            console.timeEnd("RenderItinerary");
        }
    }, [itinerary]);

    const handleGenerate = async () => {
        if (!destination || !duration) {
            setError('Please provide a destination and trip duration.');
            return;
        }
        setIsLoading(true);
        setError('');
        setItinerary('');
        console.time("ItineraryGeneration");
        try {
            const result = await generateItinerary(destination, duration, travelStyle);
            console.time("RenderItinerary");
            setItinerary(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to generate itinerary: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
            console.timeEnd("ItineraryGeneration");
        }
    };

    return (
        <main 
            className="text-[#2a2a2a] min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-x-hidden relative bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')" }}
        >
            <div className="absolute top-0 left-0 w-full h-full bg-black/30"></div>
            <div className="z-10 flex flex-col items-center justify-center w-full h-full flex-1 min-h-0 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full text-center bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-lg border border-white/30"
                >
                    <h1 className="text-[36px] md:text-[42px] leading-tight font-serif font-bold text-[#a4823f] mb-2">
                        Plan Your Next Adventure
                    </h1>
                    <p className="text-[18px] md:text-[20px] font-serif italic text-[#2a2a2a] mb-8">
                        Your AI-powered travel agent for smart and personalized itineraries.
                    </p>

                    <div className="space-y-4 max-w-xl mx-auto mb-8 text-left">
                        <div>
                            <label htmlFor="destination" className="font-poppins text-neutral-600 text-base mb-2 block">Destination</label>
                            <input
                                id="destination"
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="e.g., Kyoto, Japan"
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label htmlFor="duration" className="font-poppins text-neutral-600 text-base mb-2 block">Trip Duration</label>
                            <input
                                id="duration"
                                type="text"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="e.g., 7 days"
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label htmlFor="travel-style" className="font-poppins text-neutral-600 text-base mb-2 block">Travel Style</label>
                            <select
                                id="travel-style"
                                value={travelStyle}
                                onChange={(e) => setTravelStyle(e.target.value)}
                                className={inputClasses}
                            >
                                <option value="">Select Travel Style (Optional)</option>
                                <option value="Adventure">Adventure</option>
                                <option value="Relaxation">Relaxation</option>
                                <option value="Family-Friendly">Family-Friendly</option>
                                <option value="Cultural Immersion">Cultural Immersion</option>
                                <option value="Foodie">Foodie</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-4">
                        <button onClick={onBack} className="px-6 py-3 rounded-xl border border-[#a4823f] text-[#a4823f] font-medium hover:bg-[#a4823f]/20 transition-all bg-white/80">
                            Back to Home
                        </button>
                        <button onClick={handleGenerate} disabled={isLoading || !destination || !duration} className="px-6 py-3 rounded-xl bg-[#a4823f] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? 'Crafting your itinerary...' : 'Generate My Itinerary'}
                        </button>
                    </div>
                </motion.div>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mt-12 p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg max-w-4xl w-full text-center flex flex-col items-center justify-center"
                    >
                        <svg className="animate-spin h-10 w-10 text-[#a4823f] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h2 className="text-xl font-semibold text-[#a4823f]">Crafting your itinerary...</h2>
                        <p className="text-neutral-600 mt-1">This can take a few moments.</p>
                    </motion.div>
                )}

                {!isLoading && !itinerary && !error && (
                    <p className="text-center text-white mt-8 italic drop-shadow-md">
                      Your generated trip plan will appear here.<br />Enter a destination above to get started.
                    </p>
                )}

                {error && !isLoading && (
                    <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-2xl w-full">
                        <p>{error}</p>
                    </div>
                )}

                {itinerary && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-12 p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg max-w-4xl w-full text-left border border-black/10"
                    >
                         <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#a4823f] mb-4">Your Itinerary for {destination}</h2>
                         <div
                            className="prose prose-sm md:prose-base max-w-none font-poppins text-[#2a2a2a]"
                            dangerouslySetInnerHTML={{ __html: itinerary }}
                         />
                         <div className="mt-6 text-center flex justify-center gap-4">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="px-6 py-2 rounded-xl bg-[#a4823f] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {isLoading ? 'Crafting...' : 'Regenerate Itinerary'}
                            </button>
                            <button
                                onClick={() =>
                                  downloadItineraryPDF({
                                    destination,
                                    duration,
                                    style: travelStyle,
                                    itinerary,
                                  })
                                }
                                className="px-6 py-2 rounded-xl border border-[#a4823f] text-[#a4823f] font-medium hover:bg-[#a4823f] hover:text-white transition-all text-sm"
                            >
                                Download PDF
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
            <Footer />
        </main>
    );
};

export default ItineraryPlanner;