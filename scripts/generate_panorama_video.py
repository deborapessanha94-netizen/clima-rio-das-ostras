import os
import math
import cv2
import numpy as np
import subprocess
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1080
HEIGHT = 1920
FPS = 30
TOTAL_SECONDS = 66
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

# OFFICIAL BRAND PALETTE
# Background: (29, 31, 38) #1d1f26
# Blue: (60, 123, 196) #3c7bc4
# Orange: (255, 130, 68) #ff8244
# White: (255, 255, 255) #ffffff
# Dark Navy: (40, 57, 100) #283964

COLOR_BG = (29, 31, 38)
COLOR_NAVY = (40, 57, 100)
COLOR_SUB_BG = (22, 33, 58)
COLOR_BLUE = (60, 123, 196)
COLOR_ORANGE = (255, 130, 68)
COLOR_WHITE = (255, 255, 255)
COLOR_MUTED = (195, 208, 228)
COLOR_TRACK = (20, 27, 44)

# Atmospheric particles
np.random.seed(42)
NUM_PARTICLES = 65
particle_x = np.random.uniform(0, WIDTH, NUM_PARTICLES)
particle_y = np.random.uniform(0, HEIGHT, NUM_PARTICLES)
particle_speed = np.random.uniform(1.2, 3.8, NUM_PARTICLES)
particle_size = np.random.uniform(2.0, 4.5, NUM_PARTICLES)
particle_alpha = np.random.uniform(50, 180, NUM_PARTICLES)

# Base background gradient (Official Dark Slate #1d1f26)
base_bg = Image.new("RGBA", (WIDTH, HEIGHT), (COLOR_BG[0], COLOR_BG[1], COLOR_BG[2], 255))
draw_bg = ImageDraw.Draw(base_bg)
for y in range(HEIGHT):
    factor = y / HEIGHT
    r = int(COLOR_BG[0] * (1 - factor * 0.25))
    g = int(COLOR_BG[1] * (1 - factor * 0.25))
    b = int(COLOR_BG[2] * (1 - factor * 0.20))
    draw_bg.line([(0, y), (WIDTH, y)], fill=(r, g, b, 255))

