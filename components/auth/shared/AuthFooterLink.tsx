import React from 'react';
import Link from 'next/link';

interface AuthFooterLinkProps {
    text: string;
    linkText: string;
    href: string;
    className?: string;
}

export default function AuthFooterLink({ text, linkText, href, className = '' }: AuthFooterLinkProps) {
    return (
        <p className={`text-center text-slate-500 mt-6 ${className}`}>
            {text}{' '}
            <Link href={href} className="text-primary font-semibold hover:underline">
                {linkText}
            </Link>
        </p>
    );
}
