import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';

type Notification = {
    id: string;
    type: 'like' | 'price_drop' | 'message' | 'system';
    title: string;
    description: string;
    time: string;
    isRead: boolean;
};

const NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'like',
        title: 'New Like!',
        description: 'Someone liked your Honda Civic 2018 ad. Check it now!',
        time: '2 mins ago',
        isRead: false,
    },
    {
        id: '2',
        type: 'price_drop',
        title: 'Price Drop Alert',
        description: 'The iPhone 15 Pro Max you are interested in is now ₹5,000 cheaper!',
        time: '1 hour ago',
        isRead: false,
    },
    {
        id: '3',
        type: 'message',
        title: 'New Message',
        description: 'A seller sent you a message about the Modern Luxury Villa.',
        time: '3 hours ago',
        isRead: true,
    },
    {
        id: '4',
        type: 'system',
        title: 'Welcome to SabBechdo!',
        description: 'Start selling your items today and reach thousands of buyers.',
        time: '1 day ago',
        isRead: true,
    },
    {
        id: '5',
        type: 'like',
        title: 'Item Interested',
        description: '3 people are looking at your Dell XPS 13 right now.',
        time: '2 days ago',
        isRead: true,
    },
];

export default function NotificationsScreen() {
    const renderIcon = (type: Notification['type']) => {
        switch (type) {
            case 'like':
                return <View style={[styles.iconWrapper, { backgroundColor: '#FFEFEE' }]}><Ionicons name="heart" size={20} color="#FF3B30" /></View>;
            case 'price_drop':
                return <View style={[styles.iconWrapper, { backgroundColor: '#EBF7EE' }]}><Ionicons name="trending-down" size={20} color="#16A34A" /></View>;
            case 'message':
                return <View style={[styles.iconWrapper, { backgroundColor: '#EEF2FF' }]}><Ionicons name="chatbubble-ellipses" size={20} color="#4F46E5" /></View>;
            default:
                return <View style={[styles.iconWrapper, { backgroundColor: '#F1F5F9' }]}><Ionicons name="notifications" size={20} color="#64748B" /></View>;
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
            activeOpacity={0.7}
        >
            {renderIcon(item.type)}
            <View style={styles.content}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text style={styles.description} numberOfLines={2}>
                    {item.description}
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
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity style={styles.clearButton}>
                    <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={NOTIFICATIONS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={80} color={theme.colors.iconDefault} />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    clearButton: {
        padding: 5,
    },
    clearText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
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
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
});
