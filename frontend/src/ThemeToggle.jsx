import { useTheme } from "./ThemeContext";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            className="theme_toggle"
            onClick={toggleTheme}
        >
            {theme === "dark" ? "☀ Light Mode" : "☾ Dark Mode"}
        </button>
    );
}