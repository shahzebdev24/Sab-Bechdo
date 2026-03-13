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
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSellerProfile, useSellerAds, useSellerReviews, useMe } from '@/src/hooks';
import { useToggleWishlist } from '@/src/hooks/mutations/useWishlistMutations';
import { useFollowStatus, useToggleFollow } from '@/src/hooks';
import { getAvatarUrl } from '@/src/utils/avatar';
import type { Ad } from '@/src/types';

const { width } = Dimensions.get('window');

export default function SellerProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { id } = useLocalSearchParams<{ id: string }>();
    
    // Get current user
    const { data: currentUser } = useMe();
    
    // Fetch seller data
    const { data: seller, isLoading: isLoadingSeller } = useSellerProfile(id);
    const { data: adsData, isLoading: isLoadingAds } = useSellerAds(id, { page: 1, limit: 20, sort: 'recent' });
    const { data: reviewsData } = useSellerReviews(id, { page: 1, limit: 1 });

    // Follow functionality
    const { data: followStatus, isLoading: isLoadingFollowStatus } = useFollowStatus(id, !!id);
    const { toggle: toggleFollow, isLoading: isFollowLoading } = useToggleFollow();

    // Type-safe follow status
    const isFollowing = (followStatus as { following?: boolean })?.following ?? false;
    
    // Check if viewing own profile
    const isOwnProfile = currentUser?.id === id;

    // Wishlist functionality
    const { toggle: toggleWishlist, isLoading: isWishlistLoading } = useToggleWishlist();

    const handleToggleFollow = async () => {
        if (!seller) return;
        
        try {
            await toggleFollow(seller.id, isFollowing);
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const handleToggleWishlist = async (ad: Ad) => {
        try {
            await toggleWishlist(ad.id, ad.isFavorite || false);
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    if (isLoadingSeller || isLoadingAds || isLoadingFollowStatus) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4A54DF" />
            </View>
        );
    }

    if (!seller) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#6b7280' }}>Seller not found</Text>
            </View>
        );
    }

    const sellerAds = adsData?.ads || [];
    const activeAdsCount = seller.stats?.activeAds || 0;
    const totalAdsCount = seller.stats?.totalAds || 0;
    const averageRating = seller.stats?.rating || 0;
    const totalReviews = seller.stats?.totalReviews || 0;

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
                <Image 
                    source={{ uri: seller.avatarUrl || getAvatarUrl(seller.name, 200) }} 
                    style={styles.avatarImage} 
                />
                <Text style={styles.nameText}>{seller.name}</Text>
                <Text style={styles.joinedText}>Member on Sab Bechdo</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{activeAdsCount}</Text>
                        <Text style={styles.statLabel}>Active Ads</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{totalAdsCount}</Text>
                        <Text style={styles.statLabel}>Total Ads</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
                            <Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
                        </View>
                        <Text style={styles.statLabel}>{totalReviews} Reviews</Text>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    {!isOwnProfile && (
                        <>
                            <TouchableOpacity
                                style={[styles.primaryButton, isFollowing && { backgroundColor: '#10B981' }]}
                                activeOpacity={0.8}
                                onPress={handleToggleFollow}
                                disabled={isFollowLoading}
                            >
                                {isFollowLoading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>
                                        {isFollowing ? 'Followed' : 'Follow'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                activeOpacity={0.8}
                                onPress={() => router.push({
                                    pathname: '/chat/[id]',
                                    params: {
                                        id: seller.id,
                                        name: seller.name,
                                        avatar: seller.avatarUrl,
                                        online: 'false'
                                    }
                                })}
                            >
                                <Text style={styles.secondaryButtonText}>Message</Text>
                            </TouchableOpacity>
                        </>
                    )}
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
                data={sellerAds}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }: { item: Ad }) => {
                    const isFavorite = item.isFavorite || false;
                    const firstImage = item.photoUrls?.[0] || item.videoUrl;
                    return (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.9}
                            onPress={() => router.push({
                                pathname: '/product/[id]',
                                params: { id: item.id }
                            })}
                        >
                            {firstImage && <Image source={{ uri: firstImage }} style={styles.cardImage} />}
                            <TouchableOpacity
                                style={[styles.favoriteBtn, isWishlistLoading && styles.favoriteDisabled]}
                                activeOpacity={0.8}
                                onPress={() => handleToggleWishlist(item)}
                                disabled={isWishlistLoading}
                            >
                                {isWishlistLoading ? (
                                    <ActivityIndicator size="small" color="#4A54DF" />
                                ) : (
                                    <Ionicons
                                        name={isFavorite ? "heart" : "heart-outline"}
                                        size={18}
                                        color={isFavorite ? "#ff3b30" : "#4A54DF"}
                                    />
                                )}
                            </TouchableOpacity>
                            <View style={styles.cardContent}>
                                <Text style={styles.price}>Rs {item.price.toLocaleString('en-PK')}</Text>
                                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                                <View style={styles.metaRow}>
                                    <Ionicons name="location-outline" size={12} color="#6b7280" />
                                    <Text style={styles.metaText}>{item.location?.address || 'Location'}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Ionicons name="cube-outline" size={64} color="#CBD5E1" />
                        <Text style={{ marginTop: 16, color: '#94A3B8', fontSize: 15 }}>No ads published yet</Text>
                    </View>
                }
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
    favoriteDisabled: {
        opacity: 0.6,
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
