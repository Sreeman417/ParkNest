
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";
import "../activepage.css";

function Map() {
    const [location, setLocation] = useState({ lat: 11.0168, lng: 76.9558 });
    const mapRef = useRef(null);
    const googleMap = useRef(null);
    const userMarker = useRef(null);
    const selectedMarker = useRef(null);
    const selectedPlace = useRef(null);
    const locationRef = useRef(location);

    useEffect(() => {
        locationRef.current = location;

        if (googleMap.current && userMarker.current && !selectedPlace.current) {
            googleMap.current.setCenter(location);
            userMarker.current.position = location;
        }
    }, [location]);

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            position => setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }),
            () => {},
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }, []);

    useEffect(() => {
        const handleShowPlace = event => {
            const place = event.detail;

            if (!place || typeof place.lat !== "number" || typeof place.lng !== "number") return;

            selectedPlace.current = place;

            if (googleMap.current) {
                const position = { lat: place.lat, lng: place.lng };

                googleMap.current.setCenter(position);
                googleMap.current.setZoom(17);

                if (selectedMarker.current) {
                    selectedMarker.current.position = position;
                    selectedMarker.current.title = place.name || place.title || "Selected place";
                }
            }
        };

        window.addEventListener("showPlaceOnMap", handleShowPlace);

        return () => window.removeEventListener("showPlaceOnMap", handleShowPlace);
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function initMap() {
            try {
                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

                if (!apiKey) throw new Error("Add VITE_GOOGLE_MAPS_API_KEY to your .env file.");

                setOptions({ key: apiKey, v: "weekly" });

                const { Map: GoogleMap } = await importLibrary("maps");
                const { AdvancedMarkerElement } = await importLibrary("marker");

                if (cancelled || !mapRef.current) return;

                const selected = selectedPlace.current;
                const center = selected
                    ? { lat: selected.lat, lng: selected.lng }
                    : locationRef.current;

                googleMap.current = new GoogleMap(mapRef.current, {
                    center,
                    zoom: selected ? 17 : 14,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    mapId: "DEMO_MAP_ID"
                });

                userMarker.current = new AdvancedMarkerElement({
                    map: googleMap.current,
                    position: locationRef.current,
                    title: "Your approximate location"
                });

                if (selected) {
                    selectedMarker.current = new AdvancedMarkerElement({
                        map: googleMap.current,
                        position: { lat: selected.lat, lng: selected.lng },
                        title: selected.name || selected.title || "Selected place"
                    });
                }
            } catch (error) {
                console.error("Google Maps failed to load:", error);
            }
        }

        initMap();

        return () => {
            cancelled = true;

            if (selectedMarker.current) {
                selectedMarker.current.map = null;
                selectedMarker.current = null;
            }

            if (userMarker.current) {
                userMarker.current.map = null;
                userMarker.current = null;
            }

            googleMap.current = null;
        };
    }, []);

    return (
        <div className="map_section">
            <div className="map_legend">
                <span><i className="legend_dot legend_user" /> Your location</span>
            </div>

            <div className="map_container">
                <div ref={mapRef} className="map" />
            </div>

            <p className="demo_note">
                Parking locations will appear here when real data becomes available.
            </p>
        </div>
    );
}

export default Map;
