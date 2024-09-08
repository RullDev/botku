import { delay, jidNormalizedUser } from "@whiskeysockets/baileys";
import util from "util";
import { exec } from "child_process";
import fs from "fs";
import { G4F } from "g4f";
import sdxlAnime from "./components/sdxl-anime.js";
import ytdl from "node-yt-dl";
import * as Func from "./lib/function.js";
import Color from "./lib/color.js";
import { blackbox } from "./components/ai.js";
import moment from "moment-timezone";
import { addSpam, ResetSpam, addFilter, isFiltered } from "./lib/spam.js";
import Quotee from "./components/quote.js";
import { upscale, upscale2 } from "./components/upscale.js";
import axios from "axios";
import igdl from "./components/ig.js";
import serialize, { getContentType } from "./lib/serialize.js";
const server_eror = JSON.parse(
  fs.readFileSync("./database/json/func_error.json"),
);
const welcomeJson = JSON.parse(
  fs.readFileSync("./database/json/func_welcome.json"),
);
const db_menfess = JSON.parse(
  fs.readFileSync("./database/json/func_menfess.json"),
);
import tiktok from "./components/tiktok.js";
import searchYtFromNode from "./components/ytdl.js";
const orang_spam = [];
const time = moment().tz("Asia/Jakarta").format("HH:mm:ss");
/**
 *
 * @param {import('@whiskeysockets/baileys').WASocket} hisoka
 * @param {any} store
 * @param {import('@whiskeysockets/baileys').WAMessage} m
 */
