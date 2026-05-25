export default async function handler(req, res) {
  const VIDARA_KEY = process.env.VIDARA_API_KEY;
  const BYSE_KEY = process.env.BYSE_API_KEY;

  try {

    // Ambil data Vidara
    const vidaraRes = await fetch(
      `https://api.vidara.so/v1/video/list?api_key=${VIDARA_KEY}`
    );

    // Ambil data Byse
    const byseRes = await fetch(
      `https://api.byse.sx/file/list?key=${BYSE_KEY}`
    );

    const vidaraData = await vidaraRes.json();
    const byseData = await byseRes.json();

    // Format Vidara
    const vidaraVideos =
      (vidaraData?.result?.videos || []).map(v => ({

        title:
          v.title ||
          v.name ||
          "Video Vidara",

        thumbnail:
          v.thumbnail ||
          v.thumb ||
          "",

        url:
          v.code
            ? `https://vidara.so/v/${v.code}`
            : "#",

        source: "vidara"
      }));


    // Format Byse
    const byseVideos =
      (byseData?.result?.files || []).map(v => ({

        title:
          v.name ||
          "Video Byse",

        thumbnail:
          v.thumbnail ||
          "",

        url:
          v.file_code
            ? `https://bysezejataos.com/d/${v.file_code}`
            : "#",

        source: "byse"
      }));


    const videos = [
      ...vidaraVideos,
      ...byseVideos
    ];

    return res.status(200).json({
      videos
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }
}
