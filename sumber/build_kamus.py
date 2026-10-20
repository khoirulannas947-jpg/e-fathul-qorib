# Kamus kosakata Fathul Qorib: semua kata (isim, fi'il, huruf) dari data paragraf,
# dikelompokkan per bentuk dasar (tanpa و/ف/ب/ل/ك dan ال di depan), diurutkan menurut abjad hijaiyah.
# Hasil: data/kamus.json  ->  {"e": [entri...], "s": {bentuk_permukaan|jenis: indeks_entri}}
import json, glob, re, collections, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/efq/out/data"
OUT = sys.argv[2] if len(sys.argv) > 2 else SRC + "/kamus.json"

HARAKAT = re.compile(r"[ً-ٰٟـ]")
NONLETTER = re.compile(r"[^ء-يٱ]")
MARKS = set(chr(c) for c in range(0x064B, 0x0660)) | {"ٰ", "ـ"}
SUN = set("تثدذرزسشصضطظلن")
KEEP_AL = {"الله", "الذي", "التي", "الذين", "اللذان", "اللتان", "اللاتي", "اللائي", "اللواتي", "الآن", "اللهم"}
JENIS = {"fi": "f", "jr": "h", "hr": "h"}  # selain itu isim

def bare(a):
    return NONLETTER.sub("", HARAKAT.sub("", a))

def drop_letters(voc, n):
    """Buang n huruf pertama (beserta harakatnya) dari teks berharakat."""
    out, seen, i = voc, 0, 0
    while i < len(voc) and seen < n:
        if voc[i] not in MARKS and NONLETTER.sub("", voc[i]):
            seen += 1
        i += 1
    while i < len(voc) and voc[i] in MARKS:
        i += 1
    return voc[i:]

def clean_voc(a):
    a = re.sub(r"[^ء-يٱً-ٰٟ]", "", a)
    return a

tokens = []
files = sorted(glob.glob(SRC + "/*.json"))
for f in files:
    if f.endswith("kamus.json"):
        continue
    j = json.load(open(f, encoding="utf-8"))
    for p in j["p"]:
        for l in p["w"].split("\n"):
            l = l.strip()
            if not l:
                continue
            parts = (l.split("|") + ["", "", ""])[:3]
            a, t, k = parts[0].strip().lstrip("*"), parts[1].strip(), parts[2].strip()
            v = clean_voc(a)
            b = bare(v)
            if not b:
                continue
            tokens.append({"v": v, "b": b, "t": t, "j": JENIS.get(k, "i"), "pid": p["id"], "bab": p["bab"]})

surface = collections.Counter(t["b"] for t in tokens)
known = set(surface)

def strip_al(b, v):
    if b in KEEP_AL or not b.startswith("ال") or len(b) < 4:
        return b, v
    rest_b = b[2:]
    rest_v = drop_letters(v, 2)
    if rest_b and rest_b[0] in SUN:
        rest_v = rest_v.replace("ّ", "", 1) if len(rest_v) > 1 and rest_v[1:3].find("ّ") >= 0 else rest_v
    return rest_b, rest_v

PRE_VOWEL = {"و": "\u064E", "ف": "\u064E", "ب": "\u0650", "ل": "\u0650", "ك": "\u064E"}
PRE_GLOSS = {"و": r"^(dan|serta|padahal|sedangkan|demi)\b", "ف": r"^(maka|lalu|kemudian|sehingga|karena)\b",
             "ب": r"^(dengan|dalam|pada|oleh|karena|sebab|di|ke|atas|bersama|melalui|memakai|ber)\b",
             "ل": r"^(bagi|untuk|kepada|karena|milik|agar|supaya|oleh)\b", "ك": r"^(seperti|sebagaimana|semisal|sebagai)\b"}

