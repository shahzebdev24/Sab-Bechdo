import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';

const HELP_CATEGORIES = [
    { id: '1', title: 'Buying on Sab Bechdo', icon: 'cart-outline' },
    { id: '2', title: 'Selling on Sab Bechdo', icon: 'megaphone-outline' },
    { id: '3', title: 'Account & Profile', icon: 'person-outline' },
    { id: '4', title: 'Safety & Security', icon: 'shield-checkmark-outline' },
    { id: '5', title: 'Policies & Rules', icon: 'document-text-outline' },
];

const FAQS = [
    { id: 'f1', question: 'How do I post an ad?' },
    { id: 'f2', question: 'Is it free to use Sab Bechdo?' },
    { id: 'f3', question: 'How to stay safe while buying?' },
    { id: 'f4', question: 'How can I edit my profile?' },
];

export default function HelpSupportScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>How can we help you?</Text>
                    <View style={styles.searchPlaceholder}>
                        <Ionicons name="search" size={20} color={theme.colors.iconDefault} />
                        <Text style={styles.searchPlaceholderText}>Search for topics...</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Categories</Text>
                <View style={styles.categoryGrid}>
                    {HELP_CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat.id} style={styles.categoryCard}>
                            <View style={styles.iconCircle}>
                                <Ionicons name={cat.icon as any} size={24} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.categoryText}>{cat.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Top FAQs</Text>
                <View style={styles.faqList}>
                    {FAQS.map((faq) => (
                        <TouchableOpacity key={faq.id} style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.iconDefault} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.contactSection}>
                    <Text style={styles.contactTitle}>Still need help?</Text>
                    <Text style={styles.contactDesc}>Our support team is available 24/7 to assist you.</Text>
                    <TouchableOpacity style={styles.contactButton}>
                        <Ionicons name="chatbubbles-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.contactButtonText}>Chat with us</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFD',
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
    heroSection: {
        backgroundColor: '#fff',
        padding: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    searchPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchPlaceholderText: {
        marginLeft: 10,
        color: theme.colors.textSecondary,
        fontSize: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginTop: 32,
        marginBottom: 16,
        marginHorizontal: 20,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
    },
    categoryCard: {
        width: '45%',
        backgroundColor: '#fff',
        marginHorizontal: '2.5%',
        marginBottom: 16,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        textAlign: 'center',
    },
    faqList: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    faqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textPrimary,
    },
    contactSection: {
        marginTop: 40,
        marginHorizontal: 20,
        padding: 24,
        backgroundColor: '#EEF2FF',
        borderRadius: 24,
        alignItems: 'center',
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 8,
    },
    contactDesc: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});
