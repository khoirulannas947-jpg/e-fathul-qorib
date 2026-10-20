# Bangun situs Vercel dari sumber: node build.js -> repo e-fathul-qorib (index.html, data/, sumber/)
import subprocess, shutil, os, glob
SRC='/home/claude/efq'; DST='/home/claude/e-fathul-qorib'
out=subprocess.run(['node','build.js'],cwd=SRC,capture_output=True,text=True).stdout
print(out[:160])
assert out.startswith('ok')
body=open(f'{SRC}/out/index.html',encoding='utf-8').read()
fav="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2317594a'/%3E%3Ctext x='32' y='44' font-size='36' text-anchor='middle' fill='%23fbf8ef' font-family='serif'%3E%D9%82%3C/text%3E%3C/svg%3E"
head=f'''<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Kitab Fathul Qorib lengkap: makna dan kedudukan per kata, terjemah, i'rab, penjelasan per paragraf, dan mind map tiap bab.">
<meta name="theme-color" content="#17594a">
<meta name="robots" content="noindex">
<link rel="icon" href="{fav}">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Fathul Qorib">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<style>[hidden]{{display:none!important}}:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}</style>
<script src="/auth-config.js"></script>
<script src="/auth-client.js"></script>
'''
open(f'{DST}/index.html','w',encoding='utf-8').write(head+body+'\n</html>\n')
shutil.rmtree(f'{DST}/data',ignore_errors=True); shutil.copytree(f'{SRC}/out/data',f'{DST}/data')
k=subprocess.run(['python3','build_kamus.py',f'{SRC}/out/data',f'{DST}/data/kamus.json'],cwd=SRC,capture_output=True,text=True)
print(k.stdout.strip() or k.stderr[-400:]); assert k.returncode==0
s=f'{DST}/sumber'; shutil.rmtree(s,ignore_errors=True); os.makedirs(s)
for d in ['data','mm']: shutil.copytree(f'{SRC}/{d}',f'{s}/{d}')
for f in ['babs.js','app.js','template.html','build.js','make_site.py','build_kamus.py']: shutil.copy(f'{SRC}/{f}',s)
print('situs diperbarui')
