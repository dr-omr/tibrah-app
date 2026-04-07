// components/admin-v2/services/adminDataService.ts
// Centralized data access layer for admin modules

import { db } from '@/lib/db';

/**
 * Admin data service — wraps the db layer with admin-specific queries.
 * All admin data fetching goes through here for consistency.
 */
export const adminDataService = {
  // ─── Users ───
  users: {
    getAll: () => db.entities.User.list(undefined, undefined, true) as Promise<any[]>,
    getById: (id: string) => db.entities.User.get(id),
    update: (id: string, data: any) => db.entities.User.update(id, data),
    getCount: async () => {
      const users = await db.entities.User.list(undefined, undefined, true) as any[];
      return users.length;
    },
  },

  // ─── Orders ───
  orders: {
    getAll: () => db.entities.Order.list('-created_at', undefined, true) as Promise<any[]>,
    getById: (id: string) => db.entities.Order.get(id),
    updateStatus: (id: string, status: any) => db.entities.Order.update(id, { status }),
    getPending: async () => {
      const orders = await db.entities.Order.list('-created_at', undefined, true) as any[];
      return orders.filter((o: any) => o.status === 'pending');
    },
    getCount: async () => {
      const orders = await db.entities.Order.list(undefined, undefined, true) as any[];
      return {
        total: orders.length,
        pending: orders.filter((o: any) => o.status === 'pending').length,
        processing: orders.filter((o: any) => ['confirmed', 'processing'].includes(o.status)).length,
        delivered: orders.filter((o: any) => o.status === 'delivered').length,
        totalRevenue: orders.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + (o.total || 0), 0),
      };
    },
  },

  // ─── Appointments ───
  appointments: {
    getAll: () => db.entities.Appointment.list('-created_at', undefined, true) as Promise<any[]>,
    getById: (id: string) => db.entities.Appointment.get(id),
    updateStatus: (id: string, status: any) => db.entities.Appointment.update(id, { status }),
    getPending: async () => {
      const appts = await db.entities.Appointment.list('-created_at', undefined, true) as any[];
      return appts.filter((a: any) => a.status === 'pending');
    },
  },

  // ─── Products ───
  products: {
    getAll: () => db.entities.Product.list() as Promise<any[]>,
    getById: (id: string) => db.entities.Product.get(id),
    create: (data: any) => db.entities.Product.create(data),
    update: (id: string, data: any) => db.entities.Product.update(id, data),
    delete: (id: string) => db.entities.Product.delete(id),
  },

  // ─── Courses ───
  courses: {
    getAll: () => db.entities.Course.list() as Promise<any[]>,
    getById: (id: string) => db.entities.Course.get(id),
    create: (data: any) => db.entities.Course.create(data),
    update: (id: string, data: any) => db.entities.Course.update(id, data),
    delete: (id: string) => db.entities.Course.delete(id),
  },

  // ─── Articles ───
  articles: {
    getAll: () => db.entities.KnowledgeArticle.list() as Promise<any[]>,
    getById: (id: string) => db.entities.KnowledgeArticle.get(id),
    create: (data: any) => db.entities.KnowledgeArticle.create(data),
    update: (id: string, data: any) => db.entities.KnowledgeArticle.update(id, data),
    delete: (id: string) => db.entities.KnowledgeArticle.delete(id),
  },

  // ─── Frequencies ───
  frequencies: {
    getAll: async () => {
      if ((db.entities as any).Frequency) {
        return (db.entities as any).Frequency.list() as Promise<any[]>;
      }
      return [];
    },
    create: async (data: any) => {
      if ((db.entities as any).Frequency) {
        return (db.entities as any).Frequency.create(data);
      }
    },
    update: async (id: string, data: any) => {
      if ((db.entities as any).Frequency) {
        return (db.entities as any).Frequency.update(id, data);
      }
    },
    delete: async (id: string) => {
      if ((db.entities as any).Frequency) {
        return (db.entities as any).Frequency.delete(id);
      }
    },
  },

  // ─── Foods ───
  foods: {
    getAll: () => db.entities.Food.list() as Promise<any[]>,
    create: (data: any) => db.entities.Food.create(data),
    update: (id: string, data: any) => db.entities.Food.update(id, data),
    delete: (id: string) => db.entities.Food.delete(id),
  },

  // ─── Recipes ───
  recipes: {
    getAll: () => db.entities.Recipe.list() as Promise<any[]>,
    create: (data: any) => db.entities.Recipe.create(data),
    update: (id: string, data: any) => db.entities.Recipe.update(id, data),
    delete: (id: string) => db.entities.Recipe.delete(id),
  },

  // ─── Clinical Data ───
  clinical: {
    getDailyLogs: () => db.entities.DailyLog.list('-date', 500, true) as Promise<any[]>,
    getSymptomLogs: () => db.entities.SymptomLog.list('-recorded_at', 500, true) as Promise<any[]>,
    getDiagnosticResults: () => db.entities.DiagnosticResult.list(undefined, undefined, true) as Promise<any[]>,
    getTriageRecords: async () => {
      return db.entities.TriageRecord.list('-created_at', undefined, true) as Promise<any[]>;
    },
  },

  // ─── Dashboard Aggregates ───
  dashboard: {
    getOverview: async () => {
      const [users, orders, products, courses, articles, appointments] = await Promise.all([
        db.entities.User.list(undefined, undefined, true) as Promise<any[]>,
        db.entities.Order.list(undefined, undefined, true) as Promise<any[]>,
        db.entities.Product.list() as Promise<any[]>,
        db.entities.Course.list() as Promise<any[]>,
        db.entities.KnowledgeArticle.list() as Promise<any[]>,
        db.entities.Appointment.list(undefined, undefined, true) as Promise<any[]>,
      ]);

      const pendingOrders = orders.filter((o: any) => o.status === 'pending');
      const pendingAppts = appointments.filter((a: any) => a.status === 'pending');
      const deliveredOrders = orders.filter((o: any) => o.status === 'delivered');
      const totalRevenue = deliveredOrders.reduce((s: number, o: any) => s + (o.total || 0), 0);

      return {
        usersCount: users.length,
        ordersCount: orders.length,
        pendingOrdersCount: pendingOrders.length,
        productsCount: products.length,
        coursesCount: courses.length,
        articlesCount: articles.length,
        appointmentsCount: appointments.length,
        pendingAppointmentsCount: pendingAppts.length,
        totalRevenue,
        recentOrders: orders.slice(0, 5),
        recentAppointments: appointments.slice(0, 5),
        recentUsers: users.slice(-5).reverse(),
      };
    },
  },
};

export default adminDataService;
