package br.com.fsj.tarefas;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.graphics.Color;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.ValueCallback;
import android.webkit.CookieManager;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Button;
import android.widget.Toast;

/** Aplicativo de acesso direto ao FSJ publicado, sem replicar credenciais nem permissões. */
public class MainActivity extends Activity {
    private static final String HOME="https://urbanopos.github.io/Assistente.FSJ/";
    private WebView web;
    private ValueCallback<Uri[]> files;
    private static final int PICK_FILE=419;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout root=new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);
        LinearLayout bar=new LinearLayout(this);
        bar.setBackgroundColor(Color.rgb(23,91,66));
        TextView name=new TextView(this);
        name.setText("  FAZENDA SÃO JOSÉ  •  Tarefas");
        name.setTextColor(Color.WHITE);
        name.setTextSize(16);
        name.setPadding(8,16,0,16);
        bar.addView(name,new LinearLayout.LayoutParams(0,-2,1));
        Button refresh=new Button(this);
        refresh.setText("↻");
        refresh.setContentDescription("Atualizar tarefas");
        refresh.setOnClickListener(v->web.reload());
        bar.addView(refresh);
        root.addView(bar);
        web=new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(true);
        web.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        CookieManager.getInstance().setAcceptCookie(true);
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u=request.getUrl();
                if("https".equals(u.getScheme()) && ("urbanopos.github.io".equals(u.getHost()) || "github.com".equals(u.getHost()) || "accounts.google.com".equals(u.getHost()))) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW,u)); } catch(Exception e){Toast.makeText(MainActivity.this,"Link indisponível",Toast.LENGTH_SHORT).show();}
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params){
                if(files!=null)files.onReceiveValue(null);
                files=callback;
                try { startActivityForResult(params.createIntent(),PICK_FILE); return true; }
                catch(Exception e){files=null;return false;}
            }
        });
        root.addView(web,new LinearLayout.LayoutParams(-1,0,1));
        setContentView(root);
        web.loadUrl(HOME);
    }
    @Override protected void onActivityResult(int request,int result,Intent data){
        super.onActivityResult(request,result,data);
        if(request==PICK_FILE&&files!=null){files.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data));files=null;}
    }
    @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
    @Override protected void onDestroy(){if(web!=null)web.destroy();super.onDestroy();}
}
