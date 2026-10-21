# Melengkapi i'rab: setiap kata yang belum punya baris i'rab diberi baris otomatis
# (ditandai "~" di awal penjelasan) berdasarkan kedudukan (kode) + harakat akhir kata.
# Baris tulisan tangan tidak disentuh. Dipanggil dari make_site.py pada out/data/*.json
import json, glob, re, sys

DIAC = 'ً-ْٰ'
def norm(s):
    s = re.sub('[ً-ٰ۟ـ«»﴿﴾()،؛:.!?\\-*]', '', s or '')
    s = re.sub('[أإآٱ]', 'ا', s).replace('ى', 'ي').replace('ة', 'ه')
    return s.strip()

def core(s):
    s = norm(s)
    if len(s) > 3 and s[0] in 'وف': s = s[1:]
    if len(s) > 3 and s[0] in 'بلك': s = s[1:]
    if len(s) > 4 and s.startswith('ال'): s = s[2:]
    return s

def clean(w):  # buang tanda baca/kutip di tepi
    return re.sub(r'^[«﴿(*]+|[»﴾).،؛:!?]+$', '', w.strip())

FATHA, DAMMA, KASRA, SUK = 'َ', 'ُ', 'ِ', 'ْ'
TF, TD, TK = 'ً', 'ٌ', 'ٍ'

def strip_ws(w):  # buang tanda tulis, simpan harakat
    return clean(w)

def tail(w):
    """harakat akhir: kembalikan (huruf_akhir, harakat_akhir, tanwin?)"""
    w = clean(w)
    w = re.sub('ّ', '', w) if False else w
    if w.endswith(TF + 'ا') or w.endswith('ا' + TF): w = w[:-2] if w.endswith(TF + 'ا') else w[:-1] + ''
    m = re.search('([ء-ي])([' + DIAC + ']*)$', w)
    if not m: return None, '', False
    ch, d = m.group(1), m.group(2)
    return ch, d, any(x in d for x in (TF, TD, TK))

def status_from_tail(w):
    """('rafa'|'nashab'|'jar'|None, tanda)"""
    c = clean(w)
    sk = norm(c)
    # pola khusus
    if re.search('ُوْنَ$|ُونَ$', c): return 'rafa', "wawu (jamak mudzakkar salim)"
    if re.search('ِيْنَ$|ِينَ$', c): return 'nj', "ya' (jamak mudzakkar salim)"
    if re.search('َانِ$', c): return 'rafa', "alif (mutsanna)"
    if re.search('َيْنِ$|َيْنَ$', c): return 'nj', "ya' (mutsanna)"
    ch, d, tw = tail(c)
    if ch is None: return None, ''
    if not tw and ch in 'هكيناوى' and sk != 'الله': return None, ''
    if tw:
        if TD in d: return 'rafa', "dhammah (tanwin)"
        if TF in d or (c.endswith(TF) or c.endswith(TF + 'ا')): return 'nashab', "fathah (tanwin)"
        if TK in d: return 'jar', "kasrah (tanwin)"
    if DAMMA in d: return 'rafa', 'dhammah'
    if FATHA in d: return 'nashab', 'fathah'
    if KASRA in d: return 'jar', 'kasrah'
    return None, ''

ST = {'rafa': "marfu'", 'nashab': "manshub", 'jar': "majrur"}

ROLE = {
 'mb': ("Mubtada'", 'rafa'), 'fa': ("Fa'il", 'rafa'), 'nf': ("Na'ibul fa'il", 'rafa'),
 'kh': ("Khabar", 'rafa'), 'ii': ("Isim inna/kana", None), 'ki': ("Khabar inna/kana", None),
 'mq': ("Maqul qaul (isi ucapan)", None),
 'mf': ("Maf'ul bih", 'nashab'), 'mm': ("Maf'ul muthlaq", 'nashab'), 'ml': ("Maf'ul li ajlih", 'nashab'),
 'zf': ("Zharaf (maf'ul fih)", 'nashab'), 'ms': ("Mustatsna", None), 'hl': ("Hal", 'nashab'), 'tm': ("Tamyiz", 'nashab'),
 'ma': ("Mudhaf ilaih", 'jar'), 'mj': ("Majrur", 'jar'),
 'na': ("Na'at (sifat)", 'tabi'), 'bd': ("Badal", 'tabi'), 'ab': ("'Athaf bayan", 'tabi'),
 'mt': ("Ma'thuf", 'tabi'), 'tk': ("Taukid", 'tabi'),
}

