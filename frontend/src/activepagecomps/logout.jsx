
import { useNavigate } from "react-router-dom";
import turnoff from "../assets/turn-off.png";
import "../activepage.css";

function Logout({ setactivepage }) {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
    }

    return (
        <div className="page_shell logout_page">
            <div className="logout_card">
                <div className="logout_icon_box">
                    <img src={turnoff} alt="Logout" />
                </div>

                <span className="logout_eyebrow">PARKNEST ACCOUNT</span>

                <h1>Leaving so soon?</h1>

                <p>
                    Are you sure you want to log out?
                    Your parking activities and account details will be
                    waiting for you when you return.
                </p>

                <div className="logout_actions">
                    <button
                        className="logout_cancel"
                        onClick={() => setactivepage("dashboard")}
                    >
                        Stay logged in
                    </button>

                    <button
                        className="logout_confirm"
                        onClick={handleLogout}
                    >
                        <img src={turnoff} alt="" />
                        Log out
                    </button>
                </div>

                <span className="logout_footer">
                    Thank you for choosing ParkNest
                </span>
            </div>
        </div>
    );
}

export default Logout;
