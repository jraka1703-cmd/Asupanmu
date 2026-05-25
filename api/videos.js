export default async function handler(req, res) {
  const VIDARA_API_KEY = process.env.VIDARA_API_KEY;
  const BYSE_API_KEY = process.env.BYSE_API_KEY;

  const page = Number(req.query.page || 1);

  try {
    const [vidaraRes, byseRes] = await Promise.all([
      fetch(
        `https://api.vidara.so/v1/video/list?api_key=${VIDARA_API_KEY}&page=${page}`
      ),
      fetch(
        `https://api.byse.sx/file/list?key=${BYSE_API_KEY}&page=${page}`
      )
    ]);

    const vidaraData = await vidaraRes.json();
    const byseData = await byseRes.json();

    // Vidara
    const vidaraVideos =
      (vidaraData?.result?.videos || []).map(v => ({
        id: v.video_id || v.id,
        title: v.title || "Tanpa Judul",
        thumbnail:
          v.thumbnail ||
          v.thumb ||
          "",

        // pakai URL asli dari API jika ada
        link:
          v.url ||
          `https://vidara.so/v/${v.slug || v.video_id || v.id}`,

        source: "vidara"
      }));

    // Byse
    const byseVideos =
      (byseData?.result?.files || []).map(v => ({
        id: v.file_code,
        title: v.title || v.name || "Tanpa Judul",
        thumbnail: v.thumbnail || "",

        // halaman asli Byse
        link: `https://bysezjtaos.com/d/${v.file_code}`,

        source: "byse"
      }));

    const videos = [
      ...vidaraVideos,
      ...byseVideos
    ];

    res.status(200).json({
      success: true,
      videos
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
