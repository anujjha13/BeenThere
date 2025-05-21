// src/api/index.ts
import axios from 'axios';
//import { API_BASE_URL } from '@env';
import { getToken } from '../../utils/token';

export const axiosClient = axios.create({
  baseURL: 'http://ec2-54-219-132-165.us-west-1.compute.amazonaws.com:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) =>
    new Promise((resolve) => {
      getToken().then((token) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        resolve(config);
      });
    }),
  (error) => Promise.reject(error)
);

