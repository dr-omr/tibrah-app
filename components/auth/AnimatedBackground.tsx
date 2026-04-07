import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
    return (
        <div className="absolute inset-0 z-0 bg-[#F8FAFC] overflow-hidden pointer-events-none">
            {/* Soft Ambient Blobs (Bright Mode) */}
            <motion.div
                animate={{ x: [0, 20, 0], y: [0, 15, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/50 blur-[120px]"
            />
            <motion.div
                animate={{ x: [0, -20, 0], y: [0, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[-20%] left-[-15%] w-[60%] h-[60%] rounded-full bg-teal-100/40 blur-[150px]"
            />
        </div>
    );
}
