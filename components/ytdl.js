import ytdl from 'node-yt-dl';

export default async function searchYtFromNode(query) {
    try {
        const search = await ytdl.search(query);
        if (!search.status) throw new Error('Video tidak ditemukan.');
        
        const data = search.data[0];
        const mp3 = await ytdl.mp3(data.url);

        if (!mp3.status) throw new Error('Gagal mendownload audio.');

        return { title: data.title, artist: data.author.name, url: mp3.media, thumbnail: data.img };
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}
