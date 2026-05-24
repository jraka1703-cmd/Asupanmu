export default async function handler(req, res) {
  const page = Number(req.query.page || 1);

  try {
    const [vidaraRes, byseRes] = await Promise.all([
      fetch(
        `https://api.vidara.so/v1/video/list?api_key=${process.env.VIDARA_API_KEY}&page=${page}`
      ),
      fetch(
        `https://api.byse.sx/file/list?key=${process.env.BYSE_API_KEY}&page=${page}&public=1`
      )
    ]);

    const vidaraData = await vidaraRes.json();
    const byseData = await byseRes.json();

    const vidaraVideos =
      vidaraData?.result?.videos?.map(video => ({
        source: "vidara",
        title: video.title,
        thumbnail: video.thumbnail,
        url: video.url,
        views: video.views || 0
      })) || [];

    const byseVideos =
      byseData?.result?.files?.map(video => ({
        source: "byse",
        title: video.title || video.name,
        thumbnail: video.thumbnail,
        url: video.link,
        views: video.views || 0
      })) || [];

    const videos = [...vidaraVideos, ...byseVideos];

    videos.sort((a, b) => b.views - a.views);

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
    console.error(err);

    res.status(500).json({
      error: "Gagal mengambil data video"
    });
  }
}
