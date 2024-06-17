import { createContext, useContext, useState } from 'react';

const UserContext = createContext({
    user: null,
    setUser: null,
});

const UserDetailsContext = createContext({
    userDetails: null,
    setUserDetails: null,
})

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const value = { user, setUser };
    return (
        <UserContext.Provider value={{ user, setUser }}>
            <UserDetailsContext.Provider value={{ userDetails, setUserDetails }} >
                {children}
            </UserDetailsContext.Provider>
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within UserContext!");
    }
    return context;
}

export function useUserDetails() {
    const context = useContext(UserDetailsContext);
    if (!context) {
        throw new Error("useUserDetails must be used within UserDetailsContext!");
    }
    return context;
}