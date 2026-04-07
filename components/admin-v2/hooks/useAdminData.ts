// components/admin-v2/hooks/useAdminData.ts
// React Query hooks for all admin data fetching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminDataService } from '../services/adminDataService';
import { toast } from '@/components/notification-engine';

// ─── Query Keys ───
export const adminQueryKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  users: ['admin', 'users'] as const,
  orders: ['admin', 'orders'] as const,
  orderCounts: ['admin', 'orders', 'counts'] as const,
  appointments: ['admin', 'appointments'] as const,
  products: ['admin', 'products'] as const,
  courses: ['admin', 'courses'] as const,
  articles: ['admin', 'articles'] as const,
  frequencies: ['admin', 'frequencies'] as const,
  foods: ['admin', 'foods'] as const,
  recipes: ['admin', 'recipes'] as const,
  dailyLogs: ['admin', 'dailyLogs'] as const,
  symptomLogs: ['admin', 'symptomLogs'] as const,
  diagnosticResults: ['admin', 'diagnosticResults'] as const,
  triageRecords: ['admin', 'triageRecords'] as const,
  auditLogs: ['admin', 'auditLogs'] as const,
};

// ─── Dashboard ───
export function useDashboardOverview(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.dashboard,
    queryFn: adminDataService.dashboard.getOverview,
    enabled,
    staleTime: 30_000,
  });
}

// ─── Users ───
export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.users,
    queryFn: adminDataService.users.getAll,
    enabled,
  });
}

// ─── Orders ───
export function useAdminOrders(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.orders,
    queryFn: adminDataService.orders.getAll,
    enabled,
  });
}

export function useOrderStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminDataService.orders.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.orders });
      qc.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
      toast.success('تم تحديث حالة الطلب');
    },
    onError: () => toast.error('فشل تحديث حالة الطلب'),
  });
}

// ─── Appointments ───
export function useAdminAppointments(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.appointments,
    queryFn: adminDataService.appointments.getAll,
    enabled,
  });
}

export function useAppointmentStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminDataService.appointments.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.appointments });
      qc.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
      toast.success('تم تحديث حالة الموعد');
    },
    onError: () => toast.error('فشل تحديث حالة الموعد'),
  });
}

// ─── Products ───
export function useAdminProducts(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.products,
    queryFn: adminDataService.products.getAll,
    enabled,
  });
}

export function useProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, id }: { data: any; id?: string }) => {
      if (id) {
        await adminDataService.products.update(id, data);
      } else {
        await adminDataService.products.create(data);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.products });
      toast.success('تم حفظ المنتج');
    },
    onError: () => toast.error('فشل حفظ المنتج'),
  });
}

export function useProductDeleteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDataService.products.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.products });
      toast.success('تم حذف المنتج');
    },
    onError: () => toast.error('فشل حذف المنتج'),
  });
}

// ─── Courses ───
export function useAdminCourses(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.courses,
    queryFn: adminDataService.courses.getAll,
    enabled,
  });
}

export function useCourseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, id }: { data: any; id?: string }) => {
      if (id) await adminDataService.courses.update(id, data);
      else await adminDataService.courses.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.courses });
      toast.success('تم حفظ الدورة');
    },
    onError: () => toast.error('فشل حفظ الدورة'),
  });
}

export function useCourseDeleteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDataService.courses.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.courses });
      toast.success('تم حذف الدورة');
    },
  });
}

// ─── Articles ───
export function useAdminArticles(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.articles,
    queryFn: adminDataService.articles.getAll,
    enabled,
  });
}

export function useArticleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, id }: { data: any; id?: string }) => {
      if (id) await adminDataService.articles.update(id, data);
      else await adminDataService.articles.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.articles });
      toast.success('تم حفظ المقال');
    },
    onError: () => toast.error('فشل حفظ المقال'),
  });
}

export function useArticleDeleteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDataService.articles.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.articles });
      toast.success('تم حذف المقال');
    },
  });
}

// ─── Frequencies ───
export function useAdminFrequencies(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.frequencies,
    queryFn: adminDataService.frequencies.getAll,
    enabled,
  });
}

export function useFrequencyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, id }: { data: any; id?: string }) => {
      if (id) await adminDataService.frequencies.update(id, data);
      else await adminDataService.frequencies.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.frequencies });
      toast.success('تم حفظ التردد');
    },
  });
}

export function useFrequencyDeleteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDataService.frequencies.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.frequencies });
      toast.success('تم حذف التردد');
    },
  });
}

// ─── Foods ───
export function useAdminFoods(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.foods,
    queryFn: adminDataService.foods.getAll,
    enabled,
  });
}

// ─── Recipes ───
export function useAdminRecipes(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.recipes,
    queryFn: adminDataService.recipes.getAll,
    enabled,
  });
}

// ─── Clinical ───
export function useAdminDailyLogs(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.dailyLogs,
    queryFn: adminDataService.clinical.getDailyLogs,
    enabled,
  });
}

export function useAdminSymptomLogs(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.symptomLogs,
    queryFn: adminDataService.clinical.getSymptomLogs,
    enabled,
  });
}

export function useAdminDiagnosticResults(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.diagnosticResults,
    queryFn: adminDataService.clinical.getDiagnosticResults,
    enabled,
  });
}
