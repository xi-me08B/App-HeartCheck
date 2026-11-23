import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

export function SocialButtons() {
  const handleSocialPress = (provider: string) => {
    Alert.alert('Acceso Social', `Conectando con tu cuenta de ${provider}...`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => handleSocialPress('Apple')}
        activeOpacity={0.7}>
        <Ionicons name="logo-apple" size={24} color="#1C1917" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => handleSocialPress('Google')}
        activeOpacity={0.7}>
        <FontAwesome5 name="google" size={20} color="#EA4335" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => handleSocialPress('Twitter/X')}
        activeOpacity={0.7}>
        <FontAwesome5 name="twitter" size={20} color="#1DA1F2" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 12,
  },
  btn: {
    width: 52,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DED6',
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.soft,
  },
});
