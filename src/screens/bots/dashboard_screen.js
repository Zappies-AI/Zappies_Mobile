import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  useTheme,
  Button,
  ActivityIndicator,
  Chip,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseApi } from '../../config/supabase';
import { spacing } from '../../themes/theme';

const { width: screenWidth } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, userProfile } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    totalBots: 0,
    activeConversations: 0,
    totalLeads: 0,
    responseRate: 0,
    weeklyMessages: [],
    botPerformance: [],
    leadSources: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      // Get user's businesses
      const { data: businesses } = await supabaseApi.getUserBusinesses(user.id);
      if (!businesses || businesses.length === 0) {
        setLoading(false);
        return;
      }

      const businessIds = businesses.map(b => b.id);
      
      // Load dashboard metrics
      const promises = businessIds.map(async (businessId) => {
        const [botsResult, conversationsResult, analyticsResult] = await Promise.all([
          supabaseApi.getBots(businessId),
          supabaseApi.getConversations(businessId),
          supabaseApi.getAnalytics(businessId, getStartOfWeek(), new Date().toISOString())
        ]);

        return {
          bots: botsResult.data || [],
          conversations: conversationsResult.data || [],
          analytics: analyticsResult.data || [],
        };
      });

      const results = await Promise.all(promises);
      
      // Aggregate data
      const aggregatedData = results.reduce((acc, result) => ({
        bots: [...acc.bots, ...result.bots],
        conversations: [...acc.conversations, ...result.conversations],
        analytics: [...acc.analytics, ...result.analytics],
      }), { bots: [], conversations: [], analytics: [] });

      // Calculate metrics
      const totalBots = aggregatedData.bots.length;
      const activeConversations = aggregatedData.conversations.filter(c => 
        new Date(c.updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;
      
      const totalLeads = aggregatedData.conversations.filter(c => c.lead_status === 'qualified').length;
      
      const responseRate = aggregatedData.analytics.length > 0 
        ? (aggregatedData.analytics.filter(a => a.responded).length / aggregatedData.analytics.length * 100)
        : 0;

      // Weekly messages data
      const weeklyMessages = generateWeeklyMessageData(aggregatedData.analytics);
      
      // Bot performance data
      const botPerformance = generateBotPerformanceData(aggregatedData.bots, aggregatedData.analytics);
      
      // Lead sources data
      const leadSources = generateLeadSourcesData(aggregatedData.conversations);

      setDashboardData({
        totalBots,
        activeConversations,
        totalLeads,
        responseRate,
        weeklyMessages,
        botPerformance,
        leadSources,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const getStartOfWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString();
  };

  const generateWeeklyMessageData = (analytics) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = days.map(() => 0);
    
    analytics.forEach(item => {
      const day = new Date(item.created_at).getDay();
      weekData[day]++;
    });

    return {
      labels: days,
      datasets: [{
        data: weekData,
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const generateBotPerformanceData = (bots, analytics) => {
    return bots.slice(0, 5).map(bot => {
      const botAnalytics = analytics.filter(a => a.bot_id === bot.id);
      return {
        name: bot.name.substring(0, 10),
        messages: botAnalytics.length,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      };
    });
  };

  const generateLeadSourcesData = (conversations) => {
    const sources = {};
    conversations.forEach(conv => {
      const source = conv.source || 'Unknown';
      sources[source] = (sources[source] || 0) + 1;
    });

    return Object.entries(sources).map(([name, count], index) => ({
      name,
      count,
      color: [`#6366f1`, `#10b981`, `#f59e0b`, `#ef4444`, `#8b5cf6`][index % 5],
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    }));
  };

  const QuickActionCard = ({ title, icon, onPress, color }) => (
    <Card style={[styles.quickActionCard, { borderLeftColor: color, borderLeftWidth: 4 }]} onPress={onPress}>
      <Card.Content style={styles.quickActionContent}>
        <Icon name={icon} size={24} color={color} />
        <Text style={[styles.quickActionText, { color: theme.colors.onSurface }]}>{title}</Text>
      </Card.Content>
    </Card>
  );

  const MetricCard = ({ title, value, subtitle, icon, color = theme.colors.primary }) => (
    <Card style={styles.metricCard}>
      <Card.Content style={styles.metricContent}>
        <View style={styles.metricHeader}>
          <Icon name={icon} size={24} color={color} />
          <Text style={[styles.metricValue, { color }]}>{value}</Text>
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
        {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
      </Card.Content>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: spacing.md,
    },
    welcomeCard: {
      marginBottom: spacing.md,
      backgroundColor: theme.colors.primary,
    },
    welcomeContent: {
      padding: spacing.lg,
    },
    welcomeText: {
      color: theme.colors.onPrimary,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: spacing.xs,
    },
    welcomeSubtext: {
      color: theme.colors.onPrimary,
      opacity: 0.9,
    },
    quickActions: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: spacing.md,
      color: theme.colors.onSurface,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    quickActionCard: {
      width: '48%',
      marginBottom: spacing.sm,
    },
    quickActionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
    },
    quickActionText: {
      marginLeft: spacing.sm,
      fontSize: 14,
      fontWeight: '500',
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    metricCard: {
      width: '48%',
      marginBottom: spacing.sm,
    },
    metricContent: {
      padding: spacing.md,
    },
    metricHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    metricTitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    metricSubtitle: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    chartCard: {
      marginBottom: spacing.lg,
      padding: spacing.md,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: spacing.md,
      color: theme.colors.onSurface,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyStateText: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.md,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: spacing.md }}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card */}
        <Card style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>
              Welcome back, {userProfile?.full_name?.split(' ')[0] || 'User'}!
            </Text>
            <Text style={styles.welcomeSubtext}>
              Here's what's happening with your WhatsApp bots
            </Text>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Create Bot"
              icon="add-circle"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('Bots', { screen: 'CreateBot' })}
            />
            <QuickActionCard
              title="View Chats"
              icon="chat"
              color={theme.colors.secondary}
              onPress={() => navigation.navigate('Conversations')}
            />
            <QuickActionCard
              title="Analytics"
              icon="analytics"
              color={theme.colors.tertiary}
              onPress={() => navigation.navigate('Analytics')}
            />
            <QuickActionCard
              title="Templates"
              icon="description"
              color="#8b5cf6"
              onPress={() => navigation.navigate('Bots', { screen: 'Templates' })}
            />
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Active Bots"
              value={dashboardData.totalBots}
              icon="smart-toy"
              color={theme.colors.primary}
            />
            <MetricCard
              title="Conversations"
              value={dashboardData.activeConversations}
              subtitle="Last 24h"
              icon="chat"
              color={theme.colors.secondary}
            />
            <MetricCard
              title="Qualified Leads"
              value={dashboardData.totalLeads}
              icon="star"
              color={theme.colors.tertiary}
            />
            <MetricCard
              title="Response Rate"
              value={`${Math.round(dashboardData.responseRate)}%`}
              icon="trending-up"
              color={theme.colors.success}
            />
          </View>
        </View>

        {/* Weekly Messages Chart */}
        {dashboardData.weeklyMessages.labels && (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Messages This Week</Text>
            <LineChart
              data={dashboardData.weeklyMessages}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                labelColor: (opacity = 1) => theme.colors.onSurface,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: theme.colors.primary
                }
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          </Card>
        )}

        {/* Bot Performance */}
        {dashboardData.botPerformance.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Top Performing Bots</Text>
            <BarChart
              data={{
                labels: dashboardData.botPerformance.map(bot => bot.name),
                datasets: [{
                  data: dashboardData.botPerformance.map(bot => bot.messages)
                }]
              }}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => theme.colors.onSurface,
              }}
              style={{ borderRadius: 16 }}
            />
          </Card>
        )}

        {/* Lead Sources */}
        {dashboardData.leadSources.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Lead Sources</Text>
            <PieChart
              data={dashboardData.leadSources}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              style={{ borderRadius: 16 }}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;