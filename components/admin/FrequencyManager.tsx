import React, { useState } from 'react';
import { Waves, Plus, Edit, Trash2, Search, Play, StopCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Frequency {
    id: string;
    name: string;
    frequency_hz: number;
    category: string;
    description: string;
    benefits: string[];
    color?: string;
    file_url?: string; // Optional: if we want to support custom audio files later
    [key: string]: unknown;
}

interface FrequencyManagerProps {
    frequencies: Frequency[];
    onSave: (data: any, id?: string) => Promise<void>;
    onDelete: (id: string) => void;
}

export default function FrequencyManager({ frequencies, onSave, onDelete }: FrequencyManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFreq, setEditingFreq] = useState<Frequency | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        frequency_hz: '',
        category: 'solfeggio',
        description: '',
        benefits: '', // comma separated strings
        color: '#2D9B83'
    });

    const handleEdit = (freq: Frequency) => {
        setEditingFreq(freq);
        setFormData({
            name: freq.name,
            frequency_hz: String(freq.frequency_hz),
            category: freq.category || 'solfeggio',
            description: freq.description || '',
            benefits: Array.isArray(freq.benefits) ? freq.benefits.join(', ') : '',
            color: freq.color || '#2D9B83'
        });
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingFreq(null);
        setFormData({
            name: '', frequency_hz: '', category: 'solfeggio',
            description: '', benefits: '', color: '#2D9B83'
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const benefitsArray = formData.benefits.split(',').map(b => b.trim()).filter(b => b.length > 0);
            await onSave({
                ...formData,
                frequency_hz: Number(formData.frequency_hz),
                benefits: benefitsArray
            }, editingFreq?.id);
            setIsDialogOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFrequencies = frequencies.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="بحث عن تردد..."
                        className="pr-10 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="w-4 h-4 ml-2" />
                    تردد جديد
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFrequencies.map((freq) => (
                    <div key={freq.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all group">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                            style={{ backgroundColor: freq.color || '#2D9B83' }}
                        >
                            {freq.frequency_hz}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 line-clamp-1">{freq.name}</h3>
                            <p className="text-xs text-slate-500 mb-1">{freq.category}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {Array.isArray(freq.benefits) && freq.benefits.slice(0, 2).map((b, i) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{b}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(freq)}>
                                <Edit className="w-4 h-4 text-slate-500" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => onDelete(freq.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingFreq ? 'تعديل التردد' : 'إضافة تردد جديد'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input placeholder="الاسم (مثلاً: تردد السعادة)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium">التردد (Hz)</label>
                                <Input type="number" value={formData.frequency_hz} onChange={e => setFormData({ ...formData, frequency_hz: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">اللون (Hex)</label>
                                <div className="flex gap-2">
                                    <Input type="color" className="w-12 p-1 h-10" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                                    <Input value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                            <SelectTrigger><SelectValue placeholder="التصنيف" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="solfeggio">سولفيجيو (Solfeggio)</SelectItem>
                                <SelectItem value="brainwave">موجات الدماغ (Brainwaves)</SelectItem>
                                <SelectItem value="chakra">الشاكرات (Chakras)</SelectItem>
                                <SelectItem value="organ">أعضاء الجسم (Organs)</SelectItem>
                                <SelectItem value="planetary">الكواكب (Planetary)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Textarea placeholder="الوصف" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        <Textarea placeholder="الفوائد (افصل بينها بفاصلة)" value={formData.benefits} onChange={e => setFormData({ ...formData, benefits: e.target.value })} />

                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
