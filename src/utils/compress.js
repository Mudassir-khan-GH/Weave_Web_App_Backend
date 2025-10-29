import sharp from 'sharp';

const compressImage = async (imageLocalPath) =>{
    const optimizedPath = imageLocalPath.replace(/(\.[\w]+)?$/, "-optimized.jpg");
    
        await sharp(imageLocalPath)
          .resize({ width: 800, height: 800, fit: "inside" })
          .jpeg({ quality: 70 })
          .toFile(optimizedPath);
          return optimizedPath;
}

export {compressImage};