
import {axiosClient, axiosPublic} from './axiosClient';

export const login = async (email: string, password: string) => {
  console.log('email', email);
  console.log('password', password);
  const res = await axiosPublic.post('/auth/login', {
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
  const res = await axiosPublic.post('/auth/register', {
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
  const res = await axiosClient.get('/auth/profile');
  console.log("Getprofile resp",res);
  return res.data;
};

// export const editProfile = async ({full_name, phone, email, address, public_profile, location_sharing, message_request, instagram_sync, contact_sync, notification_type}: any) => {
//   console.log("egah");
//   const res = await axiosClient.put('/auth/editProfile', {
//     full_name,
//     phone,
//     email,
//     address,
//     public_profile,
//     location_sharing,
//     message_request,
//     instagram_sync,
//     contact_sync,
//     notification_type,
//   });
//   console.log("edit data",res);
//   return res.data;
// };

export const editProfile = async (profileData: any) => {

  const formData = new FormData();

  formData.append('full_name', profileData.full_name);
  formData.append('phone', profileData.phone);
  formData.append('email', profileData.email);
  formData.append('address', profileData.address);
  formData.append('public_profile', profileData.public_profile.toString());
  formData.append('location_sharing', profileData.location_sharing.toString());
  formData.append('message_request', profileData.message_request.toString());
  formData.append('instagram_sync', profileData.instagram_sync.toString());
  formData.append('contact_sync', profileData.contact_sync.toString());
  formData.append('notification_type', profileData.notification_type);

  if (profileData.image && profileData.image.uri) {
    formData.append('image', {
      uri: profileData.image.uri,
      type: profileData.image.type || 'image/jpeg',
      name: profileData.image.fileName || 'profile_image.jpg',
    });
  }

  console.log('Sending form data:', formData);

  const res = await axiosClient.put('/auth/editProfile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('edit data response:', res);
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
  console.log('Post details:', postId);
  const res = await axiosClient.get(`/post/${postId}`, {
    params: {
      page: page,
      limit: limit,
    },
  });
  console.log('Post details:', res.data);
  return res.data;
};

export const createPost = async ({country, city, visit_date, reason_for_visit, overall_rating, experience, cost_rating, safety_rating, food_rating, place_type, longitude, latitude} : any) => {
    console.log('country', country);
    console.log('visit_date', visit_date);
    console.log('reason_for_visit', reason_for_visit);
    console.log('overall_rating', overall_rating);
    console.log('experience', experience);
    console.log('cost_rating', cost_rating);
    console.log('safety_rating', safety_rating);
    console.log('food_rating', food_rating);
    console.log('place_type', place_type);
    console.log('longitude', longitude);
    console.log('latitude', latitude);
    console.log('city', city);
    // console.log('photos', photos);
    // console.log('user_id', user_id);
    const res = await axiosClient.post('/post', {
        country,
        city,
        visit_date,
        reason_for_visit,
        overall_rating,
        experience,
        cost_rating,
        safety_rating,
        food_rating,
        place_type,
        longitude,
        latitude,
    });
    return res.data;
}
