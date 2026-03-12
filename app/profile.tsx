import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useLogout, useMe, useSellerProfile } from '@/src/hooks';
import { useAuth } from '@/src/providers/AuthProvider';
import { getAvatarUrl } from '@/src/utils/avatar';

const { width } = Dimensions.get('window');

type MenuItem = {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
};

const MENU_ITEMS: MenuItem[] = [
    { id: 'myAds', title: 'My Ads', icon: 'megaphone', iconColor: '#4A6cf7' },
    { id: 'messages', title: 'Messages', icon: 'chatbox-ellipses', iconColor: '#4A6cf7' },
    { id: 'wishlist', title: 'Wishlist', icon: 'heart', iconColor: '#ff4b4b' },
    { id: 'settings', title: 'Settings', icon: 'settings', iconColor: '#495057' },
    { id: 'help', title: 'Help & Support', icon: 'help-circle', iconColor: '#1971c2' },
    { id: 'logout', title: 'Logout', icon: 'power', iconColor: '#e03131' },
];

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { signOut } = useAuth();
    const { mutate: logout, isPending: isLoggingOut } = useLogout(() => signOut());
    
    // Fetch current user data
    const { data: user, isLoading: isLoadingUser, error: userError } = useMe();
    
    // Fetch seller profile with stats (using current user's ID)
    const { data: sellerProfile, isLoading: isLoadingStats } = useSellerProfile(
        user?.id || '',
        !!user?.id // Only fetch when user ID is available
    );

    const isLoading = isLoadingUser || isLoadingStats;

    const renderHeaderBackground = () => (
        <View style={[styles.headerBgContainer, { height: 260 + insets.top }]}>
            <Svg width={width} height={260 + insets.top} viewBox={`0 0 ${width} ${260 + insets.top} `}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor="#4A54DF" stopOpacity="1" />
                        <Stop offset="1" stopColor="#9D8CFA" stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <Path
                    d={`M0 0 L${width} 0 L${width} ${155 + insets.top} Q${width / 2} ${65 + insets.top} 0 ${155 + insets.top} Z`}
                    fill="url(#grad)"
                />
            </Svg>
        </View>
    );

    const handleMenuPress = (id: string) => {
        if (id === 'settings') {
            router.push('/settings');
        } else if (id === 'myAds') {
            router.push('/my-ads');
        } else if (id === 'wishlist') {
            router.push('/wishlist');
        } else if (id === 'messages') {
            router.push('/chat');
        } else if (id === 'help') {
            router.push('/help');
        } else if (id === 'logout') {
            handleLogout();
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        // Just call logout - hook will handle everything including signOut callback
                        logout();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <TouchableOpacity
                style={[styles.backButton, { top: insets.top + 10 }]}
                onPress={() => router.back()}
                activeOpacity={0.7}
            >
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {renderHeaderBackground()}

                <View style={styles.contentWrap}>
                    {/* Loading State */}
                    {isLoading && (
                        <View style={[styles.profileSection, { marginTop: -190 }]}>
                            <View style={styles.avatarContainer}>
                                <View style={[styles.avatar, styles.loadingPlaceholder]}>
                                    <ActivityIndicator size="large" color="#4A54DF" />
                                </View>
                            </View>
                            <View style={styles.textBlock}>
                                <View style={[styles.loadingText, { width: 150, height: 24, marginBottom: 8 }]} />
                                <View style={[styles.loadingText, { width: 100, height: 16 }]} />
                            </View>
                        </View>
                    )}

                    {/* Error State */}
                    {userError && !isLoading && (
                        <View style={[styles.profileSection, { marginTop: -190 }]}>
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={48} color="#e03131" />
                                <Text style={styles.errorText}>Failed to load profile</Text>
                                <TouchableOpacity 
                                    style={styles.retryButton}
                                    onPress={() => router.replace('/profile')}
                                >
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Profile Content */}
                    {!isLoading && !userError && user && (
                        <>
                            <View style={[styles.profileSection, { marginTop: -190 }]}>
                                <View style={styles.avatarContainer}>
                                    <Image
                                        source={{ 
                                            uri: user.avatarUrl || getAvatarUrl(user.name, 200)
                                        }}
                                        style={styles.avatar}
                                    />
                                </View>

                                <View style={styles.textBlock}>
                                    <Text style={styles.name}>{user.name}</Text>
                                    <Text style={styles.handle}>
                                        {user.username ? `@${user.username}` : user.email}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.editButton}
                                        activeOpacity={0.7}
                                        onPress={() => router.push('/edit-profile')}
                                    >
                                        <Text style={styles.editButtonText}>Edit Profile</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Stats Section */}
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>
                                        {sellerProfile?.stats.activeAds || 0}{' '}
                                        <Text style={styles.statLabel}>Active Ads</Text>
                                    </Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>
                                        {sellerProfile?.stats.soldItems || 0}{' '}
                                        <Text style={styles.statLabel}>Sold Items</Text>
                                    </Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={14} color="#2b8a3e" style={{ marginRight: 4, marginTop: -2 }} />
                                        <Text style={[styles.statNumber, { color: '#2b8a3e' }]}>
                                            {sellerProfile?.stats.rating.toFixed(1) || '0.0'}{' '}
                                            <Text style={styles.statLabel}>
                                                ({sellerProfile?.stats.totalReviews || 0})
                                            </Text>
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Menu Items */}
                            <View style={styles.menuContainer}>
                                {MENU_ITEMS.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.menuItem}
                                        activeOpacity={0.7}
                                        onPress={() => handleMenuPress(item.id)}
                                        disabled={item.id === 'logout' && isLoggingOut}
                                    >
                                        <View style={styles.menuIconContainer}>
                                            {item.id === 'logout' && isLoggingOut ? (
                                                <ActivityIndicator size="small" color={item.iconColor} />
                                            ) : (
                                                <Ionicons name={item.icon} size={22} color={item.iconColor} />
                                            )}
                                        </View>
                                        <Text style={styles.menuItemText}>{item.title}</Text>
                                        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerBgContainer: {
        width: '100%',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        zIndex: 50,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentWrap: {
        paddingHorizontal: theme.spacing.lg,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    avatarContainer: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#fff',
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#4A54DF',
        shadowOpacity: 0.15,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
        marginBottom: theme.spacing.md,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
    },
    textBlock: {
        alignItems: 'center',
        width: '100%',
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a1f36',
        marginBottom: 4,
    },
    handle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: theme.spacing.md,
    },
    editButton: {
        position: 'absolute',
        right: 0,
        top: 6,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    editButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: theme.radius.lg,
        paddingVertical: 16,
        marginBottom: theme.spacing.xl,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 4,
    },
    statNumber: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1f36',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '400',
        color: '#6b7280',
    },
    menuContainer: {
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    menuIconContainer: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuItemText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#1a1f36',
    },
    loadingPlaceholder: {
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    errorContainer: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginTop: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 12,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#4A54DF',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
