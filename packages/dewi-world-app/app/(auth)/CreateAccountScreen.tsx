import { useAuthStore } from '@/stores/useAuthStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function CreateAccountScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { registerWithEmailPassword, loginWithProvider, loading, error } = useAuthStore();

  const handleEmailSignup = async () => {
    await registerWithEmailPassword(email.trim(), password.trim());
    if (useAuthStore.getState().user) router.replace('/world/WorldScreen');
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    await loginWithProvider(provider);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Button title="Create Account" onPress={handleEmailSignup} />

          <View style={styles.divider} />

          <Button title="Continue with Google" onPress={() => handleOAuth('google')} />
          <Button title="Continue with Apple" onPress={() => handleOAuth('apple')} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    borderColor: '#ccc',
  },
  error: { color: 'red', textAlign: 'center' },
  divider: { height: 8 },
});
