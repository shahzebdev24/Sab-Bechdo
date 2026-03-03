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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { subscribeToAds, type AdRecord } from '@/lib/ad-service';
import { theme } from '@/theme';

type Category = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Listing = {
  id: string;
  title: string;
  priceLabel: string;
  locationLabel: string;
  image: { uri: string } | null;
};

const CATEGORIES: Category[] = [
  { id: 'mobiles', label: 'Mobiles', icon: 'phone-portrait-outline' },
  { id: 'cars', label: 'Cars', icon: 'car-sport-outline' },
  { id: 'property', label: 'Property', icon: 'home-outline' },
  { id: 'jobs', label: 'Jobs', icon: 'briefcase-outline' },
  { id: 'electronics', label: 'Electronics', icon: 'tv-outline' },
];

const DUMMY_LISTINGS: Listing[] = [
  {
    id: 'd1',
    title: 'iPhone 12 - 64GB',
    priceLabel: '₹18,500',
    locationLabel: 'Mumbai - 2 hrs ago',
    image: { uri: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=400&auto=format&fit=crop' },
  },
  {
    id: 'd2',
    title: 'Honda Civic 2018',
    priceLabel: '₹5,20,000',
    locationLabel: 'Delhi - 3 hrs ago',
    image: { uri: 'https://images.unsplash.com/photo-1533473359331-01d898a3b5ce?q=80&w=400&auto=format&fit=crop' },
  },
  {
    id: 'd3',
    title: 'MacBook Air M1',
    priceLabel: '₹55,000',
    locationLabel: 'Bangalore - 5 hrs ago',
    image: { uri: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=400&auto=format&fit=crop' },
  },
  {
    id: 'd4',
    title: 'Sony PlayStation 5',
    priceLabel: '₹42,000',
    locationLabel: 'Pune - 1 day ago',
    image: { uri: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop' },
  },
  {
    id: 'd5',
    title: 'Samsung Galaxy S21',
    priceLabel: '₹32,000',
    locationLabel: 'Hyderabad - 4 hrs ago',
    image: { uri: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=400&auto=format&fit=crop' },
  },
  {
    id: 'd6',
    title: 'Royal Enfield Classic 350',
    priceLabel: '₹1,45,000',
    locationLabel: 'Chennai - 2 days ago',
    image: { uri: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&auto=format&fit=crop' },
  },
  {
    id: 'd7',
    title: 'Dell XPS 13',
    priceLabel: '₹75,000',
    locationLabel: 'Gurgaon - 1 hr ago',
    image: { uri: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=400&auto=format&fit=crop' },
  },
  {
    id: 'd8',
    title: 'Canon EOS 200D',
    priceLabel: '₹28,000',
    locationLabel: 'Kolkata - 6 hrs ago',
    image: { uri: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=400&auto=format&fit=crop' },
  },
  {
    id: 'd9',
    title: 'iPad Pro 11"',
    priceLabel: '₹65,000',
    locationLabel: 'Ahmedabad - 3 hrs ago',
    image: { uri: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop' },
  },
  {
    id: 'd10',
    title: 'Nikon D5600',
    priceLabel: '₹35,000',
    locationLabel: 'Jaipur - 12 hrs ago',
    image: { uri: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop' },
  },
  {
    id: 'd11',
    title: 'Apple Watch Series 6',
    priceLabel: '₹22,000',
    locationLabel: 'Surat - 2 hrs ago',
    image: { uri: 'https://images.unsplash.com/photo-1434493789847-2902a52dda8c?q=80&w=400&auto=format&fit=crop' },
  },
  {
    id: 'd12',
    title: 'Hyundai i20',
    priceLabel: '₹4,50,000',
    locationLabel: 'Lucknow - 1 day ago',
    image: { uri: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=400&auto=format&fit=crop' },
  },
];

const HomeHeader = React.memo(({ searchQuery, setSearchQuery }: { searchQuery: string, setSearchQuery: (text: string) => void }) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const keywords = ['mobiles', 'cars', 'property', 'jobs', 'electronics'];

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
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }}
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

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryItem} activeOpacity={0.7}>
            <View style={styles.categoryIconCircle}>
              <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.categoryLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={[styles.sectionHeader, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
      </View>
    </View>
  );
});

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState<Listing[]>(DUMMY_LISTINGS);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = listings.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  useEffect(() => {
    const formatAd = (ad: AdRecord): Listing => {
      const priceLabel = `₨ ${ad.price.toLocaleString('en-PK')}`;
      const locationLabel = ad.location?.address ?? 'Location';
      const firstImage = ad.photoUrls?.[0] ? { uri: ad.photoUrls[0] } : null;
      return {
        id: ad.id,
        title: ad.title || 'Untitled ad',
        priceLabel,
        locationLabel,
        image: firstImage,
      };
    };

    const unsubscribe = subscribeToAds((ads) => {
      setListings([...ads.map(formatAd), ...DUMMY_LISTINGS]);
    });
    return unsubscribe;
  }, []);

  const renderItem = ({ item }: { item: Listing }) => {
    const isFavorite = favorites.has(item.id);
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
          {item.image && <Image source={item.image} style={styles.cardImage} />}
          <TouchableOpacity
            style={styles.favoriteBadge}
            onPress={() => toggleFavorite(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? '#F43F5E' : '#64748B'}
            />
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
        data={filteredListings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No items found for "{searchQuery}"</Text>
          </View>
        }
      />
    </View>
  );
}

import { Dimensions } from 'react-native';

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
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
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
  },
  cardImage: {
    width: '100%',
    height: '100%',
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 15,
  },
});
