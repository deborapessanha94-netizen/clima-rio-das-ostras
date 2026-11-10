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
    # Gradient from deep dark navy (top) to rich oceanic navy (middle) to midnight blue (bottom)
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
    # Top persistent watermark & branding
    top_y = 65
    draw.line([(50, top_y + 60), (WIDTH - 50, top_y + 60)], fill=(56, 189, 248, 60), width=2)
    
    # Left tag
    f_brand = get_font(True, 26)
    draw.text((60, top_y + 12), "@tempoemriodasostras", font=f_brand, fill=(248, 250, 252, 240))
    
    # Right badge
    badge_w = 260
    badge_h = 42
    badge_x = WIDTH - 50 - badge_w
    badge_y = top_y + 6
    draw_rounded_rect(draw, (badge_x, badge_y, badge_x + badge_w, badge_y + badge_h), fill=(249, 115, 22, 40), outline=(249, 115, 22, 180), radius=12, width=2)
    f_badge = get_font(True, 20)
    draw.text((badge_x + 18, badge_y + 8), "OUTUBRO / 2026", font=f_badge, fill=(255, 186, 115, 255))

def render_frame(frame_idx):
    # Create frame copy
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
    f_foot = get_font(False, 22)
    draw.text((WIDTH // 2, HEIGHT - 55), "clima-rio-das-ostras.vercel.app  •  Fontes: WU / INEA / CEMADEN", font=f_foot, fill=(148, 163, 184, 180), anchor="mm")

    return cv2.cvtColor(np.array(frame_img), cv2.COLOR_RGBA2BGR)

# SCENE 1: ABERTURA OFICIAL
def render_scene_1(draw, frame_img, rel_frame):
    # Entrance progress
    alpha = min(1.0, rel_frame / 20.0)
    
    # Official logo placement
    if user_logo:
        # Resize logo nicely
        logo_w = 520
        logo_h = int(user_logo.height * (logo_w / user_logo.width))
        resized_logo = user_logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        logo_x = (WIDTH - logo_w) // 2
        logo_y = 360
        frame_img.paste(resized_logo, (logo_x, logo_y), resized_logo)
    else:
        f_logo = get_font(True, 64)
        draw.text((WIDTH // 2, 420), "TEMPO EM RIO DAS OSTRAS", font=f_logo, fill=(255, 255, 255), anchor="mm")

    # Title Card Glow Box
    box_w = 960
    box_h = 580
    box_x = (WIDTH - box_w) // 2
    box_y = 740

    # Animated scale & glow
    pulse = math.sin(rel_frame * 0.08) * 4
    draw_rounded_rect(draw, (box_x - pulse, box_y - pulse, box_x + box_w + pulse, box_y + box_h + pulse), 
                      fill=(24, 38, 70, 230), outline=(0, 229, 255, 180), radius=32, width=3)

    # Accent Cyan Tag
    tag_w = 440
    tag_h = 48
    tag_x = (WIDTH - tag_w) // 2
    tag_y = box_y + 40
    draw_rounded_rect(draw, (tag_x, tag_y, tag_x + tag_w, tag_y + tag_h), fill=(0, 229, 255, 35), outline=(0, 229, 255, 200), radius=24, width=2)
    f_tag = get_font(True, 22)
    draw.text((WIDTH // 2, tag_y + tag_h // 2), "RETROSPECTIVA METEOROLÓGICA", font=f_tag, fill=(0, 229, 255, 255), anchor="mm")

    # Big Titles
    f_main1 = get_font(True, 62)
    draw.text((WIDTH // 2, box_y + 160), "PANORAMA DO CLIMA", font=f_main1, fill=(255, 255, 255, 255), anchor="mm")
    
    f_main2 = get_font(True, 96)
    draw.text((WIDTH // 2, box_y + 265), "OUTUBRO 2026", font=f_main2, fill=(249, 115, 22, 255), anchor="mm")

    # Thin orange line
    draw.line([(WIDTH // 2 - 200, box_y + 345), (WIDTH // 2 + 200, box_y + 345)], fill=(249, 115, 22, 220), width=4)

    f_sub = get_font(False, 34)
    draw.text((WIDTH // 2, box_y + 410), "RIO DAS OSTRAS • RJ", font=f_sub, fill=(226, 232, 240, 240), anchor="mm")

    f_detail = get_font(False, 26)
    draw.text((WIDTH // 2, box_y + 490), "Balanço Consolidado de Todas as Estações", font=f_detail, fill=(148, 163, 184, 230), anchor="mm")

    # Bottom Callout
    call_y = 1420
    draw_rounded_rect(draw, (80, call_y, WIDTH - 80, call_y + 160), fill=(15, 23, 42, 200), outline=(56, 189, 248, 120), radius=24, width=2)
    f_c1 = get_font(True, 30)
    draw.text((WIDTH // 2, call_y + 45), "🌧️ UM DOS MESES MAIS CHUVOSOS DO ANO", font=f_c1, fill=(56, 189, 248, 255), anchor="mm")
    f_c2 = get_font(False, 26)
    draw.text((WIDTH // 2, call_y + 105), "Confira os acumulados, rajadas de vento e recordes!", font=f_c2, fill=(203, 213, 225, 240), anchor="mm")

# SCENE 2: GRANDES NÚMEROS (CHUVA MÉDIA, DIAS, DIA MAIS CHUVOSO)
def render_scene_2(draw, frame_img, rel_frame):
    # Scene Title
    f_s_title = get_font(True, 48)
    draw.text((WIDTH // 2, 170), "VOLUME & FREQUÊNCIA DE CHUVA", font=f_s_title, fill=(255, 255, 255), anchor="mm")
    f_s_sub = get_font(False, 26)
    draw.text((WIDTH // 2, 225), "Outubro / 2026 registrou atividade convectiva extraordinária", font=f_s_sub, fill=(148, 163, 184), anchor="mm")

    # Counter progress
    progress = min(1.0, rel_frame / 45.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    # CARD 1: 25 DIAS COM CHUVA
    c1_y = 290
    draw_rounded_rect(draw, (60, c1_y, WIDTH - 60, c1_y + 360), fill=(18, 30, 56, 230), outline=(56, 189, 248, 180), radius=28, width=3)
    
    # Badge
    draw_rounded_rect(draw, (95, c1_y + 35, 95 + 280, c1_y + 80), fill=(2, 132, 199, 45), outline=(56, 189, 248, 220), radius=16, width=2)
    f_b = get_font(True, 22)
    draw.text((95 + 140, c1_y + 57), "FREQUÊNCIA RECORDE", font=f_b, fill=(56, 189, 248), anchor="mm")
    
    # Big Number
    dias_anim = int(25 * eased)
    f_big = get_font(True, 110)
    draw.text((100, c1_y + 200), f"{dias_anim} DIAS", font=f_big, fill=(255, 255, 255))
    
    f_d_label = get_font(True, 42)
    draw.text((540, c1_y + 175), "COM CHUVA", font=f_d_label, fill=(0, 229, 255))
    f_d_sub = get_font(False, 28)
    draw.text((540, c1_y + 230), "em 31 dias monitorados (80% do mês)", font=f_d_sub, fill=(203, 213, 225))

    # Progress bar ratio of days
    bar_y = c1_y + 295
    draw_rounded_rect(draw, (100, bar_y, WIDTH - 100, bar_y + 26), fill=(30, 41, 59, 255), radius=13)
    bar_fill = int((WIDTH - 200) * (25 / 31) * eased)
    if bar_fill > 20:
        draw_rounded_rect(draw, (100, bar_y, 100 + bar_fill, bar_y + 26), fill=(0, 229, 255, 255), radius=13)

    # CARD 2: CHUVA MÉDIA NA REDE
    c2_y = 690
    draw_rounded_rect(draw, (60, c2_y, WIDTH - 60, c2_y + 360), fill=(18, 30, 56, 230), outline=(249, 115, 22, 180), radius=28, width=3)
    
    draw_rounded_rect(draw, (95, c2_y + 35, 95 + 260, c2_y + 80), fill=(249, 115, 22, 45), outline=(249, 115, 22, 220), radius=16, width=2)
    draw.text((95 + 130, c2_y + 57), "MÉDIA MUNICIPAL", font=f_b, fill=(249, 115, 22), anchor="mm")

    val_anim = round(243.3 * eased, 1)
    draw.text((100, c2_y + 200), f"{val_anim}", font=f_big, fill=(255, 255, 255))
    f_unit = get_font(True, 55)
    draw.text((490, c2_y + 215), "mm", font=f_unit, fill=(249, 115, 22))

    f_m_title = get_font(True, 34)
    draw.text((610, c2_y + 175), "MÉDIA GERAL", font=f_m_title, fill=(255, 255, 255))
    f_m_desc = get_font(False, 26)
    draw.text((610, c2_y + 225), "Volume bem acima da climatologia", font=f_m_desc, fill=(203, 213, 225))

    f_peak = get_font(True, 26)
    draw.text((100, c2_y + 300), "⭐ PICO MÁXIMO NO MUNICÍPIO: 410,0 mm (Rocha Leão)", font=f_peak, fill=(255, 215, 0))

    # CARD 3: DIA MAIS CHUVOSO (02/10/2026)
    c3_y = 1090
    draw_rounded_rect(draw, (60, c3_y, WIDTH - 60, c3_y + 400), fill=(18, 30, 56, 230), outline=(168, 85, 247, 180), radius=28, width=3)

    draw_rounded_rect(draw, (95, c3_y + 35, 95 + 280, c3_y + 80), fill=(168, 85, 247, 45), outline=(168, 85, 247, 220), radius=16, width=2)
    draw.text((95 + 140, c3_y + 57), "EVENTO MAIS SEVERO", font=f_b, fill=(192, 132, 252), anchor="mm")

    f_d_date = get_font(True, 64)
    draw.text((100, c3_y + 160), "02 / 10 / 2026", font=f_d_date, fill=(255, 255, 255))
    f_d_name = get_font(True, 32)
    draw.text((100, c3_y + 235), "⚡ O DIA MAIS CHUVOSO DE OUTUBRO", font=f_d_name, fill=(192, 132, 252))

    # Sub values
    draw_rounded_rect(draw, (100, c3_y + 285, 500, c3_y + 365), fill=(30, 41, 59, 200), outline=(168, 85, 247, 120), radius=16)
    f_v1 = get_font(True, 36)
    draw.text((120, c3_y + 300), "48,0 mm", font=f_v1, fill=(255, 255, 255))
    f_v1_s = get_font(False, 22)
    draw.text((120, c3_y + 338), "Média na rede em 24h", font=f_v1_s, fill=(148, 163, 184))

    draw_rounded_rect(draw, (530, c3_y + 285, WIDTH - 100, c3_y + 365), fill=(30, 41, 59, 200), outline=(249, 115, 22, 120), radius=16)
    draw.text((550, c3_y + 300), "84,3 mm", font=f_v1, fill=(249, 115, 22))
    draw.text((550, c3_y + 338), "Máxima pontual em 24h", font=f_v1_s, fill=(148, 163, 184))

    # Bottom summary tag
    draw.text((WIDTH // 2, 1550), "Passagem de frente fria combinada com cavado costeiro", font=get_font(False, 26), fill=(148, 163, 184), anchor="mm")

# SCENE 3: RANKING DE CHUVA POR ESTAÇÃO
def render_scene_3(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 48)
    draw.text((WIDTH // 2, 170), "ACUMULADOS POR ESTAÇÃO", font=f_s_title, fill=(255, 255, 255), anchor="mm")
    f_s_sub = get_font(False, 26)
    draw.text((WIDTH // 2, 225), "Ranking total de chuva registrada em Outubro / 2026", font=f_s_sub, fill=(148, 163, 184), anchor="mm")

    # Stations Data from the official screenshot
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
        # Staggered animation entrance
        st_frame = max(0, rel_frame - idx * 8)
        progress = min(1.0, st_frame / 35.0)
        eased = 1.0 - math.pow(1.0 - progress, 3)

        row_y = start_y + idx * row_height
        box_w = WIDTH - 120
        box_h = 160
        box_x = 60

        is_top = (idx == 0)
        border_col = (249, 115, 22, 220) if is_top else (56, 189, 248, 120)
        bg_col = (28, 38, 65, 230) if is_top else (18, 28, 50, 220)
        draw_rounded_rect(draw, (box_x, row_y, box_x + box_w, row_y + box_h), fill=bg_col, outline=border_col, radius=22, width=2 if not is_top else 3)

        # Station Name & Badge
        f_name = get_font(True, 32 if not is_top else 34)
        name_col = (255, 255, 255)
        draw.text((box_x + 30, row_y + 24), st["name"], font=f_name, fill=name_col)

        # Badge pill
        f_badge = get_font(True, 18)
        badge_w = 170 if is_top else 110
        badge_x = box_x + box_w - badge_w - 25
        badge_bg = (249, 115, 22, 50) if is_top else (2, 132, 199, 40)
        badge_border = (249, 115, 22, 220) if is_top else (56, 189, 248, 180)
        badge_txt_col = (255, 186, 115) if is_top else (56, 189, 248)
        draw_rounded_rect(draw, (badge_x, row_y + 22, badge_x + badge_w, row_y + 56), fill=badge_bg, outline=badge_border, radius=12, width=1)
        draw.text((badge_x + badge_w // 2, row_y + 39), st["badge"], font=f_badge, fill=badge_txt_col, anchor="mm")

        # Animated progress bar
        bar_x = box_x + 30
        bar_y = row_y + 85
        bar_max_w = box_w - 240
        bar_h = 44
        pill_r = bar_h // 2
        
        # Background bar
        draw_rounded_rect(draw, (bar_x, bar_y, bar_x + bar_max_w, bar_y + bar_h), fill=(30, 41, 59, 240), radius=pill_r)

        # Filled bar
        ratio = (st["val"] / max_val) * eased
        fill_w = max(int(bar_max_w * ratio), pill_r * 2 if eased > 0.05 else 0)
        if fill_w > 0:
            fill_col = (249, 115, 22, 255) if is_top else (0, 229, 255, 255)
            draw_rounded_rect(draw, (bar_x, bar_y, bar_x + fill_w, bar_y + bar_h), fill=fill_col, radius=pill_r)

        # Number display
        val_display = round(st["val"] * eased, 1)
        f_val = get_font(True, 38)
        draw.text((bar_x + bar_max_w + 25, bar_y + bar_h // 2), f"{val_display:.1f} mm", font=f_val, fill=(255, 255, 255), anchor="lm")

    # Special Hydrological Station: INEA Jundiá (at the very bottom)
    j_y = start_y + 5 * row_height + 15
    draw_rounded_rect(draw, (60, j_y, WIDTH - 60, j_y + 140), fill=(16, 40, 50, 230), outline=(16, 185, 129, 180), radius=22, width=2)
    f_j_title = get_font(True, 30)
    draw.text((90, j_y + 30), "🌊 Rio Jundiá (INEA Telemétrica 2241036)", font=f_j_title, fill=(52, 211, 153))
    f_j_desc = get_font(False, 24)
    draw.text((90, j_y + 75), "Vigilância hidrológica permanente da bacia • Cota sob controle", font=f_j_desc, fill=(203, 213, 225))

# SCENE 4: VENTOS, RAJADAS E TEMPERATURAS
def render_scene_4(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 48)
    draw.text((WIDTH // 2, 170), "VENTOS & TEMPERATURAS", font=f_s_title, fill=(255, 255, 255), anchor="mm")
    f_s_sub = get_font(False, 26)
    draw.text((WIDTH // 2, 225), "Extremos de rajadas de vento e variação térmica em Outubro", font=f_s_sub, fill=(148, 163, 184), anchor="mm")

    progress = min(1.0, rel_frame / 40.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    # CARD 1: MAIOR RAJADA DO MÊS (62,3 km/h)
    c1_y = 290
    draw_rounded_rect(draw, (60, c1_y, WIDTH - 60, c1_y + 380), fill=(18, 30, 56, 230), outline=(249, 115, 22, 220), radius=28, width=3)
    
    draw_rounded_rect(draw, (95, c1_y + 35, 95 + 300, c1_y + 80), fill=(249, 115, 22, 45), outline=(249, 115, 22, 220), radius=16, width=2)
    draw.text((95 + 150, c1_y + 57), "RECORDE DE VENTO", font=get_font(True, 22), fill=(249, 115, 22), anchor="mm")

    rajada_anim = round(62.3 * eased, 1)
    f_big = get_font(True, 110)
    draw.text((100, c1_y + 200), f"{rajada_anim}", font=f_big, fill=(255, 255, 255))
    draw.text((490, c1_y + 215), "km/h", font=get_font(True, 55), fill=(249, 115, 22))

    draw.text((680, c1_y + 175), "MAIOR RAJADA", font=get_font(True, 34), fill=(255, 255, 255))
    draw.text((680, c1_y + 225), "Registrada no mês", font=get_font(False, 26), fill=(203, 213, 225))

    draw.text((100, c1_y + 300), "📍 Praia da Tartaruga (Defesa Civil)", font=get_font(True, 28), fill=(255, 255, 255))
    draw.text((100, c1_y + 338), "Ocorrência: 26/10/2026 às 10:00 da manhã", font=get_font(False, 24), fill=(255, 186, 115))

    # CARD 2: VENTO MÉDIO & VELOCIDADE MÁXIMA SUSTENTADA
    c2_y = 710
    draw_rounded_rect(draw, (60, c2_y, WIDTH - 60, c2_y + 350), fill=(18, 30, 56, 230), outline=(56, 189, 248, 180), radius=28, width=2)
    
    draw.text((100, c2_y + 50), "DINÂMICA DOS VENTOS", font=get_font(True, 32), fill=(56, 189, 248))

    # 2 columns inside card 2
    # Left: Vento Médio
    draw_rounded_rect(draw, (100, c2_y + 110, 500, c2_y + 290), fill=(30, 41, 59, 200), outline=(56, 189, 248, 120), radius=20)
    draw.text((130, c2_y + 140), "Vento Médio Mensal", font=get_font(False, 24), fill=(148, 163, 184))
    draw.text((130, c2_y + 200), "16,6 km/h", font=get_font(True, 44), fill=(255, 255, 255))
    draw.text((130, c2_y + 250), "🧭 Predominante: NE (Nordeste)", font=get_font(True, 20), fill=(56, 189, 248))

    # Right: Vento Máximo Sustentado
    draw_rounded_rect(draw, (540, c2_y + 110, WIDTH - 100, c2_y + 290), fill=(30, 41, 59, 200), outline=(249, 115, 22, 120), radius=20)
    draw.text((570, c2_y + 140), "Velocidade Sustentada Máx.", font=get_font(False, 24), fill=(148, 163, 184))
    draw.text((570, c2_y + 200), "51,1 km/h", font=get_font(True, 44), fill=(249, 115, 22))
    draw.text((570, c2_y + 250), "Data: 25/10/2026", font=get_font(True, 20), fill=(255, 186, 115))

    # CARD 3: EXTREMOS TÉRMICOS (18,4°C a 32,6°C)
    c3_y = 1100
    draw_rounded_rect(draw, (60, c3_y, WIDTH - 60, c3_y + 360), fill=(18, 30, 56, 230), outline=(16, 185, 129, 180), radius=28, width=2)
    
    draw.text((100, c3_y + 50), "EXTREMOS TÉRMICOS REGISTRADOS", font=get_font(True, 32), fill=(52, 211, 153))

    # Minima
    draw_rounded_rect(draw, (100, c3_y + 110, 500, c3_y + 300), fill=(30, 41, 59, 200), outline=(56, 189, 248, 160), radius=20)
    draw.text((130, c3_y + 140), "❄️ Menor Temperatura", font=get_font(False, 24), fill=(148, 163, 184))
    draw.text((130, c3_y + 205), "18,4 °C", font=get_font(True, 52), fill=(56, 189, 248))
    draw.text((130, c3_y + 260), "Madrugadas frescas sob frente fria", font=get_font(False, 20), fill=(203, 213, 225))

    # Maxima
    draw_rounded_rect(draw, (540, c3_y + 110, WIDTH - 100, c3_y + 300), fill=(30, 41, 59, 200), outline=(239, 68, 68, 160), radius=20)
    draw.text((570, c3_y + 140), "☀️ Maior Temperatura", font=get_font(False, 24), fill=(148, 163, 184))
    draw.text((570, c3_y + 205), "32,6 °C", font=get_font(True, 52), fill=(239, 68, 68))
    draw.text((570, c3_y + 260), "Tardes quentes sob atuação da ASAS", font=get_font(False, 20), fill=(203, 213, 225))

# SCENE 5: SISTEMAS METEOROLÓGICOS ATUANTES
def render_scene_5(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 48)
    draw.text((WIDTH // 2, 170), "SISTEMAS METEOROLÓGICOS", font=f_s_title, fill=(255, 255, 255), anchor="mm")
    f_s_sub = get_font(False, 26)
    draw.text((WIDTH // 2, 225), "Distribuição dos padrões atmosféricos que comandaram Outubro/2026", font=f_s_sub, fill=(148, 163, 184), anchor="mm")

    systems = [
        {"title": "Alta Subtropical do Atlântico Sul (ASAS)", "days": 12, "desc": "Tempo estável, sol, calor e vento nordeste costeiro", "icon": "☀️", "color": (249, 115, 22)},
        {"title": "Cavado Costeiro / Instabilidade Local", "days": 8, "desc": "Pancadas de chuva convectiva e trovoadas de primavera", "icon": "⚡", "color": (56, 189, 248)},
        {"title": "Passagem de Frente Fria / Sistema Frontal", "days": 4, "desc": "Quedas de temperatura, viradas de vento e chuva volumosa", "icon": "🌧️", "color": (168, 85, 247)},
        {"title": "Cavado Costeiro / Convergência de Umidade", "days": 4, "desc": "Canal de umidade mantendo precipitação contínua", "icon": "🌊", "color": (0, 229, 255)},
        {"title": "Circulação Marítima Pós-Frontal (SE/S)", "days": 3, "desc": "Ventos oceânicos, muitas nuvens e chuviscos costeiros", "icon": "💨", "color": (148, 163, 184)}
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

        draw_rounded_rect(draw, (box_x, y, box_x + box_w, y + box_h), fill=(18, 30, 56, 230), outline=(sys["color"][0], sys["color"][1], sys["color"][2], 180), radius=24, width=2)

        # Icon circle
        draw_rounded_rect(draw, (box_x + 25, y + 25, box_x + 105, y + 105), fill=(sys["color"][0], sys["color"][1], sys["color"][2], 40), radius=18)
        draw.text((box_x + 65, y + 65), sys["icon"], font=get_font(False, 44), anchor="mm")

        # Title
        draw.text((box_x + 130, y + 35), sys["title"], font=get_font(True, 30), fill=(255, 255, 255))
        # Description
        draw.text((box_x + 130, y + 80), sys["desc"], font=get_font(False, 22), fill=(203, 213, 225))

        # Days count bar
        bar_x = box_x + 130
        bar_y = y + 130
        bar_max_w = box_w - 280
        draw_rounded_rect(draw, (bar_x, bar_y, bar_x + bar_max_w, bar_y + 24), fill=(30, 41, 59, 255), radius=12)
        
        ratio = (sys["days"] / 12.0) * eased
        fill_w = max(int(bar_max_w * ratio), 16 if eased > 0.05 else 0)
        if fill_w > 0:
            draw_rounded_rect(draw, (bar_x, bar_y, bar_x + fill_w, bar_y + 24), fill=sys["color"], radius=12)

        # Number pill on right
        dias_anim = int(sys["days"] * eased)
        draw.text((box_x + box_w - 40, bar_y + 12), f"{dias_anim} DIAS", font=get_font(True, 28), fill=sys["color"], anchor="rm")

# SCENE 6: ENCERRAMENTO OFICIAL COM IDENTIDADE VISUAL
def render_scene_6(draw, frame_img, rel_frame):
    # Full Card from User Image
    if full_card:
        # Scale card to fit centrally and gracefully
        target_w = 980
        target_h = int(full_card.height * (target_w / full_card.width))
        c_resized = full_card.resize((target_w, target_h), Image.Resampling.LANCZOS)
        cx = (WIDTH - target_w) // 2
        cy = 500
        
        # Shadow / Glow box behind
        draw_rounded_rect(draw, (cx - 10, cy - 10, cx + target_w + 10, cy + target_h + 10), fill=(249, 115, 22, 60), radius=28)
        frame_img.paste(c_resized, (cx, cy), c_resized)
    
    # Top Headline
    f_t1 = get_font(True, 56)
    draw.text((WIDTH // 2, 280), "ACOMPANHE O CLIMA DIARIAMENTE!", font=f_t1, fill=(255, 255, 255), anchor="mm")

    f_t2 = get_font(False, 32)
    draw.text((WIDTH // 2, 360), "Alertas, chuvas em tempo real e boletins oficiais", font=f_t2, fill=(56, 189, 248), anchor="mm")

    # Bottom Actions Box
    box_y = 1140
    draw_rounded_rect(draw, (80, box_y, WIDTH - 80, box_y + 440), fill=(18, 30, 56, 240), outline=(249, 115, 22, 200), radius=32, width=3)

    f_social_t = get_font(True, 40)
    draw.text((WIDTH // 2, box_y + 60), "SIGA NOSSAS REDES OFICIAIS:", font=f_social_t, fill=(255, 255, 255), anchor="mm")

    f_handle = get_font(True, 44)
    # Instagram
    draw.text((WIDTH // 2, box_y + 150), "📷 Instagram: @tempoemriodasostras", font=f_handle, fill=(249, 115, 22), anchor="mm")
    # TikTok
    draw.text((WIDTH // 2, box_y + 230), "🎵 TikTok: @tempoemriodasostras", font=f_handle, fill=(0, 229, 255), anchor="mm")
    # X
    draw.text((WIDTH // 2, box_y + 305), "✖️ X (Twitter): @tempoemro", font=f_handle, fill=(241, 245, 249), anchor="mm")

    # Web Link
    draw.line([(120, box_y + 360), (WIDTH - 120, box_y + 360)], fill=(56, 189, 248, 80), width=2)
    f_web = get_font(True, 30)
    draw.text((WIDTH // 2, box_y + 400), "🌐 Acesse: clima-rio-das-ostras.vercel.app", font=f_web, fill=(56, 189, 248), anchor="mm")

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
