import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ChatListItem = {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    avatar: string;
    unreadCount: number;
    online: boolean;
};

const DUMMY_CHATS: ChatListItem[] = [
    {
        id: '1',
        name: 'Sarah Mitchell',
        lastMessage: 'Hey! Is the iPhone still available? I\'m really interested!',
        time: '2:14 PM',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        unreadCount: 2,
        online: true,
    },
    {
        id: '2',
        name: 'John Doe',
        lastMessage: 'Can you lower the price to ₨ 15,000?',
        time: '11:20 AM',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
        unreadCount: 0,
        online: false,
    },
    {
        id: '3',
        name: 'Alex Hales',
        lastMessage: 'Where can we meet for the deal?',
        time: 'Yesterday',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        unreadCount: 0,
        online: true,
    },
    {
        id: '4',
        name: 'Emma Watson',
        lastMessage: 'Thanks for the quick response! I\'ll check it out.',
        time: 'Tuesday',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
        unreadCount: 0,
        online: false,
    },
];

export default function ChatListScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const renderChatItem = ({ item }: { item: ChatListItem }) => (
        <TouchableOpacity
            style={styles.chatItem}
            activeOpacity={0.7}
            onPress={() => router.push({
                pathname: '/chat/[id]',
                params: {
                    id: item.id,
                    name: item.name,
                    avatar: item.avatar,
                    online: item.online ? 'true' : 'false'
                }
            })}
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                {item.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.chatTime}>{item.time}</Text>
                </View>
                <View style={styles.chatFooter}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                    {item.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

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

            <FlatList
                data={DUMMY_CHATS.filter(chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                renderItem={renderChatItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No messages yet</Text>
                    </View>
                }
            />
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
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981',
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
});
