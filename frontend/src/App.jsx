
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login_card from "./login.jsx";
import Signup_card from "./sign_up.jsx";
import Dashboard from "./dashboard.jsx";
import ThemeToggle from "./ThemeToggle";
import ThemeProvider from "./ThemeContext";
import mail from "./assets/mail.png";

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <title>Park Nest</title>
                <link rel="icon" type="image/svg+xml" href={mail} />

                <div className="fixed right-6 top-5 z-50">
                    <ThemeToggle />
                </div>

                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login_card />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/signup" element={<Signup_card />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
