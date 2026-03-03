import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';

type WishlistItem = {
    id: string;
    title: string;
    price: string;
    image: string;
    location: string;
    rating: number;
};

const WISHLIST_ITEMS: WishlistItem[] = [
    {
        id: '1',
        title: 'iPhone 15 Pro Max',
        price: '₹145,000',
        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=400&auto=format&fit=crop',
        location: 'Mumbai, MH',
        rating: 4.8,
    },
    {
        id: '2',
        title: 'Sony WH-1000XM5',
        price: '₹28,990',
        image: 'https://images.unsplash.com/photo-1628202926206-c63a34b1618f?q=80&w=400&auto=format&fit=crop',
        location: 'Delhi, DL',
        rating: 4.9,
    },
    {
        id: '3',
        title: 'Tesla Model S Plaid',
        price: '₹12,000,000',
        image: 'https://images.unsplash.com/photo-1617788130037-30a055538715?q=80&w=400&auto=format&fit=crop',
        location: 'Bangalore, KA',
        rating: 5.0,
    },
];

export default function WishlistScreen() {
    const renderItem = ({ item }: { item: WishlistItem }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push(`/product/${item.id}`)}
        >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <TouchableOpacity style={styles.heartButton}>
                        <Ionicons name="heart" size={22} color="#EF4444" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.price}>{item.price}</Text>
                <View style={styles.footerRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{item.location}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.infoText}>{item.rating}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Wishlist</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={WISHLIST_ITEMS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="heart-outline" size={80} color={theme.colors.iconDefault} />
                        <Text style={styles.emptyText}>Your wishlist is empty</Text>
                        <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/')}>
                            <Text style={styles.exploreText}>Explore Marketplace</Text>
                        </TouchableOpacity>
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
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 12,
    },
    content: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        flex: 1,
    },
    heartButton: {
        padding: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.primary,
        marginBottom: 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
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
    exploreButton: {
        marginTop: 20,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 12,
    },
    exploreText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});
