import React from 'react';

export default function Custom500() {
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
            <h1 style={{ fontSize: '6rem', fontWeight: 'bold', margin: 0, lineHeight: 1 }}>500</h1>
            <h2 style={{ fontSize: '2rem', margin: '1rem 0' }}>Server Error</h2>
            <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2rem' }}>
                A server-side error occurred.
            </p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2D9B83',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem'
                }}
            >
                Reload Page
            </button>
        </div>
    );
}
