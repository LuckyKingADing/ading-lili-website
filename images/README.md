将你们的照片放入这个文件夹。

支持格式: JPG, JPEG, PNG, WebP, HEIC, BMP, GIF

放好照片后运行:
```bash
cd scripts
python3 preprocess.py
```

脚本会自动:
1. 按拍摄时间排列照片
2. 重命名为 0.jpg, 1.jpg, 2.jpg...
3. 生成缩略图到 thumbs/ 文件夹
