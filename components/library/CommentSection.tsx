import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User as UserIcon, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userImage?: string;
    content: string;
    date: string;
    likes: number;
}

interface CommentSectionProps {
    articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
    const { user, isAuthenticated } = useAuth();
    const [commentText, setCommentText] = useState('');

    // Mock initial comments
    const [comments, setComments] = useState<Comment[]>([
        {
            id: '1',
            userId: 'user1',
            userName: 'أحمد محمد',
            content: 'مقال رائع جداً، شكراً دكتور عمر على هذه المعلومات القيمة.',
            date: 'منذ ساعتين',
            likes: 5
        },
        {
            id: '2',
            userId: 'user2',
            userName: 'سارة علي',
            content: 'هل يمكن تطبيق هذا البروتوكول للأطفال؟',
            date: 'منذ 5 ساعات',
            likes: 2
        }
    ]);

    const handleSubmit = () => {
        if (!commentText.trim()) return;

        const newComment: Comment = {
            id: Math.random().toString(),
            userId: user?.id || 'guest',
            userName: user?.displayName || user?.name || 'مستخدم',
            userImage: user?.photoURL,
            content: commentText,
            date: 'الآن',
            likes: 0
        };

        setComments([newComment, ...comments]);
        setCommentText('');
        toast.success('تم إضافة تعليقك بنجاح');
    };

    return (
        <div className="mt-12 border-t border-slate-100 pt-8" id="comments">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                التعليقات
                <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {comments.length}
                </span>
            </h3>

            {/* Comment Input */}
            <div className="mb-8">
                {isAuthenticated ? (
                    <div className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={user?.photoURL} />
                            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                            <Textarea
                                placeholder="اكتب تعليقك هنا..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="min-h-[100px] bg-slate-50 border-slate-200 focus:border-[#2D9B83]"
                            />
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSubmit}
                                    className="bg-[#2D9B83] hover:bg-[#268b74] text-white"
                                    disabled={!commentText.trim()}
                                >
                                    <Send className="w-4 h-4 ml-2" />
                                    نشر التعليق
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Lock className="w-6 h-6 text-slate-400" />
                        </div>
                        <h4 className="font-semibold text-slate-700 mb-2">سجّل دخولك للمشاركة</h4>
                        <p className="text-slate-500 text-sm mb-4">يجب أن تكون عضواً لتتمكن من كتابة التعليقات والمشاركة في النقاش</p>
                        <Button variant="outline" className="border-[#2D9B83] text-[#2D9B83] hover:bg-[#2D9B83] hover:text-white">
                            تسجيل الدخول
                        </Button>
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 group">
                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                            <AvatarImage src={comment.userImage} />
                            <AvatarFallback className="bg-slate-100 text-slate-600">
                                {comment.userName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="bg-slate-50 rounded-2xl rounded-tr-none p-4 hover:shadow-sm transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-sm text-slate-800">{comment.userName}</h4>
                                    <span className="text-xs text-slate-400">{comment.date}</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 mt-2 mr-2">
                                <button className="text-xs text-slate-500 hover:text-[#2D9B83] font-medium">إعجاب ({comment.likes})</button>
                                <button className="text-xs text-slate-500 hover:text-[#2D9B83] font-medium">رد</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
