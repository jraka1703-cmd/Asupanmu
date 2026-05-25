export default async function handler(req, res) {
  const VIDARA_API_KEY = process.env.VIDARA_API_KEY;
  const BYSE_API_KEY = process.env.BYSE_API_KEY;

  const page = Number(req.query.page || 1);

  try {
    // Ambil data Vidara
    const vidaraReq = fetch(
      `https://api.vidara.so/v1/video/list?api_key=${VIDARA_API_KEY}&page=${page}`
    );

    // Ambil data BYSE
    const byseReq = fetch(
      `https://api.byse.sx/file/list?key=${BYSE_API_KEY}&page=${page}`
    );

    const [vidaraRes, byseRes] = await Promise.all([
      vidaraReq,
      byseReq
    ]);

    const vidaraData = await vidaraRes.json();
    const byseData = await byseRes.json();

    // Format Vidara
    const vidaraVideos =
      vidaraData?.result?.videos?.map(v => ({
        id: v.id,
        title: v.title || "Tanpa Judul",
        thumbnail: v.thumbnail,
        link: `https://vidara.so/v/${v.slug || v.id}`,
        source: "vidara"
      })) || [];

    // Format BYSE
    const byseVideos =
      byseData?.result?.files?.map(v => ({
        id: v.file_code,
        title: v.title || v.name || "Tanpa Judul",
        thumbnail: v.thumbnail,
        link: `https://bysezejataos.com/d/${v.file_code}`,
        source: "byse"
      })) || [];

    // Gabungkan
    const videos = [
      ...vidaraVideos,
      ...byseVideos
    ];

    // Cache
    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    res.status(200).json({
      page,
      total: videos.length,
      videos
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Gagal ambil data"
    });
  }
}
