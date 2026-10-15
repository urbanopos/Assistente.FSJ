package br.com.fazendasaojose.reserva;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Message;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;
import java.io.ByteArrayInputStream;

public class MainActivity extends Activity {
 private static final String ROOT="https://urbanopos.github.io/Assistente.FSJ/";
 private static final String START=ROOT+"reserva/?app=android";
 private WebView web;
 private LinearLayout authBar;
 private ValueCallback<Uri[]> fileCallback;
 private boolean closing=false;
 static boolean ownPage(String url){Uri u=Uri.parse(url);return "https".equals(u.getScheme())&&"urbanopos.github.io".equals(u.getHost())&&u.getPath()!=null&&u.getPath().startsWith("/Assistente.FSJ/");}
 static boolean verification(String url){Uri u=Uri.parse(url);return "https".equals(u.getScheme())&&"awrxnzbfrsaurzpunuko.supabase.co".equals(u.getHost())&&"/auth/v1/verify".equals(u.getPath());}
 @Override public void onCreate(Bundle state){super.onCreate(state);
  LinearLayout layout=new LinearLayout(this);layout.setOrientation(LinearLayout.VERTICAL);layout.setBackgroundColor(Color.rgb(7,94,84));
  web=new WebView(this);layout.addView(web,new LinearLayout.LayoutParams(-1,0,1));
  authBar=new LinearLayout(this);Button paste=new Button(this);paste.setText("Colar link de acesso");paste.setOnClickListener(v->pasteAccess());authBar.addView(paste,new LinearLayout.LayoutParams(0,-2,1));Button reload=new Button(this);reload.setText("Abrir Reserva");reload.setOnClickListener(v->web.loadUrl(START));authBar.addView(reload);layout.addView(authBar);setContentView(layout);
  // Android 15 edge-to-edge: keep the app below system bars and above the keyboard.
  layout.setOnApplyWindowInsetsListener((v,insets)->{if(android.os.Build.VERSION.SDK_INT>=30){android.graphics.Insets bars=insets.getInsets(android.view.WindowInsets.Type.systemBars()|android.view.WindowInsets.Type.ime());v.setPadding(bars.left,bars.top,bars.right,bars.bottom);}else{v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());}return insets;});
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setSupportMultipleWindows(true);s.setUserAgentString(s.getUserAgentString()+" FSJReservaAndroid/0.1");CookieManager.getInstance().setAcceptCookie(true);
  web.addJavascriptInterface(new ExitBridge(),"FSJAndroid");
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest req){String url=req.getUrl().toString();if(ownPage(url))return false;if(verification(url)&&req.isForMainFrame()){web.removeJavascriptInterface("FSJAndroid");return false;}if(req.isForMainFrame())external(url);return true;}
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest req){if(!req.isForMainFrame()&&req.getRequestHeaders().containsKey("Sec-Fetch-Dest")&&"iframe".equals(req.getRequestHeaders().get("Sec-Fetch-Dest"))&&!ownPage(req.getUrl().toString()))return new WebResourceResponse("text/plain","UTF-8",new ByteArrayInputStream(new byte[0]));return null;}
   @Override public void onPageFinished(WebView view,String url){if(closing||!ownPage(url))return;web.addJavascriptInterface(new ExitBridge(),"FSJAndroid");web.evaluateJavascript("!!localStorage.getItem('fsj_access_token')",value->{if(closing)return;boolean ready="true".equals(value);authBar.setVisibility(ready&&Uri.parse(url).getPath().startsWith("/Assistente.FSJ/reserva/")?View.GONE:View.VISIBLE);});}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public void onCloseWindow(WebView window){closeApp();}
   @Override public boolean onJsAlert(WebView view,String url,String message,JsResult result){if(!ownPage(url)){result.cancel();return true;}new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton("OK",(d,w)->result.confirm()).setOnCancelListener(d->result.cancel()).show();return true;}
   @Override public boolean onJsConfirm(WebView view,String url,String message,JsResult result){if(!ownPage(url)){result.cancel();return true;}new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton("Confirmar",(d,w)->result.confirm()).setNegativeButton("Cancelar",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show();return true;}
   @Override public boolean onCreateWindow(WebView view,boolean dialog,boolean gesture,Message result){if(!gesture)return false;WebView popup=new WebView(MainActivity.this);popup.setWebViewClient(new WebViewClient(){@Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest req){String url=req.getUrl().toString();if(ownPage(url))web.loadUrl(url);else external(url);popup.destroy();return true;}});((WebView.WebViewTransport)result.obj).setWebView(popup);result.sendToTarget();return true;}
   @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=callback;Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType("*/*");intent.putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"image/*","video/*","audio/*"});intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,true);try{startActivityForResult(intent,700);}catch(Exception e){fileCallback.onReceiveValue(null);fileCallback=null;}return true;}
  });web.loadUrl(START);
 }
 private void pasteAccess(){ClipboardManager clipboard=(ClipboardManager)getSystemService(CLIPBOARD_SERVICE);ClipData clip=clipboard.getPrimaryClip();if(clip==null||clip.getItemCount()==0){Toast.makeText(this,"Copie primeiro o link de acesso do e-mail.",Toast.LENGTH_LONG).show();return;}String url=clip.getItemAt(0).coerceToText(this).toString().trim();if(!(verification(url)||(ownPage(url)&&Uri.parse(url).getFragment()!=null&&Uri.parse(url).getFragment().contains("access_token=")))){new AlertDialog.Builder(this).setMessage("No principal, solicite seu link de acesso. Copie o endereço do botão recebido por e-mail e volte aqui para colar. Somente links oficiais do FSJ são aceitos.").setPositiveButton("OK",null).show();return;}if(verification(url))web.removeJavascriptInterface("FSJAndroid");web.loadUrl(url);}
 private void external(String url){Uri u=Uri.parse(url);if(!("https".equals(u.getScheme())||"mailto".equals(u.getScheme())||"tel".equals(u.getScheme())))return;try{startActivity(new Intent(Intent.ACTION_VIEW,u));}catch(Exception ignored){}}
 private void reminderPermissions(){if(android.os.Build.VERSION.SDK_INT>=33&&checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)!=android.content.pm.PackageManager.PERMISSION_GRANTED){requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS},801);return;}exactPermission();}
 private void exactPermission(){if(android.os.Build.VERSION.SDK_INT>=31){android.app.AlarmManager a=(android.app.AlarmManager)getSystemService(ALARM_SERVICE);if(!a.canScheduleExactAlarms()&&!DailyReminder.prefs(this).getBoolean("asked_exact",false)){DailyReminder.prefs(this).edit().putBoolean("asked_exact",true).apply();new AlertDialog.Builder(this).setTitle("Sinalização às 7h").setMessage("Permita alarmes para marcar o quadro não lido no horário programado. A sinalização será sem som e respeitará suas folgas.").setPositiveButton("Configurar",(d,w)->startActivity(new Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,Uri.parse("package:"+getPackageName())))).setNegativeButton("Depois",null).show();}}DailyReminder.schedule(this);}
 @Override public void onRequestPermissionsResult(int request,String[] permissions,int[] results){super.onRequestPermissionsResult(request,permissions,results);if(request==801)exactPermission();}
 @Override protected void onResume(){super.onResume();if(DailyReminder.configured(this))DailyReminder.schedule(this);}
 public final class ExitBridge{
 @JavascriptInterface public String getDeviceId(){return DailyReminder.deviceId(MainActivity.this);}
 @JavascriptInterface public boolean hasReminder(){return DailyReminder.configured(MainActivity.this);}
 @JavascriptInterface public void configureReminder(String key){if(key!=null&&key.matches("fsjr_[0-9a-f]{64}")){DailyReminder.prefs(MainActivity.this).edit().putString("device_key",key).apply();runOnUiThread(()->{reminderPermissions();DailyReminder.schedule(MainActivity.this);});}}
 @JavascriptInterface public void markRead(){runOnUiThread(()->DailyReminder.clear(MainActivity.this));}
 @JavascriptInterface public void closeApp(){runOnUiThread(()->MainActivity.this.closeApp());}}
 private void closeApp(){if(closing)return;closing=true;web.stopLoading();web.loadUrl("about:blank");Toast.makeText(this,"Aplicativo encerrado",Toast.LENGTH_SHORT).show();finishAndRemoveTask();}
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else closeApp();}
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request==700&&fileCallback!=null){Uri[] values=null;if(result==RESULT_OK&&data!=null){if(data.getClipData()!=null){ClipData clips=data.getClipData();int n=Math.min(3,clips.getItemCount());values=new Uri[n];for(int i=0;i<n;i++)values[i]=clips.getItemAt(i).getUri();}else if(data.getData()!=null)values=new Uri[]{data.getData()};}fileCallback.onReceiveValue(values);fileCallback=null;}}
 @Override protected void onDestroy(){if(fileCallback!=null)fileCallback.onReceiveValue(null);if(web!=null){web.removeJavascriptInterface("FSJAndroid");web.destroy();}super.onDestroy();}
}
