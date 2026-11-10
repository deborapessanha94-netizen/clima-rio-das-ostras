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

# Atmospheric particles
np.random.seed(99)
NUM_PARTICLES = 75
particle_x = np.random.uniform(0, WIDTH, NUM_PARTICLES)
particle_y = np.random.uniform(0, HEIGHT, NUM_PARTICLES)
particle_speed = np.random.uniform(1.0, 3.5, NUM_PARTICLES)
particle_size = np.random.uniform(2.0, 5.0, NUM_PARTICLES)
particle_alpha = np.random.uniform(50, 180, NUM_PARTICLES)

# Deep Navy Gradient for 16:9
base_bg = Image.new("RGBA", (WIDTH, HEIGHT), (11, 19, 38, 255))
draw_bg = ImageDraw.Draw(base_bg)
for y in range(HEIGHT):
    factor = y / HEIGHT
    r = int(14 * (1 - factor) + 7 * factor)
    g = int(24 * (1 - factor) + 12 * factor)
    b = int(48 * (1 - factor) + 24 * factor)
    draw_bg.line([(0, y), (WIDTH, y)], fill=(r, g, b, 255))

def draw_rounded_rect(draw, bbox, fill, outline=None, width=1, radius=20):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def draw_header_bar(draw):
    draw.text((70, 45), "@tempoemriodasostras", font=get_font(True, 24), fill=(255, 255, 255))
    badge_w = 220
    badge_h = 38
    bx = WIDTH - 70 - badge_w
    by = 40
    draw_rounded_rect(draw, (bx, by, bx + badge_w, by + badge_h), fill=(35, 25, 20), outline=(255, 130, 68), radius=12, width=2)
    draw.text((bx + badge_w // 2, by + badge_h // 2), "OUTUBRO / 2026", font=get_font(True, 18), fill=(255, 186, 115), anchor="mm")
    draw.line([(70, 90), (WIDTH - 70, 90)], fill=(56, 189, 248), width=1)

def render_frame(frame_idx):
    frame_img = base_bg.copy()
    draw = ImageDraw.Draw(frame_img)

    for i in range(NUM_PARTICLES):
        py = (particle_y[i] - frame_idx * particle_speed[i]) % HEIGHT
        px = (particle_x[i] + math.sin(frame_idx * 0.03 + i) * 15) % WIDTH
        p_sz = int(particle_size[i])
        p_al = int(particle_alpha[i] * (0.6 + 0.4 * math.sin(frame_idx * 0.05 + i)))
        draw.ellipse([px, py, px + p_sz, py + p_sz], fill=(56, 189, 248, p_al))

    draw_header_bar(draw)

    # SCENE TIMELINE
    # S1: 0 - 140 (0s - 4.6s) -> Abertura
    # S2: 140 - 320 (4.6s - 10.6s) -> Volume & Frequência
    # S3: 320 - 540 (10.6s - 18.0s) -> Ranking por Estação
    # S4: 540 - 710 (18.0s - 23.6s) -> Ventos & Temperaturas
    # S5: 710 - 830 (23.6s - 27.6s) -> Sistemas Meteorológicos
    # S6: 830 - 930 (27.6s - 31.0s) -> Encerramento Oficial

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
    draw.text((WIDTH // 2, HEIGHT - 35), "Fontes: Estações Meteorológicas do Município", font=f_foot, fill=(148, 163, 184), anchor="mm")

    return cv2.cvtColor(np.array(frame_img), cv2.COLOR_RGBA2BGR)

# SCENE 1: ABERTURA (Horizontal)
def render_scene_1(draw, frame_img, rel_frame):
    card_w = 650
    card_h = 600
    card_x = 100
    card_y = 220

    if user_logo:
        logo_w = 480
        logo_h = int(user_logo.height * (logo_w / user_logo.width))
        resized = user_logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        lx = card_x + (card_w - logo_w) // 2
        ly = card_y + (card_h - logo_h) // 2
        draw_rounded_rect(draw, (card_x, card_y, card_x + card_w, card_y + card_h), fill=(18, 30, 56), outline=(255, 130, 68), radius=28, width=3)
        frame_img.paste(resized, (lx, ly), resized)

    main_x = 800
    main_w = WIDTH - main_x - 100
    draw_rounded_rect(draw, (main_x, card_y, main_x + main_w, card_y + card_h), fill=(24, 38, 70), outline=(0, 229, 255), radius=28, width=3)

    tag_w = 420
    tag_h = 44
    draw_rounded_rect(draw, (main_x + 50, card_y + 50, main_x + 50 + tag_w, card_y + 50 + tag_h), fill=(15, 38, 65), outline=(0, 229, 255), radius=22, width=2)
    draw.text((main_x + 50 + tag_w // 2, card_y + 50 + tag_h // 2), "RETROSPECTIVA METEOROLÓGICA", font=get_font(True, 20), fill=(0, 229, 255), anchor="mm")

    draw.text((main_x + 50, card_y + 150), "PANORAMA DO CLIMA", font=get_font(True, 56), fill=(255, 255, 255))
    draw.text((main_x + 50, card_y + 245), "OUTUBRO 2026", font=get_font(True, 80), fill=(255, 130, 68))
    draw.line([(main_x + 50, card_y + 325), (main_x + 500, card_y + 325)], fill=(255, 130, 68), width=3)

    draw.text((main_x + 50, card_y + 365), "RIO DAS OSTRAS • RJ", font=get_font(True, 30), fill=(226, 232, 240))
    draw.text((main_x + 50, card_y + 420), "Balanço consolidado de todas as estações municipais", font=get_font(False, 24), fill=(148, 163, 184))

    call_w = main_w - 100
    draw_rounded_rect(draw, (main_x + 50, card_y + 480, main_x + 50 + call_w, card_y + 560), fill=(15, 23, 42), outline=(56, 189, 248), radius=16, width=2)
    draw.text((main_x + 50 + call_w // 2, card_y + 520), "• UM DOS MESES MAIS CHUVOSOS DO ANO •", font=get_font(True, 22), fill=(56, 189, 248), anchor="mm")

# SCENE 2: GRANDES NÚMEROS (Horizontal)
def render_scene_2(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 130), "VOLUME & FREQUÊNCIA DE CHUVA • OUTUBRO 2026", font=get_font(True, 42), fill=(255, 255, 255), anchor="mm")
    draw.text((WIDTH // 2, 175), "Balanço geral e extremos pluviométricos no município de Rio das Ostras", font=get_font(False, 24), fill=(148, 163, 184), anchor="mm")

    progress = min(1.0, rel_frame / 45.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    card_w = 540
    card_h = 740
    gap = 40
    start_x = (WIDTH - (3 * card_w + 2 * gap)) // 2
    c_y = 220

    # Card 1: 25 Dias
    c1_x = start_x
    draw_rounded_rect(draw, (c1_x, c_y, c1_x + card_w, c_y + card_h), fill=(18, 30, 56), outline=(56, 189, 248), radius=28, width=3)
    draw_rounded_rect(draw, (c1_x + 35, c_y + 35, c1_x + 310, c_y + 80), fill=(15, 38, 65), outline=(56, 189, 248), radius=16, width=2)
    draw.text((c1_x + 172, c_y + 57), "FREQUÊNCIA RECORDE", font=get_font(True, 20), fill=(56, 189, 248), anchor="mm")

    dias_anim = int(25 * eased)
    draw.text((c1_x + 40, c_y + 120), f"{dias_anim}", font=get_font(True, 96), fill=(255, 255, 255))
    draw.text((c1_x + 190, c_y + 135), "DIAS", font=get_font(True, 48), fill=(0, 229, 255))
    draw.text((c1_x + 190, c_y + 190), "COM CHUVA", font=get_font(True, 32), fill=(255, 255, 255))

    draw.text((c1_x + 40, c_y + 260), "em 31 dias monitorados (80% do mês)", font=get_font(False, 22), fill=(203, 213, 225))

    bar_y = c_y + 320
    draw_rounded_rect(draw, (c1_x + 40, bar_y, c1_x + card_w - 40, bar_y + 26), fill=(30, 41, 59), radius=13)
    b_fill = int((card_w - 80) * (25 / 31) * eased)
    if b_fill > 20:
        draw_rounded_rect(draw, (c1_x + 40, bar_y, c1_x + 40 + b_fill, bar_y + 26), fill=(0, 229, 255), radius=13)

    draw_rounded_rect(draw, (c1_x + 40, c_y + 400, c1_x + card_w - 40, c_y + 550), fill=(25, 35, 60), outline=(56, 189, 248), radius=18)
    draw.text((c1_x + 60, c_y + 440), "Apenas 6 dias totalmente secos", font=get_font(True, 24), fill=(255, 255, 255))
    draw.text((c1_x + 60, c_y + 490), "Constante aporte de umidade marítima", font=get_font(False, 22), fill=(148, 163, 184))

    # Card 2: 243,3 mm
    c2_x = start_x + card_w + gap
    draw_rounded_rect(draw, (c2_x, c_y, c2_x + card_w, c_y + card_h), fill=(18, 30, 56), outline=(255, 130, 68), radius=28, width=3)
    draw_rounded_rect(draw, (c2_x + 35, c_y + 35, c2_x + 310, c_y + 80), fill=(45, 28, 18), outline=(255, 130, 68), radius=16, width=2)
    draw.text((c2_x + 172, c_y + 57), "MÉDIA MUNICIPAL", font=get_font(True, 20), fill=(255, 186, 115), anchor="mm")

    val_anim = round(243.3 * eased, 1)
    str_val = f"{val_anim:.1f}".replace('.', ',')
    draw.text((c2_x + 40, c_y + 120), str_val, font=get_font(True, 84), fill=(255, 255, 255))
    draw.text((c2_x + 320, c_y + 155), "mm", font=get_font(True, 46), fill=(255, 130, 68))

    draw.text((c2_x + 40, c_y + 240), "MÉDIA NA REDE", font=get_font(True, 32), fill=(255, 255, 255))
    draw.text((c2_x + 40, c_y + 285), "Volume consolidado de todas as estações", font=get_font(False, 22), fill=(203, 213, 225))

    draw_rounded_rect(draw, (c2_x + 40, c_y + 380, c2_x + card_w - 40, c_y + 530), fill=(30, 41, 59), outline=(255, 130, 68), radius=18)
    draw.text((c2_x + 60, c_y + 420), "PICO MÁXIMO DO ANO:", font=get_font(True, 22), fill=(255, 215, 0))
    draw.text((c2_x + 60, c_y + 470), "Rocha Leão: 410,0 mm", font=get_font(True, 28), fill=(255, 255, 255))

    # Card 3: 02/10/2026
    c3_x = start_x + (card_w + gap) * 2
    draw_rounded_rect(draw, (c3_x, c_y, c3_x + card_w, c_y + card_h), fill=(18, 30, 56), outline=(168, 85, 247), radius=28, width=3)
    draw_rounded_rect(draw, (c3_x + 35, c_y + 35, c3_x + 310, c_y + 80), fill=(38, 24, 60), outline=(168, 85, 247), radius=16, width=2)
    draw.text((c3_x + 172, c_y + 57), "EVENTO MAIS SEVERO", font=get_font(True, 20), fill=(216, 180, 254), anchor="mm")

    draw.text((c3_x + 40, c_y + 120), "02 / 10", font=get_font(True, 84), fill=(255, 255, 255))
    draw.text((c3_x + 40, c_y + 230), "DIA MAIS CHUVOSO", font=get_font(True, 32), fill=(192, 132, 252))

    draw_rounded_rect(draw, (c3_x + 40, c_y + 300, c3_x + card_w - 40, c_y + 410), fill=(25, 35, 60), outline=(168, 85, 247), radius=16)
    draw.text((c3_x + 60, c_y + 325), "MÉDIA NA REDE EM 24H", font=get_font(False, 18), fill=(148, 163, 184))
    draw.text((c3_x + 60, c_y + 355), "48,0 mm", font=get_font(True, 36), fill=(255, 255, 255))

    draw_rounded_rect(draw, (c3_x + 40, c_y + 430, c3_x + card_w - 40, c_y + 540), fill=(25, 35, 60), outline=(255, 130, 68), radius=16)
    draw.text((c3_x + 60, c_y + 455), "MÁXIMA PONTUAL EM 24H", font=get_font(False, 18), fill=(148, 163, 184))
    draw.text((c3_x + 60, c_y + 485), "84,3 mm", font=get_font(True, 36), fill=(255, 130, 68))

# SCENE 3: RANKING DE CHUVA POR ESTAÇÃO (STRICTLY RAIN STATIONS, NO RIO JUNDIÁ)
def render_scene_3(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 130), "ACUMULADOS POR ESTAÇÃO • OUTUBRO 2026", font=get_font(True, 42), fill=(255, 255, 255), anchor="mm")
    draw.text((WIDTH // 2, 175), "Ranking oficial de chuva acumulada registrada pelos pluviômetros municipais", font=get_font(False, 24), fill=(148, 163, 184), anchor="mm")

    stations_data = [
        {"name": "Rocha Leão (REBIO União)", "val": 410.0, "code": "CEMADEN", "badge": "1º LUGAR • RECORDE", "color": (255, 130, 68)},
        {"name": "Cantagalo (LERIP)", "val": 191.7, "code": "IRIODA16", "badge": "2º LUGAR", "color": (56, 189, 248)},
        {"name": "Praiamar / Divisa Sul", "val": 177.3, "code": "ICASIM5", "badge": "3º LUGAR", "color": (56, 189, 248)},
        {"name": "Praia da Tartaruga (Defesa Civil)", "val": 167.9, "code": "IRIODA17", "badge": "4º LUGAR", "color": (56, 189, 248)},
        {"name": "Costazul (Escola Jacinto)", "val": 131.3, "code": "IRIODA6", "badge": "5º LUGAR", "color": (56, 189, 248)}
    ]

    max_val = 410.0
    start_y = 220
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
        border_col = (255, 130, 68) if is_top else (56, 189, 248)
        bg_col = (28, 38, 65) if is_top else (18, 28, 50)
        draw_rounded_rect(draw, (box_x, row_y, box_x + box_w, row_y + box_h), fill=bg_col, outline=border_col, radius=18, width=3 if is_top else 2)

        draw.text((box_x + 30, row_y + 47), st["name"], font=get_font(True, 28), fill=(255, 255, 255), anchor="lm")

        badge_w = 200 if is_top else 120
        badge_x = box_x + 520
        badge_bg = (45, 28, 18) if is_top else (15, 38, 65)
        badge_txt = (255, 186, 115) if is_top else (56, 189, 248)
        draw_rounded_rect(draw, (badge_x, row_y + 26, badge_x + badge_w, row_y + 68), fill=badge_bg, outline=border_col, radius=12, width=1)
        draw.text((badge_x + badge_w // 2, row_y + 47), st["badge"], font=get_font(True, 18), fill=badge_txt, anchor="mm")

        bar_x = box_x + 750
        bar_y = row_y + 30
        bar_max_w = 680
        bar_h = 36
        pill_r = bar_h // 2
        
        draw_rounded_rect(draw, (bar_x, bar_y, bar_x + bar_max_w, bar_y + bar_h), fill=(30, 41, 59), radius=pill_r)

        ratio = (st["val"] / max_val) * eased
        fill_w = max(int(bar_max_w * ratio), pill_r * 2 if eased > 0.05 else 0)
        if fill_w > 0:
            draw_rounded_rect(draw, (bar_x, bar_y, bar_x + fill_w, bar_y + bar_h), fill=st["color"], radius=pill_r)

        val_display = round(st["val"] * eased, 1)
        str_display = f"{val_display:.1f}".replace('.', ',') + " mm"
        draw.text((bar_x + bar_max_w + 35, row_y + 47), str_display, font=get_font(True, 34), fill=(255, 255, 255), anchor="lm")

    call_y = start_y + 5 * row_height + 20
    draw_rounded_rect(draw, (100, call_y, WIDTH - 100, call_y + 90), fill=(15, 23, 42), outline=(56, 189, 248), radius=18, width=2)
    draw.text((WIDTH // 2, call_y + 45), "Média consolidada na rede: 243,3 mm • Maior acumulado do ano registrado em Rocha Leão (410,0 mm)", font=get_font(True, 26), fill=(56, 189, 248), anchor="mm")

# SCENE 4: VENTOS & TEMPERATURAS (Horizontal)
def render_scene_4(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 130), "VENTOS & TEMPERATURAS • OUTUBRO 2026", font=get_font(True, 42), fill=(255, 255, 255), anchor="mm")
    draw.text((WIDTH // 2, 175), "Pico de rajadas de vento e variações extremas de temperatura", font=get_font(False, 24), fill=(148, 163, 184), anchor="mm")

    progress = min(1.0, rel_frame / 40.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    card_w = 540
    card_h = 740
    gap = 40
    start_x = (WIDTH - (3 * card_w + 2 * gap)) // 2
    c_y = 220

    # Card 1: Maior Rajada
    c1_x = start_x
    draw_rounded_rect(draw, (c1_x, c_y, c1_x + card_w, c_y + card_h), fill=(18, 30, 56), outline=(255, 130, 68), radius=28, width=3)
    draw_rounded_rect(draw, (c1_x + 35, c_y + 35, c1_x + 310, c_y + 80), fill=(45, 28, 18), outline=(255, 130, 68), radius=16, width=2)
    draw.text((c1_x + 172, c_y + 57), "RECORDE DE VENTO", font=get_font(True, 20), fill=(255, 186, 115), anchor="mm")

    raj_anim = round(62.3 * eased, 1)
    str_raj = f"{raj_anim:.1f}".replace('.', ',')
    draw.text((c1_x + 40, c_y + 120), str_raj, font=get_font(True, 84), fill=(255, 255, 255))
    draw.text((c1_x + 245, c_y + 155), "km/h", font=get_font(True, 44), fill=(255, 130, 68))

    draw.text((c1_x + 40, c_y + 240), "MAIOR RAJADA DO MÊS", font=get_font(True, 32), fill=(255, 255, 255))
    draw.text((c1_x + 40, c_y + 290), "Registrada em todo o município", font=get_font(False, 22), fill=(203, 213, 225))

    draw_rounded_rect(draw, (c1_x + 40, c_y + 380, c1_x + card_w - 40, c_y + 530), fill=(30, 41, 59), outline=(255, 130, 68), radius=18)
    draw.text((c1_x + 60, c_y + 420), "Praia da Tartaruga (Defesa Civil)", font=get_font(True, 24), fill=(255, 255, 255))
    draw.text((c1_x + 60, c_y + 470), "Data: 26/10/2026 às 10:00 da manhã", font=get_font(False, 22), fill=(255, 186, 115))

    # Card 2: Dinâmica dos Ventos
    c2_x = start_x + card_w + gap
    draw_rounded_rect(draw, (c2_x, c_y, c2_x + card_w, c_y + card_h), fill=(18, 30, 56), outline=(60, 123, 196), radius=28, width=2)
    draw_rounded_rect(draw, (c2_x + 35, c_y + 35, c2_x + 310, c_y + 80), fill=(15, 38, 65), outline=(60, 123, 196), radius=16, width=2)
    draw.text((c2_x + 172, c_y + 57), "PADRÃO DOS VENTOS", font=get_font(True, 20), fill=(56, 189, 248), anchor="mm")

    draw.text((c2_x + 40, c_y + 120), "Vento Médio Mensal:", font=get_font(False, 22), fill=(148, 163, 184))
    draw.text((c2_x + 40, c_y + 175), "16,6 km/h", font=get_font(True, 56), fill=(255, 255, 255))
    draw.text((c2_x + 40, c_y + 245), "Predominante: NE (Nordeste)", font=get_font(True, 24), fill=(56, 189, 248))

    draw.line([(c2_x + 40, c_y + 315), (c2_x + card_w - 40, c_y + 315)], fill=(60, 123, 196), width=2)

    draw.text((c2_x + 40, c_y + 360), "Velocidade Sustentada Máx:", font=get_font(False, 22), fill=(148, 163, 184))
    draw.text((c2_x + 40, c_y + 420), "51,1 km/h", font=get_font(True, 56), fill=(255, 130, 68))
    draw.text((c2_x + 40, c_y + 490), "Ocorrência: 25/10/2026", font=get_font(True, 24), fill=(255, 186, 115))

    # Card 3: Extremos Térmicos
    c3_x = start_x + (card_w + gap) * 2
    draw_rounded_rect(draw, (c3_x, c_y, c3_x + card_w, c_y + card_h), fill=(18, 30, 56), outline=(16, 185, 129), radius=28, width=2)
    draw_rounded_rect(draw, (c3_x + 35, c_y + 35, c3_x + 310, c_y + 80), fill=(16, 45, 30), outline=(16, 185, 129), radius=16, width=2)
    draw.text((c3_x + 172, c_y + 57), "EXTREMOS TÉRMICOS", font=get_font(True, 20), fill=(52, 211, 153), anchor="mm")

    draw_rounded_rect(draw, (c3_x + 40, c_y + 120, c3_x + card_w - 40, c_y + 310), fill=(25, 35, 60), outline=(56, 189, 248), radius=18)
    draw.text((c3_x + 65, c_y + 145), "Menor Temperatura", font=get_font(False, 22), fill=(148, 163, 184))
    draw.text((c3_x + 65, c_y + 205), "18,4 °C", font=get_font(True, 56), fill=(56, 189, 248))
    draw.text((c3_x + 65, c_y + 265), "Madrugadas sob frente fria", font=get_font(False, 20), fill=(203, 213, 225))

    draw_rounded_rect(draw, (c3_x + 40, c_y + 340, c3_x + card_w - 40, c_y + 530), fill=(25, 35, 60), outline=(239, 68, 68), radius=18)
    draw.text((c3_x + 65, c_y + 365), "Maior Temperatura", font=get_font(False, 22), fill=(148, 163, 184))
    draw.text((c3_x + 65, c_y + 425), "32,6 °C", font=get_font(True, 56), fill=(239, 68, 68))
    draw.text((c3_x + 65, c_y + 485), "Tardes sob atuação da ASAS", font=get_font(False, 20), fill=(203, 213, 225))

# SCENE 5: SISTEMAS METEOROLÓGICOS (Horizontal)
def render_scene_5(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 115), "SISTEMAS METEOROLÓGICOS ATUANTES • OUTUBRO 2026", font=get_font(True, 42), fill=(255, 255, 255), anchor="mm")
    draw.text((WIDTH // 2, 160), "Distribuição dos 31 dias por padrão atmosférico registrado", font=get_font(False, 24), fill=(148, 163, 184), anchor="mm")

    systems = [
        {"title": "Alta Subtropical do Atlântico Sul (ASAS)", "days": 12, "desc": "Tempo firme, calor e vento nordeste costeiro", "color": (255, 130, 68)},
        {"title": "Cavado Costeiro / Instabilidade Local", "days": 8, "desc": "Pancadas convectivas de primavera e trovoadas", "color": (56, 189, 248)},
        {"title": "Passagem de Frente Fria / Sistema Frontal", "days": 4, "desc": "Quedas térmicas e chuvas generalizadas", "color": (168, 85, 247)},
        {"title": "Cavado Costeiro / Convergência de Umidade", "days": 4, "desc": "Umidade oceânica contínua sobre a costa", "color": (0, 229, 255)},
        {"title": "Circulação Marítima Pós-Frontal (SE/S)", "days": 3, "desc": "Ventos oceânicos de sul e muitas nuvens baixas", "color": (148, 163, 184)}
    ]

    start_y = 220
    row_h = 120

    for idx, sys in enumerate(systems):
        st_frame = max(0, rel_frame - idx * 6)
        progress = min(1.0, st_frame / 30.0)
        eased = 1.0 - math.pow(1.0 - progress, 3)

        y = start_y + idx * row_h
        box_w = 1720
        box_h = 100
        box_x = 100

        draw_rounded_rect(draw, (box_x, y, box_x + box_w, y + box_h), fill=(18, 30, 56), outline=sys["color"], radius=20, width=2)

        draw_rounded_rect(draw, (box_x + 20, y + 20, box_x + 80, y + 80), fill=(25, 38, 65), outline=sys["color"], radius=14, width=1)
        draw.text((box_x + 50, y + 50), f"{idx+1}º", font=get_font(True, 26), fill=sys["color"], anchor="mm")

        draw.text((box_x + 100, y + 33), sys["title"], font=get_font(True, 26), fill=(255, 255, 255))
        draw.text((box_x + 100, y + 68), sys["desc"], font=get_font(False, 20), fill=(203, 213, 225))

        bar_x = box_x + 950
        bar_y = y + 38
        bar_max_w = 500
        draw_rounded_rect(draw, (bar_x, bar_y, bar_x + bar_max_w, bar_y + 24), fill=(30, 41, 59), radius=12)

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
        
        draw_rounded_rect(draw, (cx - 10, cy - 10, cx + target_w + 10, cy + target_h + 10), fill=(255, 130, 68), radius=28)
        frame_img.paste(c_resized, (cx, cy), c_resized)

    f_t1 = get_font(True, 44)
    draw.text((WIDTH // 2, 110), "ACOMPANHE O CLIMA DIARIAMENTE EM RIO DAS OSTRAS!", font=f_t1, fill=(255, 255, 255), anchor="mm")

    f_t2 = get_font(True, 32)
    draw.text((WIDTH // 2, HEIGHT - 130), "Instagram & TikTok: @tempoemriodasostras   •   X: @tempoemro", font=f_t2, fill=(255, 130, 68), anchor="mm")

def main():
    out_dir = "C:/Users/debor/.gemini/antigravity/scratch/clima-rio-das-ostras/public/videos"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "panorama_outubro_2026_horizontal.mp4")

    print(f"Generating horizontal video: {out_path}")
    print(f"Total frames: {TOTAL_FRAMES} at {FPS} FPS ({TOTAL_SECONDS}s)")

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(out_path, fourcc, FPS, (WIDTH, HEIGHT))

    if not out.isOpened():
        print("ERROR: Could not open VideoWriter for horizontal!")
        return

    for f_idx in range(TOTAL_FRAMES):
        frame = render_frame(f_idx)
        out.write(frame)
        if f_idx % 60 == 0:
            print(f"Horizontal {f_idx}/{TOTAL_FRAMES} ({(f_idx/TOTAL_FRAMES)*100:.1f}%)")

    out.release()
    print("DONE! File created:", out_path)
    print("File size:", os.path.getsize(out_path), "bytes")

if __name__ == "__main__":
    main()
