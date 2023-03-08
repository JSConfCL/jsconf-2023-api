import build from 'pino-abstract-transport';
import * as build2 from 'pino-abstract-transport';
import axios from 'axios';

const b2 = build2 as unknown as typeof build;
export default async function (opts: { apiKey: string }) {
  return b2(async function (source) {
    for await (const obj of source) {
      const { time, msg, message, context = 'NO_CONTEXT', ...rest } = obj;
      if (rest?.req?.headers?.authorization) {
        rest.req.headers.authorization = '-REDACTED-';
      }
      const logEntry = {
        timestamp: time || Date.now(),
        message: `${context} — ${msg || message || ''}`,
        attributes: rest as any,
      };
      try {
        await axios.post(
          `https://log-api.newrelic.com/log/v1?Api-Key=${opts.apiKey}`,
          logEntry,
        );
      } catch (error) {
        // @ts-expect-error not sure
        const consoleProperty = console.error ? 'error' : 'log';
        console[consoleProperty](error);
      }
    }
  });
}
