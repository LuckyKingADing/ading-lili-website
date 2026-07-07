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

发布时 GitHub Actions 会对 dist/images 自动运行:
  python3 scripts/preprocess.py --images-dir dist/images
"""

import argparse
import os
import sys
import shutil
import tempfile
from pathlib import Path
from datetime import datetime

try:
    from PIL import Image, ImageOps
    from PIL.ExifTags import TAGS
except ImportError:
    print("需要安装 Pillow 库: python3 -m pip install Pillow")
    sys.exit(1)

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

THUMB_SIZE = (720, 720)
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


def collect_images(images_dir):
    """收集所有支持格式的图片"""
    images = []
    for f in images_dir.iterdir():
        if f.is_file() and f.suffix.lower() in SUPPORTED_FORMATS:
            date = get_exif_date(f)
            images.append((f, date))
    # 按拍摄时间倒序排列 (最新的在前)
    images.sort(key=lambda x: x[1], reverse=True)
    return images


def create_thumbnail(src_path, thumb_path):
    """创建等比缩略图，保留照片原始比例"""
    img = Image.open(src_path)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")
    img.thumbnail(THUMB_SIZE, Image.LANCZOS)
    img.save(thumb_path, "JPEG", quality=85)


def parse_args():
    parser = argparse.ArgumentParser(description="Preprocess website photos.")
    parser.add_argument(
        "--images-dir",
        default="images",
        help="Directory containing source photos. Defaults to images.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    images_dir = Path(args.images_dir)
    thumbs_dir = images_dir / "thumbs"

    if not images_dir.exists():
        print(f"{images_dir}/ 不存在")
        return

    images = collect_images(images_dir)
    if not images:
        print(f"在 {images_dir}/ 中没有找到图片")
        return

    print(f"找到 {len(images)} 张照片，开始处理...\n")

    temp_root = Path(tempfile.mkdtemp(prefix="photo-preprocess-"))
    temp_images = temp_root / "images"
    temp_thumbs = temp_root / "thumbs"
    temp_images.mkdir()
    temp_thumbs.mkdir()

    try:
        for idx, (path, date) in enumerate(images):
            new_name = f"{idx}.jpg"
            new_path = temp_images / new_name
            thumb_path = temp_thumbs / new_name

            img = Image.open(path)
            img = ImageOps.exif_transpose(img)
            img = img.convert("RGB")
            img.save(new_path, "JPEG", quality=95)

            create_thumbnail(new_path, thumb_path)

            date_str = date.strftime("%Y-%m-%d %H:%M")
            print(f"  [{idx}] {new_name} <- {date_str}")

        for f in images_dir.iterdir():
            if f.is_file() and f.suffix.lower() in SUPPORTED_FORMATS:
                f.unlink()

        if thumbs_dir.exists():
            shutil.rmtree(thumbs_dir)
        thumbs_dir.mkdir(exist_ok=True)

        for f in sorted(temp_images.iterdir()):
            shutil.move(str(f), images_dir / f.name)
        for f in sorted(temp_thumbs.iterdir()):
            shutil.move(str(f), thumbs_dir / f.name)
    finally:
        shutil.rmtree(temp_root, ignore_errors=True)

    print(f"\n完成! 共处理 {len(images)} 张照片")
    print(f"缩略图已保存到 {thumbs_dir}/")


if __name__ == "__main__":
    main()
