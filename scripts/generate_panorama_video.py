import os
import math
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1080
HEIGHT = 1920
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

# Load user logo assets if available
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

# Pre-generate floating particles for smooth atmospheric animation
np.random.seed(42)
NUM_PARTICLES = 50
particle_x = np.random.uniform(20, WIDTH - 20, NUM_PARTICLES)
particle_y = np.random.uniform(0, HEIGHT, NUM_PARTICLES)
particle_speed = np.random.uniform(0.8, 2.5, NUM_PARTICLES)
particle_size = np.random.uniform(2, 6, NUM_PARTICLES)
particle_alpha = np.random.uniform(40, 160, NUM_PARTICLES)

# Pre-render background gradient base
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
    top_y = 65
    draw.line([(50, top_y + 60), (WIDTH - 50, top_y + 60)], fill=(56, 189, 248, 60), width=2)
    
    f_brand = get_font(True, 26)
    draw.text((60, top_y + 12), "@tempoemriodasostras", font=f_brand, fill=(248, 250, 252, 240))
    
    badge_w = 260
    badge_h = 42
    badge_x = WIDTH - 50 - badge_w
    badge_y = top_y + 6
    draw_rounded_rect(draw, (badge_x, badge_y, badge_x + badge_w, badge_y + badge_h), fill=(35, 25, 20), outline=(249, 115, 22), radius=12, width=2)
    f_badge = get_font(True, 20)
    draw.text((badge_x + badge_w // 2, badge_y + badge_h // 2), "OUTUBRO / 2026", font=f_badge, fill=(255, 186, 115), anchor="mm")

def render_frame(frame_idx):
    frame_img = base_bg.copy()
    draw = ImageDraw.Draw(frame_img)
    
    # Atmospheric particles
    for i in range(NUM_PARTICLES):
        py = (particle_y[i] - frame_idx * particle_speed[i]) % HEIGHT
        px = (particle_x[i] + math.sin(frame_idx * 0.03 + i) * 15) % WIDTH
        p_sz = int(particle_size[i])
        p_al = int(particle_alpha[i] * (0.6 + 0.4 * math.sin(frame_idx * 0.05 + i)))
        draw.ellipse([px, py, px + p_sz, py + p_sz], fill=(56, 189, 248, p_al))

    # Top persistent header
    draw_header_bar(draw, frame_idx)

    # SCENE DETERMINATION
    # S1: 0 - 140 (0s - 4.6s) -> Abertura
    # S2: 140 - 320 (4.6s - 10.6s) -> Grandes Números de Chuva
    # S3: 320 - 540 (10.6s - 18.0s) -> Ranking por Estação
    # S4: 540 - 710 (18.0s - 23.6s) -> Ventos, Rajadas & Temperaturas
    # S5: 710 - 830 (23.6s - 27.6s) -> Sistemas Meteorológicos Atuantes
    # S6: 830 - 930 (27.6s - 31.0s) -> Encerramento Oficial com Logo e Redes

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

    # Bottom watermark footer
    f_foot = get_font(False, 24)
    draw.text((WIDTH // 2, HEIGHT - 55), "Fontes: Estações Meteorológicas do Município", font=f_foot, fill=(148, 163, 184, 190), anchor="mm")

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
        draw.text((WIDTH // 2, 420), "TEMPO EM RIO DAS OSTRAS", font=f_logo, fill=(255, 255, 255), anchor="mm")

    box_w = 960
    box_h = 580
    box_x = (WIDTH - box_w) // 2
    box_y = 740

    pulse = math.sin(rel_frame * 0.08) * 4
    draw_rounded_rect(draw, (box_x - pulse, box_y - pulse, box_x + box_w + pulse, box_y + box_h + pulse), 
                      fill=(24, 38, 70), outline=(0, 229, 255), radius=32, width=3)

    tag_w = 440
    tag_h = 48
    tag_x = (WIDTH - tag_w) // 2
    tag_y = box_y + 40
    draw_rounded_rect(draw, (tag_x, tag_y, tag_x + tag_w, tag_y + tag_h), fill=(15, 38, 65), outline=(0, 229, 255), radius=24, width=2)
    f_tag = get_font(True, 22)
    draw.text((WIDTH // 2, tag_y + tag_h // 2), "RETROSPECTIVA METEOROLÓGICA", font=f_tag, fill=(0, 229, 255), anchor="mm")

    f_main1 = get_font(True, 62)
    draw.text((WIDTH // 2, box_y + 160), "PANORAMA DO CLIMA", font=f_main1, fill=(255, 255, 255), anchor="mm")
    
    f_main2 = get_font(True, 96)
    draw.text((WIDTH // 2, box_y + 265), "OUTUBRO 2026", font=f_main2, fill=(249, 115, 22), anchor="mm")

    draw.line([(WIDTH // 2 - 200, box_y + 345), (WIDTH // 2 + 200, box_y + 345)], fill=(249, 115, 22), width=4)

    f_sub = get_font(False, 34)
    draw.text((WIDTH // 2, box_y + 410), "RIO DAS OSTRAS • RJ", font=f_sub, fill=(226, 232, 240), anchor="mm")

    f_detail = get_font(False, 26)
    draw.text((WIDTH // 2, box_y + 490), "Balanço Consolidado de Todas as Estações", font=f_detail, fill=(148, 163, 184), anchor="mm")

    call_y = 1420
    draw_rounded_rect(draw, (80, call_y, WIDTH - 80, call_y + 160), fill=(15, 23, 42), outline=(56, 189, 248), radius=24, width=2)
    f_c1 = get_font(True, 30)
    draw.text((WIDTH // 2, call_y + 45), "• UM DOS MESES MAIS CHUVOSOS DO ANO •", font=f_c1, fill=(56, 189, 248), anchor="mm")
    f_c2 = get_font(False, 26)
    draw.text((WIDTH // 2, call_y + 105), "Confira os acumulados, rajadas de vento e recordes!", font=f_c2, fill=(203, 213, 225), anchor="mm")

# SCENE 2: GRANDES NÚMEROS (CHUVA MÉDIA, DIAS, DIA MAIS CHUVOSO) - ZERO OVERLAPS
def render_scene_2(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 46)
    draw.text((WIDTH // 2, 175), "VOLUME & FREQUÊNCIA DE CHUVA", font=f_s_title, fill=(255, 255, 255), anchor="mm")
    f_s_sub = get_font(False, 26)
    draw.text((WIDTH // 2, 225), "Balanço geral de precipitação em Rio das Ostras", font=f_s_sub, fill=(148, 163, 184), anchor="mm")

    progress = min(1.0, rel_frame / 45.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    # CARD 1: 25 DIAS COM CHUVA
    c1_y = 280
    draw_rounded_rect(draw, (60, c1_y, WIDTH - 60, c1_y + 350), fill=(18, 30, 56), outline=(56, 189, 248), radius=28, width=3)
    
    # Badge
    draw_rounded_rect(draw, (95, c1_y + 25, 380, c1_y + 72), fill=(15, 38, 65), outline=(56, 189, 248), radius=14, width=2)
    draw.text((95 + 142, c1_y + 48), "FREQUÊNCIA RECORDE", font=get_font(True, 22), fill=(56, 189, 248), anchor="mm")
    
    # Big Number + Text on the right
    dias_anim = int(25 * eased)
    f_big = get_font(True, 100)
    draw.text((100, c1_y + 90), f"{dias_anim}", font=f_big, fill=(255, 255, 255))
    
    draw.text((270, c1_y + 115), "DIAS COM CHUVA", font=get_font(True, 40), fill=(0, 229, 255))
    draw.text((270, c1_y + 168), "em 31 dias monitorados (80% do mês)", font=get_font(False, 26), fill=(203, 213, 225))

    # Progress bar ratio of days with 46px margin below number
    bar_y = c1_y + 245
    draw_rounded_rect(draw, (100, bar_y, WIDTH - 100, bar_y + 26), fill=(30, 41, 59), radius=13)
    bar_fill = int((WIDTH - 200) * (25 / 31) * eased)
    if bar_fill > 20:
        draw_rounded_rect(draw, (100, bar_y, 100 + bar_fill, bar_y + 26), fill=(0, 229, 255), radius=13)
    draw.text((100, bar_y + 36), "80% do mês teve precipitação registrada no município", font=get_font(False, 22), fill=(148, 163, 184))

    # CARD 2: CHUVA MÉDIA NA REDE
    c2_y = 665
    draw_rounded_rect(draw, (60, c2_y, WIDTH - 60, c2_y + 350), fill=(18, 30, 56), outline=(249, 115, 22), radius=28, width=3)
    
    draw_rounded_rect(draw, (95, c2_y + 25, 370, c2_y + 72), fill=(45, 28, 18), outline=(249, 115, 22), radius=14, width=2)
    draw.text((95 + 137, c2_y + 48), "MÉDIA MUNICIPAL", font=get_font(True, 22), fill=(255, 186, 115), anchor="mm")

    val_anim = round(243.3 * eased, 1)
    draw.text((100, c2_y + 90), f"{val_anim}", font=f_big, fill=(255, 255, 255))
    draw.text((435, c2_y + 130), "mm", font=get_font(True, 50), fill=(249, 115, 22))

    draw.text((550, c2_y + 115), "MÉDIA GERAL", font=get_font(True, 34), fill=(255, 255, 255))
    draw.text((550, c2_y + 165), "Volume muito acima do normal", font=get_font(False, 24), fill=(203, 213, 225))

    # Peak banner inside Card 2 with 35px margin below number
    peak_y = c2_y + 245
    draw_rounded_rect(draw, (95, peak_y, WIDTH - 95, peak_y + 70), fill=(30, 41, 59), outline=(249, 115, 22), radius=16, width=2)
    draw.text((WIDTH // 2, peak_y + 35), "PICO MÁXIMO NO MUNICÍPIO: 410,0 mm (Rocha Leão)", font=get_font(True, 26), fill=(255, 215, 0), anchor="mm")

    # CARD 3: DIA MAIS CHUVOSO (02/10/2026)
    c3_y = 1050
    draw_rounded_rect(draw, (60, c3_y, WIDTH - 60, c3_y + 430), fill=(18, 30, 56), outline=(168, 85, 247), radius=28, width=3)

    draw_rounded_rect(draw, (95, c3_y + 25, 380, c3_y + 72), fill=(38, 24, 60), outline=(168, 85, 247), radius=14, width=2)
    draw.text((95 + 142, c3_y + 48), "EVENTO MAIS SEVERO", font=get_font(True, 22), fill=(216, 180, 254), anchor="mm")

    draw.text((100, c3_y + 95), "02 / 10 / 2026", font=get_font(True, 64), fill=(255, 255, 255))
    draw.text((100, c3_y + 180), "O DIA MAIS CHUVOSO DE OUTUBRO", font=get_font(True, 30), fill=(192, 132, 252))

    # Sub boxes with 27px margin below subtitle
    box1_w = 425
    draw_rounded_rect(draw, (95, c3_y + 235, 95 + box1_w, c3_y + 345), fill=(25, 35, 60), outline=(168, 85, 247), radius=16, width=2)
    draw.text((120, c3_y + 252), "MÉDIA NA REDE EM 24H", font=get_font(False, 20), fill=(148, 163, 184))
    draw.text((120, c3_y + 285), "48,0 mm", font=get_font(True, 44), fill=(255, 255, 255))

    draw_rounded_rect(draw, (WIDTH - 95 - box1_w, c3_y + 235, WIDTH - 95, c3_y + 345), fill=(25, 35, 60), outline=(249, 115, 22), radius=16, width=2)
    draw.text((WIDTH - 95 - box1_w + 25, c3_y + 252), "MÁXIMA PONTUAL EM 24H", font=get_font(False, 20), fill=(148, 163, 184))
    draw.text((WIDTH - 95 - box1_w + 25, c3_y + 285), "84,3 mm", font=get_font(True, 44), fill=(249, 115, 22))

    draw.text((WIDTH // 2, c3_y + 385), "Passagem de frente fria combinada com cavado costeiro", font=get_font(False, 24), fill=(148, 163, 184), anchor="mm")

# SCENE 3: RANKING DE CHUVA POR ESTAÇÃO
def render_scene_3(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 48)
    draw.text((WIDTH // 2, 170), "ACUMULADOS POR ESTAÇÃO", font=f_s_title, fill=(255, 255, 255), anchor="mm")
    f_s_sub = get_font(False, 26)
    draw.text((WIDTH // 2, 225), "Ranking total de chuva registrada em Outubro / 2026", font=f_s_sub, fill=(148, 163, 184), anchor="mm")

    stations_data = [
        {"name": "Rocha Leão (REBIO União)", "val": 410.0, "code": "IRIODA15", "badge": "1º LUGAR • RECORDE", "color": (249, 115, 22)},
        {"name": "Cantagalo (LERIP)", "val": 191.7, "code": "IRIODA16", "badge": "2º LUGAR", "color": (56, 189, 248)},
        {"name": "Praiamar / Divisa Sul", "val": 177.3, "code": "ICASIM5", "badge": "3º LUGAR", "color": (56, 189, 248)},
        {"name": "Praia da Tartaruga (Defesa Civil)", "val": 167.9, "code": "IRIODA17", "badge": "4º LUGAR", "color": (56, 189, 248)},
        {"name": "Costazul (Escola Jacinto)", "val": 131.3, "code": "IRIODA6", "badge": "5º LUGAR", "color": (56, 189, 248)}
    ]

    max_val = 410.0
    start_y = 285
    row_height = 185

    for idx, st in enumerate(stations_data):
        st_frame = max(0, rel_frame - idx * 8)
        progress = min(1.0, st_frame / 35.0)
        eased = 1.0 - math.pow(1.0 - progress, 3)

        row_y = start_y + idx * row_height
        box_w = WIDTH - 120
        box_h = 160
        box_x = 60

        is_top = (idx == 0)
        border_col = (249, 115, 22) if is_top else (56, 189, 248)
        bg_col = (28, 38, 65) if is_top else (18, 28, 50)
        draw_rounded_rect(draw, (box_x, row_y, box_x + box_w, row_y + box_h), fill=bg_col, outline=border_col, radius=22, width=3 if is_top else 2)

        f_name = get_font(True, 32 if not is_top else 34)
        name_col = (255, 255, 255)
        draw.text((box_x + 30, row_y + 24), st["name"], font=f_name, fill=name_col)

        badge_w = 200 if not is_top else 270
        bx = box_x + box_w - badge_w - 30
        by = row_y + 22
        b_bg = (45, 28, 18) if is_top else (15, 38, 65)
        b_txt = (255, 186, 115) if is_top else (56, 189, 248)
        draw_rounded_rect(draw, (bx, by, bx + badge_w, by + 36), fill=b_bg, outline=border_col, radius=10, width=1)
        draw.text((bx + badge_w // 2, by + 18), st["badge"], font=get_font(True, 18), fill=b_txt, anchor="mm")

        bar_x = box_x + 30
        bar_y = row_y + 90
        bar_max_w = box_w - 240
        draw_rounded_rect(draw, (bar_x, bar_y, bar_x + bar_max_w, bar_y + 24), fill=(30, 41, 59), radius=12)

        fill_w = int(bar_max_w * (st["val"] / max_val) * eased)
        if fill_w > 15:
            draw_rounded_rect(draw, (bar_x, bar_y, bar_x + fill_w, bar_y + 24), fill=st["color"], radius=12)

        curr_val = round(st["val"] * eased, 1)
        f_val = get_font(True, 36)
        draw.text((box_x + box_w - 30, bar_y + 12), f"{curr_val} mm", font=f_val, fill=(255, 255, 255), anchor="rm")

    call_y = 1250
    draw_rounded_rect(draw, (60, call_y, WIDTH - 60, call_y + 150), fill=(15, 23, 42), outline=(0, 229, 255), radius=22, width=2)
    draw.text((WIDTH // 2, call_y + 40), "MONITORAMENTO DO RIO JUNDIÁ (INEA)", font=get_font(True, 28), fill=(0, 229, 255), anchor="mm")
    draw.text((WIDTH // 2, call_y + 85), "Cotas horárias sob vigilância contínua • Calha estável no mês", font=get_font(False, 24), fill=(203, 213, 225), anchor="mm")

# SCENE 4: VENTOS, RAJADAS E TEMPERATURAS - ZERO OVERLAPS
def render_scene_4(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 48)
    draw.text((WIDTH // 2, 170), "VENTOS & TEMPERATURAS", font=f_s_title, fill=(255, 255, 255), anchor="mm")
    f_s_sub = get_font(False, 26)
    draw.text((WIDTH // 2, 225), "Extremos de rajadas de vento e variação térmica em Outubro", font=f_s_sub, fill=(148, 163, 184), anchor="mm")

    progress = min(1.0, rel_frame / 40.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    # CARD 1: MAIOR RAJADA DO MÊS (62,3 km/h)
    c1_y = 280
    draw_rounded_rect(draw, (60, c1_y, WIDTH - 60, c1_y + 350), fill=(18, 30, 56), outline=(249, 115, 22), radius=28, width=3)
    
    draw_rounded_rect(draw, (95, c1_y + 25, 380, c1_y + 72), fill=(45, 28, 18), outline=(249, 115, 22), radius=14, width=2)
    draw.text((95 + 142, c1_y + 48), "RECORDE DE VENTO", font=get_font(True, 22), fill=(255, 186, 115), anchor="mm")

    rajada_anim = round(62.3 * eased, 1)
    f_big = get_font(True, 100)
    draw.text((100, c1_y + 90), f"{rajada_anim}", font=f_big, fill=(255, 255, 255))
    draw.text((435, c1_y + 130), "km/h", font=get_font(True, 50), fill=(249, 115, 22))

    draw.text((560, c1_y + 115), "MAIOR RAJADA", font=get_font(True, 34), fill=(255, 255, 255))
    draw.text((560, c1_y + 165), "Registrada no mês", font=get_font(False, 24), fill=(203, 213, 225))

    sub_y = c1_y + 245
    draw_rounded_rect(draw, (95, sub_y, WIDTH - 95, sub_y + 70), fill=(30, 41, 59), outline=(249, 115, 22), radius=16, width=2)
    draw.text((WIDTH // 2, sub_y + 35), "Praia da Tartaruga (Defesa Civil) • 26/10 às 10:00 da manhã", font=get_font(True, 24), fill=(255, 237, 213), anchor="mm")

    # CARD 2: VENTO MÉDIO & VELOCIDADE MÁXIMA SUSTENTADA
    c2_y = 665
    draw_rounded_rect(draw, (60, c2_y, WIDTH - 60, c2_y + 350), fill=(18, 30, 56), outline=(56, 189, 248), radius=28, width=2)
    
    draw.text((100, c2_y + 35), "DINÂMICA DOS VENTOS", font=get_font(True, 30), fill=(56, 189, 248))

    # 2 columns inside card 2
    draw_rounded_rect(draw, (95, c2_y + 80, 520, c2_y + 285), fill=(25, 35, 60), outline=(56, 189, 248), radius=16, width=2)
    draw.text((120, c2_y + 105), "VENTO MÉDIO MENSAL", font=get_font(False, 20), fill=(148, 163, 184))
    draw.text((120, c2_y + 145), "16,6 km/h", font=get_font(True, 44), fill=(255, 255, 255))
    draw.text((120, c2_y + 225), "Predominante: NE (Nordeste)", font=get_font(True, 22), fill=(56, 189, 248))

    draw_rounded_rect(draw, (545, c2_y + 80, WIDTH - 95, c2_y + 285), fill=(25, 35, 60), outline=(249, 115, 22), radius=16, width=2)
    draw.text((570, c2_y + 105), "VELOCIDADE SUSTENTADA MÁX.", font=get_font(False, 20), fill=(148, 163, 184))
    draw.text((570, c2_y + 145), "51,1 km/h", font=get_font(True, 44), fill=(249, 115, 22))
    draw.text((570, c2_y + 225), "Ocorrência: 25/10/2026", font=get_font(True, 22), fill=(255, 186, 115))

    # CARD 3: EXTREMOS TÉRMICOS (18,4°C a 32,6°C)
    c3_y = 1050
    draw_rounded_rect(draw, (60, c3_y, WIDTH - 60, c3_y + 360), fill=(18, 30, 56), outline=(16, 185, 129), radius=28, width=2)
    
    draw.text((100, c3_y + 35), "EXTREMOS TÉRMICOS REGISTRADOS", font=get_font(True, 30), fill=(52, 211, 153))

    draw_rounded_rect(draw, (95, c3_y + 80, 520, c3_y + 295), fill=(25, 35, 60), outline=(56, 189, 248), radius=16, width=2)
    draw.text((120, c3_y + 105), "MENOR TEMPERATURA", font=get_font(False, 20), fill=(148, 163, 184))
    draw.text((120, c3_y + 150), "18,4 °C", font=get_font(True, 50), fill=(56, 189, 248))
    draw.text((120, c3_y + 235), "Madrugadas frescas sob frente fria", font=get_font(False, 20), fill=(203, 213, 225))

    draw_rounded_rect(draw, (545, c3_y + 80, WIDTH - 95, c3_y + 295), fill=(25, 35, 60), outline=(239, 68, 68), radius=16, width=2)
    draw.text((570, c3_y + 105), "MAIOR TEMPERATURA", font=get_font(False, 20), fill=(148, 163, 184))
    draw.text((570, c3_y + 150), "32,6 °C", font=get_font(True, 50), fill=(239, 68, 68))
    draw.text((570, c3_y + 235), "Tardes quentes sob atuação da ASAS", font=get_font(False, 20), fill=(203, 213, 225))

# SCENE 5: SISTEMAS METEOROLÓGICOS ATUANTES
def render_scene_5(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 48)
    draw.text((WIDTH // 2, 170), "SISTEMAS METEOROLÓGICOS", font=f_s_title, fill=(255, 255, 255), anchor="mm")
    f_s_sub = get_font(False, 26)
    draw.text((WIDTH // 2, 225), "Distribuição dos padrões atmosféricos que comandaram Outubro/2026", font=f_s_sub, fill=(148, 163, 184), anchor="mm")

    systems = [
        {"title": "Alta Subtropical do Atlântico Sul (ASAS)", "days": 12, "desc": "Tempo estável, sol, calor e vento nordeste costeiro", "color": (249, 115, 22)},
        {"title": "Cavado Costeiro / Instabilidade Local", "days": 8, "desc": "Pancadas de chuva convectiva e trovoadas de primavera", "color": (56, 189, 248)},
        {"title": "Passagem de Frente Fria / Sistema Frontal", "days": 4, "desc": "Quedas de temperatura, viradas de vento e chuva volumosa", "color": (168, 85, 247)},
        {"title": "Cavado Costeiro / Convergência de Umidade", "days": 4, "desc": "Canal de umidade mantendo precipitação contínua", "color": (0, 229, 255)},
        {"title": "Circulação Marítima Pós-Frontal (SE/S)", "days": 3, "desc": "Ventos oceânicos, muitas nuvens e chuviscos costeiros", "color": (148, 163, 184)}
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

        draw_rounded_rect(draw, (box_x, y, box_x + box_w, y + box_h), fill=(18, 30, 56), outline=sys["color"], radius=24, width=2)

        draw_rounded_rect(draw, (box_x + 25, y + 25, box_x + 105, y + 105), fill=(25, 38, 65), outline=sys["color"], radius=18, width=2)
        draw.text((box_x + 65, y + 65), f"{idx+1}º", font=get_font(True, 32), fill=sys["color"], anchor="mm")

        draw.text((box_x + 130, y + 35), sys["title"], font=get_font(True, 30), fill=(255, 255, 255))
        draw.text((box_x + 130, y + 80), sys["desc"], font=get_font(False, 22), fill=(203, 213, 225))

        bar_x = box_x + 130
        bar_y = y + 130
        bar_max_w = box_w - 280
        draw_rounded_rect(draw, (bar_x, bar_y, bar_x + bar_max_w, bar_y + 24), fill=(30, 41, 59), radius=12)
        
        ratio = (sys["days"] / 12.0) * eased
        fill_w = max(int(bar_max_w * ratio), 16 if eased > 0.05 else 0)
        if fill_w > 0:
            draw_rounded_rect(draw, (bar_x, bar_y, bar_x + fill_w, bar_y + 24), fill=sys["color"], radius=12)

        dias_anim = int(sys["days"] * eased)
        draw.text((box_x + box_w - 40, bar_y + 12), f"{dias_anim} DIAS", font=get_font(True, 28), fill=sys["color"], anchor="rm")

# SCENE 6: ENCERRAMENTO OFICIAL COM IDENTIDADE VISUAL
def render_scene_6(draw, frame_img, rel_frame):
    if full_card:
        target_w = 980
        target_h = int(full_card.height * (target_w / full_card.width))
        c_resized = full_card.resize((target_w, target_h), Image.Resampling.LANCZOS)
        cx = (WIDTH - target_w) // 2
        cy = 500
        
        draw_rounded_rect(draw, (cx - 10, cy - 10, cx + target_w + 10, cy + target_h + 10), fill=(249, 115, 22), radius=28)
        frame_img.paste(c_resized, (cx, cy), c_resized)
    
    f_t1 = get_font(True, 56)
    draw.text((WIDTH // 2, 280), "ACOMPANHE O CLIMA DIARIAMENTE!", font=f_t1, fill=(255, 255, 255), anchor="mm")

    f_t2 = get_font(False, 32)
    draw.text((WIDTH // 2, 360), "Alertas, chuvas em tempo real e análises oficiais", font=f_t2, fill=(56, 189, 248), anchor="mm")

    box_y = 1140
    draw_rounded_rect(draw, (80, box_y, WIDTH - 80, box_y + 440), fill=(18, 30, 56), outline=(249, 115, 22), radius=32, width=3)

    f_social_t = get_font(True, 40)
    draw.text((WIDTH // 2, box_y + 60), "SIGA NOSSAS REDES OFICIAIS:", font=f_social_t, fill=(255, 255, 255), anchor="mm")

    f_handle = get_font(True, 44)
    draw.text((WIDTH // 2, box_y + 150), "Instagram: @tempoemriodasostras", font=f_handle, fill=(249, 115, 22), anchor="mm")
    draw.text((WIDTH // 2, box_y + 230), "TikTok: @tempoemriodasostras", font=f_handle, fill=(0, 229, 255), anchor="mm")
    draw.text((WIDTH // 2, box_y + 305), "X (Twitter): @tempoemro", font=f_handle, fill=(241, 245, 249), anchor="mm")

    draw.line([(120, box_y + 360), (WIDTH - 120, box_y + 360)], fill=(56, 189, 248), width=2)
    f_web = get_font(True, 28)
    draw.text((WIDTH // 2, box_y + 400), "Fontes: Estações Meteorológicas do Município", font=f_web, fill=(56, 189, 248), anchor="mm")

def main():
    out_dir = "C:/Users/debor/.gemini/antigravity/scratch/clima-rio-das-ostras/public/videos"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "panorama_outubro_2026_reels.mp4")

    print(f"Generating video: {out_path}")
    print(f"Total frames: {TOTAL_FRAMES} at {FPS} FPS ({TOTAL_SECONDS}s)")

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(out_path, fourcc, FPS, (WIDTH, HEIGHT))

    if not writer.isOpened():
        print("ERROR: Could not open VideoWriter!")
        return

    for f_idx in range(TOTAL_FRAMES):
        frame = render_frame(f_idx)
        writer.write(frame)
        if f_idx % 60 == 0:
            print(f"Rendered {f_idx}/{TOTAL_FRAMES} frames ({(f_idx/TOTAL_FRAMES)*100:.1f}%)")

    writer.release()
    print("DONE! File created:", out_path)
    print("File size:", os.path.getsize(out_path), "bytes")

if __name__ == "__main__":
    main()