def has_pre(b, v, m, pre):
    """Huruf awal benar-benar partikel: harakatnya cocok dan maknanya diawali terjemah partikel."""
    if not b.startswith(pre):
        return False
    marks = ""
    i = 1
    while i < len(v) and v[i] in MARKS:
        marks += v[i]; i += 1
    if PRE_VOWEL[pre] not in marks:
        return False
    return bool(re.search(PRE_GLOSS[pre], (m or "").strip(' "\'(').lower()))

def base_of(b, v, m=""):
    """Kembalikan (bentuk dasar tanpa harakat, bentuk dasar berharakat)."""
    # لل + kata  => لِ + ال + kata
    if b.startswith("لل") and len(b) >= 4 and b not in KEEP_AL and not b.startswith("الل"):
        b2, v2 = "ال" + b[2:], drop_letters(v, 1)
        if (b2 in known) or (b[2:] in known):
            return strip_al(b2, "ا" + v2)
    for pre in ("و", "ف"):
        if b.startswith(pre) and len(b) >= 3:
            rest = b[1:]
            if rest.startswith("ال") and rest not in KEEP_AL or rest in KEEP_AL:
                return base_of(rest, drop_letters(v, 1), "")
            if has_pre(b, v, m, pre) and (rest in known or rest[:1] in "بلك"):
                m2 = re.sub(PRE_GLOSS[pre], "", m.strip(' "\'(').lower()).strip()
                return base_of(rest, drop_letters(v, 1), m2)
    for pre in ("ب", "ك", "ل"):
        if b.startswith(pre) and len(b) >= 3:
            rest = b[1:]
            if rest.startswith("ال") and rest not in KEEP_AL:
                return strip_al(rest, drop_letters(v, 1))
            if rest in KEEP_AL:
                return rest, drop_letters(v, 1)
            if has_pre(b, v, m, pre) and rest in known and len(rest) >= 2:
                return rest, drop_letters(v, 1)
    return strip_al(b, v)

ORDER = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي"
NORM = str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ء": "ا", "ؤ": "و", "ئ": "ي", "ى": "ي", "ة": "ه"})
def sort_key(b):
    s = b.translate(NORM)
    return [ORDER.find(c) if c in ORDER else 99 for c in s], b

def first_letter(b):
    c = b.translate(NORM)[:1]
    return c if c in ORDER else "ا"

def strip_end(v):
    # buang harakat i'rab di huruf terakhir (untuk kepala entri isim)
    i = len(v)
    while i > 0 and v[i - 1] in MARKS:
        i -= 1
    return v[:i] if i else v

CLITIC_ID = {"و": r"(dan|serta)", "ف": r"(maka|lalu|kemudian|dan)", "ب": r"(dengan|dalam|pada|oleh|karena|sebab|di)",
             "ل": r"(bagi|untuk|kepada|karena|milik|agar)", "ك": r"(seperti|sebagaimana|semisal)"}
def clean_mean(m, surf_b, base_b):
    m = m.strip(' "\'“”()[]')
    pre = surf_b[: max(0, surf_b.find(base_b))] if base_b and base_b in surf_b else ""
    for c in pre:
        if c in CLITIC_ID:
            m = re.sub(r"^" + CLITIC_ID[c] + r"\s+", "", m, flags=re.I)
    m = m.strip(' "\'“”')
    if m.count("(") != m.count(")"):
        m = m.replace("(", "").replace(")", "").strip()
    return m

PRON = ("هما", "هم", "هن", "ها", "كم", "كما", "نا", "ه", "ك")
def letters_with_marks(v):
    out = []
    for ch in v:
        if ch in MARKS and out: out[-1] += ch
        elif NONLETTER.sub("", ch): out.append(ch)
    return out
