import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Search, ShoppingCart, Sparkles, Brain, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from 'next/link';
import { createPageUrl } from '../utils';
import ProductCard from '../components/shop/ProductCard';
import ShopFilters from '../components/shop/ShopFilters';
import { ProductGridSkeleton } from '../components/common/Skeletons';
import ErrorState from '../components/common/ErrorState';
import { localProducts, productCategories } from '@/lib/products';
import { aiClient } from '@/components/ai/aiClient';

export default function Shop() {
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState([0, 500]);
    const [aiRecs, setAiRecs] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const queryClient = useQueryClient();

    const { data: apiProducts = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: () => db.entities.Product.list(),
    });

    const { data: cartItems = [] } = useQuery({
        queryKey: ['cart'],
        queryFn: () => db.entities.CartItem.list(),
    });

    const addToCartMutation = useMutation({
        mutationFn: async (product: any) => {
            // Stock validation
            if (product.in_stock === false) {
                throw new Error('هذا المنتج غير متوفر حالياً');
            }
            // Read fresh cart data to avoid stale closure
            const currentCart = queryClient.getQueryData<any[]>(['cart']) || [];
            const existingItem = currentCart.find((item: any) => item.product_id === product.id);
            if (existingItem) {
                return db.entities.CartItem.update(existingItem.id, {
                    quantity: (existingItem.quantity as number) + 1
                });
            }
            return db.entities.CartItem.create({
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                quantity: 1,
                image_url: product.image_url
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('تمت الإضافة للسلة');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'حدث خطأ أثناء الإضافة');
        },
    });

    // Use local products as fallback when API returns empty - cast to any for type compatibility
    const products: any[] = apiProducts.length > 0 ? apiProducts : localProducts;

    if (isError && localProducts.length === 0) {
        return <ErrorState title="خطأ" message="تعذر تحميل المنتجات" onRetry={refetch} />;
    }

    // Filter and sort products
    let filteredProducts = products.filter((product: any) => {
        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.name_en?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = category === 'all' || product.category === category;
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort
    filteredProducts = [...filteredProducts].sort((a: any, b: any) => {
        switch (sortBy) {
            case 'price_asc':
                return a.price - b.price;
            case 'price_desc':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'featured':
            default:
                return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
    });

    const totalCartItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">المتجر</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">مكملات ومنتجات صحية</p>
                </div>

                <Link href={createPageUrl('Checkout')}>
                    <Button variant="outline" className="relative glass border-0 rounded-xl">
                        <ShoppingCart className="w-5 h-5 text-[#2D9B83]" />
                        {totalCartItems > 0 && (
                            <Badge className="absolute -top-2 -left-2 w-5 h-5 p-0 flex items-center justify-center gradient-primary text-white text-xs border-0">
                                {totalCartItems}
                            </Badge>
                        )}
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                    placeholder="ابحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass border-0 rounded-xl pr-12 h-12"
                />
            </div>

            {/* Filters */}
            <ShopFilters
                category={category}
                setCategory={setCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
            />

            {/* Products Grid */}
            {isLoading ? (
                <ProductGridSkeleton />
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">لا توجد منتجات</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">جرب تغيير معايير البحث</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={() => addToCartMutation.mutate(product)}
                        />
                    ))}
                </div>
            )}

            {/* AI Product Recommendations */}
            <div className="mt-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <span className="font-bold text-slate-800 text-sm">توصيات ذكية</span>
                    </div>
                    <Button
                        size="sm"
                        className="bg-purple-600 text-white rounded-xl h-8 text-xs"
                        disabled={aiLoading}
                        onClick={async () => {
                            setAiLoading(true);
                            try {
                                const result = await aiClient.recommendProducts({
                                    category: category !== 'all' ? category : 'مكملات صحية',
                                    available_products: products.map((p: any) => p.name).slice(0, 10)
                                });
                                setAiRecs(result);
                            } catch { }
                            finally { setAiLoading(false); }
                        }}
                    >
                        {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 ml-1" />}
                        {aiLoading ? 'جاري...' : 'اقترح لي'}
                    </Button>
                </div>
                {aiRecs && (
                    <div className="space-y-2 mt-2">
                        {aiRecs.recommendations?.map((rec: any, i: number) => (
                            <div key={i} className="bg-white/70 rounded-xl p-3">
                                <p className="text-sm font-bold text-slate-800">{rec.product || rec.name}</p>
                                <p className="text-xs text-slate-500">{rec.reason || rec.benefits}</p>
                            </div>
                        ))}
                        {aiRecs.general_tips?.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-purple-700 mb-1">💡 نصائح:</p>
                                {aiRecs.general_tips.map((t: string, i: number) => (
                                    <p key={i} className="text-xs text-slate-600 mr-2">• {t}</p>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="pb-24" />
        </div>
    );
}
