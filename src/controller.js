import { render, renderStyle } from "@gmartigny/whiskers.js";

/**
 * @param {string} name -
 * @return {HTMLElement}
 */
function makeButton (name) {
    // eslint-disable-next-line no-use-before-define
    const trigger = detail => () => button.dispatchEvent(new CustomEvent(name, {
        detail,
    }));
    const button = render("button", {
        class: name,
        "@mousedown": trigger("down"),
        "@mouseup": trigger("up"),
    });
    return button;
}

const remotes = {
    nes: "NES",
};

const buttons = {
    [remotes.nes]: [
        "A",
        "B",
    ],
};
buttons.default = buttons[remotes.nes];

const rotatingDisplay = [
    "1/2/2/3",
    "2/3/3/4",
    "3/2/4/3",
    "2/1/3/2",
].reduce((acc, val, index) => {
    acc[`&:nth-child(${index + 1})`] = {
        "grid-area": val,
        transform: `rotate(${90 * index}deg)`,
    };
    return acc;
}, {});
const grid = (rows, cols) => ({
    display: "grid",
    "grid-template": `repeat(${rows}, 1fr) / repeat(${cols || rows}, 1fr)`,
});
const NesRed = "#C9211E";
const styles = {
    [remotes.nes]: {
        [`&.${remotes.nes}`]: {
            "background-color": "#262626",

            ".buttons": {
                display: "flex",
                "align-items": "center",
                "justify-content": "space-evenly",

                button: {
                    position: "relative",
                    "background-color": NesRed,
                    height: "50%",
                    "max-width": "45%",

                    "&:after": {
                        color: NesRed,
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        "font-weight": "bold",
                        "font-size": "2em",
                    },
                },

                ".A:after": {
                    content: "'A'",
                },
                ".B:after": {
                    content: "'B'",
                },
            },
        },
    },
};
styles.default = styles[remotes.nes];

/**
 * @param {string} id -
 * @param {string} name -
 * @return {{html: HTMLElement, style: HTMLStyleElement}}
 */
async function controller (id, name = remotes.nes) {
    const html = render(undefined, {
        class: `controller ${name}`,
    }, [
        render(undefined, {
            class: "arrows",
        }, [
            "Up",
            "Right",
            "Down",
            "Left",
        ].map(makeButton)),
        render(undefined, {
            class: "buttons",
        }, buttons[name].map(makeButton)),
    ]);

    const stretch = {
        flex: "1 50%",
    };
    const style = renderStyle({
        body: {
            margin: 0,
            overflow: "hidden",
        },
        ".controller": {
            position: "absolute",
            display: "flex",
            width: "100vw",
            height: "100vh",
            left: 0,
            top: 0,

            ".arrows": {
                padding: "10px",
                ...stretch,
                ...grid(3),
                "grid-gap": "1%",

                button: {
                    padding: 0,
                    position: "relative",
                    ...rotatingDisplay,

                    "&:after": {
                        content: "''",
                        position: "absolute",
                        width: "80%",
                        height: "80%",
                        left: "10%",
                        top: "10%",
                        "background-color": "#111",
                        "clip-path": "polygon(50% 0%, 0% 100%, 100% 100%)",
                    },
                },
            },

            ".buttons": {
                padding: "10px",
                "max-width": "50%",
                ...stretch,

                button: {
                    "border-radius": "50%",
                    "aspect-ratio": 1,
                },
            },

            ...styles[name],
        },
    });

    const connection = new RTCPeerConnection();
    await connection.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(id))));
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    connection.addEventListener("datachannel", ({ channel }) => {
        channel.addEventListener("open", () => {
            console.log("Open channel");
        });
        channel.addEventListener("message", ({ data }) => {
            console.log("Message: ", data);
        });
    });

    return {
        html,
        style,
    };
}
controller.remotes = remotes;

export default controller;
