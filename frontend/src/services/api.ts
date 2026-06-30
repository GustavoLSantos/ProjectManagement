import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const data = error.response?.data;

    if (data?.message) {
      const message = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message;
      return Promise.reject(new Error(message));
    }

    return Promise.reject(new Error(error.message ?? 'Erro inesperado'));
  },
);

export default api;
