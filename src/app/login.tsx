import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { WaveHeader } from '@/components/WaveHeader';
import { SocialButtons } from '@/components/SocialButtons';
import { useHeartCheck } from '@/context/HeartCheckContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useHeartCheck();

  const [correo, setCorreo] = useState('elena.vargas@heartcheck.bo');
  const [clave, setClave] = useState('123456');
  const [verClave, setVerClave] = useState(false);
  const [recordarme, setRecordarme] = useState(true);
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!correo.trim() || !clave.trim()) {
      Alert.alert('Datos incompletos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setCargando(true);
    try {
      const exito = await login(correo, clave);
      setCargando(false);
      if (exito) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Credenciales no válidas. Revisa tus datos.');
      }
    } catch {
      setCargando(false);
      Alert.alert('Error', 'No se pudo iniciar sesión.');
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Top Wave Graphic */}
      <WaveHeader height={150} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Top Back Nav */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Header Titles */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Bienvenido de nuevo</Text>
              <Text style={styles.subtitle}>
                Por favor ingresa tus datos para iniciar sesión
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formCard}>
              <Text style={styles.sectionLabel}>Iniciar Sesión</Text>

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu correo..."
                  placeholderTextColor="#9C9288"
                  value={correo}
                  onChangeText={setCorreo}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Contraseña"
                  placeholderTextColor="#9C9288"
                  value={clave}
                  onChangeText={setClave}
                  secureTextEntry={!verClave}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setVerClave(!verClave)}>
                  <Ionicons
                    name={verClave ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#786F68"
                  />
                </TouchableOpacity>
              </View>

              {/* Remember me & Forgot Password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMe}
                  onPress={() => setRecordarme(!recordarme)}
                  activeOpacity={0.8}>
                  <View style={[styles.checkbox, recordarme && styles.checkboxChecked]}>
                    {recordarme && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.rememberText}>Recordarme</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'Recuperación',
                      'Se ha enviado un enlace de recuperación a tu correo electrónico.'
                    )
                  }>
                  <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={cargando}>
                <Text style={styles.submitBtnText}>
                  {cargando ? 'Verificando...' : 'Iniciar Sesión'}
                </Text>
              </TouchableOpacity>

              {/* Register Link */}
              <View style={styles.registerRow}>
                <Text style={styles.registerText}>¿No tienes una cuenta aún? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={styles.registerLink}>Regístrate</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <SocialButtons />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#262220',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#766D66',
    textAlign: 'center',
  },
  formCard: {
    marginTop: 10,
    paddingHorizontal: 6,
  },
  sectionLabel: {
    fontSize: 16.5,
    fontWeight: '700',
    color: Theme.colors.primary,
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 16,
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4C9BF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#24201E',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 22,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#786F68',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  rememberText: {
    fontSize: 13,
    color: '#524B45',
  },
  forgotText: {
    fontSize: 13,
    color: '#524B45',
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.button,
    marginBottom: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  registerText: {
    fontSize: 13.5,
    color: '#524B45',
  },
  registerLink: {
    fontSize: 13.5,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DCD3CB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#8C827A',
    fontSize: 13,
  },
});
