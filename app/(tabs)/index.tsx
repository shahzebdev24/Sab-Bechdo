import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { useMe, useAdsList, useToggleWishlist } from '@/src/hooks';
import { useCategories } from '@/src/hooks/queries/useCategories';
import { getAvatarUrl } from '@/src/utils/avatar';
import type { Ad } from '@/src/types';

type Listing = {
  id: string;
  title: string;
  priceLabel: string;
  locationLabel: string;
  image: { uri: string } | null;
};

// Map category names to icons
const getCategoryIcon = (categoryName: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    'Electronics': 'tv-outline',
    'Vehicles': 'car-sport-outline',
    'Property': 'home-outline',
    'Fashion': 'shirt-outline',
    'Home & Garden': 'leaf-outline',
    'Sports': 'football-outline',
    'Books': 'book-outline',
    'Pets': 'paw-outline',
    'Services': 'construct-outline',
    'Other': 'apps-outline',
  };
  return iconMap[categoryName] || 'apps-outline';
};

const HomeHeader = React.memo(({ 
  searchQuery, 
  setSearchQuery, 
  userName, 
  userAvatar,
  categories,
  categoriesLoading,
  onCategoryPress,
  selectedCategory,
}: { 
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  userName?: string;
  userAvatar?: string;
  categories: Array<{ id: string; name: string; icon: keyof typeof Ionicons.glyphMap }>;
  categoriesLoading: boolean;
  onCategoryPress: (categoryName: string) => void;
  selectedCategory?: string;
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const keywords = categories.length > 0 
    ? categories.slice(0, 5).map(c => c.name.toLowerCase())
    : ['mobiles', 'cars', 'property', 'jobs', 'electronics'];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % keywords.length);
    }, 2500); // Change every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.headerContainer}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.welcomeText}>Hello, Welcome! 👋</Text>
          <Text style={styles.title}>Sab Bechdo</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.colors.textPrimary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Image
              source={{ uri: userAvatar || getAvatarUrl(userName || 'User', 100) }}
              style={styles.avatarImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modern Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            placeholder={`Search for ${keywords[placeholderIndex]}...`}
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Promo Banner */}
      <FlatList
        data={[1, 2, 3]}
        keyExtractor={(item) => item.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={width - 48}
        decelerationRate="fast"
        style={styles.bannerList}
        renderItem={({ index }) => (
          <View style={[styles.bannerCard, { backgroundColor: index === 0 ? '#4A54DF' : index === 1 ? '#F43F5E' : '#10B981' }]}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTag}>Limited Offer</Text>
              <Text style={styles.bannerTitle}>Sell Smarter,{'\n'}Buy Faster</Text>
              <TouchableOpacity style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Check It Out</Text>
              </TouchableOpacity>
            </View>
            <Ionicons
              name={index === 0 ? "rocket-outline" : index === 1 ? "flash-outline" : "star-outline"}
              size={80}
              color="rgba(255,255,255,0.2)"
              style={styles.bannerIcon}
            />
          </View>
        )}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {categoriesLoading ? (
        <View style={styles.categoryLoadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : categories.length > 0 ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.name;
            return (
              <TouchableOpacity 
                style={styles.categoryItem} 
                activeOpacity={0.7}
                onPress={() => onCategoryPress(item.name)}
              >
                <View style={[
                  styles.categoryIconCircle,
                  isSelected && styles.categoryIconCircleSelected
                ]}>
                  <Ionicons 
                    name={item.icon} 
                    size={24} 
                    color={isSelected ? '#fff' : theme.colors.primary} 
                  />
                </View>
                <Text style={[
                  styles.categoryLabel,
                  isSelected && styles.categoryLabelSelected
                ]}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={styles.categoryEmptyContainer}>
          <Text style={styles.categoryEmptyText}>No categories available</Text>
        </View>
      )}

      <View style={[styles.sectionHeader, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
      </View>
    </View>
  );
});

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [togglingAdId, setTogglingAdId] = useState<string | null>(null);
  
  // Fetch current user for avatar
  const { data: user } = useMe();
  
  // Fetch categories from backend
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  
  // Fetch ads from backend
  const { data: adsData, isLoading } = useAdsList({
    page: 1,
    limit: 20,
    sort: 'recent',
    category: selectedCategory,
  });

  // Wishlist toggle
  const { toggle: toggleWishlist } = useToggleWishlist();

  // Transform categories for display
  const categories = React.useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.map(cat => ({
      id: cat.id || cat._id,
      name: cat.name,
      icon: getCategoryIcon(cat.name),
    }));
  }, [categoriesData]);

  // Handle category selection
  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategory(prev => prev === categoryName ? undefined : categoryName);
  };

  const listings: Listing[] = React.useMemo(() => {
    if (!adsData?.ads) {
      return [];
    }
    
    return adsData.ads.map((ad: Ad) => ({
      id: ad.id,
      title: ad.title,
      priceLabel: `Rs ${ad.price.toLocaleString('en-PK')}`,
      locationLabel: ad.location?.address || 'Location',
      image: (ad.photoUrls && ad.photoUrls.length > 0) ? { uri: ad.photoUrls[0] } : (ad.videoUrl ? { uri: ad.videoUrl } : null),
    }));
  }, [adsData]);

  // Filter by search query only (category filtering is done by API)
  const filteredListings = listings.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show empty state when no results
  const showEmptyState = !isLoading && filteredListings.length === 0;

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      setTogglingAdId(id);
      await toggleWishlist(id, isFavorite);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    } finally {
      setTogglingAdId(null);
    }
  };

  const renderItem = ({ item }: { item: Listing }) => {
    // Get isFavorite from backend data instead of local state
    const ad = adsData?.ads.find((a: Ad) => a.id === item.id);
    const isFavorite = ad?.isFavorite || false;
    const isToggling = togglingAdId === item.id;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push({
          pathname: '/product/[id]',
          params: {
            id: item.id,
            title: item.title,
            price: item.priceLabel,
            location: item.locationLabel,
            imageUri: item.image?.uri || ''
          }
        })}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image 
              source={item.image} 
              style={styles.cardImage}
            />
          ) : (
            <View style={[styles.cardImage, { backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="image-outline" size={48} color="#94A3B8" />
            </View>
          )}
          <TouchableOpacity
            style={styles.favoriteBadge}
            onPress={() => toggleFavorite(item.id, isFavorite)}
            activeOpacity={0.7}
            disabled={isToggling}
          >
            {isToggling ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color={isFavorite ? '#F43F5E' : '#64748B'}
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.priceText}>{item.priceLabel}</Text>
          <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
          <View style={styles.locRow}>
            <Ionicons name="location-sharp" size={12} color="#94A3B8" />
            <Text style={styles.locText} numberOfLines={1}>{item.locationLabel}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        key={`flatlist-${listings.length}`}
        data={filteredListings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={showEmptyState ? undefined : styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <HomeHeader 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            userName={user?.name} 
            userAvatar={user?.avatarUrl}
            categories={categories}
            categoriesLoading={categoriesLoading}
            onCategoryPress={handleCategoryPress}
            selectedCategory={selectedCategory}
          />
        }
        renderItem={renderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={false}
        extraData={[listings, selectedCategory]}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading ads...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                {selectedCategory 
                  ? `No ads found in "${selectedCategory}" category` 
                  : searchQuery 
                    ? `No items found for "${searchQuery}"` 
                    : 'No ads available'}
              </Text>
              {selectedCategory && (
                <TouchableOpacity 
                  style={styles.clearFilterButton}
                  onPress={() => setSelectedCategory(undefined)}
                >
                  <Text style={styles.clearFilterText}>Clear Filter</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F43F5E',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
    textAlign: 'left',
    marginTop: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerList: {
    marginBottom: 24,
    marginHorizontal: -24,
    paddingLeft: 24,
  },
  bannerCard: {
    width: width - 48,
    height: 160,
    borderRadius: 24,
    marginRight: 16,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bannerTextContainer: {
    justifyContent: 'center',
    zIndex: 1,
  },
  bannerTag: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
    marginBottom: 16,
  },
  bannerBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '700',
  },
  bannerIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  categoryContent: {
    paddingBottom: 20,
    gap: 20,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
  },
  categoryIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  categoryIconCircleSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  categoryLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  categoryEmptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  categoryEmptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 40,
  },
  columnWrapper: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDetails: {
    padding: 14,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 15,
    textAlign: 'center',
  },
  clearFilterButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
  },
  clearFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
