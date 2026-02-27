import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Star, User, Send, MessageCircle, Loader2, ThumbsUp, Reply,
    MoreVertical, Flag, Trash2, Heart
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

// TypeScript Interfaces
interface Comment {
    id: string;
    content: string;
    rating?: number;
    user_name?: string;
    user_email?: string;
    created_date: string;
    likes?: number;
    replies?: Reply[];
    parent_id?: string;
}

interface Reply {
    id: string;
    content: string;
    user_name: string;
    created_date: string;
}

interface UserData {
    full_name?: string;
    email?: string;
    avatar_url?: string;
}

interface CommentsSectionProps {
    targetType: string;
    targetId: string;
    showRating?: boolean;
}

export default function CommentsSection({ targetType, targetId, showRating = true }: CommentsSectionProps) {
    // const [user, setUser] = useState<UserData | null>(null); // Removed to avoid collision with useAuth
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
    const queryClient = useQueryClient();

    const { user } = useAuth();

    useEffect(() => {
        // user is already handled by useAuth

        // Load liked comments from localStorage
        const saved = localStorage.getItem(`liked_comments_${targetId}`);
        if (saved) {
            setLikedComments(new Set(JSON.parse(saved)));
        }
    }, [targetId, user]);

    const { data: comments = [], isLoading, isError, refetch } = useQuery<Comment[]>({
        queryKey: ['comments', targetType, targetId],
        queryFn: async () => {
            try {
                const allComments = await db.entities.Comment.filter({
                    target_type: targetType,
                    target_id: targetId,
                    is_approved: true
                }, '-created_date');
                return allComments as unknown as Comment[];
            } catch (error) {
                console.error('[Comments] Error fetching comments:', error);
                return [];
            }
        },
        enabled: !!targetId,
        retry: 2,
        staleTime: 30000,
    });

    const addCommentMutation = useMutation({
        mutationFn: async () => {
            return db.entities.Comment.create({
                content: newComment,
                rating: showRating ? rating : null,
                target_type: targetType,
                target_id: targetId,
                user_name: user?.name || (user as any)?.full_name || 'زائر',
                user_email: user?.email || '',
                is_approved: true,
                likes: 0
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', targetType, targetId] });
            setNewComment('');
            setRating(5);
            toast.success('تم إضافة تعليقك بنجاح ✨');
        },
        onError: () => {
            toast.error('حدث خطأ في إضافة التعليق');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) {
            toast.error('الرجاء كتابة تعليق');
            return;
        }
        addCommentMutation.mutate();
    };

    const handleLike = async (commentId: string) => {
        const newLiked = new Set(likedComments);
        if (newLiked.has(commentId)) {
            newLiked.delete(commentId);
        } else {
            newLiked.add(commentId);
        }
        setLikedComments(newLiked);
        localStorage.setItem(`liked_comments_${targetId}`, JSON.stringify([...newLiked]));

        // Optional: Update in backend
        toast.success(newLiked.has(commentId) ? 'تم الإعجاب 💚' : 'تم إزالة الإعجاب');
    };

    const handleReply = (commentId: string) => {
        if (replyingTo === commentId) {
            setReplyingTo(null);
            setReplyContent('');
        } else {
            setReplyingTo(commentId);
        }
    };

    const avgRating = comments.length > 0
        ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.filter(c => c.rating).length).toFixed(1)
        : '0';

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: comments.filter(c => c.rating === star).length,
        percentage: comments.length > 0
            ? (comments.filter(c => c.rating === star).length / comments.length) * 100
            : 0
    }));

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="glass rounded-2xl p-5">
                <div className="flex items-start gap-6">
                    {/* Rating Summary */}
                    {showRating && comments.length > 0 && (
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#2D9B83]">{avgRating}</div>
                            <div className="flex justify-center gap-0.5 my-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= Math.round(Number(avgRating))
                                            ? 'text-[#D4AF37] fill-[#D4AF37]'
                                            : 'text-slate-200'}`}
                                    />
                                ))}
                            </div>
                            <div className="text-xs text-slate-500">{comments.length} تقييم</div>
                        </div>
                    )}

                    {/* Rating Bars */}
                    {showRating && comments.length > 0 && (
                        <div className="flex-1 space-y-1.5">
                            {ratingDistribution.map(({ star, count, percentage }) => (
                                <div key={star} className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 w-3">{star}</span>
                                    <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400 w-6">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-700">
                            {user?.name || (user as any)?.full_name || 'زائر'}
                        </p>
                        <p className="text-xs text-slate-400">اكتب تعليقك</p>
                    </div>
                </div>

                {showRating && (
                    <div className="flex items-center gap-3 px-2">
                        <span className="text-sm text-slate-600">تقييمك:</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-7 h-7 transition-colors ${star <= (hoverRating || rating)
                                            ? 'text-[#D4AF37] fill-[#D4AF37]'
                                            : 'text-slate-200 hover:text-[#D4AF37]/50'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <Textarea
                    placeholder="شاركنا رأيك أو تجربتك..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px] resize-none border-slate-200 focus:border-[#2D9B83] rounded-xl"
                />

                <div className="flex items-center justify-end">
                    <Button
                        type="submit"
                        disabled={addCommentMutation.isPending || !newComment.trim()}
                        className="gradient-primary rounded-xl px-6"
                    >
                        {addCommentMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4 ml-2" />
                                نشر التعليق
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Comments List */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#2D9B83]" />
                </div>
            ) : isError ? (
                <div className="text-center py-12 glass rounded-2xl">
                    <MessageCircle className="w-16 h-16 mx-auto text-red-300 mb-4" />
                    <h4 className="font-bold text-slate-600 mb-2">حدث خطأ في تحميل التعليقات</h4>
                    <p className="text-slate-400 text-sm mb-4">يرجى المحاولة مرة أخرى</p>
                    <Button
                        onClick={() => refetch()}
                        variant="outline"
                        className="text-[#2D9B83] border-[#2D9B83]"
                    >
                        إعادة المحاولة
                    </Button>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 glass rounded-2xl">
                    <MessageCircle className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                    <h4 className="font-bold text-slate-600 mb-2">لا توجد تعليقات بعد</h4>
                    <p className="text-slate-400 text-sm">كن أول من يشارك رأيه!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="glass rounded-2xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] flex items-center justify-center flex-shrink-0">
                                    <User className="w-6 h-6 text-white" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800">
                                                {comment.user_name || 'زائر'}
                                            </span>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs text-slate-400">
                                                {formatDistanceToNow(new Date(comment.created_date), {
                                                    addSuffix: true,
                                                    locale: ar
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    {comment.rating && (
                                        <div className="flex gap-0.5 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= comment.rating!
                                                        ? 'text-[#D4AF37] fill-[#D4AF37]'
                                                        : 'text-slate-200'}`}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Comment Text */}
                                    <p className="text-slate-600 leading-relaxed mb-3">
                                        {comment.content}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleLike(comment.id)}
                                            className={`flex items-center gap-1.5 text-sm transition-colors ${likedComments.has(comment.id)
                                                ? 'text-[#2D9B83]'
                                                : 'text-slate-400 hover:text-[#2D9B83]'
                                                }`}
                                        >
                                            <Heart className={`w-4 h-4 ${likedComments.has(comment.id) ? 'fill-current' : ''
                                                }`} />
                                            <span>{(comment.likes || 0) + (likedComments.has(comment.id) ? 1 : 0)}</span>
                                        </button>
                                        <button
                                            onClick={() => handleReply(comment.id)}
                                            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#2D9B83] transition-colors"
                                        >
                                            <Reply className="w-4 h-4" />
                                            <span>رد</span>
                                        </button>
                                    </div>

                                    {/* Reply Form */}
                                    {replyingTo === comment.id && (
                                        <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                                            <Textarea
                                                placeholder="اكتب ردك..."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                className="min-h-[60px] resize-none border-slate-200 rounded-lg text-sm"
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setReplyingTo(null)}
                                                >
                                                    إلغاء
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="gradient-primary"
                                                    disabled={!replyContent.trim()}
                                                >
                                                    إرسال الرد
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}