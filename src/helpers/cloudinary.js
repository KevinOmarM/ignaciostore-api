const { v2, config } = require('cloudinary')
require('dotenv').config();

config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const uploadImage = async (filePath, storage) => {
    return await v2.uploader.upload(filePath, {
        folder: storage
    })
}
const deleteImage = async (fileId) => {
    return await v2.uploader.destroy(fileId)
}

module.exports = { uploadImage, deleteImage }