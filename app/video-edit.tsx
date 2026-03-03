import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRIMMER_SIDE_PADDING = 20;
const TRIMMER_WIDTH = SCREEN_WIDTH - (TRIMMER_SIDE_PADDING * 2);
const HANDLE_WIDTH = 18; // Slightly wider for better touch

export default function VideoEditorScreen() {
    const insets = useSafeAreaInsets();
    const { uri } = useLocalSearchParams();
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [videoDuration, setVideoDuration] = useState(0);

    const player = useVideoPlayer(uri as string || '', (p) => {
        p.loop = true;
        p.muted = isMuted;
        p.play();
    });

    // Positions from 0 to TRACK_WIDTH
    const TRACK_WIDTH = TRIMMER_WIDTH - (HANDLE_WIDTH * 2);
    const leftPos = useSharedValue(0);
    const rightPos = useSharedValue(TRACK_WIDTH);

    // Temp values for offset calculation in gestures
    const startLeft = useSharedValue(0);
    const startRight = useSharedValue(0);

    useEffect(() => {
        const durationSub = player.addListener('durationChange', (event) => {
            setVideoDuration(event.duration);
        });

        const timeSub = player.addListener('timeUpdate', (event) => {
            if (player.duration <= 0) return;

            const start = (leftPos.value / TRACK_WIDTH) * player.duration;
            const end = (rightPos.value / TRACK_WIDTH) * player.duration;

            if (event.currentTime >= end || event.currentTime < start) {
                player.seekTo(start);
            }
        });

        return () => {
            durationSub.remove();
            timeSub.remove();
        };
    }, [player, TRACK_WIDTH]);

    const handleTogglePlay = () => {
        if (isPlaying) player.pause();
        else player.play();
        setIsPlaying(!isPlaying);
    };

    const leftGesture = Gesture.Pan()
        .onStart(() => {
            startLeft.value = leftPos.value;
        })
        .onUpdate((event) => {
            const newX = startLeft.value + event.translationX;
            const maxPos = rightPos.value - 40; // Minimum clip length
            leftPos.value = Math.max(0, Math.min(newX, maxPos));

            if (player.duration > 0) {
                const seekTime = (leftPos.value / TRACK_WIDTH) * player.duration;
                runOnJS(player.seekTo)(seekTime);
            }
        });

    const rightGesture = Gesture.Pan()
        .onStart(() => {
            startRight.value = rightPos.value;
        })
        .onUpdate((event) => {
            const newX = startRight.value + event.translationX;
            const minPos = leftPos.value + 40;
            rightPos.value = Math.max(minPos, Math.min(newX, TRACK_WIDTH));

            if (player.duration > 0) {
                const seekTime = (rightPos.value / TRACK_WIDTH) * player.duration;
                runOnJS(player.seekTo)(seekTime);
            }
        });

    const leftHandleStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: leftPos.value }],
    }));

    const rightHandleStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: rightPos.value + HANDLE_WIDTH }],
    }));

    const highlightStyle = useAnimatedStyle(() => {
        return {
            left: leftPos.value + HANDLE_WIDTH,
            width: Math.max(0, rightPos.value - leftPos.value + HANDLE_WIDTH),
        };
    });

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />

                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    nativeControls={false}
                />

                <View style={[styles.topOverlay, { paddingTop: insets.top + 20 }]}>
                    <View style={styles.trimmerWrapper}>
                        <View style={styles.thumbnailStrip}>
                            {[...Array(10)].map((_, i) => (
                                <Image
                                    key={i}
                                    source={{ uri: uri as string }}
                                    style={styles.thumbnailImg}
                                    blurRadius={1}
                                />
                            ))}
                        </View>

                        <View style={styles.trimmerOverlay}>
                            <Animated.View style={[styles.trimHighlight, highlightStyle]} />

                            <GestureDetector gesture={leftGesture}>
                                <Animated.View style={[styles.trimHandleWrapper, leftHandleStyle]}>
                                    <View style={[styles.trimHandle, { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }]}>
                                        <View style={styles.handleDot} />
                                    </View>
                                </Animated.View>
                            </GestureDetector>

                            <GestureDetector gesture={rightGesture}>
                                <Animated.View style={[styles.trimHandleWrapper, rightHandleStyle]}>
                                    <View style={[styles.trimHandle, { borderTopRightRadius: 10, borderBottomRightRadius: 10 }]}>
                                        <View style={styles.handleDot} />
                                    </View>
                                </Animated.View>
                            </GestureDetector>
                        </View>
                    </View>

                    <View style={styles.badgesRow}>
                        <TouchableOpacity
                            style={styles.iconBadge}
                            onPress={() => {
                                setIsMuted(!isMuted);
                                player.muted = !isMuted;
                            }}
                        >
                            <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={18} color="#fff" />
                        </TouchableOpacity>

                        <View style={styles.infoBadge}>
                            <Text style={styles.infoText}>
                                {formatTime((rightPos.value - leftPos.value) / TRACK_WIDTH * videoDuration)}  •  {(((rightPos.value - leftPos.value) / TRACK_WIDTH * videoDuration) * 0.15).toFixed(1)} MB
                            </Text>
                        </View>
                    </View>
                </View>

                {!isPlaying && (
                    <TouchableOpacity style={styles.playOverlay} onPress={handleTogglePlay} activeOpacity={1}>
                        <View style={styles.playCircle}>
                            <Ionicons name="play" size={40} color="#fff" style={{ marginLeft: 5 }} />
                        </View>
                    </TouchableOpacity>
                )}

                <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 20 }]}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
                        <Text style={styles.doneText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: TRIMMER_SIDE_PADDING,
        zIndex: 10,
    },
    trimmerWrapper: {
        height: 60,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
        position: 'relative',
    },
    thumbnailStrip: {
        flex: 1,
        flexDirection: 'row',
    },
    thumbnailImg: {
        flex: 1,
        height: '100%',
        opacity: 0.5,
    },
    trimmerOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    trimHandleWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: HANDLE_WIDTH,
        height: '100%',
        zIndex: 100,
    },
    trimHandle: {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    handleDot: {
        width: 4,
        height: 14,
        borderRadius: 2,
        backgroundColor: '#000',
        opacity: 0.7,
    },
    trimHighlight: {
        position: 'absolute',
        height: '100%',
        borderTopWidth: 4,
        borderBottomWidth: 4,
        borderColor: '#fff',
        backgroundColor: 'transparent',
    },
    badgesRow: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 12,
    },
    iconBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    infoBadge: {
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    infoText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    cancelBtn: {
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    cancelText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    doneBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 35,
        paddingVertical: 14,
        borderRadius: 35,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    doneText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '800',
    }
});
