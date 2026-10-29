const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{stripTypeScriptTypes}=require('node:module');
const token='11111111-1111-4111-8111-111111111111';
(async()=>{for(const name of ['resposta-tarefa','supervisao']){
 const src=fs.readFileSync((process.argv[2]?process.argv[2]+'/'+name+'.ts':'supabase/functions/'+name+'/index.ts'),'utf8');new vm.Script(stripTypeScriptTypes(src));const h=src.slice(src.indexOf('async function fsjOwnerAccessToken'),src.indexOf('Deno.serve'));
 const ctx={};vm.createContext(ctx);vm.runInContext(h,ctx);
 const lookup=(id='owner',active=true,expires='2099-01-01T00:00:00Z')=>async path=>path.startsWith('fsj_titularidade')?[{pessoa_id:'owner'}]:path.startsWith('quadros_do_dia')?[{pessoa_id:id,expira_em:expires}]:path.startsWith('pessoas')?(active?[{id}]:[]):[];
 assert.equal(await ctx.fsjOwnerAccessToken(token,lookup()),true);
 assert.equal(await ctx.fsjOwnerAccessToken(token,lookup('employee')),false);
 assert.equal(await ctx.fsjOwnerAccessToken(token,lookup('owner',false)),false);
 assert.equal(await ctx.fsjOwnerAccessToken(token,lookup('owner',true,'2020-01-01T00:00:00Z')),false);
 assert.equal(await ctx.fsjOwnerAccessToken('owner',lookup()),false);
 assert(src.includes('if(!ownerScheduleAccess&&await db'));
 }
 console.log('PASS: proprietário reconhecido pelo token e titularidade ativos; outros perfis, token inválido e expirado não ganham exceção.');
})().catch(e=>{console.error(e);process.exitCode=1;});