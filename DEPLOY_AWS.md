# Guía de Despliegue en AWS

## Opción 1: AWS Amplify (Recomendado para empezar)

### Ventajas
- ✅ Configuración automática de CI/CD
- ✅ HTTPS automático
- ✅ CDN global incluido
- ✅ Builds automáticos desde Git
- ✅ Free tier generoso
- ✅ Fácil de configurar

### Pasos para Paneladmin

1. **Preparar el proyecto**
```bash
cd Paneladmin
npm run build
```

2. **En AWS Amplify Console**
   - Ir a [AWS Amplify Console](https://console.aws.amazon.com/amplify)
   - Click en "New app" → "Host web app"
   - Conectar repositorio Git (GitHub, GitLab, Bitbucket) o subir directamente
   - Si subes directamente: seleccionar carpeta `Paneladmin/dist`

3. **Configuración de Build**
   - Build settings (amplify.yml):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

4. **Variables de Entorno**
   - En Amplify Console → App settings → Environment variables
   - Agregar:
     - `VITE_PROJECT_URL`: Tu URL de Supabase
     - `VITE_ANNON_KEY`: Tu anon key de Supabase

5. **Rewrites y Redirects** (importante para SPA)
   - En Amplify Console → App settings → Rewrites and redirects
   - Agregar regla:
```json
[
  {
    "source": "/<*>",
    "target": "/index.html",
    "status": "200",
    "condition": null
  }
]
```

### Pasos para Panelempresa

1. **Preparar el proyecto**
```bash
cd Panelempresa
npm run build
```

2. **Repetir pasos 2-5 de Paneladmin** pero para Panelempresa
   - Crear una nueva app en Amplify
   - Usar carpeta `Panelempresa/dist` o conectar repositorio

### URLs resultantes
- Paneladmin: `https://main.d1234567890.amplifyapp.com`
- Panelempresa: `https://main.d0987654321.amplifyapp.com`

### Costos estimados
- **Free tier**: 15 GB almacenamiento, 5 GB transferencia/mes
- **Después del free tier**: ~$0.023/GB almacenamiento, ~$0.085/GB transferencia
- **Estimado**: $0-15/mes por app (depende del tráfico)

---

## Opción 2: S3 + CloudFront (Más control)

### Ventajas
- ✅ Más económico a gran escala
- ✅ Control total sobre configuración
- ✅ Mejor rendimiento con CloudFront
- ✅ Escalable

### Pasos para Paneladmin

#### 1. Crear Bucket S3

```bash
# Instalar AWS CLI si no lo tienes
# https://aws.amazon.com/cli/

# Configurar credenciales
aws configure

# Crear bucket (nombre debe ser único globalmente)
aws s3 mb s3://paneladmin-tu-empresa-prod --region us-east-1

# Habilitar hosting estático
aws s3 website s3://paneladmin-tu-empresa-prod \
  --index-document index.html \
  --error-document index.html
```

#### 2. Configurar política del bucket

Crear archivo `s3-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::paneladmin-tu-empresa-prod/*"
    }
  ]
}
```

Aplicar política:
```bash
aws s3api put-bucket-policy \
  --bucket paneladmin-tu-empresa-prod \
  --policy file://s3-policy.json
```

#### 3. Build y deploy

```bash
cd Paneladmin
npm run build

# Subir archivos
aws s3 sync dist/ s3://paneladmin-tu-empresa-prod --delete

# Configurar variables de entorno antes del build
# Crear .env.production:
VITE_PROJECT_URL=https://tu-proyecto.supabase.co
VITE_ANNON_KEY=tu-anon-key
```

#### 4. Crear CloudFront Distribution

En AWS Console → CloudFront:
- Origin Domain: `paneladmin-tu-empresa-prod.s3.amazonaws.com`
- Origin Access: Public
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Default Root Object: `index.html`
- Error Pages: 404 → `/index.html` (200)

#### 5. Configurar variables de entorno

Como S3 es estático, necesitas inyectar variables en build time:

**Opción A: Usar .env.production**
```bash
# En Paneladmin/.env.production
VITE_PROJECT_URL=https://tu-proyecto.supabase.co
VITE_ANNON_KEY=tu-anon-key
```

**Opción B: Script de build con variables**
```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "build:prod": "VITE_PROJECT_URL=$VITE_PROJECT_URL VITE_ANNON_KEY=$VITE_ANNON_KEY vite build"
  }
}
```

### Pasos para Panelempresa

Repetir pasos 1-5 pero con:
- Bucket: `panelempresa-tu-empresa-prod`
- Carpeta: `Panelempresa/dist`

### Script de deploy automatizado

Crear `deploy-s3.sh`:
```bash
#!/bin/bash

APP=$1
BUCKET=$2

if [ -z "$APP" ] || [ -z "$BUCKET" ]; then
  echo "Uso: ./deploy-s3.sh <app-name> <bucket-name>"
  echo "Ejemplo: ./deploy-s3.sh Paneladmin paneladmin-prod"
  exit 1
fi

cd $APP
npm install
npm run build
aws s3 sync dist/ s3://$BUCKET --delete
echo "Deploy completado: https://$BUCKET.s3.amazonaws.com"
```

### Costos estimados
- **S3**: $0.023/GB almacenamiento, $0.005/1000 requests
- **CloudFront**: $0.085/GB primeros 10TB, $0.01/10000 requests
- **Estimado**: $1-5/mes por app (depende del tráfico)

---

## Opción 3: EC2 + Nginx + Let's Encrypt (Control total)

### Ventajas
- ✅ Control total sobre el servidor
- ✅ HTTPS gratuito con Let's Encrypt
- ✅ Puede servir múltiples apps en un solo servidor
- ✅ Flexibilidad total de configuración
- ✅ Económico si ya tienes EC2

### Desventajas
- ⚠️ Requiere mantenimiento del servidor
- ⚠️ Necesitas gestionar actualizaciones de seguridad
- ⚠️ Más tiempo de setup inicial
- ⚠️ Necesitas configurar backups manualmente

### Requisitos
- Instancia EC2 (Ubuntu 22.04 LTS recomendado)
- Dominio apuntando a la IP del servidor (para Let's Encrypt)
- Acceso SSH al servidor

### Pasos de Configuración

#### 1. Crear Instancia EC2

1. **En AWS Console → EC2**
   - Launch Instance
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t3.micro (free tier) o t3.small
   - Security Group: Abrir puertos 22 (SSH), 80 (HTTP), 443 (HTTPS)
   - Key Pair: Crear o usar existente

2. **Conectarse al servidor**
```bash
ssh -i tu-key.pem ubuntu@tu-ip-ec2
```

#### 2. Instalar Nginx

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Nginx
sudo apt install nginx -y

# Iniciar y habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar que funciona
sudo systemctl status nginx
```

#### 3. Instalar Node.js y npm (para builds)

```bash
# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

#### 4. Configurar estructura de directorios

```bash
# Crear directorios para las apps
sudo mkdir -p /var/www/paneladmin
sudo mkdir -p /var/www/panelempresa

# Dar permisos
sudo chown -R $USER:$USER /var/www/paneladmin
sudo chown -R $USER:$USER /var/www/panelempresa
```

#### 5. Subir archivos al servidor

**Opción A: Desde tu máquina local (recomendado)**

```bash
# En tu máquina local, build de las apps
cd Paneladmin
npm run build

cd ../Panelempresa
npm run build

# Subir archivos usando SCP
scp -i tu-key.pem -r Paneladmin/dist/* ubuntu@tu-ip-ec2:/var/www/paneladmin/
scp -i tu-key.pem -r Panelempresa/dist/* ubuntu@tu-ip-ec2:/var/www/panelempresa/
```

**Opción B: Clonar repositorio en el servidor**

```bash
# En el servidor
cd /var/www
git clone tu-repositorio.git temp-repo

# Build en el servidor
cd temp-repo/Paneladmin
npm install
npm run build
sudo cp -r dist/* /var/www/paneladmin/

cd ../Panelempresa
npm install
npm run build
sudo cp -r dist/* /var/www/panelempresa/

# Limpiar
cd /
sudo rm -rf /var/www/temp-repo
```

#### 6. Configurar Nginx para Paneladmin

Crear archivo `/etc/nginx/sites-available/paneladmin`:

```nginx
server {
	listen 80;
	server_name admin.tu-dominio.com;  # Cambiar por tu dominio

	root /var/www/paneladmin;
	index index.html;

	# Logs
	access_log /var/log/nginx/paneladmin-access.log;
	error_log /var/log/nginx/paneladmin-error.log;

	# Configuración para SPA
	location / {
		try_files $uri $uri/ /index.html;
	}

	# Cache para assets estáticos
	location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
		expires 1y;
		add_header Cache-Control "public, immutable";
	}

	# Gzip compression
	gzip on;
	gzip_vary on;
	gzip_min_length 1024;
	gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

Habilitar sitio:
```bash
sudo ln -s /etc/nginx/sites-available/paneladmin /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar configuración
sudo systemctl reload nginx
```

#### 7. Configurar Nginx para Panelempresa

Crear archivo `/etc/nginx/sites-available/panelempresa`:

```nginx
server {
	listen 80;
	server_name app.tu-dominio.com;  # Cambiar por tu dominio

	root /var/www/panelempresa;
	index index.html;

	# Logs
	access_log /var/log/nginx/panelempresa-access.log;
	error_log /var/log/nginx/panelempresa-error.log;

	# Configuración para SPA
	location / {
		try_files $uri $uri/ /index.html;
	}

	# Cache para assets estáticos
	location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
		expires 1y;
		add_header Cache-Control "public, immutable";
	}

	# Gzip compression
	gzip on;
	gzip_vary on;
	gzip_min_length 1024;
	gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

Habilitar sitio:
```bash
sudo ln -s /etc/nginx/sites-available/panelempresa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 8. Instalar Certbot (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados SSL (reemplazar con tus dominios)
sudo certbot --nginx -d admin.tu-dominio.com
sudo certbot --nginx -d app.tu-dominio.com

# Certbot configurará automáticamente HTTPS en Nginx
# Renovación automática (ya está configurada)
sudo certbot renew --dry-run  # Probar renovación
```

#### 9. Configurar renovación automática

Certbot crea un cron job automático, pero puedes verificar:

```bash
# Verificar que el timer está activo
sudo systemctl status certbot.timer

# Ver logs de renovación
sudo journalctl -u certbot.timer
```

#### 10. Configurar Firewall (UFW)

```bash
# Habilitar UFW
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

### Script de Deploy Automatizado

Crear script `deploy-ec2.sh` en tu máquina local:

```bash
#!/bin/bash

# Configuración
EC2_USER="ubuntu"
EC2_HOST="tu-ip-ec2"
EC2_KEY="tu-key.pem"
PANELADMIN_PATH="/var/www/paneladmin"
PANELADMIN_PATH="/var/www/panelempresa"

APP=$1

if [ -z "$APP" ]; then
	echo "Uso: ./deploy-ec2.sh [paneladmin|panelempresa|all]"
	exit 1
fi

deploy_app() {
	local app_name=$1
	local app_dir=$2
	local remote_path=$3

	echo "🔨 Desplegando $app_name..."
	
	cd "$app_dir"
	
	# Build
	echo "📦 Compilando..."
	npm install
	npm run build
	
	if [ ! -d "dist" ]; then
		echo "❌ Error: Build falló"
		exit 1
	fi
	
	# Subir archivos
	echo "📤 Subiendo archivos..."
	scp -i "$EC2_KEY" -r dist/* "$EC2_USER@$EC2_HOST:$remote_path/"
	
	# Reiniciar Nginx
	echo "🔄 Reiniciando Nginx..."
	ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "sudo systemctl reload nginx"
	
	echo "✅ $app_name desplegado exitosamente!"
}

if [ "$APP" == "paneladmin" ]; then
	deploy_app "Paneladmin" "Paneladmin" "$PANELADMIN_PATH"
elif [ "$APP" == "panelempresa" ]; then
	deploy_app "Panelempresa" "Panelempresa" "$PANELADMIN_PATH"
elif [ "$APP" == "all" ]; then
	deploy_app "Paneladmin" "Paneladmin" "$PANELADMIN_PATH"
	deploy_app "Panelempresa" "Panelempresa" "$PANELADMIN_PATH"
else
	echo "Error: App debe ser 'paneladmin', 'panelempresa' o 'all'"
	exit 1
fi
```

### Configuración de Variables de Entorno

Como las variables se inyectan en build time, necesitas configurarlas antes del build:

**Opción A: Archivo .env.production en el servidor**
```bash
# En el servidor, antes de hacer build
cd /var/www/temp-repo/Paneladmin
echo "VITE_PROJECT_URL=https://tu-proyecto.supabase.co" > .env.production
echo "VITE_ANNON_KEY=tu-anon-key" >> .env.production
npm run build
```

**Opción B: Variables en el script de deploy**
```bash
# En deploy-ec2.sh, antes de npm run build
export VITE_PROJECT_URL="https://tu-proyecto.supabase.co"
export VITE_ANNON_KEY="tu-anon-key"
npm run build
```

### Configuración de Dominios

1. **En tu proveedor de DNS** (Cloudflare, Route53, etc.)
   - Crear registro A: `admin.tu-dominio.com` → IP de EC2
   - Crear registro A: `app.tu-dominio.com` → IP de EC2

2. **Esperar propagación DNS** (puede tardar hasta 48 horas, normalmente 5-15 min)

3. **Verificar DNS**
```bash
dig admin.tu-dominio.com
dig app.tu-dominio.com
```

### Costos estimados
- **EC2 t3.micro**: ~$7-10/mes (free tier: 750 horas/mes por 12 meses)
- **EC2 t3.small**: ~$15-20/mes
- **Elastic IP**: Gratis si está asociada a instancia
- **Transferencia de datos**: Primeros 100 GB/mes gratis
- **Let's Encrypt**: Gratis
- **Total estimado**: $7-20/mes (depende de instancia y tráfico)

### Mantenimiento

#### Actualizar aplicaciones
```bash
# Usar el script de deploy
./deploy-ec2.sh paneladmin
./deploy-ec2.sh panelempresa
```

#### Actualizar sistema
```bash
# En el servidor
sudo apt update && sudo apt upgrade -y
sudo systemctl restart nginx
```

#### Ver logs
```bash
# Logs de Nginx
sudo tail -f /var/log/nginx/paneladmin-access.log
sudo tail -f /var/log/nginx/paneladmin-error.log

# Logs del sistema
sudo journalctl -u nginx -f
```

#### Backup
```bash
# Script de backup simple
sudo tar -czf /backup/apps-$(date +%Y%m%d).tar.gz /var/www/paneladmin /var/www/panelempresa
```

---

## Comparación

| Característica | AWS Amplify | S3 + CloudFront | EC2 + Nginx |
|----------------|-------------|----------------|-------------|
| Facilidad de setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| CI/CD automático | ✅ Sí | ❌ Manual | ❌ Manual |
| Costo (bajo tráfico) | $0-15/mes | $1-5/mes | $7-20/mes |
| Costo (alto tráfico) | Más caro | Más económico | Más económico |
| Control | Limitado | Medio | Total |
| Mantenimiento | Automático | Mínimo | Manual |
| HTTPS | Automático | Automático | Let's Encrypt |
| Tiempo de setup | 15 min | 1-2 horas | 2-3 horas |

---

## Recomendación Final

### Para empezar rápido: **AWS Amplify**
- Ideal si quieres desplegar rápido
- CI/CD automático desde Git
- Menos configuración
- **Mejor para**: Equipos pequeños, prototipos, MVP

### Para producción escalable: **S3 + CloudFront**
- Más económico con tráfico alto
- CDN global automático
- Escalable sin límites
- **Mejor para**: Aplicaciones con mucho tráfico, múltiples regiones

### Para control total: **EC2 + Nginx**
- Control completo del servidor
- Puedes servir múltiples apps en un servidor
- Flexibilidad total de configuración
- HTTPS gratuito con Let's Encrypt
- **Mejor para**: Necesitas control total, ya tienes EC2, múltiples servicios

---

## Checklist Pre-Deploy

- [ ] Variables de entorno configuradas
- [ ] Build de producción probado localmente (`npm run build`)
- [ ] Verificar que `dist/` contiene todos los archivos
- [ ] Probar rutas de la SPA (no debe dar 404)
- [ ] Verificar conexión a Supabase desde producción
- [ ] Configurar CORS en Supabase si es necesario
- [ ] Configurar dominio personalizado (opcional)

---

## Dominios Personalizados

### Con Amplify
1. Amplify Console → Domain management
2. Agregar dominio
3. Configurar DNS según instrucciones

### Con CloudFront
1. CloudFront → Distribution → Domain Names
2. Request SSL certificate en ACM (us-east-1)
3. Agregar CNAME en tu DNS provider

---

## Notas Importantes

1. **Variables de entorno**: Las variables `VITE_*` se inyectan en build time, no en runtime
2. **SPA Routing**: Configurar redirects para que todas las rutas apunten a `index.html`
3. **CORS**: Verificar que Supabase permita requests desde tus dominios de producción
4. **HTTPS**: Ambos servicios incluyen HTTPS automático
5. **Cache**: CloudFront tiene mejor control de cache, Amplify es más simple

---

## Troubleshooting

### Error 404 en rutas
- Verificar configuración de redirects/rewrites
- En S3: Error document debe ser `index.html`

### Variables de entorno no funcionan
- Verificar que se usan `VITE_*` (Vite solo expone estas)
- Rebuild después de cambiar variables

### CORS errors
- Verificar configuración en Supabase Dashboard
- Agregar dominios de producción a allowed origins

