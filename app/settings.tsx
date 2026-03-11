import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { useLogout } from '@/src/hooks';

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
    const [notifications, setNotifications] = React.useState(true);
    const [darkMode, setDarkMode] = React.useState(false);
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

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
                        logout(undefined, {
                            onSuccess: () => {
                                router.replace('/login');
                            },
                            onError: (error: any) => {
                                Alert.alert('Error', error.message || 'Failed to logout');
                            },
                        });
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
                        value="user@example.com"
                    />
                    <SettingItem
                        icon="call-outline"
                        label="Phone Number"
                        value="+91 9876543210"
                    />
                    <SettingItem
                        icon="lock-closed-outline"
                        label="Change Password"
                        onPress={() => router.push('/change-password')}
                    />
                </View>

                <SectionHeader title="Preferences" />
                <View style={styles.section}>
                    <SettingItem
                        icon="notifications-outline"
                        label="Notifications"
                        showSwitch
                        switchValue={notifications}
                        onSwitchChange={setNotifications}
                    />
                    <SettingItem
                        icon="moon-outline"
                        label="Dark Mode"
                        showSwitch
                        switchValue={darkMode}
                        onSwitchChange={setDarkMode}
                    />
                    <SettingItem
                        icon="globe-outline"
                        label="Language"
                        value="English"
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
                    <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                    <Text style={styles.logoutText}>
                        {isLoggingOut ? 'Logging out...' : 'Log Out'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>Joined since October 2023</Text>
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
});
