import { StyleSheet } from 'react-native';
import { View, Text, Button, ButtonText, Heading, Avatar, HStack, Divider, ButtonIcon, Modal, ModalContent, ModalBackdrop, ModalHeader, ModalBody, ModalCloseButton, Toast, ToastDescription, useToast, Pressable, Checkbox, CheckboxIndicator, CheckboxIcon, Input, InputSlot, InputField } from "@gluestack-ui/themed"
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { LoadingProvider, useLoading } from '../../components/LoadingContext';
import { useCartChanged, useUser, useUserDetails } from '../../components/UserContext';
import { Card } from '@gluestack-ui/themed';
import { FontAwesome6 } from '@expo/vector-icons';
import { ModalFooter } from '@gluestack-ui/themed';
import { Icon } from '@gluestack-ui/themed';
import { CloseIcon } from '@gluestack-ui/themed';
import { VStack } from '@gluestack-ui/themed';
import { ToastTitle } from '@gluestack-ui/themed';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { CheckIcon } from '@gluestack-ui/themed';
import { CheckboxLabel } from '@gluestack-ui/themed';
import { Image } from 'expo-image';
import { InputIcon } from '@gluestack-ui/themed';
import { SearchIcon } from '@gluestack-ui/themed';
import Skeleton from 'react-loading-skeleton';

export default function Tab() {
  const { loading, setLoading } = useLoading();
  const [ingredients, setIngredients] = useState(null);
  const [search, setSearch] = useState("");
  const [querying, setQuerying] = useState(false);
  const { user, setUser } = useUser();
  const { userDetails, setUserDetails } = useUserDetails();
  const blurhash = 'GDkKFwJgeoh7mIiHmJh3aGd3iPuX+U8F';

  function getImageURL(image) {
    const { data } = supabase
      .storage
      .from('Images')
      .getPublicUrl("Public/" + image);

    return data.publicUrl;
  }

  const fetchIngredients = async () => {
    if (search.length > 0) {
      const { data, error } = await supabase.from("Ingredients").select().ilike('name', "%" + search + "%");
      setIngredients(data);
    } else {
      const { data, error } = await supabase.from("Ingredients").select();
      setIngredients(data);
    }
    setQuerying(false);
  }

  useEffect(() => {
    setQuerying(true);
    const delay = setTimeout(() => {
      fetchIngredients();
    }, 2000);

    return () => clearTimeout(delay);

  }, [search])

  const Ingredient = ({ name, price, unit, image, id }) => (
    <Pressable style={{ flex: 1, bgColor: '#fff' }} onPress={() => { router.push("/ingredients/" + id) }}>
      <View bgColor={'#fff'} flex={1} maxWidth={"50%"} borderRadius={4} marginTop={12} justifyContent='center' textAlign='center'>
        <Image
          style={styles.image}
          source={getImageURL(image)}
          placeholder={{ blurhash }}
          contentFit="contain"
          transition={150}
        />
        <Text textAlign='center'>{name}</Text>
        <Text textAlign='center' fontWeight={'$thin'}>{price} FYC/{unit}</Text>
      </View>
    </Pressable>
  );

  function SkeletonComponent() {
    return (
      <>
        <View margin={10}>
          <Skeleton count={1} height={420} />
        </View>
      </>
    );
  }

  function IngredientComponent() {
    return (
      <>
        <FlatList
          data={ingredients}
          renderItem={({ item }) => <Ingredient name={item.name} price={item.price} unit={item.unit} image={item.image} id={item.id} />}
          keyExtractor={item => item.id}
        />
      </>
    )
  }

  function NotFoundComponent() {
    return (
      <>
        <View marginTop={32} flex={1} height={"100%"} alignItems='center' justifyContent='center' textAlign='center'>
          <Text textAlign='center'>No ingredients matching your search.</Text>
        </View>
      </>
    )
  }

  function SearchComponent() {
    return (
      <>
        <VStack space="sm" reversed={false} style={styles.searchBar}>
          <Input width={"100%"} borderColor='#eb5834'>
            <InputSlot pl="$3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
            <InputField placeholder="Search your ingredients" autoFocus={true} value={search} onChangeText={setSearch} />
          </Input>
        </VStack>
        {querying ? <SkeletonComponent /> : (!ingredients || ingredients.length == 0) ? <NotFoundComponent /> : <IngredientComponent />}
      </>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Heading size="xl" marginBottom={12}>Ingredients:</Heading>
        <SearchComponent />
      </ScrollView>
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 52,
    backgroundColor: '#fff',
  },
  image: {
    width: "100%",
    height: 155,
    backgroundColor: '#efefef',
    borderRadius: 5,
  },
  searchBar: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
});
