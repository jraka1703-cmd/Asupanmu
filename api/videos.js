export default async function handler(req, res) {
  const page = Number(req.query.page || 1);

  try {
    const [vidaraRes, byseRes] = await Promise.allSettled([
      fetch(
        `https://api.vidara.so/v1/video/list?api_key=${process.env.VIDARA_API_KEY}&page=${page}`
      ),
      fetch(
        `https://api.byse.sx/file/list?key=${process.env.BYSE_API_KEY}&page=${page}&public=1`
      )
    ]);

    let vidaraVideos = [];
    let byseVideos = [];

    // VIDARA
    if (vidaraRes.status === "fulfilled") {
      const vidaraData = await vidaraRes.value.json();

      const list =
        vidaraData?.result?.videos ||
        vidaraData?.videos ||
        [];

      vidaraVideos = list.map((video) => ({
        id:
          video.file_code ||
          video.code ||
          video.id,

        source: "VIDARA",

        title:
          video.title ||
          video.name ||
          "Untitled",

        thumbnail:
          video.thumbnail ||
          video.poster ||
          "",

        url:
          video.url ||
          video.link ||
          (video.file_code
            ? `https://vidara.so/v/${video.file_code}`
            : null),

        views: Number(video.views || 0),

        uploaded:
          video.uploaded ||
          video.created_at ||
          null
      }));
    }

    // BYSE
    if (byseRes.status === "fulfilled") {
      const byseData = await byseRes.value.json();

      const list =
        byseData?.result?.files ||
        byseData?.files ||
        [];

      byseVideos = list.map((video) => ({
        id: video.file_code,

        source: "BYSE",

        title:
          video.title ||
          video.name ||
          "Untitled",

        thumbnail:
          video.thumbnail ||
          "",

        url:
          video.link ||
          (video.file_code
            ? `https://byse.sx/${video.file_code}`
            : null),

        views: Number(video.views || 0),

        uploaded:
          video.uploaded ||
          null
      }));
    }

    const videos = [...vidaraVideos, ...byseVideos];

    videos.sort((a, b) => {
      return b.views - a.views;
    });

    res.status(200).json({
      success: true,
      page,
      total: videos.length,
      videos
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load videos"
    });
  }
}
