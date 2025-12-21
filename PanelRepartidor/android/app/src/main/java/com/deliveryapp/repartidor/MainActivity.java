package com.deliveryapp.repartidor;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	private static final int REQUEST_CODE_OVERLAY_PERMISSION = 1001;
	private BroadcastReceiver ordersModalReceiver;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		// Verificar y solicitar permiso para burbuja flotante
		checkOverlayPermission();
		
		// Verificar si se abrió desde la burbuja flotante
		handleFloatingBubbleIntent(getIntent());
		
		// Sincronizar datos del driver al iniciar
		syncDriverDataToSharedPreferences();
		
		// Registrar interfaz JavaScript para guardar configuración de Supabase
		getBridge().getWebView().addJavascriptInterface(new Object() {
			@android.webkit.JavascriptInterface
			public void saveSupabaseConfig(String url, String key) {
				SharedPreferences prefs = getSharedPreferences("app_prefs", MODE_PRIVATE);
				prefs.edit()
					.putString("supabase_url", url)
					.putString("supabase_key", key)
					.apply();
				android.util.Log.d("MainActivity", "Supabase config guardada desde WebView");
			}
		}, "AndroidBridge");
		
		// Intentar obtener configuración de Supabase desde localStorage después de que cargue la app
		getBridge().getWebView().postDelayed(new Runnable() {
			@Override
			public void run() {
				String js = "(function() { " +
					"try { " +
					"  const url = localStorage.getItem('supabase_url') || ''; " +
					"  const key = localStorage.getItem('supabase_key') || ''; " +
					"  if (url && key && window.AndroidBridge) { " +
					"    window.AndroidBridge.saveSupabaseConfig(url, key); " +
					"  } " +
					"} catch(e) {} " +
					"})();";
				getBridge().getWebView().evaluateJavascript(js, null);
			}
		}, 2000); // Esperar 2 segundos para que la app cargue
		
		// Registrar receiver para mostrar modal cuando la app está en primer plano
		ordersModalReceiver = new BroadcastReceiver() {
			@Override
			public void onReceive(Context context, Intent intent) {
				syncDriverDataToSharedPreferences(); // Sincronizar antes de mostrar
				showOrdersModal();
			}
		};
		IntentFilter filter = new IntentFilter("com.deliveryapp.repartidor.SHOW_ORDERS_MODAL");
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
			registerReceiver(ordersModalReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
		} else {
			registerReceiver(ordersModalReceiver, filter);
		}
		
		// Sincronizar periódicamente (cada 5 segundos) para mantener datos actualizados
		android.os.Handler handler = new android.os.Handler();
		handler.postDelayed(new Runnable() {
			@Override
			public void run() {
				syncDriverDataToSharedPreferences();
				handler.postDelayed(this, 5000); // Repetir cada 5 segundos
			}
		}, 5000);
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
		if (ordersModalReceiver != null) {
			unregisterReceiver(ordersModalReceiver);
		}
	}

	@Override
	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);
		setIntent(intent);
		handleFloatingBubbleIntent(intent);
	}

	private void handleFloatingBubbleIntent(Intent intent) {
		if (intent != null && intent.getBooleanExtra("showOrdersModal", false)) {
			showOrdersModal();
		}
	}

	private void showOrdersModal() {
		// Sincronizar datos del driver a SharedPreferences para el WebView del servicio
		syncDriverDataToSharedPreferences();
		
		// También intentar obtener configuración de Supabase desde localStorage del WebView
		getBridge().getWebView().post(new Runnable() {
			@Override
			public void run() {
				// Intentar obtener configuración de Supabase desde localStorage del WebView
				String js = "(function() { " +
					"try { " +
					"  const url = localStorage.getItem('supabase_url') || ''; " +
					"  const key = localStorage.getItem('supabase_key') || ''; " +
					"  if (url && key) { " +
					"    window.AndroidBridge.saveSupabaseConfig(url, key); " +
					"  } " +
					"} catch(e) { console.error('Error obteniendo Supabase config:', e); } " +
					"})();";
				getBridge().getWebView().evaluateJavascript(js, null);
			}
		});
		
		// Pasar parámetro a la web app mediante JavaScript
		// Esto se ejecutará después de que la web app cargue
		getBridge().getWebView().post(new Runnable() {
			@Override
			public void run() {
				// Inyectar JavaScript para mostrar el modal
				String js = "if (window.setShowOrdersModal) { window.setShowOrdersModal(true); } else { window.location.href = window.location.pathname + '?showOrdersModal=true'; }";
				getBridge().getWebView().evaluateJavascript(js, null);
			}
		});
	}

	private void syncDriverDataToSharedPreferences() {
		try {
			// Leer desde Capacitor Preferences
			SharedPreferences capacitorPrefs = getSharedPreferences("com.getcapacitor.storage", MODE_PRIVATE);
			String driverJson = capacitorPrefs.getString("driver", null);
			
			SharedPreferences appPrefs = getSharedPreferences("app_prefs", MODE_PRIVATE);
			
			if (driverJson != null && !driverJson.isEmpty()) {
				// Guardar en SharedPreferences para el servicio
				appPrefs.edit().putString("driver_data", driverJson).apply();
			}
			
			// Siempre intentar guardar configuración de Supabase (incluso si no hay driver)
			// Intentar leer desde strings.xml primero
			try {
				int urlResId = getResources().getIdentifier("supabase_url", "string", getPackageName());
				int keyResId = getResources().getIdentifier("supabase_anon_key", "string", getPackageName());
				
				if (urlResId != 0) {
					String supabaseUrl = getString(urlResId);
					if (supabaseUrl != null && !supabaseUrl.isEmpty()) {
						appPrefs.edit().putString("supabase_url", supabaseUrl).apply();
					}
				} else {
					// Si no está en strings.xml, intentar desde variables de entorno o usar valores por defecto
					// Nota: En producción, estos valores deberían estar en strings.xml
					android.util.Log.w("MainActivity", "supabase_url no encontrado en strings.xml");
				}
				
				if (keyResId != 0) {
					String supabaseKey = getString(keyResId);
					if (supabaseKey != null && !supabaseKey.isEmpty()) {
						appPrefs.edit().putString("supabase_key", supabaseKey).apply();
					}
				} else {
					android.util.Log.w("MainActivity", "supabase_anon_key no encontrado en strings.xml");
				}
			} catch (Exception e) {
				android.util.Log.e("MainActivity", "Error sincronizando Supabase config", e);
			}
		} catch (Exception e) {
			android.util.Log.e("MainActivity", "Error sincronizando driver data", e);
		}
	}

	private void checkOverlayPermission() {
		// ⚠️ DESHABILITADO TEMPORALMENTE - Ver ARCHITECTURE.md para detalles
		// TODO: Re-habilitar y arreglar el servicio de burbuja flotante
		/*
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
			if (!Settings.canDrawOverlays(this)) {
				// Solicitar permiso
				Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
					Uri.parse("package:" + getPackageName()));
				startActivityForResult(intent, REQUEST_CODE_OVERLAY_PERMISSION);
			} else {
				// Ya tiene permiso, iniciar servicio
				startFloatingBubbleService();
			}
		} else {
			// Android < 6.0, no necesita permiso
			startFloatingBubbleService();
		}
		*/
	}

	private void startFloatingBubbleService() {
		// ⚠️ DESHABILITADO TEMPORALMENTE
		// Intent serviceIntent = new Intent(this, FloatingBubbleService.class);
		// startService(serviceIntent);
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
		
		// ⚠️ DESHABILITADO TEMPORALMENTE
		/*
		if (requestCode == REQUEST_CODE_OVERLAY_PERMISSION) {
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
				if (Settings.canDrawOverlays(this)) {
					// Permiso concedido, iniciar servicio
					startFloatingBubbleService();
					Toast.makeText(this, "Burbuja flotante activada", Toast.LENGTH_SHORT).show();
				} else {
					Toast.makeText(this, "Se necesita permiso para mostrar la burbuja flotante", Toast.LENGTH_LONG).show();
				}
			}
		}
		*/
	}
}
