import { StyleSheet, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Button, View, Text, ButtonText, VStack, Box, Heading, SearchIcon, FlatList } from "@gluestack-ui/themed"
import { ScrollView, InputIcon, InputField, InputSlot, HStack, ArrowLeftIcon, ButtonIcon } from "@gluestack-ui/themed"
import { supabase } from '../../lib/supabase';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLoading } from '../../components/LoadingContext';
import { Input } from '@gluestack-ui/themed';
import { useUser, useUserDetails } from '../../components/UserContext.js';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Tab() {
    const { user, setUser } = useUser();
    const { userDetails, setUserDetails } = useUserDetails();
    const { loading, setLoading } = useLoading();
    const [results, setResults] = useState(null);
    const [search, setSearch] = useState("");
    const [querying, setQuerying] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const blurhash = 'GDkKFwJgeoh7mIiHmJh3aGd3iPuX+U8F';
    const [firstMount, setFirstMount] = useState(true);


    function getImageURL(image) {
        const { data } = supabase
            .storage
            .from('Images')
            .getPublicUrl("Public/" + image);

        return data.publicUrl;
    }

    const Recipe = ({ name, price, vendor, image, id }) => (
        <Pressable stlye={{ flex: 1 }} onPress={() => { router.push("/recipes/" + id) }}>
            <View flex={1} maxWidth={"50%"} padding={12} justifyContent='center' textAlign='center'>
                <Image
                    style={styles.image}
                    source={getImageURL(image)}
                    placeholder={{ blurhash }}
                    contentFit="contain"
                    transition={150}

                />
                <Text textAlign='center' fontWeight={'$bold'}>{price} FYC</Text>
                <Text textAlign='center'>{name}</Text>
                <Text textAlign='center' fontWeight={'$thin'}>By {vendor}</Text>
            </View>
        </Pressable>
    );

    const fetchRecipe = async () => {
        if (search.length > 0) {
            const { data, error } = await supabase.from("Recipes").select().ilike('name', "%" + search + "%");
            setResults(data);
        } else {
            const { data, error } = await supabase.from("Recipes").select();
            setResults(data);
        }
        setQuerying(false);
    }

    useEffect(() => {
        setLoading(true);
        const fetchSession = async () => {
            if (!user || !userDetails) {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    const { data } = await supabase.from("Users").select().eq("user_id", user.id);
                    setUser(user);
                    setUserDetails(data[0]);
                } catch (error) {
                    router.replace('/login');
                } 
                
            }
            setLoading(false);
        };

        fetchSession();
    }, [setLoading]);

    useEffect(() => {
        if (firstMount) {
            setFirstMount(false);
            return;
        }
        setIsSearching(true);
        setQuerying(true);
        const delay = setTimeout(() => {
            fetchRecipe();
        }, 2000);

        return () => clearTimeout(delay);

    }, [search])

    function HomeComponent() {
        return (
            <>
                <VStack space="sm" reversed={false} style={styles.container}>
                    {userDetails && <Heading size="3xl">Hi, {userDetails.first_name}!</Heading>}
                    <Text>What would you like to eat today? (っ'ヮ'c)</Text>
                    <Input width={"100%"} borderColor='#eb5834'>
                        <InputSlot pl="$3">
                            <InputIcon as={SearchIcon} />
                        </InputSlot>
                        <InputField placeholder="Search recipes" onChangeText={setSearch} />
                    </Input>
                    <View style={styles.recommendations}>
                        <Text fontWeight={'$semibold'}>New Release!</Text>
                        <Box width={"100%"} height={150} bgColor="$blue300"></Box>
                    </View>
                    <View style={styles.recommendations}>
                        <Text fontWeight={'$semibold'}>Today's Recommendations</Text>
                        <HStack>
                            <Box width={"100%"} height={150} bgColor={"orange"}></Box>
                        </HStack>
                    </View>
                    <View style={styles.recommendations}>
                        <Text fontWeight={'$semibold'}>Upgrade Your Kitchenware!</Text>
                        <HStack>
                            <Image
                                style={{width: "100%", height: 150}}
                                source={'../../assets/advertisement.jpg'}
                                placeholder={{ blurhash }}
                                contentFit="contain"
                                transition={150}

                            />
                        </HStack>
                    </View>
                </VStack>
            </>
        );
    }

    function SkeletonComponent() {
        return (
            <>
                <View margin={10}>
                    <Skeleton count={1} height={510} />
                </View>
            </>
        );
    }

    function RecipeComponent() {
        return (
            <>
                <FlatList
                    data={results}
                    renderItem={({ item }) => <Recipe name={item.name} price={item.price} vendor={item.vendor} image={item.image} id={item.id} />}
                    keyExtractor={item => item.id}
                />
            </>
        )
    }

    function BackButton() {
        return (
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 20, justifyContent: 'center', alignItems: 'center' }} pointerEvents='box-none'>
                <Button
                    size="sm"
                    variant="solid"
                    action="primary"
                    onPress={() => setIsSearching(false)}
                    borderRadius={30}
                    bgColor='#FF6700'
                >
                    <AntDesign name="back" size={18} color="white" />
                </Button>
            </View>
        );
    }

    function ViewAllButton() {
        return (
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 20, justifyContent: 'center', alignItems: 'center' }} pointerEvents='box-none'>
                <Button
                    size="sm"
                    variant="solid"
                    action="primary"
                    bgColor='#FF6700'
                    onPress={() => {
                        setIsSearching(true);
                        if (!results)
                            fetchRecipe();
                    }}
                    borderRadius={30}
                >
                    <ButtonText color='white'>Explore All!</ButtonText>
                </Button>
            </View>
        );

    }

    function NotFoundComponent() {
        return (
            <>
                <View marginTop={32} flex={1} height={"100%"} alignItems='center' justifyContent='center' textAlign='center'>
                    <Text>No recipes matched your search ૮ ◞ ﻌ ◟ ა</Text>
                </View>
            </>
        )
    }

    function SearchComponent() {
        return (
            <>
                <VStack space="sm" reversed={false} style={styles.searchBar}>
                    <Input width={"100%"} borderColor='#eb5834'>
                        <InputSlot pl="$3">
                            <InputIcon as={SearchIcon} />
                        </InputSlot>
                        <InputField placeholder="Search recipes" autoFocus={true} value={search} onChangeText={setSearch} />
                    </Input>
                </VStack>
                {querying ? <SkeletonComponent /> : (!results || results.length == 0) ? <NotFoundComponent /> : <RecipeComponent />}
            </>
        );
    }

    return (
        <>
            <ScrollView>
                {(isSearching) ? <SearchComponent /> : <HomeComponent />}
            </ScrollView>
            {(isSearching) ? <BackButton /> : <ViewAllButton />}
        </>
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
    searchBar: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        paddingVertical: 24,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    image: {
        width: "100%",
        height: 150,
        backgroundColor: '#efefef',
        borderRadius: 5,
    },
});
