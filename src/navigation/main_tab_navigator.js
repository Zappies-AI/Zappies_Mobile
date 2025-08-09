import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from 'react-native-paper';

// Import screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import BotsScreen from '../screens/bots/BotsScreen';
import BotDetailScreen from '../screens/bots/BotDetailScreen';
import CreateBotScreen from '../screens/bots/CreateBotScreen';
import EditBotScreen from '../screens/bots/EditBotScreen';
import ConversationsScreen from '../screens/conversations/ConversationsScreen';
import ConversationDetailScreen from '../screens/conversations/ConversationDetailScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import LeadsScreen from '../screens/leads/LeadsScreen';
import LeadDetailScreen from '../screens/leads/LeadDetailScreen';
import TemplatesScreen from '../screens/templates/TemplatesScreen';
import CreateTemplateScreen from '../screens/templates/CreateTemplateScreen';
import EditTemplateScreen from '../screens/templates/EditTemplateScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
import BusinessSettingsScreen from '../screens/settings/BusinessSettingsScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import HelpScreen from '../screens/settings/HelpScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
const DashboardStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 4,
          shadowOpacity: 0.3,
        },
        headerTitleStyle: {
          color: theme.colors.onPrimary,
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: theme.colors.onPrimary,
      }}
    >
      <Stack.Screen 
        name="DashboardHome" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
    </Stack.Navigator>
  );
};

const BotsStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 4,
          shadowOpacity: 0.3,
        },
        headerTitleStyle: {
          color: theme.colors.onPrimary,
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: theme.colors.onPrimary,
      }}
    >
      <Stack.Screen 
        name="BotsList" 
        component={BotsScreen}
        options={{ title: 'My Bots' }}
      />
      <Stack.Screen 
        name="BotDetail" 
        component={BotDetailScreen}
        options={{ title: 'Bot Details' }}
      />
      <Stack.Screen 
        name="CreateBot" 
        component={CreateBotScreen}
        options={{ title: 'Create Bot' }}
      />
      <Stack.Screen 
        name="EditBot" 
        component={EditBotScreen}
        options={{ title: 'Edit Bot' }}
      />
      <Stack.Screen 
        name="Templates" 
        component={TemplatesScreen}
        options={{ title: 'Message Templates' }}
      />
      <Stack.Screen 
        name="CreateTemplate" 
        component={CreateTemplateScreen}
        options={{ title: 'Create Template' }}
      />
      <Stack.Screen 
        name="EditTemplate" 
        component={EditTemplateScreen}
        options={{ title: 'Edit Template' }}
      />
    </Stack.Navigator>
  );
};

const ConversationsStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 4,
          shadowOpacity: 0.3,
        },
        headerTitleStyle: {
          color: theme.colors.onPrimary,
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: theme.colors.onPrimary,
      }}
    >
      <Stack.Screen 
        name="ConversationsList" 
        component={ConversationsScreen}
        options={{ title: 'Conversations' }}
      />
      <Stack.Screen 
        name="ConversationDetail" 
        component={ConversationDetailScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
};

const AnalyticsStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 4,
          shadowOpacity: 0.3,
        },
        headerTitleStyle: {
          color: theme.colors.onPrimary,
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: theme.colors.onPrimary,
      }}
    >
      <Stack.Screen 
        name="AnalyticsHome" 
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Stack.Screen 
        name="Leads" 
        component={LeadsScreen}
        options={{ title: 'Leads' }}
      />
      <Stack.Screen 
        name="LeadDetail" 
        component={LeadDetailScreen}
        options={{ title: 'Lead Details' }}
      />
    </Stack.Navigator>
  );
};

const SettingsStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 4,
          shadowOpacity: 0.3,
        },
        headerTitleStyle: {
          color: theme.colors.onPrimary,
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: theme.colors.onPrimary,
      }}
    >
      <Stack.Screen 
        name="SettingsHome" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="BusinessSettings" 
        component={BusinessSettingsScreen}
        options={{ title: 'Business Settings' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="Help" 
        component={HelpScreen}
        options={{ title: 'Help & Support' }}
      />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Bots':
              iconName = 'smart-toy';
              break;
            case 'Conversations':
              iconName = 'chat';
              break;
            case 'Analytics':
              iconName = 'analytics';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: -4,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Bots" 
        component={BotsStack}
        options={{ title: 'Bots' }}
      />
      <Tab.Screen 
        name="Conversations" 
        component={ConversationsStack}
        options={{ title: 'Chats' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsStack}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;