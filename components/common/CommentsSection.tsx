import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, User, Send, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import moment from 'moment';

export default function CommentsSection({ targetType, targetId, showRating = true }) {
    const [user, setUser] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const queryClient = useQueryClient();

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => { });
    }, []);

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', targetType, targetId],
        queryFn: async () => {
            const allComments = await base44.entities.Comment.filter({
                target_type: targetType,
                target_id: targetId,
                is_approved: true
            }, '-created_date');
            return allComments;
        },
        enabled: !!targetId,
    });

    const addCommentMutation = useMutation({
        mutationFn: async () => {
            return base44.entities.Comment.create({
                content: newComment,
                rating: showRating ? rating : null,
                target_type: targetType,
                target_id: targetId,
                user_name: user?.full_name || 'زائر',
                user_email: user?.email || '',
                is_approved: true
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', targetType, targetId] });
            setNewComment('');
            setRating(5);
            toast.success('تم إضافة تعليقك بنجاح');
        },
        onError: () => {
            toast.error('حدث خطأ في إضافة التعليق');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            toast.error('الرجاء كتابة تعليق');
            return;
        }
        addCommentMutation.mutate();
    };

    const avgRating = comments.length > 0
        ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.filter(c => c.rating).length).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#2D9B83]" />
                    <h3 className="font-bold text-slate-800">التعليقات ({comments.length})</h3>
                </div>
                {showRating && comments.length > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-slate-200'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium text-slate-600">{avgRating}</span>
                    </div>
                )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-4 space-y-4">
                {showRating && (
                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">تقييمك</p>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none"
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
                    placeholder="اكتب تعليقك هنا..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px] resize-none border-slate-200"
                />

                <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                        {user ? `معلق باسم: ${user.full_name}` : 'سجل دخولك للتعليق باسمك'}
                    </p>
                    <Button
                        type="submit"
                        disabled={addCommentMutation.isPending}
                        className="gradient-primary rounded-xl"
                    >
                        {addCommentMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4 ml-2" />
                                إرسال
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Comments List */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#2D9B83]" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500">لا توجد تعليقات بعد. كن أول المعلقين!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="glass rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-slate-800">{comment.user_name || 'زائر'}</span>
                                        <span className="text-xs text-slate-400">
                                            {moment(comment.created_date).fromNow()}
                                        </span>
                                    </div>
                                    {comment.rating && (
                                        <div className="flex gap-0.5 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-3 h-3 ${star <= comment.rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-slate-200'}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-slate-600 text-sm leading-relaxed">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}