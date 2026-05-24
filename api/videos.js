export default async function handler(req, res) {
  const VIDARA_API_KEY = process.env.VIDARA_API_KEY;
  const BYSE_API_KEY = process.env.BYSE_API_KEY;

  const page = Number(req.query.page || 1);

  try {
    let videos = [];

    // =========================
    // VIDARA
    // =========================

    try {
      const vidaraRes = await fetch(
        `https://api.vidara.so/v1/video/list?api_key=${VIDARA_API_KEY}&page=${page}`
      );

      if (vidaraRes.ok) {
        const data = await vidaraRes.json();

        const vidaraVideos =
          data?.result?.videos ||
          data?.videos ||
          [];

        videos.push(
          ...vidaraVideos.map(video => ({
            id:
              video.file_code ||
              video.id,

            source: "VIDARA",

            title:
              video.title ||
              video.name ||
              "Untitled",

            thumbnail:
              video.thumbnail ||
              video.splash_img ||
              "",

            // link video
            url:
              video.link ||
              video.url ||
              (video.file_code
                ? `https://vidara.so/v/${video.file_code}`
                : ""),

            views:
              Number(video.views || 0),

            uploaded:
              video.uploaded ||
              video.created_at ||
              0
          }))
        );
      }

    } catch (e) {
      console.log("VIDARA ERROR:", e);
    }


    // =========================
    // BYSE
    // =========================

    try {
      const byseRes = await fetch(
        `https://api.byse.sx/file/list?key=${BYSE_API_KEY}&page=${page}&public=1`
      );

      if (byseRes.ok) {
        const data = await byseRes.json();

        const byseVideos =
          data?.result?.files ||
          data?.files ||
          data?.result ||
          [];

        videos.push(
          ...byseVideos.map(video => ({
            id:
              video.file_code ||
              video.id,

            source: "BYSE",

            title:
              video.title ||
              video.name ||
              "Untitled",

            thumbnail:
              video.thumbnail ||
              video.splash_img ||
              "",

            // link BYSE
            url:
              video.link ||
              video.url ||
              (video.file_code
                ? `https://bysezejataos.com/d/${video.file_code}`
                : ""),

            views:
              Number(video.views || 0),

            uploaded:
              video.uploaded ||
              video.created_at ||
              0
          }))
        );
      }

    } catch (e) {
      console.log("BYSE ERROR:", e);
    }


    // =========================
    // urut video terbaru
    // =========================

    videos.sort((a, b) => {
      const dateA = a.uploaded
        ? new Date(a.uploaded).getTime()
        : 0;

      const dateB = b.uploaded
        ? new Date(b.uploaded).getTime()
        : 0;

      return dateB - dateA;
    });


    // cache

    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );


    return res.status(200).json({
      success: true,
      page,
      total: videos.length,
      videos,
      hasMore: videos.length > 0
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }
}
