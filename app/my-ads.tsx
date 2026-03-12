import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMe, useMyAds, useDeleteAd, useUpdateAdStatus } from '@/src/hooks';
import type { Ad } from '@/src/types';
import { theme } from '@/theme';

export default function MyAdsScreen() {
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    
    const { data: user } = useMe();
    const { data: adsData, isLoading } = useMyAds({ page: 1, limit: 50, sort: 'recent' });
    const { mutate: deleteAd, isPending: isDeleting } = useDeleteAd();
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateAdStatus();

    const myAds = adsData?.ads || [];

    const handleEdit = (adId: string) => {
        // Navigate to post-ad page with edit mode
        router.push({
            pathname: '/post-ad',
            params: { editId: adId }
        });
    };

    const handleDelete = (adId: string, adTitle: string) => {
        Alert.alert(
            'Delete Ad',
            `Are you sure you want to delete "${adTitle}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteAd(adId, {
                            onSuccess: () => {
                                Alert.alert('Success', 'Ad deleted successfully');
                            },
                            onError: (error: any) => {
                                Alert.alert('Error', error?.message || 'Failed to delete ad');
                            },
                        });
                    },
                },
            ]
        );
    };

    const handleStatusChange = (ad: Ad) => {
        setSelectedAd(ad);
        setShowStatusModal(true);
    };

    const updateAdStatus = (status: string) => {
        if (!selectedAd) return;
        
        setShowStatusModal(false);
        
        updateStatus(
            { id: selectedAd.id, data: { status } },
            {
                onSuccess: () => {
                    Alert.alert('Success', `Ad marked as ${status}`);
                    setSelectedAd(null);
                },
                onError: (error: any) => {
                    Alert.alert('Error', error?.message || 'Failed to update status');
                    setSelectedAd(null);
                },
            }
        );
    };

    const statusOptions = [
        { value: 'active', label: 'Active', icon: 'checkmark-circle', color: '#16A34A', description: 'Ad is live and visible' },
        { value: 'sold', label: 'Sold', icon: 'checkmark-done-circle', color: '#64748B', description: 'Item has been sold' },
        { value: 'archived', label: 'Archived', icon: 'archive', color: '#94A3B8', description: 'Hide from listings' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#16A34A';
            case 'sold': return '#64748B';
            case 'pending': return '#F59E0B';
            case 'archived': return '#94A3B8';
            default: return theme.colors.textSecondary;
        }
    };

    const getStatusLabel = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const renderItem = ({ item }: { item: Ad }) => {
        const firstImage = item.photoUrls?.[0] || item.videoUrl;
        
        return (
            <TouchableOpacity 
                style={styles.card}
                onPress={() => router.push({
                    pathname: '/product/[id]',
                    params: { id: item.id }
                })}
            >
                {firstImage && <Image source={{ uri: firstImage }} style={styles.image} />}
                <View style={styles.details}>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                {getStatusLabel(item.status)}
                            </Text>
                        </View>
                        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.price}>Rs {item.price.toLocaleString('en-PK')}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="eye-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.statText}>{item.views} Views</Text>
                        </View>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity 
                                style={styles.statusButton}
                                onPress={() => handleStatusChange(item)}
                            >
                                <Ionicons name="swap-horizontal-outline" size={18} color="#F59E0B" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.editButton}
                                onPress={() => handleEdit(item.id)}
                            >
                                <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.deleteButton}
                                onPress={() => handleDelete(item.id, item.title)}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator size="small" color="#EF4444" />
                                ) : (
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

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
                data={myAds}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={styles.emptyContainer}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="megaphone-outline" size={80} color={theme.colors.iconDefault} />
                            <Text style={styles.emptyText}>You haven't posted any ads yet</Text>
                            <TouchableOpacity style={styles.postNowButton} onPress={() => router.push('/post-ad')}>
                                <Text style={styles.postNowText}>Post Now</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            />

            {/* Status Change Modal */}
            <Modal
                visible={showStatusModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowStatusModal(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowStatusModal(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Change Ad Status</Text>
                            <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedAd && (
                            <View style={styles.selectedAdInfo}>
                                <Text style={styles.selectedAdTitle} numberOfLines={1}>
                                    {selectedAd.title}
                                </Text>
                                <Text style={styles.selectedAdPrice}>
                                    Rs {selectedAd.price.toLocaleString('en-PK')}
                                </Text>
                            </View>
                        )}

                        <View style={styles.statusOptions}>
                            {statusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.statusOption,
                                        selectedAd?.status === option.value && styles.statusOptionActive
                                    ]}
                                    onPress={() => updateAdStatus(option.value)}
                                    disabled={isUpdatingStatus || selectedAd?.status === option.value}
                                >
                                    <View style={[styles.statusOptionIcon, { backgroundColor: `${option.color}15` }]}>
                                        <Ionicons name={option.icon as any} size={24} color={option.color} />
                                    </View>
                                    <View style={styles.statusOptionText}>
                                        <Text style={styles.statusOptionLabel}>{option.label}</Text>
                                        <Text style={styles.statusOptionDescription}>{option.description}</Text>
                                    </View>
                                    {selectedAd?.status === option.value && (
                                        <Ionicons name="checkmark-circle" size={24} color={option.color} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {isUpdatingStatus && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
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
    statusButton: {
        padding: 4,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    selectedAdInfo: {
        padding: 20,
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    selectedAdTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    selectedAdPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    statusOptions: {
        padding: 20,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    statusOptionActive: {
        borderColor: theme.colors.primary,
        backgroundColor: '#F0F4FF',
    },
    statusOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    statusOptionText: {
        flex: 1,
    },
    statusOptionLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    statusOptionDescription: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
});
