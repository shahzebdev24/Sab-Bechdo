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

type MyAd = {
    id: string;
    title: string;
    price: string;
    image: string;
    status: 'Active' | 'Sold' | 'Pending';
    views: number;
    date: string;
};

const MY_ADS: MyAd[] = [
    {
        id: '1',
        title: 'Honda Civic 2018 - Top Variant',
        price: '₹12,45,000',
        image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=400&auto=format&fit=crop',
        status: 'Active',
        views: 1240,
        date: '12 Oct, 2023',
    },
    {
        id: '2',
        title: 'iPhone 15 Pro Max - 256GB',
        price: '₹1,45,000',
        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=400&auto=format&fit=crop',
        status: 'Pending',
        views: 450,
        date: '15 Oct, 2023',
    },
    {
        id: '3',
        title: 'Modern Luxury Villa - 4BHK',
        price: '₹4,50,00,000',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=400&auto=format&fit=crop',
        status: 'Sold',
        views: 8900,
        date: '02 Oct, 2023',
    },
];

export default function MyAdsScreen() {
    const getStatusColor = (status: MyAd['status']) => {
        switch (status) {
            case 'Active': return '#16A34A';
            case 'Sold': return '#64748B';
            case 'Pending': return '#F59E0B';
            default: return theme.colors.textSecondary;
        }
    };

    const renderItem = ({ item }: { item: MyAd }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.details}>
                <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.price}>{item.price}</Text>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="eye-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.statText}>{item.views} Views</Text>
                    </View>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.editButton}>
                            <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Ads</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => router.push('/post-ad')}>
                    <Ionicons name="add" size={26} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MY_ADS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="megaphone-outline" size={80} color={theme.colors.iconDefault} />
                        <Text style={styles.emptyText}>You haven't posted any ads yet</Text>
                        <TouchableOpacity style={styles.postNowButton} onPress={() => router.push('/post-ad')}>
                            <Text style={styles.postNowText}>Post Now</Text>
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
    addButton: {
        padding: 5,
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
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 12,
    },
    details: {
        flex: 1,
        justifyContent: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    dateText: {
        fontSize: 11,
        color: theme.colors.textSecondary,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.primary,
        marginBottom: 10,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    editButton: {
        padding: 4,
    },
    deleteButton: {
        padding: 4,
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
    postNowButton: {
        marginTop: 20,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 12,
    },
    postNowText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});
