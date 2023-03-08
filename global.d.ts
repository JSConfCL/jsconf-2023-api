import { roleValues } from 'src/modules/users/user.entity';

type AppUser = {
  id: string;
  email: string;
  role: typeof roleValues[number];
};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly LOGFLARE_API_KEY: string;
      readonly LOGFLARE_SOURCE_ID: string;
      readonly DB_PORT: string;
      readonly ADMIN_API_TOKEN: string;
      readonly MAILGUN_USERNAME: string;
      readonly MAILGUN_PRIVATE_KEY: string;
      readonly MAILGUN_PUBLIC_KEY: string;
      readonly MAILGUN_DOMAIN: string;
      readonly STRIPE_API_SECRET_KEY: string;
      readonly STRIPE_API_SUCCESS_URL: string;
      readonly MERCADO_PAGO_URL: string;
      readonly WORKER_IMAGE_API: string;
      readonly API_URL: string;
      readonly SITE_URL: string;
    }
  }
  namespace Express {
    // tslint:disable-next-line:no-empty-interface
    type User = AppUser;

    interface Request {
      User?: AppUser;
    }
  }
}
