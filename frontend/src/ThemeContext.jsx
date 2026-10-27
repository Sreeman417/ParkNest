
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("parknest-theme") || "dark";
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("parknest-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(current => current === "dark" ? "light" : "dark");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

export default ThemeProvider;