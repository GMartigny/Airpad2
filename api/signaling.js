/**
 * @return {string}
 */
function getId () {
    return Math.random().toString(36).slice(2);
}

const mapping = {};

export default (request, response) => {
    const { id, desc } = request.query;

    if (id) {
        const source = mapping[id];
        if (source) {
            return response.status(200).json({
                desc: source,
            });
        }

        return response.status(404);
    }

    if (desc) {
        const pick = getId();
        mapping[pick] = desc;
        return response.status(200).json({
            id: getId(),
        });
    }

    return response.status(500).json({
        message: "Send a 'desc' param to register it or send an 'id' param to retrieve a description.",
    });
};
