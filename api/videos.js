export default async function handler(req, res) {
  const VIDARA_API_KEY = process.env.VIDARA_API_KEY;
  const BYSE_API_KEY = process.env.BYSE_API_KEY;

  const page = req.query.page || 1;

  try {
    const [vidaraRes, byseRes] = await Promise.all([
      fetch(
        `https://api.vidara.so/v1/video/list?api_key=${VIDARA_API_KEY}&page=${page}`
      ),
      fetch(
        `https://api.byse.sx/file/list?key=${BYSE_API_KEY}&page=${page}`
      )
    ]);

    const response = await fetch("/api/videos");
const data = await response.json();

setVideos(data.videos || []);

    const vidaraData = await vidaraRes.json();
    const byseData = await byseRes.json();

    console.log("VIDARA:", vidaraData);
    console.log("BYSE:", byseData);

    // Vidara
    const vidaraVideos =
      (vidaraData?.result?.videos || []).map(v => ({
        id: v.id || v.video_id,
        title: v.title || "Tanpa Judul",
        thumbnail: v.thumbnail || v.thumb || "",
        link: v.url || `https://vidara.so/v/${v.slug || v.id}`,
        source: "vidara"
      }));

    // BYSE
    const byseVideos =
      (byseData?.result?.files || []).map(v => ({
        id: v.file_code,
        title: v.name || v.title || "Tanpa Judul",
        thumbnail: v.thumbnail || "",
        link: `https://bysezejataos.com/d/${v.file_code}`,
        source: "byse"
      }));

    const videos = [...vidaraVideos, ...byseVideos];

    res.status(200).json({
      success: true,
      total: videos.length,
      videos
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
