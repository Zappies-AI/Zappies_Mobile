import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { supabase } from './src/config/supabase';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';

// Import context providers
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Import theme
import { lightTheme, darkTheme } from './src/themes/theme';

const Stack = createStackNavigator();

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: ...',
  'Remote debugger',
]);

const AppNavigator = () => {
  const { user, loading, isFirstTime } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'white' },
          animationEnabled: true,
        }}
      >
        {isFirstTime ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : user ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const theme = isDarkTheme ? darkTheme : lightTheme;

  return (
    <ThemeProvider value={{ theme, isDarkTheme, setIsDarkTheme }}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <StatusBar
            barStyle={isDarkTheme ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.primary}
          />
          <AppNavigator />
          <Toast />
        </AuthProvider>
      </PaperProvider>
    </ThemeProvider>
  );
};

export default App;