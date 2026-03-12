#!/usr/bin/env python3
"""
ELMA 學生 QR Code 批次產生器

從 CSV 讀取學生資料，為每位學生產生含 JWT 的 QR Code 圖片。
產生的 JWT 格式與 generate-qr-jwt.html 完全相同。

用法：
  python generate_qrcodes.py students.csv
  python generate_qrcodes.py students.csv -o output_dir --sheet
"""

import csv
import json
import base64
import time
import argparse
import sys
from pathlib import Path

try:
    import qrcode
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("缺少依賴套件，請先執行：")
    print("  pip install qrcode[pil] Pillow")
    sys.exit(1)


# ── JWT ───────────────────────────────────────────────────────────────────────

def make_unsigned_jwt(student_id: str, name: str) -> str:
    """產生無簽章 JWT，格式與 generate-qr-jwt.html 相同。"""
    def b64url(obj: dict) -> str:
        data = json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode()
        return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

    header  = {"alg": "none", "typ": "JWT"}
    payload = {"id": student_id, "name": name, "iat": int(time.time())}
    return f"{b64url(header)}.{b64url(payload)}."


# ── 字型 ──────────────────────────────────────────────────────────────────────

def load_font(size: int) -> ImageFont.FreeTypeFont:
    """依作業系統尋找中文字型，找不到則用預設點陣字型。"""
    candidates = [
        # macOS
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        # Windows
        "C:/Windows/Fonts/msjh.ttc",
        "C:/Windows/Fonts/mingliu.ttc",
        # Linux (需安裝 fonts-noto-cjk)
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except (IOError, OSError):
            continue
    return ImageFont.load_default()


# ── 圖片產生 ──────────────────────────────────────────────────────────────────

CARD_BG   = "#ffffff"
QR_DARK   = "#0f172a"
QR_LIGHT  = "#f1f5f9"
TEXT_MAIN = "#0f172a"
TEXT_SUB  = "#64748b"
BORDER    = "#e2e8f0"

def generate_student_card(student_id: str, name: str, qr_size: int = 280) -> Image.Image:
    """產生一張學生識別卡：QR Code + 姓名 + ID。"""
    # QR Code
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(make_unsigned_jwt(student_id, name))
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color=QR_DARK, back_color=QR_LIGHT)
    qr_img = qr_img.resize((qr_size, qr_size), Image.LANCZOS)

    # 字型
    font_name = load_font(20)
    font_id   = load_font(14)

    # 計算文字高度
    dummy = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    name_h = dummy.textbbox((0, 0), name, font=font_name)[3]
    id_h   = dummy.textbbox((0, 0), student_id, font=font_id)[3]

    padding    = 16
    label_area = padding + name_h + 6 + id_h + padding
    card_w     = qr_size + padding * 2
    card_h     = padding + qr_size + label_area

    card = Image.new("RGB", (card_w, card_h), CARD_BG)

    # 外框
    draw = ImageDraw.Draw(card)
    draw.rounded_rectangle([(0, 0), (card_w - 1, card_h - 1)], radius=12, outline=BORDER, width=2)

    # QR Code 貼上
    card.paste(qr_img, (padding, padding))

    # 分隔線
    sep_y = padding + qr_size + padding // 2
    draw.line([(padding, sep_y), (card_w - padding, sep_y)], fill=BORDER, width=1)

    # 姓名
    name_bbox = draw.textbbox((0, 0), name, font=font_name)
    name_w    = name_bbox[2] - name_bbox[0]
    name_x    = (card_w - name_w) // 2
    name_y    = sep_y + padding // 2
    draw.text((name_x, name_y), name, fill=TEXT_MAIN, font=font_name)

    # ID
    id_text  = f"ID: {student_id}"
    id_bbox  = draw.textbbox((0, 0), id_text, font=font_id)
    id_w     = id_bbox[2] - id_bbox[0]
    id_x     = (card_w - id_w) // 2
    id_y     = name_y + name_h + 6
    draw.text((id_x, id_y), id_text, fill=TEXT_SUB, font=font_id)

    return card


# ── 拼版 ──────────────────────────────────────────────────────────────────────

def generate_sheet(images: list, output_path: Path, cols: int = 3, gap: int = 20):
    """將所有識別卡拼成一張大圖（可列印用）。"""
    if not images:
        return

    card_w, card_h = images[0].size
    rows  = (len(images) + cols - 1) // cols
    bg    = 40

    sheet_w = cols * card_w + (cols - 1) * gap + bg * 2
    sheet_h = rows * card_h + (rows - 1) * gap + bg * 2

    sheet = Image.new("RGB", (sheet_w, sheet_h), "#f8fafc")

    for i, img in enumerate(images):
        col = i % cols
        row = i // cols
        x   = bg + col * (card_w + gap)
        y   = bg + row * (card_h + gap)
        sheet.paste(img, (x, y))

    sheet.save(output_path)
    print(f"\n拼版圖已輸出：{output_path}  ({sheet_w}×{sheet_h} px)")


# ── CSV 讀取 ──────────────────────────────────────────────────────────────────

def read_students(csv_path: Path, id_col: str, name_col: str) -> list[tuple[str, str]]:
    students = []
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for lineno, row in enumerate(reader, start=2):
            sid  = row.get(id_col, "").strip()
            name = row.get(name_col, "").strip()
            if not sid or not name:
                print(f"  [略過] 第 {lineno} 行：id 或 name 為空 → {dict(row)}")
                continue
            students.append((sid, name))
    return students


# ── 主程式 ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="ELMA 學生 QR Code 批次產生器",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
CSV 格式範例（students.csv）：
  id,name
  S001,王小明
  S002,李大華
  S003,陳美玲
""",
    )
    parser.add_argument("csv_file",             help="學生名單 CSV 路徑")
    parser.add_argument("-o", "--output",        default="qrcodes", help="輸出目錄（預設：qrcodes）")
    parser.add_argument("--id-col",              default="id",      help="CSV 中 ID 欄位名稱（預設：id）")
    parser.add_argument("--name-col",            default="name",    help="CSV 中姓名欄位名稱（預設：name）")
    parser.add_argument("--size",   type=int,    default=280,       help="QR Code 尺寸 px（預設：280）")
    parser.add_argument("--cols",   type=int,    default=3,         help="拼版每列張數（預設：3）")
    parser.add_argument("--sheet",  action="store_true",            help="額外產生可列印的拼版圖")
    args = parser.parse_args()

    csv_path = Path(args.csv_file)
    if not csv_path.exists():
        print(f"錯誤：找不到檔案 '{csv_path}'")
        sys.exit(1)

    students = read_students(csv_path, args.id_col, args.name_col)
    if not students:
        print("CSV 中沒有有效的學生資料，請確認欄位名稱是否正確。")
        sys.exit(1)

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"共 {len(students)} 位學生，開始產生 QR Code...\n")

    cards = []
    for sid, name in students:
        card     = generate_student_card(sid, name, qr_size=args.size)
        safe     = name.replace("/", "_").replace("\\", "_")
        out_path = output_dir / f"{sid}_{safe}.png"
        card.save(out_path)
        cards.append(card)
        print(f"  ✓  {name:<12}  ({sid})")

    print(f"\n個別圖片已輸出至：{output_dir}/")

    if args.sheet:
        sheet_path = output_dir / "sheet.png"
        generate_sheet(cards, sheet_path, cols=args.cols)


if __name__ == "__main__":
    main()
