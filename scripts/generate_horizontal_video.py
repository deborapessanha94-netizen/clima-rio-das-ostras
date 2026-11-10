import os
import math
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_SECONDS = 31
TOTAL_FRAMES = FPS * TOTAL_SECONDS

FONT_REGULAR = "C:/Windows/Fonts/segoeui.ttf"
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_BLACK = "C:/Windows/Fonts/arialbd.ttf"

def get_font(bold=False, size=32):
    f_path = FONT_BOLD if bold else FONT_REGULAR
    try:
        return ImageFont.truetype(f_path, size)
    except Exception:
        return ImageFont.truetype(FONT_BLACK, size)

LOGO_PATH = "C:/Users/debor/.gemini/antigravity/scratch/logo_transparent.png"
FULL_CARD_PATH = "C:/Users/debor/.gemini/antigravity/brain/1a2d4b0a-d847-461b-a23b-26c56d91d2df/.user_uploaded/media_1794326559261_3899f4e3.png"

user_logo = None
if os.path.exists(LOGO_PATH):
    try:
        user_logo = Image.open(LOGO_PATH).convert("RGBA")
    except Exception as e:
        print("Could not load user_logo:", e)

full_card = None
if os.path.exists(FULL_CARD_PATH):
    try:
        full_card = Image.open(FULL_CARD_PATH).convert("RGBA")
    except Exception as e:
        print("Could not load full_card:", e)

# Particles
np.random.seed(42)
NUM_PARTICLES = 60
particle_x = np.random.uniform(20, WIDTH - 20, NUM_PARTICLES)
particle_y = np.random.uniform(0, HEIGHT, NUM_PARTICLES)
particle_speed = np.random.uniform(0.8, 2.5, NUM_PARTICLES)
particle_size = np.random.uniform(2, 6, NUM_PARTICLES)
particle_alpha = np.random.uniform(40, 160, NUM_PARTICLES)

base_bg = Image.new("RGBA", (WIDTH, HEIGHT), (15, 23, 42, 255))
bg_draw = ImageDraw.Draw(base_bg)
for y in range(HEIGHT):
    ratio = y / HEIGHT
    if ratio < 0.5:
        r1, g1, b1 = 13, 23, 46
        r2, g2, b2 = 28, 45, 84
        t = ratio / 0.5
    else:
        r1, g1, b1 = 28, 45, 84
        r2, g2, b2 = 12, 20, 40
        t = (ratio - 0.5) / 0.5
    r = int(r1 + (r2 - r1) * t)
    g = int(g1 + (g2 - g1) * t)
    b = int(b1 + (b2 - b1) * t)
    bg_draw.line([(0, y), (WIDTH, y)], fill=(r, g, b, 255))

def draw_rounded_rect(draw, bbox, fill, outline=None, width=1, radius=20):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def draw_header_bar(draw, frame_idx):
    top_y = 35
    draw.line([(80, top_y + 55), (WIDTH - 80, top_y + 55)], fill=(56, 189, 248, 60), width=2)
    f_brand = get_font(True, 26)
    draw.text((90, top_y + 12), "@tempoemriodasostras", font=f_brand, fill=(248, 250, 252, 240))
    
    badge_w = 260
    badge_h = 40
    badge_x = WIDTH - 90 - badge_w
    badge_y = top_y + 8
    draw_rounded_rect(draw, (badge_x, badge_y, badge_x + badge_w, badge_y + badge_h), fill=(249, 115, 22, 40), outline=(249, 115, 22, 180), radius=12, width=2)
    f_badge = get_font(True, 20)
    draw.text((badge_x + 18, badge_y + 8), "OUTUBRO / 2026", font=f_badge, fill=(255, 186, 115, 255))

