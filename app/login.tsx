import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { useLogin, useSignup, useFirebaseAuth } from '@/src/hooks';

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const { mutate: login, isPending: isLoggingIn } = useLogin();
    const { mutate: signup, isPending: isSigningUp } = useSignup();
    const { mutate: firebaseAuth, isPending: isFirebaseLoading } = useFirebaseAuth();

    // Hardcoding Expo Proxy Redirect URI as requested by user to force Expo Go into using 
    // it instead of the local IP address (Make sure this exactly matches what you put in Facebook console)
    // const redirectUri = 'https://auth.expo.io/@muhammadhasan21159/SabBechdo';

    /* Facebook login temporary disabled
    const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
        redirectUri,
        scopes: ['public_profile'],
        extraParams: { display: 'popup', auth_type: 'rerequest' },
    });

    useEffect(() => {
        if (fbRequest) {
            console.log('--- Facebook Auth Request Triggered ---');
            console.log('1. Generated Redirect URI:', redirectUri);
            console.log('2. Request URL being sent to Facebook:', fbRequest.url);
            console.log('3. Client ID Used:', fbRequest.clientId);
            console.log('-----------------------------------------');
        }
    }, [fbRequest, redirectUri]);

    useEffect(() => {
        if (fbResponse?.type === 'success') {
            const { access_token } = fbResponse.params;
            if (access_token) {
                console.log('Facebook ID Token received, signing in with Firebase...');
                const credential = FacebookAuthProvider.credential(access_token);
                
                signInWithCredential(auth, credential)
                    .then(async (userCredential) => {
                        const firebaseIdToken = await userCredential.user.getIdToken();
                        console.log('Firebase sign-in successful, authenticating with backend...');
                        firebaseAuth(
                            { token: firebaseIdToken },
                            {
                                onSuccess: () => {
                                    console.log('Backend authentication successful!');
                                    router.replace('/(tabs)');
                                },
                                onError: (error: any) => {
                                    console.error('Backend authentication error:', error);
                                    Alert.alert('Authentication Failed', error.message || 'Could not authenticate with Facebook');
                                },
                            }
                        );
                    })
                    .catch((error) => {
                        console.error('Firebase sign-in error:', error);
                        Alert.alert('Authentication Failed', error.message || 'Could not sign in with Facebook');
                    });
            }
        } else if (fbResponse?.type === 'error') {
            console.error('Facebook Sign-In Error:', fbResponse.error);
            Alert.alert('Error', `Facebook sign-in failed: ${fbResponse.error?.message || 'Unknown error'}`);
        }
    }, [fbResponse]);
    */

    // Google login functionality removed temporarily for testing Facebook login

    const handleAuth = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (isLogin) {
            login(
                { email, password },
                {
                    onSuccess: () => {
                        router.replace('/(tabs)');
                    },
                    onError: (error: any) => {
                        Alert.alert('Login Failed', error.message || 'Invalid credentials');
                    },
                }
            );
        } else {
            if (!name) {
                Alert.alert('Error', 'Please enter your name');
                return;
            }
            signup(
                { name, email, password },
                {
                    onSuccess: () => {
                        router.replace('/(tabs)');
                    },
                    onError: (error: any) => {
                        Alert.alert('Signup Failed', error.message || 'Could not create account');
                    },
                }
            );
        }
    };

    const handleSocialAuth = async (provider: 'google' | 'facebook' | 'apple') => {
        if (provider === 'google') {
            Alert.alert(
                'Google Login',
                'Google login is temporarily disabled. Please use Facebook or email/password.',
                [{ text: 'OK' }]
            );
        } else if (provider === 'facebook') {
            Alert.alert(
                'Facebook Login',
                'Facebook login is temporarily disabled.',
                [{ text: 'OK' }]
            );
        } else if (provider === 'apple') {
            Alert.alert(
                'Apple Login',
                'Apple login requires additional setup. Please use Google or email/password for now.',
                [{ text: 'OK' }]
            );
        }
    };

    const isLoading = isLoggingIn || isSigningUp || isFirebaseLoading;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
                <ImageBackground
                    source={require('@/assets/images/login-bg.png')}
                    style={styles.headerBackground}
                    resizeMode="cover"
                >
                    <View style={[styles.header, { paddingTop: insets.top + 60 }]}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="bag-handle" size={50} color="#fff" />
                        </View>
                        <Text style={styles.appName}>Sab Bechdo</Text>
                        <Text style={styles.tagline}>Buy and sell anything in seconds</Text>
                    </View>
                </ImageBackground>

                <View style={styles.formContainer}>
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tab, isLogin && styles.activeTab]}
                            onPress={() => setIsLogin(true)}
                        >
                            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, !isLogin && styles.activeTab]}
                            onPress={() => setIsLogin(false)}
                        >
                            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        {!isLogin && (
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        )}

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
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={theme.colors.textSecondary}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        {isLogin && (
                            <TouchableOpacity
                                style={styles.forgotPass}
                                onPress={() => router.push('/forgot-password')}
                            >
                                <Text style={styles.forgotPassText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity 
                            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
                            onPress={handleAuth}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>{isLogin ? 'Login' : 'Create Account'}</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.socialDivider}>
                            <View style={styles.line} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.line} />
                        </View>

                        <View style={styles.socialRow}>
                            <TouchableOpacity 
                                style={styles.socialButton} 
                                onPress={() => handleSocialAuth('google')}
                                disabled={isLoading}
                            >
                                <Ionicons name="logo-google" size={24} color="#DB4437" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.socialButton} 
                                onPress={() => handleSocialAuth('facebook')}
                                disabled={isLoading}
                            >
                                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.socialButton} 
                                onPress={() => handleSocialAuth('apple')}
                                disabled={isLoading}
                            >
                                <Ionicons name="logo-apple" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.footerLink}>Terms</Text> and{' '}
                        <Text style={styles.footerLink}>Privacy Policy</Text>
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    headerBackground: {
        width: '100%',
        backgroundColor: theme.colors.primary,
    },
    header: {
        paddingHorizontal: 30,
        alignItems: 'center',
        paddingBottom: 60, // Increased to accommodate overlap
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker overlay for contrast
    },
    logoContainer: {
        width: 90,
        height: 90,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    appName: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
        fontWeight: '500',
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 30,
        paddingTop: 30,
        paddingBottom: 20,
        marginTop: -30, // Overlap the header image
    },
    tabRow: {
        flexDirection: 'row',
        marginBottom: 30,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 6,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    activeTabText: {
        color: theme.colors.primary,
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
    forgotPass: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPassText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
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
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    socialDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 15,
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 20,
    },
    socialButton: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    footer: {
        backgroundColor: '#fff',
        paddingBottom: 30,
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
    footerLink: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
});
