import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useMe, useUpdateProfile, useAvatarUpload } from '@/src/hooks';
import { getAvatarUrl } from '@/src/utils/avatar';

const { width } = Dimensions.get('window');

type InputProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    showChevron?: boolean;
};

const CustomInput = ({ label, value, onChangeText, showChevron = false }: InputProps) => (
    <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputWrapper}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor="#9ca3af"
            />
            {showChevron && (
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" style={styles.inputIcon} />
            )}
        </View>
    </View>
);

export default function EditProfileScreen() {
    const insets = useSafeAreaInsets();
    
    // Fetch current user data
    const { data: user, isLoading } = useMe();
    const updateProfile = useUpdateProfile();
    const { uploadAvatar, isUploading: isUploadingAvatar } = useAvatarUpload();

    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

    // Load user data when available
    useEffect(() => {
        if (user) {
            setFullName(user.name || '');
            setUsername(user.username || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setAvatarUrl(user.avatarUrl);
            // Location from user.location object
            const locationStr = user.location?.city 
                ? `${user.location.city}${user.location.region ? ', ' + user.location.region : ''}${user.location.country ? ', ' + user.location.country : ''}`
                : '';
            setLocation(locationStr);
        }
    }, [user]);

    const handleAvatarUpload = async () => {
        const newAvatarUrl = await uploadAvatar();
        if (newAvatarUrl) {
            setAvatarUrl(newAvatarUrl);
            Alert.alert('Success', 'Profile picture updated successfully!');
        }
    };

    const handleSave = async () => {
        try {
            // Parse location string into object (simple approach)
            // Format expected: "City, Region, Country" or "City, Country" or "City"
            const locationParts = location.split(',').map(part => part.trim());
            const locationObj = locationParts.length > 0 && location ? {
                city: locationParts[0] || undefined,
                region: locationParts[1] || undefined,
                country: locationParts[2] || locationParts[1] || undefined,
            } : undefined;

            await updateProfile.mutateAsync({
                name: fullName,
                username: username.replace('@', ''), // Remove @ if user added it
                phone: phone || undefined,
                location: locationObj,
            });
            
            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        }
    };

    const renderHeaderBackground = () => (
        <View style={[styles.headerBgContainer, { height: 180 + insets.top }]}>
            <Svg width={width} height={180 + insets.top} viewBox={`0 0 ${width} ${180 + insets.top}`}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor="#4A54DF" stopOpacity="1" />
                        <Stop offset="1" stopColor="#9D8CFA" stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <Path
                    d={`M0 0 L${width} 0 L${width} ${75 + insets.top} Q${width / 2} ${130 + insets.top} 0 ${75 + insets.top} Z`}
                    fill="url(#grad)"
                />
            </Svg>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {renderHeaderBackground()}

            <TouchableOpacity
                style={[styles.backButton, { top: insets.top + 16 }]}
                onPress={() => router.back()}
                activeOpacity={0.7}
            >
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 30 }]}
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4A54DF" />
                    </View>
                ) : (
                    <>
                        <View style={styles.profileSection}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ 
                                        uri: avatarUrl || getAvatarUrl(user?.name || 'User', 200)
                                    }}
                                    style={styles.avatar}
                                />
                                <TouchableOpacity 
                                    style={styles.cameraIconContainer} 
                                    activeOpacity={0.8}
                                    onPress={handleAvatarUpload}
                                    disabled={isUploadingAvatar}
                                >
                                    {isUploadingAvatar ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Ionicons name="camera" size={16} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.pageTitle}>Edit Profile</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <CustomInput
                                label="Full Name"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                            <CustomInput
                                label="Username"
                                value={username}
                                onChangeText={setUsername}
                            />
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <View style={[styles.inputWrapper, styles.disabledInput]}>
                                    <TextInput
                                        style={[styles.input, styles.disabledText]}
                                        value={email}
                                        editable={false}
                                        placeholderTextColor="#9ca3af"
                                    />
                                    <Ionicons name="lock-closed" size={16} color="#9ca3af" />
                                </View>
                            </View>
                            <CustomInput
                                label="Phone Number"
                                value={phone}
                                onChangeText={setPhone}
                            />
                            <CustomInput
                                label="Location"
                                value={location}
                                onChangeText={setLocation}
                                showChevron
                            />
                        </View>

                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.saveButton, updateProfile.isPending && styles.disabledButton]}
                                activeOpacity={0.8}
                                onPress={handleSave}
                                disabled={updateProfile.isPending}
                            >
                                {updateProfile.isPending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                activeOpacity={0.8}
                                onPress={() => router.back()}
                                disabled={updateProfile.isPending}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
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
        backgroundColor: '#f8f9fa',
    },
    headerBgContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 0,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 40,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#4A54DF',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        marginBottom: theme.spacing.md,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4A6cf7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a1f36',
    },
    formContainer: {
        gap: 16,
        marginBottom: 32,
    },
    inputContainer: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6b7280',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1a1f36',
        fontWeight: '500',
    },
    inputIcon: {
        marginLeft: 8,
    },
    actionButtonsContainer: {
        gap: 12,
    },
    saveButton: {
        backgroundColor: '#4A6cf7',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4A6cf7',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#fff',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cancelButtonText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    disabledInput: {
        backgroundColor: '#f3f4f6',
    },
    disabledText: {
        color: '#9ca3af',
    },
    disabledButton: {
        opacity: 0.6,
    },
});
