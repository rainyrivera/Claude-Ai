#!/usr/bin/env python3
"""Analiza una exportación CSV del Administrador de Anuncios de Meta (nivel anuncio).

Uso:
  python3 analizar_meta_csv.py informe.csv --cpa-equilibrio 12 [--cpa-objetivo 9]
  python3 analizar_meta_csv.py informe.csv --precio 17 --coste-variable 6

Acepta encabezados en español o inglés. Sin dependencias externas.
"""
import argparse, csv, sys

COLS = {
    "nombre": ["Nombre del anuncio", "Ad name"],
    "estado": ["Entrega del anuncio", "Ad delivery"],
    "gasto": ["Monto gastado (USD)", "Importe gastado (EUR)", "Importe gastado (USD)", "Monto gastado (MXN)", "Amount spent (USD)", "Amount spent (EUR)"],
    "impresiones": ["Impresiones", "Impressions"],
    "clics": ["Clics en el enlace", "Link clicks"],
    "lpv": ["Visitas a la página de destino", "Landing page views"],
    "pagos": ["Pagos iniciados", "Checkouts initiated"],
    "v3": ["Reproducciones de video de 3 segundos", "3-second video plays"],
    "resultados": ["Resultados", "Results"],
    "indicador": ["Indicador de resultado", "Result indicator"],
    "valor": ["Valor de conversión de compras", "Purchases conversion value"],
}

def norm(s):
    # Meta mete a veces espacios no separables (\xa0) en los encabezados.
    return " ".join(s.replace("\xa0", " ").split()).strip().lower()

def resolver(headers):
    h = {norm(x): x for x in headers}
    out = {}
    for key, alts in COLS.items():
        for a in alts:
            if norm(a) in h:
                out[key] = h[norm(a)]; break
        else:
            # coincidencia por prefijo para variantes de moneda: "Monto gastado (XXX)"
            if key == "gasto":
                for nh, orig in h.items():
                    if nh.startswith(("monto gastado", "importe gastado", "amount spent")):
                        out[key] = orig; break
    return out

def num(v):
    if v is None: return 0.0
    v = v.strip().replace("\xa0", "")
    if not v: return 0.0
    if "," in v and "." not in v: v = v.replace(",", ".")
    try: return float(v)
    except ValueError: return 0.0

def pct(a, b): return (a / b * 100) if b else None
def fmt(x, nd=2, suf=""): return "—" if x is None else f"{x:.{nd}f}{suf}"

def main():
    p = argparse.ArgumentParser()
    p.add_argument("csv")
    p.add_argument("--cpa-equilibrio", type=float)
    p.add_argument("--cpa-objetivo", type=float)
    p.add_argument("--precio", type=float)
    p.add_argument("--coste-variable", type=float)
    a = p.parse_args()

    if a.cpa_equilibrio is None and a.precio is not None and a.coste_variable is not None:
        a.cpa_equilibrio = a.precio - a.coste_variable
    eq = a.cpa_equilibrio
    obj = a.cpa_objetivo if a.cpa_objetivo is not None else (eq * 0.8 if eq else None)

    with open(a.csv, encoding="utf-8-sig", newline="") as fh:
        rd = csv.DictReader(fh)
        c = resolver(rd.fieldnames or [])
        filas = list(rd)
    faltan = [k for k in ("nombre", "gasto", "impresiones") if k not in c]
    if faltan:
        sys.exit(f"Faltan columnas obligatorias: {faltan}. Encabezados: {rd.fieldnames}")

    tot = dict(g=0, imp=0, cl=0, lpv=0, pag=0, v3=0, res=0, val=0)
    rows = []
    for f in filas:
        g = num(f.get(c.get("gasto"))); imp = num(f.get(c.get("impresiones")))
        cl = num(f.get(c.get("clics"))); lpv = num(f.get(c.get("lpv")))
        pag = num(f.get(c.get("pagos"))); v3 = num(f.get(c.get("v3")))
        res = num(f.get(c.get("resultados"))); val = num(f.get(c.get("valor")))
        for k, v in zip(tot, (g, imp, cl, lpv, pag, v3, res, val)): tot[k] += v
        cpa = g / res if res else None
        if eq is None: ver = "sin umbral (falta CPA de equilibrio)"
        elif res == 0 and g >= 1.5 * obj: ver = "PAUSAR (gasto ≥1,5× CPA obj. sin resultados)"
        elif res == 0: ver = "DATOS INSUFICIENTES"
        elif cpa <= obj and res >= 3: ver = "GANADOR → escalar"
        elif cpa <= obj: ver = "PROMETEDOR (pocas ventas, confirmar)"
        elif cpa <= eq: ver = "MANTENER (entre objetivo y equilibrio)"
        elif g >= 3 * obj: ver = "PAUSAR (CPA sobre equilibrio con gasto alto)"
        else: ver = "VIGILAR (CPA sobre equilibrio)"
        rows.append((f.get(c["nombre"], "").strip(), (f.get(c.get("estado"), "") or "").strip(), g, res, val, cpa,
                     (val / g if g else None), (g / imp * 1000 if imp else None), pct(cl, imp), pct(lpv, cl),
                     pct(v3, imp), pct(res, lpv), ver))
    rows.sort(key=lambda r: -r[2])

    print("| Anuncio | Estado | Gasto | Result. | Valor | CPA | ROAS | CPM | CTR enlace | Clic→visita | Gancho 3s | Visita→result. | Veredicto |")
    print("|---|---|---|---|---|---|---|---|---|---|---|---|---|")
    for r in rows:
        print(f"| {r[0]} | {r[1]} | {r[2]:.2f} | {r[3]:.0f} | {r[4]:.2f} | {fmt(r[5])} | {fmt(r[6])} | {fmt(r[7])} | {fmt(r[8],2,'%')} | {fmt(r[9],1,'%')} | {fmt(r[10],1,'%')} | {fmt(r[11],2,'%')} | {r[12]} |")
    t = tot
    print("\nTOTAL CUENTA")
    print(f"  Gasto {t['g']:.2f} | Resultados {t['res']:.0f} | Valor {t['val']:.2f} | ROAS {fmt(t['val']/t['g'] if t['g'] else None)}"
          f" | CPA {fmt(t['g']/t['res'] if t['res'] else None)} | CPM {fmt(t['g']/t['imp']*1000 if t['imp'] else None)}"
          f" | CTR enlace {fmt(pct(t['cl'],t['imp']),2,'%')} | Clic→visita {fmt(pct(t['lpv'],t['cl']),1,'%')}"
          f" | Visita→resultado {fmt(pct(t['res'],t['lpv']),2,'%')}")
    if eq: print(f"  Umbrales usados: CPA equilibrio {eq:.2f} | CPA objetivo {obj:.2f}")
    if "pagos" in c and t["pag"] == 0:
        print("  AVISO: 'Pagos iniciados' está vacío: revisa si el píxel registra InitiateCheckout.")
    if t["res"] < 30:
        print(f"  AVISO: solo {t['res']:.0f} resultados en total; las diferencias entre anuncios pueden ser ruido.")

if __name__ == "__main__":
    main()
