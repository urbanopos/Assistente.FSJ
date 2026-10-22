from pathlib import Path
import base64,hashlib,json,zlib
root=Path(__file__).resolve().parent
PREVIOUS_JS=['cc2d31d7f865f0fe0c4e7e4d7c713772cd42d378727d52595dab47e2c2690559', 'df842b88e0967543a9e700b5b8cbfe27dfb2f677b80721f7762ecaff1e400c18', '7cb84407f7b4fee1710c4d54991870a83be93c879544827e6156773d20ca0a4c', '2ec9a13a723defef3f85c19d5ccef79b6097123c96b166e921d37aca415907fb']
PREVIOUS_MODULE=['c23c9ed5ca6a53e821a654b24c87cb85e8e70f512b07a5fcc6661d58920ebcf0', '665376aa4e062363454d4f82f85a7464b94718025514a8b97fbf27a66e562fe3', 'ef397b3b3ecced938f2a4ad95f13edd5155ba229f8d29937606b9d0dfc507709']
payload={'static/tv-library-form.js':(root/'form.js').read_text(),'tv_library_form.py':(root/'tv_library_form.py').read_text()}
js=sorted(set(PREVIOUS_JS+[hashlib.sha256(payload['static/tv-library-form.js'].encode()).hexdigest()]))
module=sorted(set(PREVIOUS_MODULE+[hashlib.sha256(payload['tv_library_form.py'].encode()).hexdigest()]))
blob=base64.b64encode(zlib.compress(json.dumps(payload,ensure_ascii=False).encode(),9)).decode()
source=(root/'update-library-template.py').read_text().replace('PAYLOAD={} # generated','PAYLOAD=json.loads(zlib.decompress(base64.b64decode('+repr(blob)+')).decode())').replace('KNOWN_JS=set()','KNOWN_JS=set('+repr(js)+')').replace('KNOWN_MODULE=set()','KNOWN_MODULE=set('+repr(module)+')')
compile(source,'update-library.py','exec');(root/'update-library.py').write_text(source)
