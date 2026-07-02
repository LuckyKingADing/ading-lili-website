#!/usr/bin/env python3
"""
💕 照片预处理脚本

使用方法:
  1. 将你们的照片放入 images/ 文件夹
  2. 运行: python3 scripts/preprocess.py
  3. 脚本会:
     - 按拍摄时间重命名照片 (0.jpg, 1.jpg, ...)
     - 生成缩略图到 images/thumbs/ 文件夹
     - 将非 JPG 格式转换为 JPG
"""

import os
import sys
from pathlib import Path
from datetime import datetime

try:
    from PIL import Image, ImageOps
    from PIL.ExifTags import TAGS
except ImportError:
    print("需要安装 Pillow 库: pip install Pillow")
    sys.exit(1)


IMAGES_DIR = Path("images")
THUMBS_DIR = IMAGES_DIR / "thumbs"
THUMB_SIZE = (400, 400)
SUPPORTED_FORMATS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".bmp", ".gif"}


def get_exif_date(image_path):
    """从图片 EXIF 数据中提取拍摄时间"""
    try:
        img = Image.open(image_path)
        exif_data = img._getexif()
        if exif_data:
            for tag, value in exif_data.items():
                tag_name = TAGS.get(tag, tag)
                if tag_name == "DateTimeOriginal":
                    return datetime.strptime(value, "%Y:%m:%d %H:%M:%S")
    except Exception:
        pass
    # 如果没有 EXIF 数据，使用文件修改时间
    mtime = os.path.getmtime(image_path)
    return datetime.fromtimestamp(mtime)


def collect_images():
    """收集所有支持格式的图片"""
    images = []
    for f in IMAGES_DIR.iterdir():
        if f.is_file() and f.suffix.lower() in SUPPORTED_FORMATS:
            date = get_exif_date(f)
            images.append((f, date))
    # 按拍摄时间倒序排列 (最新的在前)
    images.sort(key=lambda x: x[1], reverse=True)
    return images


def create_thumbnail(src_path, thumb_path):
    """创建正方形缩略图：从图片中间裁剪"""
    img = Image.open(src_path)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")
    w, h = img.size
    side = min(w, h)
    # 计算居中裁剪区域
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    img = img.resize(THUMB_SIZE, Image.LANCZOS)
    img.save(thumb_path, "JPEG", quality=85)


def main():
    THUMBS_DIR.mkdir(exist_ok=True)

    images = collect_images()
    if not images:
        print(f"在 {IMAGES_DIR}/ 中没有找到图片")
        return

    print(f"找到 {len(images)} 张照片，开始处理...\n")

    for idx, (path, date) in enumerate(images):
        new_name = f"{idx}.jpg"
        new_path = IMAGES_DIR / new_name
        thumb_path = THUMBS_DIR / new_name

        # 如果原文件不是 jpg，转换为 jpg
        if path.suffix.lower() not in {".jpg", ".jpeg"} or path != new_path:
            img = Image.open(path)
            img = ImageOps.exif_transpose(img)
            img = img.convert("RGB")
            img.save(new_path, "JPEG", quality=95)
            # 删除原始文件 (如果不是新文件)
            if path != new_path and path.exists():
                path.unlink()

        # 生成缩略图
        create_thumbnail(new_path, thumb_path)

        date_str = date.strftime("%Y-%m-%d %H:%M")
        print(f"  [{idx}] {new_name} <- {date_str}")

    print(f"\n完成! 共处理 {len(images)} 张照片")
    print(f"缩略图已保存到 {THUMBS_DIR}/")


if __name__ == "__main__":
    main()
