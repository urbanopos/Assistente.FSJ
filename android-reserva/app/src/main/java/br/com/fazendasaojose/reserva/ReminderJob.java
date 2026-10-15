package br.com.fazendasaojose.reserva;
import android.app.job.*;
import org.json.JSONObject;
import java.net.*;
import java.nio.charset.StandardCharsets;
public class ReminderJob extends JobService {
 private volatile boolean stopped=false;
 @Override public boolean onStartJob(JobParameters params){stopped=false;new Thread(()->{boolean retry=false;HttpURLConnection c=null;try{String key=DailyReminder.prefs(this).getString("device_key","");if(key.isEmpty())return;c=(HttpURLConnection)new URL("https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/fsj-reserva").openConnection();c.setRequestMethod("POST");c.setConnectTimeout(10000);c.setReadTimeout(15000);c.setDoOutput(true);c.setRequestProperty("Authorization","Bearer "+key);c.setRequestProperty("Content-Type","application/json");c.setRequestProperty("Origin","https://urbanopos.github.io");c.getOutputStream().write("{\"action\":\"device-status\"}".getBytes(StandardCharsets.UTF_8));int status=c.getResponseCode();if(status==401||status==403){DailyReminder.prefs(this).edit().remove("device_key").apply();DailyReminder.clear(this);return;}if(status!=200){retry=true;return;}java.io.ByteArrayOutputStream bytes=new java.io.ByteArrayOutputStream();try(java.io.InputStream input=c.getInputStream()){byte[] buf=new byte[2048];int n;while((n=input.read(buf))!=-1){bytes.write(buf,0,n);if(bytes.size()>65536)throw new java.io.IOException("Resposta inesperada");}}JSONObject data=new JSONObject(bytes.toString("UTF-8"));if(stopped)return;if(data.optBoolean("liberado")&&!data.optBoolean("lido"))DailyReminder.show(this,data.getString("dia"));else{DailyReminder.clear(this);retry=!data.optBoolean("apos_sete",true);}}catch(Exception e){retry=true;}finally{if(c!=null)c.disconnect();if(!stopped)jobFinished(params,retry);}},"fsj-unread-check").start();return true;}
 @Override public boolean onStopJob(JobParameters params){stopped=true;return true;}
}
