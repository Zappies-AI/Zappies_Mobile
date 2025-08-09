import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// Set up Supabase client
// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://qkmdjxjcoamnbrsdjvzz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbWRqeGpjb2FtbmJyc2Rqdnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Njc0ODEsImV4cCI6MjA3MDI0MzQ4MX0.SIkMPQZO_cvugIRaM1gbLKWv6GSyk-OIJ9yzl5KgX0E';
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Main App component
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3f51b5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {session && session.user ? (
        <ChatScreen session={session} />
      ) : (
        <AuthScreen />
      )}
    </SafeAreaView>
  );
}

// Authentication Screen component
function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Sign In Error', error.message);
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Sign Up Error', error.message);
    else Alert.alert('Success', 'Check your email for the confirmation link!');
    setLoading(false);
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authTitle}>Zappies AI</Text>
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#3f51b5" /> : <Text style={styles.secondaryButtonText}>Sign Up</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Chat Screen component
function ChatScreen({ session }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  // Placeholder function for the bot API call
  // This will be replaced with a real API call later
  const mockBotApi = (message) => {
    setTyping(true);
    return new Promise(resolve => {
      setTimeout(() => {
        setTyping(false);
        const response = `I'm a placeholder bot. You said: "${message}". Thanks for chatting!`;
        resolve(response);
      }, 1500); // Simulate network delay
    });
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    const userMessage = { id: Date.now(), text: input, from: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    Keyboard.dismiss();
    setLoading(true);

    try {
      // Mock API call
      const botResponseText = await mockBotApi(input);
      const botMessage = { id: Date.now() + 1, text: botResponseText, from: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching bot response:', error);
      const errorMessage = { id: Date.now() + 1, text: "Sorry, something went wrong.", from: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Sign Out Error', error.message);
  };

  return (
    <View style={styles.chatContainer}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatHeaderTitle}>Zappies AI</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.messageList} contentContainerStyle={styles.messageListContent}>
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.from === 'user' ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
        {typing && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput
          style={styles.chatInput}
          placeholder="Ask Zappies AI..."
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Send</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3f51b5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#2e2e4a',
    padding: 15,
    borderRadius: 10,
    color: '#fff',
    marginBottom: 15,
    fontSize: 16,
  },
  buttonGroup: {
    width: '100%',
  },
  button: {
    backgroundColor: '#3f51b5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: '#e8eaf6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#3f51b5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3f51b5',
    borderBottomWidth: 1,
    borderBottomColor: '#2e2e4a',
  },
  chatHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  signOutButtonText: {
    color: '#e8eaf6',
    fontSize: 16,
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageListContent: {
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  userBubble: {
    backgroundColor: '#3f51b5',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: '#2e2e4a',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#2e2e4a',
    backgroundColor: '#1a1a2e',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#2e2e4a',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#3f51b5',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
