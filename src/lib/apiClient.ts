import { AuthService } from '@/lib/AuthService';
import axios from 'axios';

const apiConfig = {
  baseURL: '/api',
};

const apiClient = axios.create(apiConfig);

if (typeof window !== 'undefined') {
  apiClient.interceptors.request.use(
    (config) => {
      const token = AuthService.getSessionToken();
      config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    },
    (err) => {
      console.error('Error intercepting outbound request:');
      console.error(err);
      throw err;
    }
  );
}

export { apiClient };
