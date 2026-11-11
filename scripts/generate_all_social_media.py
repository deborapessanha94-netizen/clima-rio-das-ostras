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
COLOR_MUTED = (195, 208, 228)
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
    for _ in range(50):
        px = np.random.randint(0, width)
        py = np.random.randint(0, height)
        sz = np.random.randint(2, 5)
        al = np.random.randint(50, 160)
        draw.ellipse([px, py, px + sz, py + sz], fill=(COLOR_BLUE[0], COLOR_BLUE[1], COLOR_BLUE[2], al))
    return img

# ==============================================================================
# 1. GENERATE STORIES (1080 x 1920) - 9:16 VERTICAL
# ==============================================================================
def draw_header_stories(draw, current_scene_idx):
    top_y = 50
    draw.text((60, top_y + 12), "@tempoemriodasostras", font=get_font(True, 26), fill=COLOR_WHITE)
    
    badge_w = 230
    badge_h = 44
    badge_x = 1080 - 60 - badge_w
    badge_y = top_y + 2
    draw_rounded_rect(draw, (badge_x, badge_y, badge_x + badge_w, badge_y + badge_h), 
                      fill=(38, 28, 24), outline=COLOR_ORANGE, radius=12, width=2)
    draw.text((badge_x + badge_w // 2, badge_y + badge_h // 2), "OUTUBRO / 2026", font=get_font(True, 20), fill=COLOR_ORANGE, anchor="mm")
    
    draw.line([(60, top_y + 60), (1080 - 60, top_y + 60)], fill=COLOR_BLUE, width=1)

    step_y = top_y + 72
    total_steps = 6
    margin = 60
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

def draw_footer_stories(draw):
    draw.text((1080 // 2, 1920 - 50), "Fontes: Estações Meteorológicas do Município", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

def render_stories_slide_1(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_stories(draw, 0)

    if user_logo:
        lw = 460
        lh = int(user_logo.height * (lw / user_logo.width))
        resized = user_logo.resize((lw, lh), Image.Resampling.LANCZOS)
        img.paste(resized, ((1080 - lw) // 2, 160), resized)

    box_w = 960
    b_x = (1080 - box_w) // 2
    b_y = 480
    draw_rounded_rect(draw, (b_x, b_y, b_x + box_w, b_y + 300), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=32, width=3)
    draw.text((1080 // 2, b_y + 60), "RETROSPECTIVA DO CLIMA", font=get_font(True, 32), fill=COLOR_ORANGE, anchor="mm")
    draw.text((1080 // 2, b_y + 130), "OUTUBRO / 2026", font=get_font(True, 58), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, b_y + 200), "Consolidação Oficial de Rio das Ostras - RJ", font=get_font(False, 26), fill=COLOR_MUTED, anchor="mm")
    draw.text((1080 // 2, b_y + 245), "Chuva Total • Ventos • Extremos Térmicos", font=get_font(True, 24), fill=COLOR_BLUE, anchor="mm")

    cards = [
        {"tag": "VOLUME TOTAL MÁXIMO", "val": "410,0 mm", "sub": "Pico registrado na estação Rocha Leão", "color": COLOR_ORANGE},
        {"tag": "DIAS COM CHUVA", "val": "25 DIAS", "sub": "Choveu em 80% do mês na cidade", "color": COLOR_BLUE},
        {"tag": "MAIOR RAJADA DE VENTO", "val": "62,3 km/h", "sub": "Registrada na Praia da Tartaruga (26/10)", "color": COLOR_ORANGE}
    ]
    start_y = 820
    c_h = 290
    for idx, c in enumerate(cards):
        cy = start_y + idx * (c_h + 30)
        draw_rounded_rect(draw, (b_x, cy, b_x + box_w, cy + c_h), fill=COLOR_NAVY, outline=c["color"], radius=28, width=2)
        draw_rounded_rect(draw, (b_x + 40, cy + 28, b_x + 420, cy + 72), fill=COLOR_SUB_BG, outline=c["color"], radius=14, width=1)
        draw.text((b_x + 230, cy + 50), c["tag"], font=get_font(True, 20), fill=c["color"], anchor="mm")
        draw.text((b_x + 45, cy + 140), c["val"], font=get_font(True, 64), fill=COLOR_WHITE)
        draw.text((b_x + 45, cy + 225), f"• {c['sub']}", font=get_font(False, 24), fill=COLOR_MUTED)

    draw_footer_stories(draw)
    return img

def render_stories_slide_2(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_stories(draw, 1)

    draw.text((1080 // 2, 160), "VOLUME TOTAL DE CHUVA", font=get_font(True, 50), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 215), "Acumulado real e histórico registrado em Outubro de 2026", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    card_w = 960
    c_x = (1080 - card_w) // 2

    # Card 1
    c1_y = 260
    draw_rounded_rect(draw, (c_x, c1_y, c_x + card_w, c1_y + 420), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=28, width=3)
    draw_rounded_rect(draw, (c_x + 40, c1_y + 30, c_x + 380, c1_y + 75), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((c_x + 210, c1_y + 52), "RECORDE TOTAL DO MÊS", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")
    draw.text((c_x + 40, c1_y + 115), "410,0", font=get_font(True, 108), fill=COLOR_WHITE)
    draw.text((c_x + 360, c1_y + 165), "mm", font=get_font(True, 50), fill=COLOR_ORANGE)
    draw.text((c_x + 40, c1_y + 260), "Pico total registrado na estação Rocha Leão (Região Rural)", font=get_font(True, 28), fill=COLOR_WHITE)
    draw.text((c_x + 40, c1_y + 320), "• Acumulados no município variaram de 131,3 mm (orla) a 410,0 mm (interior).", font=get_font(False, 22), fill=COLOR_MUTED)
    draw.text((c_x + 40, c1_y + 365), "• Foi o mês mais chuvoso do ano em todas as estações municipais.", font=get_font(False, 22), fill=COLOR_MUTED)

    # Card 2
    c2_y = 720
    draw_rounded_rect(draw, (c_x, c2_y, c_x + card_w, c2_y + 430), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=2)
    draw_rounded_rect(draw, (c_x + 40, c2_y + 30, c_x + 380, c2_y + 75), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=2)
    draw.text((c_x + 210, c2_y + 52), "DIAS COM CHUVA NA CIDADE", font=get_font(True, 22), fill=COLOR_BLUE, anchor="mm")
    draw.text((c_x + 40, c2_y + 115), "25 DIAS", font=get_font(True, 96), fill=COLOR_WHITE)
    draw.text((c_x + 40, c2_y + 235), "Choveu em 8 de cada 10 dias em Rio das Ostras", font=get_font(True, 28), fill=COLOR_BLUE)
    bar_y = c2_y + 295
    bar_w = card_w - 80
    draw_rounded_rect(draw, (c_x + 40, bar_y, c_x + 40 + bar_w, bar_y + 26), fill=COLOR_TRACK, radius=13)
    draw_rounded_rect(draw, (c_x + 40, bar_y, c_x + 40 + int(bar_w * (25 / 31)), bar_y + 26), fill=COLOR_BLUE, radius=13)
    draw.text((c_x + 40, c2_y + 355), "• A frequência contínua manteve o solo encharcado durante quase todo o mês.", font=get_font(False, 22), fill=COLOR_MUTED)

    # Card 3
    c3_y = 1190
    draw_rounded_rect(draw, (c_x, c3_y, c_x + card_w, c3_y + 440), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=28, width=2)
    draw_rounded_rect(draw, (c_x + 40, c3_y + 30, c_x + 380, c3_y + 75), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((c_x + 210, c3_y + 52), "DIA MAIS CHUVOSO DO ANO", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")
    draw.text((c_x + 40, c3_y + 115), "02 / 10 / 2026", font=get_font(True, 68), fill=COLOR_WHITE)
    draw.text((c_x + 40, c2_y + 205 + 470), "Volume de até 84,3 mm em apenas 24 horas", font=get_font(True, 28), fill=COLOR_ORANGE)
    draw_rounded_rect(draw, (c_x + 40, c3_y + 265, c_x + card_w - 40, c3_y + 395), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
    draw.text((c_x + 65, c3_y + 305), "• Frente fria costeira provocou o evento de chuva mais concentrado de 2026.", font=get_font(False, 22), fill=COLOR_WHITE)
    draw.text((c_x + 65, c3_y + 350), "• Vários bairros registraram acumulados acima de 50 mm no mesmo dia.", font=get_font(False, 21), fill=COLOR_MUTED)

    draw_footer_stories(draw)
    return img

def render_stories_slide_3(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_stories(draw, 2)

    draw.text((1080 // 2, 160), "ONDE MAIS CHOVEU?", font=get_font(True, 50), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 215), "Ranking total de chuva acumulada em Outubro de 2026", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    stations = [
        {"name": "Rocha Leão (REBIO União)", "val": 410.0, "rank": "1º • RECORDE", "color": COLOR_ORANGE, "sub": "Região rural e reserva biológica retiveram nuvens pesadas"},
        {"name": "Cantagalo (LERIP)", "val": 191.7, "rank": "2º LUGAR", "color": COLOR_BLUE, "sub": "Zona rural com fortes pancadas de primavera"},
        {"name": "Praiamar / Divisa Sul", "val": 177.3, "rank": "3º LUGAR", "color": COLOR_BLUE, "sub": "Corredor costeiro de entrada de umidade"},
        {"name": "Praia da Tartaruga (Defesa Civil)", "val": 167.9, "rank": "4º LUGAR", "color": COLOR_BLUE, "sub": "Estação costeira oficial do Centro"},
        {"name": "Costazul (Escola Jacinto)", "val": 131.3, "rank": "5º LUGAR", "color": COLOR_BLUE, "sub": "Orla marítima (ainda assim 45% acima do normal)"},
    ]

    start_y = 270
    row_h = 220
    max_val = 410.0

    for idx, st in enumerate(stations):
        y = start_y + idx * row_h
        draw_rounded_rect(draw, (60, y, 1080 - 60, y + 195), fill=COLOR_NAVY, outline=st["color"], radius=24, width=3 if idx == 0 else 2)
        draw.text((95, y + 25), st["name"], font=get_font(True, 30), fill=COLOR_WHITE)

        rw = 210 if "RECORDE" in st["rank"] else 150
        draw_rounded_rect(draw, (1080 - 95 - rw, y + 22, 1080 - 95, y + 58), fill=COLOR_SUB_BG, outline=st["color"], radius=12, width=1)
        draw.text((1080 - 95 - rw // 2, y + 40), st["rank"], font=get_font(True, 18), fill=st["color"], anchor="mm")

        bar_y = y + 78
        bar_w = 1080 - 480
        draw_rounded_rect(draw, (95, bar_y, 95 + bar_w, bar_y + 24), fill=COLOR_TRACK, radius=12)
        fill_w = max(int(bar_w * (st["val"] / max_val)), 14)
        draw_rounded_rect(draw, (95, bar_y, 95 + fill_w, bar_y + 24), fill=st["color"], radius=12)

        str_val = f"{st['val']:.1f}".replace('.', ',') + " mm"
        draw.text((1080 - 95, bar_y + 12), str_val, font=get_font(True, 36), fill=COLOR_WHITE, anchor="rm")
        draw.text((95, y + 142), f"• {st['sub']}", font=get_font(False, 22), fill=COLOR_MUTED)

    call_y = start_y + len(stations) * row_h + 25
    draw_rounded_rect(draw, (60, call_y, 1080 - 60, call_y + 140), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=2)
    draw.text((1080 // 2, call_y + 40), "DESTAQUE DA REGIÃO RURAL", font=get_font(True, 24), fill=COLOR_ORANGE, anchor="mm")
    draw.text((1080 // 2, call_y + 85), "Rocha Leão (410 mm) acumulou mais que o triplo de Costazul (131 mm),", font=get_font(False, 22), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, call_y + 115), "comprovando a forte retenção de umidade na região rural.", font=get_font(False, 20), fill=COLOR_MUTED, anchor="mm")

    draw_footer_stories(draw)
    return img

def render_stories_slide_4(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_stories(draw, 3)

    draw.text((1080 // 2, 160), "VENTOS & TEMPERATURAS", font=get_font(True, 50), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 215), "Os extremos de rajadas e variação térmica registrados", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    card_w = 960
    c_x = (1080 - card_w) // 2

    c1_y = 260
    draw_rounded_rect(draw, (c_x, c1_y, c_x + card_w, c1_y + 480), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=28, width=3)
    draw_rounded_rect(draw, (c_x + 40, c1_y + 28, c_x + 360, c1_y + 72), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=14, width=2)
    draw.text((c_x + 200, c1_y + 50), "RECORDE DE VENTO", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")
    draw.text((c_x + 40, c1_y + 110), "62,3", font=get_font(True, 112), fill=COLOR_WHITE)
    draw.text((c_x + 330, c1_y + 165), "km/h", font=get_font(True, 48), fill=COLOR_ORANGE)
    draw.text((c_x + 40, c1_y + 250), "Praia da Tartaruga (26/10 às 10:00)", font=get_font(True, 30), fill=COLOR_WHITE)
    draw_rounded_rect(draw, (c_x + 40, c1_y + 305, c_x + card_w - 40, c1_y + 440), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
    draw.text((c_x + 65, c1_y + 345), "• Vento médio no mês: 16,6 km/h com direção Nordeste (NE).", font=get_font(False, 22), fill=COLOR_WHITE)
    draw.text((c_x + 65, c1_y + 395), "• Rajadas fortes acompanharam a passagem de frentes frias no litoral.", font=get_font(False, 21), fill=COLOR_MUTED)

    c2_y = 800
    draw_rounded_rect(draw, (c_x, c2_y, c_x + card_w, c2_y + 500), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=2)
    draw_rounded_rect(draw, (c_x + 40, c2_y + 28, c_x + 380, c2_y + 72), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=2)
    draw.text((c_x + 210, c2_y + 50), "EXTREMOS TÉRMICOS", font=get_font(True, 22), fill=COLOR_BLUE, anchor="mm")

    box_half = (card_w - 110) // 2
    draw_rounded_rect(draw, (c_x + 40, c2_y + 110, c_x + 40 + box_half, c2_y + 265), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=20, width=1)
    draw.text((c_x + 65, c2_y + 140), "MÍNIMA ABSOLUTA", font=get_font(True, 18), fill=COLOR_BLUE)
    draw.text((c_x + 65, c2_y + 175), "18,4°C", font=get_font(True, 56), fill=COLOR_WHITE)
    draw.text((c_x + 65, c2_y + 235), "15/10 • Madrugada fria", font=get_font(False, 19), fill=COLOR_MUTED)

    bx2 = c_x + 40 + box_half + 30
    draw_rounded_rect(draw, (bx2, c2_y + 110, bx2 + box_half, c2_y + 265), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=20, width=1)
    draw.text((bx2 + 25, c2_y + 140), "MÁXIMA ABSOLUTA", font=get_font(True, 18), fill=COLOR_ORANGE)
    draw.text((bx2 + 25, c2_y + 175), "32,6°C", font=get_font(True, 56), fill=COLOR_WHITE)
    draw.text((bx2 + 25, c2_y + 235), "24/10 • Pré-frontal", font=get_font(False, 19), fill=COLOR_MUTED)

    draw_rounded_rect(draw, (c_x + 40, c2_y + 295, c_x + card_w - 40, c2_y + 460), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
    draw.text((c_x + 65, c2_y + 340), "• Amplitude térmica mensal atingiu 14,2°C entre os extremos.", font=get_font(False, 22), fill=COLOR_WHITE)
    draw.text((c_x + 65, c2_y + 390), "• A nebulosidade e umidade contínuas barraram ondas de calor intenso.", font=get_font(False, 21), fill=COLOR_MUTED)

    draw_footer_stories(draw)
    return img

def render_stories_slide_5(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_stories(draw, 4)

    draw.text((1080 // 2, 160), "O QUE COMANDOU O TEMPO?", font=get_font(True, 50), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 215), "Principais sistemas meteorológicos atuantes em Outubro", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    systems = [
        {"name": "Alta Subtropical do Atlântico Sul (ASAS)", "days": 12, "pct": "38,7%", "color": COLOR_ORANGE, "desc": "Garantia de sol e ventos constantes do quadrante Nordeste"},
        {"name": "Cavados Costeiros / Instabilidades", "days": 8, "pct": "25,8%", "color": COLOR_BLUE, "desc": "Áreas de baixa pressão causadoras de pancadas fortes"},
        {"name": "Cavados com Convergência de Umidade", "days": 4, "pct": "12,9%", "color": COLOR_BLUE, "desc": "Alinhamento de umidade do interior para a costa"},
        {"name": "Frentes Frias Atuantes", "days": 4, "pct": "12,9%", "color": COLOR_ORANGE, "desc": "Passagens frontais responsáveis pelas chuvas intensas"},
        {"name": "Circulação Marítima Pós-Frontal", "days": 3, "pct": "9,7%", "color": COLOR_BLUE, "desc": "Ventos marítimos do sul, céu nublado e chuva fraca/chuviscos"}
    ]

    start_y = 265
    row_h = 195
    for idx, sys in enumerate(systems):
        y = start_y + idx * row_h
        draw_rounded_rect(draw, (60, y, 1080 - 60, y + 175), fill=COLOR_NAVY, outline=sys["color"], radius=22, width=2)
        draw.text((95, y + 25), sys["name"], font=get_font(True, 26), fill=COLOR_WHITE)

        dw = 175
        draw_rounded_rect(draw, (1080 - 95 - dw, y + 20, 1080 - 95, y + 56), fill=COLOR_SUB_BG, outline=sys["color"], radius=12, width=1)
        draw.text((1080 - 95 - dw // 2, y + 38), f"{sys['days']} DIAS ({sys['pct']})", font=get_font(True, 16), fill=sys["color"], anchor="mm")

        bar_y = y + 74
        bar_w = 1080 - 190
        draw_rounded_rect(draw, (95, bar_y, 95 + bar_w, bar_y + 20), fill=COLOR_TRACK, radius=10)
        draw_rounded_rect(draw, (95, bar_y, 95 + int(bar_w * (sys["days"] / 31)), bar_y + 20), fill=sys["color"], radius=10)

        draw.text((95, y + 128), f"• {sys['desc']}", font=get_font(False, 21), fill=COLOR_MUTED)

    sum_y = start_y + len(systems) * row_h + 20
    draw_rounded_rect(draw, (60, sum_y, 1080 - 60, sum_y + 140), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=2)
    draw.text((1080 // 2, sum_y + 40), "SÍNTESE METEOROLÓGICA", font=get_font(True, 24), fill=COLOR_ORANGE, anchor="mm")
    draw.text((1080 // 2, sum_y + 85), "O confronto frequente entre a massa de ar quente e as frentes oceânicas", font=get_font(False, 22), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, sum_y + 115), "fez de Outubro de 2026 um dos meses mais chuvosos e dinâmicos dos últimos anos.", font=get_font(False, 20), fill=COLOR_MUTED, anchor="mm")

    draw_footer_stories(draw)
    return img

def render_stories_slide_6(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_stories(draw, 5)

    draw.text((1080 // 2, 160), "ACOMPANHE O CLIMA DIARIAMENTE", font=get_font(True, 50), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 215), "Previsões diárias, alertas oficiais e monitoramento em tempo real", font=get_font(False, 24), fill=COLOR_MUTED, anchor="mm")

    card_w = 960
    c_x = (1080 - card_w) // 2

    if full_card:
        tw = 960
        th = int(full_card.height * (tw / full_card.width))
        c_res = full_card.resize((tw, th), Image.Resampling.LANCZOS)
        cx = (1080 - tw) // 2
        cy = 280
        draw_rounded_rect(draw, (cx - 8, cy - 8, cx + tw + 8, cy + th + 8), fill=COLOR_ORANGE, radius=32)
        img.paste(c_res, (cx, cy), c_res)
        box_y = cy + th + 45
    else:
        box_y = 800

    box_h = 580
    draw_rounded_rect(draw, (c_x, box_y, c_x + card_w, box_y + box_h), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=28, width=2)
    draw.text((1080 // 2, box_y + 60), "O QUE VOCÊ ENCONTRA NA NOSSA PÁGINA:", font=get_font(True, 32), fill=COLOR_WHITE, anchor="mm")

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
    draw.text((1080 // 2, box_y + 545), "Siga @tempoemriodasostras no Instagram e compartilhe!", font=get_font(True, 28), fill=COLOR_ORANGE, anchor="mm")

    draw_footer_stories(draw)
    return img

# ==============================================================================
# 2. GENERATE FEED POST / CARROSSEL (1080 x 1350) - 4:5 PORTRAIT RATIO
# ==============================================================================
def draw_header_feed(draw, current_scene_idx):
    top_y = 35
    draw.text((60, top_y + 10), "@tempoemriodasostras", font=get_font(True, 24), fill=COLOR_WHITE)

    badge_w = 210
    badge_h = 38
    bx = 1080 - 60 - badge_w
    by = top_y + 2
    draw_rounded_rect(draw, (bx, by, bx + badge_w, by + badge_h), fill=(38, 28, 24), outline=COLOR_ORANGE, radius=10, width=2)
    draw.text((bx + badge_w // 2, by + badge_h // 2), "OUTUBRO / 2026", font=get_font(True, 18), fill=COLOR_ORANGE, anchor="mm")

    draw.line([(60, top_y + 52), (1080 - 60, top_y + 52)], fill=COLOR_BLUE, width=1)

    step_y = top_y + 64
    total_steps = 6
    margin = 60
    avail_w = 1080 - 2 * margin
    step_gap = 10
    step_w = (avail_w - (total_steps - 1) * step_gap) / total_steps
    step_h = 5

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
    draw.text((1080 // 2, 1350 - 32), "Fontes: Estações Meteorológicas do Município", font=get_font(False, 20), fill=COLOR_MUTED, anchor="mm")

def render_feed_slide_1(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_feed(draw, 0)

    if user_logo:
        lw = 320
        lh = int(user_logo.height * (lw / user_logo.width))
        resized = user_logo.resize((lw, lh), Image.Resampling.LANCZOS)
        img.paste(resized, ((1080 - lw) // 2, 125), resized)

    box_w = 960
    b_x = (1080 - box_w) // 2
    b_y = 360
    draw_rounded_rect(draw, (b_x, b_y, b_x + box_w, b_y + 200), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=3)
    draw.text((1080 // 2, b_y + 40), "RETROSPECTIVA DO CLIMA", font=get_font(True, 26), fill=COLOR_ORANGE, anchor="mm")
    draw.text((1080 // 2, b_y + 90), "OUTUBRO / 2026", font=get_font(True, 48), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, b_y + 145), "Consolidação Oficial de Rio das Ostras - RJ", font=get_font(False, 22), fill=COLOR_MUTED, anchor="mm")

    cards = [
        {"tag": "VOLUME TOTAL MÁXIMO", "val": "410,0 mm", "sub": "Pico registrado em Rocha Leão (Região Rural)", "color": COLOR_ORANGE},
        {"tag": "DIAS COM CHUVA", "val": "25 DIAS", "sub": "Choveu em 80% do mês no município", "color": COLOR_BLUE},
        {"tag": "MAIOR RAJADA DE VENTO", "val": "62,3 km/h", "sub": "Praia da Tartaruga (26/10 às 10:00)", "color": COLOR_ORANGE}
    ]
    start_y = 590
    c_h = 210
    for idx, c in enumerate(cards):
        cy = start_y + idx * (c_h + 20)
        draw_rounded_rect(draw, (b_x, cy, b_x + box_w, cy + c_h), fill=COLOR_NAVY, outline=c["color"], radius=22, width=2)
        draw_rounded_rect(draw, (b_x + 35, cy + 20, b_x + 380, cy + 56), fill=COLOR_SUB_BG, outline=c["color"], radius=12, width=1)
        draw.text((b_x + 207, cy + 38), c["tag"], font=get_font(True, 18), fill=c["color"], anchor="mm")
        draw.text((b_x + 40, cy + 95), c["val"], font=get_font(True, 52), fill=COLOR_WHITE)
        draw.text((b_x + 40, cy + 165), f"• {c['sub']}", font=get_font(False, 20), fill=COLOR_MUTED)

    draw_footer_feed(draw)
    return img

def render_feed_slide_2(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_feed(draw, 1)

    draw.text((1080 // 2, 135), "VOLUME TOTAL DE CHUVA", font=get_font(True, 42), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 180), "Acumulado real e histórico registrado em Outubro de 2026", font=get_font(False, 21), fill=COLOR_MUTED, anchor="mm")

    card_w = 960
    c_x = (1080 - card_w) // 2

    # Card 1
    c1_y = 215
    draw_rounded_rect(draw, (c_x, c1_y, c_x + card_w, c1_y + 325), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=3)
    draw_rounded_rect(draw, (c_x + 35, c1_y + 22, c_x + 350, c1_y + 58), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=12, width=2)
    draw.text((c_x + 192, c1_y + 40), "RECORDE TOTAL DO MÊS", font=get_font(True, 19), fill=COLOR_ORANGE, anchor="mm")
    draw.text((c_x + 35, c1_y + 80), "410,0", font=get_font(True, 84), fill=COLOR_WHITE)
    draw.text((c_x + 285, c1_y + 120), "mm", font=get_font(True, 40), fill=COLOR_ORANGE)
    draw.text((c_x + 35, c1_y + 200), "Pico total registrado na estação Rocha Leão (Região Rural)", font=get_font(True, 24), fill=COLOR_WHITE)
    draw.text((c_x + 35, c1_y + 245), "• Acumulados no município variaram de 131,3 mm (orla) a 410,0 mm (interior).", font=get_font(False, 19), fill=COLOR_MUTED)
    draw.text((c_x + 35, c1_y + 280), "• Foi o mês mais chuvoso do ano em todas as estações municipais.", font=get_font(False, 19), fill=COLOR_MUTED)

    # Card 2
    c2_y = 565
    draw_rounded_rect(draw, (c_x, c2_y, c_x + card_w, c2_y + 335), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=24, width=2)
    draw_rounded_rect(draw, (c_x + 35, c2_y + 22, c_x + 350, c2_y + 58), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=12, width=2)
    draw.text((c_x + 192, c2_y + 40), "DIAS COM CHUVA NA CIDADE", font=get_font(True, 19), fill=COLOR_BLUE, anchor="mm")
    draw.text((c_x + 35, c2_y + 80), "25 DIAS", font=get_font(True, 76), fill=COLOR_WHITE)
    draw.text((c_x + 35, c2_y + 185), "Choveu em 8 de cada 10 dias em Rio das Ostras", font=get_font(True, 24), fill=COLOR_BLUE)
    bar_y = c2_y + 235
    bar_w = card_w - 70
    draw_rounded_rect(draw, (c_x + 35, bar_y, c_x + 35 + bar_w, bar_y + 22), fill=COLOR_TRACK, radius=11)
    draw_rounded_rect(draw, (c_x + 35, bar_y, c_x + 35 + int(bar_w * (25 / 31)), bar_y + 22), fill=COLOR_BLUE, radius=11)
    draw.text((c_x + 35, c2_y + 285), "• A frequência contínua manteve o solo encharcado durante quase todo o mês.", font=get_font(False, 19), fill=COLOR_MUTED)

    # Card 3
    c3_y = 925
    draw_rounded_rect(draw, (c_x, c3_y, c_x + card_w, c3_y + 355), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=2)
    draw_rounded_rect(draw, (c_x + 35, c3_y + 22, c_x + 350, c3_y + 58), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=12, width=2)
    draw.text((c_x + 192, c3_y + 40), "DIA MAIS CHUVOSO DO ANO", font=get_font(True, 19), fill=COLOR_ORANGE, anchor="mm")
    draw.text((c_x + 35, c3_y + 80), "02 / 10 / 2026", font=get_font(True, 60), fill=COLOR_WHITE)
    draw.text((c_x + 35, c3_y + 165), "Volume de até 84,3 mm em apenas 24 horas", font=get_font(True, 24), fill=COLOR_ORANGE)
    draw_rounded_rect(draw, (c_x + 35, c3_y + 215, c_x + card_w - 35, c3_y + 325), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=1)
    draw.text((c_x + 55, c3_y + 248), "• Frente fria costeira provocou o evento mais concentrado de 2026.", font=get_font(False, 19), fill=COLOR_WHITE)
    draw.text((c_x + 55, c3_y + 285), "• Vários bairros registraram acumulados acima de 50 mm no mesmo dia.", font=get_font(False, 18), fill=COLOR_MUTED)

    draw_footer_feed(draw)
    return img

def render_feed_slide_3(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_feed(draw, 2)

    draw.text((1080 // 2, 135), "ONDE MAIS CHOVEU?", font=get_font(True, 42), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 175), "Ranking total de chuva acumulada em Outubro de 2026", font=get_font(False, 21), fill=COLOR_MUTED, anchor="mm")

    stations = [
        {"name": "Rocha Leão (REBIO União)", "val": 410.0, "rank": "1º • RECORDE", "color": COLOR_ORANGE, "sub": "Região rural e reserva biológica retiveram nuvens pesadas"},
        {"name": "Cantagalo (LERIP)", "val": 191.7, "rank": "2º LUGAR", "color": COLOR_BLUE, "sub": "Zona rural com fortes pancadas de primavera"},
        {"name": "Praiamar / Divisa Sul", "val": 177.3, "rank": "3º LUGAR", "color": COLOR_BLUE, "sub": "Corredor costeiro de entrada de umidade"},
        {"name": "Praia da Tartaruga (Defesa Civil)", "val": 167.9, "rank": "4º LUGAR", "color": COLOR_BLUE, "sub": "Estação costeira oficial do Centro"},
        {"name": "Costazul (Escola Jacinto)", "val": 131.3, "rank": "5º LUGAR", "color": COLOR_BLUE, "sub": "Orla marítima (ainda assim 45% acima do normal)"},
    ]

    start_y = 215
    row_h = 175
    max_val = 410.0

    for idx, st in enumerate(stations):
        y = start_y + idx * row_h
        draw_rounded_rect(draw, (60, y, 1080 - 60, y + 155), fill=COLOR_NAVY, outline=st["color"], radius=20, width=3 if idx == 0 else 2)
        draw.text((90, y + 18), st["name"], font=get_font(True, 26), fill=COLOR_WHITE)

        rw = 190 if "RECORDE" in st["rank"] else 135
        draw_rounded_rect(draw, (1080 - 90 - rw, y + 16, 1080 - 90, y + 48), fill=COLOR_SUB_BG, outline=st["color"], radius=10, width=1)
        draw.text((1080 - 90 - rw // 2, y + 32), st["rank"], font=get_font(True, 16), fill=st["color"], anchor="mm")

        bar_y = y + 62
        bar_w = 1080 - 450
        draw_rounded_rect(draw, (90, bar_y, 90 + bar_w, bar_y + 20), fill=COLOR_TRACK, radius=10)
        fill_w = max(int(bar_w * (st["val"] / max_val)), 12)
        draw_rounded_rect(draw, (90, bar_y, 90 + fill_w, bar_y + 20), fill=st["color"], radius=10)

        str_val = f"{st['val']:.1f}".replace('.', ',') + " mm"
        draw.text((1080 - 90, bar_y + 10), str_val, font=get_font(True, 30), fill=COLOR_WHITE, anchor="rm")
        draw.text((90, y + 112), f"• {st['sub']}", font=get_font(False, 19), fill=COLOR_MUTED)

    call_y = start_y + len(stations) * row_h + 15
    draw_rounded_rect(draw, (60, call_y, 1080 - 60, call_y + 155), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=22, width=2)
    draw.text((1080 // 2, call_y + 36), "DESTAQUE DA REGIÃO RURAL", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")
    draw.text((1080 // 2, call_y + 78), "Rocha Leão (410 mm) acumulou mais que o triplo de Costazul (131 mm),", font=get_font(False, 20), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, call_y + 112), "comprovando a forte retenção de umidade na região rural.", font=get_font(False, 19), fill=COLOR_MUTED, anchor="mm")

    draw_footer_feed(draw)
    return img

def render_feed_slide_4(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_feed(draw, 3)

    draw.text((1080 // 2, 135), "VENTOS & TEMPERATURAS", font=get_font(True, 42), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 175), "Os extremos de rajadas e variação térmica registrados", font=get_font(False, 21), fill=COLOR_MUTED, anchor="mm")

    card_w = 960
    c_x = (1080 - card_w) // 2

    c1_y = 215
    draw_rounded_rect(draw, (c_x, c1_y, c_x + card_w, c1_y + 490), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=24, width=3)
    draw_rounded_rect(draw, (c_x + 35, c1_y + 22, c_x + 330, c1_y + 58), fill=(45, 28, 18), outline=COLOR_ORANGE, radius=12, width=2)
    draw.text((c_x + 182, c1_y + 40), "RECORDE DE VENTO", font=get_font(True, 19), fill=COLOR_ORANGE, anchor="mm")
    draw.text((c_x + 35, c1_y + 90), "62,3", font=get_font(True, 96), fill=COLOR_WHITE)
    draw.text((c_x + 290, c1_y + 140), "km/h", font=get_font(True, 42), fill=COLOR_ORANGE)
    draw.text((c_x + 35, c1_y + 225), "Praia da Tartaruga (26/10 às 10:00)", font=get_font(True, 26), fill=COLOR_WHITE)
    draw_rounded_rect(draw, (c_x + 35, c1_y + 285, c_x + card_w - 35, c1_y + 450), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
    draw.text((c_x + 55, c1_y + 335), "• Vento médio no mês: 16,6 km/h com direção Nordeste (NE).", font=get_font(False, 20), fill=COLOR_WHITE)
    draw.text((c_x + 55, c1_y + 395), "• Rajadas fortes acompanharam a passagem de frentes frias no litoral.", font=get_font(False, 19), fill=COLOR_MUTED)

    c2_y = 735
    draw_rounded_rect(draw, (c_x, c2_y, c_x + card_w, c2_y + 535), fill=COLOR_NAVY, outline=COLOR_BLUE, radius=24, width=2)
    draw_rounded_rect(draw, (c_x + 35, c2_y + 22, c_x + 340, c2_y + 58), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=12, width=2)
    draw.text((c_x + 187, c2_y + 40), "EXTREMOS TÉRMICOS", font=get_font(True, 19), fill=COLOR_BLUE, anchor="mm")

    box_half = (card_w - 95) // 2
    draw_rounded_rect(draw, (c_x + 35, c2_y + 90, c_x + 35 + box_half, c2_y + 260), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=18, width=1)
    draw.text((c_x + 55, c2_y + 120), "MÍNIMA ABSOLUTA", font=get_font(True, 17), fill=COLOR_BLUE)
    draw.text((c_x + 55, c2_y + 155), "18,4°C", font=get_font(True, 50), fill=COLOR_WHITE)
    draw.text((c_x + 55, c2_y + 225), "15/10 • Madrugada fria", font=get_font(False, 17), fill=COLOR_MUTED)

    bx2 = c_x + 35 + box_half + 25
    draw_rounded_rect(draw, (bx2, c2_y + 90, bx2 + box_half, c2_y + 260), fill=COLOR_SUB_BG, outline=COLOR_ORANGE, radius=18, width=1)
    draw.text((bx2 + 20, c2_y + 120), "MÁXIMA ABSOLUTA", font=get_font(True, 17), fill=COLOR_ORANGE)
    draw.text((bx2 + 20, c2_y + 155), "32,6°C", font=get_font(True, 50), fill=COLOR_WHITE)
    draw.text((bx2 + 20, c2_y + 225), "24/10 • Pré-frontal", font=get_font(False, 17), fill=COLOR_MUTED)

    draw_rounded_rect(draw, (c_x + 35, c2_y + 285, c_x + card_w - 35, c2_y + 495), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=16, width=1)
    draw.text((c_x + 55, c2_y + 340), "• Amplitude térmica mensal atingiu 14,2°C entre os extremos.", font=get_font(False, 20), fill=COLOR_WHITE)
    draw.text((c_x + 55, c2_y + 410), "• A nebulosidade e umidade contínuas barraram ondas de calor intenso.", font=get_font(False, 19), fill=COLOR_MUTED)

    draw_footer_feed(draw)
    return img

def render_feed_slide_5(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_feed(draw, 4)

    draw.text((1080 // 2, 135), "O QUE COMANDOU O TEMPO?", font=get_font(True, 42), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 175), "Principais sistemas meteorológicos atuantes em Outubro", font=get_font(False, 21), fill=COLOR_MUTED, anchor="mm")

    systems = [
        {"name": "Alta Subtropical do Atlântico Sul (ASAS)", "days": 12, "pct": "38,7%", "color": COLOR_ORANGE, "desc": "Garantia de sol e ventos constantes do quadrante Nordeste"},
        {"name": "Cavados Costeiros / Instabilidades", "days": 8, "pct": "25,8%", "color": COLOR_BLUE, "desc": "Áreas de baixa pressão causadoras de pancadas fortes"},
        {"name": "Cavados com Convergência de Umidade", "days": 4, "pct": "12,9%", "color": COLOR_BLUE, "desc": "Alinhamento de umidade do interior para a costa"},
        {"name": "Frentes Frias Atuantes", "days": 4, "pct": "12,9%", "color": COLOR_ORANGE, "desc": "Passagens frontais responsáveis pelas chuvas intensas"},
        {"name": "Circulação Marítima Pós-Frontal", "days": 3, "pct": "9,7%", "color": COLOR_BLUE, "desc": "Ventos marítimos do sul, céu nublado e chuva fraca"}
    ]

    start_y = 215
    row_h = 175
    for idx, sys in enumerate(systems):
        y = start_y + idx * row_h
        draw_rounded_rect(draw, (60, y, 1080 - 60, y + 155), fill=COLOR_NAVY, outline=sys["color"], radius=20, width=2)
        draw.text((90, y + 18), sys["name"], font=get_font(True, 24), fill=COLOR_WHITE)

        dw = 165
        draw_rounded_rect(draw, (1080 - 90 - dw, y + 16, 1080 - 90, y + 48), fill=COLOR_SUB_BG, outline=sys["color"], radius=10, width=1)
        draw.text((1080 - 90 - dw // 2, y + 32), f"{sys['days']} DIAS ({sys['pct']})", font=get_font(True, 15), fill=sys["color"], anchor="mm")

        bar_y = y + 62
        bar_w = 1080 - 180
        draw_rounded_rect(draw, (90, bar_y, 90 + bar_w, bar_y + 18), fill=COLOR_TRACK, radius=9)
        draw_rounded_rect(draw, (90, bar_y, 90 + int(bar_w * (sys["days"] / 31)), bar_y + 18), fill=sys["color"], radius=9)

        draw.text((90, y + 108), f"• {sys['desc']}", font=get_font(False, 19), fill=COLOR_MUTED)

    sum_y = start_y + len(systems) * row_h + 15
    draw_rounded_rect(draw, (60, sum_y, 1080 - 60, sum_y + 155), fill=COLOR_NAVY, outline=COLOR_ORANGE, radius=22, width=2)
    draw.text((1080 // 2, sum_y + 36), "SÍNTESE METEOROLÓGICA", font=get_font(True, 22), fill=COLOR_ORANGE, anchor="mm")
    draw.text((1080 // 2, sum_y + 78), "O confronto frequente entre a massa de ar quente e as frentes oceânicas", font=get_font(False, 20), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, sum_y + 112), "fez de Outubro de 2026 um dos meses mais chuvosos e dinâmicos dos últimos anos.", font=get_font(False, 18), fill=COLOR_MUTED, anchor="mm")

    draw_footer_feed(draw)
    return img

def render_feed_slide_6(bg):
    img = bg.copy()
    draw = ImageDraw.Draw(img)
    draw_header_feed(draw, 5)

    draw.text((1080 // 2, 135), "ACOMPANHE O CLIMA DIARIAMENTE", font=get_font(True, 42), fill=COLOR_WHITE, anchor="mm")
    draw.text((1080 // 2, 175), "Previsões diárias, alertas oficiais e monitoramento em tempo real", font=get_font(False, 21), fill=COLOR_MUTED, anchor="mm")

    card_w = 960
    c_x = (1080 - card_w) // 2

    if full_card:
        tw = 960
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
    draw.text((1080 // 2, box_y + 45), "O QUE VOCÊ ENCONTRA NA NOSSA PÁGINA:", font=get_font(True, 26), fill=COLOR_WHITE, anchor="mm")

    items = [
        ("• Previsões Diárias:", "Publicadas todas as manhãs com mapas locais."),
        ("• Alertas Oficiais:", "Avisos de tempestades, ventos fortes e ressacas."),
        ("• Chuva em Tempo Real:", "Acumulados atualizados de todas as estações municipais."),
        ("• Condições da Orla:", "Tábua de marés, temperatura da água e rajadas de vento.")
    ]

    for i, (b_title, b_desc) in enumerate(items):
        iy = box_y + 90 + i * 82
        draw_rounded_rect(draw, (c_x + 30, iy, c_x + card_w - 30, iy + 68), fill=COLOR_SUB_BG, outline=COLOR_BLUE, radius=14, width=1)
        draw.text((c_x + 48, iy + 34), b_title, font=get_font(True, 21), fill=COLOR_ORANGE, anchor="lm")
        draw.text((c_x + 325, iy + 34), b_desc, font=get_font(False, 19), fill=COLOR_WHITE, anchor="lm")

    draw.line([(c_x + 40, box_y + 435), (c_x + card_w - 40, box_y + 435)], fill=COLOR_BLUE, width=2)
    draw.text((1080 // 2, box_y + 465), "Siga @tempoemriodasostras no Instagram e compartilhe!", font=get_font(True, 24), fill=COLOR_ORANGE, anchor="mm")

    draw_footer_feed(draw)
    return img

def main():
    print("Generating both Stories (9:16) and Feed Post Carrossel (4:5) Lossless PNG Slides...")
    
    bg_stories = create_base_background(1080, 1920)
    bg_feed = create_base_background(1080, 1350)

    # Directories
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
    print("\n--- Saving Stories (1080x1920) ---")
    for fname, func in stories_funcs:
        im = func(bg_stories)
        for d in dirs_stories:
            im.save(os.path.join(d, fname), format="PNG", optimize=True)
        print(f"Stories slide created: {fname}")

    # 2. FEED POST CARROSSEL
    feed_funcs = [
        ("01_panorama_destaques.png", render_feed_slide_1),
        ("02_volume_total_chuva.png", render_feed_slide_2),
        ("03_ranking_estacoes.png", render_feed_slide_3),
        ("04_ventos_e_temperaturas.png", render_feed_slide_4),
        ("05_sistemas_meteorologicos.png", render_feed_slide_5),
        ("06_acompanhe_diariamente.png", render_feed_slide_6)
    ]
    print("\n--- Saving Feed Post Carrossel (1080x1350) ---")
    for fname, func in feed_funcs:
        im = func(bg_feed)
        for d in dirs_feed:
            im.save(os.path.join(d, fname), format="PNG", optimize=True)
        print(f"Feed slide created: {fname}")

    print("\nSUCCESS! All slides generated in both formats!")

if __name__ == "__main__":
    main()
