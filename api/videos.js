 export default async function handler(req, res) {
 const VIDARA_API_KEY = process.env.VIDARA_API_KEY;
 const BYSE_API_KEY = process.env.BYSE_API_KEY;

  const page = Number(req.query.page || 1);

  try {
    let videos = [];

    // VIDARA
    try {
      const vidaraRes = await fetch(
        `https://api.vidara.so/v1/video/list?api_key=${VIDARA_API_KEY}&page=${page}`
      );

      if (vidaraRes.ok) {
        const data = await vidaraRes.json();

        const list =
          data?.result?.videos ||
          data?.videos ||
          [];

        const vidaraVideos = list.map(video => ({
          id: video.file_code || video.id,
          source: "VIDARA",
          title: video.title || video.name || "Untitled",
          thumbnail: video.thumbnail || "",
          url:
            video.url ||
            (video.file_code
              ? `https://vidara.so/v/${video.file_code}`
              : ""),
          views: Number(video.views || 0),
          uploaded: video.uploaded || video.created_at || 0
        }));

        videos.push(...vidaraVideos);
      }
    } catch (e) {
      console.log("VIDARA ERROR:", e);
    }

    // BYSE
    try {
      const byseRes = await fetch(
        `https://api.byse.sx/file/list?key=${BYSE_API_KEY}&page=${page}&public=1`
      );

      if (byseRes.ok) {
        const data = await byseRes.json();

        const list =
          data?.result?.files ||
          data?.files ||
          [];

        const byseVideos = list.map(video => ({
          id: video.file_code || video.id,
          source: "BYSE",
          title: video.title || video.name || "Untitled",
          thumbnail: video.thumbnail || "",
          url:
            video.link ||
            (video.file_code
              ? `https://byse.sx/${video.file_code}`
              : ""),
          views: Number(video.views || 0),
          uploaded: video.uploaded || 0
        }));

        videos.push(...byseVideos);
      }
    } catch (e) {
      console.log("BYSE ERROR:", e);
    }

    // urut upload terbaru
    videos.sort((a, b) => {
      return (
        new Date(b.uploaded).getTime() -
        new Date(a.uploaded).getTime()
      );
    });

    res.status(200).json({
      page,
      total: videos.length,
      videos
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
    }

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
