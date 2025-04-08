import 'server-only';
import { revalidatePath as nextRevalidatePath } from 'next/cache';

export async function revalidatePath(path: string) {
  try {
    nextRevalidatePath(path);
    console.log(`Revalidated path: ${path}`);
    return true;
  } catch (error) {
    console.error(`Revalidation failed for path ${path}:`, error);
    return false;
  }
}