export default async function message(hisoka, store, m) {
  try {
    if (m.key && m.key.remoteJid === "status@broadcast") return;
    if (!m.message) return;

    const type = getContentType(m.message);
    const quotedType =
      getContentType(
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
      ) || null;
    if (type == "ephemeralMessage") {
      m.message = m.message.ephemeralMessage.message;
    }
    if (type == "viewOnceMessage") {
      m.message = m.message.viewOnceMessage.message;
    }
    var body =
      m.message?.conversation ||
      m.message[type]?.text ||
      m.message[type]?.caption ||
      m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      m.message?.buttonsResponseMessage?.selectedButtonId ||
      m.message?.templateButtonReplyMessage?.selectedId ||
      null;
    if (body == undefined) {
      body = "";
    }
    let quoted = m.isQuoted ? m.quoted : m;
    var sender = m.isGroup ? m.key.participant : m.key.remoteJid;
    const groupMetadata = m?.isGroup
      ? await hisoka.groupMetadata(m?.from).catch((e) => {})
      : {};
    const participants = m?.isGroup
      ? (await groupMetadata.participants) || []
      : [];
    let args = body.trim().split(" ").slice(1);
    let q = args.join(" ");
    const isCmd = /^[#!.,\/]/.test(body);
    sender = sender.includes(":")
      ? sender.split(":")[0] + "@s.whatsapp.net"
      : sender;
    let downloadM = async (filename) =>
      await hisoka.downloadMediaMessage(quoted, filename);
    const from = m.key.remoteJid;
    let isCommand = (m.prefix && m.body.startsWith(m.prefix)) || false;
    const isWelcome = m.isGroup ? welcomeJson.includes(from) : false;
    const botNumber = hisoka.user.id.includes(":")
      ? hisoka.user.id.split(":")[0] + "@s.whatsapp.net"
      : hisoka.user.id;
    const isSticker = type == "stickerMessage";
    //sleeping
    const sleep = async (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    // mengabaikan pesan dari bot
    if (m.isBot) return;

    // memunculkan ke log
    if (m.message && !m.isBot) {
      console.log(
        Color.cyan("Dari"),
        Color.cyan(hisoka.getName(m.from)),
        Color.blueBright(m.from),
      );
      console.log(
        Color.yellowBright("Chat"),
        Color.yellowBright(
          m.isGroup
            ? `Grup (${m.sender} : ${hisoka.getName(m.sender)})`
            : "Pribadi",
        ),
      );
      console.log(
        Color.greenBright("Pesan :"),
        Color.greenBright(m.body || m.type),
      );
    }

    //menfess
    const cekPesan = (satu, dua) => {
      let x2 = false;
      Object.keys(db_menfess).forEach((i) => {
        if (db_menfess[i].id == dua) {
          x2 = i;
        }
      });
      if (x2 !== false) {
        if (satu == "id") {
          return db_menfess[x2].id;
        }
        if (satu == "teman") {
          return db_menfess[x2].teman;
        }
      }
      if (x2 == false) {
        return null;
      }
    };

    const setRoom = (satu, dua, tiga) => {
      Object.keys(db_menfess).forEach((i) => {
        if (db_menfess[i].id == dua) {
          if (satu == "±id") {
            db_menfess[i].id = tiga;
            fs.writeFileSync(
              "./database/json/func_menfess.json",
              JSON.stringify(db_menfess),
            );
          }
          if (satu == "±teman") {
            db_menfess[i].teman = tiga;
            fs.writeFileSync(
              "./database/json/func_menfess.json",
              JSON.stringify(db_menfess),
            );
          }
        }
      });
    };

    // Function for Anti Spam
    ResetSpam(orang_spam);

    const spampm = () => {
      console.log(
        Color.cyan(`[${time}]`),
        Color.red("[SPAM]"),
        Color.yellowBright(m.prefix + m.command),
        "from",
        Color.blue(m.sender),
      );
      addSpam(m.sender, orang_spam);
      m.reply(`_Kamu terdeteksi spam bot, lakukan perintah setelah 5 detik!_`);
    };

    if (m.command && isFiltered(m.sender) && !m.isGroup) return spampm();
    if (m.command && m.isOwner) addFilter(m.sender);

    // command
    switch (isCommand ? m.command.toLowerCase() : false) {
      case "menu":
        {
          const sections = {
            "ᯓ *`⌞Anonymous / Menfess⌝`*": ["menfess"],
            "ᯓ *`⌞Main⌝`*": [
              "ping",
              "rules",
              "owner",
              "donasi",
              "listuser",
              "ai",
            ],
            "ᯓ *`⌞Downloader⌝`*": ["tiktok", "play"],
            "ᯓ *`⌞Tools⌝`*": [
              "sticker",
              "tourl",
              "animedif",
              "remini",
              "upscale",
              "rvo",
              "qc",
              "ngl",
              "pinterest",
            ],
            "ᯓ *`⌞Group (Optional)⌝`*": ["kick", "link"],
          };

          let tek = `Halo, Kak *@${hisoka.getName(m.sender)}* !\nAku Izumii Menfess Bot, siap membantu Kakak mengirimkan pesan rahasia kepada crush atau pacar secara anonim. Yuk, sampaikan perasaanmu dengan aman dan seru bersama Izumii...ᡣ𐭩

Functions: *Baileys*\n\n`;

          Object.keys(sections).forEach((section) => {
            tek += `${section}\n`;
            sections[section].forEach((command, index) => {
              tek += ` *${index + 1}.* ${m.prefix}${command}\n`;
            });
            tek += `\n`;
          });

          hisoka.sendMessage(m.from, {
            text: tek,
            contextInfo: {
              externalAdReply: {
                showAdAttribution: true,
                title: `${moment.tz("Asia/Jakarta").format("dddd, DD MMMM YYYY")}`,
                body: "Menfess BOT By Rulzz",
                thumbnailUrl:
                  "https://telegra.ph/file/02e1f5bf1c34a9b832e2d.jpg",

                sourceUrl: "https://chat.whatsapp.com/GTOEMmRfyexBfo0fiqCZ1j",
                mediaType: 1,
                renderLargerThumbnail: true,
              },
            },
          });
        }
        break;

      //===Tools===//
      case "hd":
      case "remini":
        {
          hisoka.enhancer = hisoka.enhancer ? hisoka.enhancer : {};
          if (m.sender in hisoka.enhancer)
            return m.reply("Mohon tunggu, masih ada proses");
          if (/image|webp/.test(quoted.msg.mimetype)) {
            hisoka.enhancer[m.sender] = true;
            try {
              let media = await downloadM();
              let upload = await Func.upload.pomf(media);
              let res = await Func.getBuffer(upload);
              let imageData = Buffer.from(res, "binary");

              let pros = await upscale(imageData, "enhance");
              var error;
              hisoka.sendMessage(
                m.from,
                { image: pros, caption: "Berhasil MengHDkan Gambar Ke Remini" },
                { quoted: m },
              );
            } catch (err) {
              console.error(err);
              m.reply("Fitur error, Coba beberapa saat lagi");
              error = true;
              delete hisoka.enhancer[m.sender];
            } finally {
              if (error) return m.reply("Error memproses gambar.");
              delete hisoka.enhancer[m.sender];
            }
          } else {
            m.reply(
              `Reply Gambar Dan Gunakan Perintah ${m.prefix + m.command}`,
            );
          }
        }
        break;

      //===Downloader==//

      case "tiktok": {
        if (!/tiktok.com/.test(m.text)) {
          return m.reply("Masukkan URL TikTok yang valid.");
        }

        try {
          // Ambil data dari scrapper TikTok
          const data = await tiktok(m.text);

          if (!data || !data.status) {
            return m.reply("Konten TikTok tidak ditemukan.");
          }

          // Jika tipe konten adalah video
          if (data.type === "video") {
            await hisoka.sendMessage(
              m.from,
              {
                video: {
                  url:
                    data.video.server1 ||
                    data.video.serverHD ||
                    data.video.server2,
                },
                caption: `Sukses Mendownload Video TikTok\n\nCaption: ${data.caption}`,
              },
              { quoted: m },
            );
          }

          // Jika tipe konten adalah gambar (image slide)
          if (data.type === "image") {
            for (const imageUrl of data.images) {
              await hisoka.sendMessage(
                m.from,
                {
                  image: { url: imageUrl },
                },
                { quoted: m },
              );
            }
          }
        } catch (error) {
          console.error("Error:", error.message);
          m.reply(`Terjadi kesalahan: ${error.message}`);
        }
        break;
      }

      case "ig": {
        if (!/instagram.com/.test(m.text)) {
          return m.reply("Masukkan URL Instagram yang valid.");
        }

        try {
          const data = await igdl(m.text);

          if (!data || data.length === 0) {
            return m.reply("Konten Instagram tidak ditemukan.");
          }

          for (const res of data) {
            if (res.includes("https://scontent.cdninstagram.com")) {
              await hisoka.sendMessage(
                m.from,
                { image: { url: res } },
                { quoted: m },
              );
            } else {
              await hisoka.sendMessage(
                m.from,
                { video: { url: res } },
                { quoted: m },
              );
            }
          }
        } catch (error) {
          console.error("Error:", error.message);
          m.reply(`Terjadi kesalahan: ${error.message}`);
        }
        break;
      }

      case "play":
        {
          if (!m.text)
            return m.reply("Masukan judul lagu yang ingin kmu putar.");

          try {
            // Download audio dari YouTube
            const audioData = await searchYtFromNode(m.text);

            // Kirim informasi tentang audio yang didownload
            await hisoka.sendMessage(m.from, {
              text: `*Judul:* ${audioData.title}\n*Artis:* ${audioData.artist}`,
              quoted: m,
            });

            // Kirim file audio ke pengguna
            await hisoka.sendMessage(m.from, {
              audio: {
                url: audioData.url,
              },
              mimetype: "audio/mp4",
              fileName: audioData.title,
              contextInfo: {
                externalAdReply: {
                  showAdAttribution: true,
                  mediaType: 1,
                  mediaUrl: audioData.url,
                  title: audioData.title,
                  body: "Success Downloading Audio",
                  sourceUrl: audioData.artist,
                  thumbnailUrl: audioData.thumbnail,
                  renderLargerThumbnail: true,
                },
              },
            });
          } catch (error) {
            console.error("Error:", error.message);
            m.reply(`Terjadi kesalahan`);
          }
        }
        break;

      case "ytdl":
        {
          // Memeriksa apakah URL yang diberikan adalah URL YouTube yang valid (baik link panjang maupun pendek)
          if (
            !/(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/.test(m.text)
          ) {
            return m.reply("Masukkan URL YouTube yang valid.");
          }

          try {
            // Mengunduh video dari YouTube menggunakan node-yt-dl
            const videoInfo = await ytdl.search(m.text); // Mengambil info video
            const videoInpo = videoInfo.data[0];
            const videoUrl = await ytdl.mp4(m.text); // Mengambil URL video dengan kualitas tertinggi

            if (videoUrl.media) {
              // Mengirim informasi video dan URL download
              await hisoka.sendMessage(
                m.from,
                {
                  video: { url: videoUrl.media },
                  mimetype: "video/mp4",
                  caption: `🎬 *Judul*: ${videoInpo.title}\n🕊️ *Artis*: ${videoInpo.author.name}\n🔗 *Link*: ${m.text}`,
                },
                { quoted: m },
              );
            } else {
              m.reply("Gagal mendapatkan video, coba lagi nanti.");
            }
          } catch (error) {
            console.error("Error during YouTube download:", error);
            m.reply(
              "Terjadi kesalahan saat mencoba mengambil video dari YouTube.",
            );
          }
        }
        break;

      case "listuser":
        {
          try {
            const data = fs.readFileSync("./database/json/func_menfess.json");
            const menfessList = JSON.parse(data);

            // Filter out entries with null values
            const validMenfessList = menfessList.filter(
              (entry) => entry.id && entry.teman,
            );

            if (validMenfessList.length === 0) {
              return hisoka.sendMessage(m.from, {
                text: "Tidak ada menfess yang valid ditemukan.",
              });
            }

            hisoka.sendMessage(m.from, {
              text: `Total pengguna confess berjumlah ${validMenfessList.length} orang`,
            });
          } catch (err) {
            console.error("Error:", err);
            hisoka.sendMessage(m.from, {
              text: "Gagal membaca atau memproses daftar menfess.",
            });
          }
        }
        break;

            case "ping":
case "info": {
  let os = (await import("os")).default;
  let { performance } = (await import("perf_hooks")).default;

  // Mulai menghitung waktu respons
  const start = performance.now();

  // Spesifikasi sistem palsu tanpa GPU
  const fakeCores = 16; // Jumlah core CPU palsu
  const fakeCpuModel = "AMD Ryzen 9 5950X 16-Core Processor @ 3.4GHz";
  const fakeTotalMem = 1 * 1024 * 1024 * 1024 * 1024; // 1 TB
  const fakeLoadAverage = [0.10, 0.20, 0.15]; // Load average palsu

  // Waktu respons asli
  const realResponseTime = (performance.now() - start).toFixed(3);

  // Uptime sistem asli
  const realUptimeSeconds = os.uptime();
  const uptimeDays = Math.floor(realUptimeSeconds / 86400);
  const uptimeHours = Math.floor((realUptimeSeconds % 86400) / 3600);
  const uptimeMinutes = Math.floor((realUptimeSeconds % 3600) / 60);
  const uptimeSecs = Math.floor(realUptimeSeconds % 60);

  // Fungsi untuk menghitung RAM palsu secara dinamis
  const generateFakeUsedMem = (realUsedMem, realTotalMem) => {
    const maxFluctuation = realTotalMem * 0.05; // Fluktuasi maksimum sebesar 5% dari total memori asli
    const fluctuation = Math.random() * maxFluctuation;
    return realUsedMem + fluctuation > realTotalMem
      ? realUsedMem
      : realUsedMem + fluctuation;
  };

  // Memori sistem asli
  const realTotalMem = os.totalmem();
  const realFreeMem = os.freemem();
  const realUsedMem = realTotalMem - realFreeMem;

  // Hitung penggunaan RAM palsu yang dinamis
  const fakeUsedMem = generateFakeUsedMem(realUsedMem, realTotalMem);

  // Format nilai memori menjadi GB atau TB saja
  const formatMemory = (bytes) => {
    if (bytes >= 1024 ** 4) {
      return (bytes / 1024 ** 4).toFixed(2) + " TB"; // Jika di atas 1 TB
    } else {
      return (bytes / 1024 ** 3).toFixed(2) + " GB"; // Jika di bawah 1 TB
    }
  };

  const formattedUsedMem = formatMemory(fakeUsedMem);
  const formattedTotalMem = formatMemory(fakeTotalMem);

  // Format load average palsu
  const loadAverage = fakeLoadAverage.map((avg) => avg.toFixed(2)).join(", ");

  // Menyusun informasi sistem palsu tanpa GPU
  const serverInfo = `Server Information:\n
- CPU Cores: ${fakeCores}
- CPU Model: ${fakeCpuModel}
- Platform: ${os.platform()}
- Architecture: ${os.arch()}
- Uptime: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSecs}s
- RAM: ${formattedUsedMem} / ${formattedTotalMem}
- Load Average: ${loadAverage}
- Response Time: ${realResponseTime} seconds`.trim();

  m.reply(serverInfo);
}
break;

            
      case "owner":
        {
          const ownerNumber = JSON.parse(process.env.OWNER)[0];

          const vcard =
            "BEGIN:VCARD\n" +
            "VERSION:3.0\n" +
            `FN:Rulzz\n` +
            `ORG:Izumii;\n` +
            `TEL;type=MSG;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}\n` +
            "END:VCARD";

          await hisoka.sendMessage(
            m.from,
            { contacts: { displayName: "Owner", contacts: [{ vcard }] } },
            { quoted: m },
          );
        }
        break;

      case "quoted":
      case "q":
        if (!m.isQuoted) return m.reply("Reply Pesan");
        try {
          var message = await serialize(
            hisoka,
            await store.loadMessage(m.from, m.quoted.id),
            store,
          );
          if (!message.isQuoted) return m.reply("Pesan quoted gaada");
          await m.reply({ forward: message.quoted, force: true });
        } catch (e) {
          return m.reply("Pesan gaada");
        }
        break;

      case "rvo":
        if (!quoted.msg.viewOnce) return m.reply("Reply Pesan Sekali Lihat");
        quoted.msg.viewOnce = false;
        await m.reply({ forward: quoted, force: true });
        break;

      case "getsw":
      case "sw":
        {
          if (!store.messages["status@broadcast"].array.length === 0)
            return m.reply("Gaada 1 status pun");
          let contacts = Object.values(store.contacts);
          let [who, value] = m.text.split(/[,|\-+&]/);
          value = value?.replace(/\D+/g, "");

          let sender;
          if (m.mentions.length !== 0) sender = m.mentions[0];
          else if (m.text)
            sender = contacts.find((v) =>
              [v.name, v.verifiedName, v.notify].some(
                (name) =>
                  name && name.toLowerCase().includes(who.toLowerCase()),
              ),
            )?.id;

          let stories = store.messages["status@broadcast"].array;
          let story = stories
            .filter(
              (v) =>
                (v.key && v.key.participant === sender) ||
                v.participant === sender,
            )
            .filter((v) => v.message && v.message.protocolMessage?.type !== 0);
          if (story.length === 0) return m.reply("Gaada sw nya");
          if (value) {
            if (story.length < value)
              return m.reply("Jumlahnya ga sampe segitu");
            await m.reply({ forward: story[value - 1], force: true });
          } else {
            for (let msg of story) {
              await delay(1500);
              await m.reply({ forward: msg, force: true });
            }
          }
        }
        break;

      case "listsw":
        {
          if (!store.messages["status@broadcast"].array.length === 0)
            return m.reply("Gaada 1 status pun");
          let stories = store.messages["status@broadcast"].array;
          let story = stories.filter(
            (v) => v.message && v.message.protocolMessage?.type !== 0,
          );
          if (story.length === 0) return m.reply("Status gaada");
          const result = {};
          story.forEach((obj) => {
            let participant = obj.key.participant || obj.participant;
            participant = jidNormalizedUser(
              participant === "status_me" ? hisoka.user.id : participant,
            );
            if (!result[participant]) {
              result[participant] = [];
            }
            result[participant].push(obj);
          });
          let type = (mType) =>
            getContentType(mType) === "extendedTextMessage"
              ? "text"
              : getContentType(mType).replace("Message", "");
          let text = "";
          for (let id of Object.keys(result)) {
            if (!id) return;
            text += `*- ${hisoka.getName(id)}*\n`;
            text += `${result[id].map((v, i) => `${i + 1}. ${type(v.message)}`).join("\n")}\n\n`;
          }
          await m.reply(text.trim(), { mentions: Object.keys(result) });
        }
        break;

      case "upsw":
        if (!m.isOwner) {
          let statusJidList = [
            jidNormalizedUser(hisoka.user.id),
            ...Object.values(store.contacts)
              .filter((v) => v.isContact)
              .map((v) => v.id),
          ];
          let colors = [
            "#7ACAA7",
            "#6E257E",
            "#5796FF",
            "#7E90A4",
            "#736769",
            "#57C9FF",
            "#25C3DC",
            "#FF7B6C",
            "#55C265",
            "#FF898B",
            "#8C6991",
            "#C69FCC",
            "#B8B226",
            "#EFB32F",
            "#AD8774",
            "#792139",
            "#C1A03F",
            "#8FA842",
            "#A52C71",
            "#8394CA",
            "#243640",
          ];
          let fonts = [0, 1, 2, 6, 7, 8, 9, 10];
          if (!quoted.isMedia) {
            let text = m.text || m.quoted?.body || "";
            if (!text) return m.reply("Mana text?");
            await hisoka.sendMessage(
              "status@broadcast",
              { text },
              {
                backgroundColor:
                  colors[Math.floor(Math.random() * colors.length)],
                textArgb: 0xffffffff,
                font: fonts[Math.floor(Math.random() * colors.length)],
                statusJidList,
              },
            );
            await m.reply(`Up status ke : ${statusJidList.length} Kontak`);
          } else if (/audio/.test(quoted.msg.mimetype)) {
            await hisoka.sendMessage(
              "status@broadcast",
              {
                audio: await downloadM(),
                mimetype: "audio/mp4",
                ptt: true,
                waveform: [100, 0, 100, 0, 100, 0, 100],
              },
              {
                backgroundColor:
                  colors[Math.floor(Math.random() * colors.length)],
                statusJidList,
              },
            );
            await m.reply(`Up status ke : ${statusJidList.length} Kontak`);
          } else {
            let type = /image/.test(quoted.msg.mimetype)
              ? "image"
              : /video/.test(quoted.msg.mimetype)
                ? "video"
                : false;
            if (!type) return m.reply("Type tidak didukung");
            await hisoka.sendMessage(
              "status@broadcast",
              {
                [type]: await downloadM(),
                caption: m.text || m.quoted?.body || "",
              },
              { statusJidList },
            );
            await m.reply(`Up status ke : ${statusJidList.length} Kontak`);
          }
        }
        break;

      case "sticker":
      case "s":
        if (/image|video|webp/.test(quoted.msg.mimetype)) {
          let media = await downloadM();
          if (quoted.msg?.seconds > 10)
            return m.reply("Video diatas durasi 10 detik gabisa");
          let exif;
          if (m.text) {
            let [packname, author] = m.text.split(/[,|\-+&]/);
            exif = {
              packName: packname ? packname : "",
              packPublish: author ? author : "",
            };
          } else {
            exif = {
              packName: process.env.packName,
              packPublish: process.env.packPublish,
            };
          }

          let sticker = await (
            await import("./lib/sticker.js")
          ).writeExif({ mimetype: quoted.msg.mimetype, data: media }, exif);
          await m.reply({ sticker });
        } else if (m.mentions.length !== 0) {
          for (let id of m.mentions) {
            await delay(1500);
            let url = await hisoka.profilePictureUrl(id, "image");
            let media = await Func.fetchBuffer(url);
            let sticker = await (
              await import("./lib/sticker.js")
            ).writeExif(media, {
              packName: process.env.packName,
              packPublish: process.env.packPublish,
            });
            await m.reply({ sticker });
          }
        } else if (
          /(https?:\/\/.*\.(?:png|jpg|jpeg|webp|mov|mp4|webm|gif))/i.test(
            m.text,
          )
        ) {
          for (let url of Func.isUrl(m.text)) {
            await delay(1500);
            let media = await Func.fetchBuffer(url);
            let sticker = await (
              await import("./lib/sticker.js")
            ).writeExif(media, {
              packName: process.env.packName,
              packPublish: process.env.packPublish,
            });
            await m.reply({ sticker });
          }
        } else {
          await m.reply("Error");
        }
        break;

      case "qc": {
        const targetUser = m.quoted ? m.quoted.sender : m.sender;
        const targetPushName = m.quoted ? m.quoted.pushName : m.pushName;
        const avatar = await hisoka
          .profilePictureUrl(targetUser, "image")
          .catch(
            () =>
              "https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg",
          );

        // Ambil teks dari pesan atau yang di-quote
        const messageText = m.text || (m.quoted && m.quoted.text);
        if (!messageText)
          return m.reply("Silakan masukkan pesan atau kutip pesan");

        // Buat gambar dari teks dan avatar
        const res = await Quotee(messageText, avatar, targetPushName);
        const imageData = Buffer.from(res.result.image, "base64");

        const exif = {
          packName: process.env.packName,
          packPublish: process.env.packPublish,
        };

        // Buat dan kirim stiker
        const sticker = await (
          await import("./lib/sticker.js")
        ).writeExif({ mimetype: "image/png", data: imageData }, exif);
        await m.reply({ sticker });
        break;
      }

      case "animedif":
        {
          if (!m.isGroup)
            return m.reply("Fitur ini hanya bisa digunakan dalam grup!");
          if (!m.text)
            return m.reply(`*• Example:* ${m.prefix + m.command} 1girl, cute`);

          try {
              await hisoka.sendMessage(
              m.from,
              { react: { text: `⏳`, key: m.key } },
              { quoted: m },
            );
            const result = await sdxlAnime(m.text);

            if (result.status) {
              await hisoka.sendMessage(
                m.from,
                {
                  image: { url: result.image },
                  caption: `Berikut adalah hasil dari prompt: ${m.text}`,
                },
                { quoted: m },
              );
            } else {
              m.reply(`Gagal menghasilkan gambar: ${result.message}`);
            }
          } catch (error) {
            console.error("Error generating anime image:", error);
            m.reply(
              "Terjadi kesalahan saat menghasilkan gambar. Silakan coba lagi.",
            );
          }
        }
        break;

      case "upscale":
        {
          if (!m.quoted || !m.quoted.isMedia)
            return m.reply("Silakan reply ke gambar yang ingin di-upscale!");

          const buffer = await downloadM();
          const anime = m.args.includes("anime");

          try {
            await hisoka.sendMessage(
              m.from,
              { react: { text: `⏳`, key: m.key } },
              { quoted: m },
            );
            const result = await upscale2(buffer, "4", anime);
            if (result.status) {
              await hisoka.sendMessage(
                m.from,
                {
                  image: { url: result.image },
                  caption: `Gambar berhasil di-upscale!`,
                },
                { quoted: m },
              );
            } else {
              m.reply("Upscale gagal, coba lagi nanti.");
            }
          } catch (error) {
            console.error("Error during upscale:", error);
            m.reply("Terjadi kesalahan saat mencoba upscale gambar.");
          }
        }
        break;

      case "ai":
        {
          hisoka.rulz = hisoka.rulz ? hisoka.rulz : {};

          const startAISession = (from) => {
            hisoka.rulz[from] = {
              pesan: [],
              timer: null,
            };
          };

          const stopAISession = (from) => {
            if (hisoka.rulz[from]) {
              clearTimeout(hisoka.rulz[from].timer);
              delete hisoka.rulz[from];
              m.reply(
                "[ ✓ ] Sesi chat dihentikan karena kamu tidak ada aktivitas bersama AI.",
              );
            }
          };

          const resetSessionTimer = (from) => {
            if (hisoka.rulz[from] && hisoka.rulz[from].timer) {
              clearTimeout(hisoka.rulz[from].timer);
            }
            hisoka.rulz[from].timer = setTimeout(
              () => stopAISession(from),
              60000,
            ); // 1 menit
          };

          if (!m.text) {
            return m.reply(`*Example:* ${m.prefix + m.command} Hallo`);
          }

          if (!hisoka.rulz[m.from]) {
            startAISession(m.from);
          }

          hisoka.rulz[m.from].pesan.push({ role: "user", content: m.text });

          try {
            let res = await blackbox(m.text);

            if (res) {
              hisoka.rulz[m.from].pesan.push({
                role: "assistant",
                content: res,
              });
              m.reply(res);
            } else {
              m.reply("Error: Tidak ada respon dari AI.");
            }

            resetSessionTimer(m.from);
          } catch (error) {
            console.error(error);
            m.reply("Terjadi kesalahan saat menghubungi AI.");
            resetSessionTimer(m.from);
          }
        }
        break;

      case "pinterest":
      case "pin":
        {
          if (!m.text)
            return m.reply(`*• Example:* ${m.prefix + m.command} cewe anime`);

          const query = encodeURIComponent(m.text); // Encode query untuk digunakan di URL
          const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${query}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${query}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559`;

          try {
            const response = await axios.get(url);
            const data = response.data;

            if (
              data &&
              data.resource_response &&
              data.resource_response.data &&
              data.resource_response.data.results &&
              data.resource_response.data.results.length > 0
            ) {
              const results = data.resource_response.data.results;

              // Pilih gambar secara acak dari hasil pencarian
              const randomResult =
                results[Math.floor(Math.random() * results.length)];

              if (
                randomResult.images &&
                randomResult.images.orig &&
                randomResult.images.orig.url
              ) {
                const imageUrl = randomResult.images.orig.url;

                // Mengirimkan gambar ke dalam chat
                await hisoka.sendMessage(
                  m.from,
                  {
                    image: { url: imageUrl },
                    caption: `Berikut adalah hasil pencarian gambar untuk: ${m.text}`,
                  },
                  { quoted: m },
                );
              } else {
                m.reply("Gagal menemukan gambar yang cocok.");
              }
            } else {
              m.reply("Tidak ada hasil yang ditemukan untuk query tersebut.");
            }
          } catch (error) {
            console.error("Error fetching Pinterest image:", error);
            m.reply(
              "Terjadi kesalahan saat mencari gambar di Pinterest. Silakan coba lagi.",
            );
          }
        }
        break;

      case "ngl":
        {
          const [username, message] = m.text.split("|");
          if (!username || !message) {
            return m.reply(
              `Penggunaan: ${m.prefix + m.command} username | pesan`,
            );
          }

          const link = /^(http|https):\/\/ngl.link/gi.test(username)
            ? username
            : /ngl.link/gi.test(username)
              ? `https://${username}`
              : `https://ngl.link/${username}`;

          try {
            const response = await axios.post("https://ngl.link/api/submit", {
              username: username.replace(/https?:\/\/ngl.link\//, ""),
              question: message.trim(),
              deviceId: "23d7346e-7d22-4256-80f3-dd4ce3fd8878",
              gameSlug: "",
              referrer: "",
            });

            m.reply(
              `Berhasil mengirim pesan NGL ke *${username}*\nPesan: *${message}*`,
            );
          } catch (err) {
            m.reply("Failed to send NGL. Please try again later.");
            console.error(err);
          }
        }
        break;

      case "exif":
        {
          let webp = (await import("node-webpmux")).default;
          let img = new webp.Image();
          await img.load(await downloadM());
          await m.reply(util.format(JSON.parse(img.exif.slice(22).toString())));
        }
        break;

      case "tourl":
        {
          if (!quoted.isMedia) return m.reply("Reply pesan media");
          if (Number(quoted.msg?.fileLength) > 350000000)
            return m.reply("Kegeden mas");
          let media = await downloadM();
          let url =
            /image|video/i.test(quoted.msg.mimetype) &&
            !/webp/i.test(quoted.msg.mimetype)
              ? await Func.upload.pomf(media)
              : await Func.upload.pomf(media);
          await m.reply(url);
        }
        break;

      case "ht":
      case "hidetag":
        {
          if (!m.isOwner) return m.reply("Kamu gada akses wlee");
          if (!m.isGroup) return m.reply("Khusus Digrup Saja");
          if (!m.text) return m.reply("Mana teksnya");
          let fkontak = {
            key: {
              participants: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              fromMe: false,
              id: "Hi!!",
            },
            message: {
              contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split("@")[0]}:${m.sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
              },
            },
            participant: "0@s.whatsapp.net",
          };

          hisoka.sendMessage(
            m.from,
            {
              text: m.text ? m.text : "",
              mentions: participants.map((a) => a.id),
            },
            { quoted: fkontak },
          );
        }
        break;

      case "kick": {
        // Periksa apakah bot berada dalam grup dan apakah bot adalah admin
        if (!m.isGroup)
          return m.reply("Perintah ini hanya dapat digunakan di dalam grup.");
        if (!m.isAdmin) return m.reply("Kamu bukan admin");
        if (!m.isBotAdmin)
          return m.reply(
            "Bot harus menjadi admin untuk menggunakan perintah ini.",
          );

        // Tentukan target untuk dikeluarkan
        let blockwww = null;

        if (m.mentionedJid && m.mentionedJid.length > 0) {
          blockwww = m.mentionedJid[0];
        } else if (m.quoted) {
          blockwww = m.quoted.sender;
        } else if (m.text) {
          blockwww = m.text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        }

        // Jika tidak ada target yang valid, kirim pesan kesalahan
        if (!blockwww)
          return m.reply(
            "Tidak dapat menemukan pengguna yang akan dikeluarkan.",
          );

        // Lakukan tindakan pengeluaran
        await hisoka.groupParticipantsUpdate(m.from, [blockwww], "remove");
        break;
      }

      case "rules":
        {
          let text_rules = `*───「 RULES-BOT 」───*

1. Dilarang spam bot!
Sanksi: *WARN/SOFT BLOCK*

2. Dilarang telepon bot!
Sanksi: *SOFT BLOCK*

3. Dilarang mengejek bot!
Sanksi: *PERMANENT BLOCK*

Jika sudah paham rulesnya ketik *.menu* untuk memulai bot.`;
          m.reply(text_rules);
        }
        break;
      //
      case "donate":
      case "donasi":
        {
          let capt = `Donasikan BOT ini agar bisa terus aktif digunakan dengan cara scan kode QRIS tersebut\n\nTerima kasih untuk yang sudah mau support bot ini :)`;
          hisoka.sendMessage(
            m.from,
            {
              image: fs.readFileSync("./database/images/qris.jpg"),
              caption: capt,
            },
            { quoted: m },
          );
        }
        break;

      case "link":
        if (!m.isGroup && !m.isBotAdmin)
          return m.reply(
            "Gabisa, kalo ga karena bot bukan admin ya karena bukan grup",
          );
        await m.reply(
          "https://chat.whatsapp.com/" +
            (m.metadata?.inviteCode || (await hisoka.groupInviteCode(m.from))),
        );
        break;

      case "delete":
      case "del":
        if (quoted.fromMe) {
          await hisoka.sendMessage(m.from, { delete: quoted.key });
        } else {
          if (!m.isBotAdmin) return m.reply("Bot bukan admin");
          if (!m.isAdmin) return m.reply("Lhu bukan admin paok 😂");
          await hisoka.sendMessage(m.from, { delete: quoted.key });
        }
        break;

      case "restart":
        if (!m.isOwner) return m.reply("Kamu Bukan Owner");
        hisoka.sendMessage(
          m.from,
          { react: { text: `✅`, key: m.key } },
          { quoted: m },
        );
        exec("npm run restart:pm2", (err) => {
          if (err) return process.send("reset");
        });
        break;

      case "sc":
        await m.reply("https://github.com/DikaArdnt/readsw");
        break;

      //====MENFESS====//

      case "auto_room":
        {
          if (m.isGroup) return;
        }
        break;
      //
      case "stop":
      case "stopchat":
        {
          if (m.isGroup)
            return m.reply(`Hanya dapat digunakan lewat private chat bot!`);
          if (cekPesan("id", sender) == null)
            return m.reply(
              `Kamu tidak memiliki room chat, silahkan buat room dengan contoh dibawah ini.\n\n*Format :*\n#menfess nomor | pesan\n\n*Contoh :*\n#menfess 628xxx | hai\n\n*Note :*\nNomor harus berawal dari 628xxx`,
            );
          var aku = sender;
          var dia = cekPesan("teman", aku);
          setRoom("±teman", dia, null);
          setRoom("±teman", aku, null);
          await m.reply(`𝘽𝙚𝙧𝙝𝙖𝙨𝙞𝙡 𝙠𝙚𝙡𝙪𝙖𝙧 𝙙𝙖𝙧𝙞 𝙧𝙤𝙤𝙢 𝙘𝙝𝙖𝙩 ✓`);
          setRoom("±id", aku, null);
          setRoom("±id", dia, null);
          hisoka.sendMessage(dia, {
            text: `𝙍𝙤𝙤𝙢 𝙘𝙝𝙖𝙩 𝙩𝙚𝙡𝙖𝙝 𝙙𝙞𝙝𝙚𝙣𝙩𝙞𝙠𝙖𝙣 𝙤𝙡𝙚𝙝 𝙥𝙖𝙩𝙣𝙚𝙧 𝙘𝙝𝙖𝙩 𝙠𝙖𝙢𝙪 :(`,
          });
        }
        break;
      //
      case "confes":
      case "confess":
      case "manfes":
      case "manfess":
      case "menfes":
      case "menfess":
        {
          if (m.isGroup)
            return m.reply("Fitur Ini Hanya Bisa Digunakan Di Private Chat!");
          if (cekPesan("id", sender) !== null)
            return m.reply(
              `_Kamu sedang terhubung dengan seseorang, ketik *.stop* untuk keluar dari room chat!_`,
            );
          if (!q)
            return hisoka.sendMessage(
              from,
              {
                image: {
                  url: "https://telegra.ph/file/1fbc7028b10255a917d2a.jpg",
                },
                caption: `*Format Fitur Menfess*\nKirim pesan rahasia ke seseorang\n\n*Format :*\n${m.prefix + m.command} nomor | pesan\n\n*Contoh :*\n${m.prefix + m.command} 628xxx | hai\n\n*Note :*\nNomor harus berawal dari 628xxx`,
              },
              { quoted: m },
            );
          let num = q.split("|")[0].replace(/[^0-9]/g, "");
          let pesan_teman = q.split("|")[1];
          if (!num)
            return m.reply(
              `Masukkan format dengan benar!\n\n*Format :*\n${m.prefix + m.command} nomor | pesan\n\n*Contoh :*\n${m.prefix + m.command} 628xxx | hai\n\n*Note :*\nNomor harus berawal dari 628xxx`,
            );
          if (!pesan_teman)
            return m.reply(
              `Masukkan format dengan benar!\n\n*Format :*\n${m.prefix + m.command} nomor | pesan\n\n*Contoh :*\n${m.prefix + m.command} 628xxx | hai\n\n*Note :*\nNomor harus berawal dari 628xxx`,
            );
          if (q.split("|")[2])
            return m.reply(
              `Masukkan format dengan benar!\n\n*Format :*\n${m.prefix + m.command} nomor | pesan\n\n*Contoh :*\n${m.prefix + m.command} 628xxx | hai\n\n*Note :*\nNomor harus berawal dari 628xxx`,
            );
          if (num.startsWith("08"))
            return m.reply(`_Gunakan nomor dengan awalan 628xxx_`);
          var cekap = await hisoka.onWhatsApp(num + "@s.whatsapp.net");
          if (cekap.length == 0)
            return m.reply(`_Nomor telepon tidak terdaftar di WhatsApp!_`);
          if (num == botNumber.split("@")[0])
            return m.reply(`_Tidak dapat mengirim menfess ke nomor bot!_`);
          if (num == sender.split("@")[0])
            return m.reply(`_Tidak dapat mengirim menfess ke nomor sendiri!_`);
          var penerimanyo = num + "@s.whatsapp.net";
          if (cekPesan("id", penerimanyo) !== null)
            return m.reply(
              `_Gagal mengirimkan undangan karena dia sedang terhubung dengan orang lain!_`,
            );
          let text_menfess = `*──「 ANONYMOUS CHAT 」──*\n\n_Hallo Kak 👋_\n_Ada pesan *Menfess/Rahasia*_\n\n*• Dari :* Seseorang\n*• Pesan :* ${pesan_teman}\n\n_Pesan ini ditulis oleh seseorang_\n_Bot hanya menyampaikan saja!_`;
          var tulis_pesan = `𝗖𝗵𝗮𝘁 𝗔𝗻𝗼𝗻𝘆𝗺𝗼𝘂𝘀 𝗧𝗲𝗿𝗵𝘂𝗯𝘂𝗻𝗴 ✓
𝗦𝗶𝗹𝗮𝗵𝗸𝗮𝗻 𝗞𝗶𝗿𝗶𝗺 𝗣𝗲𝘀𝗮𝗻 ✍

𝗞𝗲𝘁𝗶𝗸 .𝙨𝙩𝙤𝙥 𝘂𝗻𝘁𝘂𝗸 𝗺𝗲𝗻𝗴𝗮𝗸𝗵𝗶𝗿𝗶 𝗰𝗵𝗮𝘁!

𝗡𝗼𝘁𝗲 :
- 𝗥𝗼𝗼𝗺 𝗰𝗵𝗮𝘁 𝗶𝗻𝗶 𝗯𝗲𝗿𝘀𝗶𝗳𝗮𝘁 𝗿𝗮𝗵𝗮𝘀𝗶𝗮
- 𝗣𝗲𝘀𝗮𝗻 𝘁𝗶𝗱𝗮𝗸 𝗱𝗮𝗽𝗮𝘁 𝗱𝗶𝗯𝗮𝘁𝗮𝗹𝗸𝗮𝗻
- 𝗣𝗲𝘀𝗮𝗻𝗺𝘂 𝗮𝗸𝗮𝗻 𝘁𝗲𝗿𝗸𝗶𝗿𝗶𝗺 𝗷𝗶𝗸𝗮 𝘁𝗲𝗿𝗱𝗮𝗽𝗮𝘁 𝗿𝗲𝗮𝗰𝘁𝗶𝗼𝗻 📩

𝗗𝗶𝗹𝗮𝗿𝗮𝗻𝗴 𝗦𝗽𝗮𝗺/𝗧𝗲𝗹𝗲𝗽𝗼𝗻 𝗕𝗼𝘁
𝗦𝗮𝗻𝗸𝘀𝗶 : 𝗕𝗮𝗻𝗻𝗲𝗱 𝗣𝗲𝗿𝗺𝗮𝗻𝗲𝗻!`;
          var id_satu = sender;
          var id_dua = num + "@s.whatsapp.net";
          if (!id_satu) return m.reply(`Parameter tidak ada!`);
          if (!id_dua) return m.reply(`Parameter tidak ada!`);
          if (cekPesan("id", id_dua) !== null)
            return m.reply(
              `_Gagal menerima undangan karena kamu sedang terhubung dengan orang lain!_`,
            );
          if (cekPesan("id", id_satu) !== null)
            return m.reply(
              `_Gagal menerima undangan karena pengirim sedang terhubung dengan orang lain!_`,
            );
          db_menfess.push({ id: id_satu, teman: id_dua });
          fs.writeFileSync(
            "./database/json/func_menfess.json",
            JSON.stringify(db_menfess),
          );
          db_menfess.push({ id: id_dua, teman: id_satu });
          fs.writeFileSync(
            "./database/json/func_menfess.json",
            JSON.stringify(db_menfess),
          );
          await hisoka.sendMessage(`${num}@s.whatsapp.net`, {
            text: text_menfess,
          });
          await hisoka.sendMessage(id_satu, { text: tulis_pesan });
          await hisoka.sendMessage(id_dua, { text: tulis_pesan });
        }
        break;

      default:
        if (isCmd && !m.isGroup) {
          m.reply(
            `_Perintah *${m.prefix + m.command}* tidak ada didaftar menu!_`,
          );
        }

        //Antilink

        if (body.match(/(chat\.whatsapp\.com\/|whatsapp\.com\/channel\/)/gi)) {
          if (!m.isBotAdmin && !m.isGroup) return;
          if (m.isAdmin || m.isOwner) return;

          if (m.isBotAdmin) {
            await hisoka.sendMessage(m.from, {
              delete: {
                remoteJid: m.from,
                fromMe: false,
                id: m.key.id,
                participant: m.key.participant,
              },
            });

            await hisoka.sendMessage(m.from, {
              text: `@${m.sender.split("@")[0]} Terdeteksi mengirimkan link grup/ch WhatsApp, Jangan ya dek yaa.`,
              contextInfo: { mentionedJid: [m.sender] },
            });
          }
        }

        if (
          [">", "eval", "=>"].some((a) =>
            m.command.toLowerCase().startsWith(a),
          ) &&
          m.isOwner
        ) {
          let evalCmd = "";
          try {
            evalCmd = /await/i.test(m.text)
              ? eval("(async() => { " + m.text + " })()")
              : eval(m.text);
          } catch (e) {
            evalCmd = e;
          }
          new Promise((resolve, reject) => {
            try {
              resolve(evalCmd);
            } catch (err) {
              reject(err);
            }
          })
            ?.then((res) => m.reply(util.format(res)))
            ?.catch((err) => m.reply(util.format(err)));
        }

        if (
          ["$", "exec"].some((a) => m.command.toLowerCase().startsWith(a)) &&
          m.isOwner
        ) {
          try {
            exec(m.text, async (err, stdout) => {
              if (err) return m.reply(util.format(err));
              if (stdout) return m.reply(util.format(stdout));
            });
          } catch (e) {
            await m.reply(util.format(e));
          }
        }

        //Function menfess
        if (!m.isGroup && !m.key.fromMe && !isCmd) {
          if (cekPesan("id", sender) == null) return;
          if (cekPesan("teman", sender) == false) return;
          try {
            if (type == "conversation" || type == "extendedTextMessage") {
              try {
                var chat_anonymous = m.message.extendedTextMessage.text;
              } catch (err) {
                var chat_anonymous = m.message.conversation;
              }
              let text_nya_menfes = `*ANONYMOUS CHAT*
💬 : ${chat_anonymous}`;
              await hisoka.sendMessage(cekPesan("teman", sender), {
                text: text_nya_menfes,
              });
              await sleep(2000);
              hisoka.sendMessage(
                from,
                { react: { text: `📩`, key: m.key } },
                { quoted: m },
              );
            } else {
              await hisoka.sendMessage(cekPesan("teman", sender), {
                forward: m,
              });
              await sleep(2000);
              hisoka.sendMessage(
                from,
                { react: { text: `📩`, key: m.key } },
                { quoted: m },
              );
            }
          } catch (err) {
            return;
          }
        }
    }
  } catch (err) {
    console.error(`[ERROR] ${err.stack}`);
    server_eror.push({ error: `${err.stack}` });
    await fs.writeFileSync(
      "./database/json/func_error.json",
      JSON.stringify(server_eror),
    );
  }
}
