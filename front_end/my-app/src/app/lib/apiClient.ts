import axios, { AxiosError } from 'axios';
import { authService } from './authService';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + '/api',
});

api.interceptors.request.use(async config => {
  const token = await authService.getToken();
  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${token}`,
  };
  return config;
});

api.interceptors.response.use(
  res => res,
  async (err: AxiosError & { config: any }) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      const freshToken = await authService.getToken(true);
      err.config.headers['Authorization'] = `Bearer ${freshToken}`;
      return api.request(err.config);
    }
    return Promise.reject(err);
  }
);
