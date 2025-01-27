import { createContext, useState } from "react";



export const IsLoadingContext = createContext(null);
export const SetIsLoadingContext = createContext(null);


export function IsLoadingProvider({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    return (
        <IsLoadingContext.Provider value={isLoading}>
            <SetIsLoadingContext.Provider value={setIsLoading}>
                {children}
            </SetIsLoadingContext.Provider>
        </IsLoadingContext.Provider>
    )
}