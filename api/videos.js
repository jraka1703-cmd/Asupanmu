export default async function handler(req, res) {
  const VIDARA_API_KEY = process.env.VIDARA_API_KEY;
  const BYSE_API_KEY = process.env.BYSE_API_KEY;

  const page = Number(req.query.page || 1);

  try {
    const [vidaraRes, byseRes] = await Promise.all([

      // API Vidara
      fetch(
        `https://api.vidara.so/v1/video/list?api_key=${VIDARA_API_KEY}&page=${page}`
      ),

      // API Byse
      fetch(
        `https://api.byse.sx/file/list?key=${BYSE_API_KEY}&page=${page}`
      )

    ]);

    const vidaraJson = await vidaraRes.json();
    const byseJson = await byseRes.json();

    // Video Vidara
    const vidaraVideos = (vidaraJson?.result?.videos || []).map(v => ({
      id: v.video_id || "",
      title: v.title || "Tanpa Judul",
      thumbnail: v.thumbnail || v.thumb || "",
      
      // supaya tidak undefined
      slug: v.slug || v.video_id || "",

      // link asli vidara
      link: `https://vidara.so/v/${v.slug || v.video_id}`,

      source: "vidara"
    }));


    // Video Byse
    const byseVideos = (byseJson?.result?.files || []).map(v => ({
      id: v.file_code || "",
      title: v.name || "Tanpa Judul",
      thumbnail: v.thumbnail || "",

      link: `https://bysezjtaos.com/d/${v.file_code}`,

      source: "byse"
    }));


    const videos = [
      ...vidaraVideos,
      ...byseVideos
    ];

    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).json({
      success: true,
      page,
      total: videos.length,
      videos
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
