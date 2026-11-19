# Alineación forzada simple: frases = tramos entre silencios; palabras repartidas por sílabas y
# ajustadas a micro-pausas detectadas dentro de cada frase.
import subprocess, json, re, numpy as np, sys
SR=16000
raw=subprocess.run(["ffmpeg","-v","error","-i","voz.mp3","-ac","1","-ar",str(SR),"-f","s16le","-"],capture_output=True).stdout
x=np.frombuffer(raw,np.int16).astype(np.float32)/32768
hop=160; n=len(x)//hop
env=np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)+1e-12) for i in range(n)])
db=20*np.log10(env); T=np.arange(n)*hop/SR
def runs(mask,minlen):
    out=[];i=0
    while i<len(mask):
        if mask[i]:
            j=i
            while j<len(mask) and mask[j]: j+=1
            if (j-i)*hop/SR>=minlen: out.append((T[i],T[min(j,n-1)]))
            i=j
        else: i+=1
    return out
PH=['¿Y si te digo que tu techo podría estar pagándote la luz…', 'y lo tienes vacío?', 'Cada mes le das miles de pesos a la distribuidora, y encima se va la luz.', 'Pero hay casas, aquí mismo en República Dominicana, que pagan una fracción de eso, porque producen su propia electricidad con el sol.', 'Hoy te explico, paso a paso, cómo funcionan los paneles solares, cuánto cuestan de verdad, qué permisos necesitas, cómo recuperar hasta un cuarenta por ciento de lo que inviertes en los equipos…', 'y los errores que hacen que mucha gente pierda su dinero.', 'Quédate hasta el final, porque el error número uno lo comete casi todo el mundo, y te puede costar miles de dólares.', 'Antes de empezar, una verdad que muchos vendedores no te dicen:', 'con paneles solares conectados a la red, casi nunca vas a pagar cero.', 'Vas a seguir pagando un cargo fijo, y desde noviembre de este año hay un cargo nuevo para algunas personas que le mandan energía a la red.', 'Pero si lo haces bien, tu factura puede bajar muchísimo.', 'Y eso es lo que te voy a enseñar.', 'Primero, entiende cómo funciona.', 'Los paneles de tu techo reciben la luz del sol y la convierten en electricidad.', 'Pero esa electricidad sale como corriente directa, y tu casa usa corriente alterna.', 'Por eso hay un aparato clave:', 'el inversor.', 'El inversor convierte esa energía para que tu nevera, tu televisor y tu aire la puedan usar.', 'Durante el día, tu casa usa primero la energía del sol.', 'Si te sobra, esa energía se va a la red de la distribuidora.', 'Y de noche, cuando no hay sol, tomas energía de la red como siempre.', 'Para que todo eso se cuente bien, la distribuidora te pone un contador especial, que se llama bidireccional:', 'cuenta la energía que tú tomas y la que tú entregas.', 'A eso se le llama medición neta.', 'Ahora sí, vamos al paso a paso.', 'Paso uno:', 'saca tu factura y busca cuántos kilovatios hora gastas al mes.', 'No mires cuántos pesos pagas, mira los kilovatios.', 'Y si puedes, busca los últimos doce meses, porque en verano, con el aire prendido, gastas mucho más que en diciembre.', 'Saca el promedio.', 'Ese número es la base de todo.', 'Si gastas doscientos kilovatios al mes, necesitas un sistema pequeño.', 'Si gastas mil, necesitas uno mucho más grande.', 'Y sin ese número, cualquier cotización es un número inventado.', 'Paso dos:', 'antes de comprar paneles, baja tu consumo.', 'Esto es lo que más dinero te ahorra, y casi nadie lo hace primero.', 'Cambia los bombillos viejos por bombillos LED.', 'Revisa la goma de la nevera.', 'Pon el aire en veinticuatro o veinticinco grados, no en dieciocho.', 'Desconecta lo que no estás usando.', '¿Por qué primero?', 'Porque cada kilovatio que dejas de gastar es un pedazo de sistema que no tienes que comprar.', 'Es más barato ahorrar energía que producirla.', 'Paso tres:', 'calcula, más o menos, el tamaño de tu sistema.', 'Aquí te dejo una regla sencilla para tener una idea.', 'En República Dominicana, cada kilovatio de paneles produce, aproximadamente, unos ciento veinte kilovatios hora al mes.', 'Entonces, si tu casa gasta seiscientos kilovatios hora al mes, divides seiscientos entre ciento veinte, y te da cinco.', 'Necesitarías un sistema de unos cinco kilovatios.', 'Ojo:', 'esto es solo para que tengas una idea y no te engañen.', 'El cálculo exacto lo hace el instalador, según tu techo, la sombra y la zona donde vives.', 'Paso cuatro:', 'decide qué tipo de sistema quieres.', 'Y aquí viene algo muy importante, porque hay tres tipos.', 'El primero es conectado a la red, con medición neta.', 'Es el más barato, porque no lleva baterías.', 'Pero tiene un detalle que casi nadie te dice:', 'cuando se va la luz, tus paneles también se apagan.', 'Sí, aunque haya sol.', 'Es por seguridad, para no electrocutar a los técnicos que están arreglando las líneas.', 'El segundo es de inyección cero.', 'Tus paneles alimentan tu casa, pero no le mandan nada a la red.', 'Con el reglamento nuevo, estos sistemas no pagan el cargo por energía inyectada, porque no inyectan nada.', 'Pero lo que te sobra de día se pierde, si no tienes dónde guardarlo.', 'Y el tercero es híbrido, con baterías.', 'Es el más caro, pero es el que te mantiene la luz cuando hay apagón, porque guarda energía para la noche y para los cortes.', 'Pero ojo, para eso necesita un inversor híbrido preparado para funcionar aislado de la red.', 'Si en tu zona se va la luz muchas horas, este es el que más vas a agradecer.', 'Y antes de seguir con los permisos y con cómo recuperar hasta el cuarenta por ciento de lo que cuestan los equipos, si este video te está sirviendo, suscríbete y activa la campanita.', 'Aquí te explico cómo funcionan las cosas de tu casa, de tu carro y de tu celular, para que ahorres tiempo y dinero.', 'Ahora sí, seguimos.', 'Paso cinco:', 'revisa tu techo.', 'Los paneles necesitan sol directo la mayor parte del día, sin sombra de árboles, de tinacos o del edificio de al lado.', 'Una sombra pequeña sobre un panel puede bajar la producción de todo el grupo.', 'El techo tiene que aguantar el peso y no tener filtraciones, porque arreglar el techo después, con los paneles encima, sale mucho más caro.', 'Si tu techo está viejo, impermeabilízalo antes.', 'Paso seis:', 'pide por lo menos tres cotizaciones.', 'Y no compares solo el precio final.', 'Pide que cada cotización diga cuántos paneles son y de cuántos vatios, la marca y el modelo del inversor, si incluye baterías y de qué tipo, cuánta energía va a producir al mes, cuánto tiempo de garantía tienen los paneles, el inversor y la instalación, y si ellos se encargan de los permisos con la distribuidora y del trámite del crédito fiscal.', 'Una cotización que no dice cuánta energía vas a producir no te sirve para comparar.', 'Y pide ver casas donde ya hayan instalado.', 'Ve, mira y pregunta.', 'Paso siete:', 'los permisos.', 'Si tu sistema va conectado a la red, la distribuidora tiene que aprobarlo.', 'Tú, o tu instalador, hacen la solicitud a tu distribuidora:', 'Edesur, Edenorte o Edeeste.', 'Se firma un acuerdo de interconexión, y si vas con medición neta, también un acuerdo de medición neta.', 'Después te cambian el contador por uno bidireccional.', 'No conectes nada a la red sin ese permiso, porque es peligroso y te puede traer problemas con la distribuidora.', 'Y aquí está el cambio de este año.', 'La Superintendencia de Electricidad aprobó un reglamento nuevo de generación distribuida, y las solicitudes nuevas ya van con esas reglas.', 'Desde el uno de noviembre, a los usuarios con tarifa monómica que le mandan energía a la red les cobran un cargo:', 'el veinticinco por ciento del cargo por energía, pero solo sobre la energía que entregan a la red, no sobre todo lo que producen.', 'Quien ya tenía su sistema aprobado tiene un período de transición de hasta cinco años.', 'Por eso hoy, más que nunca, conviene usar en tu casa la mayor parte de lo que producen tus paneles.', 'Paso ocho:', 'recupera parte de tu dinero con la Ley cincuenta y siete, cero siete.', 'Esta ley de energías renovables te da dos beneficios.', 'Uno:', 'los equipos, como paneles e inversores, están exentos de ITBIS.', 'Y dos:', 'puedes recibir un crédito fiscal de hasta el cuarenta por ciento de lo que costaron los equipos.', 'Pero ojo:', 'ese crédito se descuenta del impuesto sobre la renta.', 'Si tú no pagas impuesto sobre la renta, ese cuarenta por ciento no te llega en efectivo.', 'Se solicita a la Comisión Nacional de Energía, con tu cédula, el título de la casa o el contrato de alquiler, y las facturas.', 'Pregúntale a tu instalador si él te hace ese trámite.', 'Paso nueve:', 'haz los números.', 'Según guías de precios de este año, un sistema de unos cinco kilovatios, instalado, cuesta más o menos entre cinco mil y ocho mil dólares.', 'Con baterías, sube bastante.', 'Para saber si te conviene, haz esta cuenta:', 'lo que pagas de luz al mes hoy, menos lo que pagarías con paneles.', 'Esa diferencia es tu ahorro mensual.', 'Divide el costo del sistema entre ese ahorro, y te da cuántos meses tardas en recuperarlo.', 'Muchas guías hablan de recuperarlo en cinco a siete años, y los paneles suelen durar mucho más que eso.', 'Pero haz la cuenta con tus números, no con los del vendedor.', 'Paso diez:', 'el mantenimiento.', 'Es poco, pero no es cero.', 'Limpia los paneles con agua y un paño suave cuando tengan polvo o sucio de pájaros, temprano en la mañana o al final de la tarde, nunca con el panel caliente, y nunca te subas al techo sin seguridad.', 'Revisa la aplicación del inversor:', 'si un día produce mucho menos que otros días parecidos, algo está pasando.', 'Y si tienes baterías, que las revise un técnico.', 'Ahora, los errores que hacen que la gente pierda su dinero.', 'Comprar el sistema más grande que le venden, sin mirar su consumo.', 'Elegir solo por el precio más barato.', 'No preguntar si el sistema funciona en los apagones.', 'Instalar sobre un techo con filtraciones.', 'Conectarse sin permiso.', 'Y el error número uno:', 'no bajar primero el consumo.', 'Si gastas de más, vas a pagar paneles de más.', 'Resumen:', 'mira tus kilovatios, baja tu consumo, calcula el tamaño, decide el tipo de sistema, revisa tu techo, compara tres cotizaciones, saca los permisos, pide tu crédito fiscal, haz tus números y dale mantenimiento.', 'Y recuerda:', 'todo lo eléctrico de este proyecto lo tiene que hacer un instalador certificado.', 'No es un trabajo para hacerlo tú solo.', 'Si este video te sirvió, dale like, compártelo con alguien que esté pagando demasiado de luz, y suscríbete para que no te pierdas el próximo.', 'Y cuéntame en los comentarios:', '¿cuántos kilovatios gastas tú al mes?', 'Yo te leo.', 'Nos vemos en el próximo video.']
sil=runs(db<-40,0.25)
speech=[];prev=0
for a,b in sil:
    if a-prev>0.1: speech.append((prev,a))
    prev=b
