import { api } from '@/lib/apiClient';

export async function generateCourses(
  title: string,
  topic: string,
  types: { [key: string]: boolean },
  modules: number,
): Promise<string> {
  console.log('generateCourses() called');

  const { data } = await api.post('/generate/course', {
    title,
    topic,
    types,
    modules,
  });

  return;
}