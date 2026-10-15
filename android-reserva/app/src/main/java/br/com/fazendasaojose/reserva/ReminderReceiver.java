package br.com.fazendasaojose.reserva;
import android.content.*;
public class ReminderReceiver extends BroadcastReceiver {
 @Override public void onReceive(Context c,Intent i){DailyReminder.schedule(c);DailyReminder.enqueue(c);}
}
