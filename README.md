# JSCONF CL Ticket API

**_PALABRAS LINDAS_**.

## SETUP

**_Tecnologias_** del proyecto:

| nombre     | version                  |
| ---------- | ------------------------ |
| _nodejs_   | v14 or mayor             |
| _docker_   | docker-desktop           |
| _nestjs_   | v9 or mayor              |
| _postgres_ | usar la imagen de docker |

**_Integraciones_** del proyecto:

| nombre   | variables de entorno   | valor                                                       |
| -------- | ---------------------- | ----------------------------------------------------------- |
| _stripe_ |                        |
|          | STRIPE_API_SECRET_KEY  | xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |
|          | STRIPE_API_SUCCESS_URL | https://tickets-api.dev/api/v1/payments/stripe      |
|          | STRIPE_API_CANCEL_URL  | https://tickets-api.dev/api/v1/payments/stripe      |

**_Ayudas_** sobre stripe:

Tarjetas de prueba : https://stripe.com/docs/testing?locale=es-419&numbers-or-method-or-token=card-numbers
Ideal que crees tu propia cuenta en stripe para poder configurar tus endpoints https://stripe.com/es-419-us

| nombre        | variables de entorno          | valor                                                       |
| ------------- | ----------------------------- | ----------------------------------------------------------- |
| _mercadopago_ |                               |                                                             |
|               | MERCADO_PAGO_PUBLIC_KEY       | TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx                   |
|               | MERCADO_PAGO_ACCESS_TOKEN     | TEST-xxxxxxxxsxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx                |
|               | MERCADO_PAGO_FAILURE          | https://tickets-api.dev/api/v1/payments/mercadopago |
|               | MERCADO_PAGO_PENDING          | https://tickets-api.dev/api/v1/payments/mercadopago |
|               | MERCADO_PAGO_SUCCESS          | https://tickets-api.dev/api/v1/payments/mercadopago |
|               | MERCADO_PAGO_URL              | https://api.mercadopago.com/checkout/preferences            |
|               | MERCADO_PAGO_GET_PAGO_URL     | https://api.mercadopago.com/v1/payments                     |
|               | MERCADO_PAGO_NOTIFICATION_URL | https://tickets-api.dev/api/v1/webhook/mercadopago  |

**_Ayudas_** sobre mercadopago:

Tarjetas de prueba : https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/test-cards
Debes crear tu propia app para poder configuar tus URLS en https://www.mercadopago.cl/developers/panel

| nombre   | variables de entorno       | valor                                          |
| -------- | -------------------------- | ---------------------------------------------- |
| _github_ |                            |                                                |
|          | GITHUB_OAUTH_CLIENT_ID     | xxxxxxxxxxx                                    |
|          | GITHUB_OAUTH_CLIENT_SECRET | xxxxxxxxxxxxxxxxxxxxxx                         |
|          | GITHUB_OAUTH_CALLBACK_URL  | https://develop.cl/auth/github/callback |
| _google_ |                            |                                                |
|          | GOOGLE_OAUTH_CLIENT_ID     | xxxxxxxxxxx                                    |
|          | GOOGLE_OAUTH_CLIENT_SECRET | xxxxxxxxxxxxxxxxxxxxxx                         |
|          | GOOGLE_OAUTH_CALLBACK_URL  | https://develop.cl/auth/google/callback |

**_Ayudas_** sobre github:

Puedes crear tu propia aplicacion de github y asi configurar tu url de callback, https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps

**_Variables de entorno_** del proyecto:

| nombre          | variables de entorno        | valor               |
| --------------- | --------------------------- | ------------------- |
| _applicación_   |                             |                     |
|                 | APP_ENV                     | localhost           |
| _base de datos_ |                             |                     |
|                 | DB_HOST                     | localhost           |
|                 | DB_PORT                     | 5432                |
|                 | DB_USER                     | postgres            |
|                 | DB_PASS                     | postgres            |
|                 | DB_NAME                     | postgres            |
| _auth_          |                             |
|                 | JWTKEY                      | random_secret_key   |
|                 | TOKEN_EXPIRATION            | 48h                 |
|                 | BEARER                      | Bearer              |
|                 | JWT_SECRET                  | xxxxxxxxxxxxxxxxxxx |
|                 | JWT_EXPIRATION_TIME_SECONDS | 900                 |


**_Observabilidad_**:
| nombre          | variables de entorno        | valor               |
| --------------- | --------------------------- | ------------------- |
| _LogFlare_      |                             |                     |
|                 | NEW_RELIC_APP_NAME          | asddasadsdas        |
|                 | NEW_RELIC_KEY               | xxxxxxxxxxxxxxxxx   |
| _NewRelic_      |                             |                     |
|                 | LOGFLARE_API_KEY            | xxxx                |
|                 | LOGFLARE_SOURCE_ID          | xxx                 |

## Pasos

- docker-compose up -b
- npm i
- cp .env.example .env
- configurar variables de entorno
- npm run start:dev
- cargar tickets en base de datos con el archivo data-test.sql
