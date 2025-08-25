import { useState, useEffect, createContext, useContext } from "react";

export const DeviceContext = createContext();

export function DeviceProvider({ children }) {
    const [deviceSize, setDeviceSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [isMobile, setIsMobile] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);

    const MOBILE_WIDTH = 768;

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            setDeviceSize({
                width,
                height,
            });

            setIsMobile(width < MOBILE_WIDTH || height < MOBILE_WIDTH);
            setIsLandscape(width > height);
        };

        window.addEventListener("resize", handleResize);

        // Initial setup
        const width = window.innerWidth;
        const height = window.innerHeight;
        setIsMobile(width < MOBILE_WIDTH || height < MOBILE_WIDTH);
        setIsLandscape(width > height);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <DeviceContext.Provider value={{ deviceSize, isMobile, isLandscape }}>
            {children}
        </DeviceContext.Provider>
    );
}

export function useDevice() {
    return useContext(DeviceContext);
}