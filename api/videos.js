export default async function handler(req, res) {
  const VIDARA_API_KEY = process.env.VIDARA_API_KEY;
  const BYSE_API_KEY = process.env.BYSE_API_KEY;

  const page = Number(req.query.page || 1);

  try {
    const [vidaraRes, byseRes] = await Promise.allSettled([
      fetch(
        `https://api.vidara.so/v1/video/list?api_key=${VIDARA_API_KEY}&page=${page}`
      ),

      fetch(
        `https://api.byse.sx/file/list?key=${BYSE_API_KEY}&page=${page}&public=1`
      )
    ]);

    let vidaraVideos = [];
    let byseVideos = [];

    // ===================
    // VIDARA
    // ===================

    if (
      vidaraRes.status === "fulfilled" &&
      vidaraRes.value.ok
    ) {
      const data = await vidaraRes.value.json();

      const videos =
        data?.result?.videos ||
        data?.videos ||
        [];

      vidaraVideos = videos.map(video => ({
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
          "",

        url:
          video.url ||
          (video.file_code
            ? `https://vidara.so/v/${video.file_code}`
            : null),

        views: Number(
          video.views || 0
        ),

        uploaded:
          video.uploaded ||
          null
      }));
    }

    // ===================
    // BYSE
    // ===================

    if (
      byseRes.status === "fulfilled" &&
      byseRes.value.ok
    ) {
      const data = await byseRes.value.json();

      const files =
        data?.result?.files ||
        data?.files ||
        [];

      byseVideos = files.map(video => ({
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
          "",

        url:
          video.link ||
          (video.file_code
            ? `https://byse.sx/${video.file_code}`
            : null),

        views: Number(
          video.views || 0
        ),

        uploaded:
          video.uploaded ||
          null
      }));
    }

    // gabungkan hasil
const videos = [
  ...vidaraVideos,
  ...byseVideos
];

// urutkan berdasarkan upload terbaru
videos.sort((a, b) => {
  return (
    new Date(b.uploaded || 0) -
    new Date(a.uploaded || 0)
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
