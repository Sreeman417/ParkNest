import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login_card from "./login.jsx";
import Signup_card from "./sign_up.jsx";
import Dashboard from "./dashboard.jsx";
import ThemeToggle from "./ThemeToggle";
import ThemeProvider from "./ThemeContext";
import mail from "./assets/mail.png";
import Carddisp from "./activepage.jsx";
import BookParking from "./activepagecomps/bookparking.jsx";

function ProtectedRoute() {
    const token = localStorage.getItem("token");
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}

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
                    <Route path="/login" element={<Login_card />} />
                    <Route path="/signup" element={<Signup_card />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />}>
                            <Route index element={<Carddisp page="dashboard" />} />
                            <Route path="profile" element={<Carddisp page="profile" />} />
                            <Route path="mylands" element={<Carddisp page="mylands" />} />
                            <Route path="addland" element={<Carddisp page="addland" />} />
                            <Route path="mybookings" element={<Carddisp page="mybookings" />} />
                            <Route path="findparking" element={<Carddisp page="findparking" />} />
                            <Route path="bookparking" element={<BookParking />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;