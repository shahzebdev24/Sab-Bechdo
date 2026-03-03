import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock data for details that aren't passed from the list
const MOCK_DESCRIPTION =
    "In excellent condition. Used it very carefully with a screen protector and case from day one. I'm upgrading to a newer model, which is the only reason I'm selling. Box, original charger, and bill are available. Price is slightly negotiable for serious buyers. Feel free to contact me for more details!";

export default function ProductDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isFavorite, setIsFavorite] = useState(false);

    // Get the parameters passed during navigation
    const { id, title, price, location, imageUri } = useLocalSearchParams<{
        id: string;
        title: string;
        price: string;
        location: string;
        imageUri: string;
    }>();

    const onShare = async () => {
        try {
            const result = await Share.share({
                message: `Check out this ${title} on Sab Bechdo for ${price}!\n\nLocation: ${location}`,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

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
                        onPress={() => setIsFavorite(!isFavorite)}
                    >
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={24}
                            color={isFavorite ? "#ff3b30" : "#1f2937"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Main Product Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUri || 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=800&auto=format&fit=crop' }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Content Details */}
                <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.price}>{price}</Text>
                        <View style={styles.conditionBadge}>
                            <Text style={styles.conditionText}>Used - Like New</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{title}</Text>

                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={16} color="#6b7280" />
                        <Text style={styles.locationText}>{location} • Posted 2 days ago</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Seller Info */}
                    <Text style={styles.sectionTitle}>Seller Profile</Text>
                    <View style={styles.sellerContainer}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }}
                            style={styles.sellerAvatar}
                        />
                        <View style={styles.sellerInfo}>
                            <Text style={styles.sellerName}>Rohan Sharma</Text>
                            <Text style={styles.sellerJoined}>Member since Aug 2021</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.viewProfileBtn}
                            onPress={() => router.push({
                                pathname: '/seller/[id]',
                                params: {
                                    id: 'seller-123',
                                    name: 'Rohan Sharma',
                                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
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
                    <Text style={styles.descriptionText}>{MOCK_DESCRIPTION}</Text>

                    {/* Address Section */}
                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Address</Text>
                    <View style={styles.addressBox}>
                        <View style={styles.addressIconCircle}>
                            <Ionicons name="location" size={20} color="#4A54DF" />
                        </View>
                        <Text style={styles.fullAddressText}>{location || 'Address not provided'}</Text>
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
                            id: 'seller-123',
                            name: 'Rohan Sharma',
                            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
                            online: 'true'
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
                        params: { title: title || '', price: price || '' }
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
});
