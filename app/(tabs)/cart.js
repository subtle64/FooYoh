import { StyleSheet } from 'react-native';
import { View, Text, Button, ButtonText, Heading, Avatar, HStack, Divider, ButtonIcon, Modal, ModalContent, ModalBackdrop, ModalHeader, ModalBody, ModalCloseButton, Toast, ToastDescription, useToast, Pressable, Checkbox, CheckboxIndicator, CheckboxIcon } from "@gluestack-ui/themed"
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { LoadingProvider, useLoading } from '../../components/LoadingContext';
import { useUser, useUserDetails } from '../../components/UserContext';
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

export default function Tab() {
  const { loading, setLoading } = useLoading();
  const [cartHeader, setCartHeader] = useState(null);
  const [detailIngredients, setDetailIngredients] = useState(null);
  const [detailRecipes, setDetailRecipes] = useState(null);
  const { user, setUser } = useUser();
  const { userDetails, setUserDetails } = useUserDetails();

  useEffect(() => {
    setLoading(true);
    const fetchCart = async () => {
      const cartHeaderResult = await supabase.from("CartHeader").select().eq("user_id", user.id);
      setCartHeader(cartHeaderResult.data[0].id);

      const recipesResult = await supabase.from("cartrecipedetails").select().eq("cart_header_id", cartHeaderResult.data[0].id);
      setDetailRecipes(recipesResult.data);

      const ingredientsResult = await supabase.from("cartingredientdetails").select().eq("cart_header_id", cartHeaderResult.data[0].id);
      setDetailIngredients(ingredientsResult.data);

      setLoading(false);
    }

    fetchCart();
  }, [setCartHeader]);

  function IngredientsList() {
    const ingredients = [];
    if (!detailIngredients) {
      return ingredients;
    }
    for (let i of detailIngredients) {
      ingredients.push(
        <Card key={i.id} marginTop={18} size="lg" variant="elevated" m="$0">
          <Text bold={true}>{i.name} Recipe</Text>
          <Text>{i.price} FYC</Text>
          <View width={"100%"} flex={1} flexDirection='row' justifyContent='space-between' gap={12}>
            <>
              <Checkbox aria-label='Checkout' size="md" isInvalid={false} isDisabled={false}   >
                <CheckboxIndicator mr="$2">
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
              </Checkbox>
            </>
            <View flexDirection='row' justifyContent='space-between' gap={12} >
              <Button size='xs' height={30} width={30} borderRadius={18}>
                <Ionicons name="add" size={14} color="white" />
              </Button>
              <Text>{i.quantity}</Text>
              <Button size='xs' height={30} width={30} borderRadius={18}>
                <FontAwesome6 name="minus" size={12} color="white" />
              </Button>
            </View>
          </View>
        </Card>
      )
    }
    return ingredients;
  }

  function RecipesList() {
    const recipes = [];
    if (!detailRecipes) {
      return recipes;
    }
    console.log(detailRecipes);
    for (let i of detailRecipes) {
      recipes.push(
        <Card key={i.id} marginTop={18} size="lg" variant="elevated" m="$0">
          <Text bold={true}>{i.name} Recipe</Text>
          <Text>{i.price} FYC</Text>
          <View width={"100%"} flex={1} flexDirection='row' justifyContent='space-between' gap={12}>
            <>
              <Checkbox aria-label='Checkout' size="md" isInvalid={false} isDisabled={false}   >
                <CheckboxIndicator mr="$2">
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
              </Checkbox>
            </>
            <View flexDirection='row' justifyContent='space-between' gap={12} >
              <Button size='xs' height={30} width={30} borderRadius={18} action={"negative"}>
                <FontAwesome6 name="minus" size={12} color="white" />
              </Button>
            </View>
          </View>
        </Card>
      )
    }
    return recipes;
  }

  function CartComponent() {
    return (
      <>
        <RecipesList />
        <IngredientsList />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <Heading size="3xl">Cart: ( ∩´͈ ᐜ `͈∩)</Heading>
      <ScrollView>
        {cartHeader && <CartComponent />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 52,
    backgroundColor: '#fff',
  },
});
