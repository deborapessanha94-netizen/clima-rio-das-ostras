import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# COLOR PALETTE
COLOR_BG = (29, 31, 38)
COLOR_NAVY = (40, 57, 100)
COLOR_SUB_BG = (22, 33, 58)
COLOR_BLUE = (60, 123, 196)
COLOR_ORANGE = (255, 130, 68)
COLOR_WHITE = (255, 255, 255)
COLOR_MUTED = (205, 218, 238)
COLOR_TRACK = (20, 27, 44)

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

def draw_rounded_rect(draw, bbox, fill, outline=None, width=1, radius=20):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def create_base_background(width, height):
    img = Image.new("RGBA", (width, height), (COLOR_BG[0], COLOR_BG[1], COLOR_BG[2], 255))
    draw = ImageDraw.Draw(img)
    for y in range(height):
        factor = y / height
        r = int(COLOR_BG[0] * (1 - factor * 0.25))
        g = int(COLOR_BG[1] * (1 - factor * 0.25))
        b = int(COLOR_BG[2] * (1 - factor * 0.20))
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    
    np.random.seed(42)
    for _ in range(45):
        px = np.random.randint(0, width)
        py = np.random.randint(0, height)
        sz = np.random.randint(2, 5)
        al = np.random.randint(40, 140)
        draw.ellipse([px, py, px + sz, py + sz], fill=(COLOR_BLUE[0], COLOR_BLUE[1], COLOR_BLUE[2], al))
    return img

