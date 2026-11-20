"""Ajuste de fonte nativa; recompilação e assinatura do APK são necessárias."""
from pathlib import Path
import sys

def patch(text):
 old='exit.setText("⊡");'
 assert text.count(old)==1,'Botão nativo diferente do esperado.'
 text=text.replace(old,'exit.setText("Fechar tela cheia");exit.setTextColor(Color.WHITE);exit.setTextSize(15);exit.setAllCaps(false);android.graphics.drawable.GradientDrawable background=new android.graphics.drawable.GradientDrawable();background.setColor(Color.rgb(23,75,59));background.setCornerRadius(12*getResources().getDisplayMetrics().density);exit.setBackground(background);')
 old='new android.widget.FrameLayout.LayoutParams(size,size,android.view.Gravity.TOP|android.view.Gravity.RIGHT)'
 assert text.count(old)==1,'Posição nativa diferente do esperado.'
 text=text.replace(old,'new android.widget.FrameLayout.LayoutParams((int)(170*getResources().getDisplayMetrics().density),size,android.view.Gravity.BOTTOM|android.view.Gravity.CENTER_HORIZONTAL)')
 text=text.replace('frame.addView(exit,p);','p.bottomMargin=(int)(24*getResources().getDisplayMetrics().density);frame.addView(exit,p);')
 return text

if __name__=='__main__':
 source=Path(sys.argv[1]);result=patch(source.read_text());source.with_suffix('.java.footer-backup').write_bytes(source.read_bytes());source.write_text(result)
