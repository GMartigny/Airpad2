/**
 * @typedef {Object} DisplayAPI
 * @property {string} id
 * @method on
 * @method fire
 * @method createConnection
 */
/**
 * @param {string} stunServer -
 * @return {DisplayAPI}
 */
function display (stunServer = "stun:stun.framasoft.org:3478") {
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
         * @return {Promise}
         */
        async createConnection () {
            const connection = new RTCPeerConnection({
                iceServers: [
                    {
                        url: stunServer,
                    },
                ],
            });
            const promise = new Promise((resolve) => {
                connection.addEventListener("icecandidate", ({ candidate }) => {
                    if (!candidate) {
                        console.log("Candidate negotiation ends");
                        resolve(btoa(JSON.stringify(connection.localDescription)));
                    }
                });
            });
            const channel = connection.createDataChannel("buttons");
            channel.addEventListener("open", () => {
                console.log("Connect");
                this.fire("connect");
            });
            // channel.addEventListener("message", ({ data }) => {
            //     console.log("Message: ", data);
            // });
            // channel.addEventListener("close", () => {
            //     this.fire("disconnect");
            // });
            const offer = await connection.createOffer();
            await connection.setLocalDescription(offer);
            return promise;
        },
    };
}

export default display;