# ==============================================================================
# 1. STORIES (1080 x 1920) - LARGE FONTS & CLEAN SPACING
# ==============================================================================
def draw_header_stories(draw, current_scene_idx):
    top_y = 50
    draw.text((65, top_y + 12), "@tempoemriodasostras", font=get_font(True, 28), fill=COLOR_WHITE)
    
    badge_w = 240
    badge_h = 46
    badge_x = 1080 - 65 - badge_w
    badge_y = top_y + 2
    draw_rounded_rect(draw, (badge_x, badge_y, badge_x + badge_w, badge_y + badge_h), 
                      fill=(38, 28, 24), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((badge_x + badge_w // 2, badge_y + badge_h // 2), "OUTUBRO / 2026", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")
    
    draw.line([(65, top_y + 65), (1080 - 65, top_y + 65)], fill=COLOR_BLUE, width=2)

    step_y = top_y + 78
    total_steps = 6
    margin = 65
    avail_w = 1080 - 2 * margin
    step_gap = 12
    step_w = (avail_w - (total_steps - 1) * step_gap) / total_steps
    step_h = 7

    for s_i in range(total_steps):
        sx0 = margin + s_i * (step_w + step_gap)
        sx1 = sx0 + step_w
        if s_i < current_scene_idx:
            draw_rounded_rect(draw, (sx0, step_y, sx1, step_y + step_h), fill=COLOR_BLUE, radius=4)
        elif s_i == current_scene_idx:
            draw_rounded_rect(draw, (sx0, step_y, sx1, step_y + step_h), fill=COLOR_ORANGE, radius=4)
        else:
            draw_rounded_rect(draw, (sx0, step_y, sx1, step_y + step_h), fill=(40, 50, 75), radius=4)

def draw_footer_stories(draw):
    draw.text((1080 // 2, 1920 - 55), "Fontes: Estações Meteorológicas do Município", font=get_font(False, 26), fill=COLOR_MUTED, anchor="mm")

def render_stories_slide_1(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_stories(draw, 0)

    if user_logo:
        lw = 480
        lh = int(user_logo.height * (lw / user_logo.width))
        resized = user_logo.resize((lw, lh), Image.Resampling.LANCZOS)
        img.paste(resized, ((1080 - lw) // 2, 165), resized)

    box_w = 950
    b_x = (1080 - box_w) // 2
    b_y = 510
    draw_rounded_rect(draw, (b_x, b_y, b_x + box_w, b_y + 270), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=32, width=3)
    draw.text((1080 // 2, b_y + 55), "RETROSPECTIVA DO CLIMA", font=get_font(True, 34), fill=COLOR_ORANGE, anchor="mm")
    draw.text((1080 // 2, b_y + 130), "OUTUBRO / 2026", font=get_font(True, 64), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, b_y + 205), "Consolidação Oficial de Rio das Ostras - RJ", font=get_font(False, 28), fill=COLOR_MUTED, anchor="mm")

    cards = [
        {"tag": "VOLUME MÁXIMO DE CHUVA", "val": "410,0 mm", "sub": "Estação Rocha Leão • Região Rural", "color": COLOR_ORANGE},
        {"tag": "DIAS COM CHUVA", "val": "25 DIAS", "sub": "Choveu em 80% do mês na cidade", "color": COLOR_BLUE},
        {"tag": "MAIOR RAJADA DE VENTO", "val": "62,3 km/h", "sub": "Praia da Tartaruga (26/10 às 10h)", "color": COLOR_ORANGE}
    ]
    start_y = 830
    c_h = 300
    for idx, c in enumerate(cards):
        cy = start_y + idx * (c_h + 35)
        draw_rounded_rect(draw, (b_x, cy, b_x + box_w, cy + c_h), fill=COLOR_NAVY, outline=c["color"], radius=28, width=3)
        
        # Pill tag
        draw_rounded_rect(draw, (b_x + 40, cy + 28, b_x + 460, cy + 76), fill=COLOR_SUB_BG, outline=c["color"], radius=14, width=2)
        draw.text((b_x + 250, cy + 52), c["tag"], font=get_font(True, 22), fill=c["color"], anchor="mm")
        
        # Big Number
        draw.text((b_x + 45, cy + 140), c["val"], font=get_font(True, 72), fill=COLOR_WHITE)
        
        # Subtitle
        draw.text((b_x + 45, cy + 235), f"• {c['sub']}", font=get_font(True, 26), fill=COLOR_MUTED)

    draw_footer_stories(draw)
    return img

def render_stories_slide_2(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_stories(draw, 1)

    draw.text((1080 // 2, 165), "VOLUME TOTAL DE CHUVA", font=get_font(True, 52), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 225), "Acumulado real e histórico registrado em Outubro de 2026", font=get_font(False, 26), fill=COLOR_MUTED, anchor="mm")

    card_w = 950
    c_x = (1080 - card_w) // 2

    # Card 1: Recorde
    c1_y = 280
    draw_rounded_rect(draw, (c_x, c1_y, c_x + card_w, c1_y + 440), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=30, width=3)
    draw_rounded_rect(draw, (c_x + 40, c1_y + 30, c_x + 390, c1_y + 78), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((c_x + 215, c1_y + 54), "RECORDE TOTAL DO MÊS", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")
    draw.text((c_x + 40, c1_y + 115), "410,0", font=get_font(True, 115), fill=COLOR_WHITE)
    draw.text((c_x + 390, c1_y + 170), "mm", font=get_font(True, 54), fill=COLOR_ORANGE)
    draw.text((c_x + 40, c1_y + 270), "Pico na estação Rocha Leão (Região Rural)", font=get_font(True, 32), fill=COLOR_WHITE)
    draw.text((c_x + 40, c1_y + 335), "• Variou de 131,3 mm (orla) a 410,0 mm (interior rural).", font=get_font(False, 26), fill=COLOR_MUTED)
    draw.text((c_x + 40, c1_y + 380), "• Foi o mês mais chuvoso do ano em toda a rede.", font=get_font(False, 26), fill=COLOR_MUTED)

    # Card 2: Frequência
    c2_y = 760
    draw_rounded_rect(draw, (c_x, c2_y, c_x + card_w, c2_y + 440), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=30, width=3)
    draw_rounded_rect(draw, (c_x + 40, c2_y + 30, c_x + 410, c2_y + 78), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=2)
    draw.text((c_x + 225, c2_y + 54), "DIAS COM CHUVA NA CIDADE", font=get_font(True, 22), fill=COLOR_BLUE, anchor="mm")
    draw.text((c_x + 40, c2_y + 115), "25 DIAS", font=get_font(True, 105), fill=COLOR_WHITE)
    draw.text((c_x + 40, c2_y + 245), "Choveu em 8 de cada 10 dias em Rio das Ostras", font=get_font(True, 30), fill=COLOR_BLUE)
    bar_y = c2_y + 310
    bar_w = card_w - 80
    draw_rounded_rect(draw, (c_x + 40, bar_y, c_x + 40 + bar_w, bar_y + 28), fill=COLOR_TRACK, radius=14)
    draw_rounded_rect(draw, (c_x + 40, bar_y, c_x + 40 + int(bar_w * (25 / 31)), bar_y + 28), fill=COLOR_BLUE, radius=14)
    draw.text((c_x + 40, c2_y + 375), "• Solo encharcado durante quase todo o mês de outubro.", font=get_font(False, 26), fill=COLOR_MUTED)

    # Card 3: Dia Mais Chuvoso
    c3_y = 1240
    draw_rounded_rect(draw, (c_x, c3_y, c_x + card_w, c3_y + 440), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=30, width=3)
    draw_rounded_rect(draw, (c_x + 40, c3_y + 30, c_x + 400, c3_y + 78), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((c_x + 220, c3_y + 54), "DIA MAIS CHUVOSO DO ANO", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")
    draw.text((c_x + 40, c3_y + 115), "02 / 10 / 2026", font=get_font(True, 76), fill=COLOR_WHITE)
    draw.text((c_x + 40, c3_y + 225), "Volume de até 84,3 mm em apenas 24 horas", font=get_font(True, 32), fill=COLOR_ORANGE)
    draw_rounded_rect(draw, (c_x + 40, c3_y + 285, c_x + card_w - 40, c3_y + 405), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=18, width=1)
    draw.text((c_x + 65, c3_y + 325), "• Frente fria costeira provocou o evento mais severo de 2026.", font=get_font(False, 25), fill=COLOR_WHITE)
    draw.text((c_x + 65, c3_y + 368), "• Vários bairros registraram acumulados acima de 50 mm.", font=get_font(False, 24), fill=COLOR_MUTED)

    draw_footer_stories(draw)
    return img

def render_stories_slide_3(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_stories(draw, 2)

    draw.text((1080 // 2, 165), "ONDE MAIS CHOVEU?", font=get_font(True, 52), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 225), "Ranking total de chuva acumulada em Outubro de 2026", font=get_font(False, 26), fill=COLOR_MUTED, anchor="mm")

    stations = [
        {"name": "Rocha Leão (REBIO União)", "val": 410.0, "rank": "1º • RECORDE", "color": COLOR_ORANGE, "sub": "Região rural e reserva biológica retiveram nuvens pesadas"},
        {"name": "Cantagalo (LERIP)", "val": 191.7, "rank": "2º LUGAR", "color": COLOR_BLUE, "sub": "Zona rural com fortes pancadas de primavera"},
        {"name": "Praiamar / Divisa Sul", "val": 177.3, "rank": "3º LUGAR", "color": COLOR_BLUE, "sub": "Corredor costeiro de entrada de umidade marítima"},
        {"name": "Praia da Tartaruga (Defesa Civil)", "val": 167.9, "rank": "4º LUGAR", "color": COLOR_BLUE, "sub": "Estação costeira oficial do Centro"},
        {"name": "Costazul (Escola Jacinto)", "val": 131.3, "rank": "5º LUGAR", "color": COLOR_BLUE, "sub": "Orla marítima (45% acima da normal climatológica)"},
    ]

    start_y = 280
    row_h = 220
    max_val = 410.0

    for idx, st in enumerate(stations):
        y = start_y + idx * row_h
        draw_rounded_rect(draw, (65, y, 1080 - 65, y + 195), fill=COLOR_NAVY, outline=st["color"], radius=26, width=3 if idx == 0 else 2)
        
        # Name
        draw.text((100, y + 25), st["name"], font=get_font(True, 32), fill=COLOR_WHITE)

        # Rank pill
        rw = 230 if "RECORDE" in st["rank"] else 160
        draw_rounded_rect(draw, (1080 - 100 - rw, y + 20, 1080 - 100, y + 60), fill=COLOR_SUB_BG, outline=st["color"], radius=12, width=2)
        draw.text((1080 - 100 - rw // 2, y + 40), st["rank"], font=get_font(True, 20), fill=st["color"], anchor="mm")

        # Bar
        bar_y = y + 78
        bar_w = 1080 - 520
        draw_rounded_rect(draw, (100, bar_y, 100 + bar_w, bar_y + 26), fill=COLOR_TRACK, radius=13)
        fill_w = max(int(bar_w * (st["val"] / max_val)), 16)
        draw_rounded_rect(draw, (100, bar_y, 100 + fill_w, bar_y + 26), fill=st["color"], radius=13)

        # Value
        str_val = f"{st['val']:.1f}".replace('.', ',') + " mm"
        draw.text((1080 - 100, bar_y + 13), str_val, font=get_font(True, 40), fill=COLOR_WHITE, anchor="rm")
        
        # Sub
        draw.text((100, y + 145), f"• {st['sub']}", font=get_font(False, 25), fill=COLOR_MUTED)

    call_y = start_y + len(stations) * row_h + 30
    draw_rounded_rect(draw, (65, call_y, 1080 - 65, call_y + 175), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=26, width=3)
    draw.text((1080 // 2, call_y + 45), "DESTAQUE DA REGIÃO RURAL", font=get_font(True, 28), fill=COLOR_ORANGE, anchor="mm")
    draw.text((1080 // 2, call_y + 95), "Rocha Leão (410 mm) acumulou mais que o triplo de Costazul (131 mm),", font=get_font(False, 26), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, call_y + 135), "comprovando a forte retenção de umidade na região rural.", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    draw_footer_stories(draw)
    return img

def render_stories_slide_4(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_stories(draw, 3)

    draw.text((1080 // 2, 165), "VENTOS & TEMPERATURAS", font=get_font(True, 52), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 225), "Os extremos de rajadas e variação térmica registrados", font=get_font(False, 26), fill=COLOR_MUTED, anchor="mm")

    card_w = 950
    c_x = (1080 - card_w) // 2

    # Card 1: Vento
    c1_y = 280
    draw_rounded_rect(draw, (c_x, c1_y, c_x + card_w, c1_y + 500), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=30, width=3)
    draw_rounded_rect(draw, (c_x + 40, c1_y + 30, c_x + 390, c1_y + 78), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((c_x + 215, c1_y + 54), "RECORDE DE VENTO", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")
    draw.text((c_x + 40, c1_y + 115), "62,3", font=get_font(True, 118), fill=COLOR_WHITE)
    draw.text((c_x + 350, c1_y + 170), "km/h", font=get_font(True, 52), fill=COLOR_ORANGE)
    draw.text((c_x + 40, c1_y + 265), "Praia da Tartaruga (26/10 às 10:00)", font=get_font(True, 32), fill=COLOR_WHITE)
    draw_rounded_rect(draw, (c_x + 40, c1_y + 325, c_x + card_w - 40, c1_y + 465), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=18, width=1)
    draw.text((c_x + 65, c1_y + 368), "• Vento médio no mês: 16,6 km/h com direção Nordeste (NE).", font=get_font(False, 25), fill=COLOR_WHITE)
    draw.text((c_x + 65, c1_y + 420), "• Rajadas fortes acompanharam as passagens de frentes frias.", font=get_font(False, 24), fill=COLOR_MUTED)

    # Card 2: Extremos Térmicos
    c2_y = 825
    draw_rounded_rect(draw, (c_x, c2_y, c_x + card_w, c2_y + 525), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=30, width=3)
    draw_rounded_rect(draw, (c_x + 40, c2_y + 30, c_x + 400, c2_y + 78), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=2)
    draw.text((c_x + 220, c2_y + 54), "EXTREMOS TÉRMICOS", font=get_font(True, 22), fill=COLOR_BLUE, anchor="mm")

    box_half = (card_w - 110) // 2
    draw_rounded_rect(draw, (c_x + 40, c2_y + 115, c_x + 40 + box_half, c2_y + 285), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=22, width=2)
    draw.text((c_x + 70, c2_y + 150), "MÍNIMA ABSOLUTA", font=get_font(True, 20), fill=COLOR_BLUE)
    draw.text((c_x + 70, c2_y + 190), "18,4°C", font=get_font(True, 64), fill=COLOR_WHITE)
    draw.text((c_x + 70, c2_y + 252), "15/10 • Madrugada", font=get_font(False, 22), fill=COLOR_MUTED)

    bx2 = c_x + 40 + box_half + 30
    draw_rounded_rect(draw, (bx2, c2_y + 115, bx2 + box_half, c2_y + 285), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=22, width=2)
    draw.text((bx2 + 30, c2_y + 150), "MÁXIMA ABSOLUTA", font=get_font(True, 20), fill=COLOR_ORANGE)
    draw.text((bx2 + 30, c2_y + 190), "32,6°C", font=get_font(True, 64), fill=COLOR_WHITE)
    draw.text((bx2 + 30, c2_y + 252), "24/10 • Pré-frontal", font=get_font(False, 22), fill=COLOR_MUTED)

    draw_rounded_rect(draw, (c_x + 40, c2_y + 315, c_x + card_w - 40, c2_y + 485), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=18, width=1)
    draw.text((c_x + 65, c2_y + 365), "• Amplitude térmica mensal atingiu 14,2°C entre os extremos.", font=get_font(False, 25), fill=COLOR_WHITE)
    draw.text((c_x + 65, c2_y + 420), "• Nebulosidade e chuvas frequentes impediram ondas de calor extremo.", font=get_font(False, 24), fill=COLOR_MUTED)

    draw_footer_stories(draw)
    return img

def render_stories_slide_5(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_stories(draw, 4)

    draw.text((1080 // 2, 165), "O QUE COMANDOU O TEMPO?", font=get_font(True, 52), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 225), "Principais sistemas meteorológicos atuantes em Outubro", font=get_font(False, 26), fill=COLOR_MUTED, anchor="mm")

    systems = [
        {"name": "Alta Subtropical do Atlântico Sul (ASAS)", "days": 12, "pct": "38,7%", "color": COLOR_ORANGE, "desc": "Garantia de sol e ventos constantes do quadrante Nordeste"},
        {"name": "Cavados Costeiros & Instabilidades", "days": 12, "pct": "38,7%", "color": COLOR_BLUE, "desc": "Áreas de baixa pressão e convergência causadoras de chuvas fortes"},
        {"name": "Frentes Frias Atuantes", "days": 4, "pct": "12,9%", "color": COLOR_ORANGE, "desc": "Passagens frontais responsáveis pelos volumes mais intensos"},
        {"name": "Circulação Marítima Pós-Frontal", "days": 3, "pct": "9,7%", "color": COLOR_BLUE, "desc": "Ventos marítimos do sul, tempo encoberto e chuviscos costeiros"}
    ]

    start_y = 290
    row_h = 235
    for idx, sys in enumerate(systems):
        y = start_y + idx * row_h
        draw_rounded_rect(draw, (65, y, 1080 - 65, y + 205), fill=COLOR_NAVY, outline=sys["color"], radius=26, width=2)
        draw.text((100, y + 30), sys["name"], font=get_font(True, 30), fill=COLOR_WHITE)

        dw = 220
        draw_rounded_rect(draw, (1080 - 100 - dw, y + 24, 1080 - 100, y + 68), fill=COLOR_SUB_BG, outline=sys["color"], radius=12, width=2)
        draw.text((1080 - 100 - dw // 2, y + 46), f"{sys['days']} DIAS ({sys['pct']})", font=get_font(True, 19), fill=sys["color"], anchor="mm")

        bar_y = y + 88
        bar_w = 1080 - 200
        draw_rounded_rect(draw, (100, bar_y, 100 + bar_w, bar_y + 24), fill=COLOR_TRACK, radius=12)
        draw_rounded_rect(draw, (100, bar_y, 100 + int(bar_w * (sys["days"] / 31)), bar_y + 24), fill=sys["color"], radius=12)

        draw.text((100, y + 148), f"• {sys['desc']}", font=get_font(False, 25), fill=COLOR_MUTED)

    sum_y = start_y + len(systems) * row_h + 30
    draw_rounded_rect(draw, (65, sum_y, 1080 - 65, sum_y + 175), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=26, width=3)
    draw.text((1080 // 2, sum_y + 45), "SÍNTESE METEOROLÓGICA", font=get_font(True, 28), fill=COLOR_ORANGE, anchor="mm")
    draw.text((1080 // 2, sum_y + 95), "O confronto frequente entre a massa de ar quente e as frentes oceânicas", font=get_font(False, 26), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, sum_y + 135), "fez de Outubro de 2026 o mês mais chuvoso do ano em Rio das Ostras.", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    draw_footer_stories(draw)
    return img

def render_stories_slide_6(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_stories(draw, 5)

    draw.text((1080 // 2, 165), "ACOMPANHE O CLIMA DIARIAMENTE", font=get_font(True, 50), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 225), "Previsões diárias, alertas oficiais e monitoramento em tempo real", font=get_font(False, 26), fill=COLOR_MUTED, anchor="mm")

    card_w = 950
    c_x = (1080 - card_w) // 2

    if full_card:
        tw = 950
        th = int(full_card.height * (tw / full_card.width))
        c_res = full_card.resize((tw, th), Image.Resampling.LANCZOS)
        cx = (1080 - tw) // 2
        cy = 280
        draw_rounded_rect(draw, (cx - 8, cy - 8, cx + tw + 8, cy + th + 8), fill=COLOR_ORANGE, radius=32)
        img.paste(c_res, (cx, cy), c_res)
        box_y = cy + th + 45
    else:
        box_y = 780

    box_h = 600
    draw_rounded_rect(draw, (c_x, box_y, c_x + card_w, box_y + box_h), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=30, width=3)
    draw.text((1080 // 2, box_y + 60), "O QUE VOCÊ ENCONTRA NA NOSSA PÁGINA:", font=get_font(True, 32), fill=COLOR_WHITE, anchor="mm")

    items = [
        ("• Previsões Diárias:", "Publicadas todas as manhãs com mapas locais."),
        ("• Alertas Oficiais:", "Avisos prévios de tempestades, ventos e ressacas."),
        ("• Chuva em Tempo Real:", "Acumulados atualizados de todas as estações municipais."),
        ("• Condições da Orla:", "Tábua de marés, temperatura da água e rajadas de vento.")
    ]

    for i, (b_title, b_desc) in enumerate(items):
        iy = box_y + 115 + i * 100
        draw_rounded_rect(draw, (c_x + 35, iy, c_x + card_w - 35, iy + 82), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=18, width=1)
        draw.text((c_x + 55, iy + 41), b_title, font=get_font(True, 26), fill=COLOR_ORANGE, anchor="lm")
        draw.text((c_x + 380, iy + 41), b_desc, font=get_font(False, 24), fill=COLOR_WHITE, anchor="lm")

    draw.line([(c_x + 50, box_y + 525), (c_x + card_w - 50, box_y + 525)], fill=COLOR_BLUE, width=2)
    draw.text((1080 // 2, box_y + 560), "Siga @tempoemriodasostras no Instagram e compartilhe!", font=get_font(True, 28), fill=COLOR_ORANGE, anchor="mm")

    draw_footer_stories(draw)
    return img

# ==============================================================================
# 2. FEED POST CARROSSEL (1080 x 1350) - LARGE FONTS & UNCLUTTERED
# ==============================================================================
def draw_header_feed(draw, current_scene_idx):
    top_y = 35
    draw.text((65, top_y + 10), "@tempoemriodasostras", font=get_font(True, 26), fill=COLOR_WHITE)

    badge_w = 230
    badge_h = 42
    bx = 1080 - 65 - badge_w
    by = top_y + 2
    draw_rounded_rect(draw, (bx, by, bx + badge_w, by + badge_h), fill=(38, 28, 24), outline=COLOR_ORANGE, radius=12, width=2)
    draw.text((bx + badge_w // 2, by + badge_h // 2), "OUTUBRO / 2026", font=get_font(True, 20), fill=COLOR_ORANGE, anchor="mm")

    draw.line([(65, top_y + 55), (1080 - 65, top_y + 55)], fill=COLOR_BLUE, width=2)

    step_y = top_y + 68
    total_steps = 6
    margin = 65
    avail_w = 1080 - 2 * margin
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

def draw_footer_feed(draw):
    draw.text((1080 // 2, 1350 - 32), "Fontes: Estações Meteorológicas do Município", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

def render_feed_slide_1(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_feed(draw, 0)

    if user_logo:
        lw = 360
        lh = int(user_logo.height * (lw / user_logo.width))
        resized = user_logo.resize((lw, lh), Image.Resampling.LANCZOS)
        img.paste(resized, ((1080 - lw) // 2, 120), resized)

    box_w = 950
    b_x = (1080 - box_w) // 2
    b_y = 365
    draw_rounded_rect(draw, (b_x, b_y, b_x + box_w, b_y + 195), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=3)
    draw.text((1080 // 2, b_y + 40), "RETROSPECTIVA DO CLIMA", font=get_font(True, 30), fill=COLOR_ORANGE, anchor="mm")
    draw.text((1080 // 2, b_y + 95), "OUTUBRO / 2026", font=get_font(True, 56), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, b_y + 150), "Consolidação Oficial de Rio das Ostras - RJ", font=get_font(False, 25), fill=COLOR_MUTED, anchor="mm")

    cards = [
        {"tag": "VOLUME MÁXIMO", "val": "410,0 mm", "sub": "Pico em Rocha Leão (Região Rural)", "color": COLOR_ORANGE},
        {"tag": "DIAS COM CHUVA", "val": "25 DIAS", "sub": "Choveu em 80% do mês na cidade", "color": COLOR_BLUE},
        {"tag": "MAIOR RAJADA", "val": "62,3 km/h", "sub": "Praia da Tartaruga (26/10 às 10h)", "color": COLOR_ORANGE}
    ]
    start_y = 585
    c_h = 220
    for idx, c in enumerate(cards):
        cy = start_y + idx * (c_h + 18)
        draw_rounded_rect(draw, (b_x, cy, b_x + box_w, cy + c_h), fill=COLOR_NAVY, outline=c["color"], radius=24, width=2)
        
        # Pill
        draw_rounded_rect(draw, (b_x + 35, cy + 20, b_x + 380, cy + 62), fill=COLOR_SUB_BG, outline=c["color"], radius=12, width=2)
        draw.text((b_x + 207, cy + 41), c["tag"], font=get_font(True, 20), fill=c["color"], anchor="mm")
        
        # Value
        draw.text((b_x + 40, cy + 95), c["val"], font=get_font(True, 58), fill=COLOR_WHITE)
        
        # Sub
        draw.text((b_x + 40, cy + 172), f"• {c['sub']}", font=get_font(True, 24), fill=COLOR_MUTED)

    draw_footer_feed(draw)
    return img

def render_feed_slide_2(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_feed(draw, 1)

    draw.text((1080 // 2, 135), "VOLUME TOTAL DE CHUVA", font=get_font(True, 46), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 180), "Acumulado real e histórico registrado em Outubro de 2026", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    card_w = 950
    c_x = (1080 - card_w) // 2

    # Card 1: Recorde
    c1_y = 215
    draw_rounded_rect(draw, (c_x, c1_y, c_x + card_w, c1_y + 325), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=3)
    draw_rounded_rect(draw, (c_x + 35, c1_y + 20, c_x + 380, c1_y + 60), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=12, width=2)
    draw.text((c_x + 207, c1_y + 40), "RECORDE TOTAL DO MÊS", font=get_font(True, 20), fill=COLOR_ORANGE, anchor="mm")
    draw.text((c_x + 35, c1_y + 80), "410,0", font=get_font(True, 92), fill=COLOR_WHITE)
    draw.text((c_x + 320, c1_y + 125), "mm", font=get_font(True, 46), fill=COLOR_ORANGE)
    draw.text((c_x + 35, c1_y + 200), "Pico na estação Rocha Leão (Região Rural)", font=get_font(True, 28), fill=COLOR_WHITE)
    draw.text((c_x + 35, c1_y + 250), "• Chuvas variaram de 131 mm (orla) a 410 mm (interior rural).", font=get_font(False, 24), fill=COLOR_MUTED)

    # Card 2: Frequência
    c2_y = 565
    draw_rounded_rect(draw, (c_x, c2_y, c_x + card_w, c2_y + 335), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=24, width=2)
    draw_rounded_rect(draw, (c_x + 35, c2_y + 20, c_x + 390, c2_y + 60), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=12, width=2)
    draw.text((c_x + 212, c2_y + 40), "DIAS COM CHUVA NA CIDADE", font=get_font(True, 20), fill=COLOR_BLUE, anchor="mm")
    draw.text((c_x + 35, c2_y + 80), "25 DIAS", font=get_font(True, 84), fill=COLOR_WHITE)
    draw.text((c_x + 35, c2_y + 190), "Choveu em 8 de cada 10 dias em Rio das Ostras", font=get_font(True, 26), fill=COLOR_BLUE)
    bar_y = c2_y + 245
    bar_w = card_w - 70
    draw_rounded_rect(draw, (c_x + 35, bar_y, c_x + 35 + bar_w, bar_y + 24), fill=COLOR_TRACK, radius=12)
    draw_rounded_rect(draw, (c_x + 35, bar_y, c_x + 35 + int(bar_w * (25 / 31)), bar_y + 24), fill=COLOR_BLUE, radius=12)
    draw.text((c_x + 35, c2_y + 295), "• Solo permaneceu encharcado durante quase todo o mês.", font=get_font(False, 24), fill=COLOR_MUTED)

    # Card 3: Dia Mais Crítico
    c3_y = 925
    draw_rounded_rect(draw, (c_x, c3_y, c_x + card_w, c3_y + 355), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=2)
    draw_rounded_rect(draw, (c_x + 35, c3_y + 20, c_x + 380, c3_y + 60), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=12, width=2)
    draw.text((c_x + 207, c3_y + 40), "DIA MAIS CHUVOSO DO ANO", font=get_font(True, 20), fill=COLOR_ORANGE, anchor="mm")
    draw.text((c_x + 35, c3_y + 80), "02 / 10 / 2026", font=get_font(True, 64), fill=COLOR_WHITE)
    draw.text((c_x + 35, c3_y + 170), "Volume de até 84,3 mm em apenas 24 horas", font=get_font(True, 28), fill=COLOR_ORANGE)
    draw_rounded_rect(draw, (c_x + 35, c3_y + 225, c_x + card_w - 35, c3_y + 330), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=1)
    draw.text((c_x + 55, c3_y + 260), "• Frente fria costeira provocou o evento mais severo de 2026.", font=get_font(False, 24), fill=COLOR_WHITE)
    draw.text((c_x + 55, c3_y + 295), "• Vários bairros registraram acumulados acima de 50 mm.", font=get_font(False, 23), fill=COLOR_MUTED)

    draw_footer_feed(draw)
    return img

def render_feed_slide_3(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_feed(draw, 2)

    draw.text((1080 // 2, 135), "ONDE MAIS CHOVEU?", font=get_font(True, 46), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 178), "Ranking total de chuva acumulada em Outubro de 2026", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    stations = [
        {"name": "Rocha Leão (REBIO)", "val": 410.0, "rank": "1º • RECORDE", "color": COLOR_ORANGE, "sub": "Região rural retém nuvens pesadas"},
        {"name": "Cantagalo (LERIP)", "val": 191.7, "rank": "2º LUGAR", "color": COLOR_BLUE, "sub": "Zona rural com fortes pancadas"},
        {"name": "Praiamar / Sul", "val": 177.3, "rank": "3º LUGAR", "color": COLOR_BLUE, "sub": "Corredor costeiro de umidade"},
        {"name": "Tartaruga (Def. Civil)", "val": 167.9, "rank": "4º LUGAR", "color": COLOR_BLUE, "sub": "Estação costeira oficial do Centro"},
        {"name": "Costazul (Jacinto)", "val": 131.3, "rank": "5º LUGAR", "color": COLOR_BLUE, "sub": "Orla marítima (45% acima da média)"},
    ]

    start_y = 215
    row_h = 175
    max_val = 410.0

    for idx, st in enumerate(stations):
        y = start_y + idx * row_h
        draw_rounded_rect(draw, (65, y, 1080 - 65, y + 155), fill=COLOR_NAVY, outline=st["color"], radius=22, width=3 if idx == 0 else 2)
        
        # Name
        draw.text((95, y + 20), st["name"], font=get_font(True, 30), fill=COLOR_WHITE)

        # Rank pill
        rw = 210 if "RECORDE" in st["rank"] else 150
        draw_rounded_rect(draw, (1080 - 95 - rw, y + 16, 1080 - 95, y + 54), fill=COLOR_SUB_BG, outline=st["color"], radius=10, width=1)
        draw.text((1080 - 95 - rw // 2, y + 35), st["rank"], font=get_font(True, 18), fill=st["color"], anchor="mm")

        # Bar
        bar_y = y + 66
        bar_w = 1080 - 460
        draw_rounded_rect(draw, (95, bar_y, 95 + bar_w, bar_y + 22), fill=COLOR_TRACK, radius=11)
        fill_w = max(int(bar_w * (st["val"] / max_val)), 14)
        draw_rounded_rect(draw, (95, bar_y, 95 + fill_w, bar_y + 22), fill=st["color"], radius=11)

        # Value
        str_val = f"{st['val']:.1f}".replace('.', ',') + " mm"
        draw.text((1080 - 95, bar_y + 11), str_val, font=get_font(True, 34), fill=COLOR_WHITE, anchor="rm")
        
        # Sub
        draw.text((95, y + 115), f"• {st['sub']}", font=get_font(False, 22), fill=COLOR_MUTED)

    call_y = start_y + len(stations) * row_h + 15
    draw_rounded_rect(draw, (65, call_y, 1080 - 65, call_y + 155), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=22, width=2)
    draw.text((1080 // 2, call_y + 36), "DESTAQUE DA REGIÃO RURAL", font=get_font(True, 24), fill=COLOR_ORANGE, anchor="mm")
    draw.text((1080 // 2, call_y + 80), "Rocha Leão (410 mm) acumulou mais que o triplo de Costazul (131 mm),", font=get_font(False, 23), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, call_y + 116), "comprovando a forte retenção de umidade na região rural.", font=get_font(False, 22), fill=COLOR_MUTED, anchor="mm")

    draw_footer_feed(draw)
    return img

def render_feed_slide_4(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_feed(draw, 3)

    draw.text((1080 // 2, 135), "VENTOS & TEMPERATURAS", font=get_font(True, 46), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 178), "Os extremos de rajadas e variação térmica registrados", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    card_w = 950
    c_x = (1080 - card_w) // 2

    # Card 1: Vento
    c1_y = 215
    draw_rounded_rect(draw, (c_x, c1_y, c_x + card_w, c1_y + 490), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=3)
    draw_rounded_rect(draw, (c_x + 35, c1_y + 22, c_x + 360, c1_y + 64), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=12, width=2)
    draw.text((c_x + 197, c1_y + 43), "RECORDE DE VENTO", font=get_font(True, 20), fill=COLOR_ORANGE, anchor="mm")
    draw.text((c_x + 35, c1_y + 90), "62,3", font=get_font(True, 100), fill=COLOR_WHITE)
    draw.text((c_x + 310, c1_y + 140), "km/h", font=get_font(True, 46), fill=COLOR_ORANGE)
    draw.text((c_x + 35, c1_y + 225), "Praia da Tartaruga (26/10 às 10:00)", font=get_font(True, 30), fill=COLOR_WHITE)
    draw_rounded_rect(draw, (c_x + 35, c1_y + 285, c_x + card_w - 35, c1_y + 450), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
    draw.text((c_x + 55, c1_y + 338), "• Vento médio no mês: 16,6 km/h com direção Nordeste (NE).", font=get_font(False, 24), fill=COLOR_WHITE)
    draw.text((c_x + 55, c1_y + 395), "• Rajadas fortes acompanharam as passagens de frentes frias.", font=get_font(False, 23), fill=COLOR_MUTED)

    # Card 2: Temperatura
    c2_y = 735
    draw_rounded_rect(draw, (c_x, c2_y, c_x + card_w, c2_y + 535), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=24, width=2)
    draw_rounded_rect(draw, (c_x + 35, c2_y + 22, c_x + 360, c2_y + 64), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=12, width=2)
    draw.text((c_x + 197, c2_y + 43), "EXTREMOS TÉRMICOS", font=get_font(True, 20), fill=COLOR_BLUE, anchor="mm")

    box_half = (card_w - 95) // 2
    draw_rounded_rect(draw, (c_x + 35, c2_y + 90, c_x + 35 + box_half, c2_y + 265), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=18, width=2)
    draw.text((c_x + 60, c2_y + 120), "MÍNIMA ABSOLUTA", font=get_font(True, 19), fill=COLOR_BLUE)
    draw.text((c_x + 60, c2_y + 155), "18,4°C", font=get_font(True, 56), fill=COLOR_WHITE)
    draw.text((c_x + 60, c2_y + 225), "15/10 • Madrugada", font=get_font(False, 21), fill=COLOR_MUTED)

    bx2 = c_x + 35 + box_half + 25
    draw_rounded_rect(draw, (bx2, c2_y + 90, bx2 + box_half, c2_y + 265), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=18, width=2)
    draw.text((bx2 + 25, c2_y + 120), "MÁXIMA ABSOLUTA", font=get_font(True, 19), fill=COLOR_ORANGE)
    draw.text((bx2 + 25, c2_y + 155), "32,6°C", font=get_font(True, 56), fill=COLOR_WHITE)
    draw.text((bx2 + 25, c2_y + 225), "24/10 • Pré-frontal", font=get_font(False, 21), fill=COLOR_MUTED)

    draw_rounded_rect(draw, (c_x + 35, c2_y + 290, c_x + card_w - 35, c2_y + 495), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
    draw.text((c_x + 55, c2_y + 345), "• Amplitude térmica mensal atingiu 14,2°C entre os extremos.", font=get_font(False, 24), fill=COLOR_WHITE)
    draw.text((c_x + 55, c2_y + 415), "• Nebulosidade e chuvas constantes impediram ondas de calor extremo.", font=get_font(False, 23), fill=COLOR_MUTED)

    draw_footer_feed(draw)
    return img

def render_feed_slide_5(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_feed(draw, 4)

    draw.text((1080 // 2, 135), "O QUE COMANDOU O TEMPO?", font=get_font(True, 46), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 178), "Principais sistemas meteorológicos atuantes em Outubro", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    systems = [
        {"name": "Alta Subtropical do Atlântico Sul (ASAS)", "days": 12, "pct": "38,7%", "color": COLOR_ORANGE, "desc": "Garantia de sol e ventos constantes do quadrante Nordeste"},
        {"name": "Cavados Costeiros & Instabilidades", "days": 12, "pct": "38,7%", "color": COLOR_BLUE, "desc": "Áreas de baixa pressão e convergência causadoras de chuvas"},
        {"name": "Frentes Frias Atuantes", "days": 4, "pct": "12,9%", "color": COLOR_ORANGE, "desc": "Passagens frontais responsáveis pelas chuvas intensas"},
        {"name": "Circulação Marítima Pós-Frontal", "days": 3, "pct": "9,7%", "color": COLOR_BLUE, "desc": "Ventos marítimos do sul, tempo encoberto e chuviscos"}
    ]

    start_y = 220
    row_h = 215
    for idx, sys in enumerate(systems):
        y = start_y + idx * row_h
        draw_rounded_rect(draw, (65, y, 1080 - 65, y + 190), fill=COLOR_NAVY, outline=sys["color"], radius=22, width=2)
        draw.text((95, y + 22), sys["name"], font=get_font(True, 28), fill=COLOR_WHITE)

        dw = 200
        draw_rounded_rect(draw, (1080 - 95 - dw, y + 18, 1080 - 95, y + 58), fill=COLOR_SUB_BG, outline=sys["color"], radius=10, width=1)
        draw.text((1080 - 95 - dw // 2, y + 38), f"{sys['days']} DIAS ({sys['pct']})", font=get_font(True, 18), fill=sys["color"], anchor="mm")

        bar_y = y + 74
        bar_w = 1080 - 190
        draw_rounded_rect(draw, (95, bar_y, 95 + bar_w, bar_y + 22), fill=COLOR_TRACK, radius=11)
        draw_rounded_rect(draw, (95, bar_y, 95 + int(bar_w * (sys["days"] / 31)), bar_y + 22), fill=sys["color"], radius=11)

        draw.text((95, y + 130), f"• {sys['desc']}", font=get_font(False, 23), fill=COLOR_MUTED)

    sum_y = start_y + len(systems) * row_h + 20
    draw_rounded_rect(draw, (65, sum_y, 1080 - 65, sum_y + 160), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=22, width=2)
    draw.text((1080 // 2, sum_y + 36), "SÍNTESE METEOROLÓGICA", font=get_font(True, 24), fill=COLOR_ORANGE, anchor="mm")
    draw.text((1080 // 2, sum_y + 80), "O confronto frequente entre a massa de ar quente e as frentes oceânicas", font=get_font(False, 23), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, sum_y + 118), "fez de Outubro de 2026 o mês mais chuvoso do ano em Rio das Ostras.", font=get_font(False, 22), fill=COLOR_MUTED, anchor="mm")

    draw_footer_feed(draw)
    return img

def render_feed_slide_6(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_feed(draw, 5)

    draw.text((1080 // 2, 135), "ACOMPANHE O CLIMA DIARIAMENTE", font=get_font(True, 46), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 178), "Previsões diárias, alertas oficiais e monitoramento em tempo real", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    card_w = 950
    c_x = (1080 - card_w) // 2

    if full_card:
        tw = 950
        th = int(full_card.height * (tw / full_card.width))
        c_res = full_card.resize((tw, th), Image.Resampling.LANCZOS)
        cx = (1080 - tw) // 2
        cy = 215
        draw_rounded_rect(draw, (cx - 6, cy - 6, cx + tw + 6, cy + th + 6), fill=COLOR_ORANGE, radius=26)
        img.paste(c_res, (cx, cy), c_res)
        box_y = cy + th + 35
    else:
        box_y = 600

    box_h = 500
    draw_rounded_rect(draw, (c_x, box_y, c_x + card_w, box_y + box_h), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=24, width=2)
    draw.text((1080 // 2, box_y + 48), "O QUE VOCÊ ENCONTRA NA NOSSA PÁGINA:", font=get_font(True, 28), fill=COLOR_WHITE, anchor="mm")

    items = [
        ("• Previsões Diárias:", "Publicadas todas as manhãs com mapas locais."),
        ("• Alertas Oficiais:", "Avisos de tempestades, ventos fortes e ressacas."),
        ("• Chuva em Tempo Real:", "Acumulados atualizados de todas as estações municipais."),
        ("• Condições da Orla:", "Tábua de marés, temperatura da água e rajadas de vento.")
    ]

    for i, (b_title, b_desc) in enumerate(items):
        iy = box_y + 95 + i * 82
        draw_rounded_rect(draw, (c_x + 30, iy, c_x + card_w - 30, iy + 70), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=1)
        draw.text((c_x + 50, iy + 35), b_title, font=get_font(True, 23), fill=COLOR_ORANGE, anchor="lm")
        draw.text((c_x + 345, iy + 35), b_desc, font=get_font(False, 22), fill=COLOR_WHITE, anchor="lm")

    draw.line([(c_x + 40, box_y + 435), (c_x + card_w - 40, box_y + 435)], fill=COLOR_BLUE, width=2)
    draw.text((1080 // 2, box_y + 468), "Siga @tempoemriodasostras no Instagram e compartilhe!", font=get_font(True, 26), fill=COLOR_ORANGE, anchor="mm")

    draw_footer_feed(draw)
    return img

def main():
    print("--- GENERATING HIGH READABILITY SLIDES (STORIES & FEED) ---")
    bg_stories = create_base_background(1080, 1920)
    bg_feed = create_base_background(1080, 1350)

    dirs_stories = [
        "C:/Users/debor/.gemini/antigravity/scratch/clima-rio-das-ostras/public/carrossel/stories",
        "C:/Users/debor/.gemini/antigravity/scratch/clima-rio-das-ostras/public/carrossel",
        "C:/Users/debor/.gemini/antigravity/brain/1a2d4b0a-d847-461b-a23b-26c56d91d2df/carrossel/stories",
        "C:/Users/debor/.gemini/antigravity/brain/1a2d4b0a-d847-461b-a23b-26c56d91d2df/carrossel"
    ]
    dirs_feed = [
        "C:/Users/debor/.gemini/antigravity/scratch/clima-rio-das-ostras/public/carrossel/feed",
        "C:/Users/debor/.gemini/antigravity/brain/1a2d4b0a-d847-461b-a23b-26c56d91d2df/carrossel/feed"
    ]
    for d in dirs_stories + dirs_feed:
        os.makedirs(d, exist_ok=True)

    # 1. STORIES
    stories_funcs = [
        ("01_panorama_destaques.png", render_stories_slide_1),
        ("02_volume_total_chuva.png", render_stories_slide_2),
        ("03_ranking_estacoes.png", render_stories_slide_3),
        ("04_ventos_e_temperaturas.png", render_stories_slide_4),
        ("05_sistemas_meteorologicos.png", render_stories_slide_5),
        ("06_acompanhe_diariamente.png", render_stories_slide_6)
    ]
    print("\n[STORIES 9:16] Rendering with enhanced mobile font sizes...")
    for fname, func in stories_funcs:
        im = func(bg_stories)
        for d in dirs_stories:
            im.save(os.path.join(d, fname), format="PNG", optimize=True)
        print(f"Saved Stories: {fname}")

    # 2. FEED
    feed_funcs = [
        ("01_panorama_destaques.png", render_feed_slide_1),
        ("02_volume_total_chuva.png", render_feed_slide_2),
        ("03_ranking_estacoes.png", render_feed_slide_3),
        ("04_ventos_e_temperaturas.png", render_feed_slide_4),
        ("05_sistemas_meteorologicos.png", render_feed_slide_5),
        ("06_acompanhe_diariamente.png", render_feed_slide_6)
    ]
    print("\n[FEED 4:5] Rendering with enhanced mobile font sizes...")
    for fname, func in feed_funcs:
        im = func(bg_feed)
        for d in dirs_feed:
            im.save(os.path.join(d, fname), format="PNG", optimize=True)
        print(f"Saved Feed: {fname}")

    print("\nDone! All slides rendered with enlarged fonts and spacious layouts.")

if __name__ == "__main__":
    main()
