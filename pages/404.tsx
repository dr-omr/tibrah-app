import React from 'react';

export default function Custom404() {
    return (
        <div style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            color: '#1e293b'
        }}>
            <h1 style={{ fontSize: '6rem', fontWeight: 'bold', margin: 0, lineHeight: 1 }}>404</h1>
            <h2 style={{ fontSize: '2rem', margin: '1rem 0' }}>Page Not Found</h2>
            <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2rem' }}>
                The page you are looking for does not exist.
            </p>
            <a href="/" style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2D9B83',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem'
            }}>
                Go Home
            </a>
        </div>
    );
}
