import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { HeartCheckProvider } from '@/context/HeartCheckContext';
import { Theme } from '@/constants/theme';
import { initDatabase } from '@/datos';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="heartcheck.db" onInit={initDatabase}>
      <HeartCheckProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Theme.colors.background },
            animation: 'fade',
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="detalle"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </HeartCheckProvider>
    </SQLiteProvider>
  );
}
