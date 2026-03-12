import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { useLogout, useMe, usePreferences, useUpdatePreferences } from '@/src/hooks';
import { useAuth } from '@/src/providers/AuthProvider';

type SettingItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    color?: string;
};

const SettingItem = ({
    icon,
    label,
    value,
    onPress,
    showSwitch,
    switchValue,
    onSwitchChange,
    color = theme.colors.textPrimary
}: SettingItemProps) => (
    <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={showSwitch}
        activeOpacity={0.7}
    >
        <View style={styles.settingItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}10` }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={[styles.settingLabel, { color: color === theme.colors.textPrimary ? theme.colors.textPrimary : color }]}>
                {label}
            </Text>
        </View>
        <View style={styles.settingItemRight}>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            {showSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitchChange}
                    trackColor={{ false: '#CBD5E1', true: theme.colors.primary }}
                    thumbColor="#FFFFFF"
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={theme.colors.iconDefault} />
            )}
        </View>
    </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

export default function SettingsScreen() {
    // Fetch user data and preferences
    const { data: user, isLoading: isLoadingUser } = useMe();
    const { data: preferences, isLoading: isLoadingPreferences } = usePreferences();
    const updatePreferences = useUpdatePreferences();
    const { signOut } = useAuth();
    const { mutate: logout, isPending: isLoggingOut } = useLogout(() => signOut());

    // Notification preferences state
    const [notifChat, setNotifChat] = useState(true);
    const [notifLikes, setNotifLikes] = useState(true);
    const [notifComments, setNotifComments] = useState(true);
    const [notifFollows, setNotifFollows] = useState(true);
    const [notifSystem, setNotifSystem] = useState(true);
    
    // App preferences state
    const [appTheme, setAppTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [language, setLanguage] = useState('en');

    // Load preferences when available
    useEffect(() => {
        if (preferences) {
            setNotifChat(preferences.notifications.chat);
            setNotifLikes(preferences.notifications.likes);
            setNotifComments(preferences.notifications.comments);
            setNotifFollows(preferences.notifications.follows);
            setNotifSystem(preferences.notifications.system);
            setAppTheme(preferences.theme);
            setLanguage(preferences.language);
        }
    }, [preferences]);

    // Update notification preference
    const handleNotificationToggle = async (type: string, value: boolean) => {
        try {
            await updatePreferences.mutateAsync({
                notifications: {
                    [type]: value,
                },
            });
        } catch (error) {
            console.error('Failed to update notification preference:', error);
        }
    };

    // Update theme preference
    const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
        setAppTheme(newTheme);
        try {
            await updatePreferences.mutateAsync({
                theme: newTheme,
            });
        } catch (error) {
            console.error('Failed to update theme:', error);
        }
    };

    const isLoading = isLoadingUser || isLoadingPreferences;

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
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                    <>
                        <SectionHeader title="Account" />
                        <View style={styles.section}>
                            <SettingItem
                                icon="person-outline"
                                label="Edit Profile"
                                onPress={() => router.push('/edit-profile')}
                            />
                            <SettingItem
                                icon="mail-outline"
                                label="Email"
                                value={user?.email || 'Not set'}
                            />
                            <SettingItem
                                icon="call-outline"
                                label="Phone Number"
                                value={user?.phone || 'Not set'}
                            />
                            <SettingItem
                                icon="lock-closed-outline"
                                label="Change Password"
                                onPress={() => router.push('/change-password')}
                            />
                        </View>

                        <SectionHeader title="Notification Preferences" />
                        <View style={styles.section}>
                            <SettingItem
                                icon="chatbubble-outline"
                                label="Chat Messages"
                                showSwitch
                                switchValue={notifChat}
                                onSwitchChange={(value) => {
                                    setNotifChat(value);
                                    handleNotificationToggle('chat', value);
                                }}
                            />
                            <SettingItem
                                icon="heart-outline"
                                label="Likes"
                                showSwitch
                                switchValue={notifLikes}
                                onSwitchChange={(value) => {
                                    setNotifLikes(value);
                                    handleNotificationToggle('likes', value);
                                }}
                            />
                            <SettingItem
                                icon="chatbox-outline"
                                label="Comments"
                                showSwitch
                                switchValue={notifComments}
                                onSwitchChange={(value) => {
                                    setNotifComments(value);
                                    handleNotificationToggle('comments', value);
                                }}
                            />
                            <SettingItem
                                icon="people-outline"
                                label="Follows"
                                showSwitch
                                switchValue={notifFollows}
                                onSwitchChange={(value) => {
                                    setNotifFollows(value);
                                    handleNotificationToggle('follows', value);
                                }}
                            />
                            <SettingItem
                                icon="notifications-outline"
                                label="System Notifications"
                                showSwitch
                                switchValue={notifSystem}
                                onSwitchChange={(value) => {
                                    setNotifSystem(value);
                                    handleNotificationToggle('system', value);
                                }}
                            />
                        </View>

                        <SectionHeader title="App Preferences" />
                        <View style={styles.section}>
                            <SettingItem
                                icon="moon-outline"
                                label="Theme"
                                value={appTheme === 'system' ? 'System' : appTheme === 'dark' ? 'Dark' : 'Light'}
                                onPress={() => {
                                    Alert.alert(
                                        'Choose Theme',
                                        'Select your preferred theme',
                                        [
                                            {
                                                text: 'Light',
                                                onPress: () => handleThemeChange('light'),
                                            },
                                            {
                                                text: 'Dark',
                                                onPress: () => handleThemeChange('dark'),
                                            },
                                            {
                                                text: 'System',
                                                onPress: () => handleThemeChange('system'),
                                            },
                                            {
                                                text: 'Cancel',
                                                style: 'cancel',
                                            },
                                        ]
                                    );
                                }}
                            />
                            <SettingItem
                                icon="globe-outline"
                                label="Language"
                                value={language === 'en' ? 'English' : language}
                            />
                        </View>

                        <SectionHeader title="More" />
                        <View style={styles.section}>
                            <SettingItem
                                icon="shield-checkmark-outline"
                                label="Privacy Policy"
                            />
                            <SettingItem
                                icon="document-text-outline"
                                label="Terms of Service"
                            />
                            <SettingItem
                                icon="help-circle-outline"
                                label="Help & Support"
                                onPress={() => router.push('/help')}
                            />
                            <SettingItem
                                icon="information-circle-outline"
                                label="About SabBechdo"
                                value="v1.0.2"
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.logoutButton} 
                            activeOpacity={0.8}
                            onPress={handleLogout}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <>
                                    <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                                    <Text style={styles.logoutText}>Log Out</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.footerText}>
                            Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                        </Text>
                    </>
                )}
            </ScrollView>
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
    scrollContent: {
        paddingBottom: 40,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 24,
        marginBottom: 8,
        marginHorizontal: 20,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginHorizontal: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    settingItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginRight: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 32,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
        marginLeft: 8,
    },
    footerText: {
        textAlign: 'center',
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 20,
        marginBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
});
