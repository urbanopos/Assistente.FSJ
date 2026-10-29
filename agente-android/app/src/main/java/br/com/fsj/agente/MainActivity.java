package br.com.fsj.agente;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.content.SharedPreferences;

/** Versão inicial segura: controle de ativação local; nenhum envio sem implementação e validação. */
public class MainActivity extends Activity {
    private SharedPreferences prefs;
    private TextView status;
    private boolean ativo;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        prefs=getSharedPreferences("fsj_agente",MODE_PRIVATE);
        ativo=prefs.getBoolean("ativo",false);
        LinearLayout layout=new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(30,45,30,30);
        layout.setBackgroundColor(Color.WHITE);
        TextView titulo=new TextView(this);
        titulo.setText("FAZENDA SÃO JOSÉ\nAgente Android — teste");
        titulo.setTextSize(24);
        titulo.setTextColor(Color.rgb(23,91,66));
        layout.addView(titulo);
        status=new TextView(this);
        status.setTextSize(17);
        status.setPadding(0,30,0,25);
        layout.addView(status);
        Button alternar=new Button(this);
        layout.addView(alternar);
        Runnable render=()->{
            status.setText(ativo?"Controle ativo. Envio automático ainda indisponível nesta versão.":"Desativado. Nenhum envio automático será realizado.");
            alternar.setText(ativo?"DESATIVAR":"ATIVAR CONTROLE (SEM ENVIO)");
        };
        alternar.setOnClickListener(v->{
            ativo=!ativo;
            prefs.edit().putBoolean("ativo",ativo).apply();
            render.run();
        });
        render.run();
        TextView nota=new TextView(this);
        nota.setPadding(0,30,0,0);
        nota.setText("Esta versão valida instalação e o botão de desativação. Não envia mensagens nem acessa o WhatsApp. O envio automático exigirá desenvolvimento e teste separados.");
        layout.addView(nota);
        setContentView(layout);
    }
}
