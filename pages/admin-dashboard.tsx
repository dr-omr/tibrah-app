/**
 * LEGACY ADMIN — MIGRATED
 * This page now redirects to the new Admin Command Center at /admin/dashboard
 * @deprecated Use /admin/dashboard instead.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LegacyAdminDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);
  return null;
}