def draw_rounded_rect(draw, bbox, fill, outline=None, width=1, radius=20):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def draw_header_bar(draw, frame_idx):
    top_y = 45
    draw.text((50, top_y + 12), "@tempoemriodasostras", font=get_font(True, 26), fill=COLOR_WHITE)
    badge_w = 230
    badge_h = 42
    badge_x = WIDTH - 50 - badge_w
    badge_y = top_y + 6
    draw_rounded_rect(draw, (badge_x, badge_y, badge_x + badge_w, badge_y + badge_h), fill=(38, 28, 24), outline=COLOR_ORANGE, radius=12, width=2)
    f_badge = get_font(True, 20)
    draw.text((badge_x + badge_w // 2, badge_y + badge_h // 2), "OUTUBRO / 2026", font=f_badge, fill=COLOR_ORANGE, anchor="mm")
    draw.line([(50, top_y + 62), (WIDTH - 50, top_y + 62)], fill=COLOR_BLUE, width=1)

def render_frame(frame_idx):
    frame_img = base_bg.copy()
    draw = ImageDraw.Draw(frame_img)
    
    # Atmospheric particles
    for i in range(NUM_PARTICLES):
        py = (particle_y[i] - frame_idx * particle_speed[i]) % HEIGHT
        px = (particle_x[i] + math.sin(frame_idx * 0.03 + i) * 15) % WIDTH
        p_sz = int(particle_size[i])
        p_al = int(particle_alpha[i] * (0.6 + 0.4 * math.sin(frame_idx * 0.05 + i)))
        draw.ellipse([px, py, px + p_sz, py + p_sz], fill=(COLOR_BLUE[0], COLOR_BLUE[1], COLOR_BLUE[2], p_al))

    # Top persistent header
    draw_header_bar(draw, frame_idx)

    # SCENE TIMELINE (SYNCHRONIZED WITH 100% AI NEURAL LOCUTORA)
    # S1: 0 - 276 (0.0s - 9.2s) -> Abertura Oficial (Áudio: 0.30s - 9.04s)
    # S2: 276 - 648 (9.2s - 21.6s) -> Volume e Frequência de Chuva (Áudio: 9.40s - 21.40s)
    # S3: 648 - 1032 (21.6s - 34.4s) -> Ranking por Estação (Áudio: 21.80s - 34.23s)
    # S4: 1032 - 1446 (34.4s - 48.2s) -> Ventos & Temperaturas (Áudio: 34.60s - 48.02s)
    # S5: 1446 - 1710 (48.2s - 57.0s) -> Sistemas Meteorológicos (Áudio: 48.40s - 56.75s)
    # S6: 1710 - 1980 (57.0s - 66.0s) -> Encerramento Oficial com Logo e Redes (Áudio: 57.20s - 65.19s)

    if frame_idx < 276:
        render_scene_1(draw, frame_img, frame_idx)
    elif frame_idx < 648:
        render_scene_2(draw, frame_img, frame_idx - 276)
    elif frame_idx < 1032:
        render_scene_3(draw, frame_img, frame_idx - 648)
    elif frame_idx < 1446:
        render_scene_4(draw, frame_img, frame_idx - 1032)
    elif frame_idx < 1710:
        render_scene_5(draw, frame_img, frame_idx - 1446)
    else:
        render_scene_6(draw, frame_img, frame_idx - 1710)

    # Bottom watermark footer
    f_foot = get_font(False, 24)
    draw.text((WIDTH // 2, HEIGHT - 55), "Fontes: Estações Meteorológicas do Município", font=f_foot, fill=COLOR_MUTED, anchor="mm")

    return cv2.cvtColor(np.array(frame_img), cv2.COLOR_RGBA2BGR)

# SCENE 1: ABERTURA OFICIAL
def render_scene_1(draw, frame_img, rel_frame):
    if user_logo:
        logo_w = 520
        logo_h = int(user_logo.height * (logo_w / user_logo.width))
        resized_logo = user_logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        logo_x = (WIDTH - logo_w) // 2
        logo_y = 360
        frame_img.paste(resized_logo, (logo_x, logo_y), resized_logo)
    else:
        f_logo = get_font(True, 64)
        draw.text((WIDTH // 2, 420), "TEMPO EM RIO DAS OSTRAS", font=f_logo, fill=COLOR_WHITE, anchor="mm")

    box_w = 960
    box_h = 580
    box_x = (WIDTH - box_w) // 2
    box_y = 740

    pulse = math.sin(rel_frame * 0.08) * 4
    draw_rounded_rect(draw, (box_x - pulse, box_y - pulse, box_x + box_w + pulse, box_y + box_h + pulse), 
                      fill=COLOR_NAVY, outline=COLOR_BLUE, radius=32, width=3)

    tag_w = 440
    tag_h = 48
    tag_x = (WIDTH - tag_w) // 2
    tag_y = box_y + 40
    draw_rounded_rect(draw, (tag_x, tag_y, tag_x + tag_w, tag_y + tag_h), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=24, width=2)
    f_tag = get_font(True, 22)
    draw.text((WIDTH // 2, tag_y + tag_h // 2), "RETROSPECTIVA METEOROLÓGICA", font=f_tag, fill=COLOR_BLUE, anchor="mm")

    f_main1 = get_font(True, 62)
    draw.text((WIDTH // 2, box_y + 160), "PANORAMA DO CLIMA", font=f_main1, fill=COLOR_WHITE, anchor="mm")
    
    f_main2 = get_font(True, 96)
    draw.text((WIDTH // 2, box_y + 265), "OUTUBRO 2026", font=f_main2, fill=COLOR_ORANGE, anchor="mm")

    draw.line([(WIDTH // 2 - 200, box_y + 345), (WIDTH // 2 + 200, box_y + 345)], fill=COLOR_ORANGE, width=4)

    f_sub = get_font(False, 34)
    draw.text((WIDTH // 2, box_y + 410), "RIO DAS OSTRAS • RJ", font=f_sub, fill=COLOR_WHITE, anchor="mm")

    f_detail = get_font(False, 26)
    draw.text((WIDTH // 2, box_y + 490), "Balanço Consolidado de Todas as Estações", font=f_detail, fill=COLOR_MUTED, anchor="mm")

    call_y = 1420
    draw_rounded_rect(draw, (80, call_y, WIDTH - 80, call_y + 160), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=24, width=2)
    f_c1 = get_font(True, 30)
    draw.text((WIDTH // 2, call_y + 45), "• UM DOS MESES MAIS CHUVOSOS DO ANO •", font=f_c1, fill=COLOR_BLUE, anchor="mm")
    f_c2 = get_font(False, 26)
    draw.text((WIDTH // 2, call_y + 105), "Confira os acumulados, rajadas de vento e recordes!", font=f_c2, fill=COLOR_WHITE, anchor="mm")

# SCENE 2: VOLUME & FREQUÊNCIA DE CHUVA
def render_scene_2(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 46)
    draw.text((WIDTH // 2, 175), "VOLUME & FREQUÊNCIA DE CHUVA", font=f_s_title, fill=COLOR_WHITE, anchor="mm")
    f_s_sub = get_font(False, 26)
    draw.text((WIDTH // 2, 225), "Balanço geral de precipitação em Rio das Ostras", font=f_s_sub, fill=COLOR_MUTED, anchor="mm")

    progress = min(1.0, rel_frame / 45.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    # CARD 1: 25 DIAS COM CHUVA
    c1_y = 280
    draw_rounded_rect(draw, (60, c1_y, WIDTH - 60, c1_y + 350), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=3)
    
    draw_rounded_rect(draw, (95, c1_y + 25, 380, c1_y + 72), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=2)
    draw.text((95 + 142, c1_y + 48), "FREQUÊNCIA RECORDE", font=get_font(True, 22), fill=COLOR_BLUE, anchor="mm")
    
    dias_anim = int(25 * eased)
    f_big = get_font(True, 96)
    draw.text((100, c1_y + 90), f"{dias_anim}", font=f_big, fill=COLOR_WHITE)
    
    draw.text((260, c1_y + 112), "DIAS COM CHUVA", font=get_font(True, 38), fill=COLOR_BLUE)
    draw.text((260, c1_y + 162), "em 31 dias monitorados (80% do mês)", font=get_font(False, 24), fill=COLOR_MUTED)

    bar_y = c1_y + 245
    draw_rounded_rect(draw, (100, bar_y, WIDTH - 100, bar_y + 26), fill=COLOR_TRACK, radius=13)
    bar_fill = int((WIDTH - 200) * (25 / 31) * eased)
    if bar_fill > 20:
        draw_rounded_rect(draw, (100, bar_y, 100 + bar_fill, bar_y + 26), fill=COLOR_BLUE, radius=13)
    draw.text((100, bar_y + 36), "80% do mês teve precipitação registrada no município", font=get_font(False, 22), fill=COLOR_MUTED)

    # CARD 2: CHUVA MÉDIA NA REDE
    c2_y = 665
    draw_rounded_rect(draw, (60, c2_y, WIDTH - 60, c2_y + 350), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=28, width=3)
    
    draw_rounded_rect(draw, (95, c2_y + 25, 370, c2_y + 72), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((95 + 137, c2_y + 48), "MÉDIA MUNICIPAL", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")

    val_anim = round(243.3 * eased, 1)
    str_val = f"{val_anim:.1f}".replace('.', ',')
    draw.text((100, c2_y + 90), str_val, font=f_big, fill=COLOR_WHITE)
    draw.text((375, c2_y + 130), "mm", font=get_font(True, 48), fill=COLOR_ORANGE)

    draw.text((510, c2_y + 110), "MÉDIA NA REDE", font=get_font(True, 32), fill=COLOR_WHITE)
    draw.text((510, c2_y + 155), "Volume muito acima da média histórica", font=get_font(False, 22), fill=COLOR_MUTED)

    peak_y = c2_y + 245
    draw_rounded_rect(draw, (95, peak_y, WIDTH - 95, peak_y + 70), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=16, width=2)
    draw.text((WIDTH // 2, peak_y + 35), "PICO MÁXIMO NO MUNICÍPIO: 410,0 mm (Rocha Leão)", font=get_font(True, 26), fill=COLOR_ORANGE, anchor="mm")

    # CARD 3: DIA MAIS CHUVOSO (02/10/2026)
    c3_y = 1050
    draw_rounded_rect(draw, (60, c3_y, WIDTH - 60, c3_y + 430), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=3)

    draw_rounded_rect(draw, (95, c3_y + 25, 380, c3_y + 72), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=2)
    draw.text((95 + 142, c3_y + 48), "EVENTO MAIS SEVERO", font=get_font(True, 22), fill=COLOR_BLUE, anchor="mm")

    draw.text((100, c3_y + 95), "02 / 10 / 2026", font=get_font(True, 64), fill=COLOR_WHITE)
    draw.text((100, c3_y + 180), "O DIA MAIS CHUVOSO DE OUTUBRO", font=get_font(True, 30), fill=COLOR_BLUE)

    box1_w = 425
    draw_rounded_rect(draw, (95, c3_y + 235, 95 + box1_w, c3_y + 345), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=2)
    draw.text((120, c3_y + 252), "MÉDIA NA REDE EM 24H", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((120, c3_y + 285), "48,0 mm", font=get_font(True, 44), fill=COLOR_WHITE)

    draw_rounded_rect(draw, (WIDTH - 95 - box1_w, c3_y + 235, WIDTH - 95, c3_y + 345), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=16, width=2)
    draw.text((WIDTH - 95 - box1_w + 25, c3_y + 252), "MÁXIMA PONTUAL EM 24H", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((WIDTH - 95 - box1_w + 25, c3_y + 285), "84,3 mm", font=get_font(True, 44), fill=COLOR_ORANGE)

    draw.text((WIDTH // 2, c3_y + 385), "Passagem de frente fria combinada com cavado costeiro", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

# SCENE 3: RANKING DE CHUVA POR ESTAÇÃO (STRICTLY RAIN STATIONS, NO RIO JUNDIÁ)
def render_scene_3(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 48)
    draw.text((WIDTH // 2, 170), "ACUMULADOS POR ESTAÇÃO", font=f_s_title, fill=COLOR_WHITE, anchor="mm")
    f_s_sub = get_font(False, 26)
    draw.text((WIDTH // 2, 225), "Ranking total de chuva registrada em Outubro / 2026", font=f_s_sub, fill=COLOR_MUTED, anchor="mm")

    stations = [
        {"name": "Rocha Leão (REBIO União)", "val": 410.0, "rank": "1º LUGAR • RECORDE", "color": COLOR_ORANGE},
        {"name": "Cantagalo (LERIP)", "val": 191.7, "rank": "2º LUGAR", "color": COLOR_BLUE},
        {"name": "Praiamar / Divisa Sul", "val": 177.3, "rank": "3º LUGAR", "color": COLOR_BLUE},
        {"name": "Praia da Tartaruga (Defesa Civil)", "val": 167.9, "rank": "4º LUGAR", "color": COLOR_BLUE},
        {"name": "Costazul (Escola Jacinto)", "val": 131.3, "rank": "5º LUGAR", "color": COLOR_BLUE},
    ]

    start_y = 285
    row_h = 175
    max_val = 410.0

    for idx, st in enumerate(stations):
        st_frame = max(0, rel_frame - idx * 8)
        progress = min(1.0, st_frame / 35.0)
        eased = 1.0 - math.pow(1.0 - progress, 3)

        y = start_y + idx * row_h
        draw_rounded_rect(draw, (60, y, WIDTH - 60, y + 155), fill=COLOR_NAVY, outline=st["color"], radius=24, width=2)

        draw.text((90, y + 25), st["name"], font=get_font(True, 32), fill=COLOR_WHITE)

        rw = 230 if "RECORDE" in st["rank"] else 180
        draw_rounded_rect(draw, (WIDTH - 90 - rw, y + 22, WIDTH - 90, y + 60), fill=COLOR_SUB_BG, outline=st["color"], radius=14, width=1)
        draw.text((WIDTH - 90 - rw // 2, y + 41), st["rank"], font=get_font(True, 18), fill=st["color"], anchor="mm")

        bar_y = y + 85
        bar_max_w = WIDTH - 470
        draw_rounded_rect(draw, (90, bar_y, 90 + bar_max_w, bar_y + 24), fill=COLOR_TRACK, radius=12)
        
        fill_w = max(int(bar_max_w * (st["val"] / max_val) * eased), 14 if eased > 0.05 else 0)
        if fill_w > 0:
            draw_rounded_rect(draw, (90, bar_y, 90 + fill_w, bar_y + 24), fill=st["color"], radius=12)

        cur_val = round(st["val"] * eased, 1)
        str_val = f"{cur_val:.1f}".replace('.', ',') + " mm"
        draw.text((WIDTH - 90, bar_y + 12), str_val, font=get_font(True, 38), fill=COLOR_WHITE, anchor="rm")

    call_y = start_y + len(stations) * row_h + 30
    draw_rounded_rect(draw, (60, call_y, WIDTH - 60, call_y + 130), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=22, width=2)
    draw.text((WIDTH // 2, call_y + 40), "PRECIPITAÇÃO CONSOLIDADA NO MÊS", font=get_font(True, 28), fill=COLOR_BLUE, anchor="mm")
    draw.text((WIDTH // 2, call_y + 80), "Média na rede: 243,3 mm • Maior acumulado do ano em Rocha Leão", font=get_font(False, 24), fill=COLOR_WHITE, anchor="mm")

# SCENE 4: VENTOS, RAJADAS E TEMPERATURAS
def render_scene_4(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 48)
    draw.text((WIDTH // 2, 170), "VENTOS & TEMPERATURAS", font=f_s_title, fill=COLOR_WHITE, anchor="mm")
    f_s_sub = get_font(False, 26)
    draw.text((WIDTH // 2, 225), "Extremos de rajadas de vento e variação térmica em Outubro", font=f_s_sub, fill=COLOR_MUTED, anchor="mm")

    progress = min(1.0, rel_frame / 40.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    # CARD 1: MAIOR RAJADA DO MÊS (62,3 km/h)
    c1_y = 280
    draw_rounded_rect(draw, (60, c1_y, WIDTH - 60, c1_y + 350), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=28, width=3)
    
    # Badge
    draw_rounded_rect(draw, (95, c1_y + 25, 380, c1_y + 72), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((95 + 142, c1_y + 48), "RECORDE DE VENTO", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")

    rajada_anim = round(62.3 * eased, 1)
    str_raj = f"{rajada_anim:.1f}".replace('.', ',')
    f_big = get_font(True, 96)
    draw.text((100, c1_y + 90), str_raj, font=f_big, fill=COLOR_WHITE)
    draw.text((320, c1_y + 130), "km/h", font=get_font(True, 46), fill=COLOR_ORANGE)

    draw.text((500, c1_y + 110), "MAIOR RAJADA DO MÊS", font=get_font(True, 32), fill=COLOR_WHITE)
    draw.text((500, c1_y + 155), "Pico registrado no município", font=get_font(False, 24), fill=COLOR_MUTED)

    sub_y = c1_y + 245
    draw_rounded_rect(draw, (95, sub_y, WIDTH - 95, sub_y + 70), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=16, width=2)
    draw.text((WIDTH // 2, sub_y + 35), "Praia da Tartaruga (Defesa Civil) • 26/10 às 10:00 da manhã", font=get_font(True, 24), fill=COLOR_WHITE, anchor="mm")

    # CARD 2: VENTO MÉDIO & VELOCIDADE MÁXIMA SUSTENTADA
    c2_y = 665
    draw_rounded_rect(draw, (60, c2_y, WIDTH - 60, c2_y + 350), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=2)
    draw.text((100, c2_y + 35), "DINÂMICA DOS VENTOS", font=get_font(True, 30), fill=COLOR_BLUE)

    draw_rounded_rect(draw, (95, c2_y + 80, 520, c2_y + 285), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=2)
    draw.text((120, c2_y + 105), "VENTO MÉDIO MENSAL", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((120, c2_y + 145), "16,6 km/h", font=get_font(True, 44), fill=COLOR_WHITE)
    draw.text((120, c2_y + 225), "Predominante: NE (Nordeste)", font=get_font(True, 22), fill=COLOR_BLUE)

    draw_rounded_rect(draw, (545, c2_y + 80, WIDTH - 95, c2_y + 285), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=16, width=2)
    draw.text((570, c2_y + 105), "VELOCIDADE SUSTENTADA MÁX.", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((570, c2_y + 145), "51,1 km/h", font=get_font(True, 44), fill=COLOR_ORANGE)
    draw.text((570, c2_y + 225), "Ocorrência: 25/10/2026", font=get_font(True, 22), fill=COLOR_WHITE)

    # CARD 3: EXTREMOS TÉRMICOS (18,4°C a 32,6°C)
    c3_y = 1050
    draw_rounded_rect(draw, (60, c3_y, WIDTH - 60, c3_y + 360), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=2)
    draw.text((100, c3_y + 35), "EXTREMOS TÉRMICOS REGISTRADOS", font=get_font(True, 30), fill=COLOR_BLUE)

    draw_rounded_rect(draw, (95, c3_y + 80, 520, c3_y + 295), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=2)
    draw.text((120, c3_y + 105), "MENOR TEMPERATURA", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((120, c3_y + 150), "18,4 °C", font=get_font(True, 50), fill=COLOR_BLUE)
    draw.text((120, c3_y + 235), "Madrugadas frescas sob frente fria", font=get_font(False, 20), fill=COLOR_MUTED)

    draw_rounded_rect(draw, (545, c3_y + 80, WIDTH - 95, c3_y + 295), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=16, width=2)
    draw.text((570, c3_y + 105), "MAIOR TEMPERATURA", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((570, c3_y + 150), "32,6 °C", font=get_font(True, 50), fill=COLOR_ORANGE)
    draw.text((570, c3_y + 235), "Tardes quentes sob atuação da ASAS", font=get_font(False, 20), fill=COLOR_MUTED)

# SCENE 5: SISTEMAS METEOROLÓGICOS ATUANTES
def render_scene_5(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 48)
    draw.text((WIDTH // 2, 170), "SISTEMAS METEOROLÓGICOS", font=f_s_title, fill=COLOR_WHITE, anchor="mm")
    f_s_sub = get_font(False, 26)
    draw.text((WIDTH // 2, 225), "Distribuição dos padrões atmosféricos que comandaram Outubro/2026", font=f_s_sub, fill=COLOR_MUTED, anchor="mm")

    systems = [
        {"title": "Alta Subtropical do Atlântico Sul (ASAS)", "days": 12, "desc": "Tempo estável, sol, calor e vento nordeste costeiro", "color": COLOR_ORANGE},
        {"title": "Cavado Costeiro / Instabilidade Local", "days": 8, "desc": "Pancadas de chuva convectiva e trovoadas de primavera", "color": COLOR_BLUE},
        {"title": "Passagem de Frente Fria / Sistema Frontal", "days": 4, "desc": "Quedas de temperatura, viradas de vento e chuva volumosa", "color": COLOR_ORANGE},
        {"title": "Cavado Costeiro / Convergência de Umidade", "days": 4, "desc": "Canal de umidade mantendo precipitação contínua", "color": COLOR_BLUE},
        {"title": "Circulação Marítima Pós-Frontal (SE/S)", "days": 3, "desc": "Ventos oceânicos, muitas nuvens e chuviscos costeiros", "color": COLOR_BLUE}
    ]

    start_y = 285
    row_h = 220

    for idx, sys in enumerate(systems):
        st_frame = max(0, rel_frame - idx * 6)
        progress = min(1.0, st_frame / 30.0)
        eased = 1.0 - math.pow(1.0 - progress, 3)

        y = start_y + idx * row_h
        box_w = WIDTH - 120
        box_h = 195
        box_x = 60

        draw_rounded_rect(draw, (box_x, y, box_x + box_w, y + box_h), fill=COLOR_NAVY, outline=sys["color"], radius=24, width=2)

        draw_rounded_rect(draw, (box_x + 25, y + 25, box_x + 105, y + 105), fill=COLOR_SUB_BG, outline=sys["color"], radius=18, width=2)
        draw.text((box_x + 65, y + 65), f"{idx+1}º", font=get_font(True, 32), fill=sys["color"], anchor="mm")

        draw.text((box_x + 130, y + 35), sys["title"], font=get_font(True, 30), fill=COLOR_WHITE)
        draw.text((box_x + 130, y + 80), sys["desc"], font=get_font(False, 22), fill=COLOR_MUTED)

        bar_x = box_x + 130
        bar_y = y + 130
        bar_max_w = box_w - 280
        draw_rounded_rect(draw, (bar_x, bar_y, bar_x + bar_max_w, bar_y + 24), fill=COLOR_TRACK, radius=12)
        
        ratio = (sys["days"] / 12.0) * eased
        fill_w = max(int(bar_max_w * ratio), 16 if eased > 0.05 else 0)
        if fill_w > 0:
            draw_rounded_rect(draw, (bar_x, bar_y, bar_x + fill_w, bar_y + 24), fill=sys["color"], radius=12)

        dias_anim = int(sys["days"] * eased)
        draw.text((box_x + box_w - 40, bar_y + 12), f"{dias_anim} DIAS", font=get_font(True, 28), fill=sys["color"], anchor="rm")

# SCENE 6: ENCERRAMENTO OFICIAL COM IDENTIDADE VISUAL
def render_scene_6(draw, frame_img, rel_frame):
    f_t1 = get_font(True, 52)
    draw.text((WIDTH // 2, 230), "ACOMPANHE O CLIMA DIARIAMENTE!", font=f_t1, fill=COLOR_WHITE, anchor="mm")

    f_t2 = get_font(False, 28)
    draw.text((WIDTH // 2, 295), "Previsões diárias, alertas e monitoramento em tempo real", font=f_t2, fill=COLOR_BLUE, anchor="mm")

    if full_card:
        target_w = 980
        target_h = int(full_card.height * (target_w / full_card.width))
        c_resized = full_card.resize((target_w, target_h), Image.Resampling.LANCZOS)
        cx = (WIDTH - target_w) // 2
        cy = 400
        
        draw_rounded_rect(draw, (cx - 10, cy - 10, cx + target_w + 10, cy + target_h + 10), fill=COLOR_ORANGE, radius=28)
        frame_img.paste(c_resized, (cx, cy), c_resized)
        
        box_y = cy + target_h + 60
    else:
        box_y = 900

    box_h = 360
    draw_rounded_rect(draw, (80, box_y, WIDTH - 80, box_y + box_h), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=2)

    draw.text((WIDTH // 2, box_y + 55), "MONITORAMENTO COMPLETO DA CIDADE", font=get_font(True, 32), fill=COLOR_WHITE, anchor="mm")

    items = [
        "Avisos de frentes frias, chuvas intensas e ressacas",
        "Acumulados de chuva em todas as estações municipais",
        "Boletins diários com tendências da temperatura e ventos"
    ]
    for i, it in enumerate(items):
        iy = box_y + 115 + i * 50
        draw.text((130, iy), "•", font=get_font(True, 28), fill=COLOR_ORANGE)
        draw.text((165, iy), it, font=get_font(False, 26), fill=COLOR_MUTED)

    draw.line([(140, box_y + 275), (WIDTH - 140, box_y + 275)], fill=COLOR_BLUE, width=2)
    draw.text((WIDTH // 2, box_y + 315), "Curta, compartilhe e fique por dentro do clima em Rio das Ostras!", font=get_font(True, 24), fill=COLOR_ORANGE, anchor="mm")

def main():
    out_dir = "C:/Users/debor/.gemini/antigravity/scratch/clima-rio-das-ostras/public/videos"
    os.makedirs(out_dir, exist_ok=True)
    temp_raw = os.path.join(out_dir, "temp_reels_ai_raw.mp4")
    out_path = os.path.join(out_dir, "panorama_outubro_2026_reels.mp4")
    audio_path = "C:/Users/debor/.gemini/antigravity/scratch/master_voice_norm.wav"

    print(f"Generating video frames: {temp_raw}")
    print(f"Total frames: {TOTAL_FRAMES} at {FPS} FPS ({TOTAL_SECONDS}s)")

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(temp_raw, fourcc, FPS, (WIDTH, HEIGHT))

    if not writer.isOpened():
        print("ERROR: Could not open VideoWriter!")
        return

    for f_idx in range(TOTAL_FRAMES):
        frame = render_frame(f_idx)
        writer.write(frame)
        if f_idx % 120 == 0:
            print(f"Rendered {f_idx}/{TOTAL_FRAMES} frames ({(f_idx/TOTAL_FRAMES)*100:.1f}%)")

    writer.release()
    print("Video stream rendered. Now muxing audio with FFmpeg (H.264 + AAC)...")

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg, "-y",
        "-i", temp_raw,
        "-i", audio_path,
        "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        out_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print("DONE! Master Reels video created:", out_path)
        print("File size:", os.path.getsize(out_path), "bytes")
        if os.path.exists(temp_raw):
            os.remove(temp_raw)
    else:
        print("FFmpeg error:", res.stderr)

if __name__ == "__main__":
    main()
