import multer from multer

const storage=multer.diskStorage({
    distination: function (req,file,cb) { 
        cb(null,'./public/temp')
     },
     fileName:function (req,file,cb){
        // const uniqueSuffix =Date.now()+'-'+Math.round(Math.random()*1E9)     //change file name
        cb(null,file.originalname)
     }
})

export const upload=multer({
    storage,
})