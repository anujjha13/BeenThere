import { use } from 'react';
import {axiosClient, axiosPublic} from './axiosClient';
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';

export const login = async (email: string, password: string) => {
  console.log('email', email);
  console.log('password', password);
  const res = await axiosPublic.post('/auth/login', {
    email,
    password,
  });
  return res.data;
};

const registerUserInFirestore = (name: string, email: string) => {
  const uuidValue = uuid.v4() as string;
  console.log('Registering user in Firestore with ID:', uuidValue);
  firestore()
    .collection('users')
    .doc(uuidValue)
    .set({
      name: name,
      email: email,
      userId: uuidValue,
      createdAt: firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      console.log('User registered successfully in Firestore');
    })
    .catch((error) => {
      console.error('Error registering user in Firestore:', error);
    });
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
  if (res.data && res.status === 200) {
    registerUserInFirestore(name, phone, email);
  }
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

export const syncContacts = async (
  contacts: string[],
) => {
  console.log('Syncing contacts:', contacts);
  const res = await axiosClient.post('/auth/syncContacts', {
    contacts
  });
  console.log('Sync contacts response:', res.data);
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

export const getUserProfile = async (userId: string) => {
  const res = await axiosClient.get(`/post/userDetails/${userId}`);
  console.log("GetUserprofile resp",res);
  return res.data;
};

export const followUser = async (userId: string) => {
  const res = await axiosClient.post('/follow', {
    target_user_id: userId,
  });
  return res.data;
};

export const addToWishList = async (postId: string) => {
  const res = await axiosClient.post('/post/wishlist', {
    post_id: postId,
  });
  return res.data;
};

export const likePost = async (postId: string) => {
  const res = await axiosClient.post('/post/like', {
    post_id: postId,
  });
  return res.data;
};

export const commentPost = async (postId: string, comment: string) => {
  const res = await axiosClient.post(`/post/comment/${postId}`, {
    comment: comment,
  });
  return res.data;
};

export const getAllTopDestination = async (filterType, filterValue, userId) => {
  const res = await axiosClient.get('/topdestinations/all', {
    params: {
      userId: userId,
      filterType: filterType,
      filterValue: filterValue,
    },
  });
  return res.data;
};

export const getAllWishlist = async (userId: string) => {
  const res = await axiosClient.get('/wishlist/all', {
    params: {
      userId: userId,
    },
  });
  return res.data;
};

export const getMessageRequest = async (userId: string) => {
  console.log('Fetching message request for userId:', userId);
  const res = await axiosClient.get('/user/message-request/' + userId);
  return res.data;
};

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

export const createPost = async (formData: FormData) => {
  console.log('Creating post with form data:', formData);
  const res = await axiosClient.post('/post', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('Create post response from api.ts:', res.data);

  return res.data;
};

// export const createPost = async ({country, city, visit_date, reason_for_visit, overall_rating, experience, cost_rating, safety_rating, food_rating, place_type, longitude, latitude ,Photos} : any) => {
//     console.log('country', country);
//     console.log('visit_date', visit_date);
//     console.log('reason_for_visit', reason_for_visit);
//     console.log('overall_rating', overall_rating);
//     console.log('experience', experience);
//     console.log('cost_rating', cost_rating);
//     console.log('safety_rating', safety_rating);
//     console.log('food_rating', food_rating);
//     console.log('place_type', place_type);
//     console.log('longitude', longitude);
//     console.log('latitude', latitude);
//     console.log('city', city);
//     console.log('photos', Photos);
//     const res = await axiosClient.post('/post', {
//         country,
//         city,
//         visit_date,
//         reason_for_visit,
//         overall_rating,
//         experience,
//         cost_rating,
//         safety_rating,
//         food_rating,
//         place_type,
//         longitude,
//         latitude,
//         Photos,
//     });
//     return res.data;
// };

export const getExploreByLocation = async(location: string) => {
  const res = await axiosClient.get('/explore/location', {
    params: {
      location: location,
    },
  });
  return res.data;
}

export const getExploreWithFilter = async(location: string, followed: number, recent: number) => {
  const res = await axiosClient.get('/explore/location/filtered', {
    params: {
      location: location,
      followed: followed,
      recent: recent,
    },
  });
  return res.data;
};

export const getPassportCountries = async () => {
  const res = await axiosClient.get('/passport/countries');
  return res.data;
};

export const getPassportCountryStats = async (country: string, keyword: string, view: string = 'recent', sortBy: string, sortOrder: string) => {
  const res = await axiosClient.get('/passport/country/stats', {
    params: {
      country: country,
      keyword: keyword,
      view: view,
      sortBy: sortBy,
      sortOrder: sortOrder,
    },
  });
  return res.data;
};

export const getPassportCountryCities = async (country: string) => {
  const res = await axiosClient.get('/passport/country/cities', {
    params: {
      country: country,
    },
  });
  return res.data;
};

export const getAllPostByUserId = async (userId: string, page = 1, limit = 10) => {
  const res = await axiosClient.get(`/posts/user/${userId}`, {
    params: {
      userId: userId,
      page: page,
      limit: limit,
    },
  });
  return res.data;
};

export const checkUserMessageReq = async (userId: string) => {
  const res = await axiosClient.get(`/user/message-request/${userId}`, {
    params: {
      userId: userId,
    },
  });
  return res.data;
};

export const exchangeInstagramCodeForToken = async (code: string) => {
  try {
    const params = new URLSearchParams();
    params.append('client_id', '1084826773498768');
    params.append('client_secret', '2316bf131bbdcd9b50a5c234c7cf4463');
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', 'https://api.beenaround.app/instagram/auth');
    params.append('code', code);

    const response = await import('axios').then(({default: axios}) =>
      axios.post('https://api.instagram.com/oauth/access_token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );
    return response.data;
  } catch (error: any) {
    console.error('Error exchanging Instagram code for token', error.response?.data || error);
    throw error;
  }
};

export const fetchInstagramMedia = async (accessToken: string) => {
  try {
    const response = await import('axios').then(({default: axios}) =>
      axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&access_token=${accessToken}`)
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching Instagram media:', error.response?.data || error);
    throw error;
  }
};

export const saveFcmToken = async (token: string, device_type: string) => {
  console.log('[API] Saving FCM token:', token, 'Device type:', device_type);
  const res = await axiosClient.post('/auth/saveFcmToken', {
    token,
    device_type,
  });
  console.log('[API] saveFcmToken response:', res.data);
  return res.data;
};

export const deleteFcmToken = async (token: string) => {
  console.log('[API] Deleting FCM token:', token);
  const res = await axiosClient.post('/auth/deleteFcmToken', {
    token,
  });
  console.log('[API] deleteFcmToken response:', res.data);
  return res.data;
};
