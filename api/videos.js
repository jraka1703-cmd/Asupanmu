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
        `https://api.byse.sx/file/list?key=${BYSE_API_KEY}&public=1&page=${page}`
      )
    ]);

    let videos = [];

    // =====================
    // VIDARA
    // =====================

    if (vidaraRes.ok) {
      const vidaraData = await vidaraRes.json();

      const vidaraVideos =
        vidaraData?.result?.videos ||
        vidaraData?.videos ||
        [];

      videos.push(
        ...vidaraVideos.map(video => ({
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
            "",

          // pakai URL asli jika ada
          url:
            video.link ||
            video.url ||
            "",

          views:
            Number(video.views || 0),

          uploaded:
            video.uploaded ||
            video.created_at ||
            0
        }))
      );
    }

    // =====================
    // BYSE
    // =====================

    if (byseRes.ok) {
      const byseData = await byseRes.json();

      const byseVideos =
        byseData?.result?.files ||
        [];

      videos.push(
        ...byseVideos.map(video => ({
          id: video.file_code,

          source: "BYSE",

          title:
            video.title ||
            video.name ||
            "Untitled",

          thumbnail:
            video.thumbnail ||
            "",

          // pakai link asli BYSE
          url:
            video.link ||
            `https://bysezejataos.com/d/${video.file_code}`,

          views:
            Number(video.views || 0),

          uploaded:
            video.uploaded || 0
        }))
      );
    }

    // urut terbaru
    videos.sort((a,b)=>{
      return (
        new Date(b.uploaded) -
        new Date(a.uploaded)
      );
    });

    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).json({
      page,
      total: videos.length,
      videos,
      hasMore: videos.length > 0
    });

  } catch(err){

    console.error(err);

    return res.status(500).json({
      error:"Gagal ambil data"
    });
  }
}
