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
            <RootComponent />
          </UserProvider>
        </LoadingProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}

function SpinnerComponent() {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: '999' }} pointerEvents='box-none'>
      <Spinner size='large' zIndex={999} />
    </View>
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
      {/* {loading && <Spinner size='large' position='absolute' top={"49%"} left={Platform.select({ web: '47%', default: '46%' })} zIndex={999} />} */}
      {loading && <SpinnerComponent />}
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
