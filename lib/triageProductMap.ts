// lib/triageProductMap.ts
// Maps clinical complaint categories to relevant product keywords in the shop
// Used by the QuickCheckIn completion screen to suggest relevant products

export const triageProductMap: Record<string, { keywords: string[]; label: string; emoji: string }> = {
  headache: {
    keywords: ['مغنيسيوم', 'magnesium', 'أوميغا', 'omega', 'فيتامين ب', 'vitamin b', 'كو إنزيم', 'coq10'],
    label: 'مكملات داعمة للصداع',
    emoji: '🧠'
  },
  chest_pain: {
    keywords: ['أوميغا', 'omega', 'كو إنزيم', 'coq10', 'مغنيسيوم', 'magnesium'],
    label: 'مكملات صحة القلب',
    emoji: '❤️'
  },
  respiratory: {
    keywords: ['فيتامين سي', 'vitamin c', 'زنك', 'zinc', 'عسل', 'honey', 'بروبوليس', 'propolis'],
    label: 'مكملات المناعة والتنفس',
    emoji: '🫁'
  },
  fever: {
    keywords: ['فيتامين سي', 'vitamin c', 'زنك', 'zinc', 'إلكتروليت', 'electrolyte', 'بروبيوتيك', 'probiotic'],
    label: 'دعم المناعة ومحاربة العدوى',
    emoji: '🌡️'
  },
  digestion: {
    keywords: ['بروبيوتيك', 'probiotic', 'إنزيم', 'enzyme', 'ألياف', 'fiber', 'زنجبيل', 'ginger'],
    label: 'مكملات الجهاز الهضمي',
    emoji: '🫃'
  },
  urinary: {
    keywords: ['كرانبيري', 'cranberry', 'd-mannose', 'بروبيوتيك', 'probiotic', 'فيتامين سي', 'vitamin c'],
    label: 'دعم صحة المسالك',
    emoji: '💧'
  },
  fatigue: {
    keywords: ['حديد', 'iron', 'فيتامين د', 'vitamin d', 'ب12', 'b12', 'كو إنزيم', 'coq10', 'أشواغاندا', 'ashwagandha'],
    label: 'مكملات الطاقة ومحاربة الإرهاق',
    emoji: '⚡'
  },
  other: {
    keywords: ['ملتي فيتامين', 'multivitamin', 'أوميغا', 'omega', 'فيتامين د', 'vitamin d'],
    label: 'مكملات صحة عامة',
    emoji: '💊'
  }
};

/**
 * Find products from the shop list that match the patient's triage complaint
 */
export function getRelevantProducts(complaintId: string, products: any[]): any[] {
  const mapping = triageProductMap[complaintId] || triageProductMap.other;
  
  return products.filter(product => {
    const name = (product.name || '').toLowerCase();
    const nameEn = (product.name_en || '').toLowerCase();
    const desc = (product.description || '').toLowerCase();
    const combined = `${name} ${nameEn} ${desc}`;
    
    return mapping.keywords.some(keyword => combined.includes(keyword.toLowerCase()));
  }).slice(0, 3); // Max 3 suggestions
}

/**
 * Get the suggestion label and emoji for a complaint category
 */
export function getComplaintSuggestionMeta(complaintId: string) {
  return triageProductMap[complaintId] || triageProductMap.other;
}
