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

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useHeartCheck();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [confirmClave, setConfirmClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [verConfirmClave, setVerConfirmClave] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleRegister = async () => {
    if (!nombre.trim() || !correo.trim() || !clave.trim() || !confirmClave.trim()) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los campos solicitados.');
      return;
    }

    if (clave !== confirmClave) {
      Alert.alert('Error de contraseña', 'Las contraseñas no coinciden.');
      return;
    }

    if (!aceptaTerminos) {
      Alert.alert(
        'Términos y Condiciones',
        'Debes aceptar los términos y condiciones para continuar.'
      );
      return;
    }

    setCargando(true);
    try {
      const exito = await register(nombre, correo, clave);
      setCargando(false);
      if (exito) {
        Alert.alert('Registro exitoso', '¡Bienvenido a HeartCheck!', [
          { text: 'Comenzar', onPress: () => router.replace('/(tabs)') },
        ]);
      } else {
        Alert.alert('Error', 'No se pudo completar el registro. Intenta de nuevo.');
      }
    } catch {
      setCargando(false);
      Alert.alert('Error', 'Ocurrió un error en el registro.');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <WaveHeader height={145} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Header Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Crea tu Cuenta</Text>
              <Text style={styles.subtitle}>
                Por favor ingresa tus datos para registrarte
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formCard}>
              <Text style={styles.sectionLabel}>Registrarse</Text>

              {/* Full Name */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo..."
                  placeholderTextColor="#9C9288"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>

              {/* Email */}
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

              {/* Password */}
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

              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Confirmar Contraseña"
                  placeholderTextColor="#9C9288"
                  value={confirmClave}
                  onChangeText={setConfirmClave}
                  secureTextEntry={!verConfirmClave}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setVerConfirmClave(!verConfirmClave)}>
                  <Ionicons
                    name={verConfirmClave ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#786F68"
                  />
                </TouchableOpacity>
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAceptaTerminos(!aceptaTerminos)}
                activeOpacity={0.8}>
                <View style={[styles.checkbox, aceptaTerminos && styles.checkboxChecked]}>
                  {aceptaTerminos && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                </View>
                <Text style={styles.termsText}>Acepto los términos y condiciones</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.85}
                onPress={handleRegister}
                disabled={cargando}>
                <Text style={styles.submitBtnText}>
                  {cargando ? 'Creando cuenta...' : 'Registrarse'}
                </Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.loginLink}>Inicia Sesión</Text>
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
    marginTop: 25,
    marginBottom: 16,
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
    marginTop: 8,
    paddingHorizontal: 6,
  },
  sectionLabel: {
    fontSize: 16.5,
    fontWeight: '700',
    color: Theme.colors.primary,
    marginBottom: 14,
  },
  inputWrapper: {
    marginBottom: 14,
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4C9BF',
    borderRadius: 14,
    paddingVertical: 13,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
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
  termsText: {
    fontSize: 13,
    color: '#524B45',
  },
  submitBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.button,
    marginVertical: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    fontSize: 13.5,
    color: '#524B45',
  },
  loginLink: {
    fontSize: 13.5,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
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
