import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { DailyLog } from '@/Entities/DailyLog';

export function useHealthTracker() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // UI States
    const [showAddMetric, setShowAddMetric] = useState(false);
    const [showSymptomLogger, setShowSymptomLogger] = useState(false);
    const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);

    // Queries
    const { data: metrics = [] } = useQuery({
        queryKey: ['healthMetrics', user?.id],
        queryFn: () => db.entities.HealthMetric.listForUser(user?.id || '', '-recorded_at', 100),
        enabled: !!user?.id,
    });

    const { data: symptoms = [] } = useQuery({
        queryKey: ['symptoms', user?.id],
        queryFn: () => db.entities.SymptomLog.listForUser(user?.id || '', '-recorded_at', 50),
        enabled: !!user?.id,
    });

    const { data: dailyLogs = [] } = useQuery<DailyLog[]>({
        queryKey: ['dailyLogs', user?.id],
        queryFn: async () => {
            const logs = await db.entities.DailyLog.listForUser(user?.id || '', '-date', 30);
            return logs as unknown as DailyLog[];
        },
        enabled: !!user?.id,
    });

    // Mutations
    const addMetricMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => db.entities.HealthMetric.createForUser(user?.id || '', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthMetrics'] });
            setShowAddMetric(false);
        },
    });

    const addSymptomMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => db.entities.SymptomLog.createForUser(user?.id || '', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['symptoms'] });
            setShowSymptomLogger(false);
        },
    });

    const addDailyLogMutation = useMutation({
        mutationFn: async (data: DailyLog) => {
            const existing = dailyLogs.find(l => l.date === data.date);
            if (existing?.id) {
                return db.entities.DailyLog.update(existing.id, data as any);
            }
            return db.entities.DailyLog.createForUser(user?.id || '', data as any);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dailyLogs'] });
            setShowDailyCheckIn(false);
        },
    });

    const handleUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['healthMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['dailyLogs'] });
    };

    return {
        user,
        metrics,
        symptoms,
        dailyLogs,
        showAddMetric,
        setShowAddMetric,
        showSymptomLogger,
        setShowSymptomLogger,
        showDailyCheckIn,
        setShowDailyCheckIn,
        addMetricMutation,
        addSymptomMutation,
        addDailyLogMutation,
        handleUpdate
    };
}
