import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { config } from "@gluestack-ui/config"
import { Slot, router } from "expo-router";
import { supabase } from '../lib/supabase';

export default function RootLayout() {

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        console.log("User Exists")
        router.replace("/");
      }
    });
  }, []);

  return (
    <GestureHandlerRootView>
      <StatusBar style="auto" />
      <GluestackUIProvider config={config} >
        <View style={styles.container}>
          <Slot />
        </View>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
