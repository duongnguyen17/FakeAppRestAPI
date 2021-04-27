
const cloudinary = require('cloudinary').v2
cloudinary.config({
  cloud_name: 'do4l7xob6',
  api_key: '175147137811431',
  api_secret: 'FsjDQtyIYNd10KaXHO1QnonByQk'
})

const upload = (fileUp, type) => {
  const { path } = fileUp
  return new Promise((resolve, reject) => {
    if (type === 'video') {
      cloudinary.uploader.upload(path, { resource_type: 'video' })
        .then((result) => {
          resolve({
            url: result.url,
            thumb: result.url.slice(0, result.url.lastIndexOf('.')) + '.png'
          })
        })
        .catch((error) => {
          reject(error)
        })
    } else {
      cloudinary.uploader
        .upload(path)
        .then((result) => {
          resolve({ url: result.url })
        })
        .catch((error) => {
          console.log(error)
          reject(error)
        })
    }
  })
}

module.exports = {
  upload
}
