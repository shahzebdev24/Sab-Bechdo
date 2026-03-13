import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { 
    useNotifications, 
    useMarkNotificationsRead, 
    useMarkAllNotificationsRead 
} from '@/src/hooks';
import type { Notification, NotificationType } from '@/src/types';
import { useSocket } from '@/src/providers/SocketProvider';

// Simple time ago formatter
const formatTimeAgo = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
        const years = Math.floor(days / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    } catch {
        return 'Recently';
    }
};

export default function NotificationsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const { isConnected } = useSocket();
    
    // Fetch notifications
    const { data: notificationsData, isLoading, refetch } = useNotifications({
        page: 1,
        limit: 50,
    });

    // Mutations
    const { mutate: markAsRead } = useMarkNotificationsRead();
    const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

    const notifications = notificationsData?.notifications || [];
    const unreadCount = notificationsData?.unreadCount || 0;

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleClearAll = () => {
        if (unreadCount > 0) {
            markAllAsRead();
        }
    };

    const handleNotificationPress = (notification: Notification) => {
        // Mark as read if unread
        if (!notification.isRead) {
            markAsRead({ ids: [notification.id] });
        }

        // Navigate based on notification type
        switch (notification.type) {
            case 'chat':
                if (notification.data?.conversationId) {
                    router.push({
                        pathname: '/chat/[id]',
                        params: { id: notification.data.conversationId as string }
                    });
                }
                break;
            case 'like':
            case 'comment':
                if (notification.data?.adId) {
                    router.push({
                        pathname: '/product/[id]',
                        params: { id: notification.data.adId as string }
                    });
                }
                break;
            case 'follow':
                if (notification.data?.userId) {
                    router.push({
                        pathname: '/seller/[id]',
                        params: { id: notification.data.userId as string }
                    });
                }
                break;
            case 'offer':
                if (notification.data?.offerId) {
                    // Navigate to offers page when implemented
                    router.push('/profile');
                }
                break;
            case 'ad_status':
                if (notification.data?.adId) {
                    router.push({
                        pathname: '/product/[id]',
                        params: { id: notification.data.adId as string }
                    });
                }
                break;
            default:
                break;
        }
    };

    const renderIcon = (type: NotificationType) => {
        switch (type) {
            case 'like':
                return (
                    <View style={[styles.iconWrapper, { backgroundColor: '#FFEFEE' }]}>
                        <Ionicons name="heart" size={20} color="#FF3B30" />
                    </View>
                );
            case 'comment':
                return (
                    <View style={[styles.iconWrapper, { backgroundColor: '#FFF4E6' }]}>
                        <Ionicons name="chatbox" size={20} color="#F59E0B" />
                    </View>
                );
            case 'follow':
                return (
                    <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
                        <Ionicons name="person-add" size={20} color="#0EA5E9" />
                    </View>
                );
            case 'chat':
                return (
                    <View style={[styles.iconWrapper, { backgroundColor: '#EEF2FF' }]}>
                        <Ionicons name="chatbubble-ellipses" size={20} color="#4F46E5" />
                    </View>
                );
            case 'offer':
                return (
                    <View style={[styles.iconWrapper, { backgroundColor: '#EBF7EE' }]}>
                        <Ionicons name="pricetag" size={20} color="#16A34A" />
                    </View>
                );
            case 'ad_status':
                return (
                    <View style={[styles.iconWrapper, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="information-circle" size={20} color="#D97706" />
                    </View>
                );
            default:
                return (
                    <View style={[styles.iconWrapper, { backgroundColor: '#F1F5F9' }]}>
                        <Ionicons name="notifications" size={20} color="#64748B" />
                    </View>
                );
        }
    };

    const formatTime = (dateString: string) => {
        return formatTimeAgo(dateString);
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
            activeOpacity={0.7}
            onPress={() => handleNotificationPress(item)}
        >
            {renderIcon(item.type)}
            <View style={styles.content}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
                </View>
                <Text style={styles.description} numberOfLines={2}>
                    {item.body}
                </Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity 
                    style={styles.clearButton} 
                    onPress={handleClearAll}
                    disabled={unreadCount === 0 || isMarkingAll}
                >
                    {isMarkingAll ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                        <Text style={[styles.clearText, unreadCount === 0 && styles.clearTextDisabled]}>
                            Clear All
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {isLoading && notifications.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading notifications...</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={80} color={theme.colors.iconDefault} />
                            <Text style={styles.emptyText}>No notifications yet</Text>
                            <Text style={styles.emptySubtext}>
                                You'll see notifications here when someone interacts with your ads
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 5,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    unreadBadge: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    clearButton: {
        padding: 5,
    },
    clearText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    clearTextDisabled: {
        color: '#CBD5E1',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    listContent: {
        padding: 16,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    unreadCard: {
        backgroundColor: '#F8FAFF',
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    timeText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    description: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
    },
});
