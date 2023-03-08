import { RandomWordOptions, generateSlug } from 'random-word-slugs';

const options: RandomWordOptions<3> = {
  format: 'lower',
  categories: {
    noun: ['animals'],
    adjective: ['color', 'personality'],
  },
  partsOfSpeech: ['adjective', 'adjective', 'noun'],
};

export const createUsername = () => generateSlug(3, options);

const unMinutoEnMilisegundos = 60000;

export const someMinutesIntoTheFuture = (minutes: number) => {
  return new Date(Date.now() + minutes * unMinutoEnMilisegundos);
};

export const toISOStringWithTimezone = (date: Date) => {
  const tzOffset = -date.getTimezoneOffset();
  const diff = tzOffset >= 0 ? '+' : '-';
  const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    diff +
    pad(tzOffset / 60) +
    ':' +
    pad(tzOffset % 60)
  );
};
