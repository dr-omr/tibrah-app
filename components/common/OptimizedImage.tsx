/**
 * OptimizedImage — A wrapper around next/image for consistent optimized images
 * Handles: lazy loading, blur placeholder, responsive sizing, fallback
 * 
 * Use this instead of raw <img> tags throughout the app.
 */

import React, { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    className?: string;
    priority?: boolean;
    quality?: number;
    sizes?: string;
    /** Show a colored placeholder while loading */
    placeholderColor?: string;
    /** Object fit mode */
    objectFit?: 'cover' | 'contain' | 'fill' | 'none';
    /** Fallback to show on error */
    fallbackIcon?: React.ReactNode;
    /** onClick handler */
    onClick?: () => void;
}

/** A shimmer SVG for blur placeholder */
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f1f5f9" offset="20%" />
      <stop stop-color="#e2e8f0" offset="50%" />
      <stop stop-color="#f1f5f9" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f1f5f9" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
    typeof window === 'undefined'
        ? Buffer.from(str).toString('base64')
        : window.btoa(str);

export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    fill = false,
    className = '',
    priority = false,
    quality = 75,
    sizes,
    objectFit = 'cover',
    fallbackIcon,
    onClick,
}: OptimizedImageProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // If src is empty or error, show fallback
    if (!src || hasError) {
        return (
            <div
                className={`bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${className}`}
                style={!fill ? { width, height } : undefined}
                onClick={onClick}
                role={onClick ? 'button' : undefined}
            >
                {fallbackIcon || (
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )}
            </div>
        );
    }

    // For external URLs that aren't in the configured domains, use regular img with lazy loading
    const isExternal = src.startsWith('http') && !src.includes('firebasestorage.googleapis.com')
        && !src.includes('images.unsplash.com') && !src.includes('lh3.googleusercontent.com')
        && !src.includes('cdn-icons-png.flaticon.com');

    if (isExternal) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                style={{ objectFit, ...(width ? { width } : {}), ...(height ? { height } : {}) }}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
                onClick={onClick}
            />
        );
    }

    // Use next/image for optimized images
    const imageProps = fill
        ? { fill: true as const, sizes: sizes || '(max-width: 768px) 100vw, 50vw' }
        : { width: width || 400, height: height || 300 };

    return (
        <Image
            src={src}
            alt={alt}
            {...imageProps}
            className={`${className} transition-opacity duration-300 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
            style={{ objectFit }}
            quality={quality}
            priority={priority}
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(width || 400, height || 300))}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            onClick={onClick}
        />
    );
}