def voc_key(v, m=""):
    # kunci kelompok: huruf + harakat dasar, tanpa sukun, tanpa harakat akhir (i'rab), tanwin fath + alif disatukan.
    # Kata berakhiran kata ganti (makna "...nya"): harakat i'rab sebelum kata ganti juga diabaikan.
    v = v.replace("\u0652", "")
    v = re.sub("\u064B\u0627$|\u0627\u064B$", "", v)
    b = bare(v)
    if "nya" in (m or "").lower():
        for suf in PRON:
            if b.endswith(suf) and len(b) > len(suf) + 1:
                L = letters_with_marks(v)
                n = len(suf)
                core = L[:-n]
                core[-1] = core[-1][0] + "".join(c for c in core[-1][1:] if c == "\u0651")
                return "".join(core) + "".join(x[0] for x in L[-n:])
    return strip_end(v)

for t in tokens:
    bb, bv = base_of(t["b"], t["v"], t["t"])
    t["bb"], t["bv"] = (bb, bv) if bb else (t["b"], t["v"])
    t["k"] = voc_key(t["bv"], t["t"]) or t["bb"]
jc = collections.defaultdict(collections.Counter)
for t in tokens:
    jc[t["k"]][t["j"]] += 1
def jenis_of(bb, j):
    c = jc[bb]; tot = sum(c.values()); top = c.most_common(1)[0][0]
    if j == top: return j
    return j if (c[j] >= 3 and c[j] / tot >= 0.25) else top

groups = collections.OrderedDict()
smap = {}
for t in tokens:
    bb, bv = t["bb"], t["bv"]
    key = (t["k"], jenis_of(t["k"], t["j"]))
    g = groups.setdefault(key, {"forms": collections.Counter(), "bare_forms": collections.Counter(), "mean": collections.Counter(), "refs": [], "n": 0, "surf": collections.Counter()})
    g["n"] += 1
    g["forms"][bv] += 1
    if t["b"] == bb:
        g["bare_forms"][t["v"]] += 1
    m = clean_mean(re.sub(r"\s+", " ", t["t"]).strip(" ,.;:"), t["b"], bb)
    if m:
        g["mean"][m] += 2 if t["b"] == bb else 1
    g["surf"][t["v"]] += 1
    if len(g["refs"]) < 400:
        g["refs"].append((t["pid"], t["bab"], t["v"], m))
    smap[t["b"] + "|" + t["j"]] = key

entries = []
for (vk, j), g in groups.items():
    bb = bare(vk)
    head = (g["bare_forms"] or g["forms"]).most_common(1)[0][0]
    if j == "i":
        h2 = re.sub("\u064B\u0627$|\u0627\u064B$", "", head)
        if h2 != head:
            head = h2
        elif not any("nya" in m.lower() for m, _ in g["mean"].most_common(2)):  # kata ganti (ـهُ، ـهَا): biarkan apa adanya
            head = strip_end(head)
    # contoh: utamakan paragraf berbeda, maksimal 12
    seen, refs = set(), []
    for r in g["refs"]:
        if r[0] in seen:
            continue
        seen.add(r[0]); refs.append(list(r))
        if len(refs) >= 8:
            break
    vs = [v for v, _ in g["surf"].most_common(5)]
    cref = []
    for pid, bab, v, m in refs:
        cref.append([pid, bab, vs.index(v) if v in vs else v, m])
    entries.append({
        "b": bb, "k": vk, "a": head, "j": j, "n": g["n"],
        "m": [m for m, _ in g["mean"].most_common(3)],
        "v": vs, "r": cref,
    })

entries.sort(key=lambda e: (sort_key(e["b"]), -e["n"], "ifh".index(e["j"])))
index = {(e["k"], e["j"]): i for i, e in enumerate(entries)}
for e in entries: e.pop("k")
s = {k: index[v] for k, v in smap.items()}
out = {"e": entries, "s": s}
json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
cnt = collections.Counter(e["j"] for e in entries)
print(f"kamus: {len(entries)} entri (isim {cnt['i']}, fi'il {cnt['f']}, huruf {cnt['h']}) dari {len(tokens)} kata -> {OUT}")
