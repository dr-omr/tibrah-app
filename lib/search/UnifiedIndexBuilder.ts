import { staticIndex } from '@/components/search-engine/staticIndex';
import { localProducts } from '@/lib/products';
import { localArticles } from '@/lib/articles';
import { masterDictionary, AnatomicalSystem, AnatomicalTissue } from '@/data/anatomy/masterDictionary';
import { getEmotionalDiseases } from '@/data/emotionalMedicineData';

export interface SearchIndexItem {
    id: string;
    title: string;
    description: string;
    content: string; // The deep text searchable field
    href: string;
    iconType: 'page' | 'tool' | 'pharmacy' | 'library' | 'anatomy' | 'disease';
    category: string;
    color: string;
    badge?: string;
    weight: number; // For manual boosting exact items
}

/**
 * Compiles all data sources into a single robust flat array for Fuse.js
 */
export async function buildUnifiedIndex(): Promise<SearchIndexItem[]> {
    const index: SearchIndexItem[] = [];

    // 1. Static Pages & Tools (From predefined list)
    staticIndex.forEach(item => {
        index.push({
            id: `static-${item.id}`,
            title: item.title,
            description: item.description,
            content: item.keywords.join(' '), // Inject keywords into deep content
            href: item.href,
            iconType: item.category === 'health' || item.category === 'tools' ? 'tool' : 'page',
            category: item.category,
            color: item.color,
            badge: item.badge,
            weight: 3, // High priority for exact pages
        });
    });

    // 2. Pharmacy Products
    localProducts.forEach(product => {
        const deepContent = `${product.name_en || ''} ${product.benefits?.join(' ') || ''} ${product.category}`;
        index.push({
            id: `product-${product.id}`,
            title: product.name,
            description: `${product.price} ر.س - ${product.description.substring(0, 50)}...`,
            content: `${product.description} ${deepContent}`,
            href: `/shop?search=${encodeURIComponent(product.name)}`,
            iconType: 'pharmacy',
            category: 'pharmacy',
            color: '#10B981',
            badge: 'منتج',
            weight: 2,
        });
    });

    // 3. Library Articles
    localArticles.forEach(article => {
        const tags = article.tags?.join(' ') || '';
        index.push({
            id: `article-${article.id}`,
            title: article.title,
            description: article.summary,
            content: `${tags} ${article.author || ''}`,
            href: `/library?article=${article.id}`,
            iconType: 'library',
            category: 'library',
            color: '#3B82F6',
            badge: 'مقال',
            weight: 1,
        });
    });

    // 4. Emotional Diseases (Async)
    try {
        const diseases = await getEmotionalDiseases();
        diseases.forEach(d => {
            const deepContent = `
                الصراع الشعوري: ${d.emotionalConflict}
                السبب العميق: ${d.biologicalPurpose}
                العلاج: ${d.treatmentSteps.join(' ')}
                التوكيد: ${d.healingAffirmation}
            `;
            index.push({
                id: `disease-${d.id}`,
                title: d.symptom,
                description: `الطب الشعوري: ${d.targetOrgan}`,
                content: deepContent,
                href: `/emotional-medicine?symptom=${encodeURIComponent(d.symptom)}`,
                iconType: 'disease',
                category: 'tools',
                color: '#EC4899',
                badge: 'عَرَض',
                weight: 1,
            });
        });
    } catch (e) {
        console.error('Failed to index emotional diseases', e);
    }

    // 5. Anatomy Master Dictionary
    Object.values(masterDictionary).forEach((system: AnatomicalSystem) => {
        const systemContent = `
            ${system.overview_description}
            ${system.overview_emotion}
            ${system.overview_medical}
        `;
        index.push({
            id: `anatomy-sys-${system.id}`,
            title: system.name,
            description: system.categoryName,
            content: systemContent,
            href: `/body-map?part=${system.id}`,
            iconType: 'anatomy',
            category: 'health',
            color: system.categoryColor,
            badge: 'عضو',
            weight: 2,
        });

        const indexTissue = (t: AnatomicalTissue) => {
            const deepContent = `
                المرض والشعور: ${t.emotion}
                الوصف: ${t.description}
                السبب العميق: ${t.deeperCause}
                التعافي: ${t.treatment.join(' ')}
                أعراض: ${t.symptom_hooks.join(' ')}
            `;
            index.push({
                id: `anatomy-tis-${t.id}`,
                title: t.name,
                description: t.emotion,
                content: deepContent,
                href: `/body-map?part=${system.id}&tissue=${t.id}`, // We'd pass it via URL
                iconType: 'anatomy',
                category: 'health',
                color: system.categoryColor,
                badge: 'أنسجة',
                weight: 1,
            });
        };

        system.organs?.forEach(indexTissue);
        system.tissues?.forEach(indexTissue);
    });

    return index;
}
