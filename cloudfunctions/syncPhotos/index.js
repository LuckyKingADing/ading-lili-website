const tcb = require("@cloudbase/node-sdk");
const app = tcb.init({ env: tcb.SYMBOL_CURRENT_ENV });

exports.main = async (event) => {
  const db = app.database();
  const folder = event.folder || "ading-lili/photos";
  const baseUrl = event.baseUrl || "https://6164-ading-d1g2dcqrs47be3e97-1353717227.tcb.qcloud.la";

  if (!event.files || !Array.isArray(event.files) || event.files.length === 0) {
    return {
      success: false,
      error: "请传入 files 参数",
      usage: '{ "files": ["新照片.JPG"] }',
    };
  }

  const collection = db.collection("photos");
  const newPhotos = event.files.map((name, i) => ({
    url: `${baseUrl}/${folder}/${name}`,
    thumbUrl: `${baseUrl}/${folder}/${name}?imageMogr2/thumbnail/400x400`,
    date: "",
    uploadTime: Date.now() - i * 1000,
  }));

  try {
    // 如果传了 replaceAll: true，清空全部重新写入
    if (event.replaceAll) {
      const oldData = await collection.limit(500).get();
      for (const doc of oldData.data || []) {
        await collection.doc(doc._id).remove();
      }
      for (const photo of newPhotos) {
        await collection.add(photo);
      }
      return { success: true, count: newPhotos.length, mode: "replace" };
    }

    // 增量模式：检查 url 是否已存在，只插入新照片
    let added = 0;
    for (const photo of newPhotos) {
      const existing = await collection.where({ url: photo.url }).limit(1).get();
      if (!existing.data || existing.data.length === 0) {
        await collection.add(photo);
        added++;
      }
    }
    return { success: true, added, skipped: newPhotos.length - added, mode: "incremental" };
  } catch (e) {
    return { success: false, error: "数据库写入失败", detail: e.message };
  }
};
