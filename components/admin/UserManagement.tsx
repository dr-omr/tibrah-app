import React, { useState } from 'react';
import { Users, Search, Filter, Crown, Clock, ChevronDown, Mail, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user' | 'premium';
    subscription: 'free' | 'basic' | 'premium' | 'enterprise';
    joinDate: string;
    lastActive: string;
    status: 'active' | 'inactive' | 'suspended';
}

interface UserManagementProps {
    users?: User[];
    isLoading?: boolean;
}

const defaultUsers: User[] = [
    {
        id: '1',
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        role: 'premium',
        subscription: 'premium',
        joinDate: '٢٠٢٤/٠١/١٥',
        lastActive: 'منذ ساعة',
        status: 'active'
    },
    {
        id: '2',
        name: 'سارة علي',
        email: 'sara@example.com',
        role: 'user',
        subscription: 'basic',
        joinDate: '٢٠٢٤/٠٢/٢٠',
        lastActive: 'منذ ٣ أيام',
        status: 'active'
    },
    {
        id: '3',
        name: 'خالد عبدالله',
        email: 'khalid@example.com',
        role: 'user',
        subscription: 'free',
        joinDate: '٢٠٢٤/٠٣/١٠',
        lastActive: 'منذ أسبوع',
        status: 'inactive'
    },
    {
        id: '4',
        name: 'فاطمة حسن',
        email: 'fatima@example.com',
        role: 'admin',
        subscription: 'enterprise',
        joinDate: '٢٠٢٣/١٢/٠١',
        lastActive: 'الآن',
        status: 'active'
    },
];

export default function UserManagement({ users = defaultUsers, isLoading = false }: UserManagementProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterSubscription, setFilterSubscription] = useState<string>('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        const matchesSubscription = filterSubscription === 'all' || user.subscription === filterSubscription;
        return matchesSearch && matchesStatus && matchesSubscription;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-700 border-0">نشط</Badge>;
            case 'inactive':
                return <Badge className="bg-slate-100 text-slate-600 border-0">غير نشط</Badge>;
            case 'suspended':
                return <Badge className="bg-red-100 text-red-700 border-0">موقوف</Badge>;
            default:
                return null;
        }
    };

    const getSubscriptionBadge = (subscription: string) => {
        switch (subscription) {
            case 'enterprise':
                return <Badge className="bg-purple-100 text-purple-700 border-0">مؤسسي</Badge>;
            case 'premium':
                return <Badge className="bg-amber-100 text-amber-700 border-0">مميز</Badge>;
            case 'basic':
                return <Badge className="bg-blue-100 text-blue-700 border-0">أساسي</Badge>;
            case 'free':
                return <Badge className="bg-slate-100 text-slate-600 border-0">مجاني</Badge>;
            default:
                return null;
        }
    };

    const getRoleIcon = (role: string) => {
        if (role === 'admin') {
            return <Crown className="w-4 h-4 text-amber-500" />;
        }
        return null;
    };

    // Stats
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const premiumUsers = users.filter(u => ['premium', 'enterprise'].includes(u.subscription)).length;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{totalUsers}</p>
                            <p className="text-sm text-slate-500">إجمالي المستخدمين</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{activeUsers}</p>
                            <p className="text-sm text-slate-500">مستخدمين نشطين</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{premiumUsers}</p>
                            <p className="text-sm text-slate-500">اشتراكات مميزة</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="بحث بالاسم أو البريد..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10"
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">كل الحالات</SelectItem>
                            <SelectItem value="active">نشط</SelectItem>
                            <SelectItem value="inactive">غير نشط</SelectItem>
                            <SelectItem value="suspended">موقوف</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterSubscription} onValueChange={setFilterSubscription}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="الاشتراك" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">كل الاشتراكات</SelectItem>
                            <SelectItem value="enterprise">مؤسسي</SelectItem>
                            <SelectItem value="premium">مميز</SelectItem>
                            <SelectItem value="basic">أساسي</SelectItem>
                            <SelectItem value="free">مجاني</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">المستخدم</th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">الاشتراك</th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">الحالة</th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">تاريخ التسجيل</th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">آخر نشاط</th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] flex items-center justify-center text-white font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-slate-800">{user.name}</p>
                                                    {getRoleIcon(user.role)}
                                                </div>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{getSubscriptionBadge(user.subscription)}</td>
                                    <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{user.joinDate}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{user.lastActive}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        لا يوجد مستخدمين مطابقين للبحث
                    </div>
                )}
            </div>
        </div>
    );
}
