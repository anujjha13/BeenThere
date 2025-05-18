import { User } from '../../utils/type';
import {axiosClient} from './axiosClient';

export const login = async (email: string, password: string) => {
  const res = await axiosClient.post('/auth/login', {
    email,
    password,
  });
  return res.data;
};

export const register = async (
  name: string,
  phone: any,
  email: string,
  password: string,
  confirmPassword: string,
) => {
  const res = await axiosClient.post('/auth/register', {
    name,
    phone,
    email,
    password,
    confirmPassword,
  });
  return res.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) => {
  const res = await axiosClient.post('/auth/changePassword', {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
  return res.data;
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string,
  confirmPassword: string,
) => {
  const res = await axiosClient.post('/auth/resetPassword', {
    resetToken,
    newPassword,
    confirmPassword,
  });
  return res.data;
};

export const syncContacts = async (contacts: Array<string>) => {
  const res = await axiosClient.post('/auth/syncContacts', {
    contacts,
  });
  return res.data;
};

export const sendOtp = async (email: string) => {
  const res = await axiosClient.post('/auth/sendOtp', {
    email,
  });
  return res.data;
};

export const resendOtp = async (email: string) => {
  const res = await axiosClient.post('/auth/resendOtp', {
    email,
  });
  return res.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const res = await axiosClient.post('/auth/verifyOtp', {
    email,
    otp,
  });
  return res.data;
};

export const getProfile = async () => {
  const res = await axiosClient.get('/auth/getProfile');
  return res.data;
};

export const editProfile = async ({full_name, phone, email, address, public_profile, location_sharing, message_request, instagram_sync, contact_sync, notification_type}: any) => {
  const res = await axiosClient.post('/auth/editProfile', {
    full_name,
    phone,
    email,
    address,
    public_profile,
    location_sharing,
    message_request,
    instagram_sync,
    contact_sync,
    notification_type,
  });
  return res.data;
};

export const getAllPosts = async (page = 1, limit = 10) => {
  try {
    const res = await axiosClient.get('/posts', {
      params: {
        type: '1',
        page,
        limit,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching all posts:', error);
    throw error;
  }
};

export const getFollowingPosts = async (page = 1, limit = 10) => {
  try {
    const res = await axiosClient.get('/posts', {
      params: {
        type: '2',
        page,
        limit,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching following posts:', error);
    throw error;
  }
};

export const getPostDetails = async (postId: string, page = 1, limit = 10) => {
  const res = await axiosClient.get(`/posts/${postId}`, {
    params: {
      page: page,
      limit: limit,
    },
  });
  return res.data;
};
