import { api } from '@/lib/apiClient';

export async function completeLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
): Promise<void> {

  await api.post(
    `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/complete`,
    {}
  );
}
