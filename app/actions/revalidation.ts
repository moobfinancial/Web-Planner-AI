'use server';

import { revalidatePath } from '@/lib/server-utils';

export async function revalidateDashboardPaths(planId: string) {
  try {
    await revalidatePath('/dashboard');
    await revalidatePath(`/dashboard/plans/${planId}`);
    return { success: true };
  } catch (error) {
    console.error('Revalidation failed:', error);
    return { success: false, error: 'Failed to refresh activity feed' };
  }
}
