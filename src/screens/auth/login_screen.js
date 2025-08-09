import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { spacing } from '../../themes/theme';

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const { signIn } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await signIn(formData.email.trim().toLowerCase(), formData.password);
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: error.message || 'Please check your credentials and try again',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Welcome Back!',
          text2: 'Successfully logged in',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.md,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    logoIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    card: {
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    title: {
      textAlign: 'center',
      marginBottom: spacing.sm,
      color: theme.colors.onSurface,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: spacing.lg,
      color: theme.colors.onSurfaceVariant,
    },
    inputContainer: {
      marginBottom: spacing.md,
    },
    input: {
      backgroundColor: theme.colors.surface,
    },
    passwordInput: {
      backgroundColor: theme.colors.surface,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: spacing.xs,
      marginLeft: spacing.sm,
    },
    loginButton: {
      marginTop: spacing.md,
      paddingVertical: spacing.xs,
    },
    forgotPasswordButton: {
      marginTop: spacing.sm,
      alignSelf: 'center',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.outline,
    },
    dividerText: {
      marginHorizontal: spacing.md,
      color: theme.colors.onSurfaceVariant,
    },
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.md,
    },
    signupText: {
      color: theme.colors.onSurfaceVariant,
    },
    signupButton: {
      marginLeft: spacing.xs,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginLeft: spacing.sm,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Icon name="smart-toy" size={40} color={theme.colors.onPrimary} />
            </View>
            <Title style={styles.title}>Welcome to Zappies AI</Title>
            <Paragraph style={styles.subtitle}>
              Sign in to manage your WhatsApp AI sales bot
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <View style={styles.inputContainer}>
              <TextInput
                label="Email Address"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!errors.email}
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoComplete="password"
                error={!!errors.password}
                style={styles.passwordInput}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <Button
              mode="contained"
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                  <Text style={[styles.loadingText, { color: theme.colors.onPrimary }]}>
                    Signing In...
                  </Text>
                </View>
              ) : (
                'Sign In'
              )}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordButton}
            >
              Forgot Password?
            </Button>
          </Card>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Signup')}
              style={styles.signupButton}
            >
              Sign Up
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;