import { api } from '@/lib/apiClient';

export async function deleteCourse(courseId: string): Promise<void> {
  await api.post(`/courses/${courseId}/delete`);
}