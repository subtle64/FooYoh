import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function TabLayout() {
    return (
        <View style = {styles.container}>
            <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', style: styles.container, headerShown: false }}>
                <Tabs.Screen
                    name="home"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="account"
                    options={{
                        title: 'Account',
                        tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
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
