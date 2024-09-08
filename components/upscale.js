// Copas + Modif Sama Gw
import FormData from "form-data";
import axios from 'axios';
import jimp from 'jimp';

export async function upscale(urlPath, method) {
    try {
        return new Promise(async (resolve, reject) => {
            let Methods = ["enhance", "recolor", "dehaze"];
            Methods.includes(method) ? (method = method) : (method = Methods[0]);
            let buffer,
                Form = new FormData(),
                scheme = "https" + "://" + "inferenceengine" + ".vyro" + ".ai/" + method;
            Form.append("model_version", 1, {
                "Content-Transfer-Encoding": "binary",
                contentType: "multipart/form-data; charset=uttf-8",
            });
            Form.append("image", Buffer.from(urlPath), {
                filename: "enhance_image_body.jpg",
                contentType: "image/jpeg",
            });
            Form.submit(
                {
                    url: scheme,
                    host: "inferenceengine" + ".vyro" + ".ai",
                    path: "/" + method,
                    protocol: "https:",
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A",
                        Connection: "Keep-Alive",
                        "Accept-Encoding": "gzip",
                    },
                },
                function (err, res) {
                    if (err) reject();
                    let data = [];
                    res
                        .on("data", function (chunk, resp) {
                            data.push(chunk);
                        })
                        .on("end", () => {
                            resolve(Buffer.concat(data));
                        });
                    res.on("error", (e) => {
                        reject();
                    });
                }
            );
        });
    } catch (e) {
        console.log(e)
    }
}

export async function upscale2(buffer, size = 2, anime = false) {
  try {
    return await new Promise((resolve, reject) => {
      if(!buffer) return reject("undefined buffer input!");
      if(!Buffer.isBuffer(buffer)) return reject("invalid buffer input");
      if(!/(2|4|6|8|16)/.test(size.toString())) return reject("invalid upscale size!")
      jimp.read(Buffer.from(buffer)).then(image => {
        const { width, height } = image.bitmap;
        let newWidth = width * size;
        let newHeight = height * size;
        const form = new FormData();
        form.append("name", "upscale-" + Date.now())
        form.append("imageName", "upscale-" + Date.now())
        form.append("desiredHeight", newHeight.toString())
        form.append("desiredWidth", newWidth.toString())
        form.append("outputFormat", "png")
        form.append("compressionLevel", "none")
        form.append("anime", anime.toString())
        form.append("image_file", buffer, {
          filename: "upscale-" + Date.now() + ".png",
          contentType: 'image/png',
        })
        axios.post("https://api.upscalepics.com/upscale-to-size", form, {
          headers: {
            ...form.getHeaders(),
            origin: "https://upscalepics.com",
            referer: "https://upscalepics.com"
          }
        }).then(res => {
          const data = res.data;
          if(data.error) return reject("something error from upscaler api!");
          resolve({
            status: true,
            image: data.bgRemoved
          })
        }).catch(reject)
      }).catch(reject)
    })
  } catch (e) {
    return { status: false, message: e };
  }
}