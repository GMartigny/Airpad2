import Pusher from "pusher-js";

const pusherAppKey = "9a9fdf392b351fe21945";

const server = process.env.NODE_ENV === "development" ?
    "http://192.168.1.51:3000/api/signaling" : "https://airpad2.vercel.app/api/signaling";

/**
 * @param {*} data -
 * @return {string}
 */
function encrypt (data) {
    return btoa(JSON.stringify(data));
}

/**
 * @param {string} string -
 * @return {Object}
 */
function decrypt (string) {
    return JSON.parse(atob(string));
}

/**
 * @param {RTCSessionDescription} description -
 * @param {Function} connectCallback -
 * @return {Promise<string>}
 */
async function signal (description, connectCallback) {
    const response = await fetch(`${server}?desc=${encrypt(description)}`);
    if (response.ok) {
        const { id } = await response.json();
        const pusher = new Pusher(pusherAppKey, {
            cluster: "eu",
        });
        pusher.subscribe(id).bind("connect", (data) => {
            connectCallback(decrypt(data.ans));
        });
        return id;
    }
    throw new Error("Fail to contact signaling server");
}

/**
 * @param {string} id -
 * @return {Promise<RTCSessionDescription>}
 */
async function retrieve (id) {
    const response = await fetch(`${server}?id=${id}`);
    if (response.ok) {
        const { desc } = await response.json();
        return decrypt(desc);
    }
    throw new Error("Fail to contact signaling server");
}

/**
 * @param {string} id -
 * @param {RTCSessionDescription} description -
 */
async function answer (id, description) {
    const response = await fetch(`${server}?id=${id}&ans=${encrypt(description)}}`);
    if (response.ok) {
        return;
    }
    throw new Error("Fail to contact signaling server");
}

export {
    signal,
    retrieve,
    answer,
};
