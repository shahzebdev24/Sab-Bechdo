import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SELLER_ADS = [
    {
        id: 's1',
        title: 'Sony WH-1000XM5',
        price: '₹22,000',
        location: 'Delhi',
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop',
    },
    {
        id: 's2',
        title: 'Apple iPad Pro 11"',
        price: '₹65,000',
        location: 'Delhi',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop',
    },
    {
        id: 's3',
        title: 'Canon EOS 200D',
        price: '₹28,000',
        location: 'Delhi',
        image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=400&auto=format&fit=crop',
    },
];

export default function SellerProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const { id, name, avatar, isFollowed } = useLocalSearchParams<{
        id: string;
        name: string;
        avatar: string;
        isFollowed?: string;
    }>();

    const [followed, setFollowed] = useState(isFollowed === 'true');


    const sellerName = name || 'Rohan Sharma';
    const sellerAvatar = avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop';

    const renderHeader = () => (
        <View>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
                    <Ionicons name="chevron-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Seller Profile</Text>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#1f2937" />
                </TouchableOpacity>
            </View>

            <View style={styles.profileSection}>
                <Image source={{ uri: sellerAvatar }} style={styles.avatarImage} />
                <Text style={styles.nameText}>{sellerName}</Text>
                <Text style={styles.joinedText}>Joined Aug 2021</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>15</Text>
                        <Text style={styles.statLabel}>Active Ads</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>48</Text>
                        <Text style={styles.statLabel}>Sold Items</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
                            <Text style={styles.statNumber}>4.9</Text>
                        </View>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.primaryButton, followed && { backgroundColor: '#10B981' }]}
                        activeOpacity={0.8}
                        onPress={() => setFollowed(!followed)}
                    >
                        <Text style={styles.primaryButtonText}>{followed ? 'Followed' : 'Follow'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        activeOpacity={0.8}
                        onPress={() => router.push('/chat')}
                    >
                        <Text style={styles.secondaryButtonText}>Message</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Published Ads</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={SELLER_ADS}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => {
                    const isFavorite = favorites.has(item.id);
                    return (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.9}
                            // In a real app, this would push back to a specific product detail
                            onPress={() => router.push({
                                pathname: '/product/[id]',
                                params: {
                                    id: item.id,
                                    title: item.title,
                                    price: item.price,
                                    location: item.location,
                                    imageUri: item.image
                                }
                            })}
                        >
                            <Image source={{ uri: item.image }} style={styles.cardImage} />
                            <TouchableOpacity
                                style={styles.favoriteBtn}
                                activeOpacity={0.8}
                                onPress={() => toggleFavorite(item.id)}
                            >
                                <Ionicons
                                    name={isFavorite ? "heart" : "heart-outline"}
                                    size={18}
                                    color={isFavorite ? "#ff3b30" : "#4A54DF"}
                                />
                            </TouchableOpacity>
                            <View style={styles.cardContent}>
                                <Text style={styles.price}>{item.price}</Text>
                                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                                <View style={styles.metaRow}>
                                    <Ionicons name="location-outline" size={12} color="#6b7280" />
                                    <Text style={styles.metaText}>{item.location}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#ffffff',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    actionButton: {
        padding: 8,
        marginRight: -8,
    },
    profileSection: {
        backgroundColor: '#ffffff',
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        marginBottom: 20,
    },
    avatarImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: '#e5e7eb',
        marginBottom: 12,
    },
    nameText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    joinedText: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f3f4f6',
        marginBottom: 20,
    },
    statBox: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#e5e7eb',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#4A54DF',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#4A54DF',
        fontSize: 15,
        fontWeight: '600',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    listContent: {
        paddingBottom: 40,
    },
    columnWrapper: {
        gap: 16,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    card: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        height: 120,
    },
    favoriteBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        padding: 12,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4A54DF',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 11,
        color: '#6b7280',
        marginLeft: 4,
    },
});
