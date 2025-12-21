package com.deliveryapp.repartidor;

import android.app.ActivityManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class FloatingBubbleService extends Service {
	private WindowManager windowManager;
	private View floatingBubbleView;
	private View ordersPanelView;
	private WindowManager.LayoutParams params;
	private WindowManager.LayoutParams panelParams;

	@Override
	public void onCreate() {
		super.onCreate();

		windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

		// Crear la vista de la burbuja programáticamente
		ImageView bubbleView = new ImageView(this);
		bubbleView.setImageResource(android.R.drawable.ic_menu_view);
		
		// Intentar usar el drawable personalizado, si no existe usar color sólido
		try {
			int bgResId = getResources().getIdentifier("floating_bubble_background", "drawable", getPackageName());
			if (bgResId != 0) {
				bubbleView.setBackgroundResource(bgResId);
			} else {
				// Fallback: usar color sólido
				bubbleView.setBackgroundColor(0xFF2B73EE);
			}
		} catch (Exception e) {
			bubbleView.setBackgroundColor(0xFF2B73EE);
		}
		
		bubbleView.setPadding(12, 12, 12, 12);
		floatingBubbleView = bubbleView;

		// Configurar parámetros de la ventana
		int layoutType;
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
			layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
		} else {
			layoutType = WindowManager.LayoutParams.TYPE_PHONE;
		}

		params = new WindowManager.LayoutParams(
			WindowManager.LayoutParams.WRAP_CONTENT,
			WindowManager.LayoutParams.WRAP_CONTENT,
			layoutType,
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
			PixelFormat.TRANSLUCENT
		);

		// Posición inicial: esquina inferior derecha
		params.gravity = Gravity.BOTTOM | Gravity.END;
		params.x = 0;
		params.y = 100; // 100px desde abajo

		// Configurar tamaño de la burbuja
		int bubbleSize = (int) (56 * getResources().getDisplayMetrics().density);
		params.width = bubbleSize;
		params.height = bubbleSize;

		// Manejar clics en la burbuja
		floatingBubbleView.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View v) {
				// Mostrar/ocultar panel de pedidos
				if (ordersPanelView == null) {
					showOrdersPanel();
				} else {
					hideOrdersPanel();
				}
			}
		});

		// Manejar arrastre de la burbuja
		floatingBubbleView.setOnTouchListener(new View.OnTouchListener() {
			private int initialX;
			private int initialY;
			private float initialTouchX;
			private float initialTouchY;

			@Override
			public boolean onTouch(View v, MotionEvent event) {
				switch (event.getAction()) {
					case MotionEvent.ACTION_DOWN:
						initialX = params.x;
						initialY = params.y;
						initialTouchX = event.getRawX();
						initialTouchY = event.getRawY();
						return true;

					case MotionEvent.ACTION_UP:
						// Si no se movió mucho, es un clic
						if (Math.abs(event.getRawX() - initialTouchX) < 10 &&
							Math.abs(event.getRawY() - initialTouchY) < 10) {
							floatingBubbleView.performClick();
						}
						return true;

					case MotionEvent.ACTION_MOVE:
						params.x = initialX + (int) (event.getRawX() - initialTouchX);
						params.y = initialY + (int) (event.getRawY() - initialTouchY);
						
						// Limitar movimiento dentro de la pantalla
						int maxX = windowManager.getDefaultDisplay().getWidth() - floatingBubbleView.getWidth();
						int maxY = windowManager.getDefaultDisplay().getHeight() - floatingBubbleView.getHeight();
						
						params.x = Math.max(0, Math.min(params.x, maxX));
						params.y = Math.max(0, Math.min(params.y, maxY));
						
						windowManager.updateViewLayout(floatingBubbleView, params);
						return true;
				}
				return false;
			}
		});

		// Agregar la vista a la ventana
		windowManager.addView(floatingBubbleView, params);
	}

	private void showOrdersPanel() {
		if (ordersPanelView != null) {
			return; // Ya está mostrado
		}

		// Si la app está en primer plano, comunicar con JavaScript
		if (isAppInForeground()) {
			Intent intent = new Intent("com.deliveryapp.repartidor.SHOW_ORDERS_MODAL");
			sendBroadcast(intent);
			return;
		}

		// Crear WebView para mostrar panel con JavaScript
		WebView webView = new WebView(this);
		webView.getSettings().setJavaScriptEnabled(true);
		webView.getSettings().setDomStorageEnabled(true);
		webView.getSettings().setAllowFileAccess(true);
		webView.getSettings().setAllowContentAccess(true);
		
		// Permitir conexiones HTTP/HTTPS
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
			webView.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
		}
		
		webView.setWebViewClient(new WebViewClient());
		
		// Interfaz JavaScript para comunicar con Java
		webView.addJavascriptInterface(new WebAppInterface(), "Android");
		
		// Cargar HTML
		webView.loadUrl("file:///android_asset/floating_orders_panel.html");
		
		// Configurar parámetros del panel
		int layoutType;
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
			layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
		} else {
			layoutType = WindowManager.LayoutParams.TYPE_PHONE;
		}

		int screenWidth = windowManager.getDefaultDisplay().getWidth();
		int screenHeight = windowManager.getDefaultDisplay().getHeight();
		int panelWidth = (int) (screenWidth * 0.85);
		int panelHeight = (int) (screenHeight * 0.6);

		panelParams = new WindowManager.LayoutParams(
			panelWidth,
			panelHeight,
			layoutType,
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_DIM_BEHIND,
			PixelFormat.TRANSLUCENT
		);
		panelParams.gravity = Gravity.CENTER;
		panelParams.dimAmount = 0.5f;

		ordersPanelView = webView;
		windowManager.addView(ordersPanelView, panelParams);
	}

	// Clase para interfaz JavaScript
	public class WebAppInterface {
		@JavascriptInterface
		public void closePanel() {
			hideOrdersPanel();
		}

		@JavascriptInterface
		public void openApp() {
			Intent intent = new Intent(FloatingBubbleService.this, MainActivity.class);
			intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
			intent.putExtra("showOrdersModal", true);
			startActivity(intent);
			hideOrdersPanel();
		}

		@JavascriptInterface
		public String getDriverData() {
			try {
				// Intentar leer desde SharedPreferences (sincronizado desde MainActivity)
				SharedPreferences appPrefs = getSharedPreferences("app_prefs", MODE_PRIVATE);
				String driverJson = appPrefs.getString("driver_data", null);
				if (driverJson != null && !driverJson.isEmpty()) {
					return driverJson;
				}
				
				// Fallback: intentar desde Capacitor Preferences (si está disponible)
				// Capacitor guarda en: com.getcapacitor.storage con clave "driver"
				SharedPreferences capacitorPrefs = getSharedPreferences("com.getcapacitor.storage", MODE_PRIVATE);
				driverJson = capacitorPrefs.getString("driver", null);
				if (driverJson != null && !driverJson.isEmpty()) {
					// Sincronizar a app_prefs para futuras consultas
					appPrefs.edit().putString("driver_data", driverJson).apply();
					return driverJson;
				}
				
				return null;
			} catch (Exception e) {
				android.util.Log.e("FloatingBubble", "Error obteniendo driver data", e);
				return null;
			}
		}

		@JavascriptInterface
		public String getSupabaseConfig() {
			try {
				// Obtener desde SharedPreferences
				SharedPreferences prefs = getSharedPreferences("app_prefs", MODE_PRIVATE);
				String url = prefs.getString("supabase_url", "");
				String key = prefs.getString("supabase_key", "");
				
				// Si no están en prefs, intentar desde strings.xml
				if (url.isEmpty() || key.isEmpty()) {
					try {
						int urlResId = getResources().getIdentifier("supabase_url", "string", getPackageName());
						int keyResId = getResources().getIdentifier("supabase_anon_key", "string", getPackageName());
						if (urlResId != 0) {
							url = getString(urlResId);
							// Guardar en prefs para futuras consultas
							prefs.edit().putString("supabase_url", url).apply();
						}
						if (keyResId != 0) {
							key = getString(keyResId);
							// Guardar en prefs para futuras consultas
							prefs.edit().putString("supabase_key", key).apply();
						}
					} catch (Exception e) {
						android.util.Log.w("FloatingBubble", "No se encontraron strings de Supabase", e);
					}
				}
				
				android.util.Log.d("FloatingBubble", "Supabase config - URL: " + (url.isEmpty() ? "EMPTY" : "OK") + ", Key: " + (key.isEmpty() ? "EMPTY" : "OK"));
				
				return "{\"url\":\"" + url + "\",\"key\":\"" + key + "\"}";
			} catch (Exception e) {
				android.util.Log.e("FloatingBubble", "Error obteniendo Supabase config", e);
				return "{\"url\":\"\",\"key\":\"\"}";
			}
		}
	}

	private void hideOrdersPanel() {
		if (ordersPanelView != null) {
			windowManager.removeView(ordersPanelView);
			ordersPanelView = null;
		}
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
		if (floatingBubbleView != null) {
			windowManager.removeView(floatingBubbleView);
		}
		if (ordersPanelView != null) {
			windowManager.removeView(ordersPanelView);
		}
	}

	// Verificar si la app está en primer plano
	private boolean isAppInForeground() {
		ActivityManager activityManager = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
		if (activityManager != null) {
			for (ActivityManager.RunningAppProcessInfo processInfo : activityManager.getRunningAppProcesses()) {
				if (processInfo.processName.equals(getPackageName())) {
					return processInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND;
				}
			}
		}
		return false;
	}

	@Override
	public IBinder onBind(Intent intent) {
		return null;
	}
}

