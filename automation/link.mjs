import {connect} from './wa.mjs';
const client=await connect(true);
console.log('WhatsApp vinculado. A sessão foi salva somente no computador executor.');
await client.destroy();
