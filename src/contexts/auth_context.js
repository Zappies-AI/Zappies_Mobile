import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, supabaseApi } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    // Check if first time user
    checkFirstTime();
    
    // Get initial session
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      setIsFirstTime(!hasSeenOnboarding);
    } catch (error) {
      console.error('Error checking first time:', error);
    }
  };

  const getInitialSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error getting initial session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabaseApi.getUserProfile(userId);
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        return;
      }
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabaseApi.signUp(email, password, userData);
      
      if (error) {
        throw error;
      }

      // Create user profile
      if (data.user) {
        const profileData = {
          email,
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabaseApi.createUserProfile(
          data.user.id,
          profileData
        );

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabaseApi.signIn(email, password);
      
      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseApi.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) return { error: 'No user logged in' };

      const { data, error } = await supabaseApi.updateUserProfile(user.id, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      setUserProfile(prev => ({ ...prev, ...updates }));
      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'com.zappiesai.mobile://reset-password',
      });
      return { data, error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setIsFirstTime(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    isFirstTime,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};