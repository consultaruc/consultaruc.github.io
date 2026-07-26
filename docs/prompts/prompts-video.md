# Consulta RUC Perú — prompt de video hero (10 s) para la home

Video corto (10 segundos) para la portada de **consultaruc-pe.com**: explica qué es el RUC y cómo verificarlo, con voz en español (es-PE) y **motion graphics** premium, en la identidad de marca (navy #16233F + naranja #F97316, sello dorado, tipografía geométrica). Cópialo en un generador de video con voz (Google Veo 3, Sora, Kling, Runway Gen-3, Pika, Hailuo…). Pide el **guion de voz en off exactamente como está** y sincronízalo con las escenas.

**Formato principal:** 16:9, 1920×1080, 30 fps, 10.0 s. (Genera también 1:1 y 9:16 para redes.)

---

## 🎙️ Voz en off (español es-PE — léela tal cual, ~10 s, tono claro y confiable, voz peruana neutra)

> «¿Qué es el RUC? Es tu número de identificación tributaria ante la SUNAT.
> En Consulta RUC Perú verificas gratis cualquier empresa —estado, razón social y ficha— en segundos.»

*(≈24 palabras. Ritmo tranquilo, sin prisa, cierre con energía en «en segundos».)*

---

## 🎬 PROMPT (cópialo completo)

```
Create a premium 10-second explainer motion-graphics video (16:9, 1920x1080, 30fps) for "Consulta RUC Perú" (consultaruc-pe.com), a free Peruvian portal to look up any company's RUC (tax ID) in the SUNAT registry. Style: clean, modern govtech/fintech motion design — flat vector shapes, crisp geometric animation, smooth easing (ease-in-out), subtle depth and soft shadows, NEVER cluttered. Brand palette used consistently: deep navy #16233F backgrounds, warm orange #F97316 accents, white, and small status colors (green #16A34A for "ACTIVO/HABIDO"). Typography: bold geometric sans (Sora-style) for headings and MONOSPACE for any RUC digits. A faint single-line silhouette of Peru with a tiny orange Lima dot may sit as a background motif. Spanish (es-PE) on-screen text and a Spanish voice-over, correctly spelled. High production value, every frame purposeful.

VOICE-OVER (Spanish, calm trustworthy male or female Peruvian voice, synced to the scenes):
"¿Qué es el RUC? Es tu número de identificación tributaria ante la SUNAT. En Consulta RUC Perú verificas gratis cualquier empresa —estado, razón social y ficha— en segundos."

SCENE-BY-SCENE (exact timing, describe the motion of every element):

[0.0s–2.0s] HOOK. Navy background. From center, the bold white question "¿Qué es el RUC?" scales up from 90% to 100% with a soft spring while a thin orange underline sweeps left-to-right beneath it. Small monospace digits softly float/blur in the deep background. Gentle push-in (very subtle zoom).

[2.0s–4.5s] DEFINITION. Smooth cut/wipe to a centered white document card (rounded, with a 3px orange left spine) sliding up into frame. On it, a SEGMENTED RUC BLOCK types on in monospace: three chips "20" · "10004721" · "8" appear one after another with a quick pop; a small navy "SUNAT" tag and a green check animate in at the corner. Caption fades in below: "Tu identificación tributaria". Everything settles with easing.

[4.5s–7.0s] THE PRODUCT. Transition (the card morphs / slides) into a stylized search UI on navy: a clean search bar where the RUC "20100047218" quick-types in mono, then a navy "CONSULTAR" button presses (scale-down/up). Instantly a result card slides up showing a company name line plus two pills animating in: green "ACTIVO" and green "HABIDO", with a subtle checkmark sweep. Fast, satisfying, "verificado en segundos" feeling.

[7.0s–10.0s] BRAND / CTA. Elements gracefully collapse to center into the brand's GOLD CIRCULAR SEAL badge (an official-style stamp: gold ring, navy center, a small magnifier+check monogram, tiny Peru flag) that scales in with a soft rotation and a light shine sweep. Below it, the wordmark "Consulta RUC Perú" fades in, and a monospace line "consultaruc-pe.com" with a small orange "GRATIS" pill slides in. Hold the last 0.6s steady for legibility.

MOTION RULES: everything animates with smooth ease-in-out, staggered by ~0.1s so elements enter one after another (never all at once); transitions are quick wipes/morphs, not hard cuts; keep 6–8% safe margins so nothing touches the edges; text is always large and legible.

AUDIO: soft modern corporate/tech background music (light, uplifting, low volume under the voice), subtle UI "tick/pop" SFX synced to the RUC chips typing and the button press, a gentle "shine/whoosh" on the final seal reveal.

REQUIREMENTS: flat 2D motion graphics (no photorealistic 3D, no stock footage of people), correct Spanish spelling on all text, high contrast and legibility, brand colors exactly as specified. Do NOT use the real SUNAT logo, the Peruvian national coat of arms, gob.pe or Marca Perú — the seal is an original mark. Deliver clean 16:9 plus 1:1 and 9:16 crops.
```

---

## Notas para colocarlo en la home

- Úsalo como **video corto en loop** (mute autoplay + botón de sonido) en el hero, o como card informativa debajo del buscador. Web: `<video muted loop playsinline autoplay>` con `poster` (usa un frame o `/img/og-home.png`).
- Exporta en **MP4 (H.264)** + **WebM** ligero para la web; comprime a <2–3 MB para no frenar la carga.
- Si el generador no clava el sincronizado de voz, genera el **video mudo** y añade la voz en off por separado (TTS es-PE o locutor) en un editor.
- Pide también un **thumbnail/poster** del último frame (el sello + "consultaruc-pe.com").
