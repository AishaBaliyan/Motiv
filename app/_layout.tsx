import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Optional: Add any initialization logic here
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: 'black',
        },
        headerTintColor: '#1E90FF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: 'black',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="success" 
        options={{ 
          title: 'Success',
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="blank" 
        options={{ 
          title: 'DriveLock Tracker',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
}