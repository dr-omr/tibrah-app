/**
 * Meal Database API — Serves food and recipe data from server
 * Loads data from the JSON file on the server, not from client lazy-loader
 * Supports filtering by category, search, and health conditions
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';
import * as fs from 'fs';
import * as path from 'path';
import type { FoodItem, HealthCondition, Recipe } from '@/lib/mealTypes';

// Load JSON data once at module level (server-side only)
let _serverData: { foodDatabase: FoodItem[]; healthConditions: HealthCondition[]; recipeDatabase: Recipe[] } | null = null;

function getServerData() {
    if (_serverData) return _serverData;

    try {
        const jsonPath = path.join(process.cwd(), 'public', 'data', 'meal-database.json');
        const raw = fs.readFileSync(jsonPath, 'utf-8');
        _serverData = JSON.parse(raw);
    } catch (err) {
        console.error('[meal-data] Failed to load JSON:', err);
        _serverData = { foodDatabase: [], healthConditions: [], recipeDatabase: [] };
    }

    return _serverData!;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limiting — 60 requests/minute
    const clientIp = getClientIp(req);
    const { limited } = checkRateLimit(clientIp, 60, 60 * 1000);
    if (limited) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    const { type, category, search, condition, limit } = req.query;
    const { foodDatabase, healthConditions, recipeDatabase } = getServerData();

    try {
        // Return health conditions
        if (type === 'conditions') {
            return res.status(200).json({
                data: healthConditions,
                count: healthConditions.length,
            });
        }

        // Return recipes
        if (type === 'recipes') {
            let filteredRecipes = recipeDatabase || [];

            if (category && typeof category === 'string') {
                filteredRecipes = filteredRecipes.filter((r) =>
                    r.category === category
                );
            }

            if (search && typeof search === 'string') {
                const q = search.toLowerCase();
                filteredRecipes = filteredRecipes.filter((r) =>
                    r.name?.toLowerCase().includes(q) ||
                    r.nameAr?.includes(q)
                );
            }

            const maxResults = limit ? parseInt(limit as string, 10) : 50;
            return res.status(200).json({
                data: filteredRecipes.slice(0, maxResults),
                count: filteredRecipes.length,
            });
        }

        // Default: return food database
        let filteredFoods = foodDatabase || [];

        // Filter by category
        if (category && typeof category === 'string') {
            filteredFoods = filteredFoods.filter(f =>
                f.category === category || f.categoryAr === category
            );
        }

        // Search by name
        if (search && typeof search === 'string') {
            const q = search.toLowerCase();
            filteredFoods = filteredFoods.filter(f =>
                f.name.toLowerCase().includes(q) ||
                f.nameAr.includes(q)
            );
        }

        // Filter by health condition compatibility
        if (condition && typeof condition === 'string') {
            filteredFoods = filteredFoods.filter(f => {
                const status = f.healthConditions?.[condition as keyof typeof f.healthConditions];
                return status !== 'avoid';
            });
        }

        const maxResults = limit ? parseInt(limit as string, 10) : 100;

        // Add cache header — food data doesn't change often
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');

        return res.status(200).json({
            data: filteredFoods.slice(0, maxResults),
            count: filteredFoods.length,
            totalAvailable: foodDatabase.length,
        });
    } catch (error) {
        console.error('[meal-data] Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