if T[-1]-prev>0.1: speech.append((prev,T[-1]))
# recortar silencio inicial/final de cada tramo
def trim(a,b):
    m=(T>=a)&(T<=b)&(db>-40); idx=np.where(m)[0]
    return (T[idx[0]],T[idx[-1]]) if len(idx) else (a,b)
speech=[trim(a,b) for a,b in speech]
def syl(w):
    w=w.lower(); g=re.findall(r"[aeiouáéíóúü]+",w); k=0
    for s in g: k+= 1 if len(s)==1 else (1 if re.fullmatch(r"[iuü]?[aeoáéó][iu]?|[iu][iu]|[iu]?[aeo]?[iu]",s) else len(s))
    return max(1,k)
if len(speech)!=len(PH):
    import re as _re
    CL=[]
    for ph in PH:
        parts=_re.findall(r'[^,.…:?!]+[,.…:?!]*\s*',ph)
        CL+= [x.strip() for x in parts if x.strip()]
    def sy(t): return sum(syl(w) for w in t.split())
    cs=[sy(c) for c in CL]; D=[b-a for a,b in speech]; rate=sum(D)/sum(cs)
    n,m=len(CL),len(speech); INF=1e18
    best=[[INF]*(m+1) for _ in range(n+1)]; bk=[[0]*(m+1) for _ in range(n+1)]; best[0][0]=0
    for i in range(1,n+1):
        for j in range(1,min(i,m)+1):
            for k in range(j-1,i):
                if best[k][j-1]>=INF: continue
                e=(sum(cs[k:i])*rate-D[j-1])**2
                if best[k][j-1]+e<best[i][j]: best[i][j]=best[k][j-1]+e; bk[i][j]=k
    assert best[n][m]<INF,(n,m); print('ERROR_TOTAL', round(best[n][m],2), 'clausulas', n, 'tramos', m)
    out=[]; i=n
    for j in range(m,0,-1): k=bk[i][j]; out.append(' '.join(CL[k:i])); i=k
    PH=out[::-1]
