import { StyleSheet } from 'react-native';
import { View, Text, Button, ButtonText, Heading, Avatar, HStack, Divider, ButtonIcon, Modal, ModalContent, ModalBackdrop, ModalHeader, ModalBody, ModalCloseButton, Toast, ToastDescription, useToast, Pressable, Checkbox, CheckboxIndicator, CheckboxIcon, CheckboxGroup } from "@gluestack-ui/themed"
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

export default function Tab() {
  const toast = useToast();
  const { loading, setLoading } = useLoading();
  const [cartHeader, setCartHeader] = useState(null);
  const { cartChanged, setCartChanged } = useCartChanged();
  const [detailIngredients, setDetailIngredients] = useState(null);
  const [detailRecipes, setDetailRecipes] = useState(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [failedModal, setFailedModal] = useState(false);
  const [checked, setChecked] = useState([]);
  const [total, setTotal] = useState(0);
  const { user, setUser } = useUser();
  const { userDetails, setUserDetails } = useUserDetails();
  const purchaseRef = React.useRef(null);
  const failedRef = React.useRef(null);

  async function remove(id) {
    setLoading(true);
    const erase = await supabase.from("CartDetails").delete().eq('id', id);
    setCartChanged(true);
    setLoading(false);
  }

  async function checkout() {
    if (total > userDetails.fyc) {
      setFailedModal(true);
    } else {
      setLoading(true);
      for (let i of checked) {
        const details = await supabase.from("CartDetails").select().eq('id', i);
        const purchasedHeader = await supabase.from("PurchasedHeader").select().eq("user_id", user.id);
        const purchasedDetails = await supabase.from('PurchasedDetails').insert([{ recipe_id: details.data[0].recipe_id, ingredient_id: details.data[0].ingredient_id, purchased_header_id: purchasedHeader.data[0].id, quantity: details.data[0].quantity, status: details.data[0].recipe_id ? 'Success' : 'Pending' }]);
        const erase = await supabase.from("CartDetails").delete().eq('id', i);
      }

      const updateFYC = await supabase.from("UserDetails").update({fyc: userDetails.fyc - total}).eq('user_id', user.id);

      const { data } = await supabase.from("Users").select().eq("user_id", user.id);

      setTotal(0);
      setUserDetails(data[0]);
      setCartChanged(true);
      setChecked([]);
      setLoading(false);
      showToast("Checkout success.", "You have successfully checked out your items!", "success");
    }
  }

  function FailedModalComponent() {
    return (
      <Modal
        isOpen={failedModal}
        onClose={() => {
          setFailedModal(false)
        }}
        finalFocusRef={failedRef}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Purchase Failed!</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>
              Insufficient balance. Please purchase more FYC to buy this item!
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              action="secondary"
              mr="$3"
              onPress={() => {
                setFailedModal(false)
              }}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              action="positive"
              borderWidth="$0"
              onPress={() => {
                setFailedModal(false);
                router.replace("/account")
              }}
            >
              <ButtonText>Buy More FYC</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  function PurchaseModalComponent() {
    return (
      <Modal
        isOpen={paymentModal}
        onClose={() => {
          setPaymentModal(false)
        }}
        finalFocusRef={purchaseRef}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Purchase Confirmation</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>
              Are you sure you want to pay {total} FYC to checkout?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              action="secondary"
              mr="$3"
              onPress={() => {
                setPaymentModal(false)
              }}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              action="positive"
              borderWidth="$0"
              onPress={() => {
                setPaymentModal(false)
                checkout()
              }}
            >
              <ButtonText>Checkout</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

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
    setCartChanged(false);
  }, [setCartHeader, cartChanged]);

  useEffect(() => {
    if (!detailIngredients || !detailRecipes) {
      return;
    }
    setLoading(true);
    let total = 0;
    if (detailIngredients.length > 0) {
      for (let i of detailIngredients) {
        if (checked.includes(i.id)) {
          total += i.price;
        }
      }
    }

    if (detailRecipes.length > 0) {
      for (let i of detailRecipes) {
        if (checked.includes(i.id)) {
          total += i.price;
        }
      }
    }


    setTotal(total);
    setLoading(false);
    console.log(total);
  }, [checked]);

  function showToast(title, description, type) {
    toast.show({
      placement: "top",
      duration: null,
      render: ({ id }) => {
        const toastId = "toast-" + id;
        return (
          <Toast width={350} marginTop={36} nativeID={toastId} variant="accent" action={type}>
            <VStack space="xs" flex={1} >
              <ToastTitle>{title}</ToastTitle>
              <ToastDescription>
                {description}
              </ToastDescription>
            </VStack>
            <Pressable mt="$1" onPress={() => toast.close(id)}>
              <Icon as={CloseIcon} color="$black" />
            </Pressable>
          </Toast>
        )
      }
    });
  }

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
          <View width={"100%"} marginTop={12} flex={1} flexDirection='row' justifyContent='space-between' gap={12}>
            <CheckboxGroup aria-label='Checkout' value={checked} onChange={(keys) => { setChecked(keys) }}>
              <Checkbox aria-label='Checkout' value={i.id} size="md">
                <CheckboxIndicator mr="$2">
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
              </Checkbox>
            </CheckboxGroup>
            <View flexDirection='row' justifyContent='space-between' gap={12} >
              <Button size='xs' height={30} width={30} borderRadius={18}>
                <Ionicons name="add" size={14} color="white" />
              </Button>
              <Text>{i.quantity}</Text>
              <Button size='xs' height={30} width={30} borderRadius={18} id={i.id} onPress={() => remove(this.props.id)}>
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
    for (let i of detailRecipes) {
      recipes.push(
        <Card key={i.id} marginTop={18} size="lg" variant="elevated" m="$0">
          <Text bold={true}>{i.name} Recipe</Text>
          <Text>{i.price} FYC</Text>
          <View width={"100%"} marginTop={12} flex={1} flexDirection='row' justifyContent='space-between' gap={12}>
            <CheckboxGroup aria-label='Checkout' value={checked} onChange={(keys) => { setChecked(keys) }}>
              <Checkbox aria-label='Checkout' value={i.id} size="md">
                <CheckboxIndicator mr="$2">
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
              </Checkbox>
            </CheckboxGroup>
            <View flexDirection='row' justifyContent='space-between' gap={12} >
              <Button size='xs' height={30} width={30} borderRadius={18} action={"negative"} onPress={() => remove(i.id)}>
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
      <Heading size="2xl">Cart:</Heading>
      <PurchaseModalComponent />
      <FailedModalComponent />
      <ScrollView>
        {cartHeader && <CartComponent />}
        {detailRecipes && detailIngredients && detailRecipes.length <= 0 && detailIngredients.length <= 0 && <Text marginTop={48} textAlign='center'>Your cart is empty. Add more stuff plz.</Text>}
      </ScrollView>
      <View position={"absolute"} left={0} bottom={20} width={"100%"} flexDirection='row' alignItems='center' gap={12} justifyContent='center'>
        <Text bold={true} color="black" bgColor='#efefef' padding={10} borderRadius={4}>Total: {total} FYC</Text>
        <Button onPress={setPaymentModal} bgColor={total == 0 ? '#efefef' : ""} disabled={total == 0}>
          <ButtonText color={total == 0 ? 'black' : 'white'}>Checkout</ButtonText>
        </Button>
      </View>
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
