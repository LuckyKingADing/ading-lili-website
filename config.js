// ============================================================
// 💕 Ading & Lili 的专属配置文件
// 修改下面的信息来定制你们的网站
// ============================================================

const CONFIG = {
  // 你们的名字
  names: {
    him: "Ading",
    her: "Lili",
    display: "Ading & Lili",
  },

  // 重要日期 (格式: YYYY-MM-DD)
  dates: {
    loveDate: "2026-04-28",     // 在一起的日子
    hisBirthday: "2000-01-01",   // 他的生日
    herBirthday: "2000-07-11",   // 她的生日
    anniversary: "2026-04-28",   // 纪念日
  },

  // 日期显示标签
  dateLabels: {
    hisBirthday: "他的生日",
    herBirthday: "她的生日",
    anniversary: "在一起的那天",
  },

  // 恋爱时间线
  timeline: [
    { date: "2026.03.16", title: "第一次认识", desc: "因机缘巧合相识于我在小红书发的帖子" },
    { date: "2026.04.28", title: "第一次见面", desc: "在广州南高铁站第一次见面，她穿着白衬衫和西裤，刚面试完一家公司，我从深圳过来，我们在地铁14号线相遇，彼此面带微笑" },
    { date: "2026.04.28", title: "在一起了", desc: "出地铁站我牵了她的手，正式在一起了，正式成为彼此的恋人 💕" },
  ],

  // 网站访问密码 (简单保护，让女朋友第一次访问时输入)
  accessPassword: "5201314",

  // 网站标题
  siteTitle: "Our Love Journey",

  // 歌单 (音乐文件放入 music/ 文件夹)
  playlist: [
    { name: "春娇与志明", artist: "街道办GDC&欧阳耀莹", file: "music/春娇与志明-街道办GDC&欧阳耀莹.mp3" },
    { name: "Everglow", artist: "Coldplay", file: "music/Coldplay - Everglow.flac" },
    { name: "不属于地球上的", artist: "江楠江楠", file: "music/不属于地球上的-江楠江楠.flac" },
    { name: "溯 (Reverse)", artist: "CORSAK胡梦周,马吟吟", file: "music/溯 (Reverse)-CORSAK胡梦周,马吟吟.flac" },
    { name: "烂在鲜花阳光的地方", artist: "快乐老家", file: "https://6164-ading-d1g2dcqrs47be3e97-1353717227.tcb.qcloud.la/ading-lili/music/%E7%83%82%E5%9C%A8%E9%B2%9C%E8%8A%B1%E9%98%B3%E5%85%89%E7%9A%84%E5%9C%B0%E6%96%B9-%E5%BF%AB%E4%B9%90%E8%80%81%E5%AE%B6.mp3" },
  ],

  // 照片设置
  photos: {
    useCloudStorage: true,    // 云存储模式已启用，照片从 CloudBase 数据库加载
    cloudPath: "ading-lili/photos", // 云存储中照片文件夹路径
    batchSize: 10,           // 每批加载数量
    initialBatches: 5,       // 首次加载批数
    scrollDistance: 1000,    // 距底部多少像素时加载更多
    folder: "images",        // 原图文件夹 (本地 fallback)
    thumbFolder: "images/thumbs", // 缩略图文件夹 (本地 fallback)
  },

  // 今日情话（每日展示一句，支持 \n 多行）
  dailyQuotes: [
    { text: "爱你的时候\n时间太少，呼吸不够\n我化作分身万千，\n我借来生前与死后。", source: "海桑" },
    { text: "你是我生命中最美好的意外。", source: "Ading" },
    { text: "想牵你的手，走过春夏秋冬。", source: "Lili" },
    { text: "你的笑容，是我每天最期待的风景。", source: "" },
    { text: "世界那么大，我只想和你在一起。", source: "" },
    { text: "遇见你，是我这辈子最大的幸运。", source: "Ading" },
    { text: "每一天醒来，第一件事就是想你。", source: "Lili" },
    { text: "海上月是天上月，眼前人是心上人。", source: "张爱玲" },
    { text: "春风十里，不如你。", source: "冯唐" },
    { text: "既见君子，云胡不喜。", source: "诗经" },
    { text: "愿得一心人，白首不相离。", source: "卓文君" },
    { text: "死生契阔，与子成说。\n执子之手，与子偕老。", source: "诗经" },
    { text: "山有木兮木有枝，心悦君兮君不知。", source: "越人歌" },
    { text: "我喜欢你\n不光是因为你的样子\n还因为和你在一起时\n我的样子。", source: "罗伊·克里夫特" },
  ],

  // 腾讯云 CloudBase 配置
  cloudbase: {
    env: "ading-d1g2dcqrs47be3e97",
    region: "ap-shanghai",
  },
};
