import { signal } from "./signaling.js";

/**
 * @typedef {Object} ConnectionOptions
 * @property {string} [stunServer="stun:stun.framasoft.org:3478"]
 * @property {Function<string>} [signalingServer]
 */

const defaultOptions = {
    stunServer: "stun:stun.framasoft.org:3478",
};

/**
 * @typedef {Object} DisplayAPI
 * @method on
 * @method fire
 * @method createConnection
 */
/**
 * @return {DisplayAPI}
 */
function display () {
    const listeners = {};
    return {
        /**
         * @param {string} eventName -
         * @param {Function} callback -
         */
        on (eventName, callback) {
            if (!listeners[eventName]) {
                listeners[eventName] = [];
            }
            listeners[eventName].push(callback);
        },
        /**
         * @param {string} eventName -
         * @param {*} [payload] -
         */
        fire (eventName, payload) {
            listeners[eventName]?.forEach((callback) => {
                callback(payload);
            });
        },
        /**
         * @param {ConnectionOptions} options -
         */
        async createConnection (options) {
            const merged = {
                ...defaultOptions,
                ...options,
            };
            const connection = new RTCPeerConnection({
                iceServers: [
                    {
                        url: merged.stunServer,
                    },
                ],
            });
            connection.addEventListener("connectionstatechange", () => {
                console.log(connection.connectionState);
            });

            new Promise((resolve) => {
                connection.addEventListener("icecandidate", ({ candidate }) => {
                    if (!candidate) {
                        resolve();
                    }
                });
            })
                .then(() => signal(connection.localDescription, (remoteDescription) => {
                    connection.setRemoteDescription(remoteDescription);
                    this.fire("connect", {
                        type: "connect",
                    });
                }))
                .then((id) => {
                    this.fire("hasID", {
                        id,
                    });
                });

            const channel = connection.createDataChannel("buttons");
            channel.addEventListener("open", () => {
                channel.addEventListener("message", ({ data }) => {
                    const json = JSON.parse(data);
                    console.log("Message", json);
                    this.fire("button", json);
                });
                this.fire("open");
                channel.send(JSON.stringify({
                    message: "Hi",
                }));
            });

            const offer = await connection.createOffer();
            await connection.setLocalDescription(offer);
        },
    };
}

export default display;
