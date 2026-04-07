import React, { useMemo } from 'react';
import { Heart, Brain, Activity, Shield, Zap, Star, Stethoscope, LucideIcon } from 'lucide-react';

interface FeatureItem {
    icon: LucideIcon;
    text: string;
}

interface FloatingIconConfig {
    icon: LucideIcon;
    position: string;
    size: string;
    iconSize: string;
    delay: number;
    rounded: string;
}

interface DecorativePanelProps {
    title: string;
    subtitle: string;
    features?: FeatureItem[];
    floatingIcons?: FloatingIconConfig[];
    className?: string;
}

const defaultFloatingIcons: FloatingIconConfig[] = [
    { icon: Heart, position: 'top-[18%] left-[20%]', size: 'w-16 h-16', iconSize: 'w-7 h-7', delay: 0, rounded: 'rounded-2xl' },
    { icon: Brain, position: 'bottom-[22%] right-[18%]', size: 'w-14 h-14', iconSize: 'w-6 h-6', delay: 1.5, rounded: 'rounded-xl' },
    { icon: Activity, position: 'top-[38%] right-[25%]', size: 'w-12 h-12', iconSize: 'w-5 h-5', delay: 3, rounded: 'rounded-lg' },
    { icon: Stethoscope, position: 'bottom-[40%] left-[15%]', size: 'w-11 h-11', iconSize: 'w-5 h-5', delay: 4.5, rounded: 'rounded-xl' },
];

const defaultFeatures: FeatureItem[] = [
    { icon: Shield, text: 'حماية بياناتك الصحية' },
    { icon: Zap, text: 'متابعة صحتك بذكاء' },
    { icon: Star, text: 'استشارات متخصصة' },
];

// Pre-compute particle configs
const PARTICLE_COUNT = 20;

export default function DecorativePanel({
    title,
    subtitle,
    features = defaultFeatures,
    floatingIcons = defaultFloatingIcons,
    className = '',
}: DecorativePanelProps) {
    // Stable particle positions using useMemo
    const particles = useMemo(() =>
        Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
            left: `${(i * 17 + 7) % 100}%`,
            bottom: `${(i * 23 + 5) % 30}%`,
            size: `${2 + (i % 3) * 2}px`,
            duration: `${8 + (i % 7) * 3}s`,
            delay: `${(i * 1.3) % 10}s`,
            opacity: 0.2 + (i % 4) * 0.15,
        })), []
    );

    return (
        <div className={`hidden lg:flex lg:w-1/2 auth-gradient-animated relative items-center justify-center p-12 overflow-hidden ${className}`}>

            {/* Noise Texture */}
            <div className="auth-noise" />

            {/* Orbit Rings */}
            <div className="auth-orbit w-[500px] h-[500px] opacity-30" />
            <div className="auth-orbit auth-orbit-reverse w-[700px] h-[700px] opacity-20" />
            <div className="auth-orbit w-[900px] h-[900px] opacity-10" style={{ animationDuration: '60s' }} />

            {/* Background Circles (Original — preserved) */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-40 h-40 border border-white rounded-full" />
                <div className="absolute bottom-40 right-20 w-60 h-60 border border-white rounded-full" />
                <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-white rounded-full" />
            </div>

            {/* Floating Particles */}
            {particles.map((p, i) => (
                <div
                    key={i}
                    className="auth-particle"
                    style={{
                        left: p.left,
                        bottom: p.bottom,
                        width: p.size,
                        height: p.size,
                        animationDuration: p.duration,
                        animationDelay: p.delay,
                        opacity: p.opacity,
                    }}
                />
            ))}

            {/* Glassmorphism Floating Icons */}
            {floatingIcons.map((item, index) => (
                <div
                    key={index}
                    className={`absolute ${item.position} auth-float-enhanced`}
                    style={{ animationDelay: `${item.delay}s` }}
                >
                    <div className={`${item.size} ${item.rounded} auth-glass-icon flex items-center justify-center`}>
                        <item.icon className={`${item.iconSize} text-white drop-shadow-sm`} />
                    </div>
                </div>
            ))}

            {/* Main Content */}
            <div className="relative z-10 text-white text-center max-w-md">
                {/* Logo with glow */}
                <div className="relative inline-block mb-10">
                    <div className="absolute inset-0 bg-white/20 blur-[30px] rounded-full scale-150" />
                    <div className="relative w-28 h-28 mx-auto rounded-3xl auth-glass-icon flex items-center justify-center shadow-2xl">
                        <span className="text-5xl font-bold drop-shadow-md">ط</span>
                    </div>
                </div>

                <h1 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-sm">{title}</h1>
                <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-sm mx-auto">{subtitle}</p>

                {/* Features with enhanced styling */}
                <div className="space-y-4">
                    {features.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 justify-center group"
                            style={{ animationDelay: `${i * 0.2}s` }}
                        >
                            <div className="w-10 h-10 rounded-xl auth-glass-icon auth-feature-badge flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="w-5 h-5 drop-shadow-sm" />
                            </div>
                            <span className="text-white/90 text-base font-medium">{item.text}</span>
                        </div>
                    ))}
                </div>

                {/* Stats Bar */}
                <div className="mt-12 flex justify-center gap-8">
                    {[
                        { value: '+10K', label: 'مستخدم نشط' },
                        { value: '4.9', label: 'تقييم المستخدمين' },
                        { value: '24/7', label: 'دعم متواصل' },
                    ].map((stat, i) => (
                        <div key={i} className="auth-stat text-center" style={{ animationDelay: `${0.5 + i * 0.15}s` }}>
                            <div className="text-2xl font-bold text-white drop-shadow-sm">{stat.value}</div>
                            <div className="text-[11px] text-white/50 font-medium mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
