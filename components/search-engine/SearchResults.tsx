import React from 'react';
import { useSearch } from './SearchContext';
import styles from './SearchSystem.module.css';
import {
    Search, Clock, Compass, Sparkles, Activity,
    FileText, Package, Calendar, Heart, Stethoscope, ArrowUpRight, Trash2, ShoppingBag
} from 'lucide-react';
import { FuseResult, FuseResultMatch } from 'fuse.js';
import { SearchIndexItem } from '@/lib/search/UnifiedIndexBuilder';

const categoryLabels: Record<string, string> = {
    pages: 'الصفحات',
    health: 'الطب والتشريح',
    tools: 'أدوات وعلاجات شعورية',
    content: 'المحتوى والخدمات',
    pharmacy: 'الصيدلية والمكملات',
    library: 'المكتبة العلمية'
};

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

function HighlightMatch({ text, matches, propertyKey }: { text: string, matches?: readonly FuseResultMatch[], propertyKey: string }) {
    if (!matches || !text) return <>{text}</>;
    const match = matches.find(m => m.key === propertyKey);
    if (!match || !match.indices) return <>{text}</>;

    const parts = [];
    let lastIndex = 0;
    match.indices.forEach(([start, end], i) => {
        if (start > lastIndex) {
            parts.push(<span key={`t-${i}`}>{text.substring(lastIndex, start)}</span>);
        }
        parts.push(
            <mark key={`h-${i}`} className={styles.highlight}>
                {text.substring(start, end + 1)}
            </mark>
        );
        lastIndex = end + 1;
    });
    if (lastIndex < text.length) {
        parts.push(<span key={`end`}>{text.substring(lastIndex)}</span>);
    }
    return <>{parts}</>;
}

function getContextSnippet(text: string, match?: FuseResultMatch): React.ReactNode {
    if (!match || match.key !== 'content' || !match.indices || match.indices.length === 0) return null;
    const [start, end] = match.indices[0];
    const snippetStart = Math.max(0, start - 30);
    const snippetEnd = Math.min(text.length, end + 40);
    let snippet = text.substring(snippetStart, snippetEnd);
    if (snippetStart > 0) snippet = '...' + snippet;
    if (snippetEnd < text.length) snippet = snippet + '...';

    return <div className={styles.itemContextSnippet}>"{snippet}"</div>;
}

interface SearchResultsProps {
    query: string;
    setQuery: (val: string) => void;
    results: FuseResult<SearchIndexItem>[];
    groupedResults: Record<string, FuseResult<SearchIndexItem>[]>;
    selectedIndex: number;
    setSelectedIndex: (idx: number) => void;
    handleSelect: (href: string, title: string) => void;
    suggestedCorrection: string | null;
    resultsRef: React.RefObject<HTMLDivElement>;
}

