import React from 'react';
import { ArrowUpRight, Copy, ExternalLink, Activity, Heart, Stethoscope, FileText, Package, Compass, Sparkles } from 'lucide-react';
import { SearchIndexItem } from '@/lib/search/UnifiedIndexBuilder';
import styles from './SearchSystem.module.css';

interface PreviewPaneProps {
    selectedItem: SearchIndexItem | null;
    onSelect: (href: string, title: string, newTab?: boolean) => void;
    onCopy: (text: string) => void;
}

const getIconComponent = (type: string) => {
    switch (type) {
        case 'page': return Compass;
        case 'tool': return Activity;
        case 'pharmacy': return Package;
        case 'library': return FileText;
        case 'anatomy': return Heart;
        case 'disease': return Stethoscope;
        default: return Sparkles;
    }
};

export function PreviewPane({ selectedItem, onSelect, onCopy }: PreviewPaneProps) {
    if (!selectedItem) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', color: 'var(--sp-text-muted)', opacity: 0.5, gap: '12px'
            }}>
                <Sparkles size={32} />
                <p style={{ margin: 0, fontSize: '13px' }}>اختر نتيجة لعرض التفاصيل</p>
            </div>
        );
    }

    const Icon = getIconComponent(selectedItem.iconType);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                backgroundColor: `${selectedItem.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: '12px'
            }}>
                <Icon size={32} color={selectedItem.color} />
            </div>
            
            <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', color: 'var(--sp-text)' }}>
                {selectedItem.title}
            </h2>
            
            {selectedItem.badge && (
                <span style={{
                    alignSelf: 'flex-start', padding: '4px 10px', borderRadius: '12px',
                    backgroundColor: 'rgba(29, 155, 240, 0.1)', color: '#1d9bf0',
                    fontSize: '11px', fontWeight: 'bold', marginBottom: '16px'
                }}>
                    {selectedItem.badge}
                </span>
            )}
            
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: 'var(--sp-text-muted)', lineHeight: '1.6' }}>
                {selectedItem.description}
            </p>
            
            {selectedItem.content && selectedItem.content.length > 20 && (
                <div style={{
                    backgroundColor: 'var(--sp-bg-preview)', padding: '16px',
                    borderRadius: '16px', borderRight: `3px solid ${selectedItem.color}`,
                    fontSize: '13px', color: 'var(--sp-text)', lineHeight: '1.8', marginBottom: '24px'
                }}>
                    {selectedItem.content.substring(0, 350)}...
                </div>
            )}

            <div style={{ flex: 1 }} />

            {/* Actions Bar Raycast Style */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button 
                    onClick={() => onSelect(selectedItem.href, selectedItem.title, false)}
                    style={{
                        flex: 1, backgroundColor: '#1d9bf0', color: '#fff', border: 'none',
                        padding: '12px', borderRadius: '12px', fontSize: '14px',
                        fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'opacity 0.2s', boxShadow: '0 10px 20px -5px rgba(29,155,240,0.4)'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                    فتح <ArrowUpRight size={16} />
                </button>
                
                <button 
                    onClick={() => onSelect(selectedItem.href, selectedItem.title, true)}
                    title="فتح في نافذة جديدة (Ctrl+Enter)"
                    style={{
                        width: '44px', backgroundColor: 'var(--sp-bg-hover)', color: 'var(--sp-text)', border: 'none',
                        borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--sp-bg-preview)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--sp-bg-hover)')}
                >
                    <ExternalLink size={18} />
                </button>
                
                <button 
                    onClick={() => onCopy(window.location.origin + selectedItem.href)}
                    title="نسخ الرابط (Shift+Enter)"
                    style={{
                        width: '44px', backgroundColor: 'var(--sp-bg-hover)', color: 'var(--sp-text)', border: 'none',
                        borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--sp-bg-preview)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--sp-bg-hover)')}
                >
                    <Copy size={18} />
                </button>
            </div>
        </div>
    );
}
