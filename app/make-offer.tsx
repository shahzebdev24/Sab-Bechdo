import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function MakeOfferScreen() {
    const { title, price } = useLocalSearchParams<{ title: string; price: string }>();
    const [offerAmount, setOfferAmount] = useState('');

    const handleSendOffer = () => {
        // Logic to send offer
        router.back();
        alert('Offer sent successfully!');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Make an Offer</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.productInfo}>
                    <Text style={styles.productTitle}>{title || 'Product Title'}</Text>
                    <Text style={styles.productPrice}>Listed Price: {price || '₨0'}</Text>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Your Offer</Text>
                    <View style={styles.amountInputRow}>
                        <Text style={styles.currencySymbol}>₨</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={offerAmount}
                            onChangeText={setOfferAmount}
                            autoFocus
                        />
                    </View>
                    <Text style={styles.hint}>Enter an amount that is fair to both you and the seller.</Text>
                </View>

                <TouchableOpacity
                    style={[styles.sendButton, !offerAmount && styles.disabledButton]}
                    onPress={handleSendOffer}
                    disabled={!offerAmount}
                >
                    <Text style={styles.sendButtonText}>Send Offer</Text>
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
    productInfo: {
        marginBottom: 32,
    },
    productTitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    inputSection: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: 12,
    },
    amountInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primary,
        paddingBottom: 8,
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginRight: 8,
    },
    amountInput: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        flex: 1,
    },
    hint: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 12,
        lineHeight: 18,
    },
    sendButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: '#E5E7EB',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
