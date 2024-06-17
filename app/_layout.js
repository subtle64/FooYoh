import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { GluestackUIProvider, Spinner } from "@gluestack-ui/themed"
import { config } from "@gluestack-ui/config"
import { Slot, router } from "expo-router";
import { supabase } from '../lib/supabase';
import { LoadingProvider, useLoading } from '../components/LoadingContext';
import { UserProvider, useUser } from '../components/UserContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <StatusBar style="auto" />
      <GluestackUIProvider config={config}>
        <LoadingProvider>
          <UserProvider>
            <RootComponent/>
          </UserProvider>
        </LoadingProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}

function RootComponent() {
  const { loading, setLoading } = useLoading();
  useEffect(() => {
    setLoading(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    });
    setLoading(false);
  }, []);
  return (
    <>
      {loading && <Spinner size='large' position='absolute' top={"49%"} left={Platform.select({ web: '48.8%', default: '46%' }) } zIndex={999} />}
      <View style={styles.container}>
        <Slot />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