HURUF = {
 'و': "Huruf 'athaf (atau isti'naf), mabni, tidak punya mahal i'rab.",
 'ف': "Huruf fa' (sebab/ta'qib atau pengait jawab syarat), mabni, tidak punya mahal i'rab.",
 'ثم': "Huruf 'athaf, mabni, tidak punya mahal i'rab.",
 'او': "Huruf 'athaf (atau huruf pilihan), mabni, tidak punya mahal i'rab.",
 'ام': "Huruf 'athaf, mabni, tidak punya mahal i'rab.",
 'بل': "Huruf idhrab/'athaf, mabni, tidak punya mahal i'rab.",
 'لكن': "Huruf istidrak, mabni, tidak punya mahal i'rab.",
 'ان': "Huruf yang menashabkan isim dan merafa'kan khabar (taukid), mabni, tidak punya mahal i'rab.",
 'كان': "Huruf tasybih yang menashabkan isim dan merafa'kan khabar, mabni.",
 'لعل': "Huruf yang menashabkan isim dan merafa'kan khabar, mabni.",
 'ليت': "Huruf yang menashabkan isim dan merafa'kan khabar, mabni.",
 'لم': "Huruf nafi dan jazm (menjazmkan fi'il mudhari'), mabni, tidak punya mahal i'rab.",
 'لن': "Huruf nafi dan nashab (menashabkan fi'il mudhari'), mabni, tidak punya mahal i'rab.",
 'قد': "Huruf (taqlil/tahqiq), mabni, tidak punya mahal i'rab.",
 'الا': "Huruf istitsna' (pengecualian), mabni, tidak punya mahal i'rab.",
 'لا': "Huruf (nafi/nahi sesuai konteks), mabni, tidak punya mahal i'rab.",
 'ما': "Huruf (nafi atau mashdariyah sesuai konteks), mabni, tidak punya mahal i'rab.",
 'ل': "Huruf lam, mabni, tidak punya mahal i'rab.",
 'س': "Huruf istiqbal (masa depan), mabni, tidak punya mahal i'rab.",
 'سوف': "Huruf istiqbal (masa depan), mabni, tidak punya mahal i'rab.",
 'هل': "Huruf istifham (tanya), mabni, tidak punya mahal i'rab.",
 'ا': "Huruf istifham (tanya), mabni, tidak punya mahal i'rab.",
 'اي': "Huruf (tafsir/nida'), mabni, tidak punya mahal i'rab.",
 'حتي': "Huruf (jar atau 'athaf/ghayah sesuai konteks), mabni, tidak punya mahal i'rab.",
}

def huruf_text(w):
    sk = norm(clean(w))
    if sk in HURUF: return HURUF[sk]
    if len(sk) > 1 and sk[0] in 'وف' and sk[1:] in HURUF:
        pre = "Huruf 'athaf/isti'naf" if sk[0] == 'و' else "Huruf fa'"
        return f"{pre} bergabung dengan huruf berikutnya. {HURUF[sk[1:]]}"
    return "Huruf, mabni, tidak punya mahal i'rab."

def fiil_text(w):
    c = clean(w)
    k = re.sub('^[وف]' + FATHA + '?', '', c)          # buang wa/fa di depan
    k = re.sub('^سَ(?=[يتنأ])', '', k)
    last = k[-1:]
    pre = bool(re.match('^[يتنأ][' + FATHA + DAMMA + ']', k))
    if pre and re.search('ُوْنَ$|ُونَ$|َانِ$|ِيْنَ$', k):
        return "Fi'il mudhari', marfu' dengan tetapnya nun (af'alul khamsah)."
    if re.search('(تُ|تَ|تِ|تُمْ|نَا)$', k):
        return "Fi'il madhi bersambung dengan dhamir rafa' (ta'/na), mabni sukun."
    if k.endswith('تْ'):
        return "Fi'il madhi bersambung dengan ta' ta'nits sakinah, mabni fathah."
    if re.search('ُوْا$|ُوا$', k):
        r = k[:-3] if k.endswith('ُوْا') else k[:-2]
        if r.endswith(FATHA): return "Fi'il madhi bersambung dengan wawu jama'ah, mabni dhammah."
        return None
    if pre and last == DAMMA:
        return "Fi'il mudhari', marfu', tandanya dhammah."
    if pre and re.search('[ِ]يْ$|[ِ]ي$|َى$|َىٰ$', k) and k[:1] in 'يتنأ' and not k.endswith('َى'):
        return "Fi'il mudhari', marfu', tandanya dhammah muqaddarah."
    if norm(k) in ('تعالي', 'تعالى') or (re.search('َىٰ?$', k) and not pre):
        return "Fi'il madhi, mabni fathah muqaddarah."
    if k[:1] == 'ي' and pre and last == FATHA:
        return "Fi'il mudhari', manshub (didahului nashib), tandanya fathah."
    if k[:1] == 'ي' and pre and last == SUK:
        return "Fi'il mudhari', majzum (didahului jazim), tandanya sukun."
    if last == FATHA and not re.match('^[يتن][' + FATHA + DAMMA + ']', k):
        return "Fi'il madhi, mabni fathah."
    return None

