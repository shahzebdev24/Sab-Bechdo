/**
 * Product Context Card
 * Shows product details in chat for context
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ConversationAd } from '@/src/types';

interface ProductContextCardProps {
  ad: ConversationAd;
}

export const ProductContextCard: React.FC<ProductContextCardProps> = ({ ad }) => {
  const router = useRouter();

  // Handle case where ad might be undefined or incomplete
  if (!ad || !ad.photoUrls || ad.photoUrls.length === 0) {
    return null; // Don't render if ad data is incomplete
  }

  const handlePress = () => {
    router.push({
      pathname: '/product/[id]',
      params: { id: ad.id },
    });
  };

  const statusColor = ad.status === 'sold' ? '#EF4444' : ad.status === 'active' ? '#10B981' : '#6B7280';
  const statusText = ad.status === 'sold' ? 'Sold' : ad.status === 'active' ? 'Active' : 'Inactive';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: ad.photoUrls[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {ad.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>
        <Text style={styles.price}>
          {ad.currency} {ad.price.toLocaleString('en-PK')}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.condition}>{ad.condition === 'new' ? 'New' : 'Used'}</Text>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Product</Text>
            <Ionicons name="chevron-forward" size={14} color="#4A54DF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4A54DF',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  condition: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A54DF',
    marginRight: 4,
  },
});
