import { StyleSheet } from 'react-native';
import { useEffect, useState, useTransition } from 'react';
import { Button, View, Text, ButtonText, VStack, Box, Heading, SearchIcon, ScrollView, InputIcon, InputField, InputSlot, HStack } from "@gluestack-ui/themed"
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { useLoading } from '../../components/LoadingContext';
import { Input } from '@gluestack-ui/themed';
import { useUser, useUserDetails } from '../../components/UserContext.js';

export default function Tab() {
    const { user, setUser } = useUser();
    const { userDetails, setUserDetails } = useUserDetails();
    const { loading, setLoading } = useLoading();

    useEffect(() => {
        setLoading(true);
        const fetchSession = async () => {
            if (!user  || !userDetails) {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    const { data } = await supabase.from("Users").select().eq("user_id", user.id);
                    setUser(user);
                    setUserDetails(data[0]);
                } catch (error) {
                    console.error('Error fetching session:', error.message);
                    // Handle error if needed
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchSession();
    }, [setLoading]);

    return (
        <ScrollView>
            <VStack space="sm" reversed={false} style={styles.container}>
                {userDetails && <Heading size="3xl">Hi, {userDetails.first_name}!</Heading>}
                <Text>What would you like to eat today? (っ'ヮ'c)</Text>
                <Input width={"100%"} borderColor='#eb5834'>
                    <InputSlot pl="$3">
                        <InputIcon as={SearchIcon} />
                    </InputSlot>
                    <InputField placeholder="Search recipes" />
                </Input>
                <View style={styles.recommendations}>
                    <Text fontWeight={'$semibold'}>New Release!</Text>
                    <Box width={"100%"} height={150} bgColor="$blue300"></Box>
                </View>
                <View style={styles.recommendations}>
                    <Text fontWeight={'$semibold'}>Our Recommendations</Text>
                    <HStack>
                        <Box width={"100%"} height={150} bgColor={"orange"}></Box>
                    </HStack>
                </View>
                <View style={styles.recommendations}>
                    <Text fontWeight={'$semibold'}>Discover Delicacies</Text>
                    <HStack>
                        <Box width={"100%"} height={500} bgColor={"orange"}></Box>
                    </HStack>
                </View>
            </VStack>
            <View width={"100%"} marginVertical={12} paddingHorizontal={12} justifyContent='center' alignItems='center' textAlign='center'>
                <Text textAlign='center'>You've reached the end of our recommendations! ( •̯́ ^ •̯̀)</Text>
            </View>
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
        borderRadius: 12,
    },
    recommendations: {
        flex: 1,
        flexBasis: 'auto',
        width: "100%",
        gap: 8,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#808080",
        borderStyle: 'dashed',
        padding: 8,
    },
});
