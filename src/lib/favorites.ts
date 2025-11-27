import { supabase } from './supabase';

export interface Favorite {
  id: number;
  user_id: number;
  match_id: number;
}

export const addFavorite = async (userId: number, matchId: number) => {
  const { data, error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, match_id: matchId }])
    .select();

  if (error) throw error;
  return data;
};

export const removeFavorite = async (userId: number, matchId: number) => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('match_id', matchId);

  if (error) throw error;
};

export const getFavorites = async (userId: number) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as Favorite[];
};

export const isFavorite = async (userId: number, matchId: number) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('match_id', matchId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
  return !!data;
};
