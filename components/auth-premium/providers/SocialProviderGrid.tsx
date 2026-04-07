import React from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/notification-engine';

import GoogleIcon from '@/components/auth/icons/GoogleIcon';
import AppleIcon from '@/components/auth/icons/AppleIcon';

export function TikTokIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.68a6.34 6.34 0 006.27 6.36 6.34 6.34 0 006.25-6.36V7.98a8.21 8.21 0 003.5 1.48V6.15a4.78 4.78 0 01-1.43-.46z" />
        </svg>
    );
}

export default function SocialProviderGrid() {
    const {
        signInWithGoogle,
        signInWithApple,
        signInWithFacebook,
        signInWithInstagram,
        signInWithTikTok
    } = useAuth();

    const [loadingProvider, setLoadingProvider] = React.useState<string | null>(null);

    const handleSocialAuth = async (providerName: string, authFunction: () => Promise<void>) => {
        setLoadingProvider(providerName);
        try {
            await authFunction();
        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user') {
                toast.error(error.message || `حدث خطأ أثناء الاتصال بـ ${providerName}`);
            }
        } finally {
            setLoadingProvider(null);
        }
    };

    const providers = [
        { name: 'Google', icon: <GoogleIcon className="w-[22px] h-[22px]" />, fn: signInWithGoogle },
        { name: 'Apple', icon: <AppleIcon className="w-[22px] h-[22px] mb-0.5" />, fn: signInWithApple },
        { name: 'Facebook', icon: <Facebook className="w-[22px] h-[22px] text-[#1877F2]" fill="#1877F2" />, fn: signInWithFacebook },
        { name: 'Instagram', icon: <Instagram className="w-[22px] h-[22px] text-[#E4405F]" />, fn: signInWithInstagram },
        { name: 'TikTok', icon: <TikTokIcon className="w-[22px] h-[22px]" />, fn: signInWithTikTok },
    ];

    return (
        <div className="grid grid-cols-5 gap-3.5">
            {providers.map((provider) => (
                <button
                    key={provider.name}
                    type="button"
                    title={`الدخول بواسطة ${provider.name}`}
                    onClick={() => handleSocialAuth(provider.name, provider.fn)}
                    disabled={loadingProvider !== null}
                    className="aspect-square flex items-center justify-center medical-social-btn group"
                >
                    {loadingProvider === provider.name ? (
                        <div className="w-[22px] h-[22px] border-[2.5px] border-medical-teal border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <div className="transition-transform duration-500 ease-out">
                            {provider.icon}
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
