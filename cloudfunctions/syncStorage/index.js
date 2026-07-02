const tcb = require("@cloudbase/node-sdk");
const app = tcb.init({ env: tcb.SYMBOL_CURRENT_ENV });

const BASE_URL = "https://6164-ading-d1g2dcqrs47be3e97-1353717227.tcb.qcloud.la";
const PHOTOS_PATH = "ading-lili/photos/";
const MUSIC_PATH = "ading-lili/music/";

// 从文件路径提取文件名
function getFileName(key) {
  return key.split("/").pop();
}

// 去掉路径前导斜杠
function cleanKey(key) {
  return key.startsWith("/") ? key.slice(1) : key;
}

exports.main = async (event) => {
  const db = app.database();
  const records = event.Records || [];
  const results = { photos: [], music: [], deleted: [] };

  for (const record of records) {
    const cosInfo = record.cos || {};
    const obj = cosInfo.cosObject || {};
    const key = cleanKey(obj.key || "");
    const cosEvent = cosInfo.cosEvent || "";
    const isDelete = cosEvent.includes("Delete");

    if (!key) continue;

    // 照片
    if (key.startsWith(PHOTOS_PATH)) {
      const fileName = getFileName(key);
      if (!fileName) continue;

      const collection = db.collection("photos");
      const url = `${BASE_URL}/${key}`;

      if (isDelete) {
        const existing = await collection.where({ url }).limit(1).get();
        for (const doc of existing.data || []) {
          await collection.doc(doc._id).remove();
        }
        results.deleted.push(key);
      } else {
        const existing = await collection.where({ url }).limit(1).get();
        if (!existing.data || existing.data.length === 0) {
          await collection.add({
            url,
            thumbUrl: `${url}?imageMogr2/thumbnail/400x400`,
            date: "",
            uploadTime: Date.now(),
          });
          results.photos.push(fileName);
        }
      }
    }

    // 音乐
    if (key.startsWith(MUSIC_PATH)) {
      const fileName = getFileName(key);
      if (!fileName) continue;

      const collection = db.collection("music");
      const url = `${BASE_URL}/${key}`;

      // 从文件名解析歌名和歌手: "歌名 - 歌手.mp3" 或原名
      const nameWithoutExt = fileName.replace(/\.\w+$/, "");
      const parts = nameWithoutExt.split(" - ");
      const name = parts.length >= 2 ? parts[0].trim() : nameWithoutExt;
      const artist = parts.length >= 2 ? parts.slice(1).join(" - ").trim() : "";

      if (isDelete) {
        const existing = await collection.where({ url }).limit(1).get();
        for (const doc of existing.data || []) {
          await collection.doc(doc._id).remove();
        }
        results.deleted.push(key);
      } else {
        const existing = await collection.where({ url }).limit(1).get();
        if (!existing.data || existing.data.length === 0) {
          await collection.add({
            name,
            artist,
            url,
            uploadTime: Date.now(),
          });
          results.music.push(fileName);
        }
      }
    }
  }

  return { success: true, results };
};
