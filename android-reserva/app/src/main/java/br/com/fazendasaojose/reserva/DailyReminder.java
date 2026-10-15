package br.com.fazendasaojose.reserva;
import android.Manifest;
import android.app.*;
import android.app.job.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.os.Build;
import java.time.*;
import java.util.UUID;
final class DailyReminder {
 static final int ID=701,JOB=702;static final String CHANNEL="fsj_daily_unread";
 static android.content.SharedPreferences prefs(Context c){return c.getSharedPreferences("fsj_reserva_reminder",Context.MODE_PRIVATE);}
 static String deviceId(Context c){String id=prefs(c).getString("device_id",null);if(id==null){id=UUID.randomUUID().toString();prefs(c).edit().putString("device_id",id).apply();}return id;}
 static boolean configured(Context c){return prefs(c).contains("device_key");}
 static void schedule(Context c){if(!configured(c))return;ZonedDateTime now=ZonedDateTime.now(ZoneId.of("America/Recife")),next=now.withHour(7).withMinute(0).withSecond(0).withNano(0);if(!next.isAfter(now))next=next.plusDays(1);AlarmManager alarms=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);PendingIntent intent=PendingIntent.getBroadcast(c,ID,new Intent(c,ReminderReceiver.class),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);if(Build.VERSION.SDK_INT<31||alarms.canScheduleExactAlarms())alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next.toInstant().toEpochMilli(),intent);else alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next.toInstant().toEpochMilli(),intent);}
 static void enqueue(Context c){if(!configured(c))return;JobInfo job=new JobInfo.Builder(JOB,new ComponentName(c,ReminderJob.class)).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setPersisted(true).setBackoffCriteria(180000,JobInfo.BACKOFF_POLICY_LINEAR).build();((JobScheduler)c.getSystemService(Context.JOB_SCHEDULER_SERVICE)).schedule(job);}
 static void clear(Context c){((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).cancel(ID);}
 static void show(Context c,String day){NotificationManager manager=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);if(!manager.areNotificationsEnabled()||(Build.VERSION.SDK_INT>=33&&c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED))return;NotificationChannel channel=new NotificationChannel(CHANNEL,"Quadro diário não lido",NotificationManager.IMPORTANCE_LOW);channel.setDescription("Sinalização silenciosa das tarefas do dia");channel.setSound(null,null);channel.enableVibration(false);channel.setShowBadge(true);manager.createNotificationChannel(channel);Intent open=new Intent(c,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);PendingIntent pending=PendingIntent.getActivity(c,ID,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);Notification n=new Notification.Builder(c,CHANNEL).setSmallIcon(R.drawable.ic_unread).setContentTitle("FSJ Reserva • quadro não lido").setContentText("Suas tarefas de "+day.substring(8)+"/"+day.substring(5,7)+" estão disponíveis.").setContentIntent(pending).setNumber(1).setOnlyAlertOnce(true).setAutoCancel(true).setCategory(Notification.CATEGORY_REMINDER).build();manager.notify(ID,n);}
}
