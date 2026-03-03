import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IndividualChatScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { id, name, avatar, online } = useLocalSearchParams();
    const [message, setMessage] = useState('');

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            router.push('/chat');
        }
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Sticky Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity style={styles.iconBtn} onPress={handleBack} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={26} color="#1E293B" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.headerProfile}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/seller/${id}`)}
                >
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: (avatar as string) || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop' }}
                            style={styles.avatarImg}
                        />
                        {online === 'true' && <View style={styles.onlineStatus} />}
                    </View>
                    <View style={styles.nameSection}>
                        <Text style={styles.profileName}>{name || 'Sarah Mitchell'}</Text>
                        <Text style={styles.onlineText}>{online === 'true' ? 'Active now' : 'Offline'}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerRightActions}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="call-outline" size={22} color="#475569" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="ellipsis-vertical" size={22} color="#475569" />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Chat Content */}
                <ScrollView
                    style={styles.chatScroll}
                    contentContainerStyle={[styles.scrollInner, { paddingBottom: 120 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>Today</Text>
                    </View>

                    {/* Left Message */}
                    <View style={styles.msgRowLeft}>
                        <View style={styles.bubbleLeft}>
                            <Text style={styles.txtLeft}>Hey! Is the iPhone still available? I'm really interested! 😊</Text>
                            <Text style={styles.timeLeft}>2:14 PM</Text>
                        </View>
                    </View>

                    {/* Right Message */}
                    <View style={styles.msgRowRight}>
                        <View style={styles.bubbleRight}>
                            <Text style={styles.txtRight}>Yes, it is! I just posted it an hour ago. It's in great condition. 🔥</Text>
                            <View style={styles.rightMeta}>
                                <Text style={styles.timeRight}>2:15 PM</Text>
                                <Ionicons name="checkmark-done" size={14} color="#fff" style={{ marginLeft: 4 }} />
                            </View>
                        </View>
                    </View>

                    {/* Product Context Card */}
                    <View style={styles.contextContainer}>
                        <View style={styles.productGlassCard}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=400&auto=format&fit=crop' }}
                                style={styles.productThumb}
                            />
                            <View style={styles.productInfo}>
                                <Text style={styles.prodName}>iPhone 12 - 64GB</Text>
                                <Text style={styles.prodPrice}>₨ 18,500</Text>
                            </View>
                            <TouchableOpacity style={styles.viewBtn}>
                                <Text style={styles.viewText}>View</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Left Message */}
                    <View style={styles.msgRowLeft}>
                        <View style={styles.bubbleLeft}>
                            <Text style={styles.txtLeft}>Great! Could you share some real photos from different angles?</Text>
                            <Text style={styles.timeLeft}>2:16 PM</Text>
                        </View>
                    </View>

                    {/* Right Message */}
                    <View style={styles.msgRowRight}>
                        <View style={styles.bubbleRight}>
                            <Text style={styles.txtRight}>Sure, sending them right away... 📸</Text>
                            <View style={styles.rightMeta}>
                                <Text style={styles.timeRight}>2:18 PM</Text>
                                <Ionicons name="checkmark-done" size={14} color="#fff" style={{ marginLeft: 4 }} />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Premium Input Bar */}
                <View style={[styles.inputBarContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                    <View style={styles.inputShadowWrapper}>
                        <View style={styles.mainInputRow}>
                            <TouchableOpacity style={styles.actionIcon}>
                                <Ionicons name="add-circle" size={26} color={theme.colors.primary} />
                            </TouchableOpacity>

                            <TextInput
                                style={styles.chatInput}
                                placeholder="Type a message..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                value={message}
                                onChangeText={setMessage}
                            />

                            <TouchableOpacity style={styles.actionIcon}>
                                <Ionicons name="happy-outline" size={24} color="#94A3B8" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sendBtn, !message && styles.sendBtnDisabled]}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerProfile: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarImg: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#E2E8F0',
    },
    onlineStatus: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#fff',
    },
    nameSection: {
        marginLeft: 12,
    },
    profileName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    onlineText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
    headerRightActions: {
        flexDirection: 'row',
        gap: 4,
    },
    chatScroll: {
        flex: 1,
    },
    scrollInner: {
        padding: 20,
    },
    dateBadge: {
        alignSelf: 'center',
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 24,
    },
    dateText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '700',
    },
    msgRowLeft: {
        flexDirection: 'row',
        marginBottom: 20,
        maxWidth: '85%',
    },
    msgRowRight: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end',
        marginBottom: 20,
        maxWidth: '85%',
    },
    bubbleLeft: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 20,
        borderTopLeftRadius: 4,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    bubbleRight: {
        backgroundColor: theme.colors.primary,
        padding: 14,
        borderRadius: 20,
        borderTopRightRadius: 4,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 4,
    },
    txtLeft: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 22,
    },
    txtRight: {
        fontSize: 15,
        color: '#fff',
        lineHeight: 22,
    },
    timeLeft: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 6,
        fontWeight: '500',
    },
    rightMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 6,
    },
    timeRight: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    contextContainer: {
        marginBottom: 24,
    },
    productGlassCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    productThumb: {
        width: 50,
        height: 50,
        borderRadius: 12,
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
    },
    prodName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    prodPrice: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '700',
        marginTop: 2,
    },
    viewBtn: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    viewText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '700',
    },
    inputBarContainer: {
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    inputShadowWrapper: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: -5 },
    },
    mainInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    chatInput: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
        paddingHorizontal: 10,
        maxHeight: 100,
        fontWeight: '500',
    },
    actionIcon: {
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
    sendBtnDisabled: {
        backgroundColor: '#CBD5E1',
    },
});
