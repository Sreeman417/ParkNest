
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let configured = false;
let loadingPromise = null;

export function loadGoogleMaps() {
    if (!loadingPromise) {
        loadingPromise = (async () => {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

            if (!apiKey) {
                throw new Error("Google Maps API key is missing.");
            }

            if (!configured) {
                setOptions({
                    key: apiKey,
                    v: "weekly"
                });

                configured = true;
            }

            const { Map } = await importLibrary("maps");
            const { AdvancedMarkerElement } = await importLibrary("marker");

            return { Map, AdvancedMarkerElement };
        })().catch(error => {
            loadingPromise = null;
            throw error;
        });
    }

    return loadingPromise;
}
