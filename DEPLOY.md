# Выкладка сайта на VPS + домен

## 1. Купить (вы)
1. **Домен** — reg.ru / nic.ru / Namecheap (.ru ≈ 200 ₽/год, .com ≈ 1000 ₽/год).
2. **VPS** — Ubuntu 22.04/24.04, 1 CPU / 1 ГБ RAM достаточно. Лучше сервер в РФ (Timeweb, Selectel, Beget):
   часть российских лент блокирует зарубежные IP.

## 2. DNS
В панели домена создайте A-запись: `@` → IP вашего VPS (и `www` → тот же IP). Ждите 5–30 минут.

## 3. На сервере (по SSH)
```bash
curl -fsSL https://get.docker.com | sh
```
Скопируйте папку `news-site` на сервер (например, `scp -r news-site root@IP:/opt/news-site`), затем:
```bash
cd /opt/news-site
echo "DOMAIN=ваш-домен.ru" > .env
docker compose up -d --build
```
Через минуту сайт открывается на `https://ваш-домен.ru` — HTTPS-сертификат Caddy выпустит сам.
`restart: always` — после перезагрузки сервера всё поднимется автоматически.

## Обновление
```bash
cd /opt/news-site && docker compose up -d --build
```
Логи: `docker compose logs -f app`.
