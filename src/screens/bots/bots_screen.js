import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  useTheme,
  Button,
  ActivityIndicator,
  FAB,
  Chip,
  IconButton,
  Menu,
  Divider,
  Surface,
  Avatar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseApi } from '../../config/supabase';
import { spacing } from '../../themes/theme';

const BotsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [bots, setBots] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const loadBots = useCallback(async () => {
    try {
      // First, get user's businesses
      const { data: businessData, error: businessError } = await supabaseApi.getUserBusinesses(user.id);
      
      if (businessError) {
        console.error('Error loading businesses:', businessError);
        return;
      }

      setBusinesses(businessData || []);

      // Then load all bots for those businesses
      const allBots = [];
      for (const business of businessData || []) {
        const { data: botsData, error: botsError } = await supabaseApi.getBots(business.id);
        
        if (botsError) {
          console.error('Error loading bots for business:', business.id, botsError);
          continue;
        }

        // Add business info to each bot
        const botsWithBusiness = (botsData || []).map(bot => ({
          ...bot,
          business_name: business.name,
          business_id: business.id,
        }));

        allBots.push(...botsWithBusiness);
      }

      setBots(allBots);
    } catch (error) {
      console.error('Error loading bots:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load bots',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadBots();
  }, [loadBots]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBots();
  }, [loadBots]);

  const handleBotPress = (bot) => {
    navigation.navigate('BotDetail', { bot });
  };

  const handleCreateBot = () => {
    if (businesses.length === 0) {
      Alert.alert(
        'No Business Found',
        'You need to create a business profile first before creating a bot.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Business', onPress: () => navigation.navigate('Settings', { screen: 'BusinessSettings' }) }
        ]
      );
      return;
    }
    navigation.navigate('CreateBot', { businesses });
  };

  const handleBotAction = (bot, action) => {
    setSelectedBot(bot);
    setMenuVisible(false);
    
    switch (action) {
      case 'edit':
        navigation.navigate('EditBot', { bot });
        break;
      case 'templates':
        navigation.navigate('Templates', { bot });
        break;
      case 'duplicate':
        handleDuplicateBot(bot);
        break;
      case 'delete':
        handleDeleteBot(bot);
        break;
    }
  };

  const handleDuplicateBot = async (bot) => {
    try {
      const duplicatedBot = {
        ...bot,
        name: `${bot.name} (Copy)`,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };

      const { error } = await supabaseApi.createBot(duplicatedBot);
      
      if (error) {
        throw error;
      }

      Toast.show({
        type: 'success',
        text1: 'Bot Duplicated',
        text2: `${bot.name} has been duplicated successfully`,
      });

      loadBots();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Duplication Failed',
        text2: error.message || 'Failed to duplicate bot',
      });
    }
  };

  const handleDeleteBot = (bot) => {
    Alert.alert(
      'Delete Bot',
      `Are you sure you want to delete "${bot.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDeleteBot(bot) }
      ]
    );
  };

  const confirmDeleteBot = async (bot) => {
    try {
      const { error } = await supabaseApi.deleteBot(bot.id);
      
      if (error) {
        throw error;
      }

      Toast.show({
        type: 'success',
        text1: 'Bot Deleted',
        text2: `${bot.name} has been deleted successfully`,
      });

      setBots(prevBots => prevBots.filter(b => b.id !== bot.id));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Deletion Failed',
        text2: error.message || 'Failed to delete bot',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'inactive':
        return theme.colors.error;
      case 'draft':
        return theme.colors.warning;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return 'play-circle';
      case 'inactive':
        return 'pause-circle';
      case 'draft':
        return 'edit';
      default:
        return 'help-circle';
    }
  };

  const BotCard = ({ bot }) => {
    const [menuVisible, setMenuVisible] = useState(false);

    return (
      <Card style={styles.botCard} onPress={() => handleBotPress(bot)}>
        <Card.Content>
          <View style={styles.botHeader}>
            <View style={styles.botInfo}>
              <Avatar.Icon 
                size={48} 
                icon="smart-toy" 
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.botDetails}>
                <Title style={styles.botName} numberOfLines={1}>{bot.name}</Title>
                <Paragraph style={styles.businessName} numberOfLines={1}>
                  {bot.business_name}
                </Paragraph>
              </View>
            </View>
            
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="more-vert"
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item onPress={() => handleBotAction(bot, 'edit')} title="Edit" />
              <Menu.Item onPress={() => handleBotAction(bot, 'templates')} title="Templates" />
              <Menu.Item onPress={() => handleBotAction(bot, 'duplicate')} title="Duplicate" />
              <Divider />
              <Menu.Item onPress={() => handleBotAction(bot, 'delete')} title="Delete" />
            </Menu>
          </View>

          <View style={styles.botMeta}>
            <Chip
              icon={() => <Icon name={getStatusIcon(bot.status)} size={16} color={getStatusColor(bot.status)} />}
              style={[styles.statusChip, { backgroundColor: getStatusColor(bot.status) + '20' }]}
              textStyle={{ color: getStatusColor(bot.status) }}
            >
              {bot.status?.charAt(0).toUpperCase() + bot.status?.slice(1)}
            </Chip>
            
            <View style={styles.botStats}>
              <View style={styles.statItem}>
                <Icon name="chat" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.statText}>{bot.total_conversations || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="person" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.statText}>{bot.total_leads || 0}</Text>
              </View>
            </View>
          </View>

          <Paragraph style={styles.botDescription} numberOfLines={2}>
            {bot.description || 'No description provided'}
          </Paragraph>

          <View style={styles.botFooter}>
            <Text style={styles.lastUpdated}>
              Updated {bot.updated_at ? new Date(bot.updated_at).toLocaleDateString() : 'Unknown'}
            </Text>
            {bot.whatsapp_connected && (
              <Chip 
                icon="whatsapp" 
                style={styles.whatsappChip}
                textStyle={{ color: theme.colors.whatsappGreen }}
              >
                Connected
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="smart-toy" size={80} color={theme.colors.onSurfaceVariant} />
      <Title style={styles.emptyTitle}>No Bots Yet</Title>
      <Paragraph style={styles.emptyDescription}>
        Create your first WhatsApp AI bot to start automating customer conversations
      </Paragraph>
      <Button
        mode="contained"
        onPress={handleCreateBot}
        style={styles.createButton}
        icon="add"
      >
        Create Your First Bot
      </Button>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      padding: spacing.md,
    },
    botCard: {
      marginBottom: spacing.md,
      elevation: 2,
    },
    botHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    botInfo: {
      flexDirection: 'row',
      flex: 1,
    },
    botDetails: {
      marginLeft: spacing.md,
      flex: 1,
    },
    botName: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: spacing.xs,
      color: theme.colors.onSurface,
    },
    businessName: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    botMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    statusChip: {
      height: 28,
    },
    botStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: spacing.md,
    },
    statText: {
      marginLeft: spacing.xs,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    botDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.md,
      lineHeight: 20,
    },
    botFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lastUpdated: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    whatsappChip: {
      backgroundColor: theme.colors.whatsappGreen + '20',
      height: 24,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyTitle: {
      marginTop: spacing.lg,
      marginBottom: spacing.md,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    emptyDescription: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.xl,
      lineHeight: 22,
    },
    createButton: {
      paddingHorizontal: spacing.lg,
    },
    headerStats: {
      backgroundColor: theme.colors.surface,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderRadius: 8,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statCard: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: spacing.md }}>Loading your bots...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Stats */}
        {bots.length > 0 && (
          <Surface style={styles.headerStats}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{bots.length}</Text>
                <Text style={styles.statLabel}>Total Bots</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {bots.filter(bot => bot.status === 'active').length}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {bots.filter(bot => bot.whatsapp_connected).length}
                </Text>
                <Text style={styles.statLabel}>Connected</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {bots.reduce((sum, bot) => sum + (bot.total_conversations || 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Conversations</Text>
              </View>
            </View>
          </Surface>
        )}

        {bots.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={bots}
            renderItem={({ item }) => <BotCard bot={item} />}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </View>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleCreateBot}
        label={bots.length === 0 ? undefined : "Create Bot"}
      />
    </SafeAreaView>
  );
};

export default BotsScreen;
            