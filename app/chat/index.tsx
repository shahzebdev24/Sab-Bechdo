import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConversations, useProfile, useUnreadCounts } from '@/src/hooks';
import { getAvatarUrl } from '@/src/utils/avatar';
import type { Conversation, MessageNewEvent } from '@/src/types';
import { socketClient } from '@/src/api/socket';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/hooks/queries/queryKeys';

// Simple time ago formatter
const formatTimeAgo = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks}w ago`;
        return new Date(dateString).toLocaleDateString();
    } catch {
        return 'Recently';
    }
};

export default function ChatListScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const queryClient = useQueryClient();

    // Get current user profile
    const { data: profile } = useProfile();

    // Fetch conversations
    const { data: conversationsData, isLoading, refetch, error: conversationsError } = useConversations({
        page: 1,
        limit: 50,
    });

    // Refetch conversations when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const conversations = conversationsData?.conversations || [];

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // Filter conversations by search query
    const filteredConversations = conversations.filter((conv) => {
        // Get other user (not current user)
        const otherUser = conv.buyer || conv.seller;
        const userName = otherUser?.name || '';
        return userName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Filter out empty conversations for non-initiators
    // Only show conversations that have at least one message OR user is the buyer (initiator)
    const visibleConversations = filteredConversations.filter((conv) => {
        const isBuyer = profile?.id === conv.buyer?.id;
        const hasMessages = conv.lastMessage !== null && conv.lastMessage !== undefined;
        
        // Show if:
        // 1. User is buyer (initiator) - they can see their initiated chats
        // 2. OR conversation has messages - both parties can see active chats
        return isBuyer || hasMessages;
    });

    // Get unread counts
    const { data: unreadCountsData } = useUnreadCounts();
    const unreadCounts = React.useMemo(() => {
        const countsMap = new Map<string, number>();
        unreadCountsData?.counts?.forEach(item => {
            countsMap.set(item.conversationId, item.count);
        });
        return countsMap;
    }, [unreadCountsData]);

    // Listen for real-time updates
    useEffect(() => {
        if (!socketClient.isConnected()) {
            return;
        }

        // Listen for new messages to update conversation list
        const cleanupNewMessage = socketClient.onMessageNew((data: MessageNewEvent) => {
            // Invalidate conversations to refresh list
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.chat.conversations() 
            });
            
            // Invalidate unread counts
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.chat.unreadCounts 
            });
        });

        // Listen for messages read to update unread counts
        const cleanupMessagesRead = socketClient.onMessagesRead((data: { conversationId: string; userId: string; count: number }) => {
            // Invalidate unread counts
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.chat.unreadCounts 
            });
        });

        return () => {
            cleanupNewMessage();
            cleanupMessagesRead();
        };
    }, [queryClient]);

    const renderChatItem = ({ item }: { item: Conversation }) => {
        // Determine other user based on current user
        const isBuyer = profile?.id === item.buyer?.id;
        const otherUser = isBuyer ? item.seller : item.buyer;
        
        const userName = otherUser?.name || 'Unknown User';
        const userAvatar = otherUser?.avatarUrl || getAvatarUrl(userName, 200);
        
        // Ad details
        const adTitle = item.ad?.title || 'Product';
        const adImage = item.ad?.photoUrls?.[0] || null;
        const adPrice = item.ad?.price ? `Rs ${item.ad.price.toLocaleString('en-PK')}` : '';
        
        // lastMessage can be either string or object depending on backend
        const lastMessageText = typeof item.lastMessage === 'string' 
            ? item.lastMessage 
            : item.lastMessage?.body || 'No messages yet';
        
        // Use lastMessageAt for time display
        const lastMessageTime = item.lastMessageAt 
            ? formatTimeAgo(item.lastMessageAt)
            : '';
        
        // Get unread count for this conversation
        const unreadCount = unreadCounts.get(item.id) || 0;
        
        return (
            <TouchableOpacity
                style={styles.chatItem}
                activeOpacity={0.7}
                onPress={() => router.push({
                    pathname: '/chat/[id]',
                    params: {
                        id: item.id,
                    }
                })}
            >
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: userAvatar }} style={styles.avatar} />
                    {adImage && (
                        <Image source={{ uri: adImage }} style={styles.adThumbnail} />
                    )}
                </View>
                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.chatTime}>{lastMessageTime}</Text>
                    </View>
                    <Text style={styles.adTitle} numberOfLines={1}>{adTitle}</Text>
                    {adPrice && <Text style={styles.adPrice}>{adPrice}</Text>}
                    <View style={styles.chatFooter}>
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {lastMessageText}
                        </Text>
                        {unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <Text style={styles.title}>Messages</Text>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#94A3B8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search chats..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {isLoading && conversations.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading conversations...</Text>
                </View>
            ) : (
                <FlatList
                    data={visibleConversations}
                    renderItem={renderChatItem}
                    keyExtractor={item => item.id}
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
                            <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>
                                Start a conversation by messaging a seller
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#1E293B',
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#64748B',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
    },
    adThumbnail: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        borderWidth: 2,
        borderColor: '#fff',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 16,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
    },
    adTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A54DF',
        marginBottom: 2,
    },
    adPrice: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 4,
    },
    chatTime: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    chatFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        flex: 1,
        fontSize: 14,
        color: '#64748B',
        marginRight: 10,
    },
    unreadBadge: {
        backgroundColor: theme.colors.primary,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#94A3B8',
        fontWeight: '600',
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#CBD5E1',
        textAlign: 'center',
    },
});
