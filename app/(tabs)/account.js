import { StyleSheet } from 'react-native';
import { View, Text, Button, ButtonText, Heading, Avatar, HStack } from "@gluestack-ui/themed"
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { LoadingProvider, useLoading } from '../../components/LoadingContext';
import { useUser, useUserDetails } from '../../components/UserContext';
import { AvatarFallbackText } from '@gluestack-ui/themed';

export default function Tab() {
  const { loading, setLoading } = useLoading();
  const { user, setUser } = useUser();
  const { userDetails, setUserDetails } = useUserDetails();

  async function logout() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    console.log(error);
    setLoading(false);
    router.replace("/login");
  }

  return (
    <View style={styles.container}>
      <View style={styles.userCard}>
        <HStack flex={1} gap={12} alignItems='center'>
          <View flex={1}>
            <Heading>{userDetails.first_name + ' ' + userDetails.last_name}</Heading>
            <Text size='xs'>{"ID: " + userDetails.user_id}</Text>
            <Text size='xs'>Joined: {userDetails.created_at.slice(0, 10)}</Text>
          </View>
          <Avatar bgColor="$amber600" size="md" borderRadius="$full">
            <AvatarFallbackText>{userDetails.first_name + ' ' + userDetails.last_name}</AvatarFallbackText>
          </Avatar>
        </HStack>

      </View>
      <Button onPress={() => logout()}>
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
    gap: 18,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  userCard: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#808080',
    padding: 8,
    borderRadius: 8,
  }
});
