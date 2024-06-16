import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState, useTransition } from 'react';
import { Button, ButtonText, VStack, Box, Heading, SearchIcon, ScrollView, InputIcon, InputField, InputSlot } from "@gluestack-ui/themed"
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { LoadingProvider, useLoading } from '../../components/LoadingContext';
import { Input } from '@gluestack-ui/themed';

export default function Tab() {
    const [userData, setUserData] = useState(null);
    const [firstName, setFirstName] = useState(null);
    const { loading, setLoading } = useLoading();

    useEffect(() => {
        setLoading(true);
        const fetchSession = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                const { data } = await supabase.from("Users").select().eq("user_id", user.id);
                setUserData(user);
                setFirstName(data[0].first_name);
            } catch (error) {
                console.error('Error fetching session:', error.message);
                // Handle error if needed
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [setLoading]);

    return (
        <ScrollView>
            <VStack space="md" reversed={false} style={styles.container}>
                {userData && <Heading size="3xl">Hi, {firstName}!</Heading>}
                <Text>What do you like to eat today? (っ'ヮ'c)</Text>
                <Input width={"100%"} borderColor='#eb5834'>
                    <InputSlot pl="$3">
                        <InputIcon as={SearchIcon} />
                    </InputSlot>
                    <InputField placeholder="Search recipes" />
                </Input>
            </VStack>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
});
