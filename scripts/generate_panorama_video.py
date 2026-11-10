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
TOTAL_SECONDS = 80
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

def draw_header_bar(draw, frame_idx, current_scene_idx):
    top_y = 35
    # Brand handle
    draw.text((50, top_y + 10), "@tempoemriodasostras", font=get_font(True, 26), fill=COLOR_WHITE)
    
    # Month badge
    badge_w = 230
    badge_h = 42
    badge_x = WIDTH - 50 - badge_w
    badge_y = top_y + 4
    draw_rounded_rect(draw, (badge_x, badge_y, badge_x + badge_w, badge_y + badge_h), 
                      fill=(38, 28, 24), outline=COLOR_ORANGE, radius=12, width=2)
    draw.text((badge_x + badge_w // 2, badge_y + badge_h // 2), "OUTUBRO / 2026", font=get_font(True, 20), fill=COLOR_ORANGE, anchor="mm")
    
    # Divider line
    draw.line([(50, top_y + 58), (WIDTH - 50, top_y + 58)], fill=COLOR_BLUE, width=1)

    # STORIES STEP INDICATOR (6 Steps)
    step_y = top_y + 68
    total_steps = 6
    margin = 50
    avail_w = WIDTH - 2 * margin
    step_gap = 12
    step_w = (avail_w - (total_steps - 1) * step_gap) / total_steps
    step_h = 6

    step_labels = ["Panorama", "Chuva", "Ranking", "Ventos", "Sistemas", "Resumo"]

    for s_i in range(total_steps):
        sx0 = margin + s_i * (step_w + step_gap)
        sx1 = sx0 + step_w
        if s_i < current_scene_idx:
            # Completed step
            draw_rounded_rect(draw, (sx0, step_y, sx1, step_y + step_h), fill=COLOR_BLUE, radius=3)
        elif s_i == current_scene_idx:
            # Current active step (Orange)
            draw_rounded_rect(draw, (sx0, step_y, sx1, step_y + step_h), fill=COLOR_ORANGE, radius=3)
        else:
            # Future step
            draw_rounded_rect(draw, (sx0, step_y, sx1, step_y + step_h), fill=(40, 50, 75), radius=3)

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

    # SCENE TIMELINE (TOTAL 80 SECONDS = 2400 FRAMES)
    # S1: 0 - 360 (0.0s - 12.0s) -> Abertura & Visão Geral
    # S2: 360 - 780 (12.0s - 26.0s) -> Volume & Frequência de Chuva
    # S3: 780 - 1260 (26.0s - 42.0s) -> Ranking dos Acumulados por Estação
    # S4: 1260 - 1680 (42.0s - 56.0s) -> Ventos & Variação Térmica
    # S5: 1680 - 2040 (56.0s - 68.0s) -> Sistemas Meteorológicos Atuantes
    # S6: 2040 - 2400 (68.0s - 80.0s) -> Resumo & Acompanhamento Diário

    if frame_idx < 360:
        current_scene = 0
        draw_header_bar(draw, frame_idx, current_scene)
        render_scene_1(draw, frame_img, frame_idx)
    elif frame_idx < 780:
        current_scene = 1
        draw_header_bar(draw, frame_idx, current_scene)
        render_scene_2(draw, frame_img, frame_idx - 360)
    elif frame_idx < 1260:
        current_scene = 2
        draw_header_bar(draw, frame_idx, current_scene)
        render_scene_3(draw, frame_img, frame_idx - 780)
    elif frame_idx < 1680:
        current_scene = 3
        draw_header_bar(draw, frame_idx, current_scene)
        render_scene_4(draw, frame_img, frame_idx - 1260)
    elif frame_idx < 2040:
        current_scene = 4
        draw_header_bar(draw, frame_idx, current_scene)
        render_scene_5(draw, frame_img, frame_idx - 1680)
    else:
        current_scene = 5
        draw_header_bar(draw, frame_idx, current_scene)
        render_scene_6(draw, frame_img, frame_idx - 2040)

    # Bottom watermark footer (STRICTLY REQUIRED: No website URL)
    f_foot = get_font(False, 24)
    draw.text((WIDTH // 2, HEIGHT - 45), "Fontes: Estações Meteorológicas do Município", font=f_foot, fill=COLOR_MUTED, anchor="mm")

    return cv2.cvtColor(np.array(frame_img), cv2.COLOR_RGBA2BGR)

# SCENE 1: ABERTURA & VISÃO GERAL AUTOSSUFICIENTE (12s)
def render_scene_1(draw, frame_img, rel_frame):
    progress = min(1.0, rel_frame / 35.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    # 1. Logo institucional
    if user_logo:
        logo_w = 480
        logo_h = int(user_logo.height * (logo_w / user_logo.width))
        resized_logo = user_logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        logo_x = (WIDTH - logo_w) // 2
        logo_y = 150
        frame_img.paste(resized_logo, (logo_x, logo_y), resized_logo)
    else:
        f_logo = get_font(True, 56)
        draw.text((WIDTH // 2, 220), "TEMPO EM RIO DAS OSTRAS", font=f_logo, fill=COLOR_WHITE, anchor="mm")

    # 2. Main Box
    box_w = 980
    box_h = 560
    box_x = (WIDTH - box_w) // 2
    box_y = 520

    pulse = math.sin(rel_frame * 0.06) * 3
    draw_rounded_rect(draw, (box_x - pulse, box_y - pulse, box_x + box_w + pulse, box_y + box_h + pulse), 
                      fill=COLOR_NAVY, outline=COLOR_BLUE, radius=32, width=3)

    tag_w = 460
    tag_h = 46
    tag_x = (WIDTH - tag_w) // 2
    tag_y = box_y + 35
    draw_rounded_rect(draw, (tag_x, tag_y, tag_x + tag_w, tag_y + tag_h), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=23, width=2)
    draw.text((WIDTH // 2, tag_y + tag_h // 2), "RETROSPECTIVA METEOROLÓGICA", font=get_font(True, 22), fill=COLOR_BLUE, anchor="mm")

    draw.text((WIDTH // 2, box_y + 145), "PANORAMA DO CLIMA", font=get_font(True, 58), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, box_y + 245), "OUTUBRO 2026", font=get_font(True, 90), fill=COLOR_ORANGE, anchor="mm")

    draw.line([(WIDTH // 2 - 220, box_y + 325), (WIDTH // 2 + 220, box_y + 325)], fill=COLOR_ORANGE, width=4)

    draw.text((WIDTH // 2, box_y + 390), "RIO DAS OSTRAS • RJ", font=get_font(True, 32), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, box_y + 460), "Balanço Consolidado de Todas as Estações Oficiais", font=get_font(False, 26), fill=COLOR_MUTED, anchor="mm")

    # 3. Explanatory Highlight Box (Self-Explanatory for Silent Viewing)
    call_y = 1130
    draw_rounded_rect(draw, (50, call_y, WIDTH - 50, call_y + 570), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=28, width=3)
    
    # Badge inside box
    draw_rounded_rect(draw, (85, call_y + 25, 460, call_y + 72), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((85 + 187, call_y + 48), "DESTAQUES DO MÊS", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")

    points = [
        ("Volume Histórico:", "Chuva média municipal 168% acima do normal histórico."),
        ("Alta Frequência:", "Choveu em 25 dos 31 dias monitorados (80% do mês)."),
        ("Recorde do Ano:", "Estação Rocha Leão acumulou expressivos 410,0 mm."),
        ("Rajadas Severas:", "Pico de vento atingiu 62,3 km/h na Praia da Tartaruga."),
        ("Transição Térmica:", "Madrugadas frescas de 18,4°C e tardes quentes de 32,6°C.")
    ]

    for p_i, (bold_title, desc) in enumerate(points):
        row_y = call_y + 95 + p_i * 85
        draw_rounded_rect(draw, (75, row_y, WIDTH - 75, row_y + 72), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=1)
        draw.text((95, row_y + 36), bold_title, font=get_font(True, 23), fill=COLOR_ORANGE, anchor="lm")
        draw.text((370, row_y + 36), desc, font=get_font(False, 20), fill=COLOR_WHITE, anchor="lm")

    # Bottom guidance prompt
    draw.text((WIDTH // 2, 1750), "Deslize para ver os detalhes, gráficos e recordes", font=get_font(True, 23), fill=COLOR_BLUE, anchor="mm")

# SCENE 2: VOLUME & FREQUÊNCIA DE CHUVA COM EXPLICAÇÕES DETALHADAS (14s)
def render_scene_2(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 44)
    draw.text((WIDTH // 2, 145), "VOLUME & FREQUÊNCIA DE CHUVA", font=f_s_title, fill=COLOR_WHITE, anchor="mm")
    f_s_sub = get_font(False, 24)
    draw.text((WIDTH // 2, 195), "Entenda por que Outubro de 2026 foi tão atípico no município", font=f_s_sub, fill=COLOR_MUTED, anchor="mm")

    progress = min(1.0, rel_frame / 45.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    # CARD 1: 25 DIAS COM CHUVA (com explicação pedagógica)
    c1_y = 240
    draw_rounded_rect(draw, (50, c1_y, WIDTH - 50, c1_y + 440), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=3)
    
    draw_rounded_rect(draw, (85, c1_y + 22, 380, c1_y + 68), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=2)
    draw.text((85 + 147, c1_y + 45), "FREQUÊNCIA RECORDE", font=get_font(True, 22), fill=COLOR_BLUE, anchor="mm")
    
    dias_anim = int(25 * eased)
    draw.text((85, c1_y + 85), f"{dias_anim}", font=get_font(True, 96), fill=COLOR_WHITE)
    draw.text((245, c1_y + 110), "DIAS COM CHUVA", font=get_font(True, 36), fill=COLOR_BLUE)
    draw.text((245, c1_y + 155), "em 31 dias monitorados (80% do mês)", font=get_font(False, 22), fill=COLOR_MUTED)

    bar_y = c1_y + 220
    draw_rounded_rect(draw, (85, bar_y, WIDTH - 85, bar_y + 26), fill=COLOR_TRACK, radius=13)
    bar_fill = int((WIDTH - 170) * (25 / 31) * eased)
    if bar_fill > 20:
        draw_rounded_rect(draw, (85, bar_y, 85 + bar_fill, bar_y + 26), fill=COLOR_BLUE, radius=13)

    # Box explicativo didático
    exp1_y = c1_y + 270
    draw_rounded_rect(draw, (85, exp1_y, WIDTH - 85, exp1_y + 140), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=18, width=1)
    draw.text((115, exp1_y + 35), "O QUE ISSO SIGNIFICA:", font=get_font(True, 22), fill=COLOR_ORANGE)
    draw.text((115, exp1_y + 75), "Choveu em 8 de cada 10 dias. Essa persistência manteve o solo", font=get_font(False, 22), fill=COLOR_WHITE)
    draw.text((115, exp1_y + 105), "encharcado e exigiu atenção redobrada das equipes da Defesa Civil.", font=get_font(False, 22), fill=COLOR_MUTED)

    # CARD 2: CHUVA MÉDIA NA REDE
    c2_y = 710
    draw_rounded_rect(draw, (50, c2_y, WIDTH - 50, c2_y + 440), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=28, width=3)
    
    draw_rounded_rect(draw, (85, c2_y + 22, 380, c2_y + 68), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((85 + 147, c2_y + 45), "MÉDIA MUNICIPAL", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")

    val_anim = round(243.3 * eased, 1)
    str_val = f"{val_anim:.1f}".replace('.', ',')
    draw.text((85, c2_y + 85), str_val, font=get_font(True, 96), fill=COLOR_WHITE)
    draw.text((365, c2_y + 125), "mm", font=get_font(True, 48), fill=COLOR_ORANGE)

    draw.text((490, c2_y + 105), "MÉDIA NA REDE", font=get_font(True, 32), fill=COLOR_WHITE)
    draw.text((490, c2_y + 150), "Volume 168% acima da normal histórica", font=get_font(True, 22), fill=COLOR_ORANGE)

    peak_y = c2_y + 220
    draw_rounded_rect(draw, (85, peak_y, WIDTH - 85, peak_y + 55), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((WIDTH // 2, peak_y + 27), "PICO MÁXIMO ISOLADO: 410,0 mm (Estação Rocha Leão)", font=get_font(True, 24), fill=COLOR_ORANGE, anchor="mm")

    exp2_y = c2_y + 295
    draw_rounded_rect(draw, (85, exp2_y, WIDTH - 85, exp2_y + 120), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=18, width=1)
    draw.text((115, exp2_y + 35), "COMPARAÇÃO HISTÓRICA:", font=get_font(True, 22), fill=COLOR_BLUE)
    draw.text((115, exp2_y + 75), "O volume médio de Outubro superou em quase 3x a média dos últimos", font=get_font(False, 22), fill=COLOR_WHITE)
    draw.text((115, exp2_y + 105), "anos, consolidando o mês como um dos mais úmidos da década.", font=get_font(False, 22), fill=COLOR_MUTED)

    # CARD 3: O DIA MAIS CRÍTICO (02/10/2026)
    c3_y = 1180
    draw_rounded_rect(draw, (50, c3_y, WIDTH - 50, c3_y + 490), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=3)

    draw_rounded_rect(draw, (85, c3_y + 22, 380, c3_y + 68), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=2)
    draw.text((85 + 147, c3_y + 45), "EVENTO MAIS SEVERO", font=get_font(True, 22), fill=COLOR_BLUE, anchor="mm")

    draw.text((85, c3_y + 85), "02 / 10 / 2026", font=get_font(True, 64), fill=COLOR_WHITE)
    draw.text((85, c3_y + 165), "O DIA MAIS CHUVOSO DO MÊS EM RIO DAS OSTRAS", font=get_font(True, 28), fill=COLOR_BLUE)

    box1_w = 430
    draw_rounded_rect(draw, (85, c3_y + 215, 85 + box1_w, c3_y + 330), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=2)
    draw.text((110, c3_y + 235), "MÉDIA NA CIDADE EM 24H", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((110, c3_y + 270), "48,0 mm", font=get_font(True, 46), fill=COLOR_WHITE)

    draw_rounded_rect(draw, (WIDTH - 85 - box1_w, c3_y + 215, WIDTH - 85, c3_y + 330), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=16, width=2)
    draw.text((WIDTH - 85 - box1_w + 25, c3_y + 235), "MÁXIMO PONTUAL EM 24H", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((WIDTH - 85 - box1_w + 25, c3_y + 270), "84,3 mm", font=get_font(True, 46), fill=COLOR_ORANGE)

    exp3_y = c3_y + 355
    draw_rounded_rect(draw, (85, exp3_y, WIDTH - 85, exp3_y + 110), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
    draw.text((110, exp3_y + 35), "CAUSA DO EVENTO:", font=get_font(True, 22), fill=COLOR_ORANGE)
    draw.text((110, exp3_y + 70), "Avanço de frente fria costeira combinada com cavado de baixa pressão.", font=get_font(False, 22), fill=COLOR_WHITE)

# SCENE 3: RANKING PLUVIOMÉTRICO POR ESTAÇÃO (STRICTLY RAIN STATIONS, NO RIO JUNDIÁ) (16s)
def render_scene_3(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 46)
    draw.text((WIDTH // 2, 145), "ONDE CHOVEU MAIS?", font=f_s_title, fill=COLOR_WHITE, anchor="mm")
    f_s_sub = get_font(False, 24)
    draw.text((WIDTH // 2, 195), "Ranking total de chuva acumulada em Outubro de 2026", font=f_s_sub, fill=COLOR_MUTED, anchor="mm")

    stations = [
        {
            "name": "Rocha Leão (REBIO União)", 
            "val": 410.0, 
            "rank": "1º LUGAR • RECORDE", 
            "color": COLOR_ORANGE,
            "desc": "Relevo serrano e reserva biológica reteram nuvens orográficas pesadas."
        },
        {
            "name": "Cantagalo (LERIP)", 
            "val": 191.7, 
            "rank": "2º LUGAR • RURAL", 
            "color": COLOR_BLUE,
            "desc": "Zona rural com forte atuação de pancadas convectivas de primavera."
        },
        {
            "name": "Praiamar / Divisa Sul", 
            "val": 177.3, 
            "rank": "3º LUGAR • LITORAL SUL", 
            "color": COLOR_BLUE,
            "desc": "Corredor costeiro com entrada direta de ventos oceânicos úmidos."
        },
        {
            "name": "Praia da Tartaruga (Defesa Civil)", 
            "val": 167.9, 
            "rank": "4º LUGAR • COSTA", 
            "color": COLOR_BLUE,
            "desc": "Estação costeira oficial monitorada pelo Centro de Defesa Civil."
        },
        {
            "name": "Costazul (Escola Jacinto)", 
            "val": 131.3, 
            "rank": "5º LUGAR • ORLA LESTE", 
            "color": COLOR_BLUE,
            "desc": "Menor acumulado da rede, mas ainda assim 45% acima da normal."
        },
    ]

    start_y = 245
    row_h = 225
    max_val = 410.0

    for idx, st in enumerate(stations):
        st_frame = max(0, rel_frame - idx * 8)
        progress = min(1.0, st_frame / 35.0)
        eased = 1.0 - math.pow(1.0 - progress, 3)

        y = start_y + idx * row_h
        draw_rounded_rect(draw, (50, y, WIDTH - 50, y + 205), fill=COLOR_NAVY, outline=st["color"], radius=24, width=3 if idx == 0 else 2)

        # Name & Rank
        draw.text((80, y + 24), st["name"], font=get_font(True, 30), fill=COLOR_WHITE)

        rw = 240 if "RECORDE" in st["rank"] else 190
        draw_rounded_rect(draw, (WIDTH - 80 - rw, y + 20, WIDTH - 80, y + 58), fill=COLOR_SUB_BG, outline=st["color"], radius=14, width=1)
        draw.text((WIDTH - 80 - rw // 2, y + 39), st["rank"], font=get_font(True, 18), fill=st["color"], anchor="mm")

        # Progress bar
        bar_y = y + 78
        bar_max_w = WIDTH - 470
        draw_rounded_rect(draw, (80, bar_y, 80 + bar_max_w, bar_y + 24), fill=COLOR_TRACK, radius=12)
        
        fill_w = max(int(bar_max_w * (st["val"] / max_val) * eased), 14 if eased > 0.05 else 0)
        if fill_w > 0:
            draw_rounded_rect(draw, (80, bar_y, 80 + fill_w, bar_y + 24), fill=st["color"], radius=12)

        cur_val = round(st["val"] * eased, 1)
        str_val = f"{cur_val:.1f}".replace('.', ',') + " mm"
        draw.text((WIDTH - 80, bar_y + 12), str_val, font=get_font(True, 36), fill=COLOR_WHITE, anchor="rm")

        # Explanatory subtitle inside each row
        draw_rounded_rect(draw, (80, y + 122, WIDTH - 80, y + 185), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=12, width=1)
        draw.text((95, y + 153), f"• {st['desc']}", font=get_font(False, 21), fill=COLOR_MUTED, anchor="lm")

    # Bottom Pedagogical Takeaway
    call_y = start_y + len(stations) * row_h + 20
    draw_rounded_rect(draw, (50, call_y, WIDTH - 50, call_y + 160), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=2)
    draw.text((WIDTH // 2, call_y + 40), "CURIOSIDADE CLIMÁTICA DE RIO DAS OSTRAS", font=get_font(True, 26), fill=COLOR_ORANGE, anchor="mm")
    draw.text((WIDTH // 2, call_y + 85), "Choveu mais do que o triplo em Rocha Leão (410 mm) em relação à orla de Costazul (131 mm),", font=get_font(False, 22), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, call_y + 120), "comprovando a enorme influência do relevo na retenção das nuvens no interior do município.", font=get_font(False, 22), fill=COLOR_MUTED, anchor="mm")

# SCENE 4: VENTOS, RAJADAS E TEMPERATURAS (14s)
def render_scene_4(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 44)
    draw.text((WIDTH // 2, 145), "VENTOS & TEMPERATURAS", font=f_s_title, fill=COLOR_WHITE, anchor="mm")
    f_s_sub = get_font(False, 24)
    draw.text((WIDTH // 2, 195), "Extremos de rajadas de vento e variações térmicas de Outubro", font=f_s_sub, fill=COLOR_MUTED, anchor="mm")

    progress = min(1.0, rel_frame / 40.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    # CARD 1: MAIOR RAJADA DO MÊS (62,3 km/h)
    c1_y = 240
    draw_rounded_rect(draw, (50, c1_y, WIDTH - 50, c1_y + 440), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=28, width=3)
    
    draw_rounded_rect(draw, (85, c1_y + 22, 380, c1_y + 68), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((85 + 147, c1_y + 45), "RECORDE DE VENTO", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")

    rajada_anim = round(62.3 * eased, 1)
    str_raj = f"{rajada_anim:.1f}".replace('.', ',')
    draw.text((85, c1_y + 85), str_raj, font=get_font(True, 96), fill=COLOR_WHITE)
    draw.text((315, c1_y + 125), "km/h", font=get_font(True, 46), fill=COLOR_ORANGE)

    draw.text((490, c1_y + 105), "MAIOR RAJADA DO MÊS", font=get_font(True, 30), fill=COLOR_WHITE)
    draw.text((490, c1_y + 150), "Pico registrado no município", font=get_font(False, 22), fill=COLOR_MUTED)

    sub_y = c1_y + 225
    draw_rounded_rect(draw, (85, sub_y, WIDTH - 85, sub_y + 60), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=16, width=2)
    draw.text((WIDTH // 2, sub_y + 30), "Praia da Tartaruga (Defesa Civil) • 26/10 às 10:00 da manhã", font=get_font(True, 24), fill=COLOR_WHITE, anchor="mm")

    exp_v_y = c1_y + 305
    draw_rounded_rect(draw, (85, exp_v_y, WIDTH - 85, exp_v_y + 110), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
    draw.text((110, exp_v_y + 35), "IMPACTO NO LITORAL:", font=get_font(True, 22), fill=COLOR_ORANGE)
    draw.text((110, exp_v_y + 70), "A rajada provocou agitação no mar, ondas de até 2,5m e alertas aos banhistas e navegantes.", font=get_font(False, 20), fill=COLOR_WHITE)

    # CARD 2: DINÂMICA DOS VENTOS (Médio e Máximo Sustentado)
    c2_y = 710
    draw_rounded_rect(draw, (50, c2_y, WIDTH - 50, c2_y + 390), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=2)
    draw.text((85, c2_y + 35), "DINÂMICA DOS VENTOS EM OUTUBRO", font=get_font(True, 30), fill=COLOR_BLUE)

    draw_rounded_rect(draw, (85, c2_y + 80, 520, c2_y + 260), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=2)
    draw.text((110, c2_y + 105), "VENTO MÉDIO MENSAL", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((110, c2_y + 145), "16,6 km/h", font=get_font(True, 46), fill=COLOR_WHITE)
    draw.text((110, c2_y + 215), "Predominante: NE (Nordeste)", font=get_font(True, 22), fill=COLOR_BLUE)

    draw_rounded_rect(draw, (545, c2_y + 80, WIDTH - 85, c2_y + 260), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=16, width=2)
    draw.text((570, c2_y + 105), "VELOCIDADE SUSTENTADA MÁX.", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((570, c2_y + 145), "51,1 km/h", font=get_font(True, 46), fill=COLOR_ORANGE)
    draw.text((570, c2_y + 215), "Ocorrência: 25/10/2026", font=get_font(True, 22), fill=COLOR_WHITE)

    draw.text((WIDTH // 2, c2_y + 325), "O vento nordeste soprou na maior parte dos dias ensolarados, refrescando a orla.", font=get_font(False, 22), fill=COLOR_MUTED, anchor="mm")

    # CARD 3: EXTREMOS TÉRMICOS (SEM SOBREPOSIÇÃO)
    c3_y = 1130
    draw_rounded_rect(draw, (50, c3_y, WIDTH - 50, c3_y + 540), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=2)
    draw.text((85, c3_y + 35), "EXTREMOS TÉRMICOS REGISTRADOS", font=get_font(True, 30), fill=COLOR_BLUE)

    draw_rounded_rect(draw, (85, c3_y + 80, 520, c3_y + 295), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=2)
    draw.text((110, c3_y + 105), "MENOR TEMPERATURA", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((110, c3_y + 150), "18,4 °C", font=get_font(True, 50), fill=COLOR_BLUE)
    draw.text((110, c3_y + 235), "Madrugadas frescas sob ar polar", font=get_font(False, 20), fill=COLOR_MUTED)

    draw_rounded_rect(draw, (545, c3_y + 80, WIDTH - 85, c3_y + 295), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=16, width=2)
    draw.text((570, c3_y + 105), "MAIOR TEMPERATURA", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((570, c3_y + 150), "32,6 °C", font=get_font(True, 50), fill=COLOR_ORANGE)
    draw.text((570, c3_y + 235), "Tardes quentes sob atuação da ASAS", font=get_font(False, 20), fill=COLOR_MUTED)

    exp_t_y = c3_y + 330
    draw_rounded_rect(draw, (85, exp_t_y, WIDTH - 85, exp_t_y + 170), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=18, width=1)
    draw.text((110, exp_t_y + 35), "ANÁLISE DA VARIAÇÃO TÉRMICA:", font=get_font(True, 22), fill=COLOR_BLUE)
    draw.text((110, exp_t_y + 75), "A amplitude térmica superou 14°C entre a menor e maior marca.", font=get_font(False, 22), fill=COLOR_WHITE)
    draw.text((110, exp_t_y + 110), "Essa oscilação é comum na primavera devido ao choque de massas de ar polar", font=get_font(False, 21), fill=COLOR_MUTED)
    draw.text((110, exp_t_y + 140), "com a massa de ar quente e úmida tropical sobre o litoral fluminense.", font=get_font(False, 21), fill=COLOR_MUTED)

# SCENE 5: SISTEMAS METEOROLÓGICOS (12s)
def render_scene_5(draw, frame_img, rel_frame):
    f_s_title = get_font(True, 44)
    draw.text((WIDTH // 2, 145), "O QUE COMANDOU O CLIMA?", font=f_s_title, fill=COLOR_WHITE, anchor="mm")
    f_s_sub = get_font(False, 24)
    draw.text((WIDTH // 2, 195), "Distribuição dos sistemas atmosféricos que atuaram em Outubro/2026", font=f_s_sub, fill=COLOR_MUTED, anchor="mm")

    systems = [
        {"title": "Alta Subtropical do Atlântico Sul (ASAS)", "days": 12, "desc": "Tempo firme, sol forte, calor de primavera e vento nordeste costeiro.", "color": COLOR_ORANGE},
        {"title": "Cavado Costeiro / Instabilidade Local", "days": 8, "desc": "Pancadas convectivas de fim de tarde com trovoadas típicas da estação.", "color": COLOR_BLUE},
        {"title": "Passagem de Frente Fria / Sistema Frontal", "days": 4, "desc": "Quedas térmicas, viradas de vento para sul e as chuvas mais severas do mês.", "color": COLOR_ORANGE},
        {"title": "Cavado Costeiro / Convergência de Umidade", "days": 4, "desc": "Canal de umidade oceânica mantendo o céu encoberto e chuvas contínuas.", "color": COLOR_BLUE},
        {"title": "Circulação Marítima Pós-Frontal (SE/S)", "days": 3, "desc": "Ventos oceânicos frios, muitas nuvens baixas e chuviscos na faixa litorânea.", "color": COLOR_BLUE}
    ]

    start_y = 245
    row_h = 240

    for idx, sys in enumerate(systems):
        st_frame = max(0, rel_frame - idx * 6)
        progress = min(1.0, st_frame / 30.0)
        eased = 1.0 - math.pow(1.0 - progress, 3)

        y = start_y + idx * row_h
        box_w = WIDTH - 100
        box_h = 215
        box_x = 50

        draw_rounded_rect(draw, (box_x, y, box_x + box_w, y + box_h), fill=COLOR_NAVY, outline=sys["color"], radius=24, width=2)

        # Number badge
        draw_rounded_rect(draw, (box_x + 25, y + 25, box_x + 115, y + 115), fill=COLOR_SUB_BG, outline=sys["color"], radius=18, width=2)
        draw.text((box_x + 70, y + 70), f"{idx+1}º", font=get_font(True, 34), fill=sys["color"], anchor="mm")

        # Titles
        draw.text((box_x + 140, y + 35), sys["title"], font=get_font(True, 30), fill=COLOR_WHITE)
        draw.text((box_x + 140, y + 80), sys["desc"], font=get_font(False, 22), fill=COLOR_MUTED)

        # Progress bar
        bar_x = box_x + 140
        bar_y = y + 140
        bar_max_w = box_w - 300
        draw_rounded_rect(draw, (bar_x, bar_y, bar_x + bar_max_w, bar_y + 24), fill=COLOR_TRACK, radius=12)
        
        ratio = (sys["days"] / 12.0) * eased
        fill_w = max(int(bar_max_w * ratio), 16 if eased > 0.05 else 0)
        if fill_w > 0:
            draw_rounded_rect(draw, (bar_x, bar_y, bar_x + fill_w, bar_y + 24), fill=sys["color"], radius=12)

        dias_anim = int(sys["days"] * eased)
        draw.text((box_x + box_w - 40, bar_y + 12), f"{dias_anim} DIAS", font=get_font(True, 28), fill=sys["color"], anchor="rm")

    # Bottom summary box
    sum_y = start_y + len(systems) * row_h + 20
    draw_rounded_rect(draw, (50, sum_y, WIDTH - 50, sum_y + 140), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=22, width=2)
    draw.text((WIDTH // 2, sum_y + 40), "CONCLUSÃO METEOROLÓGICA", font=get_font(True, 26), fill=COLOR_ORANGE, anchor="mm")
    draw.text((WIDTH // 2, sum_y + 85), "O choque frequente entre a massa de ar quente continental e as frentes oceânicas", font=get_font(False, 22), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, sum_y + 115), "manteve a atmosfera instável e abriu oficialmente o período chuvoso na nossa região.", font=get_font(False, 22), fill=COLOR_MUTED, anchor="mm")

# SCENE 6: ENCERRAMENTO OFICIAL COM IDENTIDADE VISUAL E CHAMADA CLARA (12s)
def render_scene_6(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 170), "ACOMPANHE O CLIMA DIARIAMENTE!", font=get_font(True, 48), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, 230), "Previsões diárias, alertas oficiais e monitoramento em tempo real", font=get_font(False, 26), fill=COLOR_BLUE, anchor="mm")

    if full_card:
        target_w = 980
        target_h = int(full_card.height * (target_w / full_card.width))
        c_resized = full_card.resize((target_w, target_h), Image.Resampling.LANCZOS)
        cx = (WIDTH - target_w) // 2
        cy = 310
        
        draw_rounded_rect(draw, (cx - 10, cy - 10, cx + target_w + 10, cy + target_h + 10), fill=COLOR_ORANGE, radius=28)
        frame_img.paste(c_resized, (cx, cy), c_resized)
        
        box_y = cy + target_h + 40
    else:
        box_y = 800

    box_h = 560
    draw_rounded_rect(draw, (50, box_y, WIDTH - 50, box_y + box_h), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=2)

    draw.text((WIDTH // 2, box_y + 55), "MONITORAMENTO COMPLETO DA CIDADE", font=get_font(True, 32), fill=COLOR_WHITE, anchor="mm")

    items = [
        ("Previsões Diárias:", "Atualizações todas as manhãs com tendências e mapas."),
        ("Alertas Oficiais:", "Avisos de tempestades, ventos fortes e ressacas no mar."),
        ("Dados em Tempo Real:", "Acumulados de chuva atualizados de todas as estações municipais."),
        ("Condições do Mar:", "Tábua de marés, ventos e temperatura da água na orla.")
    ]
    for i, (b_title, desc) in enumerate(items):
        iy = box_y + 115 + i * 85
        draw_rounded_rect(draw, (75, iy, WIDTH - 75, iy + 72), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=1)
        draw.text((95, iy + 36), b_title, font=get_font(True, 24), fill=COLOR_ORANGE, anchor="lm")
        draw.text((380, iy + 36), desc, font=get_font(False, 20), fill=COLOR_WHITE, anchor="lm")

    draw.line([(100, box_y + 465), (WIDTH - 100, box_y + 465)], fill=COLOR_BLUE, width=2)
    draw.text((WIDTH // 2, box_y + 505), "Siga @tempoemriodasostras no Instagram e compartilhe!", font=get_font(True, 26), fill=COLOR_ORANGE, anchor="mm")

def main():
    out_dir = "C:/Users/debor/.gemini/antigravity/scratch/clima-rio-das-ostras/public/videos"
    os.makedirs(out_dir, exist_ok=True)
    temp_raw = os.path.join(out_dir, "temp_reels_silent_raw.mp4")
    out_path = os.path.join(out_dir, "panorama_outubro_2026_reels.mp4")

    print(f"Generating self-explanatory visual reels: {temp_raw}")
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
    print("Video stream rendered. Encoding silent Reels video with H.264 (-an)...")

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg, "-y",
        "-i", temp_raw,
        "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
        "-an",
        out_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print("DONE! Master Silent Reels video created:", out_path)
        print("File size:", os.path.getsize(out_path), "bytes")
        if os.path.exists(temp_raw):
            os.remove(temp_raw)
    else:
        print("FFmpeg error:", res.stderr)

if __name__ == "__main__":
    main()
