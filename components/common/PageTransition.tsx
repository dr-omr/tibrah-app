/**
 * PageTransition — Fluid, ultra-premium page transition
 * Uses Framer Motion for seamless route changes
 */

import React from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
}

const variants: any = {
    out: {
        opacity: 0,
        y: 10,
        scale: 0.98,
        transition: {
            duration: 0.2,
            ease: "easeIn"
        }
    },
    in: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    }
};

export default function PageTransition({ children }: PageTransitionProps) {
    const router = useRouter();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={router.pathname}
                variants={variants}
                initial="out"
                animate="in"
                exit="out"
                className="min-h-screen"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
