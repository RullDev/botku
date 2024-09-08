import fs from 'fs';

export const groupResponse = async (hisoka, update) => {
    const metadata = await hisoka.groupMetadata(update.id);
    for (let participant of update.participants) {
        try {
            let num = participant.split("@")[0]; // Ambil nomor tanpa @s.whatsapp.net
            if (update.action === 'add') {
                // Welcome Message
                await hisoka.sendMessage(update.id, {
                    text: `Halo @${num} 👋, selamat bergabung di *${metadata.subject}* \n\nMohon baca deskripsi grup terlebih dahulu untuk mengikuti aturan grup ini!`,
                    mentions: [participant]
                });
            } else if (update.action === 'remove') {
                // Goodbye Message
                await hisoka.sendMessage(update.id, {
                    text: `Sampai jumpa @${num}, semoga sukses di perjalananmu berikutnya!`,
                    mentions: [participant]
                });
            }
        } catch (err) {
            console.log('Error:', err);
        }
    }
};
