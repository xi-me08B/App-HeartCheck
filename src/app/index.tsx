import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { useHeartCheck } from '@/context/HeartCheckContext';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user } = useHeartCheck();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Title Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenido a HeartCheck</Text>
          <Text style={styles.subtitle}>
            Crea una cuenta para comenzar tu camino hacia una mejor salud y bienestar cardiovascular.
          </Text>
        </View>

        {/* 3D Heart Illustration Center */}
        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/heart/heart_3d.png')}
            style={styles.heartImage}
            resizeMode="contain"
          />
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.loginBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/login')}>
            <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/register')}>
            <Text style={styles.signUpBtnText}>Registrarse</Text>
          </TouchableOpacity>

          {/* Quick guest access to dashboard */}
          <TouchableOpacity
            style={styles.guestBtn}
            activeOpacity={0.7}
            onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.guestBtnText}>
              Continuar al panel de salud ({user?.nombre || 'Paciente'}) →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#24201E',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14.5,
    color: '#766D66',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 12,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginVertical: 10,
  },
  heartImage: {
    width: Math.min(width * 0.58, 240),
    height: Math.min(width * 0.58, 240),
  },
  actions: {
    width: '100%',
    gap: 14,
    marginBottom: 12,
  },
  loginBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.button,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  signUpBtn: {
    backgroundColor: '#FAF4EE',
    paddingVertical: 15,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#786F68',
  },
  signUpBtnText: {
    color: '#2C2725',
    fontSize: 16,
    fontWeight: '600',
  },
  guestBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  guestBtnText: {
    color: Theme.colors.primary,
    fontSize: 13.5,
    fontWeight: '600',
  },
});
