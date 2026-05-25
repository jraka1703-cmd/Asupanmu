export default async function handler(req, res) {
  const VIDARA_KEY = process.env.VIDARA_API_KEY;
  const BYSE_KEY = process.env.BYSE_API_KEY;

  const page = Number(req.query.page || 1);

  try {

    const [vidaraRes, byseRes] = await Promise.all([
      fetch(
        `https://api.vidara.so/v1/video/list?api_key=${VIDARA_KEY}&page=${page}`
      ),
      fetch(
        `https://api.byse.sx/file/list?key=${BYSE_KEY}&page=${page}`
      )
    ]);

    const vidaraData = await vidaraRes.json();
    const byseData = await byseRes.json();

    // VIDARA
    const vidaraVideos = (vidaraData?.result?.videos || [])
      .filter(v => v.code || v.id)
      .map(v => ({
        title: v.title || "Tanpa Judul",
        thumbnail: v.thumbnail || "",
        url: `https://vidara.so/v/${v.code || v.id}`,
        source: "Vidara"
      }));

    // BYSE
    const byseVideos = (byseData?.result?.files || [])
      .filter(v => v.file_code)
      .map(v => ({
        title: v.name || "Tanpa Judul",
        thumbnail: v.thumbnail || "",
        url: `https://bysezejataos.com/d/${v.file_code}`,
        source: "BYSE"
      }));


    const videos = [
      ...vidaraVideos,
      ...byseVideos
    ];

    res.status(200).json({
      page,
      videos
    });

  } catch (e) {

    res.status(500).json({
      error: e.message
    });

  }
}
