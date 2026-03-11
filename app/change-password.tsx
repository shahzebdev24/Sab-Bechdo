import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { useChangePassword } from '@/src/hooks';

export default function ChangePasswordScreen() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { mutate: changePassword, isPending } = useChangePassword();

    const handleChangePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'New password must be at least 8 characters');
            return;
        }

        if (currentPassword === newPassword) {
            Alert.alert('Error', 'New password must be different from current password');
            return;
        }

        changePassword(
            { currentPassword, newPassword },
            {
                onSuccess: () => {
                    Alert.alert(
                        'Success',
                        'Password changed successfully! Please login again with your new password.',
                        [
                            {
                                text: 'OK',
                                onPress: () => router.replace('/login'),
                            },
                        ]
                    );
                },
                onError: (error: any) => {
                    Alert.alert('Error', error.message || 'Failed to change password');
                },
            }
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="shield-checkmark" size={40} color={theme.colors.primary} />
                    </View>
                </View>

                <Text style={styles.title}>Update Your Password</Text>
                <Text style={styles.description}>
                    Enter your current password and choose a new secure password.
                </Text>

                <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Current Password"
                        placeholderTextColor={theme.colors.textSecondary}
                        secureTextEntry={!showCurrent}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                        <Ionicons 
                            name={showCurrent ? "eye-off-outline" : "eye-outline"} 
                            size={20} 
                            color={theme.colors.textSecondary} 
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        placeholderTextColor={theme.colors.textSecondary}
                        secureTextEntry={!showNew}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                        <Ionicons 
                            name={showNew ? "eye-off-outline" : "eye-outline"} 
                            size={20} 
                            color={theme.colors.textSecondary} 
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm New Password"
                        placeholderTextColor={theme.colors.textSecondary}
                        secureTextEntry={!showConfirm}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                        <Ionicons 
                            name={showConfirm ? "eye-off-outline" : "eye-outline"} 
                            size={20} 
                            color={theme.colors.textSecondary} 
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.requirements}>
                    <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                    <View style={styles.requirementItem}>
                        <Ionicons 
                            name={newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                            size={16} 
                            color={newPassword.length >= 8 ? "#10B981" : theme.colors.textSecondary} 
                        />
                        <Text style={styles.requirementText}>At least 8 characters</Text>
                    </View>
                    <View style={styles.requirementItem}>
                        <Ionicons 
                            name={newPassword !== currentPassword && newPassword ? "checkmark-circle" : "ellipse-outline"} 
                            size={16} 
                            color={newPassword !== currentPassword && newPassword ? "#10B981" : theme.colors.textSecondary} 
                        />
                        <Text style={styles.requirementText}>Different from current password</Text>
                    </View>
                    <View style={styles.requirementItem}>
                        <Ionicons 
                            name={newPassword === confirmPassword && newPassword ? "checkmark-circle" : "ellipse-outline"} 
                            size={16} 
                            color={newPassword === confirmPassword && newPassword ? "#10B981" : theme.colors.textSecondary} 
                        />
                        <Text style={styles.requirementText}>Passwords match</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, (!currentPassword || !newPassword || !confirmPassword || isPending) && styles.disabledButton]}
                    onPress={handleChangePassword}
                    disabled={!currentPassword || !newPassword || !confirmPassword || isPending}
                >
                    {isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Change Password</Text>
                    )}
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
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
    content: {
        flex: 1,
        padding: 24,
    },
    iconContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    requirements: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requirementText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginLeft: 8,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 8,
    },
    disabledButton: {
        backgroundColor: '#E5E7EB',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
