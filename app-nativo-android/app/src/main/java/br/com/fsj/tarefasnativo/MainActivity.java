package br.com.fsj.tarefasnativo;
import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.widget.*;
import android.view.View;
import java.net.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.*;
import org.json.*;
public class MainActivity extends Activity {
 private final ExecutorService pool=Executors.newSingleThreadExecutor();
 private LinearLayout root;
 private TextView status;
 private void label(String value,int size){TextView t=new TextView(this);t.setText(value);t.setTextSize(size);t.setTextColor(Color.rgb(20,80,58));t.setPadding(8,12,8,12);root.addView(t);}
 private void message(String s){runOnUiThread(()->status.setText(s));}
 @Override public void onCreate(Bundle state){super.onCreate(state);ScrollView scroll=new ScrollView(this);root=new LinearLayout(this);root.setOrientation(1);root.setPadding(20,28,20,20);root.setBackgroundColor(Color.WHITE);scroll.addView(root);setContentView(scroll);label("FAZENDA SÃO JOSÉ",25);label("Assistente FSJ — Tarefas",20);label("Aplicativo Android nativo. Piloto isolado: sem alterações nas tarefas existentes.",15);status=new TextView(this);status.setPadding(8,20,8,20);root.addView(status);Button b=new Button(this);b.setText("Verificar conexão com o projeto");root.addView(b);b.setOnClickListener(v->check());check();}
 private void check(){message("Consultando repositório...");pool.execute(()->{try{HttpURLConnection c=(HttpURLConnection)new URL("https://api.github.com/repos/urbanopos/Assistente.FSJ").openConnection();c.setConnectTimeout(10000);c.setReadTimeout(12000);c.setRequestProperty("Accept","application/vnd.github+json");int code=c.getResponseCode();if(code!=200)throw new IOException("HTTP "+code);String data;try(InputStream in=c.getInputStream()){data=new String(in.readAllBytes(),StandardCharsets.UTF_8);}JSONObject j=new JSONObject(data);message("Conexão estabelecida com "+j.optString("full_name")+"\\nVersão principal: "+j.optString("default_branch")+"\\n\\nAcesso às tarefas será liberado após validação de autenticação e permissões por usuário.");c.disconnect();}catch(Exception e){message("Conexão indisponível: "+e.getMessage());}});}
 @Override protected void onDestroy(){pool.shutdownNow();super.onDestroy();}
}
