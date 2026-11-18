import {connect} from '../wa.mjs';
import {normalizePhone} from '../core.mjs';
const expected=normalizePhone(process.env.FSJ_OWNER_PHONE||'');
const client=await connect(false);
try {
 const wid=client.info?.wid;
 const resolved=await client.getNumberId(expected);
 console.log('TIPO_IDENTIFICADOR:',wid?.server||'indisponivel');
 console.log('FINAL_IDENTIFICADOR:',String(wid?.user||'').slice(-4));
 console.log('NUMERO_CADASTRADO_RECONHECIDO:',Boolean(resolved));
 console.log('IDENTIFICADORES_COINCIDEM:',Boolean(wid?._serialized&&resolved?._serialized&&wid._serialized===resolved._serialized));
 console.log('FINAL_NUMERO_RECONHECIDO:',String(resolved?.user||'').slice(-4));
} finally {await client.destroy();}
