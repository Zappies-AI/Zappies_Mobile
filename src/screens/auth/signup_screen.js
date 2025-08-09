import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  Checkbox,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { spacing } from '../../themes/theme';

const SignupScreen = ({ navigation }) => {
  const theme = useTheme();
  const { signUp } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        business_name: formData.businessName.trim(),
      };

      const { data, error } = await signUp(
        formData.email.trim().toLowerCase(),
        formData.password,
        userData
      );
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: error.message || 'Please try again',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful!',
          text2: 'Please check your email to verify your account',
        });
        navigation.navigate('Login');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
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
      marginBottom: spacing.lg,
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
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: spacing.xs,
      marginLeft: spacing.sm,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    termsText: {
      flex: 1,
      marginLeft: spacing.sm,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 20,
    },
    signupButton: {
      marginTop: spacing.sm,
      paddingVertical: spacing.xs,
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.md,
    },
    loginText: {
      color: theme.colors.onSurfaceVariant,
    },
    loginButton: {
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
            <Title style={styles.title}>Create Your Account</Title>
            <Paragraph style={styles.subtitle}>
              Join thousands of businesses using Zappies AI
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <View style={styles.inputContainer}>
              <TextInput
                label="Full Name *"
                value={formData.fullName}
                onChangeText={(text) => updateFormData('fullName', text)}
                mode="outlined"
                autoCapitalize="words"
                autoComplete="name"
                error={!!errors.password}
                style={styles.input}
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

            <View style={styles.inputContainer}>
              <TextInput
                label="Confirm Password *"
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <View style={styles.termsContainer}>
              <Checkbox
                status={acceptTerms ? 'checked' : 'unchecked'}
                onPress={() => {
                  setAcceptTerms(!acceptTerms);
                  if (errors.terms) {
                    setErrors(prev => ({ ...prev, terms: null }));
                  }
                }}
                color={theme.colors.primary}
              />
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={{ color: theme.colors.primary }}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={{ color: theme.colors.primary }}>Privacy Policy</Text>
              </Text>
            </View>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            <Button
              mode="contained"
              onPress={handleSignup}
              disabled={loading}
              style={styles.signupButton}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                  <Text style={[styles.loadingText, { color: theme.colors.onPrimary }]}>
                    Creating Account...
                  </Text>
                </View>
              ) : (
                'Create Account'
              )}
            </Button>
          </Card>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
            >
              Sign In
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;fullName}
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Email Address *"
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
                label="Phone Number"
                value={formData.phone}
                onChangeText={(text) => updateFormData('phone', text)}
                mode="outlined"
                keyboardType="phone-pad"
                autoComplete="tel"
                error={!!errors.phone}
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Business Name"
                value={formData.businessName}
                onChangeText={(text) => updateFormData('businessName', text)}
                mode="outlined"
                autoCapitalize="words"
                style={styles.input}
                left={<TextInput.Icon icon="business" />}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Password *"
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                error={!!errors.