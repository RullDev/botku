import axios from "axios";

export default async function igdl(shortcode) {
    try {
        const response = await axios.request({
            method: "GET",
            url: `https://instagram-bulk-scraper-latest.p.rapidapi.com/media_info_from_shortcode/${shortcode}`,
            headers: {
                "x-rapidapi-key": "ba1dc4cb65mshcc8227df3f33837p1eba19jsnf7b987ec86dd",
                "x-rapidapi-host": "instagram-bulk-scraper-latest.p.rapidapi.com"
            }
        });

        const mediaData = response.data.data;
        const result = 
   mediaData.is_video ? mediaData.video_url : null
     
        return result;
    } catch (error) {
        return {};
    }
}
