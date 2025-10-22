/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TRAVEL_TIPS = [
  "Travel Tip: Capture moments that make your passport jealous 🌍",
  "Travel Insight: Every view tells a story — let AI enhance yours ✈️",
  "Wanderlust Note: The world looks better through your lens 🌅",
  "Travel Views: Your memories deserve cinematic detail 🎞️",
];

const Footer = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % TRAVEL_TIPS.length);
        }, 4000); // Cycle every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-[#f9f9f6]/80 backdrop-blur-sm p-3 z-50 text-neutral-600 text-xs sm:text-sm border-t border-black/10">
            <div className="max-w-screen-xl mx-auto flex flex-wrap justify-center sm:justify-between items-center gap-x-6 gap-y-2 px-4">
                
                <p className="text-xs text-neutral-500 text-center sm:text-left">
                    Powered by RAKI AI & Google Gemini
                </p>
                
                {/* Right side: Rotating Tip */}
                <div className="hidden lg:block h-5">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="text-right font-semibold"
                        >
                            <span style={{ color: '#a4823f' }}>
                                {TRAVEL_TIPS[currentIndex]}
                            </span>
                        </motion.p>
                    </AnimatePresence>
                </div>

            </div>
        </footer>
    );
};

export default Footer;