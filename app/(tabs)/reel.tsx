import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewToken,
  ActivityIndicator
} from 'react-native';
import { GestureHandlerRootView, HandlerStateChangeEvent, State, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReelsListInfinite, useReelDetail, useToggleWishlist, useToggleLike, useLikeStatus, useComments, useCreateComment, useFollowStatus, useToggleFollow, useMe } from '@/src/hooks';
import { useCategories } from '@/src/hooks/queries/useCategories';
import { getAvatarUrl } from '@/src/utils/avatar';
import { ReelMediaCarousel } from '@/components/reels';
import type { Ad } from '@/src/types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');
const { height: WINDOW_HEIGHT_RAW, width: WINDOW_WIDTH_RAW } = Dimensions.get('window');

// Use screen height on Android to account for translucent status bar and navigations
const WINDOW_HEIGHT = Platform.OS === 'android' ? SCREEN_HEIGHT : WINDOW_HEIGHT_RAW;
const WINDOW_WIDTH = WINDOW_WIDTH_RAW;

const ReelItem = ({ item, isVisible }: { item: Ad; isVisible: boolean }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(item.isFavorite || false);
  const [isCommentVisible, setIsCommentVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  
  // Ref for TextInput to control keyboard
  const commentInputRef = useRef<TextInput>(null);

  // Determine media type: video has priority, then images
  const hasVideo = !!item.videoUrl;
  const hasImages = item.photoUrls && item.photoUrls.length > 0;
  const mediaType = hasVideo ? 'video' : hasImages ? 'images' : 'none';

  const player = useVideoPlayer(item.videoUrl || '');
  const router = useRouter();
  
  // Get current user
  const { data: currentUser } = useMe();
  
  // Separate hooks for like and wishlist
  const { toggle: toggleLike, isLoading: isTogglingLike } = useToggleLike();
  const { toggle: toggleWishlist, isLoading: isTogglingWishlist } = useToggleWishlist();
  const { data: likeStatus, isError: likeStatusError } = useLikeStatus(item.id);
  
  // Follow functionality
  const { data: followStatus, isLoading: isLoadingFollowStatus } = useFollowStatus(item.owner.id, !!item.owner.id);
  const { toggle: toggleFollow, isLoading: isFollowLoading } = useToggleFollow();
  
  // Type-safe follow status
  const isFollowing = (followStatus as { following?: boolean })?.following ?? false;
  
  // Check if current user is the owner
  const isOwnAd = currentUser?.id === item.owner.id;
  
  // Comments hooks
  const { data: commentsData, isLoading: commentsLoading } = useComments(item.id, { limit: 20 });
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment();

  // Sync like status from backend
  useEffect(() => {
    if (likeStatus) {
      setLiked(likeStatus.liked);
      setLikeCount(likeStatus.likesCount || 0);
    } else if (likeStatusError) {
      // Fallback: use item views as initial like count if backend fails
      console.log('Like status failed, using fallback');
      setLikeCount(item.views || 0);
      setLiked(false);
    }
  }, [likeStatus, likeStatusError, item.views]);

  // Sync saved state with item.isFavorite
  useEffect(() => {
    setSaved(item.isFavorite || false);
  }, [item.isFavorite]);

  useEffect(() => {
    if (mediaType === 'video') {
      player.loop = true;
      if (isVisible && isFocused && !isPaused) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isVisible, isFocused, player, mediaType, isPaused]);

  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  useEffect(() => {
    // No longer using videoRef, player is initialized with useVideoPlayer
  }, []);

  const singleTapRef = useRef(null);
  const doubleTapRef = useRef(null);

  const handleSingleTap = (event: HandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE && mediaType === 'video') {
      setIsPaused(prev => !prev);
    }
  };

  const handleDoubleTap = async (event: HandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      heartScale.value = withSequence(withSpring(1), withDelay(400, withSpring(0)));
      heartOpacity.value = withSequence(withTiming(1), withDelay(400, withTiming(0)));
      
      if (!liked) {
        const optimisticCount = likeCount + 1;
        setLiked(true);
        setLikeCount(optimisticCount);
        try {
          await toggleLike(item.id, false);
        } catch (error) {
          console.error('Failed to like ad:', error);
          setLiked(false);
          setLikeCount(likeCount);
        }
      }
    }
  };

  const handleLikePress = async () => {
    const newLikedState = !liked;
    const optimisticCount = newLikedState ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLiked(newLikedState);
    setLikeCount(optimisticCount);
    try {
      await toggleLike(item.id, liked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setLiked(!newLikedState);
      setLikeCount(likeCount);
    }
  };

  const handleSavePress = async () => {
    const newSavedState = !saved;
    setSaved(newSavedState);
    try {
      await toggleWishlist(item.id, saved);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      setSaved(!newSavedState);
    }
  };

  const handleFollowPress = async () => {
    if (!item.owner.id) return;
    
    try {
      await toggleFollow(item.owner.id, isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    
    createComment(
      { adId: item.id, text: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText('');
        },
        onError: (error) => {
          console.error('Failed to create comment:', error);
          Alert.alert('Error', 'Failed to post comment. Please try again.');
        }
      }
    );
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  // Track progress via useEffect (only for videos)
  useEffect(() => {
    if (mediaType !== 'video') return;
    
    const subscription = player.addListener('timeUpdate', (event) => {
      if (player.duration > 0) {
        setProgress(event.currentTime / player.duration);
      }
    });
    return () => {
      subscription.remove();
    };
  }, [player, mediaType]);

  const onShare = async () => {
    try {
      const deepLink = `sabbechdo://product/${item.id}`;
      const message = `🛍️ *${item.title}*\n💰 ${item.currency} ${item.price.toLocaleString('en-PK')}\n📍 ${item.location?.address || 'Pakistan'}\n\nSab Bechdo app par dekho:\n${deepLink}`;
      await Share.share({ message });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <View style={styles.reelItem}>
      {mediaType === 'video' ? (
        <TapGestureHandler ref={doubleTapRef} onHandlerStateChange={handleDoubleTap} numberOfTaps={2}>
          <TapGestureHandler ref={singleTapRef} onHandlerStateChange={handleSingleTap} numberOfTaps={1} waitFor={doubleTapRef}>
            <View style={StyleSheet.absoluteFill}>
              <VideoView
                player={player}
                style={styles.video}
                contentFit="cover"
                nativeControls={false}
              />
              {/* Pause icon overlay */}
              {isPaused && (
                <View style={styles.pauseOverlay}>
                  <Ionicons name="pause-circle" size={72} color="rgba(255,255,255,0.85)" />
                </View>
              )}
              <View style={styles.heartOverlay}>
                <Animated.View style={heartStyle}>
                  <Ionicons name="heart" size={100} color="#fff" />
                </Animated.View>
              </View>
            </View>
          </TapGestureHandler>
        </TapGestureHandler>
      ) : mediaType === 'images' ? (
        <>
          {/* Carousel - Full screen, receives all touches */}
          <ReelMediaCarousel images={item.photoUrls || []} />
          
          {/* Heart animation overlay - doesn't block touches */}
          <View style={styles.heartOverlay}>
            <Animated.View style={heartStyle}>
              <Ionicons name="heart" size={100} color="#fff" />
            </Animated.View>
          </View>
        </>
      ) : (
        <TapGestureHandler onHandlerStateChange={handleDoubleTap} numberOfTaps={2}>
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.noMediaContainer}>
              <Ionicons name="image-outline" size={60} color="#94a3b8" />
              <Text style={styles.noMediaText}>No media available</Text>
            </View>
            <View style={styles.heartOverlay}>
              <Animated.View style={heartStyle}>
                <Ionicons name="heart" size={100} color="#fff" />
              </Animated.View>
            </View>
          </View>
        </TapGestureHandler>
      )}

      {/* Side Action Menu */}
      <View style={styles.sideActions}>
        <View style={styles.profileBox}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push({
              pathname: '/seller/[id]',
              params: {
                id: item.owner.id,
                name: item.owner.name,
                avatar: item.owner.avatarUrl || getAvatarUrl(item.owner.name),
                isFollowed: isFollowing ? 'true' : 'false'
              }
            })}
          >
            <Image source={{ uri: item.owner.avatarUrl || getAvatarUrl(item.owner.name) }} style={styles.profileImg} />
          </TouchableOpacity>
          {!isOwnAd && (
            <TouchableOpacity
              style={[styles.plusBtn, isFollowing && { backgroundColor: '#10B981', borderColor: '#10B981' }]}
              onPress={handleFollowPress}
              disabled={isFollowLoading}
            >
              {isFollowLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name={isFollowing ? "checkmark" : "add"} size={12} color="#fff" />
              )}
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.actBtn} 
          onPress={handleLikePress}
          disabled={isTogglingLike}
        >
          <Ionicons name={liked ? "heart" : "heart-outline"} size={32} color={liked ? "#F43F5E" : "#fff"} />
          <Text style={styles.actText}>{likeCount > 0 ? likeCount.toLocaleString() : 'Like'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actBtn} onPress={() => setIsCommentVisible(true)}>
          <Ionicons name="chatbubble-ellipses-outline" size={30} color="#fff" />
          <Text style={styles.actText}>{commentsData?.total || 0}</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.actBtn} onPress={onShare}>
          <Ionicons name="paper-plane-outline" size={30} color="#fff" />
          <Text style={styles.actText}>Share</Text>
        </TouchableOpacity> */}

        <TouchableOpacity 
          style={styles.actBtn}
          onPress={handleSavePress}
          disabled={isTogglingWishlist}
        >
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={28} color={saved ? "#4F46E5" : "#fff"} />
          <Text style={styles.actText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info Section */}
      <View style={styles.bottomSection}>
        <View style={styles.infoGlassCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.itemPrice}>{item.currency} {item.price.toLocaleString('en-PK')}</Text>
          </View>
          <View style={styles.locationTag}>
            <Ionicons name="location-sharp" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.locationText}>{item.location?.address || 'Location'}</Text>
          </View>
          <TouchableOpacity
            style={styles.mainCta}
            onPress={() => router.push({
              pathname: "/product/[id]",
              params: { id: item.id }
            })}
          >
            <Text style={styles.ctaLabel}>View Product Details</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar - Only for videos */}
      {mediaType === 'video' && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      )}

      {/* Comment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCommentVisible}
        onRequestClose={() => setIsCommentVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.commentModalOverlay}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setIsCommentVisible(false)}
          />
          <View style={styles.commentContent} pointerEvents="box-none">
            <View style={styles.commentHeader}>
              <Text style={styles.commentTitle}>
                Product Feedback ({commentsData?.total || 0})
              </Text>
              <TouchableOpacity onPress={() => setIsCommentVisible(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }} pointerEvents="box-none">
              {commentsLoading ? (
                <View style={styles.centerContent}>
                  <ActivityIndicator size="small" color="#4F46E5" />
                  <Text style={styles.loadingText}>Loading comments...</Text>
                </View>
              ) : (
                <FlatList
                  data={commentsData?.comments || []}
                  keyExtractor={(comment) => comment.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1 }}
                  keyboardShouldPersistTaps="always"
                  renderItem={({ item: comment }) => (
                    <View style={styles.commentItem}>
                      <View style={styles.commentUserRow}>
                        <View style={styles.commentAvatarPlaceholder}>
                          <Text style={styles.avatarInitial}>{comment.user.name[0]}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.commentUser}>{comment.user.name}</Text>
                          <Text style={styles.commentTime}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyComments}>
                      <Ionicons name="chatbubbles-outline" size={50} color="#cbd5e1" />
                      <Text style={styles.emptyText}>No feedback yet</Text>
                      <Text style={styles.emptySubtext}>Be the first to share your thoughts!</Text>
                    </View>
                  }
                />
              )}
            </View>

            <View style={styles.commentInputRow}>
              <TextInput
                ref={commentInputRef}
                style={styles.commentInput}
                placeholder="Write your feedback..."
                placeholderTextColor="#94a3b8"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <TouchableOpacity 
                style={[
                  styles.sendBtn, 
                  (!commentText.trim() || isCreatingComment) && styles.sendBtnDisabled
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || isCreatingComment}
                activeOpacity={0.7}
              >
                {isCreatingComment ? (
                  <ActivityIndicator size={16} color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function ReelScreen() {
  const insets = useSafeAreaInsets();
  const { initialReelId, sort, category } = useLocalSearchParams<{ initialReelId?: string; sort?: string; category?: string }>();
  const [activeId, setActiveId] = useState<string>(initialReelId || '');
  const flatListRef = useRef<FlatList>(null);
  const hasScrolledRef = useRef(false);
  const [filterVisible, setFilterVisible] = useState(false);

  // Active filters (local state — user can change from within reel screen)
  const [activeSort, setActiveSort] = useState<string | undefined>(sort);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(category);

  // Pending filters — only applied when user taps Apply
  const [pendingSort, setPendingSort] = useState<string | undefined>(sort);
  const [pendingCategory, setPendingCategory] = useState<string | undefined>(category);

  const openFilter = () => {
    // Reset pending to current active when opening
    setPendingSort(activeSort);
    setPendingCategory(activeCategory);
    setFilterVisible(true);
  };

  const applyFilter = () => {
    setActiveSort(pendingSort);
    setActiveCategory(pendingCategory);
    setFilterVisible(false);
  };

  const clearFilter = () => {
    setPendingSort(undefined);
    setPendingCategory(undefined);
    setActiveSort(undefined);
    setActiveCategory(undefined);
    setFilterVisible(false);
  };

  const pendingChanged = pendingSort !== activeSort || pendingCategory !== activeCategory;

  const { data: categoriesData } = useCategories();
  const categoryList = useMemo(() => categoriesData?.map(c => c.name) ?? [], [categoriesData]);

  // initialReelId change hone pe state reset karo (back → new reel click)
  useEffect(() => {
    hasScrolledRef.current = false;
    setActiveId(initialReelId || '');
  }, [initialReelId]);

  // sort/category change hone pe scroll to top + activeId reset
  // category ko categoryList se normalize karo (case-insensitive match)
  useEffect(() => {
    setActiveSort(sort);
    setPendingSort(sort);
    if (category && categoryList.length > 0) {
      const matched = categoryList.find(c => c.toLowerCase() === category.toLowerCase());
      setActiveCategory(matched ?? category);
      setPendingCategory(matched ?? category);
    } else {
      setActiveCategory(category);
      setPendingCategory(category);
    }
    setActiveId('');
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [sort, category, categoryList]);

  // Bug Fix 2: Specific reel pehle fetch karo by ID (deep-link support)
  const { data: initialReel, isSuccess: initialReelLoaded } = useReelDetail(
    initialReelId ?? '',
    !!initialReelId
  );

  // Build filters from active state
  const reelFilters = useMemo(() => ({
    limit: 10,
    ...(activeSort ? { sort: activeSort as 'recent' | 'price_asc' | 'price_desc' | 'views' } : {}),
    ...(activeCategory ? { category: activeCategory as any } : {}),
  }), [activeSort, activeCategory]);

  // Fetch reels from backend with infinite scroll
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReelsListInfinite(reelFilters);

  // Flatten all pages + inject initialReel at top (deduplicated)
  const reels = useMemo(() => {
    const feedReels = data?.pages.flatMap(page => page.ads) ?? [];
    if (!initialReel) return feedReels;
    // Duplicate avoid karo — agar feed mein already hai toh top pe move karo
    const filtered = feedReels.filter(r => r.id !== initialReel.id);
    return [initialReel, ...filtered];
  }, [data, initialReel]);

  // Set initial active ID (no initialReelId case)
  useEffect(() => {
    if (reels.length > 0 && !activeId) {
      setActiveId(reels[0].id);
    }
  }, [reels, activeId]);

  // Scroll to index 0 jab initialReel ya feed data ready ho
  useEffect(() => {
    if (!initialReelId || hasScrolledRef.current || reels.length === 0) return;
    // initialReel loaded ho ya feed data aa gaya ho — dono cases mein scroll karo
    const readyToScroll = initialReelLoaded || (data?.pages?.length ?? 0) > 0;
    if (!readyToScroll) return;
    hasScrolledRef.current = true;
    setActiveId(reels[0].id);
    flatListRef.current?.scrollToIndex({ index: 0, animated: false });
  }, [reels, initialReelId, initialReelLoaded, data]);

  // Refs — stale closure se bachne ke liye latest values track karo
  const reelsRef = useRef(reels);
  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingNextPageRef = useRef(isFetchingNextPage);
  const fetchNextPageRef = useRef(fetchNextPage);
  reelsRef.current = reels;
  hasNextPageRef.current = hasNextPage;
  isFetchingNextPageRef.current = isFetchingNextPage;
  fetchNextPageRef.current = fetchNextPage;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (!viewableItems || viewableItems.length === 0) return;
    const currentItem = viewableItems[0].item;
    setActiveId(currentItem.id);
    // Last 3 reels pe pohonch jao to next page fetch karo
    const idx = reelsRef.current.findIndex(r => r.id === currentItem.id);
    if (idx >= reelsRef.current.length - 3 && hasNextPageRef.current && !isFetchingNextPageRef.current) {
      fetchNextPageRef.current();
    }
  }).current;

  // Jab specific reel click se aaya ho aur woh fetch ho rahi ho
  const isInitialReelLoading = !!initialReelId && !initialReelLoaded && !initialReel;

  // Loading state — either feed loading ya specific reel loading
  if (isLoading || isInitialReelLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>
          {isInitialReelLoading ? 'Opening Reel...' : 'Loading Reels...'}
        </Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={60} color="#F43F5E" />
        <Text style={styles.errorText}>Failed to load reels</Text>
        <Text style={styles.errorSubtext}>Please try again later</Text>
      </View>
    );
  }

  // Empty state
  if (reels.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent />
        {/* Header with filter — taake filter remove kar sake */}
        <View style={[styles.topGradient, { paddingTop: insets.top + 10, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.85)' }]}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.activeTabWrap}>
            <Text style={styles.activeTabText}>
              {activeCategory
                ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)
                : activeSort === 'price_asc' ? 'Saver Deals'
                : activeSort === 'views' ? 'Top Products'
                : 'For You'}
            </Text>
            <View style={styles.tabIndicator} />
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7} onPress={openFilter}>
            <Ionicons name="options-outline" size={22} color="#fff" />
            {(activeSort || activeCategory) && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>

        {/* Active filter chip */}
        {(activeSort || activeCategory) && (
          <View style={[styles.filterChipWrap, { top: insets.top + 60, zIndex: 99 }]}>
            <View style={styles.filterChip}>
              <Ionicons name="funnel" size={11} color="#fff" />
              <Text style={styles.filterChipText}>
                {activeCategory
                  ? activeCategory
                  : activeSort === 'price_asc' ? 'Lowest Price'
                  : activeSort === 'price_desc' ? 'Highest Price'
                  : activeSort === 'views' ? 'Most Viewed'
                  : ''}
              </Text>
              <TouchableOpacity onPress={() => { setActiveSort(undefined); setActiveCategory(undefined); }}>
                <Ionicons name="close-circle" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.centerContent}>
          <Ionicons name="videocam-outline" size={60} color="#94a3b8" />
          <Text style={styles.emptyText}>No reels available</Text>
          {(activeSort || activeCategory) && (
            <TouchableOpacity
              style={{ marginTop: 16, backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
              onPress={() => { setActiveSort(undefined); setActiveCategory(undefined); }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Modal */}
        <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)} statusBarTranslucent>
          <View style={styles.filterModalOverlay}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setFilterVisible(false)} />
            <View style={styles.filterModalSheet}>
              <View style={styles.filterModalHandle} />
              <Text style={styles.filterModalTitle}>Filter Reels</Text>
              <Text style={styles.filterSectionLabel}>Sort By</Text>
              <View style={styles.filterOptionsRow}>
                {[
                  { label: 'Latest', value: undefined },
                  { label: 'Lowest Price', value: 'price_asc' },
                  { label: 'Highest Price', value: 'price_desc' },
                  { label: 'Most Viewed', value: 'views' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[styles.filterChipOption, pendingSort === opt.value && styles.filterChipOptionActive]}
                    onPress={() => setPendingSort(opt.value)}
                  >
                    <Text style={[styles.filterChipOptionText, pendingSort === opt.value && styles.filterChipOptionTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {categoryList.length > 0 && (
                <>
                  <Text style={styles.filterSectionLabel}>Category</Text>
                  <View style={styles.filterOptionsRow}>
                    <TouchableOpacity style={[styles.filterChipOption, !pendingCategory && styles.filterChipOptionActive]} onPress={() => setPendingCategory(undefined)}>
                      <Text style={[styles.filterChipOptionText, !pendingCategory && styles.filterChipOptionTextActive]}>All</Text>
                    </TouchableOpacity>
                    {categoryList.map(cat => (
                      <TouchableOpacity key={cat} style={[styles.filterChipOption, pendingCategory === cat && styles.filterChipOptionActive]} onPress={() => setPendingCategory(cat)}>
                        <Text style={[styles.filterChipOptionText, pendingCategory === cat && styles.filterChipOptionTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              <View style={styles.filterModalActions}>
                <TouchableOpacity style={styles.filterClearBtn} onPress={clearFilter}>
                  <Text style={styles.filterClearText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterApplyBtn, !pendingChanged && styles.filterApplyBtnDisabled]} onPress={applyFilter} disabled={!pendingChanged}>
                  <Text style={styles.filterApplyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent />

        {/* Fixed Top Header */}
        <View style={[styles.topGradient, { paddingTop: insets.top + 10, zIndex: 100 }]}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.activeTabWrap}>
            <Text style={styles.activeTabText}>
              {activeCategory
                ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)
                : activeSort === 'price_asc' ? 'Saver Deals'
                : activeSort === 'views' ? 'Top Products'
                : 'For You'}
            </Text>
            <View style={styles.tabIndicator} />
          </View>
          {/* Filter Button */}
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7} onPress={openFilter}>
            <Ionicons name="options-outline" size={22} color="#fff" />
            {(activeSort || activeCategory) && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>

        {/* Active filter chip */}
        {(activeSort || activeCategory) && (
          <View style={[styles.filterChipWrap, { top: insets.top + 60, zIndex: 99 }]}>
            <View style={styles.filterChip}>
              <Ionicons name="funnel" size={11} color="#fff" />
              <Text style={styles.filterChipText}>
                {activeCategory
                  ? activeCategory
                  : activeSort === 'price_asc' ? 'Lowest Price'
                  : activeSort === 'price_desc' ? 'Highest Price'
                  : activeSort === 'views' ? 'Most Viewed'
                  : ''}
              </Text>
              <TouchableOpacity onPress={() => { setActiveSort(undefined); setActiveCategory(undefined); }}>
                <Ionicons name="close-circle" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Filter Modal */}
        <Modal
          visible={filterVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setFilterVisible(false)}
          statusBarTranslucent
        >
          <View style={styles.filterModalOverlay}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setFilterVisible(false)} />
            <View style={styles.filterModalSheet}>
              <View style={styles.filterModalHandle} />
              <Text style={styles.filterModalTitle}>Filter Reels</Text>

              {/* Sort Options */}
              <Text style={styles.filterSectionLabel}>Sort By</Text>
              <View style={styles.filterOptionsRow}>
                {[
                  { label: 'Latest', value: undefined },
                  { label: 'Lowest Price', value: 'price_asc' },
                  { label: 'Highest Price', value: 'price_desc' },
                  { label: 'Most Viewed', value: 'views' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[styles.filterChipOption, pendingSort === opt.value && styles.filterChipOptionActive]}
                    onPress={() => setPendingSort(opt.value)}
                  >
                    <Text style={[styles.filterChipOptionText, pendingSort === opt.value && styles.filterChipOptionTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Category Options */}
              {categoryList.length > 0 && (
                <>
                  <Text style={styles.filterSectionLabel}>Category</Text>
                  <View style={styles.filterOptionsRow}>
                    <TouchableOpacity
                      style={[styles.filterChipOption, !pendingCategory && styles.filterChipOptionActive]}
                      onPress={() => setPendingCategory(undefined)}
                    >
                      <Text style={[styles.filterChipOptionText, !pendingCategory && styles.filterChipOptionTextActive]}>All</Text>
                    </TouchableOpacity>
                    {categoryList.map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.filterChipOption, pendingCategory === cat && styles.filterChipOptionActive]}
                        onPress={() => setPendingCategory(cat)}
                      >
                        <Text style={[styles.filterChipOptionText, pendingCategory === cat && styles.filterChipOptionTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Apply / Clear */}
              <View style={styles.filterModalActions}>
                <TouchableOpacity style={styles.filterClearBtn} onPress={clearFilter}>
                  <Text style={styles.filterClearText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterApplyBtn, !pendingChanged && styles.filterApplyBtnDisabled]}
                  onPress={applyFilter}
                  disabled={!pendingChanged}
                >
                  <Text style={styles.filterApplyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <FlatList
          ref={flatListRef}
          data={reels}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index, animated: false });
            }, 300);
          }}
          renderItem={({ item }) => (
            <View style={{ height: WINDOW_HEIGHT }}>
              <ReelItem item={item} isVisible={item.id === activeId} />
            </View>
          )}
          onEndReached={() => {
            if (hasNextPageRef.current && !isFetchingNextPageRef.current) {
              fetchNextPageRef.current();
            }
          }}
          onEndReachedThreshold={0.5}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#4F46E5" />
              </View>
            ) : null
          }
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  reelItem: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  noMediaContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f2937',
  },
  noMediaText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    pointerEvents: 'none',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    pointerEvents: 'none',
  },
  carouselLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  doubleTapOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  activeTabWrap: {
    alignItems: 'center',
  },
  activeTabText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  tabIndicator: {
    width: 20,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 4,
  },
  sideActions: {
    position: 'absolute',
    right: 15,
    bottom: 120,
    alignItems: 'center',
    gap: 18,
    zIndex: 20,
  },
  profileBox: {
    marginBottom: 10,
    position: 'relative',
  },
  profileImg: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  plusBtn: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    backgroundColor: '#4F46E5', // Using direct value as theme might be tricky here or I can keep using theme.colors.primary if exported
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  actBtn: {
    alignItems: 'center',
  },
  actText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 90,
    left: 15,
    right: 80,
    zIndex: 20,
  },
  infoGlassCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cardHeader: {
    marginBottom: 8,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  itemPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.9,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 15,
  },
  locationText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  mainCta: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  ctaLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  commentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  commentContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '80%',
    padding: 20,
    paddingBottom: 30,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
  },
  commentItem: {
    marginBottom: 20,
  },
  commentUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  commentUser: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  commentTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  commentText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    paddingLeft: 46,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 15,
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.6,
  },
  // ── Filter ──────────────────────────────────────────────────────────────
  filterBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F43F5E',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  filterChipWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(79,70,229,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  filterChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  filterModalSheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  filterModalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  filterModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
  },
  filterSectionLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterChipOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filterChipOptionActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterChipOptionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipOptionTextActive: {
    color: '#fff',
  },
  filterModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  filterClearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  filterClearText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '700',
  },
  filterApplyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  filterApplyBtnDisabled: {
    backgroundColor: 'rgba(79,70,229,0.35)',
  },
  filterApplyText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});


