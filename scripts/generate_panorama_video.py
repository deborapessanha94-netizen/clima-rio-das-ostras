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
TOTAL_SECONDS = 47
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
COLOR_BG = (29, 31, 38)        # #1d1f26
COLOR_NAVY = (40, 57, 100)     # #283964
COLOR_SUB_BG = (22, 33, 58)    # #16213a
COLOR_BLUE = (60, 123, 196)    # #3c7bc4
COLOR_ORANGE = (255, 130, 68)  # #ff8244
COLOR_WHITE = (255, 255, 255)  # #ffffff
COLOR_MUTED = (195, 208, 228)  # #c3d0e4
COLOR_TRACK = (20, 27, 44)

# Particles
np.random.seed(42)
NUM_PARTICLES = 60
particle_x = np.random.uniform(0, WIDTH, NUM_PARTICLES)
particle_y = np.random.uniform(0, HEIGHT, NUM_PARTICLES)
particle_speed = np.random.uniform(1.2, 3.5, NUM_PARTICLES)
particle_size = np.random.uniform(2.0, 4.0, NUM_PARTICLES)
particle_alpha = np.random.uniform(50, 180, NUM_PARTICLES)

# Base background gradient
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
    top_y = 40
    # Brand handle
    draw.text((60, top_y + 8), "@tempoemriodasostras", font=get_font(True, 26), fill=COLOR_WHITE)
    
    # Month badge
    badge_w = 230
    badge_h = 44
    badge_x = WIDTH - 60 - badge_w
    badge_y = top_y + 2
    draw_rounded_rect(draw, (badge_x, badge_y, badge_x + badge_w, badge_y + badge_h), 
                      fill=(38, 28, 24), outline=COLOR_ORANGE, radius=12, width=2)
    draw.text((badge_x + badge_w // 2, badge_y + badge_h // 2), "OUTUBRO / 2026", font=get_font(True, 20), fill=COLOR_ORANGE, anchor="mm")
    
    # Divider
    draw.line([(60, top_y + 60), (WIDTH - 60, top_y + 60)], fill=COLOR_BLUE, width=1)

    # 6 STORIES STEPS INDICATOR
    step_y = top_y + 72
    total_steps = 6
    margin = 60
    avail_w = WIDTH - 2 * margin
    step_gap = 12
    step_w = (avail_w - (total_steps - 1) * step_gap) / total_steps
    step_h = 6

    for s_i in range(total_steps):
        sx0 = margin + s_i * (step_w + step_gap)
        sx1 = sx0 + step_w
        if s_i < current_scene_idx:
            draw_rounded_rect(draw, (sx0, step_y, sx1, step_y + step_h), fill=COLOR_BLUE, radius=3)
        elif s_i == current_scene_idx:
            draw_rounded_rect(draw, (sx0, step_y, sx1, step_y + step_h), fill=COLOR_ORANGE, radius=3)
        else:
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

    # SCENE TIMELINE (TOTAL 47 SECONDS = 1410 FRAMES)
    # S1: 0 - 180 (0.0s - 6.0s) -> Abertura & 3 Números Chave
    # S2: 180 - 420 (6.0s - 14.0s) -> Volume Total de Chuva (Sem médias confusas)
    # S3: 420 - 690 (14.0s - 23.0s) -> Ranking Total das 5 Estações
    # S4: 690 - 930 (23.0s - 31.0s) -> Ventos e Variação Térmica
    # S5: 930 - 1170 (31.0s - 39.0s) -> O Que Comandou o Tempo (Sistemas Atmosféricos)
    # S6: 1170 - 1410 (39.0s - 47.0s) -> Divulgação Oficial & Siga o Canal (Dedicada)

    if frame_idx < 180:
        current_scene = 0
        draw_header_bar(draw, frame_idx, current_scene)
        render_scene_1(draw, frame_img, frame_idx)
    elif frame_idx < 420:
        current_scene = 1
        draw_header_bar(draw, frame_idx, current_scene)
        render_scene_2(draw, frame_img, frame_idx - 180)
    elif frame_idx < 690:
        current_scene = 2
        draw_header_bar(draw, frame_idx, current_scene)
        render_scene_3(draw, frame_img, frame_idx - 420)
    elif frame_idx < 930:
        current_scene = 3
        draw_header_bar(draw, frame_idx, current_scene)
        render_scene_4(draw, frame_img, frame_idx - 690)
    elif frame_idx < 1170:
        current_scene = 4
        draw_header_bar(draw, frame_idx, current_scene)
        render_scene_5(draw, frame_img, frame_idx - 930)
    else:
        current_scene = 5
        draw_header_bar(draw, frame_idx, current_scene)
        render_scene_6(draw, frame_img, frame_idx - 1170)

    # Bottom watermark footer (STRICTLY REQUIRED: No website URL)
    f_foot = get_font(False, 24)
    draw.text((WIDTH // 2, HEIGHT - 50), "Fontes: Estações Meteorológicas do Município", font=f_foot, fill=COLOR_MUTED, anchor="mm")

    return frame_img.convert("RGB").tobytes()

# SCENE 1: ABERTURA COM IMPACTO E OS 3 NÚMEROS CHAVE (6s)
def render_scene_1(draw, frame_img, rel_frame):
    progress = min(1.0, rel_frame / 20.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    # Logo institucional centralizado
    if user_logo:
        logo_w = 460
        logo_h = int(user_logo.height * (logo_w / user_logo.width))
        resized_logo = user_logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        logo_x = (WIDTH - logo_w) // 2
        logo_y = 160
        frame_img.paste(resized_logo, (logo_x, logo_y), resized_logo)
    else:
        draw.text((WIDTH // 2, 220), "TEMPO EM RIO DAS OSTRAS", font=get_font(True, 52), fill=COLOR_WHITE, anchor="mm")

    # Main Hero Title Box
    box_w = 960
    box_h = 360
    box_x = (WIDTH - box_w) // 2
    box_y = 500

    draw_rounded_rect(draw, (box_x, box_y, box_x + box_w, box_y + box_h), 
                      fill=COLOR_NAVY, outline=COLOR_BLUE, radius=32, width=3)

    tag_w = 420
    tag_h = 44
    tag_x = (WIDTH - tag_w) // 2
    tag_y = box_y + 35
    draw_rounded_rect(draw, (tag_x, tag_y, tag_x + tag_w, tag_y + tag_h), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=22, width=2)
    draw.text((WIDTH // 2, tag_y + tag_h // 2), "RETROSPECTIVA DO MÊS", font=get_font(True, 22), fill=COLOR_BLUE, anchor="mm")

    draw.text((WIDTH // 2, box_y + 130), "PANORAMA DO CLIMA", font=get_font(True, 56), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, box_y + 225), "OUTUBRO 2026", font=get_font(True, 84), fill=COLOR_ORANGE, anchor="mm")
    draw.text((WIDTH // 2, box_y + 310), "RIO DAS OSTRAS • RJ", font=get_font(True, 28), fill=COLOR_MUTED, anchor="mm")

    # 3 Hero Metric Cards (Foco nos dados totais da população)
    card_y = 920
    card_h = 220
    card_w = 960
    c_x = (WIDTH - card_w) // 2

    metrics = [
        ("410,0 mm", "RECORDE TOTAL DE CHUVA", "Pico histórico registrado na estação Rocha Leão", COLOR_ORANGE),
        ("25 DIAS", "DIAS COM CHUVA NA CIDADE", "Choveu em 80% dos dias do mês no município", COLOR_BLUE),
        ("62,3 km/h", "MAIOR RAJADA DE VENTO", "Praia da Tartaruga (26/10 às 10h)", COLOR_BLUE)
    ]

    for m_i, (hero_val, label, sublabel, border_c) in enumerate(metrics):
        cy = card_y + m_i * (card_h + 24)
        draw_rounded_rect(draw, (c_x, cy, c_x + card_w, cy + card_h), fill=COLOR_NAVY, outline=border_c, radius=24, width=2)

        draw_rounded_rect(draw, (c_x + 30, cy + 28, c_x + 100, cy + 68), fill=COLOR_SUB_BG, outline=border_c, radius=10, width=1)
        draw.text((c_x + 65, cy + 48), f"0{m_i+1}", font=get_font(True, 20), fill=border_c, anchor="mm")

        draw.text((c_x + 120, cy + 48), label, font=get_font(True, 24), fill=border_c, anchor="lm")
        draw.text((c_x + 35, cy + 125), hero_val, font=get_font(True, 68), fill=COLOR_WHITE, anchor="lm")
        draw.text((c_x + 35, cy + 180), sublabel, font=get_font(False, 22), fill=COLOR_MUTED, anchor="lm")

    draw.text((WIDTH // 2, 1720), "Veja os acumulados e detalhes a seguir", font=get_font(True, 24), fill=COLOR_BLUE, anchor="mm")

# SCENE 2: VOLUME TOTAL DE CHUVA NO MUNICÍPIO (8s)
# Foco 100% no volume real que choveu para a população, sem valores médios confusos!
def render_scene_2(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 160), "VOLUME TOTAL DE CHUVA", font=get_font(True, 50), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, 215), "Quanto realmente choveu em Rio das Ostras ao longo de Outubro", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    progress = min(1.0, rel_frame / 30.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    card_w = 960
    c_x = (WIDTH - card_w) // 2

    # CARD 1: VOLUME TOTAL ACUMULADO
    c1_y = 260
    draw_rounded_rect(draw, (c_x, c1_y, c_x + card_w, c1_y + 420), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=28, width=3)
    
    draw_rounded_rect(draw, (c_x + 40, c1_y + 30, c_x + 380, c1_y + 75), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((c_x + 210, c1_y + 52), "RECORDE TOTAL DO MÊS", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")

    val_anim = round(410.0 * eased, 1)
    str_val = f"{val_anim:.1f}".replace('.', ',')
    draw.text((c_x + 40, c1_y + 115), str_val, font=get_font(True, 108), fill=COLOR_WHITE)
    draw.text((c_x + 360, c1_y + 165), "mm", font=get_font(True, 50), fill=COLOR_ORANGE)

    draw.text((c_x + 40, c1_y + 260), "Pico total registrado na estação Rocha Leão", font=get_font(True, 28), fill=COLOR_WHITE)
    draw.text((c_x + 40, c1_y + 320), "• Acumulados no município variaram de 131,3 mm (orla) a 410,0 mm (interior).", font=get_font(False, 22), fill=COLOR_MUTED)
    draw.text((c_x + 40, c1_y + 365), "• Foi o mês mais chuvoso do ano em todas as estações municipais.", font=get_font(False, 22), fill=COLOR_MUTED)

    # CARD 2: DIAS COM CHUVA
    c2_y = 720
    draw_rounded_rect(draw, (c_x, c2_y, c_x + card_w, c2_y + 430), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=2)

    draw_rounded_rect(draw, (c_x + 40, c2_y + 30, c_x + 380, c2_y + 75), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=2)
    draw.text((c_x + 210, c2_y + 52), "DIAS COM CHUVA NA CIDADE", font=get_font(True, 22), fill=COLOR_BLUE, anchor="mm")

    dias_anim = int(25 * eased)
    draw.text((c_x + 40, c2_y + 115), f"{dias_anim} DIAS", font=get_font(True, 96), fill=COLOR_WHITE)
    draw.text((c_x + 40, c2_y + 235), "Choveu em 8 de cada 10 dias em Rio das Ostras", font=get_font(True, 28), fill=COLOR_BLUE)

    bar_y = c2_y + 295
    bar_w = card_w - 80
    draw_rounded_rect(draw, (c_x + 40, bar_y, c_x + 40 + bar_w, bar_y + 26), fill=COLOR_TRACK, radius=13)
    fill_w = int(bar_w * (25 / 31) * eased)
    if fill_w > 15:
        draw_rounded_rect(draw, (c_x + 40, bar_y, c_x + 40 + fill_w, bar_y + 26), fill=COLOR_BLUE, radius=13)
    
    draw.text((c_x + 40, c2_y + 355), "• A frequência contínua manteve o solo encharcado durante quase todo o mês.", font=get_font(False, 22), fill=COLOR_MUTED)

    # CARD 3: O DIA MAIS CHUVOSO
    c3_y = 1190
    draw_rounded_rect(draw, (c_x, c3_y, c_x + card_w, c3_y + 440), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=28, width=2)

    draw_rounded_rect(draw, (c_x + 40, c3_y + 30, c_x + 380, c3_y + 75), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((c_x + 210, c3_y + 52), "DIA MAIS CHUVOSO DO ANO", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")

    draw.text((c_x + 40, c3_y + 115), "02 / 10 / 2026", font=get_font(True, 68), fill=COLOR_WHITE)
    draw.text((c_x + 40, c3_y + 205), "Volume de até 84,3 mm em apenas 24 horas", font=get_font(True, 28), fill=COLOR_ORANGE)

    draw_rounded_rect(draw, (c_x + 40, c3_y + 265, c_x + card_w - 40, c3_y + 395), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
    draw.text((c_x + 65, c3_y + 305), "• Frente fria costeira provocou o evento de chuva mais concentrado de 2026.", font=get_font(False, 22), fill=COLOR_WHITE)
    draw.text((c_x + 65, c3_y + 350), "• Vários bairros registraram acumulados acima de 50 mm no mesmo dia.", font=get_font(False, 21), fill=COLOR_MUTED)

# SCENE 3: RANKING DAS 5 ESTAÇÕES (9s)
def render_scene_3(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 160), "ONDE MAIS CHOVEU?", font=get_font(True, 50), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, 215), "Ranking total de chuva acumulada em Outubro de 2026", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    stations = [
        {"name": "Rocha Leão (REBIO União)", "val": 410.0, "rank": "1º • RECORDE", "color": COLOR_ORANGE, "sub": "Relevo e reserva biológica retiveram nuvens pesadas"},
        {"name": "Cantagalo (LERIP)", "val": 191.7, "rank": "2º LUGAR", "color": COLOR_BLUE, "sub": "Zona rural com fortes pancadas de primavera"},
        {"name": "Praiamar / Divisa Sul", "val": 177.3, "rank": "3º LUGAR", "color": COLOR_BLUE, "sub": "Corredor costeiro de entrada de umidade"},
        {"name": "Praia da Tartaruga (Defesa Civil)", "val": 167.9, "rank": "4º LUGAR", "color": COLOR_BLUE, "sub": "Estação costeira oficial do Centro"},
        {"name": "Costazul (Escola Jacinto)", "val": 131.3, "rank": "5º LUGAR", "color": COLOR_BLUE, "sub": "Orla marítima (ainda assim 45% acima do normal)"},
    ]

    start_y = 270
    row_h = 220
    max_val = 410.0

    for idx, st in enumerate(stations):
        st_frame = max(0, rel_frame - idx * 6)
        progress = min(1.0, st_frame / 25.0)
        eased = 1.0 - math.pow(1.0 - progress, 3)

        y = start_y + idx * row_h
        draw_rounded_rect(draw, (60, y, WIDTH - 60, y + 195), fill=COLOR_NAVY, outline=st["color"], radius=24, width=3 if idx == 0 else 2)

        # Name & Rank
        draw.text((95, y + 25), st["name"], font=get_font(True, 30), fill=COLOR_WHITE)

        rw = 210 if "RECORDE" in st["rank"] else 150
        draw_rounded_rect(draw, (WIDTH - 95 - rw, y + 22, WIDTH - 95, y + 58), fill=COLOR_SUB_BG, outline=st["color"], radius=12, width=1)
        draw.text((WIDTH - 95 - rw // 2, y + 40), st["rank"], font=get_font(True, 18), fill=st["color"], anchor="mm")

        # Bar
        bar_y = y + 78
        bar_w = WIDTH - 480
        draw_rounded_rect(draw, (95, bar_y, 95 + bar_w, bar_y + 24), fill=COLOR_TRACK, radius=12)
        fill_w = max(int(bar_w * (st["val"] / max_val) * eased), 14 if eased > 0.05 else 0)
        if fill_w > 0:
            draw_rounded_rect(draw, (95, bar_y, 95 + fill_w, bar_y + 24), fill=st["color"], radius=12)

        cur_val = round(st["val"] * eased, 1)
        str_val = f"{cur_val:.1f}".replace('.', ',') + " mm"
        draw.text((WIDTH - 95, bar_y + 12), str_val, font=get_font(True, 36), fill=COLOR_WHITE, anchor="rm")

        draw.text((95, y + 142), f"• {st['sub']}", font=get_font(False, 22), fill=COLOR_MUTED)

    # Clean Takeaway
    call_y = start_y + len(stations) * row_h + 25
    draw_rounded_rect(draw, (60, call_y, WIDTH - 60, call_y + 140), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=2)
    draw.text((WIDTH // 2, call_y + 40), "CURIOSIDADE DO RELEVO", font=get_font(True, 24), fill=COLOR_ORANGE, anchor="mm")
    draw.text((WIDTH // 2, call_y + 85), "Rocha Leão (410 mm) acumulou mais que o triplo de Costazul (131 mm),", font=get_font(False, 22), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, call_y + 115), "comprovando a forte retenção de umidade na serra municipal.", font=get_font(False, 20), fill=COLOR_MUTED, anchor="mm")

# SCENE 4: VENTOS & TEMPERATURAS (8s)
def render_scene_4(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 160), "VENTOS & TEMPERATURAS", font=get_font(True, 50), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, 215), "Os extremos de rajadas e variação térmica registrados", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    progress = min(1.0, rel_frame / 30.0)
    eased = 1.0 - math.pow(1.0 - progress, 3)

    card_w = 960
    c_x = (WIDTH - card_w) // 2

    # CARD 1: MAIOR RAJADA
    c1_y = 260
    draw_rounded_rect(draw, (c_x, c1_y, c_x + card_w, c1_y + 480), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=28, width=3)
    
    draw_rounded_rect(draw, (c_x + 40, c1_y + 28, c_x + 360, c1_y + 72), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((c_x + 200, c1_y + 50), "RECORDE DE VENTO", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")

    raj_anim = round(62.3 * eased, 1)
    str_raj = f"{raj_anim:.1f}".replace('.', ',')
    draw.text((c_x + 40, c1_y + 105), str_raj, font=get_font(True, 112), fill=COLOR_WHITE)
    draw.text((c_x + 325, c1_y + 155), "km/h", font=get_font(True, 50), fill=COLOR_ORANGE)

    draw.text((c_x + 500, c1_y + 125), "MAIOR RAJADA DO MÊS", font=get_font(True, 30), fill=COLOR_WHITE)
    draw.text((c_x + 500, c1_y + 170), "Praia da Tartaruga • 26/10 às 10h", font=get_font(False, 22), fill=COLOR_MUTED)

    draw_rounded_rect(draw, (c_x + 40, c1_y + 270, c_x + card_w - 40, c1_y + 435), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
    draw.text((c_x + 70, c1_y + 315), "• Velocidade média dos ventos: 16,6 km/h (Direção Nordeste dominante)", font=get_font(False, 22), fill=COLOR_WHITE)
    draw.text((c_x + 70, c1_y + 375), "• Mar agitado com ondas de até 2,5 metros nos dias de pico de vento.", font=get_font(False, 21), fill=COLOR_MUTED)

    # CARD 2: EXTREMOS TÉRMICOS
    c2_y = 780
    draw_rounded_rect(draw, (c_x, c2_y, c_x + card_w, c2_y + 860), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=2)
    draw.text((c_x + 40, c2_y + 45), "VARIAÇÃO TÉRMICA DO MÊS", font=get_font(True, 32), fill=COLOR_BLUE)

    half_w = (card_w - 100) // 2
    # Mínima
    draw_rounded_rect(draw, (c_x + 40, c2_y + 105, c_x + 40 + half_w, c2_y + 440), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=20, width=2)
    draw.text((c_x + 65, c2_y + 140), "MENOR TEMPERATURA", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((c_x + 65, c2_y + 205), "18,4 °C", font=get_font(True, 72), fill=COLOR_BLUE)
    draw.text((c_x + 65, c2_y + 330), "Madrugadas frescas sob ar polar pós-frontal", font=get_font(False, 20), fill=COLOR_WHITE)
    draw.text((c_x + 65, c2_y + 375), "Noites com brisa fria e umidade elevada", font=get_font(False, 19), fill=COLOR_MUTED)

    # Máxima
    draw_rounded_rect(draw, (c_x + 60 + half_w, c2_y + 105, c_x + card_w - 40, c2_y + 440), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=20, width=2)
    draw.text((c_x + 85 + half_w, c2_y + 140), "MAIOR TEMPERATURA", font=get_font(False, 20), fill=COLOR_MUTED)
    draw.text((c_x + 85 + half_w, c2_y + 205), "32,6 °C", font=get_font(True, 72), fill=COLOR_ORANGE)
    draw.text((c_x + 85 + half_w, c2_y + 330), "Tardes quentes sob sol forte da ASAS", font=get_font(False, 20), fill=COLOR_WHITE)
    draw.text((c_x + 85 + half_w, c2_y + 375), "Pico térmico com sensação de verão na orla", font=get_font(False, 19), fill=COLOR_MUTED)

    # Contexto
    draw_rounded_rect(draw, (c_x + 40, c2_y + 485, c_x + card_w - 40, c2_y + 800), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=18, width=1)
    draw.text((c_x + 70, c2_y + 540), "• Amplitude térmica de 14,2°C registrada entre a menor e a maior marca.", font=get_font(False, 23), fill=COLOR_WHITE)
    draw.text((c_x + 70, c2_y + 605), "• Oscilação típica de primavera causada pelo choque atmosférico entre", font=get_font(False, 22), fill=COLOR_MUTED)
    draw.text((c_x + 70, c2_y + 655), "a massa de ar quente continental e as incursões oceânicas polares.", font=get_font(False, 22), fill=COLOR_MUTED)
    draw.text((c_x + 70, c2_y + 720), "• Variação confortável que alternou dias de praia com noites amenas.", font=get_font(False, 22), fill=COLOR_BLUE)

# SCENE 5: O QUE COMANDOU O TEMPO? (8s)
# 100% DEDICADA AOS SISTEMAS METEOROLÓGICOS (SEM MISTURAR COM DIVULGAÇÃO!)
def render_scene_5(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 160), "O QUE COMANDOU O TEMPO?", font=get_font(True, 50), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, 215), "Os 3 sistemas atmosféricos que ditaram o clima de Outubro/2026", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    card_w = 960
    c_x = (WIDTH - card_w) // 2

    systems = [
        {
            "days": "12 DIAS", 
            "title": "Sol Forte & Calor (ASAS)", 
            "desc": "A Alta Subtropical garantiu dias ensolarados, praia e vento nordeste.",
            "impact": "Predomínio de tempo firme e calor constante na primeira quinzena.",
            "color": COLOR_ORANGE
        },
        {
            "days": "12 DIAS", 
            "title": "Cavados & Canais de Umidade", 
            "desc": "Áreas de baixa pressão trouxeram céu encoberto e chuvas contínuas.",
            "impact": "Responsáveis pelos 25 dias chuvosos que encharcaram a cidade.",
            "color": COLOR_BLUE
        },
        {
            "days": "04 DIAS", 
            "title": "Passagem de Frentes Frias", 
            "desc": "Viradas bruscas de vento para o quadrante sul e quedas térmicas.",
            "impact": "Provocaram o dia mais chuvoso (84,3 mm) e o pico de vento de 62,3 km/h.",
            "color": COLOR_ORANGE
        }
    ]

    start_y = 270
    card_h = 360

    for idx, sys in enumerate(systems):
        y = start_y + idx * (card_h + 30)
        draw_rounded_rect(draw, (c_x, y, c_x + card_w, y + card_h), fill=COLOR_NAVY, outline=sys["color"], radius=28, width=2)

        # Number badge
        draw_rounded_rect(draw, (c_x + 35, y + 30, c_x + 230, y + 85), fill=COLOR_SUB_BG, outline=sys["color"], radius=14, width=2)
        draw.text((c_x + 132, y + 57), sys["days"], font=get_font(True, 26), fill=sys["color"], anchor="mm")

        draw.text((c_x + 260, y + 57), sys["title"], font=get_font(True, 32), fill=COLOR_WHITE, anchor="lm")

        draw.text((c_x + 35, y + 135), sys["desc"], font=get_font(False, 23), fill=COLOR_MUTED)
        
        draw_rounded_rect(draw, (c_x + 35, y + 215, c_x + card_w - 35, y + 315), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
        draw.text((c_x + 60, y + 265), f"• {sys['impact']}", font=get_font(False, 22), fill=COLOR_WHITE, anchor="lm")

    # Resumo síntese no rodapé
    sum_y = start_y + 3 * (card_h + 30) + 10
    draw_rounded_rect(draw, (c_x, sum_y, c_x + card_w, sum_y + 140), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=2)
    draw.text((WIDTH // 2, sum_y + 40), "SÍNTESE METEOROLÓGICA", font=get_font(True, 24), fill=COLOR_ORANGE, anchor="mm")
    draw.text((WIDTH // 2, sum_y + 85), "O confronto frequente entre a massa de ar quente e as frentes oceânicas", font=get_font(False, 22), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, sum_y + 115), "fez de Outubro de 2026 um dos meses mais chuvosos e dinâmicos dos últimos anos.", font=get_font(False, 20), fill=COLOR_MUTED, anchor="mm")

# SCENE 6: DIVULGAÇÃO OFICIAL DO CANAL (8s)
# 100% DEDICADA À PÁGINA E CHAMADA PARA SEGUIR (SEM MISTURA DE OUTROS DADOS!)
def render_scene_6(draw, frame_img, rel_frame):
    draw.text((WIDTH // 2, 160), "ACOMPANHE O CLIMA DIARIAMENTE", font=get_font(True, 50), fill=COLOR_WHITE, anchor="mm")
    draw.text((WIDTH // 2, 215), "Previsões diárias, alertas oficiais e monitoramento em tempo real", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    card_w = 960
    c_x = (WIDTH - card_w) // 2

    # Brand Full Card Oficial
    if full_card:
        target_w = 960
        target_h = int(full_card.height * (target_w / full_card.width))
        c_resized = full_card.resize((target_w, target_h), Image.Resampling.LANCZOS)
        cx = (WIDTH - target_w) // 2
        cy = 280
        
        draw_rounded_rect(draw, (cx - 8, cy - 8, cx + target_w + 8, cy + target_h + 8), fill=COLOR_ORANGE, radius=32)
        frame_img.paste(c_resized, (cx, cy), c_resized)
        
        box_y = cy + target_h + 45
    else:
        box_y = 800

    # Card com o que o canal oferece
    box_h = 580
    draw_rounded_rect(draw, (c_x, box_y, c_x + card_w, box_y + box_h), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=2)
    draw.text((WIDTH // 2, box_y + 60), "O QUE VOCÊ ENCONTRA NA NOSSA PÁGINA:", font=get_font(True, 32), fill=COLOR_WHITE, anchor="mm")

    items = [
        ("• Previsões Diárias:", "Publicadas todas as manhãs com mapas locais."),
        ("• Alertas Oficiais:", "Avisos prévios de tempestades, ventos e ressacas."),
        ("• Chuva em Tempo Real:", "Acumulados atualizados de todas as estações municipais."),
        ("• Condições da Orla:", "Tábua de marés, temperatura da água e rajadas de vento.")
    ]

    for i, (b_title, b_desc) in enumerate(items):
        iy = box_y + 115 + i * 95
        draw_rounded_rect(draw, (c_x + 35, iy, c_x + card_w - 35, iy + 78), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
        draw.text((c_x + 55, iy + 39), b_title, font=get_font(True, 24), fill=COLOR_ORANGE, anchor="lm")
        draw.text((c_x + 360, iy + 39), b_desc, font=get_font(False, 21), fill=COLOR_WHITE, anchor="lm")

    draw.line([(c_x + 50, box_y + 510), (c_x + card_w - 50, box_y + 510)], fill=COLOR_BLUE, width=2)
    draw.text((WIDTH // 2, box_y + 545), "Siga @tempoemriodasostras no Instagram e compartilhe!", font=get_font(True, 28), fill=COLOR_ORANGE, anchor="mm")

def main():
    out_dir = "C:/Users/debor/.gemini/antigravity/scratch/clima-rio-das-ostras/public/videos"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "panorama_outubro_2026_reels.mp4")

    print(f"Generating MAXIMUM QUALITY Master Reels: {out_path}")
    print(f"Total frames: {TOTAL_FRAMES} at {FPS} FPS ({TOTAL_SECONDS}s) - Lossless Direct Pipe into libx264 CRF 15")

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg, "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-c:v", "libx264",
        "-profile:v", "high",
        "-level:v", "4.2",
        "-preset", "slow",
        "-crf", "15",
        "-pix_fmt", "yuv420p",
        "-colorspace", "bt709",
        "-color_primaries", "bt709",
        "-color_trc", "bt709",
        "-color_range", "tv",
        "-movflags", "+faststart",
        "-an",
        out_path
    ]

    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    for f_idx in range(TOTAL_FRAMES):
        raw_bytes = render_frame(f_idx)
        proc.stdin.write(raw_bytes)
        if f_idx % 120 == 0:
            print(f"Rendered & Encoded {f_idx}/{TOTAL_FRAMES} frames ({(f_idx/TOTAL_FRAMES)*100:.1f}%)")

    proc.stdin.close()
    stdout, stderr = proc.communicate()

    if proc.returncode == 0:
        print("DONE! Master Maximum Quality Reels video created:", out_path)
        print("File size:", os.path.getsize(out_path), "bytes")
    else:
        print("FFmpeg error:", stderr.decode('utf-8', errors='ignore'))

if __name__ == "__main__":
    main()
