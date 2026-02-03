
const GOOGLE_MAPS_API_KEY = "AIzaSyAJOQsPzf4OVIvCUYT_5YVIkP67ilGUimQ";

interface LatLng {
    lat: number;
    lng: number;
}

// Polyline encoding algorithm for Google Maps
// https://developers.google.com/maps/documentation/utilities/polylinealgorithm
function encodePolyline(points: LatLng[]): string {
    let str = "";
    let encodeDiff = (diff: number) => {
        let shifted = diff << 1;
        if (diff < 0) {
            shifted = ~shifted;
        }
        let rem = shifted;
        while (rem >= 0x20) {
            str += String.fromCharCode((0x20 | (rem & 0x1f)) + 63);
            rem >>= 5;
        }
        str += String.fromCharCode(rem + 63);
    };

    let lastLat = 0;
    let lastLng = 0;

    for (const point of points) {
        let lat = Math.round(point.lat * 1e5);
        let lng = Math.round(point.lng * 1e5);

        encodeDiff(lat - lastLat);
        encodeDiff(lng - lastLng);

        lastLat = lat;
        lastLng = lng;
    }
    return str;
}

// Custom dark map style
const MAP_STYLE = [
    "style=feature:all|element:geometry|color:0x242f3e",
    "style=feature:all|element:labels.text.stroke|color:0x242f3e",
    "style=feature:all|element:labels.text.fill|color:0x746855",
    "style=feature:administrative.locality|element:labels.text.fill|color:0xd59563",
    "style=feature:poi|element:labels.text.fill|color:0xd59563",
    "style=feature:poi.park|element:geometry|color:0x263c3f",
    "style=feature:poi.park|element:labels.text.fill|color:0x6b9a76",
    "style=feature:road|element:geometry|color:0x38414e",
    "style=feature:road|element:geometry.stroke|color:0x212a37",
    "style=feature:road|element:labels.text.fill|color:0x9ca5b3",
    "style=feature:road.highway|element:geometry|color:0x746855",
    "style=feature:road.highway|element:geometry.stroke|color:0x1f2835",
    "style=feature:road.highway|element:labels.text.fill|color:0xf3d19c",
    "style=feature:transit|element:geometry|color:0x2f3948",
    "style=feature:transit.station|element:labels.text.fill|color:0xd59563",
    "style=feature:water|element:geometry|color:0x17263c",
    "style=feature:water|element:labels.text.fill|color:0x515c6d",
    "style=feature:water|element:labels.text.stroke|color:0x17263c"
];

export function getStaticMapUrl(points: LatLng[], width: number, height: number): string {
    if (points.length === 0) return "";

    const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
    const size = `${width}x${height}`;
    const encPath = encodePolyline(points);

    // Path styling: Orange color (0xff9900), weight 5
    const path = `color:0xff9900ff|weight:5|enc:${encPath}`;

    // Markers logic
    // Start marker: Green (color:0x00ff00)
    // End marker: Red (color:0xff0000)
    let markers = "";
    if (points.length > 0) {
        const start = points[0];
        markers += `&markers=color:green|label:S|${start.lat},${start.lng}`;
    }
    if (points.length > 1) {
        const end = points[points.length - 1];
        markers += `&markers=color:red|label:F|${end.lat},${end.lng}`;
    }

    const styleParams = MAP_STYLE.map(s => `&${s}`).join("");

    return `${baseUrl}?size=${size}&path=${path}${markers}${styleParams}&key=${GOOGLE_MAPS_API_KEY}`;
}
