import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BodyPartProps {
    id: string;
    d: string; // SVG path
    name: string;
    onClick: (id: string) => void;
    isActive: boolean;
}

const BodyPart = ({ id, d, name, onClick, isActive }: BodyPartProps) => (
    <motion.path
        d={d}
        id={id}
        onClick={() => onClick(id)}
        initial={{ fill: "#e2e8f0" }}
        animate={{
            fill: isActive ? "#2D9B83" : "#e2e8f0",
            scale: isActive ? 1.02 : 1
        }}
        whileHover={{ fill: "#3FB39A", cursor: "pointer", scale: 1.01 }}
        transition={{ duration: 0.3 }}
        stroke="white"
        strokeWidth="2"
        className="transition-colors duration-300 outline-none"
    />
);


interface InteractiveBodyProps {
    onSelectPart: (partId: string) => void;
    className?: string;
    viewMode?: 'front' | 'back';
}

export default function InteractiveBody({ onSelectPart, className = "", viewMode = 'front' }: InteractiveBodyProps) {
    const [activePart, setActivePart] = useState<string | null>(null);

    const handleClick = (id: string) => {
        setActivePart(id);
        onSelectPart(id);
    };

    return (
        <div className={`relative flex justify-center ${className}`}>
            <svg
                viewBox="0 0 400 600"
                className="h-[500px] w-auto drop-shadow-2xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {viewMode === 'front' ? (
                    <>
                        {/* Head */}
                        <BodyPart
                            id="head"
                            name="الرأس"
                            d="M200 50 C170 50 150 80 150 110 C150 145 170 160 200 160 C230 160 250 145 250 110 C250 80 230 50 200 50 Z"
                            onClick={handleClick}
                            isActive={activePart === 'head'}
                        />

                        {/* Neck (Throat) */}
                        <BodyPart
                            id="throat"
                            name="الحلق"
                            d="M175 155 L225 155 L225 180 L175 180 Z"
                            onClick={handleClick}
                            isActive={activePart === 'throat'}
                        />

                        {/* Chest */}
                        <BodyPart
                            id="chest"
                            name="الصدر"
                            d="M150 180 L250 180 C270 180 280 200 275 240 L260 280 L140 280 L125 240 C120 200 130 180 150 180 Z"
                            onClick={handleClick}
                            isActive={activePart === 'chest'}
                        />

                        {/* Stomach / Abdomen */}
                        <BodyPart
                            id="stomach"
                            name="المعدة"
                            d="M140 280 L260 280 L255 350 C250 380 230 390 200 390 C170 390 150 380 145 350 L140 280 Z"
                            onClick={handleClick}
                            isActive={activePart === 'stomach'}
                        />

                        {/* Shoulders & Arms (Combined for simplicity or separate if needed) */}
                        <BodyPart
                            id="joints"
                            name="المفاصل (الأكتاف)"
                            d="M125 180 L60 200 L50 250 L80 260 L130 190 Z M275 180 L340 200 L350 250 L320 260 L270 190 Z"
                            onClick={handleClick}
                            isActive={activePart === 'joints'}
                        />

                        {/* Liver Area (Approximate right side of abdomen) */}
                        <BodyPart
                            id="liver"
                            name="الكبد"
                            d="M155 290 L195 290 L190 330 L160 330 Z" // Simplified small area
                            onClick={handleClick}
                            isActive={activePart === 'liver'}
                        />

                        {/* Legs */}
                        <BodyPart
                            id="legs"
                            name="الأرجل"
                            d="M145 390 L195 390 L190 550 L155 550 Z M205 390 L255 390 L245 550 L210 550 Z"
                            onClick={handleClick}
                            isActive={activePart === 'legs'}
                        />
                    </>
                ) : (
                    <>
                        {/* BACK VIEW */}

                        {/* Head Back */}
                        <BodyPart
                            id="head"
                            name="خلف الرأس"
                            d="M200 50 C170 50 150 80 150 110 C150 145 170 160 200 160 C230 160 250 145 250 110 C250 80 230 50 200 50 Z"
                            onClick={handleClick}
                            isActive={activePart === 'head'}
                        />

                        {/* Upper Back / Shoulders */}
                        <BodyPart
                            id="shoulders_back"
                            name="أعلى الظهر"
                            d="M150 180 L250 180 C270 180 280 200 275 240 L260 260 L140 260 L125 240 C120 200 130 180 150 180 Z"
                            onClick={() => handleClick('back')} // Map to general 'back'
                            isActive={activePart === 'back'}
                        />

                        {/* Spine / Middle Back */}
                        <BodyPart
                            id="spine"
                            name="العمود الفقري"
                            d="M190 160 L210 160 L210 390 L190 390 Z"
                            onClick={() => handleClick('back')}
                            isActive={activePart === 'back'}
                        />

                        {/* Kidneys Area */}
                        <BodyPart
                            id="kidneys"
                            name="الكلى"
                            d="M160 300 L190 300 L190 340 L160 340 Z M210 300 L240 300 L240 340 L210 340 Z"
                            onClick={handleClick}
                            isActive={activePart === 'kidneys'}
                        />

                        {/* Lower Back */}
                        <BodyPart
                            id="lower_back"
                            name="أسفل الظهر"
                            d="M140 260 L260 260 L255 350 C250 380 230 390 200 390 C170 390 150 380 145 350 L140 260 Z"
                            onClick={() => handleClick('back')}
                            isActive={activePart === 'back'}
                        />

                        {/* Legs Back */}
                        <BodyPart
                            id="legs_back"
                            name="خلف الأرجل"
                            d="M145 390 L195 390 L190 550 L155 550 Z M205 390 L255 390 L245 550 L210 550 Z"
                            onClick={() => handleClick('joints')}
                            isActive={activePart === 'joints'}
                        />
                    </>
                )}

            </svg>

            {/* Labels Overlay (Optional) */}
            {activePart && (
                <div className="absolute top-4 bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-md animate-in fade-in zoom-in">
                    منطقة مختارة: {activePart === 'head' ? 'الرأس' :
                        activePart === 'chest' ? 'الصدر' :
                            activePart === 'stomach' ? 'المعدة' :
                                activePart === 'throat' ? 'الحلق' : 'الجسم'}
                </div>
            )}
        </div>
    );
}
