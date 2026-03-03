import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
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
  ViewToken
} from 'react-native';
import { GestureHandlerRootView, HandlerStateChangeEvent, State, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');
const { height: WINDOW_HEIGHT_RAW, width: WINDOW_WIDTH_RAW } = Dimensions.get('window');

// Use screen height on Android to account for translucent status bar and navigations
const WINDOW_HEIGHT = Platform.OS === 'android' ? SCREEN_HEIGHT : WINDOW_HEIGHT_RAW;
const WINDOW_WIDTH = WINDOW_WIDTH_RAW;

type ReelData = {
  id: string;
  video: string;
  title: string;
  price: string;
  location: string;
  likes: number;
  comments: number;
  author: string;
};

const INITIAL_REELS_DATA: ReelData[] = [
  {
    id: '1',
    video: 'https://cdn.pixabay.com/vimeo/310373756/winter-19942.mp4?width=1280&hash=85e8d5f3d79e4d5d9c7e0c8b0e8b0e8b0e8b0e8b',
    title: 'Honda Civic 2018 - Mint Condition',
    price: '₨ 5,20,000',
    location: 'Lahore, PK',
    likes: 2310,
    comments: 120,
    author: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '2',
    video: 'https://cdn.pixabay.com/vimeo/725732159/couple-121650.mp4?width=1280&hash=85e8d5f3d79e4d5d9c7e0c8b0e8b0e8b0e8b0e8b',
    title: 'Modern Luxury Studio Apartment',
    price: '₨ 25,00,000',
    location: 'Islamabad, PK',
    likes: 1540,
    comments: 85,
    author: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '3',
    video: 'https://cdn.pixabay.com/vimeo/848523315/beach-173673.mp4?width=1280&hash=85e8d5f3d79e4d5d9c7e0c8b0e8b0e8b0e8b0e8b',
    title: 'iPhone 15 Pro Max - Unopened',
    price: '₨ 4,45,000',
    location: 'Karachi, PK',
    likes: 5400,
    comments: 320,
    author: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
  },
];

// Note: Using slightly more stable CDN links from Pixabay or Commondata
// If these fail, check the URLs.

const ReelItem = ({ item, isVisible }: { item: ReelData; isVisible: boolean }) => {
  const [liked, setLiked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [isCommentVisible, setIsCommentVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const player = useVideoPlayer(item.video);
  const router = useRouter();

  useEffect(() => {
    player.loop = true;
    if (isVisible && isFocused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible, isFocused, player]);

  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  useEffect(() => {
    // No longer using videoRef, player is initialized with useVideoPlayer
  }, []);

  const handleDoubleTap = (event: HandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      if (!liked) setLiked(true);
      heartScale.value = withSequence(withSpring(1), withDelay(400, withSpring(0)));
      heartOpacity.value = withSequence(withTiming(1), withDelay(400, withTiming(0)));
    }
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  // Track progress via useEffect since expo-video player has an 'onTimeUpdate' or similar in newer versions
  // but for simplicity we can use a listener.
  useEffect(() => {
    const subscription = player.addListener('timeUpdate', (event) => {
      if (player.duration > 0) {
        setProgress(event.currentTime / player.duration);
      }
    });
    return () => {
      subscription.remove();
    };
  }, [player]);

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this ${item.title} on Sab Bechdo for ${item.price}!\n\n${item.video}`,
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
    <View style={styles.reelItem}>
      <TapGestureHandler onHandlerStateChange={handleDoubleTap} numberOfTaps={2}>
        <View style={StyleSheet.absoluteFill}>
          <VideoView
            player={player}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
          />
          <View style={styles.heartOverlay}>
            <Animated.View style={heartStyle}>
              <Ionicons name="heart" size={100} color="#fff" />
            </Animated.View>
          </View>
        </View>
      </TapGestureHandler>

      {/* Side Action Menu */}
      <View style={styles.sideActions}>
        <View style={styles.profileBox}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push({
              pathname: '/seller/[id]',
              params: {
                id: `seller-${item.id}`,
                name: 'Seller Name',
                avatar: item.author,
                isFollowed: followed ? 'true' : 'false'
              }
            })}
          >
            <Image source={{ uri: item.author }} style={styles.profileImg} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.plusBtn, followed && { backgroundColor: '#10B981', borderColor: '#10B981' }]}
            onPress={() => setFollowed(!followed)}
          >
            <Ionicons name={followed ? "checkmark" : "add"} size={12} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actBtn} onPress={() => setLiked(!liked)}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={32} color={liked ? "#F43F5E" : "#fff"} />
          <Text style={styles.actText}>{liked ? (item.likes + 1).toLocaleString() : item.likes.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actBtn} onPress={() => setIsCommentVisible(true)}>
          <Ionicons name="chatbubble-ellipses-outline" size={30} color="#fff" />
          <Text style={styles.actText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actBtn} onPress={onShare}>
          <Ionicons name="paper-plane-outline" size={30} color="#fff" />
          <Text style={styles.actText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actBtn}>
          <Ionicons name="bookmark-outline" size={28} color="#fff" />
          <Text style={styles.actText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info Section */}
      <View style={styles.bottomSection}>
        <View style={styles.infoGlassCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>
          <View style={styles.locationTag}>
            <Ionicons name="location-sharp" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          <TouchableOpacity
            style={styles.mainCta}
            onPress={() => router.push({
              pathname: "/product/[id]",
              params: {
                id: item.id,
                title: item.title,
                price: item.price,
                location: item.location,
              }
            })}
          >
            <Text style={styles.ctaLabel}>View Product Details</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      {/* Comment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCommentVisible}
        onRequestClose={() => setIsCommentVisible(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.commentModalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -insets.bottom}
        >
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setIsCommentVisible(false)}
          />
          <View style={[styles.commentContent, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentTitle}>Product Feedback ({item.comments})</Text>
              <TouchableOpacity onPress={() => setIsCommentVisible(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[
                { id: '1', user: 'Ali Ahmed', comment: 'Amazing quality! Highly recommended.', time: '2h ago', rating: 5 },
                { id: '2', user: 'Sara Khan', comment: 'Is the price negotiable?', time: '5h ago', rating: 4 },
                { id: '3', user: 'Usman Raj', comment: 'Used it for a week, works perfectly.', time: '1d ago', rating: 5 },
              ]}
              keyExtractor={(c) => c.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: comment }) => (
                <View style={styles.commentItem}>
                  <View style={styles.commentUserRow}>
                    <View style={styles.commentAvatarPlaceholder}>
                      <Text style={styles.avatarInitial}>{comment.user[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.commentUser}>{comment.user}</Text>
                      <View style={styles.ratingRow}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons key={i} name="star" size={12} color={i < comment.rating ? "#f59e0b" : "#e5e7eb"} />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.commentTime}>{comment.time}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.comment}</Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyComments}>
                  <Ionicons name="chatbubbles-outline" size={50} color="#cbd5e1" />
                  <Text style={styles.emptyText}>No feedback yet</Text>
                </View>
              }
            />

            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write your feedback..."
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity style={styles.sendBtn}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default function ReelScreen() {
  const insets = useSafeAreaInsets();
  const [reels, setReels] = useState<ReelData[]>(INITIAL_REELS_DATA);
  const [activeId, setActiveId] = useState(INITIAL_REELS_DATA[0].id);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveId(viewableItems[0].item.id);
    }
  }).current;

  const loadMoreReels = () => {
    const moreReels = INITIAL_REELS_DATA.map((reel, index) => ({
      ...reel,
      id: `${reels.length + index + 1}`, // Generate unique ID
    }));
    setReels([...reels, ...moreReels]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent />

        {/* Fixed Top Tabs */}
        <View style={[styles.topGradient, { paddingTop: insets.top + 10, zIndex: 100 }]}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.activeTabWrap}>
            <Text style={styles.activeTabText}>For You</Text>
            <View style={styles.tabIndicator} />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          data={reels}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          renderItem={({ item }) => (
            <View style={{ height: WINDOW_HEIGHT }}>
              <ReelItem item={item} isVisible={item.id === activeId} />
            </View>
          )}
          onEndReached={loadMoreReels}
          onEndReachedThreshold={0.5}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
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
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
    height: '70%',
    padding: 20,
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
});


