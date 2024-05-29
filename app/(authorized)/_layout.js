import { Redirect, Slot, router } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';


export default function Authenticate() {
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                console.log("User Not Found")
                router.replace("/login");
            }
        });
    }, []);

    return <Slot />;
}