import { kv } from '@vercel/kv'

/**
 * @return {string}
 */
function getId () {
    return Math.random().toString(36).slice(2);
}

export default async (request, response) => {
    const { id, desc } = request.query;

    if (id) {
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

    if (desc) {
        const pick = getId();
        await kv.set(pick, desc);
        return response.status(200).json({
            id: pick,
        });
    }

    return response.status(500).json({
        message: "Send a 'desc' param to register it or send an 'id' param to retrieve a description.",
    });
};
