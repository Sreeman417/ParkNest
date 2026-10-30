
import "../activepage.css";
import "../assets/user_dash.png";
import { useEffect, useState } from "react";
import userdash from "../assets/user_dash.png";

function Profile({ name = "" }) {
    const [profile, setProfile] = useState({
        name: name || "",
        email: "",
        phone: "",
        address: "",
        vehicleType: "Car",
        vehicleNumber: "",
        emergencyContact: "",
        bio: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Please log in again.");
                }

                const response = await fetch(
                    "http://127.0.0.1:8000/main_profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || "Could not load profile.");
                }

                setProfile({
                    name: data.name || name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    vehicleType: data.vehicle || "Car",
                    vehicleNumber: data.vehicel_no || "",
                    emergencyContact: data.emergency_con || "",
                    bio: data.about_u || ""
                });
            } catch (error) {
                setMessage(error.message || "Could not load profile.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [name]);

    const update = event => {
        const { name, value } = event.target;

        setProfile(current => ({
            ...current,
            [name]: value
        }));
    };

    const submit = async event => {
        event.preventDefault();
        setMessage("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Please log in again.");
            }

            const response = await fetch(
                "http://127.0.0.1:8000/main_profile",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: profile.name,
                        address: profile.address,
                        vehicle: profile.vehicleType,
                        vehicel_no: profile.vehicleNumber,
                        emergency_con: profile.emergencyContact,
                        about_u: profile.bio
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to save profile.");
            }

            setMessage("Profile saved successfully.");
        } catch (error) {
            setMessage(error.message || "Could not connect to the server.");
        }
    };

    if (loading) {
        return <div className="page_shell">Loading profile...</div>;
    }

    return (
        <div className="page_shell">
            <div className="page_intro">
                <span className="eyebrow">ACCOUNT SETTINGS</span>
                <h1>Your profile</h1>
                <p>Add your contact and vehicle details to make bookings easier.</p>
            </div>

            <form className="form_card profile_form" onSubmit={submit}>
                <div className="profile_banner">
                    <div className="profile_avatar">
                        <img src={userdash} alt="Profile" />
                    </div>
                    <div>
                        <h2>{profile.name || "Your profile"}</h2>
                        <p>ParkNest member</p>
                    </div>
                </div>

                <h3>Personal information</h3>

                <div className="form_grid">
                    <label>
                        Full name
                        <input
                            name="name"
                            value={profile.name}
                            onChange={update}
                            required
                            placeholder="Your full name"
                        />
                    </label>

                    <label>
                        Verified email address
                        <input
                            name="email"
                            type="email"
                            value={profile.email}
                            readOnly
                        />
                    </label>

                    <label>
                        Phone number
                        <input
                            name="phone"
                            type="tel"
                            value={profile.phone}
                            readOnly
                        />
                    </label>

                    <label>
                        Home address
                        <input
                            name="address"
                            value={profile.address}
                            onChange={update}
                            placeholder="Street, area, city"
                        />
                    </label>
                </div>

                <h3>Vehicle information</h3>

                <div className="form_grid">
                    <label>
                        Vehicle type
                        <select
                            name="vehicleType"
                            value={profile.vehicleType}
                            onChange={update}
                        >
                            <option>Car</option>
                            <option>Motorcycle</option>
                            <option>Scooter</option>
                            <option>Van</option>
                            <option>Other</option>
                        </select>
                    </label>

                    <label>
                        Vehicle registration
                        <input
                            name="vehicleNumber"
                            value={profile.vehicleNumber}
                            onChange={update}
                            placeholder="e.g. TN 00 AB 1234"
                        />
                    </label>

                    <label>
                        Emergency contact
                        <input
                            name="emergencyContact"
                            type="tel"
                            value={profile.emergencyContact}
                            onChange={update}
                            placeholder="Optional contact number"
                        />
                    </label>

                    <label className="full_field">
                        About you
                        <textarea
                            name="bio"
                            rows="3"
                            value={profile.bio}
                            onChange={update}
                            placeholder="Any preferences or notes"
                        />
                    </label>
                </div>

                <div className="profile_form_footer">
                    <button className="primary_btn" type="submit">
                        Save profile
                    </button>

                    {message && (
                        <span className="success_message">{message}</span>
                    )}
                </div>
            </form>
        </div>
    );
}

export default Profile;