def jar_prefix(c):
    m = re.match('^(?:[وف]' + FATHA + '?)?(بِ|لِ|كَ|فِيْ|فِي|مِنْ|عَنْ|إِلَىٰ?|عَلَىٰ?)', c)
    return m.group(1) if m else None

SUFFIX_RE = re.compile('(هُ|هِ|هَا|هُمَا|هُمْ|هُنَّ|هِمْ|هِمَا|كَ|كِ|كُمْ|نَا|ـيْ)$')

def auto_line(word, code):
    c = clean(word)
    if code == 'jr':
        return "Huruf jar, mabni, tidak punya mahal i'rab; menjarkan isim sesudahnya."
    if code == 'hr':
        return huruf_text(word)
    if code == 'fi':
        return fiil_text(word) or "Fi'il."
    if code not in ROLE:
        return None
    role, cls = ROLE[code]
    st, tanda = status_from_tail(word)
    suffix = bool(SUFFIX_RE.search(c)) and norm(c) not in ('الله', 'وجه')
    if code == 'mj':
        jp = jar_prefix(c)
        base = "Majrur"
        if jp and jp in ('بِ', 'لِ', 'كَ'):
            base = f"Terdiri dari huruf jar {jp[0]} dan isim majrur"
        else:
            base = "Majrur oleh huruf jar sebelumnya"
        if st == 'jar' and not suffix: return f"{base}, tandanya {tanda}."
        if st == 'nj' and not suffix: return f"{base}, tandanya {tanda}."
        return f"{base}."
    if cls == 'tabi':
        if st in ('rafa', 'nashab', 'jar') and not suffix:
            return f"{role}, {ST[st]} mengikuti kata yang disifati/di-'athaf-kan (matbu'), tandanya {tanda}."
        return f"{role}, i'rabnya mengikuti matbu'-nya."
    if cls is None:
        if st in ('rafa', 'nashab', 'jar') and not suffix:
            return f"{role}, {ST[st]}, tandanya {tanda}."
        return f"{role}."
    # peran dengan status tetap
    if st == cls and not suffix:
        return f"{role}, {ST[cls]}, tandanya {tanda}."
    if st == 'nj' and not suffix and cls in ('nashab', 'jar'):
        return f"{role}, {ST[cls]}, tandanya {tanda}."
    if st == 'rafa' and cls == 'rafa' and 'wawu' in tanda or 'alif' in tanda:
        return f"{role}, {ST[cls]}, tandanya {tanda}."
    return f"{role}, {ST[cls]}."

def merge_para(p):
    words = []
    for l in p['w'].split('\n'):
        l = l.strip()
        if not l: continue
        a, t, k = (l.split('|') + ['', '', ''])[:3]
        words.append((a.strip().lstrip('*'), k.strip()))
    man = []
    for l in (p.get('i') or '').split('\n'):
        l = l.strip()
        if not l or '::' not in l: continue
        a, x = l.split('::', 1)
        man.append([a.strip(), x.strip(), None])
    mkeys = []
    for a, x, _ in man:
        toks = set(); cks = set()
        for t in a.split():
            toks.add(norm(t)); cks.add(core(t))
        toks.add(norm(a)); cks.add(core(a))
        mkeys.append((toks, cks))
    pos = [None] * len(man)
    cover = [None] * len(words)  # indeks baris manual yang menutup kata
    for wi, (w, k) in enumerate(words):
        nw, cw = norm(clean(w)), core(clean(w))
        for mi, (toks, cks) in enumerate(mkeys):
            if (nw and nw in toks) or (cw and len(cw) > 1 and cw in cks):
                cover[wi] = mi
                if pos[mi] is None: pos[mi] = wi
                break
    out = []  # (urut, a, x)
    last = -1
    for mi, (a, x, _) in enumerate(man):
        if pos[mi] is None: pos[mi] = last + 0.5
        last = pos[mi]
        out.append((pos[mi], 0, a, x))
    added = 0
    for wi, (w, k) in enumerate(words):
        if cover[wi] is not None: continue
        t = auto_line(w, k)
        if not t: continue
        out.append((wi, 1, clean(w), '~' + t)); added += 1
    out.sort(key=lambda r: (r[0], r[1]))
    return '\n'.join(f'{a} :: {x}' for _, _, a, x in out), added

if __name__ == '__main__':
    d = sys.argv[1]
    tot = 0; words = 0
    for f in sorted(glob.glob(d + '/*.json')):
        j = json.load(open(f, encoding='utf-8'))
        for p in j['p']:
            p['i'], n = merge_para(p); tot += n
        json.dump(j, open(f, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('i\'rab otomatis ditambahkan:', tot)
