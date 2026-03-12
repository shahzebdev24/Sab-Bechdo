import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAdDetail, useToggleWishlist } from '@/src/hooks';
import { getAvatarUrl } from '@/src/utils/avatar';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Get the ad ID from route params
    const { id } = useLocalSearchParams<{ id: string }>();
    
    // Fetch ad details from backend
    const { data: ad, isLoading } = useAdDetail(id);

    // Wishlist toggle
    const { toggle: toggleWishlist, isLoading: isTogglingWishlist } = useToggleWishlist();

    // Sync isFavorite with ad data
    useEffect(() => {
        if (ad) {
            setIsFavorite(ad.isFavorite || false);
        }
    }, [ad]);

    const handleToggleFavorite = async () => {
        if (!ad) return;
        try {
            await toggleWishlist(ad.id, isFavorite);
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
        }
    };

    // Video player - initialize early (before conditional returns)
    const videoPlayer = useVideoPlayer(ad?.videoUrl || '', (player) => {
        player.loop = false;
    });

    const onShare = async () => {
        if (!ad) return;
        try {
            const result = await Share.share({
                message: `Check out this ${ad.title} on Sab Bechdo for Rs ${ad.price.toLocaleString('en-PK')}!\n\nLocation: ${ad.location?.address || 'Location'}`,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#4A54DF" />
            </View>
        );
    }

    if (!ad) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.errorText}>Ad not found</Text>
            </View>
        );
    }

    // Get all media (photos + video)
    const allMedia = [
        ...(ad.photoUrls || []),
        ...(ad.videoUrl ? [ad.videoUrl] : [])
    ];
    const currentMedia = allMedia[currentImageIndex] || 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=800&auto=format&fit=crop';

    // Check if current media is video
    const isCurrentVideo = currentMedia === ad.videoUrl;
    const photoCount = ad.photoUrls?.length || 0;
    const hasVideo = !!ad.videoUrl;

    // Play video when it's the current media
    if (isCurrentVideo && ad.videoUrl) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
    }

    // Format condition
    const conditionLabel = ad.condition === 'new' ? 'New' : 'Used';
    
    // Calculate time ago
    const timeAgo = ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : 'Recently';

    // Owner info
    const ownerName = ad.owner?.name || 'Seller';
    const ownerAvatar = ad.owner?.avatarUrl || getAvatarUrl(ownerName, 200);
    const ownerId = ad.owner?.id || 'unknown';

    return (
        <View style={styles.container}>
            {/* Absolute back button & favorite overlay on top of ScrollView */}
            <View style={[styles.headerActions, { top: Math.max(insets.top, 20) }]}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chevron-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <View style={styles.rightActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        activeOpacity={0.8}
                        onPress={onShare}
                    >
                        <Ionicons name="share-social-outline" size={22} color="#1f2937" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { marginLeft: 12 }]}
                        activeOpacity={0.8}
                        onPress={handleToggleFavorite}
                        disabled={isTogglingWishlist}
                    >
                        {isTogglingWishlist ? (
                            <ActivityIndicator size="small" color="#ff3b30" />
                        ) : (
                            <Ionicons
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={24}
                                color={isFavorite ? "#ff3b30" : "#1f2937"}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Main Product Image/Media */}
                <View style={styles.imageContainer}>
                    {isCurrentVideo ? (
                        <VideoView
                            player={videoPlayer}
                            style={styles.productImage}
                            contentFit="cover"
                            nativeControls={true}
                        />
                    ) : (
                        <Image
                            source={{ uri: currentMedia }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    )}
                    {allMedia.length > 1 && (
                        <View style={styles.imageIndicator}>
                            <Text style={styles.imageIndicatorText}>
                                {isCurrentVideo ? 'Video' : `${currentImageIndex + 1} / ${photoCount}${hasVideo ? ' + Video' : ''}`}
                            </Text>
                        </View>
                    )}
                    {allMedia.length > 1 && (
                        <View style={[styles.imageNavigation, currentImageIndex === 0 && { justifyContent: 'flex-end' }]}>
                            {currentImageIndex > 0 && (
                                <TouchableOpacity
                                    style={styles.navButton}
                                    onPress={() => setCurrentImageIndex(currentImageIndex - 1)}
                                >
                                    <Ionicons name="chevron-back" size={24} color="#fff" />
                                </TouchableOpacity>
                            )}
                            {currentImageIndex < allMedia.length - 1 && (
                                <TouchableOpacity
                                    style={styles.navButton}
                                    onPress={() => setCurrentImageIndex(currentImageIndex + 1)}
                                >
                                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                {/* Content Details */}
                <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.price}>Rs {ad.price.toLocaleString('en-PK')}</Text>
                        <View style={styles.conditionBadge}>
                            <Text style={styles.conditionText}>{conditionLabel}</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{ad.title}</Text>

                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={16} color="#6b7280" />
                        <Text style={styles.locationText}>{ad.location?.address || 'Location'} • Posted {timeAgo}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Seller Info */}
                    <Text style={styles.sectionTitle}>Seller Profile</Text>
                    <View style={styles.sellerContainer}>
                        <Image
                            source={{ uri: ownerAvatar }}
                            style={styles.sellerAvatar}
                        />
                        <View style={styles.sellerInfo}>
                            <Text style={styles.sellerName}>{ownerName}</Text>
                            <Text style={styles.sellerJoined}>Member on Sab Bechdo</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.viewProfileBtn}
                            onPress={() => router.push({
                                pathname: '/seller/[id]',
                                params: {
                                    id: ownerId,
                                    name: ownerName,
                                    avatar: ownerAvatar
                                }
                            })}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.viewProfileText}>View Profile</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Description */}
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{ad.description}</Text>

                    {/* Address Section */}
                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Address</Text>
                    <View style={styles.addressBox}>
                        <View style={styles.addressIconCircle}>
                            <Ionicons name="location" size={20} color="#4A54DF" />
                        </View>
                        <Text style={styles.fullAddressText}>{ad.location?.address || 'Address not provided'}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Sticky Action Bar */}
            <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={styles.chatButton}
                    activeOpacity={0.8}
                    onPress={() => router.push({
                        pathname: '/chat/[id]',
                        params: {
                            id: ownerId,
                            name: ownerName,
                            avatar: ownerAvatar,
                            online: 'false'
                        }
                    })}
                >
                    <Ionicons name="chatbubbles" size={20} color="#ffffff" />
                    <Text style={styles.chatButtonText}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.offerButton}
                    activeOpacity={0.8}
                    onPress={() => router.push({
                        pathname: '/make-offer',
                        params: { title: ad.title, price: ad.price.toString() }
                    })}
                >
                    <Text style={styles.offerButtonText}>Make Offer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    headerActions: {
        position: 'absolute',
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    rightActions: {
        flexDirection: 'row',
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    imageContainer: {
        width: width,
        height: width, // 1:1 Aspect ratio for product image
        backgroundColor: '#f3f4f6',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        marginTop: -30, // Overlap the image
        paddingHorizontal: 24,
        paddingTop: 30,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    price: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
    },
    conditionBadge: {
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    conditionText: {
        color: '#4f46e5',
        fontSize: 12,
        fontWeight: '600',
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: '#374151',
        lineHeight: 30,
        marginBottom: 12,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    locationText: {
        fontSize: 14,
        color: '#6b7280',
        marginLeft: 6,
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
    },
    sellerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sellerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f3f4f6',
    },
    sellerInfo: {
        flex: 1,
        marginLeft: 16,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    sellerJoined: {
        fontSize: 13,
        color: '#6b7280',
    },
    viewProfileBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    viewProfileText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#4b5563',
    },
    addressBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    addressIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(74, 84, 223, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    fullAddressText: {
        flex: 1,
        fontSize: 15,
        color: '#4B5563',
        fontWeight: '500',
        lineHeight: 22,
    },
    bottomActionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -5 },
        elevation: 10,
    },
    chatButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#4A54DF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        marginRight: 12,
    },
    chatButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    offerButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    offerButtonText: {
        color: '#4A54DF',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#6b7280',
    },
    imageIndicator: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        zIndex: 10,
    },
    imageIndicatorText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    imageNavigation: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        zIndex: 5,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
