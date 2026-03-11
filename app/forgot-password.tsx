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
import { useForgotPassword } from '@/src/hooks';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);
    const { mutate: forgotPassword, isPending } = useForgotPassword();

    const handleReset = () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        forgotPassword(
            { email },
            {
                onSuccess: () => {
                    setIsSent(true);
                },
                onError: (error: any) => {
                    Alert.alert('Error', error.message || 'Could not send reset email');
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
                <Text style={styles.headerTitle}>Forgot Password</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                {!isSent ? (
                    <>
                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="key-outline" size={40} color={theme.colors.primary} />
                            </View>
                        </View>

                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.description}>
                            Enter your email address and we'll send you a link to reset your password.
                        </Text>

                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor={theme.colors.textSecondary}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                autoFocus
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, (!email || isPending) && styles.disabledButton]}
                            onPress={handleReset}
                            disabled={!email || isPending}
                        >
                            {isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Send Reset Link</Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.successContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
                            <Ionicons name="checkmark-circle" size={50} color="#10B981" />
                        </View>
                        <Text style={styles.title}>Reset Link Sent!</Text>
                        <Text style={styles.description}>
                            We've sent an email to <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>{email}</Text> with instructions on how to reset your password.
                        </Text>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => router.replace('/login')}
                        >
                            <Text style={styles.submitButtonText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
        alignItems: 'center',
    },
    iconContainer: {
        marginTop: 40,
        marginBottom: 30,
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
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 30,
        height: 60,
        width: '100%',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
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
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
});
