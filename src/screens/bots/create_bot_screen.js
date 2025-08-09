import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  useTheme,
  ActivityIndicator,
  Chip,
  RadioButton,
  Switch,
  Divider,
  HelperText,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseApi } from '../../config/supabase';
import { spacing } from '../../themes/theme';

const CreateBotScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { businesses } = route.params;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    business_id: businesses[0]?.id || '',
    personality: 'professional',
    language: 'english',
    welcome_message: 'Hello! How can I help you today?',
    fallback_message: "I'm sorry, I didn't understand that. Can you please rephrase?",
    working_hours_enabled: false,
    working_hours_start: '09:00',
    working_hours_end: '17:00',
    timezone: 'UTC',
    auto_responses: true,
    lead_qualification: true,
    appointment_booking: false,
    ecommerce_integration: false,
    custom_fields: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const personalities = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-focused' },
    { value: 'friendly', label: 'Friendly', description: 'Casual and approachable' },
    { value: 'helpful', label: 'Helpful', description: 'Solution-oriented and supportive' },
    { value: 'sales', label: 'Sales-oriented', description: 'Persuasive and goal-driven' },
    { value: 'custom', label: 'Custom', description: 'Define your own personality' },
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'german', label: 'German' },
  ];

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Bot name is required';
      } else if (formData.name.length < 3) {
        newErrors.name = 'Bot name must be at least 3 characters';
      }

      if (!formData.business_id) {
        newErrors.business_id = 'Please select a business';
      }
    }

    if (step === 2) {
      if (!formData.welcome_message.trim()) {
        newErrors.welcome_message = 'Welcome message is required';
      }

      if (!formData.fallback_message.trim()) {
        newErrors.fallback_message = 'Fallback message is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleCreateBot();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleCreateBot = async () => {
    setLoading(true);
    
    try {
      const botData = {
        ...formData,
        user_id: user.id,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseApi.createBot(botData);

      if (error) {
        throw error;
      }

      Toast.show({
        type: 'success',
        text1: 'Bot Created!',
        text2: `${formData.name} has been created successfully`,
      });

      navigation.navigate('BotDetail', { bot: data[0] });
    } catch (error) {
      console.error('Error creating bot:', error);
      Toast.show({
        type: 'error',
        text1: 'Creation Failed',
        text2: error.message || 'Failed to create bot',
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

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Title style={styles.stepTitle}>Basic Information</Title>
      <Text style={styles.stepDescription}>
        Let's start with the basics about your WhatsApp bot
      </Text>

      <TextInput
        label="Bot Name *"
        value={formData.name}
        onChangeText={(text) => updateFormData('name', text)}
        mode="outlined"
        style={styles.input}
        error={!!errors.name}
        placeholder="e.g., Customer Support Bot"
      />
      <HelperText type="error" visible={!!errors.name}>
        {errors.name}
      </HelperText>

      <TextInput
        label="Description"
        value={formData.description}
        onChangeText={(text) => updateFormData('description', text)}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
        placeholder="Describe what your bot does..."
      />

      <Text style={styles.fieldLabel}>Business *</Text>
      <Surface style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.business_id}
          onValueChange={(value) => updateFormData('business_id', value)}
          style={styles.picker}
        >
          {businesses.map(business => (
            <Picker.Item
              key={business.id}
              label={business.name}
              value={business.id}
            />
          ))}
        </Picker>
      </Surface>
      <HelperText type="error" visible={!!errors.business_id}>
        {errors.business_id}
      </HelperText>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Title style={styles.stepTitle}>Personality & Language</Title>
      <Text style={styles.stepDescription}>
        Define how your bot communicates with customers
      </Text>

      <Text style={styles.fieldLabel}>Bot Personality</Text>
      <View style={styles.personalityContainer}>
        {personalities.map(personality => (
          <Card
            key={personality.value}
            style={[
              styles.personalityCard,
              formData.personality === personality.value && styles.selectedCard
            ]}
            onPress={() => updateFormData('personality', personality.value)}
          >
            <Card.Content style={styles.personalityContent}>
              <RadioButton
                value={personality.value}
                status={formData.personality === personality.value ? 'checked' : 'unchecked'}
                onPress={() => updateFormData('personality', personality.value)}
              />
              <View style={styles.personalityText}>
                <Text style={styles.personalityLabel}>{personality.label}</Text>
                <Text style={styles.personalityDescription}>{personality.description}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Language</Text>
      <Surface style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.language}
          onValueChange={(value) => updateFormData('language', value)}
          style={styles.picker}
        >
          {languages.map(language => (
            <Picker.Item
              key={language.value}
              label={language.label}
              value={language.value}
            />
          ))}
        </Picker>
      </Surface>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Title style={styles.stepTitle}>Messages</Title>
      <Text style={styles.stepDescription}>
        Configure the default messages your bot will use
      </Text>

      <TextInput
        label="Welcome Message *"
        value={formData.welcome_message}
        onChangeText={(text) => updateFormData('welcome_message', text)}
        mode="outlined"
        multiline
        numberOfLines={2}
        style={styles.input}
        error={!!errors.welcome_message}
        placeholder="The first message customers see"
      />
      <HelperText type="error" visible={!!errors.welcome_message}>
        {errors.welcome_message}
      </HelperText>

      <TextInput
        label="Fallback Message *"
        value={formData.fallback_message}
        onChangeText={(text) => updateFormData('fallback_message', text)}
        mode="outlined"
        multiline
        numberOfLines={2}
        style={styles.input}
        error={!!errors.fallback_message}
        placeholder="When the bot doesn't understand"
      />
      <HelperText type="error" visible={!!errors.fallback_message}>
        {errors.fallback_message}
      </HelperText>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Title style={styles.stepTitle}>Features & Settings</Title>
      <Text style={styles.stepDescription}>
        Configure advanced features for your bot
      </Text>

      <View style={styles.settingRow}>
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>Working Hours</Text>
          <Text style={styles.settingDescription}>
            Only respond during business hours
          </Text>
        </View>
        <Switch
          value={formData.working_hours_enabled}
          onValueChange={(value) => updateFormData('working_hours_enabled', value)}
          color={theme.colors.primary}
        />
      </View>

      {formData.working_hours_enabled && (
        <View style={styles.workingHoursContainer}>
          <View style={styles.timeRow}>
            <TextInput
              label="Start Time"
              value={formData.working_hours_start}
              onChangeText={(text) => updateFormData('working_hours_start', text)}
              mode="outlined"
              style={[styles.input, styles.timeInput]}
              placeholder="09:00"
            />
            <TextInput
              label="End Time"
              value={formData.working_hours_end}
              onChangeText={(text) => updateFormData('working_hours_end', text)}
              mode="outlined"
              style={[styles.input, styles.timeInput]}
              placeholder="17:00"
            />
          </View>
        </View>
      )}

      <Divider style={styles.divider} />

      <View style={styles.settingRow}>
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>Auto Responses</Text>
          <Text style={styles.settingDescription}>
            Automatically respond to common questions
          </Text>
        </View>
        <Switch
          value={formData.auto_responses}
          onValueChange={(value) => updateFormData('auto_responses', value)}
          color={theme.colors.primary}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>Lead Qualification</Text>
          <Text style={styles.settingDescription}>
            Automatically qualify and score leads
          </Text>
        </View>
        <Switch
          value={formData.lead_qualification}
          onValueChange={(value) => updateFormData('lead_qualification', value)}
          color={theme.colors.primary}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>Appointment Booking</Text>
          <Text style={styles.settingDescription}>
            Allow customers to book appointments
          </Text>
        </View>
        <Switch
          value={formData.appointment_booking}
          onValueChange={(value) => updateFormData('appointment_booking', value)}
          color={theme.colors.primary}
        />
      </View>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.stepDot,
            {
              backgroundColor: i + 1 <= currentStep 
                ? theme.colors.primary 
                : theme.colors.outline
            }
          ]}
        />
      ))}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.md,
      backgroundColor: theme.colors.surface,
    },
    stepDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginHorizontal: spacing.xs,
    },
    stepContent: {
      flex: 1,
      padding: spacing.md,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: spacing.sm,
      color: theme.colors.onSurface,
    },
    stepDescription: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.lg,
      lineHeight: 24,
    },
    input: {
      marginBottom: spacing.sm,
      backgroundColor: theme.colors.surface,
    },
    fieldLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: spacing.sm,
      marginTop: spacing.md,
      color: theme.colors.onSurface,
    },
    pickerContainer: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginBottom: spacing.sm,
    },
    picker: {
      height: 50,
    },
    personalityContainer: {
      marginBottom: spacing.md,
    },
    personalityCard: {
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    selectedCard: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    personalityContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    personalityText: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    personalityLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    personalityDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    settingText: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    workingHoursContainer: {
      marginBottom: spacing.md,
    },
    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timeInput: {
      flex: 0.48,
    },
    divider: {
      marginVertical: spacing.md,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: spacing.md,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    button: {
      flex: 0.48,
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
        {renderStepIndicator()}
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleBack}
            style={styles.button}
            disabled={loading}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                <Text style={[styles.loadingText, { color: theme.colors.onPrimary }]}>
                  Creating...
                </Text>
              </View>
            ) : (
              currentStep === totalSteps ? 'Create Bot' : 'Next'
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateBotScreen;