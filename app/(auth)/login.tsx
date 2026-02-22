import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, ScrollView, Platform, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  const handleLogin = () => {
    // Implement actual login logic here
    if (email && password) {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <ThemedView style={styles.mainContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.container, isLargeScreen && styles.containerLarge]}>
            
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <MaterialIcons name="medical-services" size={40} color="#0da6f2" />
                </View>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                    Securely access your patient data and{'\n'}advanced sound analysis.
                </Text>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <View style={styles.tabActive}>
                    <Text style={styles.tabTextActive}>Sign In</Text>
                </View>
                <TouchableOpacity style={styles.tabInactive} onPress={() => router.push('/(auth)/signup')}>
                    <Text style={styles.tabTextInactive}>Sign Up</Text>
                </TouchableOpacity>
            </View>

            {/* Form Section */}
            <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIconLeft} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="doctor@hospital.com" 
                            placeholderTextColor="#9ca3af"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="lock-outline" size={20} color="#9ca3af" style={styles.inputIconLeft} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="••••••••" 
                            placeholderTextColor="#9ca3af"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
                    <Text style={styles.signInButtonText}>Secure Sign In</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Social Buttons */}
                <View style={styles.socialContainer}>
                    <TouchableOpacity style={styles.socialButtonGoogle}>
                        <FontAwesome5 name="google" size={18} color="#0d121c" style={{ marginRight: 8 }} />
                        <Text style={styles.socialButtonTextGoogle}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialButtonZalo}>
                        <View style={styles.zaloIconContainer}>
                            <Text style={styles.zaloIconText}>Z</Text>
                        </View>
                        <Text style={styles.socialButtonTextZalo}>Continue with Zalo</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our <Text style={styles.linkText}>Medical Privacy Policy</Text> and <Text style={styles.linkText}>Terms of Service</Text>.
                    </Text>
                </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f6f6f8',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    container: {
        width: '100%',
        padding: 24,
        alignItems: 'center',
    },
    containerLarge: {
        maxWidth: 480,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        width: '100%',
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: '#DBEAFE', // Light blue background for logo
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EFF6FF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0d121c',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 21,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#e5e7eb',
        borderRadius: 12,
        padding: 4,
        marginBottom: 32,
        width: '100%',
        height: 48,
    },
    tabActive: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabInactive: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabTextActive: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0da6f2',
    },
    tabTextInactive: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    form: {
        width: '100%',
        gap: 20,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0d121c',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        height: 48,
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#0d121c',
        marginLeft: 8,
    },
    inputIconLeft: {
        marginRight: 4,
    },
    eyeIcon: {
        padding: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#0da6f2',
        fontWeight: '500',
    },
    signInButton: {
        backgroundColor: '#0da6f2',
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1961f0',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 4,
    },
    signInButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 12,
        fontWeight: '500',
        color: '#9ca3af',
        letterSpacing: 0.6,
    },
    socialContainer: {
        gap: 12,
    },
    socialButtonGoogle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
    },
    socialButtonTextGoogle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0d121c',
    },
    socialButtonZalo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        backgroundColor: '#0da6f2', 
        borderRadius: 12,
        shadowColor: '#bfdbfe',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 3,
    },
    socialButtonTextZalo: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    zaloIconContainer: {
        width: 20,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    zaloIconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 18,
    },
    linkText: {
        color: '#0da6f2',
    }
});

