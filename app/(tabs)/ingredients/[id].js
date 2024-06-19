import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, Pressable } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { Image } from 'expo-image';
import { useLoading } from '../../../components/LoadingContext';
import { useCartChanged, useUser, useUserDetails } from '../../../components/UserContext.js';
import { View, Text, Heading, ScrollView, Divider, Button, ButtonText, HStack, ModalBackdrop, ModalHeader, ModalBody, CloseIcon, useToast, Toast, Card } from '@gluestack-ui/themed';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { Modal } from '@gluestack-ui/themed';
import { ModalContent } from '@gluestack-ui/themed';
import { ModalCloseButton } from '@gluestack-ui/themed';
import { ModalFooter } from '@gluestack-ui/themed';
import { Icon } from '@gluestack-ui/themed';
import { VStack } from '@gluestack-ui/themed';
import { ToastDescription, ToastTitle } from '@gluestack-ui/themed';


export default function DetailsScreen() {
    const toast = useToast();
    const { id } = useLocalSearchParams();
    const [ingredient, setIngredient] = useState(null);
    const [paymentModal, setPaymentModal] = useState(false);
    const [failedModal, setFailedModal] = useState(false);
    const { loading, setLoading } = useLoading();
    const [isPurchased, setIsPurchased] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const { user, setUser } = useUser();
    const { cartChanged, setCartChanged } = useCartChanged();
    const { userDetails, setUserDetails } = useUserDetails();
    const [imageURL, setImageURL] = useState(null);
    const blurhash = 'GDkKFwJgeoh7mIiHmJh3aGd3iPuX+U8F';
    const purchaseRef = React.useRef(null);
    const failedRef = React.useRef(null);

    async function addCart() {
        if (isInCart) {
            return;
        }
        setLoading(true);
        const cartHeader = await supabase.from("CartHeader").select().eq("user_id", user.id);
        const cartDetails = await supabase
            .from('CartDetails')
            .insert([
                { cart_header_id: cartHeader.data[0].id, ingredients_id: ingredient.id, quantity: 1 },
            ]);
        showToast("Ingredient Added!", "Ingredient added to cart successfully.", "success");
        setIsInCart(true);
        setCartChanged(true);
        setLoading(false);
    }

    async function purchase() {
        setLoading(true);
        if (userDetails.fyc < ingredient.price) {
            setFailedModal(true);
        } else {
            const { error } = await supabase
                .from('Users')
                .update({ fyc: userDetails.fyc - ingredient.price })
                .eq('user_id', user.id);
            const { data } = await supabase.from("Users").select().eq("user_id", user.id);
            const purchasedHeader = await supabase.from("PurchasedHeader").select().eq("user_id", user.id);
            const purchaseDetails = await supabase
                .from('PurchasedDetails')
                .insert([
                    { purchased_header_id: purchasedHeader.data[0].id, ingredient_id: ingredient.id, quantity: 1, status: "Processing" },
                ]);

            const cartHeaderResult = await supabase.from("CartHeader").select().eq("user_id", user.id);
            const cartDetails = await supabase.from("CartDetails").select().eq("cart_header_id", cartHeaderResult.data[0].id).eq('ingredients_id', ingredient.id);

            if (cartDetails) {
                const response = await supabase
                    .from('CartDetails')
                    .delete()
                    .eq("cart_header_id", cartHeaderResult.data[0].id)
                    .eq('ingredient_id', ingredient.id);
                setCartChanged(true);
            }

            showToast("Ingredient Obtained!", "You have successfully purchased this ingredient. Please wait until delivery comes!", "success");
            setUserDetails(data[0]);
            setIsPurchased(true);
        }
        setLoading(false);
    }

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
                            Are you sure you want to pay {ingredient.price} FYC to obtain this item?
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
                                purchase()
                            }}
                        >
                            <ButtonText>Purchase</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    }

    function getImageURL(image) {
        const { data } = supabase
            .storage
            .from('Images')
            .getPublicUrl("Public/" + image);

        return data.publicUrl;
    }

    useEffect(() => {
        const fetchIngredient = async () => {
            setLoading(true);
            const ingredientResult = await supabase.from("Ingredients").select().eq("id", id);
            setIngredient(ingredientResult.data[0]);
            setImageURL(getImageURL(ingredientResult.data[0].image));

            const cartHeader = await supabase.from("CartHeader").select().eq("user_id", user.id);
            const cartDetails = await supabase.from("CartDetails").select('*', { count: 'exact', head: true }).eq("cart_header_id", cartHeader.data[0].id).eq("ingredients_id", ingredientResult.data[0].id);

            setIsInCart(cartDetails.count ? true : false);
            setLoading(false);
        }

        console.log(isPurchased);
        fetchIngredient();
    }, [setIngredient, cartChanged]);

    function PurchaseButtons() {
        return (
            <View position='absolute' bottom={0} flexDirection='row' marginBottom={18} width={"100%"} justifyContent='center' gap={12} style={{ backgroundColor: 'transparent' }}>
                <Button size="sm" borderRadius={32} bgColor='#FF6700' onPress={setPaymentModal}>
                    <ButtonText>Purchase</ButtonText>
                </Button>
                <Button
                    size="sm"
                    variant="solid"
                    action="primary"
                    onPress={() => router.replace("/home")}
                    borderRadius={30}
                    bgColor='white'
                >
                    <AntDesign name="back" size={18} color="black" />
                </Button>
                <Button size="sm" borderRadius={32} bgColor={isInCart ? 'gray' : '#FF6700'} onPress={() => { addCart(); }} disabled={isInCart}>
                    <ButtonText>{isInCart ? "Added ✓" : "Add Cart"}</ButtonText>
                </Button>
            </View>
        );
    }

    function RootIngredientComponent() {
        return (
            <>
                <FailedModalComponent />
                <PurchaseModalComponent />
                <ScrollView contentContainerStyle={styles.container}>
                    <Image
                        style={styles.image}
                        source={imageURL}
                        placeholder={{ blurhash }}
                        contentFit="contain"
                        transition={15}
                    />
                    <Heading marginTop={18}>{ingredient.name} <Text fontWeight={'$thin'}> {ingredient.unit}</Text></Heading>
                    <Text fontWeight={'$light'} textAlign='justify'>{ingredient.description}</Text>
                    <Divider my={"$0.5"} marginVertical={18} />
                </ScrollView>
                <PurchaseButtons />
            </>
        )
    }

    return (
        ingredient && <RootIngredientComponent />
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 36,
        paddingBottom: 72,
        paddingHorizontal: 32,
    },
    image: {
        width: 200,
        height: 200,
        backgroundColor: '#efefef',
        borderRadius: 5,
    },
    list: {

    }
});

