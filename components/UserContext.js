import { createContext, useContext, useState } from 'react';

const UserContext = createContext({
    user: null,
    setUser: null,
});

const UserDetailsContext = createContext({
    userDetails: null,
    setUserDetails: null,
});

const CartChangedContext = createContext({
    cartChanged: null,
    setCartChanged: null,
})

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [cartChanged, setCartChanged] = useState(false);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <UserDetailsContext.Provider value={{ userDetails, setUserDetails }} >
                <CartChangedContext.Provider value={{ cartChanged, setCartChanged }}>
                    {children}
                </CartChangedContext.Provider>
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

export function useCartChanged() {
    const context = useContext(CartChangedContext);
    if (!context) {
        throw new Error("useCartChanged must be used within CartChangedContext!");
    }
    return context;
}