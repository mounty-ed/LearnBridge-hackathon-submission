import { api } from '@/lib/apiClient';

export async function restoreCourse(courseId: string): Promise<void> {
  await api.post(`/courses/${courseId}/restore`);
}
