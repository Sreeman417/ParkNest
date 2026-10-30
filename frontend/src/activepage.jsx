
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResetPageScroll from "./activepagecomps/resetPageScroll.jsx";

import FindParking from "./activepagecomps/findparking.jsx";
import Dashboard_main from "./activepagecomps/dashboard_main.jsx";
import MyBookings from "./activepagecomps/mybookings.jsx";
import AddLand from "./activepagecomps/addland.jsx";
import MyLands from "./activepagecomps/mylands.jsx";
import Profile from "./activepagecomps/profile.jsx";

function Carddisp({ page }) {
    const navigate = useNavigate();

    useEffect(() => {
        ResetPageScroll();
    }, [page]);

    if (page === "dashboard") {
        return <Dashboard_main setactivepage={value => navigate(`/dashboard/${value === "dashboard" ? "" : value === "add_land" ? "addland" : value === "find_parking" ? "findparking" : value}`)} />;
    }

    if (page === "findparking") {
        return <FindParking />;
    }

    if (page === "addland") {
        return <AddLand setactivepage={value => navigate(`/dashboard/${value === "mylands" ? "mylands" : value}`)} />;
    }

    if (page === "mybookings") {
        return <MyBookings />;
    }

    if (page === "mylands") {
        return <MyLands />;
    }

    if (page === "profile") {
        return <Profile />;
    }

    return null;
}

export default Carddisp;