export function SearchResults({
    query, setQuery, results, groupedResults, selectedIndex,
    setSelectedIndex, handleSelect, suggestedCorrection, resultsRef
}: SearchResultsProps) {
    const { recentSearches, clearRecentSearches, removeRecentSearch } = useSearch();
    
    let itemIndex = -1;

    return (
        <div ref={resultsRef} className={styles.content}>
            {!query.trim() ? (
                // Empty State: Recent & Quick Actions
                <>
                    {recentSearches.length > 0 && (
                        <div className={styles.group}>
                            <div className={styles.groupLabelSpaceBetween}>
                                <div className={styles.groupLabel}>
                                    <Clock size={14} /> عمليات بحث سابقة
                                </div>
                                <button 
                                    className={styles.clearRecentBtn} 
                                    onClick={clearRecentSearches}
                                    title="مسح السجل"
                                >
                                    مسح الكل
                                </button>
                            </div>
                            {recentSearches.map((term) => {
                                itemIndex++;
                                const actualIdx = itemIndex;
                                return (
                                    <div key={term} className={styles.recentItemWrapper}>
                                        <button
                                            className={`${styles.item} ${styles.recentItemMain}`}
                                            data-selected={selectedIndex === actualIdx}
                                            onClick={() => setQuery(term)}
                                            onMouseEnter={() => setSelectedIndex(actualIdx)}
                                        >
                                            <div className={styles.itemIconWrapper} style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                                <Clock size={16} color="var(--sp-text-muted)" />
                                            </div>
                                            <div className={styles.itemDetails}>
                                                <span className={styles.itemTitle}>{term}</span>
                                            </div>
                                        </button>
                                        <button 
                                            className={styles.removeRecentBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeRecentSearch(term);
                                            }}
                                            title="إزالة"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className={styles.group}>
                        <div className={styles.groupLabel}>
                            <Activity size={14} /> وصول سريع
                        </div>
                        {[ 
                            { title: 'المتابع الصحي', desc: 'تتبع بياناتك الحيوية', icon: Activity, href: '/health-tracker', color: '#10B981' },
                            { title: 'الصيدلية', desc: 'تسوق منتجاتنا', icon: ShoppingBag, href: '/shop', color: '#EC4899' },
                            { title: 'حجز موعد', desc: 'استشارة متخصصة', icon: Calendar, href: '/book-appointment', color: '#2D9B83' }
                        ].map((item) => {
                            itemIndex++;
                            const actualIdx = itemIndex; 
                            return (
                                <button
                                    key={item.href}
                                    className={styles.item}
                                    data-selected={selectedIndex === actualIdx}
                                    onClick={() => handleSelect(item.href, item.title)}
                                    onMouseEnter={() => setSelectedIndex(actualIdx)}
                                >
                                    <div className={styles.itemIconWrapper} style={{ backgroundColor: `${item.color}15` }}>
                                        <item.icon size={18} color={item.color} />
                                    </div>
                                    <div className={styles.itemDetails}>
                                        <span className={styles.itemTitle}>{item.title}</span>
                                        <span className={styles.itemSubtitle}>{item.desc}</span>
                                    </div>
                                    <ArrowUpRight size={16} className={styles.itemArrow} />
                                </button>
                            );
                        })}
                    </div>
                </>
            ) : results.length > 0 ? (
                // Results State
                <>
                    {suggestedCorrection && (
                        <div style={{
                            padding: '12px 16px', margin: '0 12px 16px 12px',
                            backgroundColor: 'rgba(29, 155, 240, 0.1)',
                            borderRadius: '8px', borderLeft: '3px solid #1d9bf0'
                        }}>
                            <div style={{ color: 'var(--sp-text)', fontSize: '14px', marginBottom: '4px' }}>
                                عرض النتائج لـ <strong style={{ color: '#1d9bf0' }}>{suggestedCorrection}</strong>
                            </div>
                            <div style={{ color: 'var(--sp-text-muted)', fontSize: '12px' }}>
                                بحثك الأصلي عن <strong style={{ textDecoration: 'line-through' }}>{query}</strong> لم يُعطِ أي نتائج دقيقة.
                            </div>
                        </div>
                    )}
                    {Object.entries(groupedResults).map(([category, items]) => (
                    <div key={category} className={styles.group}>
                        <div className={styles.groupLabel}>
                            {categoryLabels[category] || category}
                        </div>
                        {items.map((result) => {
                            itemIndex++;
                            const actualIdx = itemIndex;
                            const { item, matches } = result;
                            const Icon = getIconComponent(item.iconType);
                            const contentMatch = matches?.find(m => m.key === 'content');

                            return (
                                <button
                                    key={item.id}
                                    className={styles.item}
                                    data-selected={selectedIndex === actualIdx}
                                    onClick={() => handleSelect(item.href, item.title)}
                                    onMouseEnter={() => setSelectedIndex(actualIdx)}
                                >
                                    <div className={styles.itemIconWrapper} style={{ backgroundColor: `${item.color}15` }}>
                                        <Icon size={18} color={item.color} />
                                    </div>
                                    <div className={styles.itemDetails}>
                                        <div className={styles.itemTitleLine}>
                                            <span className={styles.itemTitle}>
                                                <HighlightMatch text={item.title} matches={matches} propertyKey="title" />
                                            </span>
                                            {item.badge && <span className={styles.itemBadge}>{item.badge}</span>}
                                        </div>
                                        <span className={styles.itemSubtitle}>
                                            <HighlightMatch text={item.description} matches={matches} propertyKey="description" />
                                        </span>
                                        {contentMatch && getContextSnippet(item.content, contentMatch)}
                                    </div>
                                    <ArrowUpRight size={16} className={styles.itemArrow} />
                                </button>
                            );
                        })}
                    </div>
                ))}
                </>
            ) : (
                // No Results State
                <div className={styles.emptyState}>
                    <div className={styles.emptyIconWrapper}>
                        <Search size={24} />
                    </div>
                    <h3 className={styles.emptyTitle}>لا توجد نتائج لـ "{query}"</h3>
                    <p className={styles.emptySubtitle}>جرب استخدام كلمات بحث مختلفة أو تأكد من الإملاء</p>
                </div>
            )}
        </div>
    );
}
