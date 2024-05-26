import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <StatusBar style="auto" />
      <View style = {styles.container}>
        <Slot/>
      </View>
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
