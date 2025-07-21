import { api } from '@/lib/apiClient';

export async function updateCourseTitle(
  courseId: string,
  newTitle: string
): Promise<void> {
  await api.post(`/courses/${courseId}/update-title`, {
    title: newTitle
  });
}
