import React, { useState } from 'react'
import { Link } from 'expo-router'
import { Input, InputField, InputIcon, MailIcon, InputSlot, Text, View } from '@gluestack-ui/themed';
import { Icon, LockIcon, AddIcon, VStack, Image, Button, ButtonText, ButtonIcon } from "@gluestack-ui/themed"
import { User } from 'lucide-react-native';
import logoImage from '../assets/icon.png';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    return (
        <View>
            <VStack space="lg" reversed={false} alignItems='center'>
                <Image source={logoImage} alt='Logo' marginBottom={18} />

                <View>
                    <Text bold textAlign='center' fontSize={32} padding={0}>New Human!</Text>
                    <Text light textAlign='center' fontSize={24} padding={0}>Create a new account.</Text>
                </View>

                <Input width={300} marginTop={18}>
                    <InputField placeholder="Full Name" />
                    <InputSlot marginHorizontal={12}>
                        <InputIcon>
                            <Icon as={User} size="md" />
                        </InputIcon>
                    </InputSlot>
                </Input>

                <Input width={300}>
                    <InputField placeholder="Email" />
                    <InputSlot marginHorizontal={12}>
                        <InputIcon>
                            <Icon as={MailIcon} size="md" />
                        </InputIcon>
                    </InputSlot>
                </Input>

                <Input width={300}>
                    <InputField placeholder="Password" type='password' />
                    <InputSlot marginHorizontal={12}>
                        <InputIcon>
                            <Icon as={LockIcon} />
                        </InputIcon>
                    </InputSlot>
                </Input>

                <Button size="md" variant="solid" action="primary" marginTop={18} paddingHorizontal={48}>
                    <ButtonText>Register</ButtonText>
                </Button>

                <Link href="/login" style = {{color: '#36a8ff', textDecorationLine: 'underline'}}>Already have an account? Login instead.</Link>
            </VStack>
        </View>
    );
}
