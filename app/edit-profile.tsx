import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

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

    const [fullName, setFullName] = useState('Jessica Parker');
    const [username, setUsername] = useState('@jessica_89');
    const [email, setEmail] = useState('jessica.parker@email.com');
    const [location, setLocation] = useState('New York, NY');

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
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.cameraIconContainer} activeOpacity={0.8}>
                            <Ionicons name="camera" size={16} color="#fff" />
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
                        showChevron
                    />
                    <CustomInput
                        label="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        showChevron
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
                        style={styles.saveButton}
                        activeOpacity={0.8}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        activeOpacity={0.8}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
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
});
