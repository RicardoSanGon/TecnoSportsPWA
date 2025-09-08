export const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',

  // Users
  USERS: '/users',
  USER_BY_ID: (id: number) => `/users/${id}`,

  // Teams
  TEAMS: '/teams',
  TEAM_BY_ID: (id: number) => `/teams/${id}`,

  // Matches
  MATCHES: '/matches',
  MATCH_BY_ID: (id: number) => `/matches/${id}`,

  // Pools (Quinelas)
  POOLS: '/pools',
  POOL_BY_ID: (id: number) => `/pools/${id}`,
  POOL_PARTICIPANTS: (poolId: number) => `/pools/${poolId}/participants`,

  // Predictions
  PREDICTIONS: '/predictions',
  PREDICTION_BY_ID: (id: number) => `/predictions/${id}`,

  // Leaderboard
  LEADERBOARD: '/leaderboard',
  LEADERBOARD_BY_POOL: (poolId: number) => `/leaderboard/${poolId}`,

  // Roles
  ROLES: '/api/roles',
  ROLE_BY_ID: (id: number) => `/api/roles/${id}`,

  // Confederations
  CONFEDERATIONS: '/confederations',
  CONFEDERATION_BY_ID: (id: number) => `/confederations/${id}`,
};

export const getFullUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;