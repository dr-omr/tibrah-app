/**
 * Database Client Tests
 * Tests for db.ts CRUD operations (localStorage fallback)
 */

// Mock Firebase to force localStorage fallback
jest.mock('@/lib/firebase', () => ({
    db: null,
    auth: null,
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
}));

import { db } from '@/lib/db';

describe('Database Client (localStorage fallback)', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('CRUD Operations', () => {
        test('should create an entity with auto-generated ID', async () => {
            const item = await db.entities.HealthMetric.create({
                metric_type: 'blood_pressure',
                value: 120,
                unit: 'mmHg',
                recorded_at: new Date().toISOString(),
            });

            expect(item.id).toBeDefined();
            expect(item.metric_type).toBe('blood_pressure');
            expect(item.value).toBe(120);
            expect(item.created_at).toBeDefined();
            expect(item.updated_at).toBeDefined();
        });

        test('should list all entities', async () => {
            await db.entities.DailyLog.create({
                date: '2026-03-15',
                mood: 8,
                energy_level: 7,
            });
            await db.entities.DailyLog.create({
                date: '2026-03-16',
                mood: 9,
                energy_level: 8,
            });

            const items = await db.entities.DailyLog.list();
            expect(items.length).toBe(2);
        });

        test('should get entity by ID', async () => {
            const created = await db.entities.Product.create({
                name: 'فيتامين د',
                price: 50,
                category: 'vitamins',
            });

            const found = await db.entities.Product.get(created.id!);
            expect(found).not.toBeNull();
            expect(found!.name).toBe('فيتامين د');
        });

        test('should return null for non-existent ID', async () => {
            const result = await db.entities.Product.get('nonexistent_id');
            expect(result).toBeNull();
        });

        test('should update an entity', async () => {
            const created = await db.entities.HealthMetric.create({
                metric_type: 'weight',
                value: 80,
                unit: 'kg',
                recorded_at: new Date().toISOString(),
            });

            const updated = await db.entities.HealthMetric.update(created.id!, {
                value: 78,
            });

            expect(updated.value).toBe(78);
            expect(updated.metric_type).toBe('weight');
        });

        test('should throw error when updating non-existent entity', async () => {
            await expect(
                db.entities.HealthMetric.update('fake_id', { value: 100 })
            ).rejects.toThrow('not found');
        });

        test('should delete an entity', async () => {
            const created = await db.entities.DailyLog.create({
                date: '2026-03-15',
                mood: 5,
            });

            await db.entities.DailyLog.delete(created.id!);
            const remaining = await db.entities.DailyLog.list();
            expect(remaining.length).toBe(0);
        });
    });

    describe('Filtering', () => {
        beforeEach(async () => {
            await db.entities.Product.create({
                name: 'فيتامين ج',
                price: 30,
                category: 'vitamins',
            });
            await db.entities.Product.create({
                name: 'عسل سدر',
                price: 100,
                category: 'natural',
            });
            await db.entities.Product.create({
                name: 'أوميغا 3',
                price: 60,
                category: 'vitamins',
            });
        });

        test('should filter by exact criteria', async () => {
            const vitamins = await db.entities.Product.filter({ category: 'vitamins' });
            expect(vitamins.length).toBe(2);
        });

        test('should filter with $in operator', async () => {
            const items = await db.entities.Product.filter({
                category: { $in: ['vitamins', 'natural'] }
            });
            expect(items.length).toBe(3);
        });

        test('should filter with $ne operator', async () => {
            const items = await db.entities.Product.filter({
                category: { $ne: 'vitamins' }
            });
            expect(items.length).toBe(1);
            expect(items[0].name).toBe('عسل سدر');
        });

        test('should apply limit to filter results', async () => {
            const items = await db.entities.Product.filter({ category: 'vitamins' }, undefined, 1);
            expect(items.length).toBe(1);
        });
    });

    describe('Sorting', () => {
        beforeEach(async () => {
            await db.entities.DailyLog.create({ date: '2026-03-15', mood: 5 });
            await db.entities.DailyLog.create({ date: '2026-03-17', mood: 9 });
            await db.entities.DailyLog.create({ date: '2026-03-16', mood: 7 });
        });

        test('should sort ascending by field', async () => {
            const items = await db.entities.DailyLog.list('date');
            expect(items[0].date).toBe('2026-03-15');
            expect(items[2].date).toBe('2026-03-17');
        });

        test('should sort descending with - prefix', async () => {
            const items = await db.entities.DailyLog.list('-date');
            expect(items[0].date).toBe('2026-03-17');
            expect(items[2].date).toBe('2026-03-15');
        });

        test('should apply limit after sorting', async () => {
            const items = await db.entities.DailyLog.list('-date', 2);
            expect(items.length).toBe(2);
            expect(items[0].date).toBe('2026-03-17');
        });
    });

    describe('Entity Isolation', () => {
        test('different entity types should not interfere', async () => {
            await db.entities.HealthMetric.create({
                metric_type: 'heart_rate',
                value: 72,
                unit: 'bpm',
                recorded_at: new Date().toISOString(),
            });
            await db.entities.DailyLog.create({
                date: '2026-03-15',
                mood: 8,
            });

            const metrics = await db.entities.HealthMetric.list();
            const logs = await db.entities.DailyLog.list();

            expect(metrics.length).toBe(1);
            expect(logs.length).toBe(1);
            expect(metrics[0].metric_type).toBe('heart_rate');
        });
    });

    describe('Fallback Listeners', () => {
        test('onFirebaseFallback should return unsubscribe function', async () => {
            const { onFirebaseFallback } = await import('@/lib/db');
            const listener = jest.fn();
            const unsub = onFirebaseFallback(listener);
            expect(typeof unsub).toBe('function');
            unsub(); // should not throw
        });
    });

    describe('Entity types', () => {
        test('User entity should support email and name fields', async () => {
            const item = await db.entities.User.create({
                email: 'test@tibrah.com',
                name: 'Test User',
            });
            expect(item.id).toBeDefined();
            expect(item.email).toBe('test@tibrah.com');
        });
    });
});
