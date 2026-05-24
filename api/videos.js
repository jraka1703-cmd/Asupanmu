export default async function handler(req, res) {
  const VIDARA_API_KEY = process.env.VIDARA_API_KEY;
  const BYSE_API_KEY = process.env.BYSE_API_KEY;

  const page = Number(req.query.page || 1);

  try {
    let videos = [];

    // =========================
    // VIDARA
    // =========================

    const vidaraRes = await fetch(
      `https://api.vidara.so/v1/video/list?api_key=${VIDARA_API_KEY}&page=${page}`
    );

    if (vidaraRes.ok) {
      const data = await vidaraRes.json();

      const vidaraVideos =
        data?.result?.videos || [];

      videos.push(
        ...vidaraVideos.map(video => ({
          id:
            video.file_code ||
            video.id,

          source: "VIDARA",

          title:
            video.title ||
            "Untitled",

          thumbnail:
            video.thumbnail ||
            "",

          url:
            video.url ||
            `https://vidara.so/v/${video.file_code}`,

          views:
            Number(video.views || 0),

          uploaded:
            video.uploaded ||
            video.created_at ||
            0
        }))
      );
    }

    // =========================
    // BYSE
    // =========================

    const byseRes = await fetch(
      `https://api.byse.sx/file/list?key=${BYSE_API_KEY}&page=${page}&public=1`
    );

    if (byseRes.ok) {
      const data = await byseRes.json();

      const byseVideos =
        data?.result?.files || [];

      videos.push(
        ...byseVideos.map(video => ({
          id:
            video.file_code ||
            video.id,

          source: "BYSE",

          title:
            video.title ||
            "Untitled",

          thumbnail:
            video.thumbnail ||
            "",

          url:
            video.link ||
            `https://byse.sx/${video.file_code}`,

          views:
            Number(video.views || 0),

          uploaded:
            video.uploaded ||
            video.created_at ||
            0
        }))
      );
    }

    // urut upload terbaru
    videos.sort((a, b) => {
      return (
        new Date(b.uploaded).getTime() -
        new Date(a.uploaded).getTime()
      );
    });

    // cache
    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    res.status(200).json({
      page,
      total: videos.length,
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
