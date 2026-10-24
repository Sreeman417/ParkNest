import "./App.css";
import login_img from "./assets/user.png";
import hide from "./assets/hide.png";
import show from "./assets/show.png";
import mail from "./assets/mail.png";
import lock from "./assets/padlock.png";
import {useState} from "react";
import {Link,useNavigate} from "react-router-dom";
function Login_card() {
    const[showpass, setShowpass] = useState(false);
    const[email, setemail] = useState("");
    const [error, setError] = useState("");
    const[password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleLogin = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            const data = await response.json();
            if(data.detail == "ok"){
                setError("")
                navigate("/dashboard");
            }
            else{
                setError(data.detail);
            }
            return;
        } catch (err) {
            console.error("Network error:", err);
        }
    };

    
    return(
        <>
        

            <h1 id = "smart_parking_txt">Park Nest</h1>
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
            {error ? <h1 id = "error_txt">{error}</h1>:null}
        </>
    );
}
export default Login_card;