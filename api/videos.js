export default async function handler(req, res) {
  const API_KEY = process.env.VIDARA_API_KEY;

  const page = Number(req.query.page || 1);

  try {
    const response = await fetch(
      `https://api.vidara.so/v1/video/list?api_key=${API_KEY}&page=${page}`
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data VIDARA");
    }

    const data = await response.json();

    const videos =
      data?.result?.videos || [];

    // Cache lebih lama
    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    res.status(200).json({
      page,
      videos,
      hasMore: videos.length > 0
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Gagal ambil data"
    });
  }
}
