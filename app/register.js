import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Input, InputField, InputIcon, MailIcon, InputSlot, Text, View, HStack } from '@gluestack-ui/themed';
import { Icon, LockIcon, AddIcon, VStack, Image, Button, ButtonText, ButtonIcon } from "@gluestack-ui/themed"
import { useToast, Toast, ToastDescription, ToastTitle, Pressable, CloseIcon } from '@gluestack-ui/themed';
import { User } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import logoImage from '../assets/icon.png';
import { useLoading } from '../components/LoadingContext';

export default function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loading, setLoading } = useLoading();
    const toast = useToast();

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

    async function validate() {
        setLoading(true);
        if (!firstName || !lastName || !email || !password) {
            showToast("Whoops...", "Email, password, and name cannot be empty!", "error");
            setLoading(false);
            return;
        }

        const re_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re_email.test(email)) {
            showToast("Whoops...", "Please provide a valid email address.", "error");
            setLoading(false);
            return;
        }

        const re_password = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (password.length <= 8 || !re_password.test(password)) {
            showToast("Whoops...", "The password must have a special character, uppercase and lowercase alphabets, and a number. It must also be at least 8 characters long.", "error");
            setLoading(false);
            return;
        }

        const signUpResult = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                }
            }
        });

        if ( signUpResult.error ) {
            showToast("Whoops...", signUpResult.error.message, "error");
            setLoading(false);
            return;
        }
        
        console.log(signUpResult);
        const insertResults = await supabase
            .from('Users')
            .insert([
                { email: email, first_name: firstName, last_name: lastName, user_id: signUpResult.data.user.id},
            ]);

        if (insertResults.error) {
            showToast("Whoops...", insertResults.error.message, "error");
            const revertResults = await supabase.auth.admin.deleteUser(signUpResult.data.id);
            console.log(revertResults.error.message);
            setLoading(false);
            return;
        }

        showToast("Alright!", "You have successfully registered! Please login to continue.", "success");
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

                    <View flex={1} flexDirection='row' gap={10} alignItems={"center"} marginTop={18}>
                        <Input width={145}>
                            <InputField placeholder="First Name" onChangeText={setFirstName} />
                            <InputSlot marginHorizontal={12}>
                                <InputIcon>
                                    <Icon as={User} />
                                </InputIcon>
                            </InputSlot>
                        </Input>

                        <Input width={145}>
                            <InputField placeholder="Last Name" onChangeText={setLastName} />
                            <InputSlot marginHorizontal={12}>
                                <InputIcon>
                                    <Icon as={User} />
                                </InputIcon>
                            </InputSlot>
                        </Input>
                    </View>

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
