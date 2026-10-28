/* Lee frases.txt y lo convierte en la lista de situaciones.
   No hace falta tocar este archivo. */
async function loadSituations() {
    const res = await fetch("frases.txt?v=" + Date.now());
    if (!res.ok) throw new Error("No se pudo cargar frases.txt");
    const text = await res.text();

    const list = [];
    let current = null;
    let pending = null;

    text.split(/\r?\n/).forEach(raw => {
        const line = raw.trim();

        if (line === "") { pending = null; return; }       // linea en blanco: cierra la frase
        if (line.startsWith("//")) return;                  // nota: se ignora

        if (/^@video\s*:/i.test(line)) {                    // video de la situacion
            if (current) current.video = line.replace(/^@video\s*:/i, "").trim();
            pending = null;
            return;
        }

        if (line.startsWith("#")) {                         // nueva situacion
            const parts = line.slice(1).split("|");
            current = {
                id: list.length + 1,
                es: (parts[0] || "").trim(),
                en: (parts[1] || "").trim(),
                video: "",
                phrases: []
            };
            list.push(current);
            pending = null;
            return;
        }

        if (!current) return;
        if (pending === null) {
            pending = line;                                 // primera linea: español
        } else {
            current.phrases.push({ es: pending, en: line }); // segunda linea: inglés
            pending = null;
        }
    });

    return list;
}
