import Pusher from "pusher";
import { kv } from "@vercel/kv";
import allow from "allow-cors";

/**
 * @return {string}
 */
function getId () {
    return Math.random().toString(36).slice(2);
}

export default async (request, response) => {
    const { id, desc, ans } = request.query;

    allow(response);

    if (desc) {
        const pick = getId();
        await kv.set(pick, desc);
        return response.status(200).json({
            id: pick,
        });
    }

    if (ans) {
        const {
            PUSHER_APP_ID: appId,
            PUSHER_KEY: key,
            PUSHER_SECRET: secret,
        } = process.env;

        const pusher = new Pusher({
            appId,
            key,
            secret,
            cluster: "eu",
            useTLS: true,
        });
        await pusher.trigger(id, "connect", {
            ans,
        });

        return response.status(200).send();
    }

    if (id) {
        /**
         * @type string
         */
        const source = await kv.get(id);
        if (source) {
            return response.status(200).json({
                desc: source,
            });
        }

        return response.status(404).json({
            message: `Could not find id [${id}]`,
        });
    }

    return response.status(500).json({
        message: "Send a 'desc' param to register it or send an 'id' param to retrieve a description.",
    });
};
