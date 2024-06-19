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
    const [recipe, setRecipe] = useState(null);
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

    const Ingredient = ({ name, id }) => (
        <>
            <Text>{name}</Text>
        </>
    );

    const Allergies = ({ name }) => (
        <>
            <Text>{name}</Text>
        </>
    );

    async function addCart() {
        if (isInCart) {
            return;
        }
        setLoading(true);
        const cartHeader = await supabase.from("CartHeader").select().eq("user_id", user.id);
        const cartDetails = await supabase
            .from('CartDetails')
            .insert([
                { cart_header_id: cartHeader.data[0].id, recipe_id: recipe.id, quantity: 1 },
            ]);
        showToast("Recipe Added!", "Recipe added to cart successfully.", "success");
        setIsInCart(true);
        setCartChanged(true);
        setLoading(false);
    }

    async function purchase() {
        setLoading(true);
        if (userDetails.fyc < recipe.price) {
            setFailedModal(true);
        } else {
            const { error } = await supabase
                .from('Users')
                .update({ fyc: userDetails.fyc - recipe.price })
                .eq('user_id', user.id);
            const { data } = await supabase.from("Users").select().eq("user_id", user.id);
            const purchasedHeader = await supabase.from("PurchasedHeader").select().eq("user_id", user.id);
            const purchaseDetails = await supabase
                .from('PurchasedDetails')
                .insert([
                    { purchased_header_id: purchasedHeader.data[0].id, recipe_id: recipe.id, quantity: 1, status: "Complete" },
                ]);

            const cartHeaderResult = await supabase.from("CartHeader").select().eq("user_id", user.id);
            const cartDetails = await supabase.from("CartDetails").select().eq("cart_header_id", cartHeaderResult.data[0].id).eq('recipe_id', recipe.id);

            if (cartDetails) {
                const response = await supabase
                    .from('CartDetails')
                    .delete()
                    .eq("cart_header_id", cartHeaderResult.data[0].id)
                    .eq('recipe_id', recipe.id);
                setCartChanged(true);
            }

            showToast("Recipe Obtained!", "You have successfully purchased this recipe. Foo-Yoh!", "success");
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
                            Are you sure you want to pay {recipe.price} FYC to obtain this item?
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
        const fetchRecipe = async () => {
            setLoading(true);
            const recipeResult = await supabase.from("Recipes").select().eq("id", id);
            setRecipe(recipeResult.data[0]);
            setImageURL(getImageURL(recipeResult.data[0].image));

            const purchasedHeader = await supabase.from("PurchasedHeader").select().eq("user_id", user.id);
            const purchasedDetails = await supabase.from("PurchasedDetails").select('*', { count: 'exact', head: true }).eq("purchased_header_id", purchasedHeader.data[0].id).eq("recipe_id", recipeResult.data[0].id);

            const cartHeader = await supabase.from("CartHeader").select().eq("user_id", user.id);
            const cartDetails = await supabase.from("CartDetails").select('*', { count: 'exact', head: true }).eq("cart_header_id", cartHeader.data[0].id).eq("recipe_id", recipeResult.data[0].id);

            setIsPurchased(purchasedDetails.count ? true : false);
            setIsInCart(cartDetails.count ? true : false);
            setLoading(false);
        }

        console.log(isPurchased);
        fetchRecipe();
    }, [setRecipe, cartChanged, id]);

    function IngredientsList() {
        const ingredients = [];
        for (let i of recipe.ingredients) {
            ingredients.push(
                <Text key={"ingredient" + i.id}>{i.name}</Text>
            )
        }
        return ingredients;
    }

    function AllergiesList() {
        const allergies = [];
        for (let i of recipe.allergies) {
            allergies.push(
                <Text key={"allergy" + i.id}>{i.name}</Text>
            )
        }
        return allergies;
    }

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

    function PleasePurchaseComponent() {
        return (
            <View>
                <Text>Unfortunately, this recipe is not free... please purchase to unlock its contents!</Text>
            </View>
        )
    }

    function RecipeDetailComponent() {
        const steps = [];
        for (let i of recipe.steps) {
            steps.push(
                <Card width={"100%"} key={"step" + i.step} size="lg" variant={"elevated"} margin={'$1'}>
                    <Text bold={true}>Step {i.step}</Text>
                    <Text>{i.description}</Text>
                </Card>
            )
        }
        return steps;
    }

    function AlreadyPurchasedButtons() {
        return (
            <View width={"100%"} position={"absolute"} flexDirection='row' gap={12} bottom={0} justifyContent='center' alignItems='center' marginBottom={18}>
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
            </View>
        );
    }

    function BannerComponent() {
        return (
            <View position='absolute' width={200} borderTopLeftRadius={4} borderBottomRightRadius={8} top={36} zIndex={99} bgColor='orange'>
                <Text bold={true} color='black' marginLeft={8}>Added to your recipes</Text>
            </View>
        );
    }

    function RootRecipeComponent() {
        return (
            <>
                <FailedModalComponent />
                <PurchaseModalComponent />
                <ScrollView contentContainerStyle={styles.container}>
                    {isPurchased && <BannerComponent />}
                    <Image
                        style={styles.image}
                        source={imageURL}
                        placeholder={{ blurhash }}
                        contentFit="contain"
                        transition={15}
                    />
                    <Heading marginTop={18}>{recipe.name} <Text fontWeight={'$thin'}>by {recipe.vendor}</Text></Heading>
                    <Text fontWeight={'$light'} textAlign='justify'>{recipe.description}</Text>
                    <Divider my={"$0.5"} marginVertical={18} />
                    <View flex={1} rowGap={12} flexWrap='wrap' width={"100%"} flexDirection='row'>
                        <View width={"40%"}>
                            <Text bold={true}>Difficulty:</Text>
                        </View>
                        <View width={"60%"}>
                            <Text>{recipe.difficulty}</Text>
                        </View>
                        <View width={"40%"}>
                            <Text bold={true}>Time Needed:</Text>
                        </View>
                        <View width={"60%"}>
                            <Text>{recipe.time_needed}</Text>
                        </View>
                        <View width={"40%"}>
                            <Text bold={true}>Total Calories:</Text>
                        </View>
                        <View width={"60%"}>
                            <Text>{recipe.calories}cal</Text>
                        </View>
                        <View width={"40%"}>
                            <Text bold={true}>Ingredients:</Text>
                        </View>
                        <View width={"60%"}>
                            <IngredientsList />
                        </View>
                        <View width={"40%"}>
                            <Text bold={true}>Allergies:</Text>
                        </View>
                        <View width={"60%"}>
                            <AllergiesList />
                        </View>
                    </View>
                    <Divider my={"$0.5"} marginVertical={18} />
                    {!isPurchased ? <PleasePurchaseComponent /> : <RecipeDetailComponent />}
                </ScrollView>
                {!isPurchased ? <PurchaseButtons /> : <AlreadyPurchasedButtons />}

            </>
        )
    }

    return (
        !loading && recipe && <RootRecipeComponent />
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

