import React, { useRef, useState } from 'react';
import { Upload, Camera, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadProps {
    onImageSelected: (base64: string, mimeType: string) => void;
    isLoading: boolean;
}

export function ImageUpload({ onImageSelected, isLoading }: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('يرجى اختيار ملف صورة فقط');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('حجم الصورة كبير جداً (أقصى حد 5 ميجابايت)');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
            onImageSelected(result, file.type);
        };
        reader.readAsDataURL(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const clearImage = () => {
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleChange}
            />

            {!preview ? (
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isLoading}
                        className="text-slate-500 hover:text-[#2D9B83] hover:bg-[#2D9B83]/10 rounded-full transition-all"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="w-6 h-6" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isLoading}
                        className="text-slate-500 hover:text-[#2D9B83] hover:bg-[#2D9B83]/10 rounded-full transition-all md:hidden"
                        onClick={() => {
                            // Trigger camera on mobile
                            if (fileInputRef.current) {
                                fileInputRef.current.setAttribute('capture', 'environment');
                                fileInputRef.current.click();
                                // Reset capture after click so standard upload still works
                                setTimeout(() => { if (fileInputRef.current) fileInputRef.current.removeAttribute('capture'); }, 500);
                            }
                        }}
                    >
                        <Camera className="w-6 h-6" />
                    </Button>
                </div>
            ) : (
                <div className="relative inline-block mt-2 animate-in fade-in zoom-in duration-300">
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="h-20 w-auto rounded-xl border border-slate-200 shadow-sm object-cover"
                        />
                        <button
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors z-10"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
