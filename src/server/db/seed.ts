import { count } from 'drizzle-orm';
import type { Db } from './database';
import { posts, users } from './schema';

export const SEED_POST_COUNT = 48;

const SEED_USERS = [
  {
    handle: 'maria',
    displayName: 'Maria Souza',
    bio: 'Desenvolvedora front-end. Café e acessibilidade.',
  },
  { handle: 'joao', displayName: 'João Lima', bio: 'Back-end, bancos de dados e boas migrations.' },
  {
    handle: 'ana',
    displayName: 'Ana Costa',
    bio: 'Engenharia de software e testes automatizados.',
  },
  { handle: 'pedro', displayName: 'Pedro Alves', bio: 'DevOps curioso. Containers e pipelines.' },
  { handle: 'lucia', displayName: 'Lúcia Rocha', bio: 'Design de produto e UX writing.' },
  { handle: 'caio', displayName: 'Caio Mendes', bio: 'Estudando SSR, um commit de cada vez.' },
];

const TOPICS = [
  'SSR',
  'hidratação',
  'cache HTTP',
  'TypeScript',
  'testes automatizados',
  'Docker',
  'SEO',
  'acessibilidade',
];

const TEMPLATES = [
  (topic: string) => `Hoje aprendi mais sobre ${topic}. Pequenos passos contam.`,
  (topic: string) => `Alguém mais estudando ${topic}? Compartilhem dicas!`,
  (topic: string) => `Anotação do dia: ${topic} fica mais simples quando se começa pelo básico.`,
  (topic: string) => `Revisitando ${topic} com calma. Menos pressa, mais entendimento.`,
];

const FIRST_POST_AT = Date.UTC(2026, 10, 1, 12, 0, 0);
const HOUR_MS = 3_600_000;

function buildBody(index: number): string {
  const topic = TOPICS[index % TOPICS.length];
  const template = TEMPLATES[Math.floor(index / TOPICS.length) % TEMPLATES.length];
  return `${template(topic)} (#${index + 1})`;
}

export function seed(db: Db): boolean {
  const existing = db.select({ total: count() }).from(users).get()?.total ?? 0;
  if (existing > 0) {
    return false;
  }

  db.transaction((tx) => {
    const inserted = tx.insert(users).values(SEED_USERS).returning({ id: users.id }).all();
    const rows = Array.from({ length: SEED_POST_COUNT }, (_, index) => ({
      userId: inserted[index % inserted.length].id,
      body: buildBody(index),
      createdAt: new Date(FIRST_POST_AT + index * HOUR_MS).toISOString(),
    }));
    tx.insert(posts).values(rows).run();
  });
  return true;
}
