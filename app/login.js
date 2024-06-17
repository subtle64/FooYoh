import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router'
import { Input, InputField, InputIcon, InputSlot, Text, View, Toast, useToast, SelectPortal } from '@gluestack-ui/themed';
import { Icon, LockIcon, MailIcon, VStack, Image, Button, ButtonText } from "@gluestack-ui/themed"
import { ToastDescription, ToastTitle, CloseIcon, Pressable } from '@gluestack-ui/themed';
import { supabase } from '../lib/supabase';
import logoImage from '../assets/icon.png';
import { useLoading } from '../components/LoadingContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {loading, setLoading} = useLoading();
    const toast = useToast();

    async function login() {
        setLoading(true);
        if (!email || !password) {
            toast.show({
                placement: "top",
                duration: null,
                render: ({ id }) => {
                    const toastId = "toast-" + id;
                    return (
                        <Toast width={350} marginTop={36} nativeID={toastId} variant="accent" action="error">
                            <VStack space="xs" flex={1} >
                                <ToastTitle>Whoops...</ToastTitle>
                                <ToastDescription>
                                    Your password and email cannot be empty!{"\n"}
                                    We can't read your mind directly, as we respect your privacy.
                                </ToastDescription>
                            </VStack>
                            <Pressable mt="$1" onPress={() => toast.close(id)}>
                                <Icon as={CloseIcon} color="$black" />
                            </Pressable>
                        </Toast>
                    )
                }
            });
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            toast.show({
                placement: "top",
                duration: null,
                render: ({ id }) => {
                    const toastId = "toast-" + id;
                    return (
                        <Toast width={350} marginTop={36} nativeID={toastId} variant="accent" action="error">
                            <VStack space="xs" flex={1}>
                                <ToastTitle>Whoops...</ToastTitle>
                                <ToastDescription>
                                    {error.message}!{"\n"}
                                    Have you made an account already?
                                </ToastDescription>
                            </VStack>
                            <Pressable mt="$1" onPress={() => toast.close(id)}>
                                <Icon as={CloseIcon} color="$black" />
                            </Pressable>
                        </Toast>
                    )
                }
            });
            setLoading(false);
            return;
        }

        toast.show({
            placement: "top",
            render: ({ id }) => {
                const toastId = "toast-" + id;
                return (
                    <Toast width={350} marginTop={36} nativeID={toastId} variant="accent" action="success">
                        <VStack space="xs" flex={1} >
                            <ToastTitle>Welcome!</ToastTitle>
                            <ToastDescription>
                                Successfully logged in!
                            </ToastDescription>
                        </VStack>
                        <Pressable mt="$1" onPress={() => toast.close(id)}>
                            <Icon as={CloseIcon} color="$black" />
                        </Pressable>
                    </Toast>
                )
            }
        });

        setLoading(false);
        router.replace("/home");
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View flex = {1} justifyContent='center' alignItems='center'>
                <VStack space="lg" reversed={false} alignItems='center'>
                    <Image source={logoImage} alt='Logo' marginBottom={18} />

                    <View>
                        <Text bold textAlign='center' fontSize={32} padding={0}>Welcome!</Text>
                        <Text light textAlign='center' fontSize={24} padding={0}>Please login into your account.</Text>
                    </View>

                    <Input width={300} marginTop={18}>
                        <InputField placeholder="Email" onChangeText={setEmail} />
                        <InputSlot marginHorizontal={12}>
                            <InputIcon>
                                <Icon as={MailIcon} />
                            </InputIcon>
                        </InputSlot>
                    </Input>

                    <Input width={300}>
                        <InputField placeholder="Password" type='password' onChangeText={setPassword} />
                        <InputSlot marginHorizontal={12}>
                            <InputIcon>
                                <Icon as={LockIcon} />
                            </InputIcon>
                        </InputSlot>
                    </Input>

                    <Button variant="solid" action="primary" marginTop={18} paddingHorizontal={48} onPress={() => { login() }}>
                        <ButtonText>Login </ButtonText>
                    </Button>

                    <Link href="/register" style={{ color: '#36a8ff', textDecorationLine: 'underline' }}>Don't have an account? Register now!</Link>
                </VStack>
            </View>
        </KeyboardAvoidingView>
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
