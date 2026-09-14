import { useState } from "react";
import "./App.css";
import "./dashboard.css";
import car_park from "./assets/car-park.png";
import user from "./assets/user_dash.png";
import car from "./assets/car.png";
import list from "./assets/list.png";
import home from "./assets/home.png";
import magnifying_glass from "./assets/magnifying-glass.png";
import add from "./assets/add.png";
import book from "./assets/book-reader.png";
import land from "./assets/land-plot.png";
import userdash from "./assets/user_dash.png";
import turnoff from "./assets/turn-off.png";
import parknest from "./assets/parknest.png";
import {Dashboard_main,FindParking,AddLand,MyBookings,MyLands,Profile,Logout} from "./activepage.jsx";



function Dashboard() {
    const[sidebar, setSidebar] = useState(false);
    const[activepage, setactivepage] = useState("dashboard");
    function toggleSidebar(){
        setSidebar(!sidebar);
    }   
    return(
        <div>

            <button className={sidebar ? "menu_btn active" : "menu_btn"} onClick={toggleSidebar}>
                <img src={list} alt="List" id="list_img" />
            </button>



            <div className={sidebar ? "sidebar active" : "sidebar"}>
                <img src = {parknest} alt = "Parknest" className = "parknest_logo"/>
                <button className="sidebar_btn" onClick={() => setactivepage("dashboard")}>
                    <img src={home} alt="Dashboard" id="dashboard_img" />
                    <span>Dashboard</span>
                </button>

                <button className="sidebar_btn" onClick={() => setactivepage("find_parking")}>
                    <img src={magnifying_glass} alt="Find Parking" id="find_parking_img" />
                    <span>Find Parking</span>
                </button>

                <button className="sidebar_btn" onClick={() => setactivepage("add_land")}>
                    <img src={add} alt="Add Land" id="add_land_img" />
                    <span>Add Land</span>
                </button>

                <button className="sidebar_btn" onClick={() => setactivepage("mybookings")}>
                    <img src={book} alt="My Bookings" id="mybookings_img" />
                    <span>My Bookings</span>
                </button>

                <button className="sidebar_btn" onClick={() => setactivepage("mylands")}>
                    <img src={land} alt="My Lands" id="mylands_img" />
                    <span>My Lands</span>
                </button>

                <button className="sidebar_btn" onClick={() => setactivepage("profile")}>
                    <img src={userdash} alt="Profile" id="profile_img" />
                    <span>Profile</span>
                </button>

                <button className="sidebar_btn logout_btn" onClick={() => setactivepage("logout")}>
                    <img src={turnoff} alt="Logout" id="logout_img" />
                    <span>Logout</span>
                </button>

            </div>
            <Carddisplayer  page = {activepage} />


        </div>
            
    );
}

function Carddisplayer(props){
    if(props.page === "dashboard"){
        return (
            <Dashboard_main/>
        );
    }
    else if(props.page === "find_parking"){
        return(
            <FindParking/>
        );
    }
    else if(props.page === "add_land"){
        return(
            <AddLand/>
        );
    }
    else if(props.page === "mybookings"){
        return(
            <MyBookings/>
        );
    }
    else if(props.page === "mylands"){
        return(
            <MyLands/>
        );
    }
    else if(props.page === "profile"){
        return(
            <Profile/>
        );
    }
    else if(props.page === "logout"){
        return(
            <Logout/>
        );
    }
} 
export default Dashboard;