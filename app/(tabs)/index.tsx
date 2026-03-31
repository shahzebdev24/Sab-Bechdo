import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { useMe, useAdsList, useReelsList, useTopSellers, useAdsListInfinite, useReelsListInfinite } from '@/src/hooks';
import { useCategories } from '@/src/hooks/queries/useCategories';
import { getAvatarUrl } from '@/src/utils/avatar';
import type { Ad, TopSeller } from '@/src/types';

type Listing = {
  id: string;
  title: string;
  priceLabel: string;
  locationLabel: string;
  image: { uri: string } | null;
  isVideo: boolean;
  videoUrl?: string;
  ownerName?: string;
  ownerAvatarUrl?: string;
};

// Component: Video ka actual frame thumbnail extract karo
function VideoThumbnailCard({ videoUrl, style }: { videoUrl: string; style: any }) {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function generateThumbnail() {
      try {
        const result = await VideoThumbnails.getThumbnailAsync(videoUrl, {
          time: 3000, // 3 second andar se frame lo (beech ke paas)
          quality: 0.7,
        });
        if (!cancelled) setThumbnailUri(result.uri);
      } catch (error) {
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    generateThumbnail();
    return () => { cancelled = true; };
  }, [videoUrl]);

  if (loading) {
    return (
      <View style={[style, { backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="small" color="#94A3B8" />
      </View>
    );
  }

  if (thumbnailUri) {
    return (
      <Image source={{ uri: thumbnailUri }} style={[style, { resizeMode: 'cover' }]} />
    );
  }

  // Fallback: thumbnail generate nahi hua
  return (
    <View style={[style, { backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons name="videocam-outline" size={36} color="rgba(255,255,255,0.5)" />
    </View>
  );
}

// Banner carousel video card — plays inline, calls onVideoEnd when finished
function BannerVideoCard({ videoUrl, isActive, isBannerVisible, onVideoEnd, style }: {
  videoUrl: string;
  isActive: boolean;
  isBannerVisible: boolean;
  onVideoEnd: () => void;
  style: any;
}) {
  const player = useVideoPlayer(videoUrl, (p) => { p.loop = false; });

  // Refs to always have latest values inside useFocusEffect callback
  const isActiveRef = useRef(isActive);
  const isBannerVisibleRef = useRef(isBannerVisible);
  isActiveRef.current = isActive;
  isBannerVisibleRef.current = isBannerVisible;

  useEffect(() => {
    const sub = player.addListener('playToEnd', onVideoEnd);
    return () => sub.remove();
  }, [player, onVideoEnd]);

  // Play/pause jab active ya visibility change ho
  useEffect(() => {
    if (isActive && isBannerVisible) {
      player.currentTime = 0;
      try { player.play(); } catch (_) {}
    } else {
      try { player.pause(); } catch (_) {}
    }
  }, [isActive, isBannerVisible, player]);

  // Navigate out → pause | Navigate back → resume
  useFocusEffect(
    useCallback(() => {
      if (isActiveRef.current && isBannerVisibleRef.current) {
        try { player.play(); } catch (_) {}
      }
      return () => {
        try { player.pause(); } catch (_) {}
      };
    }, [player])
  );

  return (
    <VideoView
      player={player}
      style={style}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

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
  featuredAds,
  isBannerVisible,
  onBannerLayout,
}: {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  userName?: string;
  userAvatar?: string;
  categories: Array<{ id: string; name: string; icon: keyof typeof Ionicons.glyphMap }>;
  categoriesLoading: boolean;
  onCategoryPress: (categoryName: string) => void;
  selectedCategory?: string;
  featuredAds: Listing[];
  isBannerVisible: boolean;
  onBannerLayout?: (bannerBottom: number) => void;
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerRef = useRef<FlatList>(null);
  const bannerIndexRef = useRef(0);

  const keywords = categories.length > 0
    ? categories.slice(0, 5).map(c => c.name.toLowerCase())
    : ['mobiles', 'cars', 'property', 'jobs', 'electronics'];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % keywords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const goToNext = useCallback(() => {
    if (featuredAds.length <= 1) return;
    const next = (bannerIndexRef.current + 1) % featuredAds.length;
    bannerIndexRef.current = next;
    setActiveBannerIndex(next);
    try {
      bannerRef.current?.scrollToOffset({ offset: next * (ADS_CARD_W + ADS_CARD_GAP), animated: true });
    } catch (_) {}
  }, [featuredAds.length]);

  // Smart auto-scroll: photos → 5s timeout, videos → wait for playToEnd
  useEffect(() => {
    if (featuredAds.length <= 1) return;
    const currentAd = featuredAds[activeBannerIndex];
    if (currentAd?.isVideo) return; // BannerVideoCard handles this via onVideoEnd
    const timer = setTimeout(goToNext, 5000);
    return () => clearTimeout(timer);
  }, [activeBannerIndex, featuredAds, goToNext]);

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

      {/* Ads Banner Carousel */}
      {featuredAds.length > 0 ? (
        <View
          style={styles.adsBannerWrapper}
          onLayout={(e) => {
            const { y, height } = e.nativeEvent.layout;
            onBannerLayout?.(y + height);
          }}
        >
          <FlatList
            ref={bannerRef}
            data={featuredAds}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ADS_CARD_W + ADS_CARD_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / (ADS_CARD_W + ADS_CARD_GAP));
              bannerIndexRef.current = newIndex;
              setActiveBannerIndex(newIndex);
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.adsBannerCard}
                activeOpacity={0.92}
                onPress={() => router.push({
                  pathname: '/product/[id]',
                  params: { id: item.id, title: item.title, price: item.priceLabel, location: item.locationLabel, imageUri: item.image?.uri || '' }
                })}
              >
                {item.isVideo && item.videoUrl ? (
                  <BannerVideoCard
                    videoUrl={item.videoUrl}
                    isActive={index === activeBannerIndex}
                    isBannerVisible={isBannerVisible}
                    onVideoEnd={goToNext}
                    style={styles.adsBannerImage}
                  />
                ) : item.image ? (
                  <Image source={item.image} style={styles.adsBannerImage} />
                ) : (
                  <View style={[styles.adsBannerImage, { backgroundColor: '#4A54DF', alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.4)" />
                  </View>
                )}
                {/* Light overlay so image colors stay vivid */}
                <View style={styles.adsBannerOverlay} />
                {/* Bottom text bar */}
                <View style={styles.adsBannerContent}>
                  <Text style={styles.adsBannerTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.adsBannerPricePill}>
                    <Text style={styles.adsBannerPriceText}>{item.priceLabel}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        <View style={styles.bannerList}>
          <View style={[styles.adsBannerCard, { backgroundColor: '#4A54DF' }]}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTag}>Limited Offer</Text>
              <Text style={styles.bannerTitle}>Sell Smarter,{'\n'}Buy Faster</Text>
            </View>
            <Ionicons name="rocket-outline" size={80} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
          </View>
        </View>
      )}

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

    </View>
  );
});

const { width } = Dimensions.get('window');
const ADS_CARD_GAP = 12;
const ADS_CARD_W = width - 88;

// ─── Section Header ────────────────────────────────────────────────────────
function SectionHeader({ title, onViewAll }: { title: string; onViewAll?: () => void }) {
  return (
    <View style={styles.secHeader}>
      <View style={styles.secTitleRow}>
        <View style={styles.secAccentBar} />
        <Text style={styles.secTitle}>{title}</Text>
      </View>
      {onViewAll && (
        <TouchableOpacity style={styles.secViewAllBtn} onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.secViewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={12} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Horizontal Product Card (single row) ─────────────────────────────────
function HProductCard({ item, onPress }: { item: Listing; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.hCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.hCardImg}>
        {item.image ? (
          <Image source={item.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : item.isVideo && item.videoUrl ? (
          <VideoThumbnailCard videoUrl={item.videoUrl} style={StyleSheet.absoluteFill} />
        ) : (
          <Ionicons name="image-outline" size={32} color="#CBD5E1" />
        )}
      </View>
      <View style={styles.hCardBody}>
        <Text style={styles.hCardPrice}>{item.priceLabel}</Text>
        <Text style={styles.hCardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.hCardLoc}>
          <Ionicons name="location-sharp" size={10} color="#94A3B8" />
          <Text style={styles.hCardLocText} numberOfLines={1}>{item.locationLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Grid Card (compact, for 2-row horizontal grid) ───────────────────────
function HGridCard({ item, onPress }: { item: Listing; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.gridCardImg}>
        {item.image ? (
          <Image source={item.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : item.isVideo && item.videoUrl ? (
          <VideoThumbnailCard videoUrl={item.videoUrl} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="image-outline" size={28} color="#CBD5E1" />
          </View>
        )}
        {item.isVideo && (
          <View style={styles.gridCardVideoBadge}>
            <Ionicons name="play" size={8} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.gridCardBody}>
        <Text style={styles.gridCardPrice}>{item.priceLabel}</Text>
        <Text style={styles.gridCardTitle} numberOfLines={1}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── 2-Row Horizontal Grid Section ────────────────────────────────────────
function HGridSection({ data, onPress }: { data: Listing[]; onPress: (item: Listing) => void }) {
  // Group into columns of 2
  const columns: Listing[][] = [];
  for (let i = 0; i < data.length; i += 2) {
    columns.push(data.slice(i, i + 2));
  }
  return (
    <FlatList
      data={columns}
      keyExtractor={(_, i) => 'col-' + i}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.hListContent}
      renderItem={({ item: col }) => (
        <View style={{ gap: 10 }}>
          {col.map(item => (
            <HGridCard key={item.id} item={item} onPress={() => onPress(item)} />
          ))}
        </View>
      )}
    />
  );
}

// ─── Mini Reel Card ────────────────────────────────────────────────────────
function MiniReelCard({ item, onPress }: { item: Listing; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.reelCard} onPress={onPress} activeOpacity={0.9}>
      {item.videoUrl ? (
        <VideoThumbnailCard videoUrl={item.videoUrl} style={StyleSheet.absoluteFill} />
      ) : item.image ? (
        <Image source={item.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="videocam-outline" size={28} color="rgba(255,255,255,0.4)" />
        </View>
      )}
      <View style={styles.reelOverlay} />
      <View style={styles.reelPlayBtn}>
        <Ionicons name="play-circle" size={32} color="#fff" />
      </View>
      <View style={styles.reelBottom}>
        <Text style={styles.reelTitle} numberOfLines={1}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Reel Tab Card (screenshot style — 2-col grid, seller overlay) ─────────
const REEL_CARD_W = (width - 48 - 10) / 2; // 48=tabsSection paddingHorizontal(24*2), 10=gap

function ReelTabCard({ item, onPress }: { item: Listing; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.reelTabCard} onPress={onPress} activeOpacity={0.9}>
      {/* Thumbnail */}
      {item.videoUrl ? (
        <VideoThumbnailCard videoUrl={item.videoUrl} style={StyleSheet.absoluteFill} />
      ) : item.image ? (
        <Image source={item.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="videocam-outline" size={28} color="rgba(255,255,255,0.4)" />
        </View>
      )}

      {/* Bottom dark gradient overlay */}
      <View style={styles.reelTabGradient} />

      {/* Video play badge */}
      {item.isVideo && (
        <View style={styles.reelTabPlayBadge}>
          <Ionicons name="play" size={9} color="#fff" />
        </View>
      )}

      {/* Bottom seller info */}
      <View style={styles.reelTabBottom}>
        <Image
          source={{ uri: item.ownerAvatarUrl || getAvatarUrl(item.ownerName || item.title, 32) }}
          style={styles.reelTabAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.reelTabTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.reelTabLoc} numberOfLines={1}>{item.locationLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Top User Card ─────────────────────────────────────────────────────────
function TopUserCard({ user, onPress }: { user: TopSeller; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.userCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: user.avatarUrl || getAvatarUrl(user.name, 80) }} style={styles.userAvatarImg} />
      <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
      <Text style={styles.userSub} numberOfLines={1}>{user.location || 'Pakistan'}</Text>
      <View style={styles.userBadge}>
        <Text style={styles.userBadgeText}>{user.activeAdsCount} ads</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reels'>('products');
  const bannerBottomRef = useRef(0);

  const { data: user } = useMe();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  // ── Section-specific queries ─────────────────────────────────────────────
  const { data: topProductsData, isLoading: topProductsLoading } = useAdsList({ sort: 'views', limit: 8 });
  const { data: techRushData,    isLoading: techRushLoading    } = useAdsList({ category: 'Electronics' as any, limit: 8 });
  const { data: saverDealsData,  isLoading: saverDealsLoading  } = useAdsList({ sort: 'price_asc', limit: 8 });
  const { data: bannerData } = useReelsList({ videoOnly: true, limit: 6 } as any);
  const { data: reelsSectionData } = useReelsList({ videoOnly: true, limit: 10 } as any);
  const { data: topSellersData, isLoading: topSellersLoading } = useTopSellers(4);

  // ── Infinite scroll for tabs ─────────────────────────────────────────────
  const {
    data: productsPages,
    fetchNextPage: fetchNextProducts,
    hasNextPage: hasNextProducts,
    isFetchingNextPage: isFetchingProducts,
  } = useAdsListInfinite({ limit: 12, sort: 'recent', category: selectedCategory as any });

  const {
    data: reelsPages,
    fetchNextPage: fetchNextReels,
    hasNextPage: hasNextReels,
    isFetchingNextPage: isFetchingReels,
  } = useReelsListInfinite({ limit: 12, videoOnly: true } as any);

  const isLoading = topProductsLoading && techRushLoading && saverDealsLoading;

  const categories = React.useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: getCategoryIcon(cat.name),
    }));
  }, [categoriesData]);

  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategory(prev => prev === categoryName ? undefined : categoryName);
  };

  const toListings = (ads: Ad[]): Listing[] =>
    ads.map((ad: Ad) => ({
      id: ad.id,
      title: ad.title,
      priceLabel: `Rs ${ad.price.toLocaleString('en-PK')}`,
      locationLabel: ad.location?.address || 'Location',
      image: (ad.photoUrls && ad.photoUrls.length > 0) ? { uri: ad.photoUrls[0] } : null,
      isVideo: (!ad.photoUrls || ad.photoUrls.length === 0) && !!ad.videoUrl,
      videoUrl: ad.videoUrl,
      ownerName: (ad.owner as any)?.name,
      ownerAvatarUrl: (ad.owner as any)?.avatarUrl,
    }));

  const featuredAds  = React.useMemo(() => toListings(bannerData?.ads ?? []), [bannerData]);
  const topProducts  = React.useMemo(() => toListings(topProductsData?.ads ?? []), [topProductsData]);
  const techRush     = React.useMemo(() => toListings(techRushData?.ads ?? []), [techRushData]);
  const saverDeals   = React.useMemo(() => toListings(saverDealsData?.ads ?? []), [saverDealsData]);
  const reelSection  = React.useMemo(() => toListings(reelsSectionData?.ads ?? []), [reelsSectionData]);
  const topSellers   = topSellersData ?? [];

  // Flatten infinite pages for tabs
  const productsTabData = React.useMemo(() =>
    (productsPages?.pages ?? []).flatMap(p => toListings(p.ads)),
  [productsPages]);

  const reelsTabData = React.useMemo(() =>
    (reelsPages?.pages ?? []).flatMap(p => toListings(p.ads)),
  [reelsPages]);

  const tabData = activeTab === 'products' ? productsTabData : reelsTabData;

  const navigateToProduct = (item: Listing) =>
    router.push({
      pathname: '/product/[id]',
      params: { id: item.id, title: item.title, price: item.priceLabel, location: item.locationLabel, imageUri: item.image?.uri || '' },
    });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={100}
        onScroll={(e) => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
          setIsBannerVisible(contentOffset.y < bannerBottomRef.current);
          // Infinite scroll: 80% scroll pe next page fetch karo
          const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
          if (distanceFromBottom < 400) {
            if (activeTab === 'products' && hasNextProducts && !isFetchingProducts) fetchNextProducts();
            if (activeTab === 'reels' && hasNextReels && !isFetchingReels) fetchNextReels();
          }
        }}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <HomeHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userName={user?.name}
          userAvatar={user?.avatarUrl}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onCategoryPress={handleCategoryPress}
          selectedCategory={selectedCategory}
          featuredAds={featuredAds}
          isBannerVisible={isBannerVisible}
          onBannerLayout={(bottom) => { bannerBottomRef.current = bottom; }}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading ads...</Text>
          </View>
        ) : (
          <>
            {/* ── Top Products (2-row horizontal grid) ──────── */}
            <View style={styles.sectionWrapper}>
              <SectionHeader title="Top Products" onViewAll={() => {}} />
              {topProducts.length === 0
                ? <Text style={styles.emptySection}>No products yet</Text>
                : <HGridSection data={topProducts} onPress={navigateToProduct} />
              }
            </View>

            {/* ── Ultimate Tech Rush ────────────────────────── */}
            <View style={styles.sectionWrapper}>
              <SectionHeader title="Ultimate Tech Rush" onViewAll={() => {}} />
              <FlatList
                data={techRush}
                keyExtractor={(item) => 'tr-' + item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hListContent}
                renderItem={({ item }) => <HProductCard item={item} onPress={() => navigateToProduct(item)} />}
                ListEmptyComponent={<Text style={styles.emptySection}>No items yet</Text>}
              />
            </View>

            {/* ── Mini Reels ────────────────────────────────── */}
            {reelSection.length > 0 && (
              <View style={styles.sectionWrapper}>
                <SectionHeader title="Latest Reels" />
                <FlatList
                  data={reelSection}
                  keyExtractor={(item) => 'rl-' + item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hListContent}
                  renderItem={({ item }) => <MiniReelCard item={item} onPress={() => router.push('/(tabs)/reel')} />}
                />
              </View>
            )}

            {/* ── Saver Deals ───────────────────────────────── */}
            <View style={styles.sectionWrapper}>
              <SectionHeader title="Saver Deals" onViewAll={() => {}} />
              <FlatList
                data={saverDeals}
                keyExtractor={(item) => 'sd-' + item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hListContent}
                renderItem={({ item }) => <HProductCard item={item} onPress={() => navigateToProduct(item)} />}
                ListEmptyComponent={<Text style={styles.emptySection}>No deals yet</Text>}
              />
            </View>

            {/* ── Top Sellers ───────────────────────────────── */}
            {!topSellersLoading && topSellers.length > 0 && (
              <View style={styles.sectionWrapper}>
                <SectionHeader title="Top Sellers" />
                <View style={styles.usersGrid}>
                  {topSellers.map((u) => (
                    <TopUserCard key={u.id} user={u} onPress={() => router.push(`/profile/${u.id}` as any)} />
                  ))}
                </View>
              </View>
            )}

            {/* ── Reels | Products Tabs ─────────────────────── */}
            <View style={styles.tabsSection}>
              <View style={styles.tabsRow}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'products' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('products')}
                >
                  <Ionicons name="grid-outline" size={15} color={activeTab === 'products' ? '#fff' : '#64748B'} />
                  <Text style={[styles.tabBtnText, activeTab === 'products' && styles.tabBtnTextActive]}>Products</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'reels' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('reels')}
                >
                  <Ionicons name="play-circle-outline" size={15} color={activeTab === 'reels' ? '#fff' : '#64748B'} />
                  <Text style={[styles.tabBtnText, activeTab === 'reels' && styles.tabBtnTextActive]}>Reels</Text>
                </TouchableOpacity>
              </View>

              {(activeTab === 'products' ? productsTabData : reelsTabData).length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>
                    {activeTab === 'reels' ? 'No reels available' : selectedCategory ? `No ads in "${selectedCategory}"` : 'No ads available'}
                  </Text>
                  {selectedCategory && (
                    <TouchableOpacity style={styles.clearFilterButton} onPress={() => setSelectedCategory(undefined)}>
                      <Text style={styles.clearFilterText}>Clear Filter</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : activeTab === 'reels' ? (
                // ── Reels tab: 2-col portrait grid ───────────────────────
                <View style={styles.reelTabGrid}>
                  {reelsTabData.map((item) => (
                    <ReelTabCard
                      key={item.id}
                      item={item}
                      onPress={() => router.push('/(tabs)/reel')}
                    />
                  ))}
                </View>
              ) : (
                // ── Products tab: existing grid ───────────────────────────
                <View style={styles.tabGrid}>
                  {productsTabData.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.tabCard}
                      activeOpacity={0.9}
                      onPress={() => navigateToProduct(item)}
                    >
                      <View style={styles.tabCardImg}>
                        {item.image ? (
                          <Image source={item.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
                        ) : item.isVideo && item.videoUrl ? (
                          <VideoThumbnailCard videoUrl={item.videoUrl} style={StyleSheet.absoluteFill} />
                        ) : (
                          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }]}>
                            <Ionicons name="image-outline" size={28} color="#94A3B8" />
                          </View>
                        )}
                        {item.isVideo && (
                          <View style={styles.tabCardPlayBadge}>
                            <Ionicons name="play" size={10} color="#fff" />
                          </View>
                        )}
                      </View>
                      <View style={styles.tabCardBody}>
                        <Text style={styles.tabCardPrice}>{item.priceLabel}</Text>
                        <Text style={styles.tabCardTitle} numberOfLines={1}>{item.title}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {(isFetchingProducts || isFetchingReels) && (
                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  adsBannerWrapper: {
    marginBottom: 24,
    marginHorizontal: -24,
  },
  adsBannerCard: {
    width: ADS_CARD_W,
    height: 360,
    borderRadius: 24,
    marginRight: ADS_CARD_GAP,
    overflow: 'hidden',
    position: 'relative',
  },
  adsBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  adsBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 24,
  },
  adsBannerContent: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    alignItems: 'center',
    width: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary + 'D0',
    borderRadius: 32,
  },
  adsBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    width: '100%',
  },
  adsBannerPricePill: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  adsBannerPriceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
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
  // ─── Section wrappers ────────────────────────────────────────────────────
  sectionWrapper: {
    marginBottom: 6,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 16,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  secHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  secTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secAccentBar: {
    width: 4,
    height: 18,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  secTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.1,
  },
  secViewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: theme.colors.primary + '12',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  secViewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  hListContent: {
    paddingLeft: 16,
    paddingRight: 12,
    gap: 10,
    paddingBottom: 2,
  },
  // ─── 2-row grid card ─────────────────────────────────────────────────────
  gridCard: {
    width: 155,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  gridCardImg: {
    width: '100%',
    height: 130,
    backgroundColor: '#F1F5F9',
  },
  gridCardVideoBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: theme.colors.primary,
    width: 18,
    height: 18,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardBody: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  gridCardPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  gridCardTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  // ─── Horizontal product card ─────────────────────────────────────────────
  hCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  hCardImg: {
    width: '100%',
    height: 150,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hCardBody: {
    padding: 10,
  },
  hCardPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  hCardTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  hCardLoc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  hCardLocText: {
    fontSize: 10,
    color: '#94A3B8',
    flex: 1,
  },
  // ─── Mini reel card ──────────────────────────────────────────────────────
  reelCard: {
    width: 130,
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  reelOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  reelPlayBtn: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
  },
  reelBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  reelTitle: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  // ─── Top users ───────────────────────────────────────────────────────────
  usersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  userCard: {
    width: (width - 74) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  userAvatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  userSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  userBadge: {
    marginTop: 8,
    backgroundColor: theme.colors.primary + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  userBadgeText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  // ─── Bottom tabs ─────────────────────────────────────────────────────────
  tabsSection: {
    marginTop: 8,
    paddingHorizontal: 24,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#fff',
  },
  tabGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tabCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tabCardImg: {
    width: '100%',
    height: 160,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  tabCardPlayBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: theme.colors.primary,
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCardBody: {
    padding: 12,
  },
  tabCardPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  tabCardTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  emptySection: {
    color: '#94A3B8',
    fontSize: 13,
    paddingVertical: 20,
    paddingLeft: 8,
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
  // ── Reel Tab Card ──────────────────────────────────────────────────────────
  reelTabCard: {
    width: REEL_CARD_W,
    height: 240,
    borderRadius: 12,
    overflow: 'hidden' as const,
    backgroundColor: '#1a1a2e',
    marginBottom: 10,
  },
  reelTabGradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  reelTabPlayBadge: {
    position: 'absolute' as const,
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 2,
  },
  reelTabBottom: {
    position: 'absolute' as const,
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  reelTabAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  reelTabTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  reelTabLoc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  reelTabChatBtn: {
    position: 'absolute' as const,
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  reelTabGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
});
