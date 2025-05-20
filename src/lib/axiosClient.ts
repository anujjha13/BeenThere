// src/api/index.ts
import axios from 'axios';
//import { API_BASE_URL } from '@env';
import { getToken } from '../../utils/token';

export const axiosClient = axios.create({
  baseURL: 'http://192.168.1.6:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  async (config) => {
    // Get the token from storage
    console.log("in axiosclient");
    const token = await getToken();
    console.log(token);
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

