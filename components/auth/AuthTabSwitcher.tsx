import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AuthTabSwitcherProps {
  activeTab: 'signin' | 'signup';
  onTabPress: (tab: 'signin' | 'signup') => void;
}

export function AuthTabSwitcher({ activeTab, onTabPress }: AuthTabSwitcherProps) {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={activeTab === 'signin' ? styles.tabActive : styles.tabInactive}
        onPress={() => onTabPress('signin')}
      >
        <Text style={activeTab === 'signin' ? styles.tabTextActive : styles.tabTextInactive}>Sign In</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={activeTab === 'signup' ? styles.tabActive : styles.tabInactive}
        onPress={() => onTabPress('signup')}
      >
        <Text style={activeTab === 'signup' ? styles.tabTextActive : styles.tabTextInactive}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
