// src/api/index.ts
import axios from 'axios';
//import { API_BASE_URL } from '@env';
import { getToken } from '../../utils/token';

export const axiosClient = axios.create({
  baseURL: 'http://ec2-54-215-125-69.us-west-1.compute.amazonaws.com',
  // baseURL: 'http://ec2-54-219-132-165.us-west-1.compute.amazonaws.com:3000',
  // baseURL: 'http://10.0.2.2:3000',
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
          console.log('Token found:', token);
          config.headers.Authorization = `Bearer ${token}`;
        }
        resolve(config);
      });
    }),
  (error) => Promise.reject(error)
);

export const axiosPublic = axios.create({
  // baseURL: 'http://ec2-54-219-132-165.us-west-1.compute.amazonaws.com:3000',
  baseURL: 'http://ec2-54-215-125-69.us-west-1.compute.amazonaws.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosPublic.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);



