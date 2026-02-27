import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '../../utils';
import { ShoppingCart, Heart, Star, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const whatsappLink = (productName) => `https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20الاستفسار%20عن%20منتج:%20${encodeURIComponent(productName)}`;

export default function ProductCard({ product, onAddToCart }: { product: any; onAddToCart: (p: any) => void }) {
    const hasDiscount = product.original_price && product.original_price > product.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.price / product.original_price) * 100)
        : 0;

    return (
        <div className="glass rounded-2xl overflow-hidden hover:shadow-glow transition-all duration-300 group">
            <Link href={createPageUrl(`ProductDetails?id=${product.id}`)}>
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl">💊</span>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {product.featured && (
                            <Badge className="gradient-gold text-white border-0 text-[10px]">
                                مميز
                            </Badge>
                        )}
                        {hasDiscount && (
                            <Badge className="bg-red-500 text-white border-0 text-[10px]">
                                -{discountPercent}%
                            </Badge>
                        )}
                    </div>

                    {/* Wishlist */}
                    <button className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="w-4 h-4 text-slate-400 hover:text-red-500" />
                    </button>

                    {!product.in_stock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">نفذت الكمية</span>
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4">
                <Link href={createPageUrl(`ProductDetails?id=${product.id}`)}>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-2 hover:text-[#2D9B83] transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {product.name_en && (
                    <p className="text-xs text-slate-400 mb-2">{product.name_en}</p>
                )}

                <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-3 h-3 ${i < 4 ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-slate-200'}`}
                        />
                    ))}
                    <span className="text-xs text-slate-400 mr-1">(٤.٨)</span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-[#2D9B83]">{product.price}</span>
                            <span className="text-sm text-slate-500">ر.س</span>
                        </div>
                        {hasDiscount && (
                            <span className="text-sm text-slate-400 line-through">
                                {product.original_price} ر.س
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <a
                            href={whatsappLink(product.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button
                                size="icon"
                                className="bg-green-500 hover:bg-green-600 rounded-xl w-10 h-10"
                            >
                                <MessageCircle className="w-5 h-5" />
                            </Button>
                        </a>
                        <Button
                            size="icon"
                            className="gradient-primary rounded-xl w-10 h-10 hover:opacity-90"
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