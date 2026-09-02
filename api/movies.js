export default async function handler(req, res) {
    const page = req.query.page || "1";

    const apiURL = `https://moviesapi.ir/api/v1/movies?page=${page}`;

    try {
        const response = await fetch(apiURL);

        if (!response.ok) {
            return res.status(response.status).json({
                error: "Movie API request failed"
            });
        }

        const data = await response.json();

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=86400"
        );

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({
            error: "Unable to fetch movies",
            message: error.message
        });
    }
}
