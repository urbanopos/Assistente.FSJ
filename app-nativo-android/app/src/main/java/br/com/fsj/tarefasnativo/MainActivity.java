package br.com.fsj.tarefasnativo;
import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.widget.*;
import android.text.InputType;
import android.net.Uri;

public class MainActivity extends Activity {
  private static final String PREFIX="https://urbanopos.github.io/Assistente.FSJ/";
  private WebView web;
  private SharedPreferences prefs;
  private boolean allowed(String url) {
    try {
      Uri u=Uri.parse(url.trim());
      return "https".equalsIgnoreCase(u.getScheme()) &&
        "urbanopos.github.io".equalsIgnoreCase(u.getHost()) &&
        u.getPath()!=null && u.getPath().startsWith("/Assistente.FSJ/") &&
        (u.getFragment()!=null && u.getFragment().startsWith("token="));
    } catch(Exception e){return false;}
  }
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    prefs=getSharedPreferences("fsj_access",MODE_PRIVATE);
    String incoming=getIntent().getDataString();\n    if(incoming!=null && incoming.startsWith("fsj://vincular")){\n      String t=Uri.parse(incoming).getQueryParameter("token");\n      if(t!=null && t.matches("[a-fA-F0-9-]{36}"))incoming=PREFIX+"inicio-usuario.html#token="+t;\n    }
    if(incoming!=null && allowed(incoming)){prefs.edit().putString("link",incoming).apply();}
    String link=prefs.getString("link",null);
    if(link==null){setup();} else {open(link);}
  }
  private void setup(){
    // Sem formulario de instalacao ou configuracao. O link individual abre
    // o aplicativo via intent Android e fornece o token somente no aparelho.
    Intent browser=new Intent(Intent.ACTION_VIEW,Uri.parse(PREFIX+"inicio-usuario.html"));
    startActivity(browser);
    finish();
  }
  private void open(String link){
    web=new WebView(this);
    web.getSettings().setJavaScriptEnabled(true);
    web.getSettings().setDomStorageEnabled(true);
    web.getSettings().setAllowFileAccess(false);
    web.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    web.setWebChromeClient(new WebChromeClient());
    web.setWebViewClient(new WebViewClient(){
      @Override public boolean shouldOverrideUrlLoading(WebView view,String url){
        Uri u=Uri.parse(url);
        if("https".equalsIgnoreCase(u.getScheme()) && "urbanopos.github.io".equalsIgnoreCase(u.getHost())) return false;
        try{startActivity(new Intent(Intent.ACTION_VIEW,u));}catch(Exception ignored){}
        return true;
      }
    });
    setContentView(web);web.loadUrl(link);
  }
  @Override public void onBackPressed(){
    if(web!=null && web.canGoBack())web.goBack();else super.onBackPressed();
  }
  @Override protected void onDestroy(){if(web!=null)web.destroy();super.onDestroy();}
}