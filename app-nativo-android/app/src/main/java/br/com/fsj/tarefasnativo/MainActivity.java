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
    String incoming=getIntent().getDataString();
    if(incoming!=null && allowed(incoming)){prefs.edit().putString("link",incoming).apply();}
    String link=prefs.getString("link",null);
    if(link==null){setup();} else {open(link);}
  }
  private void setup(){
    LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.VERTICAL);
    l.setPadding(28,45,28,24);l.setBackgroundColor(Color.WHITE);
    TextView title=new TextView(this);title.setText("Fazenda São José\nAssistente FSJ – Tarefas");
    title.setTextSize(23);title.setTextColor(Color.rgb(24,83,54));l.addView(title);
    TextView info=new TextView(this);
    info.setText("Na primeira abertura, cole seu link individual recebido pelo WhatsApp. O aplicativo o guardará neste aparelho para os próximos acessos.");
    info.setPadding(0,24,0,16);l.addView(info);
    EditText input=new EditText(this);input.setHint("Cole seu link individual https://...");
    input.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_URI);
    input.setSingleLine(false);l.addView(input);
    Button save=new Button(this);save.setText("Vincular e abrir");l.addView(save);
    save.setOnClickListener(v->{String url=input.getText().toString().trim();
      if(!allowed(url)){input.setError("Use o link individual do Assistente FSJ com token.");return;}
      prefs.edit().putString("link",url).apply();open(url);
    });
    setContentView(l);
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