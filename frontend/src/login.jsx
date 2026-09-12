import "./App.css";
import login_img from "./assets/user.png";
import hide from "./assets/hide.png";
import show from "./assets/show.png";
import mail from "./assets/mail.png";
import lock from "./assets/padlock.png";
import {useState} from "react";
import {Link} from "react-router-dom";
function Login_card() {
    /* setshowpass(of some value sets the value to showpass)*/
    const[showpass, setShowpass] = useState(false);
    const[email, setemail] = useState("");
    const[password, setPassword] = useState("");
    const handleLogin = () => {
        /*login here*/
        console.log("email: " + email);
        console.log("password: " + password);
    }
    
    return(
        <>
        

            <h1 id = "smart_parking_txt">Smart Parking</h1>
            <div className="login_card">


                <img src = {login_img} alt="Login_img" id = "login_img"></img>
                <h1 id = "login_txt">Login</h1>
                <h1 id = "wel_txt">Welcome back! Please login to your account.</h1>


                <div>
                    <input value = {email} onChange = {(e) => setemail(e.target.value)} id = "email_entry" type="email" placeholder="Email" />
                    <img src = {mail} alt="mail" id = "mail_img"></img>
                </div>


                <div className = "password_box">
                    <input value = {password} onChange = {(e) => setPassword(e.target.value)} id = "password_entry" type={showpass ? "text" : "password"} placeholder="Password" />
                    <img src = {lock} id = "lock_img"></img>
                    <button className = "eye_btn" onClick = {() => setShowpass(!showpass)}>
                        <img src = {showpass ? show : hide} alt="eye" className = "eye_img"></img>
                    </button>
                </div>


                <button id="login_btn" onClick={() => handleLogin()}>Login</button>
                <h1 id = "signup_link">Dont have an account? <Link to="/signup">Sign up</Link></h1>


            </div>

        </>
    );
}
export default Login_card;