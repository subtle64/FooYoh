import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Input, InputField, InputIcon, MailIcon, InputSlot, Text, View } from '@gluestack-ui/themed';
import { Icon, LockIcon, AddIcon, VStack, Image, Button, ButtonText, ButtonIcon } from "@gluestack-ui/themed"
import { useToast, Toast, ToastDescription, ToastTitle, Pressable, CloseIcon } from '@gluestack-ui/themed';
import { User } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import logoImage from '../assets/icon.png';
import { useLoading } from '../components/LoadingContext';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {loading, setLoading} = useLoading();
    const toast = useToast();

    async function validate() {
        setLoading(true);
        if (!name || !email || !password) {
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
                                    Email, password, and name cannot be empty!{"\n"}
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

        const re_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re_email.test(email)) {
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
                                    Please provide a valid email address.
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

        const re_password = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (password.length <= 8 && !re_password.test(password)) {
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
                                    The password must have a special character, uppercase and lowercase alphabets, and a number. It must also be at least 8 characters long.
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

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                }
            }
        });
        if (error) {
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
                                    {error.message}.
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
            duration: null,
            render: ({ id }) => {
                const toastId = "toast-" + id;
                return (
                    <Toast width={350} marginTop={36} nativeID={toastId} variant="accent" action="success">
                        <VStack space="xs" flex={1} >
                            <ToastTitle>Alright!</ToastTitle>
                            <ToastDescription>
                                You have successfully registered! Please login to continue.
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
        router.replace('/login');
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View>
                <VStack space="lg" reversed={false} alignItems='center'>
                    <Image source={logoImage} alt='Logo' marginBottom={18} />

                    <View>
                        <Text bold textAlign='center' fontSize={32} padding={0}>New Human!</Text>
                        <Text light textAlign='center' fontSize={24} padding={0}>Create a new account.</Text>
                    </View>

                    <Input width={300} marginTop={18}>
                        <InputField placeholder="Full Name" onChangeText={setName} />
                        <InputSlot marginHorizontal={12}>
                            <InputIcon>
                                <Icon as={User} />
                            </InputIcon>
                        </InputSlot>
                    </Input>

                    <Input width={300}>
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

                    <Button size="md" variant="solid" action="primary" marginTop={18} paddingHorizontal={48} onPress={() => validate()}>
                        <ButtonText>Register</ButtonText>
                    </Button>

                    <Link href="/login" style={{ color: '#36a8ff', textDecorationLine: 'underline' }}>Already have an account? Login instead.</Link>
                </VStack>
            </View>
        </KeyboardAvoidingView>

    );
}
