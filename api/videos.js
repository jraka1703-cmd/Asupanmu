export default async function handler(req, res) {

const VIDARA_API_KEY =
process.env.VIDARA_API_KEY;

const BYSE_API_KEY =
process.env.BYSE_API_KEY;

const page =
Number(req.query.page || 1);

try{

const requests=[];


// VIDARA
requests.push(
fetch(
`https://api.vidara.so/v1/video/list?api_key=${VIDARA_API_KEY}&page=${page}`
)
);


// BYSE
requests.push(
fetch(
`https://api.byse.sx/file/list?key=${BYSE_API_KEY}&page=${page}`
)
);


// API tambahan (contoh)
// requests.push(
// fetch(
// `https://api-lain.com/videos?page=${page}`
// )
// );


const responses=
await Promise.allSettled(
requests
);

let videos=[];


// =================
// VIDARA
// =================

if(
responses[0]?.status==="fulfilled"
){

const data=
await responses[0].value.json();

const vidaraVideos=
data?.result?.videos || [];

videos.push(

...vidaraVideos.map(v=>({

id:
v.video_id||
v.id||
v.file_code,

title:
v.title||
"Tanpa Judul",

thumbnail:
v.thumbnail||
v.thumb||
"",

link:
v.link||
v.url||
`https://vidara.so/v/${
v.slug||
v.video_id||
v.id
}`,

uploaded:
v.uploaded||
v.created_at||
"",

source:
"VIDARA"

}))

);

}



// =================
// BYSE
// =================

if(
responses[1]?.status==="fulfilled"
){

const data=
await responses[1].value.json();

const byseVideos=
data?.result?.files||
data?.files||
[];

videos.push(

...byseVideos.map(v=>({

id:
v.file_code||
v.id,

title:
v.title||
v.name||
"Tanpa Judul",

thumbnail:
v.thumbnail||
"",

link:
v.link||
v.url||
`https://bysezejataos.com/d/${v.file_code}`,

uploaded:
v.uploaded||
"",

source:
"BYSE"

}))

);

}



// =================
// API tambahan
// =================

// if(
// responses[2]?.status==="fulfilled"
// ){
//
// const data=
// await responses[2]
// .value
// .json();
//
// videos.push(
// ...data.videos.map(v=>({
// id:v.id,
// title:v.title,
// thumbnail:v.thumbnail,
// link:v.link,
// source:"API3"
// }))
// );
//
// }



// =================
// hapus duplikat
// =================

const uniqueIds=
new Set();

videos=
videos.filter(v=>{

const id=
v.id||
v.link;

if(
uniqueIds.has(id)
){

return false;

}

uniqueIds.add(id);

return true;

});



// =================
// urut terbaru
// =================

videos.sort(
(a,b)=>{

return new Date(
b.uploaded||0
)-
new Date(
a.uploaded||0
);

}
);



// cache

res.setHeader(
"Cache-Control",
"s-maxage=300, stale-while-revalidate=600"
);


return res.status(200).json({

success:true,

page,

total:
videos.length,

videos,

hasMore:
videos.length>0

});


}catch(err){

console.log(err);

return res.status(500).json({

success:false,

error:
err.message

});

}

}
