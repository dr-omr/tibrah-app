import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '../../utils';
import { ShoppingCart, Heart, Star, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const whatsappLink = (productName: string) => `https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20الاستفسار%20عن%20منتج:%20${encodeURIComponent(productName)}`;

export default function ProductCard({ product, onAddToCart }: { product: any; onAddToCart: (p: any) => void }) {
    const hasDiscount = product.original_price && product.original_price > product.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.price / product.original_price) * 100)
        : 0;

    return (
        <div className="glass rounded-3xl overflow-hidden hover:shadow-glow transition-all duration-500 group border border-white/40 dark:border-white/10 relative">
            {/* Top Badges Layer */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                {product.featured && (
                    <Badge className="bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 border-0 text-[10px] uppercase font-bold tracking-wider px-2 py-1 shadow-sm">
                        موصى به
                    </Badge>
                )}
                {hasDiscount && (
                    <Badge className="bg-red-500/90 backdrop-blur-md text-white border-0 text-[10px] font-bold px-2 py-1 shadow-sm">
                        خصم {discountPercent}%
                    </Badge>
                )}
            </div>

            {/* Subscribe & Save Badge */}
            {product.is_subscription_eligible && (
                <div className="absolute top-3 left-3 z-10">
                    <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-primary border border-primary/20 text-[10px] font-bold px-2 py-1 shadow-sm flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        اشتراك وتوفير
                    </Badge>
                </div>
            )}

            <Link href={createPageUrl(`ProductDetails?id=${product.id}`)}>
                <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 flex items-center justify-center p-6">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-xl"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/50 rounded-2xl">
                            <span className="text-6xl drop-shadow-md">💊</span>
                        </div>
                    )}

                    {!product.in_stock && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                            <Badge variant="destructive" className="px-4 py-2 text-sm">نفذت الكمية</Badge>
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-5 relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                <Link href={createPageUrl(`ProductDetails?id=${product.id}`)}>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-2 hover:text-primary transition-colors text-[15px] leading-snug">
                        {product.name}
                    </h3>
                </Link>

                {product.name_en && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mb-3">{product.name_en}</p>
                )}

                <div className="flex items-center gap-1 mb-4">
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < Math.round(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                            />
                        ))}
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                        {product.rating ? `(${product.rating.toFixed?.(1) || product.rating})` : '—'}
                        {product.review_count ? <span className="text-slate-400 mr-1"> ({product.review_count})</span> : null}
                    </span>
                </div>

                <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium mb-0.5">
                                {product.original_price} ر.س
                            </span>
                        )}
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-primary tracking-tight">{product.price}</span>
                            <span className="text-xs font-bold text-slate-500">ر.س</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={whatsappLink(product.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-green-500 hover:text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 p-2.5 rounded-full transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </a>
                        <Button
                            size="icon"
                            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 rounded-full w-11 h-11 transform active:scale-95 transition-all"
                            onClick={(e) => {
                                e.preventDefault();
                                if (product.in_stock !== false) {
                                    onAddToCart(product);
                                }
                            }}
                            disabled={product.in_stock === false}
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}