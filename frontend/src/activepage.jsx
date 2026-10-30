import "./activepage.css";
import { useEffect, useState } from "react";
import ResetPageScroll from "./activepagecomps/resetPageScroll.jsx";


import FindParking from "./activepagecomps/findparking.jsx";

import Dashboard_main from "./activepagecomps/dashboard_main.jsx";

import MyBookings from "./activepagecomps/mybookings.jsx";

import AddLand from "./activepagecomps/addland.jsx"; 

import MyLands from "./activepagecomps/mylands.jsx";

import Profile from "./activepagecomps/profile.jsx";

import Logout from "./activepagecomps/logout.jsx";

function Carddisp(props) {
    useEffect(() => {
        ResetPageScroll();
    }, [props.page]);

    if (props.page === "dashboard") {
        return <Dashboard_main setactivepage={props.setactivepage} name={props.name} />;
    }

    if (props.page === "find_parking") {
        return <FindParking />;
    }

    if (props.page === "add_land") {
        return <AddLand setactivepage={props.setactivepage} />;
    }

    if (props.page === "mybookings") {
        return <MyBookings />;
    }

    if (props.page === "mylands") {
        return <MyLands />;
    }

    if (props.page === "profile") {
        return <Profile name={props.name} />;
    }

    if (props.page === "logout") {
        return <Logout />;
    }

    return null;
}

export default Carddisp;
