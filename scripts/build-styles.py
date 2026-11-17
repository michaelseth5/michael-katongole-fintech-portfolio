"""Build the committed stylesheet in the exact historical cascade order.
No installation or framework required: python3 scripts/build-styles.py.
"""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parent.parent
sources=json.loads((root/'styles/manifest.json').read_text())
chunks=[]
for source in sources:
 css=(root/source['path']).read_text()
 if source.get('media'):css='@media '+source['media']+'{'+css+'}'
 chunks.append('/* '+source['path']+' */\n'+css)
# Collapse comments and repeated whitespace outside quoted strings. Keep all CSS
# values and selector order; do not merge or rewrite legacy rules.
css='\n'.join(chunks);parts=[];i=0;quote=None
while i<len(css):
 char=css[i]
 if quote:
  parts.append(char)
  if char=='\\' and i+1<len(css):i+=1;parts.append(css[i])
  elif char==quote:quote=None
 elif char in ['"',"'"]:quote=char;parts.append(char)
 elif css[i:i+2]=='/*':
  end=css.find('*/',i+2);i=len(css) if end<0 else end+1
 elif char.isspace():
  if parts and parts[-1]!=' ':parts.append(' ')
 else:parts.append(char)
 i+=1
(root/'portfolio.css').write_text(''.join(parts).strip()+'\n')
print('Built portfolio.css:',(root/'portfolio.css').stat().st_size,'bytes from',len(sources),'ordered sources')
