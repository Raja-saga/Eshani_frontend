/**
 * API Service
 * 
 * This file contains the Axios instance and API service functions
 * for making HTTP requests to the backend API.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, Track, Playlist, SearchResults } from '@/types';
import { API_BASE_URL, TIMEOUT } from '@/constants';

// Create Axios instance
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle global errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Track API endpoints
export const trackAPI = {
  /**
   * Get all tracks
   */
  getAllTracks: async (limit?: number, offset?: number): Promise<ApiResponse<Track[]>> => {
    const response = await axiosInstance.get('/tracks', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Get track by ID
   */
  getTrackById: async (id: string): Promise<ApiResponse<Track>> => {
    const response = await axiosInstance.get(`/tracks/${id}`);
    return response.data;
  },

  /**
   * Search tracks
   */
  searchTracks: async (query: string): Promise<ApiResponse<Track[]>> => {
    const response = await axiosInstance.get('/tracks/search', {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Get trending tracks
   */
  getTrendingTracks: async (): Promise<ApiResponse<Track[]>> => {
    const response = await axiosInstance.get('/tracks/trending');
    return response.data;
  },
};

// Playlist API endpoints
export const playlistAPI = {
  /**
   * Get all playlists
   */
  getAllPlaylists: async (): Promise<ApiResponse<Playlist[]>> => {
    const response = await axiosInstance.get('/playlists');
    return response.data;
  },

  /**
   * Get playlist by ID
   */
  getPlaylistById: async (id: string): Promise<ApiResponse<Playlist>> => {
    const response = await axiosInstance.get(`/playlists/${id}`);
    return response.data;
  },

  /**
   * Create new playlist
   */
  createPlaylist: async (name: string, description: string): Promise<ApiResponse<Playlist>> => {
    const response = await axiosInstance.post('/playlists', { name, description });
    return response.data;
  },

  /**
   * Update playlist
   */
  updatePlaylist: async (id: string, data: Partial<Playlist>): Promise<ApiResponse<Playlist>> => {
    const response = await axiosInstance.put(`/playlists/${id}`, data);
    return response.data;
  },

  /**
   * Add track to playlist
   */
  addTrackToPlaylist: async (playlistId: string, trackId: string): Promise<ApiResponse<Playlist>> => {
    const response = await axiosInstance.post(`/playlists/${playlistId}/tracks`, { trackId });
    return response.data;
  },

  /**
   * Remove track from playlist
   */
  removeTrackFromPlaylist: async (playlistId: string, trackId: string): Promise<ApiResponse<Playlist>> => {
    const response = await axiosInstance.delete(`/playlists/${playlistId}/tracks/${trackId}`);
    return response.data;
  },
};

// Search API endpoints
export const searchAPI = {
  /**
   * Global search
   */
  search: async (query: string): Promise<ApiResponse<SearchResults>> => {
    const response = await axiosInstance.get('/search', {
      params: { q: query },
    });
    return response.data;
  },
};

// User API endpoints
export const userAPI = {
  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<ApiResponse<unknown>> => {
    const response = await axiosInstance.get('/user/me');
    return response.data;
  },

  /**
   * Like a track
   */
  likeTrack: async (trackId: string): Promise<ApiResponse<unknown>> => {
    const response = await axiosInstance.post(`/user/likes/${trackId}`);
    return response.data;
  },

  /**
   * Unlike a track
   */
  unlikeTrack: async (trackId: string): Promise<ApiResponse<unknown>> => {
    const response = await axiosInstance.delete(`/user/likes/${trackId}`);
    return response.data;
  },
};
