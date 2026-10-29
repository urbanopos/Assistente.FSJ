package br.com.fsj.agente

import android.app.Activity
import android.os.Bundle
import android.content.Intent
import android.net.Uri
import android.widget.*
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import kotlin.concurrent.thread

class MainActivity : Activity() {
 private lateinit var endpoint: EditText
 private lateinit var token: EditText
 private lateinit var status: TextView
 private lateinit var jobs: LinearLayout
 private val prefs by lazy { getSharedPreferences("fsj", MODE_PRIVATE) }
 override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  val root=LinearLayout(this).apply { orientation=LinearLayout.VERTICAL; setPadding(30,40,30,20) }
  root.addView(TextView(this).apply { text="AGENTE ANDROID FSJ — DISPARO AUTOMÁTICO";textSize=20f })
  endpoint=EditText(this).apply { hint="Endereço HTTPS da API FSJ";setSingleLine();setText(prefs.getString("endpoint","")) }
  token=EditText(this).apply { hint="Token privado da API";setSingleLine();inputType=129;setText(prefs.getString("token","")) }
  root.addView(endpoint);root.addView(token)
  val btn=Button(this).apply { text="Consultar disparos pendentes";setOnClickListener { fetchJobs() } }
  root.addView(btn)
  status=TextView(this).apply { text="Nenhum envio efetuado.";textSize=15f }
  root.addView(status)
  val scroll=ScrollView(this);jobs=LinearLayout(this).apply { orientation=LinearLayout.VERTICAL };scroll.addView(jobs);root.addView(scroll)
  setContentView(root)
 }
 private fun request(path:String, method:String="GET", body:String?=null):String {
  val base=endpoint.text.toString().trim().trimEnd('/')
  if(!base.startsWith("https://")) throw IllegalArgumentException("Exija HTTPS para proteger o token.")
  val c=(URL(base+path).openConnection() as HttpURLConnection)
  c.requestMethod=method;c.connectTimeout=10000;c.readTimeout=10000
  c.setRequestProperty("Authorization","Bearer "+token.text.toString())
  if(body!=null){c.doOutput=true;c.setRequestProperty("Content-Type","application/json");c.outputStream.use { it.write(body.toByteArray()) }}
  val code=c.responseCode
  val result=(if(code in 200..299)c.inputStream else c.errorStream).bufferedReader().use { it.readText() }
  c.disconnect();if(code !in 200..299)throw IllegalStateException("API HTTP $code: $result")
  return result
 }
 private fun fetchJobs(){
  prefs.edit().putString("endpoint",endpoint.text.toString().trim()).putString("token",token.text.toString()).apply()
  status.text="Consultando..."
  thread {
   try {
    val array=JSONObject(request("/v1/android/pendentes")).getJSONArray("jobs")
    runOnUiThread {
     jobs.removeAllViews()
     status.text="${array.length()} programação(ões) pendente(s)."
     for(i in 0 until array.length()){
      val j=array.getJSONObject(i)
      val id=j.getString("id")
      val pessoa=j.getString("pessoa_id")
      val msg=j.getString("mensagem")
      val box=LinearLayout(this).apply { orientation=LinearLayout.VERTICAL }
      box.addView(TextView(this).apply { text="Destinatário ID: $pessoa — ${j.getString("dia")} ${j.getString("horario")}" })
      box.addView(TextView(this).apply { text=msg.take(200) })
      box.addView(Button(this).apply { text="Abrir WhatsApp (envio manual)";setOnClickListener { openWhatsapp(id,msg) } })
      jobs.addView(box)
     }
    }
   } catch(e:Exception){runOnUiThread { status.text="Erro: ${e.message}" }}
  }
 }
 private fun openWhatsapp(id:String,msg:String){
  // O telefone não consta da API atual. Nunca presumir que pessoa_id seja número.
  val number=EditText(this).apply { hint="Número do destinatário com DDI (ex.: 5581...)";inputType=3 }
  android.app.AlertDialog.Builder(this).setTitle("Confirmar destinatário").setMessage("Confira o número cadastrado antes de abrir o WhatsApp. O envio final exige confirmação no aplicativo.").setView(number).setNegativeButton("Cancelar",null).setPositiveButton("Abrir"){_,_->
   val phone=number.text.toString().filter { it.isDigit() }
   if(phone.length !in 10..15){status.text="Número inválido.";return@setPositiveButton}
   val url="https://wa.me/$phone?text="+URLEncoder.encode(msg,"UTF-8")
   try {
    startActivity(Intent(Intent.ACTION_VIEW,Uri.parse(url)).apply { setPackage("com.whatsapp") })
    thread { try { request("/v1/android/jobs/$id/resultado","POST",JSONObject().put("estado","preparado").put("detalhe","Conversa aberta; envio não confirmado").toString()) } catch(_:Exception){} }
   } catch(e:Exception){status.text="WhatsApp indisponível: ${e.message}"}
  }.show()
 }
}
