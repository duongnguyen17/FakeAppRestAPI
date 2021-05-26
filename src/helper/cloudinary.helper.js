const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "do4l7xob6",
  api_key: "175147137811431",
  api_secret: "FsjDQtyIYNd10KaXHO1QnonByQk",
});

const upload = async (fileUp, type) => {
  const path = fileUp;
  try {
    if (type === "video") {
      const result = await cloudinary.uploader.upload(path, {
        resource_type: "video",
      });
      return {
        url: result.url,
        thumb: result.url.slice(0, result.url.lastIndexOf(".")) + ".png",
      };
    } else {
      const result = await cloudinary.uploader.upload(path);
      return { url: result.url };
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  upload,
};
