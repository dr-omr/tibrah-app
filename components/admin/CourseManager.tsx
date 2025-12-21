import React, { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, Search, Loader2, PlayCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    level: string;
    category: string;
    thumbnail_url?: string;
    is_free?: boolean;
    status: 'published' | 'draft';
    [key: string]: unknown;
}

interface CourseManagerProps {
    courses: Course[];
    onSave: (data: any, id?: string) => Promise<void>;
    onDelete: (id: string) => void;
}

export default function CourseManager({ courses, onSave, onDelete }: CourseManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '0',
        level: 'beginner',
        category: 'functional_medicine',
        thumbnail_url: '',
        is_free: false,
        status: 'draft',
        duration_hours: '0',
        lessons_count: '0'
    });

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            title: course.title,
            description: course.description || '',
            price: String(course.price || 0),
            level: course.level || 'beginner',
            category: course.category || 'functional_medicine',
            thumbnail_url: course.thumbnail_url || '',
            is_free: !!course.is_free,
            status: course.status || 'draft',
            duration_hours: String(course.duration_hours || 0),
            lessons_count: String(course.lessons_count || 0)
        });
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingCourse(null);
        setFormData({
            title: '', description: '', price: '0', level: 'beginner',
            category: 'functional_medicine', thumbnail_url: '', is_free: false,
            status: 'draft', duration_hours: '0', lessons_count: '0'
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await onSave({
                ...formData,
                price: Number(formData.price),
                duration_hours: Number(formData.duration_hours),
                lessons_count: Number(formData.lessons_count)
            }, editingCourse?.id);
            setIsDialogOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="بحث عن دورة..."
                        className="pr-10 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleCreate} className="bg-amber-500 hover:bg-amber-600">
                    <Plus className="w-4 h-4 ml-2" />
                    دورة جديدة
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 hover:border-amber-200 transition-all group">
                        <div className="w-20 h-20 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden relative">
                            {course.thumbnail_url ? (
                                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                            )}
                            {course.status === 'draft' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">مسودة</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 line-clamp-1">{course.title}</h3>
                            <p className="text-xs text-slate-500 mb-1">{course.level} • {course.category}</p>
                            <div className="flex items-center justify-between mt-2">
                                <span className={`font-bold ${course.is_free ? 'text-green-500' : 'text-amber-600'}`}>
                                    {course.is_free ? 'مجاني' : `${course.price} ر.س`}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(course)}>
                                        <Edit className="w-4 h-4 text-slate-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => onDelete(course.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input placeholder="عنوان الدورة" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        <Textarea placeholder="وصف الدورة" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium">السعر (ر.س)</label>
                                <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} disabled={formData.is_free} />
                            </div>
                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                                <span className="text-sm">دورة مجانية؟</span>
                                <Switch checked={formData.is_free} onCheckedChange={(c) => setFormData({ ...formData, is_free: c, price: c ? '0' : formData.price })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Select value={formData.level} onValueChange={v => setFormData({ ...formData, level: v })}>
                                <SelectTrigger><SelectValue placeholder="المستوى" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">مبتدئ</SelectItem>
                                    <SelectItem value="intermediate">متوسط</SelectItem>
                                    <SelectItem value="advanced">متقدم</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                                <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">مسودة</SelectItem>
                                    <SelectItem value="published">منشور</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Input placeholder="رابط الصورة (URL)" value={formData.thumbnail_url} onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })} />

                        <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
