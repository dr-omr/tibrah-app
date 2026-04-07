import { useState, useEffect } from 'react';
import { Article } from '@/lib/articles';
import { toast } from '@/components/notification-engine';

/**
 * Custom hook for explicitly caching articles for offline reading.
 * It downloads the article's main image and converts it to Base64,
 * then saves the entire article structure into localStorage.
 */
export function useArticleCache(articleId: string | undefined) {
    const [isCached, setIsCached] = useState(false);
    const [isCaching, setIsCaching] = useState(false);
    const CACHE_KEY_PREFIX = 'tibrah_offline_article_';

    useEffect(() => {
        if (!articleId) return;
        const checkCache = () => {
            const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${articleId}`);
            setIsCached(!!cached);
        };
        checkCache();
    }, [articleId]);

    const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const toggleCache = async (article: Article | null) => {
        if (!article || !article.id) return;

        const cacheKey = `${CACHE_KEY_PREFIX}${article.id}`;

        if (isCached) {
            // Remove from cache
            localStorage.removeItem(cacheKey);
            setIsCached(false);
            toast.success('تم إزالة المقال من المحفوظات');
        } else {
            // Add to cache
            setIsCaching(true);
            try {
                // Fetch image and convert to base64 for true offline availability
                let cachedImageUrl = article.image_url;
                try {
                    if (article.image_url && !article.image_url.startsWith('data:')) {
                        cachedImageUrl = await getBase64ImageFromUrl(article.image_url);
                    }
                } catch (imgError) {
                    console.warn('Could not cache image for offline use:', imgError);
                }

                const articleToCache = {
                    ...article,
                    image_url: cachedImageUrl, // Replace URL with Base64
                    cached_at: new Date().toISOString()
                };

                localStorage.setItem(cacheKey, JSON.stringify(articleToCache));
                setIsCached(true);
                toast.success('تم حفظ المقال للقراءة بدون إنترنت');
            } catch (error) {
                console.error('Failed to cache article:', error);
                
                // If localStorage quota is exceeded
                if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                    toast.error('مساحة التخزين ممتلئة. يرجى حذف بعض المقالات المحفوظة القديمة.');
                } else {
                    toast.error('حدث خطأ أثناء حفظ المقال. حاول مجدداً.');
                }
            } finally {
                setIsCaching(false);
            }
        }
    };

    const getCachedArticle = (id: string): Article | null => {
        try {
            const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${id}`);
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    };

    return {
        isCached,
        isCaching,
        toggleCache,
        getCachedArticle
    };
}
