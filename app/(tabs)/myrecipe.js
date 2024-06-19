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
  const { cartChanged, setCartChanged } = useCartChanged();
  const [purchaseHeader, setPurchaseHeader] = useState(null);
  const [purchaseDetails, setPurchaseDetails] = useState(null);
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

  const fetchRecipe = async () => {
    setQuerying(true);
    if (!purchaseHeader) {
      const purchaseHeaderResult = await supabase.from("PurchasedHeader").select().eq("user_id", user.id);
      setPurchaseHeader(purchaseHeaderResult.data[0].id);
      const recipesResult = await supabase.from("myrecipedetails").select().eq("purchased_header_id", purchaseHeaderResult.data[0].id).ilike('name', '%' + search + '%');
      setPurchaseDetails(recipesResult.data);
    } else {
      const recipesResult = await supabase.from("myrecipedetails").select().eq("purchased_header_id", purchaseHeader).ilike('name', '%' + search + '%');
      setPurchaseDetails(recipesResult.data);
    }

    console.log(purchaseDetails);
    setQuerying(false);
  }

  useEffect(() => {
    setQuerying(true);
    const delay = setTimeout(() => {
      fetchRecipe();
    }, 2000);

    return () => clearTimeout(delay);

  }, [search, cartChanged])

  const Recipe = ({ name, price, vendor, image, id }) => (
    <Pressable style={{ flex: 1, bgColor: '#fff' }} onPress={() => { router.push("/recipes/" + id) }} padding={12}>
      <View bgColor={'#fff'} flex={1} maxWidth={"100%"} borderRadius={4} justifyContent='center' textAlign='center'>
        <Image
          style={styles.image}
          source={getImageURL(image)}
          placeholder={{ blurhash }}
          contentFit="contain"
          transition={150}
        />
        <Text textAlign='center'>{name.slice(0, 12)}...</Text>
        <Text textAlign='center'  fontWeight={'$thin'}>By {vendor.slice(0, 12)}...</Text>
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

  function RecipeComponent() {
    return (
      <>
        <FlatList
          data={purchaseDetails}
          renderItem={({ item }) => <Recipe name={item.name} price={item.price} vendor={item.vendor} image={item.image} id={item.recipe_id} />}
          keyExtractor={item => item.id}
          numColumns={2}
        />
      </>
    )
  }

  function NotFoundComponent() {
    return (
      <>
        <View marginTop={32} flex={1} height={"100%"} alignItems='center' justifyContent='center' textAlign='center'>
          <Text textAlign='center'>You don't have any recipes matching your search! Go buy some! ૮ ◞ ﻌ ◟ ა</Text>
        </View>
      </>
    )
  }

  function SearchComponent() {
    return (
      <>
        <VStack space="sm" reversed={false} style={styles.searchBar}>
          <Input width={"100%"} borderColor='#eb5834' marginBottom={12}>
            <InputSlot pl="$3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
            <InputField placeholder="Search your recipes" autoFocus={true} value={search} onChangeText={setSearch} />
          </Input>
        </VStack>
        {querying ? <SkeletonComponent /> : (!purchaseDetails || purchaseDetails.length == 0) ? <NotFoundComponent /> : <RecipeComponent />}
      </>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Heading size="xl" marginBottom={12}>Your Recipes:</Heading>
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
    height: 130,
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
