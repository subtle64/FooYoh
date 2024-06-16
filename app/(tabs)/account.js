import { View, Text, StyleSheet } from 'react-native';
import { Button, ButtonText } from "@gluestack-ui/themed"
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { LoadingProvider, useLoading } from '../../components/LoadingContext';

export default function Tab() {
  const {loading, setLoading} = useLoading();

  async function logout() {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      console.log(error);
      setLoading(false);
      router.replace("/login");
  }

  return (
    <View style = {styles.container}>
            <Button onPress = {() => logout()}>
                <ButtonText>
                    Sign Out
                </ButtonText>
            </Button>
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
