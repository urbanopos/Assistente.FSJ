from pathlib import Path
import base64,json,zlib
root=Path(__file__).resolve().parent
payload={'tv_library_form.py':(root/'tv_library_form.py').read_text(),'static/tv-library-form.js':(root/'form.js').read_text(),'static/tv-library-form.css':(root/'form.css').read_text()}
blob=base64.b64encode(zlib.compress(json.dumps(payload,ensure_ascii=False).encode(),9)).decode()
template=(root/'install-template.py').read_text().replace('import datetime,json,os,re,shutil,sqlite3,ssl,subprocess,sys,time,urllib.request','import base64,zlib,datetime,json,os,re,shutil,sqlite3,ssl,subprocess,sys,time,urllib.request').replace('PAYLOAD={} # bundled by build.py',"PAYLOAD=json.loads(zlib.decompress(base64.b64decode("+repr(blob)+")).decode())")
compile(template,'install.py','exec');(root/'install.py').write_text(template)
