import React from 'react';

interface ErrorProps {
    statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
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
            <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {statusCode || 'Error'}
            </h1>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#64748b' }}>
                {statusCode === 404
                    ? 'Page Not Found'
                    : 'An unexpected error occurred'}
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

Error.getInitialProps = ({ res, err }: { res: any; err: any }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
