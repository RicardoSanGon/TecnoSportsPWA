export const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/signin',
  REGISTER: '/auth/signup',
  AUTH_LOGIN: '/auth/login', // Alternative login
  AUTH_PROFILE: '/auth/profile',
  AUTH_SIGNOUT: '/auth/signout',

  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: number) => `/api/users/${id}`,
  UPDATE_USER: (id: number) => `/api/users/${id}`,

  // Teams
  TEAMS: '/api/teams',
  CREATE_TEAM: '/api/teams',
  TEAM_BY_ID: (id: number) => `/api/teams/${id}`,
  UPDATE_TEAM: (id: number) => `/api/teams/${id}`,
  DELETE_TEAM: (id: number) => `/api/teams/${id}`,

  // Matches
  MATCHES: '/api/matches',
  CREATE_MATCH: '/api/matches',
  MATCH_BY_ID: (id: number) => `/api/matches/${id}`,
  UPDATE_MATCH: (id: number) => `/api/matches/${id}`,
  DELETE_MATCH: (id: number) => `/api/matches/${id}`,

  // Pools (Quinelas)
  POOLS: '/api/pools',
  CREATE_POOL: '/api/pools',
  POOL_BY_ID: (id: number) => `/api/pools/${id}`,
  UPDATE_POOL: (id: number) => `/api/pools/${id}`,
  DELETE_POOL: (id: number) => `/api/pools/${id}`,
  POOLS_BY_USER: (userId: number) => `/api/pools/user/${userId}`,
  POOLS_JOINED_BY_USER: (userId: number) => `/api/pools/user/${userId}/joined`,
  POOLS_OWNED_BY_USER: (userId: number) => `/api/pools/user/${userId}/owned`,
  JOIN_POOL: '/api/pools/join',
  POOL_PARTICIPANTS: (poolId: number, userId: number) => `/api/pools/${poolId}/participants/${userId}`,
  POOL_PARTICIPANTS_BY_USER: (poolId: number, userId: number) => `/api/pools/${poolId}/participants/${userId}`,

  // Predictions
  PREDICTIONS: '/api/predictions',
  CREATE_PREDICTION: '/api/predictions',
  PREDICTION_BY_ID: (id: number) => `/api/predictions/${id}`,
  UPDATE_PREDICTION: (id: number) => `/api/predictions/${id}`,
  DELETE_PREDICTION: (id: number) => `/api/predictions/${id}`,
  PREDICTIONS_BY_USER: (userId: number) => `/api/predictions/user/${userId}`,
  PREDICTIONS_BY_POOL: (poolId: number) => `/api/predictions/pool/${poolId}`,
  PREDICTIONS_BY_MATCH: (matchId: number) => `/api/predictions/match/${matchId}`,

  // Leaderboard
  LEADERBOARD: '/api/leaderboard',
  CREATE_LEADERBOARD: '/api/leaderboard',
  LEADERBOARD_BY_ID: (id: number) => `/api/leaderboard/${id}`,
  LEADERBOARD_BY_POOL: (poolId: number) => `/api/leaderboard/pool/${poolId}`,
  LEADERBOARD_CALCULATE_BY_POOL: (poolId: number) => `/api/leaderboard/pool/${poolId}/calculate`,
  LEADERBOARD_RANKING_BY_POOL: (poolId: number) => `/api/leaderboard/pool/${poolId}/ranking`,
  UPDATE_ALL_LEADERBOARD: '/api/leaderboard/update-all',
  UPDATE_LEADERBOARD_PREDICTION: (predictionId: number) => `/api/leaderboard/update/prediction/${predictionId}`,
  UPDATE_LEADERBOARD_MATCH: (matchId: number) => `/api/leaderboard/update/match/${matchId}`,
  UPDATE_LEADERBOARD: (id: number) => `/api/leaderboard/${id}`,
  DELETE_LEADERBOARD: (id: number) => `/api/leaderboard/${id}`,

  // Roles
  ROLES: '/api/roles',
  CREATE_ROLE: '/api/roles',
  ROLE_BY_ID: (id: number) => `/api/roles/${id}`,
  UPDATE_ROLE: (id: number) => `/api/roles/${id}`,

  // Confederations
  CONFEDERATIONS: '/api/confederations',
  CREATE_CONFEDERATION: '/api/confederations',
  CONFEDERATION_BY_ID: (id: number) => `/api/confederations/${id}`,
  UPDATE_CONFEDERATION: (id: number) => `/api/confederations/${id}`,
  DELETE_CONFEDERATION: (id: number) => `/api/confederations/${id}`,
};

export const getFullUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;