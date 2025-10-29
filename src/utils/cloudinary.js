import cloudinary from 'cloudinary'

cloudinary.v2.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {

    
    if(!localFilePath) return null;
    const result = await cloudinary.v2.uploader.upload(localFilePath, {
        resource_type: "auto",
    });
    return result.url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

const deleteFromCloudinary = async (url) => {
  try {
    if(!url) return null;    
    const parts = url.split('/');
    const uploadIndex = parts.findIndex((p) => p === "upload");
    const publicIdWithExt = parts.slice(uploadIndex + 1).join("/");
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf("."));
    const result = await cloudinary.v2.uploader.destroy(publicId);
    
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

export { uploadOnCloudinary, deleteFromCloudinary };