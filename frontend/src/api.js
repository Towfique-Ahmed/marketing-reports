import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || '' });

const get = (url, params) => API.get(url, { params }).then(r => r.data);
const post = (url, data) => API.post(url, data).then(r => r.data);
const put = (url, data) => API.put(url, data).then(r => r.data);
const del = (url) => API.delete(url).then(r => r.data);

export const getSettings = () => get('/api/settings');
export const updateSettings = (data) => put('/api/settings', data);

export const getDashboard = (params) => get('/api/dashboard', params);
export const getAnalytics = (year) => get(`/api/analytics/${year}`);

// Blog Posts
export const getBlogPosts = (params) => get('/api/blog-posts', params);
export const createBlogPost = (data) => post('/api/blog-posts', data);
export const updateBlogPost = (id, data) => put(`/api/blog-posts/${id}`, data);
export const deleteBlogPost = (id) => del(`/api/blog-posts/${id}`);
export const bulkBlogPosts = (data) => post('/api/blog-posts/bulk', data);

// Documentations
export const getDocumentations = (params) => get('/api/documentations', params);
export const createDocumentation = (data) => post('/api/documentations', data);
export const updateDocumentation = (id, data) => put(`/api/documentations/${id}`, data);
export const deleteDocumentation = (id) => del(`/api/documentations/${id}`);
export const bulkDocumentations = (data) => post('/api/documentations/bulk', data);

// Social Posts
export const getSocialPosts = (params) => get('/api/social-posts', params);
export const createSocialPost = (data) => post('/api/social-posts', data);
export const updateSocialPost = (id, data) => put(`/api/social-posts/${id}`, data);
export const deleteSocialPost = (id) => del(`/api/social-posts/${id}`);
export const bulkSocialPosts = (data) => post('/api/social-posts/bulk', data);

// Community Posts
export const getCommunityPosts = (params) => get('/api/community-posts', params);
export const createCommunityPost = (data) => post('/api/community-posts', data);
export const updateCommunityPost = (id, data) => put(`/api/community-posts/${id}`, data);
export const deleteCommunityPost = (id) => del(`/api/community-posts/${id}`);
export const bulkCommunityPosts = (data) => post('/api/community-posts/bulk', data);

// Email Campaigns
export const getEmailCampaigns = (params) => get('/api/email-campaigns', params);
export const createEmailCampaign = (data) => post('/api/email-campaigns', data);
export const updateEmailCampaign = (id, data) => put(`/api/email-campaigns/${id}`, data);
export const deleteEmailCampaign = (id) => del(`/api/email-campaigns/${id}`);
export const bulkEmailCampaigns = (data) => post('/api/email-campaigns/bulk', data);

// Videos
export const getVideos = (params) => get('/api/videos', params);
export const createVideo = (data) => post('/api/videos', data);
export const updateVideo = (id, data) => put(`/api/videos/${id}`, data);
export const deleteVideo = (id) => del(`/api/videos/${id}`);
export const bulkVideos = (data) => post('/api/videos/bulk', data);

// Landing Pages
export const getLandingPages = (params) => get('/api/landing-pages', params);
export const createLandingPage = (data) => post('/api/landing-pages', data);
export const updateLandingPage = (id, data) => put(`/api/landing-pages/${id}`, data);
export const deleteLandingPage = (id) => del(`/api/landing-pages/${id}`);
export const bulkLandingPages = (data) => post('/api/landing-pages/bulk', data);

// Monthly Overview
export const getMonthlyOverview = (params) => get('/api/monthly-overview', params);
export const saveMonthlyOverview = (data) => post('/api/monthly-overview', data);
