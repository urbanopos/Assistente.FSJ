package br.com.fazendasaojose.proprietario;
import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.widget.Toast;
public final class MainActivity extends Activity {
 private static final String START="https://urbanopos.github.io/Assistente.FSJ/";
 private WebView web;
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  web=new WebView(this);
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
    Uri uri=request.getUrl();
    if ("https".equals(uri.getScheme()) && "urbanopos.github.io".equals(uri.getHost()) && uri.getPath()!=null && uri.getPath().startsWith("/Assistente.FSJ/")) return false;
    try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); } catch(Exception e) { Toast.makeText(MainActivity.this,"Link externo indisponível",Toast.LENGTH_SHORT).show(); }
    return true;
   }
  });
  WebSettings settings=web.getSettings();
  settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);
  settings.setAllowFileAccess(false);settings.setAllowContentAccess(false);
  settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  web.setWebChromeClient(new android.webkit.WebChromeClient());
  setContentView(web);web.loadUrl(START);
 }
 @Override public void onBackPressed(){if(web!=null&&web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override protected void onDestroy(){if(web!=null){web.destroy();web=null;}super.onDestroy();}
}
