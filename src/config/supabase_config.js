import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase project credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database table names
export const TABLES = {
  USERS: 'users',
  BUSINESSES: 'businesses',
  BOTS: 'bots',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  TEMPLATES: 'templates',
  ANALYTICS: 'analytics',
  LEADS: 'leads',
};

// Database functions
export const supabaseApi = {
  // Auth functions
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // User profile functions
  createUserProfile: async (userId, profileData) => {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert([{ id: userId, ...profileData }]);
    return { data, error };
  },

  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  updateUserProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update(updates)
      .eq('id', userId);
    return { data, error };
  },

  // Business functions
  createBusiness: async (businessData) => {
    const { data, error } = await supabase
      .from(TABLES.BUSINESSES)
      .insert([businessData]);
    return { data, error };
  },

  getUserBusinesses: async (userId) => {
    const { data, error } = await supabase
      .from(TABLES.BUSINESSES)
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  },

  updateBusiness: async (businessId, updates) => {
    const { data, error } = await supabase
      .from(TABLES.BUSINESSES)
      .update(updates)
      .eq('id', businessId);
    return { data, error };
  },

  // Bot functions
  createBot: async (botData) => {
    const { data, error } = await supabase
      .from(TABLES.BOTS)
      .insert([botData]);
    return { data, error };
  },

  getBots: async (businessId) => {
    const { data, error } = await supabase
      .from(TABLES.BOTS)
      .select('*')
      .eq('business_id', businessId);
    return { data, error };
  },

  updateBot: async (botId, updates) => {
    const { data, error } = await supabase
      .from(TABLES.BOTS)
      .update(updates)
      .eq('id', botId);
    return { data, error };
  },

  // Template functions
  getTemplates: async (botId) => {
    const { data, error } = await supabase
      .from(TABLES.TEMPLATES)
      .select('*')
      .eq('bot_id', botId);
    return { data, error };
  },

  createTemplate: async (templateData) => {
    const { data, error } = await supabase
      .from(TABLES.TEMPLATES)
      .insert([templateData]);
    return { data, error };
  },

  updateTemplate: async (templateId, updates) => {
    const { data, error } = await supabase
      .from(TABLES.TEMPLATES)
      .update(updates)
      .eq('id', templateId);
    return { data, error };
  },

  // Analytics functions
  getAnalytics: async (botId, startDate, endDate) => {
    const { data, error } = await supabase
      .from(TABLES.ANALYTICS)
      .select('*')
      .eq('bot_id', botId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    return { data, error };
  },

  // Conversation functions
  getConversations: async (botId) => {
    const { data, error } = await supabase
      .from(TABLES.CONVERSATIONS)
      .select(`
        *,
        messages (*)
      `)
      .eq('bot_id', botId)
      .order('updated_at', { ascending: false });
    return { data, error };
  },

  // Real-time subscriptions
  subscribeToConversations: (botId, callback) => {
    return supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.CONVERSATIONS,
          filter: `bot_id=eq.${botId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToMessages: (conversationId, callback) => {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.MESSAGES,
          filter: `conversation_id=eq.${conversationId}`,
        },
        callback
      )
      .subscribe();
  },
};