assert len(speech)==len(PH),(len(speech),len(PH))
words=[];phr=[]
for (a,b),tx in zip(speech,PH):
    ws=tx.split(); wt=np.array([syl(w)+0.5+(0.6 if re.search(r"[,.:?…]$",w) else 0) for w in ws]); cum=np.concatenate([[0],np.cumsum(wt)])/wt.sum()
    bounds=a+cum*(b-a)
    # micro-pausas dentro del tramo -> encajar al límite de palabra más cercano
    m=(T>a+0.05)&(T<b-0.05); mp=[(p,q) for p,q in runs(m&(db<-36),0.10)]
    anchors={0:(a,a),len(ws):(b,b)}
    for p,q in (mp if len(ws)>1 else []):
        k=int(np.argmin(np.abs(bounds[1:-1]-(p+q)/2)))+1
        if abs(bounds[k]-(p+q)/2)<0.3: anchors[k]=(p,q)
    ks=sorted(anchors); st=np.zeros(len(ws)); en=np.zeros(len(ws))
    for i0,i1 in zip(ks[:-1],ks[1:]):
        s0=anchors[i0][1]; s1=anchors[i1][0]; seg=wt[i0:i1]; c=np.concatenate([[0],np.cumsum(seg)])/seg.sum()
        for j in range(i1-i0): st[i0+j]=s0+c[j]*(s1-s0); en[i0+j]=s0+c[j+1]*(s1-s0)
    for w,s,e in zip(ws,st,en): words.append({"w":w,"s":round(float(s),3),"e":round(float(e),3)})
    phr.append({"t":tx,"s":round(float(a),3),"e":round(float(b),3),"micro":len(mp)})
json.dump({"dur":round(len(x)/SR,3),"phrases":phr,"words":words},open("timing.json","w"),ensure_ascii=False,indent=1)
for p in phr: print(f"{p['s']:6.2f}-{p['e']:6.2f} m{p['micro']} {p['t']}")
