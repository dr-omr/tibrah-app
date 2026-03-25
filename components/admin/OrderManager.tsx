import React, { useState } from 'react';
import { Package, CheckCircle2, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Helper component for status badges
const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'pending': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">⏳ قيد المراجعة</Badge>;
        case 'confirmed': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">✅ مؤكد (تم الدفع)</Badge>;
        case 'processing': return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">📦 جاري التجهيز</Badge>;
        case 'shipped': return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-200">🚚 في الطريق</Badge>;
        case 'delivered': return <Badge className="bg-green-500/10 text-green-600 border-green-200">🎉 مكتمل</Badge>;
        case 'cancelled': return <Badge className="bg-red-500/10 text-red-600 border-red-200">❌ ملغي</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

export default function OrderManager({ orders, onUpdateStatus, isMutating }: { orders: any[], onUpdateStatus: (id: string, status: string) => void, isMutating?: boolean }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Filter orders
    const filteredOrders = orders.filter((order: any) => {
        const matchesSearch = 
            (order.user_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.user_phone?.includes(searchTerm)) ||
            (order.transaction_id?.includes(searchTerm));
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-slate-500 text-sm mb-1">الطلبات الجديدة</div>
                        <div className="text-2xl font-bold text-slate-800">{orders.filter((o:any) => o.status === 'pending').length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-slate-500 text-sm mb-1">جاري التجهيز</div>
                        <div className="text-2xl font-bold text-primary">{orders.filter((o:any) => ['confirmed', 'processing'].includes(o.status)).length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-slate-500 text-sm mb-1">مكتملة</div>
                        <div className="text-2xl font-bold text-green-600">{orders.filter((o:any) => o.status === 'delivered').length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-slate-500 text-sm mb-1">إجمالي المبيعات</div>
                        <div className="text-2xl font-bold text-slate-800">
                            {orders.filter((o:any) => o.status === 'delivered').reduce((sum:number, o:any) => sum + o.total, 0)} ر.س
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="ابحث بالاسم، رقم الهاتف، أو رقم الحوالة..." 
                            className="pl-4 pr-10 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                            <Button 
                                key={status}
                                variant={statusFilter === status ? 'default' : 'outline'}
                                className="whitespace-nowrap bg-white"
                                onClick={() => setStatusFilter(status)}
                            >
                                {status === 'all' ? 'الكل' : <StatusBadge status={status} />}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-600">لا توجد طلبات تطابق بحثك</h3>
                        </div>
                    ) : (
                        filteredOrders.map((order: any) => (
                            <div key={order.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                <div className="flex flex-col md:flex-row gap-4 justify-between">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-800 text-lg">{order.user_name}</span>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-slate-50 p-4 rounded-2xl">
                                            <div>
                                                <span className="text-slate-500 block mb-1">المبلغ</span>
                                                <span className="font-bold text-primary">{order.total} ر.س</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block mb-1">طريقة الدفع</span>
                                                <span className="font-semibold text-slate-700">{order.payment_method}</span>
                                            </div>
                                            {order.transaction_id && (
                                                <div className="col-span-2">
                                                    <span className="text-slate-500 block mb-1">رقم حوالة / إشعار</span>
                                                    <span className="font-mono text-slate-800 bg-slate-200 px-2 py-0.5 rounded text-xs select-all">{order.transaction_id}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border border-slate-100 rounded-2xl p-4">
                                            <h4 className="text-sm font-bold text-slate-700 mb-2">عناصر الطلب:</h4>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                {order.items?.map((item: any, i: number) => (
                                                    <li key={i} className="flex justify-between items-center">
                                                        <span>{item.quantity} × {item.product_name}</span>
                                                        <span className="font-medium">{item.price * item.quantity} ر.س</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-row md:flex-col gap-2 min-w-[200px]">
                                        <div className="text-sm font-bold text-slate-800 mb-2 hidden md:block">تحديث الحالة:</div>
                                        <Button 
                                            variant="outline" 
                                            className="justify-start border-blue-200 hover:bg-blue-50 text-blue-700 w-full"
                                            disabled={isMutating || order.status === 'confirmed'}
                                            onClick={() => onUpdateStatus(order.id, 'confirmed')}
                                        >
                                            <CheckCircle2 className="w-4 h-4 ml-2" /> تأكيد الدفع
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="justify-start border-purple-200 hover:bg-purple-50 text-purple-700 w-full"
                                            disabled={isMutating || order.status === 'processing'}
                                            onClick={() => onUpdateStatus(order.id, 'processing')}
                                        >
                                            <Package className="w-4 h-4 ml-2" /> تجهيز الطلب
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="justify-start border-green-200 hover:bg-green-50 text-green-700 w-full"
                                            disabled={isMutating || order.status === 'delivered'}
                                            onClick={() => onUpdateStatus(order.id, 'delivered')}
                                        >
                                            <CheckCircle2 className="w-4 h-4 ml-2" /> تسليم (اكتمل)
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="justify-start border-red-200 hover:bg-red-50 text-red-700 w-full"
                                            disabled={isMutating || order.status === 'cancelled'}
                                            onClick={() => onUpdateStatus(order.id, 'cancelled')}
                                        >
                                            <CheckCircle2 className="w-4 h-4 ml-2" /> إلغاء الطلب
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
        </div>
    );
}
