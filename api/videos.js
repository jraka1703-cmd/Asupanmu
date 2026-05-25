export default async function handler(req, res) {
  const VIDARA_KEY = process.env.VIDARA_API_KEY;
  const BYSE_KEY = process.env.BYSE_API_KEY;

  const page = Number(req.query.page || 1);

  try {
    // Ambil Vidara
    const vidaraReq = fetch(
      `https://api.vidara.so/v1/video/list?api_key=${VIDARA_KEY}&page=${page}`
    );

    // Ambil BYSE
    const byseReq = fetch(
      `https://api.byse.sx/file/list?key=${BYSE_KEY}&page=${page}`
    );

    const [vidaraRes, byseRes] = await Promise.all([
      vidaraReq,
      byseReq
    ]);

    const vidaraData = await vidaraRes.json();
    const byseData = await byseRes.json();

    // Format Vidara
    const vidaraVideos = (vidaraData?.result?.videos || []).map(v => ({
      title: v.title || "Tanpa Judul",
      thumbnail: v.thumbnail,
      url: `https://vidara.so/v/${v.code}`,
      source: "Vidara"
    }));

    // Format BYSE
    const byseVideos = (byseData?.result?.files || []).map(v => ({
      title: v.name || "Tanpa Judul",
      thumbnail: v.thumbnail,
      url: `https://bysezejataos.com/d/${v.file_code}`,
      source: "BYSE"
    }));

    // Gabungkan
    const videos = [...vidaraVideos, ...byseVideos];

    // Cache
    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).json({
      page,
      videos,
      total: videos.length
    });

  } catch (err) {
    return res.status(500).json({
      error: "Gagal ambil video",
      detail: err.message
    });
  }
}
