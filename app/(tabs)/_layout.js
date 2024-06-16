import { AntDesign } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function TabLayout() {
    return (
        <View style={styles.container}>
            <Tabs screenOptions={{ tabBarActiveTintColor: '#eb5834', tabBarLabel:() => {return null}, style: styles.container, headerShown: false }}>
                <Tabs.Screen
                    name="ingredients"
                    options={{
                        title: 'Ingredients',
                        tabBarIcon: ({ color }) => <AntDesign name="isv" size={24} color={color} />,
                    }}
                /> <Tabs.Screen
                    name="recipe"
                    options={{
                        title: 'Recipes',
                        tabBarIcon: ({ color }) => <AntDesign name="book" size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="home"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="cart"
                    options={{
                        title: 'Cart',
                        tabBarIcon: ({ color }) => <AntDesign name="shoppingcart" size={24} color={color} />
                    }}
                />
                <Tabs.Screen
                    name="account"
                    options={{
                        title: 'Account',
                        tabBarIcon: ({ color }) => <AntDesign name="user" size={24} color={color} />,
                    }}
                />
            </Tabs>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        backgroundColor: '#fff',
    },
});