def render_frame(frame_idx):
    frame_img = base_bg.copy()
    draw = ImageDraw.Draw(frame_img)
    
    for i in range(NUM_PARTICLES):
        py = (particle_y[i] - frame_idx * particle_speed[i]) % HEIGHT
        px = (particle_x[i] + math.sin(frame_idx * 0.03 + i) * 15) % WIDTH
        p_sz = int(particle_size[i])
        p_al = int(particle_alpha[i] * (0.6 + 0.4 * math.sin(frame_idx * 0.05 + i)))
        draw.ellipse([px, py, px + p_sz, py + p_sz], fill=(56, 189, 248, p_al))

    draw_header_bar(draw, frame_idx)

    if frame_idx < 140:
        render_scene_1(draw, frame_img, frame_idx)
    elif frame_idx < 320:
        render_scene_2(draw, frame_img, frame_idx - 140)
    elif frame_idx < 540:
        render_scene_3(draw, frame_img, frame_idx - 320)
    elif frame_idx < 710:
        render_scene_4(draw, frame_img, frame_idx - 540)
    elif frame_idx < 830:
        render_scene_5(draw, frame_img, frame_idx - 710)
    else:
        render_scene_6(draw, frame_img, frame_idx - 830)

    f_foot = get_font(False, 22)
    draw.text((WIDTH // 2, HEIGHT - 35), "Fontes: Estações Meteorológicas do Município", font=f_foot, fill=(148, 163, 184, 190), anchor="mm")

    return cv2.cvtColor(np.array(frame_img), cv2.COLOR_RGBA2BGR)

# SCENE 1: ABERTURA (Horizontal)
def render_scene_1(draw, frame_img, rel_frame):
    # Left column: Logo & Card, Right column: Titles & Highlights
    if user_logo:
        logo_w = 560
        logo_h = int(user_logo.height * (logo_w / user_logo.width))
        resized_logo = user_logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        frame_img.paste(resized_logo, (160, (HEIGHT - logo_h) // 2 - 20), resized_logo)

    # Right Card Glow Box
    box_w = 900
    box_h = 680
    box_x = 860
    box_y = (HEIGHT - box_h) // 2

    pulse = math.sin(rel_frame * 0.08) * 3
    draw_rounded_rect(draw, (box_x - pulse, box_y - pulse, box_x + box_w + pulse, box_y + box_h + pulse), 
                      fill=(24, 38, 70, 230), outline=(0, 229, 255, 180), radius=32, width=3)

    tag_w = 400
    tag_h = 44
    draw_rounded_rect(draw, (box_x + 50, box_y + 50, box_x + 50 + tag_w, box_y + 50 + tag_h), fill=(0, 229, 255, 35), outline=(0, 229, 255, 200), radius=22, width=2)
    draw.text((box_x + 50 + tag_w // 2, box_y + 50 + tag_h // 2), "RETROSPECTIVA METEOROLÓGICA", font=get_font(True, 20), fill=(0, 229, 255, 255), anchor="mm")

    draw.text((box_x + 50, box_y + 160), "PANORAMA DO CLIMA", font=get_font(True, 58), fill=(255, 255, 255))
    draw.text((box_x + 50, box_y + 265), "OUTUBRO 2026", font=get_font(True, 88), fill=(249, 115, 22))

    draw.line([(box_x + 50, box_y + 355), (box_x + 600, box_y + 355)], fill=(249, 115, 22, 220), width=4)
    draw.text((box_x + 50, box_y + 400), "RIO DAS OSTRAS • RJ", font=get_font(True, 36), fill=(226, 232, 240))
    draw.text((box_x + 50, box_y + 460), "Balanço Consolidado de Todas as Estações", font=get_font(False, 28), fill=(148, 163, 184))

    draw_rounded_rect(draw, (box_x + 50, box_y + 530, box_x + box_w - 50, box_y + 620), fill=(15, 23, 42, 200), outline=(56, 189, 248, 120), radius=18)
    draw.text((box_x + 75, box_y + 575), "🌧️ Um dos meses mais chuvosos do ano: 25 dias com precipitação!", font=get_font(True, 24), fill=(56, 189, 248), anchor="lm")

# SCENE 2: GRANDES NÚMEROS (Horizontal)
def render_scene_2(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 120), "VOLUME & FREQUÊNCIA DE CHUVA • OUTUBRO 2026", font=get_font(True, 42), fill=(255, 255, 255), anchor="mm")
    draw.text((WIDTH // 2, 165), "Atividade convectiva extraordinária registrada em Rio das Ostras", font=get_font(False, 24), fill=(148, 163, 184), anchor="mm")

    progress = min(1.0, rel_frame / 45.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    card_w = 540
    card_h = 700
    gap = 40
    start_x = (WIDTH - (3 * card_w + 2 * gap)) // 2
    c_y = 220

    # CARD 1: 25 DIAS COM CHUVA
    c1_x = start_x
    draw_rounded_rect(draw, (c1_x, c_y, c1_x + card_w, c_y + card_h), fill=(18, 30, 56, 230), outline=(56, 189, 248, 180), radius=28, width=3)
    draw_rounded_rect(draw, (c1_x + 35, c_y + 35, c1_x + 310, c_y + 80), fill=(2, 132, 199, 45), outline=(56, 189, 248, 220), radius=16, width=2)
    draw.text((c1_x + 172, c_y + 57), "FREQUÊNCIA RECORDE", font=get_font(True, 20), fill=(56, 189, 248), anchor="mm")

    dias_anim = int(25 * eased)
    draw.text((c1_x + 40, c_y + 160), f"{dias_anim} DIAS", font=get_font(True, 96), fill=(255, 255, 255))
    draw.text((c1_x + 40, c_y + 270), "COM CHUVA", font=get_font(True, 38), fill=(0, 229, 255))
    draw.text((c1_x + 40, c_y + 330), "em 31 dias monitorados\n(80% do mês com chuva)", font=get_font(False, 26), fill=(203, 213, 225))

    bar_y = c_y + 440
    draw_rounded_rect(draw, (c1_x + 40, bar_y, c1_x + card_w - 40, bar_y + 24), fill=(30, 41, 59, 255), radius=12)
    bar_fill = int((card_w - 80) * (25 / 31) * eased)
    if bar_fill > 20:
        draw_rounded_rect(draw, (c1_x + 40, bar_y, c1_x + 40 + bar_fill, bar_y + 24), fill=(0, 229, 255, 255), radius=12)
    draw.text((c1_x + 40, c_y + 520), "Chuva constante manteve solo\nsaturado e bacias cheias.", font=get_font(False, 22), fill=(148, 163, 184))

    # CARD 2: CHUVA MÉDIA REDE
    c2_x = start_x + card_w + gap
    draw_rounded_rect(draw, (c2_x, c_y, c2_x + card_w, c_y + card_h), fill=(18, 30, 56, 230), outline=(249, 115, 22, 180), radius=28, width=3)
    draw_rounded_rect(draw, (c2_x + 35, c_y + 35, c2_x + 295, c_y + 80), fill=(249, 115, 22, 45), outline=(249, 115, 22, 220), radius=16, width=2)
    draw.text((c2_x + 165, c_y + 57), "MÉDIA MUNICIPAL", font=get_font(True, 20), fill=(249, 115, 22), anchor="mm")

    val_anim = round(243.3 * eased, 1)
    draw.text((c2_x + 40, c_y + 160), f"{val_anim}", font=get_font(True, 96), fill=(255, 255, 255))
    draw.text((c2_x + 370, c_y + 200), "mm", font=get_font(True, 48), fill=(249, 115, 22))

    draw.text((c2_x + 40, c_y + 270), "MÉDIA GERAL", font=get_font(True, 38), fill=(249, 115, 22))
    draw.text((c2_x + 40, c_y + 330), "Volume acumulado na rede\nmuito acima da média normal", font=get_font(False, 26), fill=(203, 213, 225))

    draw_rounded_rect(draw, (c2_x + 40, c_y + 440, c2_x + card_w - 40, c_y + 580), fill=(30, 41, 59, 200), outline=(249, 115, 22, 120), radius=18)
    draw.text((c2_x + 60, c_y + 475), "⭐ PICO MÁXIMO:", font=get_font(True, 24), fill=(255, 215, 0))
    draw.text((c2_x + 60, c_y + 520), "410,0 mm em Rocha Leão", font=get_font(True, 30), fill=(255, 255, 255))

    # CARD 3: DIA MAIS CHUVOSO
    c3_x = start_x + (card_w + gap) * 2
    draw_rounded_rect(draw, (c3_x, c_y, c3_x + card_w, c_y + card_h), fill=(18, 30, 56, 230), outline=(168, 85, 247, 180), radius=28, width=3)
    draw_rounded_rect(draw, (c3_x + 35, c_y + 35, c3_x + 310, c_y + 80), fill=(168, 85, 247, 45), outline=(168, 85, 247, 220), radius=16, width=2)
    draw.text((c3_x + 172, c_y + 57), "EVENTO MAIS SEVERO", font=get_font(True, 20), fill=(192, 132, 252), anchor="mm")

    draw.text((c3_x + 40, c_y + 160), "02/10", font=get_font(True, 96), fill=(255, 255, 255))
    draw.text((c3_x + 40, c_y + 270), "DIA MAIS CHUVOSO", font=get_font(True, 36), fill=(192, 132, 252))

    draw_rounded_rect(draw, (c3_x + 40, c_y + 340, c3_x + card_w - 40, c_y + 450), fill=(30, 41, 59, 200), outline=(168, 85, 247, 120), radius=18)
    draw.text((c3_x + 60, c_y + 365), "Média na Rede em 24h:", font=get_font(False, 22), fill=(148, 163, 184))
    draw.text((c3_x + 60, c_y + 405), "48,0 mm", font=get_font(True, 38), fill=(255, 255, 255))

    draw_rounded_rect(draw, (c3_x + 40, c_y + 470, c3_x + card_w - 40, c_y + 580), fill=(30, 41, 59, 200), outline=(249, 115, 22, 120), radius=18)
    draw.text((c3_x + 60, c_y + 495), "Máxima Pontual em 24h:", font=get_font(False, 22), fill=(148, 163, 184))
    draw.text((c3_x + 60, c_y + 535), "84,3 mm", font=get_font(True, 38), fill=(249, 115, 22))

# SCENE 3: RANKING DE CHUVA (Horizontal)
def render_scene_3(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 120), "TOTAIS DE CHUVA POR ESTAÇÃO • OUTUBRO 2026", font=get_font(True, 42), fill=(255, 255, 255), anchor="mm")
    draw.text((WIDTH // 2, 165), "Ranking oficial dos pluviômetros em Rio das Ostras e arredores", font=get_font(False, 24), fill=(148, 163, 184), anchor="mm")

    stations_data = [
        {"name": "Rocha Leão (REBIO União)", "val": 410.0, "code": "IRIODA15", "badge": "1º LUGAR • RECORDE", "color": (249, 115, 22)},
        {"name": "Cantagalo (LERIP)", "val": 191.7, "code": "IRIODA16", "badge": "2º LUGAR", "color": (56, 189, 248)},
        {"name": "Praiamar / Divisa Sul", "val": 177.3, "code": "ICASIM5", "badge": "3º LUGAR", "color": (56, 189, 248)},
        {"name": "Praia da Tartaruga (Defesa Civil)", "val": 167.9, "code": "IRIODA17", "badge": "4º LUGAR", "color": (56, 189, 248)},
        {"name": "Costazul (Escola Jacinto)", "val": 131.3, "code": "IRIODA6", "badge": "5º LUGAR", "color": (56, 189, 248)}
    ]

    max_val = 410.0
    start_y = 230
    row_height = 115

    for idx, st in enumerate(stations_data):
        st_frame = max(0, rel_frame - idx * 7)
        progress = min(1.0, st_frame / 35.0)
        eased = 1.0 - math.pow(1.0 - progress, 3)

        row_y = start_y + idx * row_height
        box_w = 1720
        box_h = 95
        box_x = 100

        is_top = (idx == 0)
        border_col = (249, 115, 22, 220) if is_top else (56, 189, 248, 120)
        bg_col = (28, 38, 65, 230) if is_top else (18, 28, 50, 220)
        draw_rounded_rect(draw, (box_x, row_y, box_x + box_w, row_y + box_h), fill=bg_col, outline=border_col, radius=18, width=2 if not is_top else 3)

        draw.text((box_x + 30, row_y + 47), st["name"], font=get_font(True, 28), fill=(255, 255, 255), anchor="lm")

        # Badge pill
        badge_w = 170 if is_top else 110
        badge_x = box_x + 520
        badge_bg = (249, 115, 22, 50) if is_top else (2, 132, 199, 40)
        badge_border = (249, 115, 22, 220) if is_top else (56, 189, 248, 180)
        badge_txt = (255, 186, 115) if is_top else (56, 189, 248)
        draw_rounded_rect(draw, (badge_x, row_y + 26, badge_x + badge_w, row_y + 68), fill=badge_bg, outline=badge_border, radius=12, width=1)
        draw.text((badge_x + badge_w // 2, row_y + 47), st["badge"], font=get_font(True, 18), fill=badge_txt, anchor="mm")

        # Animated progress bar
        bar_x = box_x + 730
        bar_y = row_y + 30
        bar_max_w = 700
        bar_h = 36
        pill_r = bar_h // 2
        
        draw_rounded_rect(draw, (bar_x, bar_y, bar_x + bar_max_w, bar_y + bar_h), fill=(30, 41, 59, 240), radius=pill_r)

        ratio = (st["val"] / max_val) * eased
        fill_w = max(int(bar_max_w * ratio), pill_r * 2 if eased > 0.05 else 0)
        if fill_w > 0:
            fill_col = (249, 115, 22, 255) if is_top else (0, 229, 255, 255)
            draw_rounded_rect(draw, (bar_x, bar_y, bar_x + fill_w, bar_y + bar_h), fill=fill_col, radius=pill_r)

        val_display = round(st["val"] * eased, 1)
        draw.text((bar_x + bar_max_w + 35, row_y + 47), f"{val_display:.1f} mm", font=get_font(True, 34), fill=(255, 255, 255), anchor="lm")

    # Rio Jundiá card at the bottom
    j_y = start_y + 5 * row_height + 15
    draw_rounded_rect(draw, (100, j_y, WIDTH - 100, j_y + 115), fill=(16, 40, 50, 230), outline=(16, 185, 129, 180), radius=18, width=2)
    draw.text((140, j_y + 57), "🌊 Rio Jundiá (INEA Telemétrica 2241036): Vigilância contínua de cota fluvial e pluviometria telemétrica a cada 15 min", font=get_font(True, 26), fill=(52, 211, 153), anchor="lm")

# SCENE 4: VENTOS & TEMPERATURAS (Horizontal)
def render_scene_4(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 120), "VENTOS, RAJADAS & TEMPERATURAS • OUTUBRO 2026", font=get_font(True, 42), fill=(255, 255, 255), anchor="mm")
    draw.text((WIDTH // 2, 165), "Comportamento dinâmico do ar e extremos térmicos do mês", font=get_font(False, 24), fill=(148, 163, 184), anchor="mm")

    progress = min(1.0, rel_frame / 40.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    # 3 Cards Side by Side
    card_w = 540
    card_h = 700
    gap = 40
    start_x = (WIDTH - (3 * card_w + 2 * gap)) // 2
    c_y = 220

    # Card 1: Maior Rajada
    c1_x = start_x
    draw_rounded_rect(draw, (c1_x, c_y, c1_x + card_w, c_y + card_h), fill=(18, 30, 56, 230), outline=(249, 115, 22, 220), radius=28, width=3)
    draw_rounded_rect(draw, (c1_x + 35, c_y + 35, c1_x + 310, c_y + 80), fill=(249, 115, 22, 45), outline=(249, 115, 22, 220), radius=16, width=2)
    draw.text((c1_x + 172, c_y + 57), "RECORDE DE VENTO", font=get_font(True, 20), fill=(249, 115, 22), anchor="mm")

    raj_anim = round(62.3 * eased, 1)
    draw.text((c1_x + 40, c_y + 160), f"{raj_anim}", font=get_font(True, 96), fill=(255, 255, 255))
    draw.text((c1_x + 360, c_y + 200), "km/h", font=get_font(True, 48), fill=(249, 115, 22))

    draw.text((c1_x + 40, c_y + 280), "MAIOR RAJADA", font=get_font(True, 36), fill=(255, 255, 255))
    draw.text((c1_x + 40, c_y + 335), "Registrada em todo o município", font=get_font(False, 24), fill=(203, 213, 225))

    draw_rounded_rect(draw, (c1_x + 40, c_y + 410, c1_x + card_w - 40, c_y + 560), fill=(30, 41, 59, 200), outline=(249, 115, 22, 120), radius=18)
    draw.text((c1_x + 60, c_y + 450), "📍 Praia da Tartaruga (Defesa Civil)", font=get_font(True, 24), fill=(255, 255, 255))
    draw.text((c1_x + 60, c_y + 500), "Data: 26/10/2026 às 10:00h", font=get_font(False, 22), fill=(255, 186, 115))

    # Card 2: Dinâmica dos Ventos
    c2_x = start_x + card_w + gap
    draw_rounded_rect(draw, (c2_x, c_y, c2_x + card_w, c_y + card_h), fill=(18, 30, 56, 230), outline=(56, 189, 248, 180), radius=28, width=2)
    draw_rounded_rect(draw, (c2_x + 35, c_y + 35, c2_x + 310, c_y + 80), fill=(2, 132, 199, 45), outline=(56, 189, 248, 220), radius=16, width=2)
    draw.text((c2_x + 172, c_y + 57), "PADRÃO DOS VENTOS", font=get_font(True, 20), fill=(56, 189, 248), anchor="mm")

    draw.text((c2_x + 40, c_y + 140), "Vento Médio Mensal:", font=get_font(False, 22), fill=(148, 163, 184))
    draw.text((c2_x + 40, c_y + 195), "16,6 km/h", font=get_font(True, 56), fill=(255, 255, 255))
    draw.text((c2_x + 40, c_y + 260), "🧭 Predominante: NE (Nordeste)", font=get_font(True, 24), fill=(56, 189, 248))

    draw.line([(c2_x + 40, c_y + 320), (c2_x + card_w - 40, c_y + 320)], fill=(56, 189, 248, 80), width=2)

    draw.text((c2_x + 40, c_y + 360), "Velocidade Sustentada Máx:", font=get_font(False, 22), fill=(148, 163, 184))
    draw.text((c2_x + 40, c_y + 420), "51,1 km/h", font=get_font(True, 56), fill=(249, 115, 22))
    draw.text((c2_x + 40, c_y + 485), "Data: 25/10/2026", font=get_font(True, 24), fill=(255, 186, 115))

    # Card 3: Extremos Térmicos
    c3_x = start_x + (card_w + gap) * 2
    draw_rounded_rect(draw, (c3_x, c_y, c3_x + card_w, c_y + card_h), fill=(18, 30, 56, 230), outline=(16, 185, 129, 180), radius=28, width=2)
    draw_rounded_rect(draw, (c3_x + 35, c_y + 35, c3_x + 310, c_y + 80), fill=(16, 185, 129, 45), outline=(16, 185, 129, 220), radius=16, width=2)
    draw.text((c3_x + 172, c_y + 57), "EXTREMOS TÉRMICOS", font=get_font(True, 20), fill=(52, 211, 153), anchor="mm")

    # Mínima
    draw_rounded_rect(draw, (c3_x + 40, c_y + 120, c3_x + card_w - 40, c_y + 320), fill=(30, 41, 59, 200), outline=(56, 189, 248, 160), radius=18)
    draw.text((c3_x + 65, c_y + 150), "❄️ Menor Temperatura", font=get_font(False, 22), fill=(148, 163, 184))
    draw.text((c3_x + 65, c_y + 215), "18,4 °C", font=get_font(True, 60), fill=(56, 189, 248))
    draw.text((c3_x + 65, c_y + 275), "Madrugadas sob frente fria", font=get_font(False, 20), fill=(203, 213, 225))

    # Máxima
    draw_rounded_rect(draw, (c3_x + 40, c_y + 360, c3_x + card_w - 40, c_y + 560), fill=(30, 41, 59, 200), outline=(239, 68, 68, 160), radius=18)
    draw.text((c3_x + 65, c_y + 390), "☀️ Maior Temperatura", font=get_font(False, 22), fill=(148, 163, 184))
    draw.text((c3_x + 65, c_y + 455), "32,6 °C", font=get_font(True, 60), fill=(239, 68, 68))
    draw.text((c3_x + 65, c_y + 515), "Tardes sob atuação da ASAS", font=get_font(False, 20), fill=(203, 213, 225))

# SCENE 5: SISTEMAS METEOROLÓGICOS (Horizontal)
def render_scene_5(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 120), "SISTEMAS METEOROLÓGICOS ATUANTES • OUTUBRO 2026", font=get_font(True, 42), fill=(255, 255, 255), anchor="mm")
    draw.text((WIDTH // 2, 165), "Distribuição dos 31 dias por padrão atmosférico registrado", font=get_font(False, 24), fill=(148, 163, 184), anchor="mm")

    systems = [
        {"title": "Alta Subtropical do Atlântico Sul (ASAS)", "days": 12, "desc": "Tempo firme, calor e vento nordeste costeiro", "icon": "☀️", "color": (249, 115, 22)},
        {"title": "Cavado Costeiro / Instabilidade Local", "days": 8, "desc": "Pancadas convectivas de primavera e trovoadas", "icon": "⚡", "color": (56, 189, 248)},
        {"title": "Passagem de Frente Fria / Sistema Frontal", "days": 4, "desc": "Quedas térmicas e chuvas generalizadas", "icon": "🌧️", "color": (168, 85, 247)},
        {"title": "Cavado Costeiro / Convergência de Umidade", "days": 4, "desc": "Umidade oceânica contínua sobre a costa", "icon": "🌊", "color": (0, 229, 255)},
        {"title": "Circulação Marítima Pós-Frontal (SE/S)", "days": 3, "desc": "Ventos oceânicos de sul e muitas nuvens baixas", "icon": "💨", "color": (148, 163, 184)}
    ]

    start_y = 230
    row_h = 120

    for idx, sys in enumerate(systems):
        st_frame = max(0, rel_frame - idx * 6)
        progress = min(1.0, st_frame / 30.0)
        eased = 1.0 - math.pow(1.0 - progress, 3)

        y = start_y + idx * row_h
        box_w = 1720
        box_h = 100
        box_x = 100

        draw_rounded_rect(draw, (box_x, y, box_x + box_w, y + box_h), fill=(18, 30, 56, 230), outline=(sys["color"][0], sys["color"][1], sys["color"][2], 180), radius=20, width=2)

        draw.text((box_x + 50, y + 50), sys["icon"], font=get_font(False, 40), anchor="mm")
        draw.text((box_x + 100, y + 33), sys["title"], font=get_font(True, 26), fill=(255, 255, 255))
        draw.text((box_x + 100, y + 68), sys["desc"], font=get_font(False, 20), fill=(203, 213, 225))

        bar_x = box_x + 950
        bar_y = y + 38
        bar_max_w = 500
        draw_rounded_rect(draw, (bar_x, bar_y, bar_x + bar_max_w, bar_y + 24), fill=(30, 41, 59, 255), radius=12)

        ratio = (sys["days"] / 12.0) * eased
        fill_w = max(int(bar_max_w * ratio), 16 if eased > 0.05 else 0)
        if fill_w > 0:
            draw_rounded_rect(draw, (bar_x, bar_y, bar_x + fill_w, bar_y + 24), fill=sys["color"], radius=12)

        dias_anim = int(sys["days"] * eased)
        draw.text((box_x + box_w - 40, y + 50), f"{dias_anim} DIAS", font=get_font(True, 28), fill=sys["color"], anchor="rm")

# SCENE 6: ENCERRAMENTO (Horizontal)
def render_scene_6(draw, frame_img, rel_frame):
    if full_card:
        target_w = 1100
        target_h = int(full_card.height * (target_w / full_card.width))
        c_resized = full_card.resize((target_w, target_h), Image.Resampling.LANCZOS)
        cx = (WIDTH - target_w) // 2
        cy = (HEIGHT - target_h) // 2 - 40
        
        draw_rounded_rect(draw, (cx - 10, cy - 10, cx + target_w + 10, cy + target_h + 10), fill=(249, 115, 22, 60), radius=28)
        frame_img.paste(c_resized, (cx, cy), c_resized)

    f_t1 = get_font(True, 44)
    draw.text((WIDTH // 2, 110), "ACOMPANHE O CLIMA DIARIAMENTE EM RIO DAS OSTRAS!", font=f_t1, fill=(255, 255, 255), anchor="mm")

    f_t2 = get_font(True, 32)
    draw.text((WIDTH // 2, HEIGHT - 130), "📷 Instagram & 🎵 TikTok: @tempoemriodasostras   •   ✖️ X: @tempoemro", font=f_t2, fill=(249, 115, 22), anchor="mm")

def main():
    out_dir = "C:/Users/debor/.gemini/antigravity/scratch/clima-rio-das-ostras/public/videos"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "panorama_outubro_2026_horizontal.mp4")

    print(f"Generating horizontal video: {out_path}")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(out_path, fourcc, FPS, (WIDTH, HEIGHT))

    if not writer.isOpened():
        print("ERROR: Could not open VideoWriter!")
        return

    for f_idx in range(TOTAL_FRAMES):
        frame = render_frame(f_idx)
        writer.write(frame)
        if f_idx % 60 == 0:
            print(f"Horizontal {f_idx}/{TOTAL_FRAMES} ({(f_idx/TOTAL_FRAMES)*100:.1f}%)")

    writer.release()
    print("DONE! File created:", out_path)
    print("File size:", os.path.getsize(out_path), "bytes")

if __name__ == "__main__":
    main()
