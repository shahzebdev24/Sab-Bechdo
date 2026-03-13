import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMessagesInfinite, useMarkConversationRead, useProfile, useConversation } from '@/src/hooks';
import { socketClient } from '@/src/api/socket';
import { getAvatarUrl } from '@/src/utils/avatar';
import type { Message, MessageNewEvent } from '@/src/types';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/hooks/queries/queryKeys';
import { ProductContextCard } from '@/components/chat/ProductContextCard';

// Simple time formatter
const formatMessageTime = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    } catch {
        return '';
    }
};

export default function IndividualChatScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams();
    const conversationId = id as string;
    const { data: profile } = useProfile(); // Get current user profile
    
    const [message, setMessage] = useState('');
    const [localMessages, setLocalMessages] = useState<Message[]>([]);
    const flatListRef = useRef<FlatList>(null);
    const queryClient = useQueryClient();

    // Fetch conversation details
    const { data: conversation } = useConversation(conversationId);

    // Fetch messages with infinite scroll (20 messages per page)
    const { 
        data: messagesData, 
        isLoading, 
        error: messagesError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useMessagesInfinite(conversationId, {
        limit: 20,
    });

    // Get other participant (not current user)
    const otherParticipant = React.useMemo(() => {
        if (!conversation || !profile) return null;
        
        // If current user is buyer, show seller. Otherwise show buyer
        const isBuyer = conversation.buyer?.id === profile.id;
        return isBuyer ? conversation.seller : conversation.buyer;
    }, [conversation, profile]);

    const userName = otherParticipant?.name || 'User';
    const userAvatar = otherParticipant?.avatarUrl || getAvatarUrl(userName, 200);

    // Log errors for debugging
    useEffect(() => {
        if (messagesError) {
            console.error('[Chat] Error fetching messages:', messagesError);
        }
    }, [messagesError]);

    // Mark as read mutation
    const { mutate: markAsRead } = useMarkConversationRead();

    // Flatten messages from all pages
    const messages = React.useMemo(() => {
        if (!messagesData?.pages) return [];
        // Backend sends newest first (descending order)
        // Page 1: [100, 99, 98, ..., 81] (latest 20)
        // Page 2: [80, 79, 78, ..., 61] (older 20)
        // For inverted list, we keep this order - inverted will show correctly
        return messagesData.pages.flatMap(page => page.messages);
    }, [messagesData]);
    
    // Deduplicate messages by ID to prevent duplicates
    const allMessages = React.useMemo(() => {
        const messageMap = new Map<string, Message>();
        
        // Add fetched messages first
        messages.forEach(msg => {
            if (msg.id) {
                messageMap.set(msg.id, msg);
            }
        });
        
        // Add local messages (only if not already in fetched messages)
        localMessages.forEach(msg => {
            if (msg.id && !messageMap.has(msg.id)) {
                messageMap.set(msg.id, msg);
            }
        });
        
        return Array.from(messageMap.values());
    }, [messages, localMessages]);

    // Mark conversation as read on mount
    useEffect(() => {
        if (conversationId) {
            markAsRead(conversationId);
        }
    }, [conversationId]);

    // Join conversation room and listen for new messages
    useEffect(() => {
        if (!conversationId) {
            return;
        }

        if (!socketClient.isConnected()) {
            return;
        }

        // Join conversation room
        socketClient.joinConversation(conversationId);

        // Listen for new messages
        const cleanupNewMessage = socketClient.onMessageNew((data: MessageNewEvent) => {
            if (data.conversationId === conversationId) {
                // Add message to local state (will be deduplicated)
                setLocalMessages(prev => {
                    // Check if message already exists
                    const exists = prev.some(msg => msg.id === data.message.id);
                    if (exists) {
                        return prev;
                    }
                    return [...prev, data.message];
                });
                
                // Invalidate queries to refresh
                queryClient.invalidateQueries({ 
                    queryKey: queryKeys.chat.messages(conversationId) 
                }).then(() => {
                    // Clear local messages after query refetch completes
                    setLocalMessages([]);
                });
                
                queryClient.invalidateQueries({ 
                    queryKey: queryKeys.chat.conversations() 
                });

                // Mark as read
                markAsRead(conversationId);

                // No need to scroll - inverted list handles it automatically
            }
        });

        // Listen for messages read event
        const cleanupMessagesRead = socketClient.onMessagesRead((data: { conversationId: string; userId: string; count: number }) => {
            if (data.conversationId === conversationId) {
                // Invalidate messages query to refresh read status
                queryClient.invalidateQueries({ 
                    queryKey: queryKeys.chat.messages(conversationId) 
                });
                
                // Also invalidate conversations to update unread counts
                queryClient.invalidateQueries({ 
                    queryKey: queryKeys.chat.conversations() 
                });
            }
        });

        // Cleanup on unmount
        return () => {
            cleanupNewMessage();
            cleanupMessagesRead();
            socketClient.leaveConversation(conversationId);
        };
    }, [conversationId, queryClient]);

    // Handle load more messages (when scrolling up in inverted list = onEndReached)
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            router.push('/chat');
        }
    }, [navigation]);

    const handleSendMessage = () => {
        if (!message.trim() || !conversationId) {
            return;
        }

        const messageText = message.trim();

        // Optimistically update conversation in cache
        queryClient.setQueryData(
            queryKeys.chat.conversations(),
            (oldData: any) => {
                if (!oldData?.conversations) return oldData;
                
                return {
                    ...oldData,
                    conversations: oldData.conversations.map((conv: any) => {
                        if (conv.id === conversationId) {
                            return {
                                ...conv,
                                lastMessage: messageText,
                                lastMessageAt: new Date().toISOString(),
                            };
                        }
                        return conv;
                    }),
                };
            }
        );

        // Send message via socket
        socketClient.sendMessage(conversationId, messageText);

        // Invalidate conversations query to update from server
        queryClient.invalidateQueries({ 
            queryKey: queryKeys.chat.conversations() 
        });

        // Clear input
        setMessage('');

        // No need to scroll - inverted list handles it automatically
    };

    const renderMessage = (msg: Message, index: number) => {
        // Check if message is from current user
        const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?.id;
        const currentUserId = profile?.id;
        const isMyMessage = senderId === currentUserId;
        
        const messageTime = formatMessageTime(msg.createdAt);

        if (isMyMessage) {
            // Show single tick for unread, double tick for read
            const tickIcon = msg.isRead ? 'checkmark-done' : 'checkmark';
            
            return (
                <View key={msg.id || `local-${index}`} style={styles.msgRowRight}>
                    <View style={styles.bubbleRight}>
                        <Text style={styles.txtRight}>{msg.body}</Text>
                        <View style={styles.rightMeta}>
                            <Text style={styles.timeRight}>{messageTime}</Text>
                            <Ionicons name={tickIcon} size={14} color="#fff" style={{ marginLeft: 4 }} />
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View key={msg.id || `local-${index}`} style={styles.msgRowLeft}>
                <View style={styles.bubbleLeft}>
                    <Text style={styles.txtLeft}>{msg.body}</Text>
                    <Text style={styles.timeLeft}>{messageTime}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity style={styles.iconBtn} onPress={handleBack} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={26} color="#1E293B" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.headerProfile}
                    activeOpacity={0.7}
                >
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: userAvatar }}
                            style={styles.avatarImg}
                        />
                    </View>
                    <View style={styles.nameSection}>
                        <Text style={styles.profileName}>{userName}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerRightActions}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="call-outline" size={22} color="#475569" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="ellipsis-vertical" size={22} color="#475569" />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Chat Content */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Loading messages...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={allMessages}
                        renderItem={({ item, index }) => renderMessage(item, index)}
                        keyExtractor={(item, index) => item.id || `local-${index}`}
                        style={styles.chatScroll}
                        contentContainerStyle={styles.scrollInner}
                        showsVerticalScrollIndicator={false}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                        inverted={true}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            <>
                                {/* Product Context Card at bottom (top when inverted) */}
                                {conversation?.ad && (
                                    <ProductContextCard ad={conversation.ad} />
                                )}
                                {/* Load More Indicator */}
                                {isFetchingNextPage && (
                                    <View style={styles.loadMoreContainer}>
                                        <ActivityIndicator size="small" color={theme.colors.primary} />
                                        <Text style={styles.loadMoreText}>Loading older messages...</Text>
                                    </View>
                                )}
                            </>
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No messages yet</Text>
                                <Text style={styles.emptySubtext}>Start the conversation!</Text>
                            </View>
                        }
                    />
                )}

                {/* Input Bar */}
                <View style={[styles.inputBarContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                    <View style={styles.inputShadowWrapper}>
                        <View style={styles.mainInputRow}>
                            <TouchableOpacity style={styles.actionIcon}>
                                <Ionicons name="add-circle" size={26} color={theme.colors.primary} />
                            </TouchableOpacity>

                            <TextInput
                                style={styles.chatInput}
                                placeholder="Type a message..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                value={message}
                                onChangeText={setMessage}
                            />

                            <TouchableOpacity style={styles.actionIcon}>
                                <Ionicons name="happy-outline" size={24} color="#94A3B8" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
                                activeOpacity={0.8}
                                onPress={handleSendMessage}
                                disabled={!message.trim()}
                            >
                                <Ionicons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerProfile: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarImg: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#E2E8F0',
    },
    nameSection: {
        marginLeft: 12,
    },
    profileName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    headerRightActions: {
        flexDirection: 'row',
        gap: 4,
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
    loadMoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingTop: 20,
        gap: 8,
    },
    loadMoreText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    chatScroll: {
        flex: 1,
    },
    scrollInner: {
        padding: 20,
        flexGrow: 1,
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
    },
    msgRowLeft: {
        flexDirection: 'row',
        marginBottom: 20,
        maxWidth: '85%',
    },
    msgRowRight: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end',
        marginBottom: 20,
        maxWidth: '85%',
    },
    bubbleLeft: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 20,
        borderTopLeftRadius: 4,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    bubbleRight: {
        backgroundColor: theme.colors.primary,
        padding: 14,
        borderRadius: 20,
        borderTopRightRadius: 4,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 4,
    },
    txtLeft: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 22,
    },
    txtRight: {
        fontSize: 15,
        color: '#fff',
        lineHeight: 22,
    },
    timeLeft: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 6,
        fontWeight: '500',
    },
    rightMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 6,
    },
    timeRight: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    inputBarContainer: {
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    inputShadowWrapper: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: -5 },
    },
    mainInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    chatInput: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
        paddingHorizontal: 10,
        maxHeight: 100,
        fontWeight: '500',
    },
    actionIcon: {
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
    sendBtnDisabled: {
        backgroundColor: '#CBD5E1',
    },
});
