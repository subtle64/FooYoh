import { StyleSheet } from 'react-native';
import { View, Text, Button, ButtonText, Heading, Avatar, HStack, Divider, ButtonIcon, Modal, ModalContent, ModalBackdrop, ModalHeader, ModalBody, ModalCloseButton, Toast, ToastDescription, useToast, Pressable, AvatarFallbackText } from "@gluestack-ui/themed"
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { LoadingProvider, useLoading } from '../../components/LoadingContext';
import { useUser, useUserDetails } from '../../components/UserContext';
import { Card } from '@gluestack-ui/themed';
import { FontAwesome6 } from '@expo/vector-icons';
import { ModalFooter } from '@gluestack-ui/themed';
import { Icon } from '@gluestack-ui/themed';
import { CloseIcon } from '@gluestack-ui/themed';
import { VStack } from '@gluestack-ui/themed';
import { ToastTitle } from '@gluestack-ui/themed';

export default function Tab() {
  const { loading, setLoading } = useLoading();
  const { user, setUser } = useUser();
  const { userDetails, setUserDetails } = useUserDetails();
  const [modal, setModal] = useState(false);
  const [fyc, setFYC] = useState(0);
  const [rp, setRP] = useState(0);
  const ref = React.useRef(null);
  const toast = useToast();

  async function logout() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    console.log(error);
    setLoading(false);
    router.replace("/login");
  }

  async function purchase() {
    setLoading(true);
    const { error } = await supabase
      .from('Users')
      .update({ fyc: userDetails.fyc + fyc })
      .eq('user_id', user.id)
    const { data } = await supabase.from("Users").select().eq("user_id", user.id);
    setUserDetails(data[0]);
    setLoading(false);
    showToast("Purchase Success!", "Your purchase of " + fyc + " FYC is successful. Thank Yoh!", "success")
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

  function preparePurchase(fyc, rp) {
    setFYC(fyc);
    setRP(rp);
    setModal(true);
  }

  function ModalComponent() {
    return (
      <Modal
        isOpen={modal}
        onClose={() => {
          setModal(false)
        }}
        finalFocusRef={ref}
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
              Are you sure you want to pay Rp{rp} to purchase {fyc} FYC?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              action="secondary"
              mr="$3"
              onPress={() => {
                setModal(false)
              }}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              action="positive"
              borderWidth="$0"
              onPress={() => {
                setModal(false)
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

  function TopupComponent() {
    return (
      <>
        <Card size="md" variant="elevated" m="$1" maxWidth={330}>
          <Heading marginBottom={12} textAlign='center' fontWeight={'$thin'}>Quick Top-Up</Heading>
          <View flexDirection='row' gap={12} flexWrap='wrap' justifyContent='center'>
            <Button action="positive" width={"45%"} height={60} onPress={() => preparePurchase(5, 49000)}>
              <FontAwesome6 name="money-bill" size={14} color="white" />
              <ButtonText marginLeft={10} marginBottom={1}>5 FYC Rp49.000</ButtonText>
            </Button>
            <Button action="positive" width={"45%"} height={60} onPress={() => preparePurchase(10, 89000)}>
              <FontAwesome6 name="money-bill" size={14} color="white" />
              <ButtonText marginLeft={10} marginBottom={1}>10 FYC 89.000</ButtonText>
            </Button>
            <Button action="positive" width={"45%"} height={60} onPress={() => preparePurchase(15, 139000)}>
              <FontAwesome6 name="money-bill" size={14} color="white" />
              <ButtonText marginLeft={10} marginBottom={1}>15 FYC Rp139.000</ButtonText>
            </Button>
            <Button action="positive" width={"45%"} height={60} onPress={() => preparePurchase(50, 439000)}>
              <FontAwesome6 name="money-bill" size={14} color="white" />
              <ButtonText marginLeft={10} marginBottom={1}>50 FYC 439.000</ButtonText>
            </Button>
            <Button action="positive" width={"45%"} height={60} onPress={() => preparePurchase(100, 829000)}>
              <FontAwesome6 name="money-bill" size={14} color="white" />
              <ButtonText marginLeft={10} marginBottom={1}>100 FYC 829.000</ButtonText>
            </Button>
            <Button action="positive" width={"45%"} height={60} onPress={() => preparePurchase(500, 1299000)}>
              <FontAwesome6 name="money-bill" size={14} color="white" />
              <ButtonText marginLeft={12} marginBottom={1}>500 FYC Rp1.299.000</ButtonText>
            </Button>
          </View>
        </Card>
      </>
    )
  }

  return (
    <View style={styles.container}>
      <ModalComponent />
      <Card size="md" variant="elevated" m="$1" width={"100%"}>
        <HStack columnGap={12} alignItems='center'>
          <View>
            <Heading>{userDetails.first_name + ' ' + userDetails.last_name}</Heading>
            <Text size='xs'>{"ID: " + userDetails.user_id}</Text>
            <Text size='xs'>Joined: {userDetails.created_at.slice(0, 10)}</Text>
            <Divider marginVertical={12} />
            <View justifyContent='center' alignItems='center' borderWidth={1} bgColor='white' padding={8} borderRadius={12} flexDirection='row'>
              <FontAwesome6 name="money-bill" size={16} color="black" /><Text marginBottom={2} marginLeft={6}  fontWeight={'$bold'}>Balance: {userDetails.fyc} FYC</Text>
            </View>
          </View>
          <Avatar bgColor="$amber600" size="md" borderRadius="$full">
            <AvatarFallbackText>{userDetails.first_name + ' ' + userDetails.last_name}</AvatarFallbackText>
          </Avatar>
        </HStack>
      </Card>
      <TopupComponent />
      <Button maxWidth={"90%"} onPress={() => logout()} action="negative">
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
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
