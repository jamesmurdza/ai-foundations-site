/**
 * Seeds the program spine: the four weeks, their assignments, and grants admin
 * to ADMIN_EMAILS. Safe + idempotent — only ss_ tables, never hh_.
 * Run: npm run seed
 */
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const WEEKS: [number, string, string][] = [
  [
    0,
    "Welcome",
    "An intro to AI Summer School — what it is, how the weeks work, and what to expect.",
  ],
  [
    1,
    "GitHub Profile",
    "Polish your GitHub profile and personal README so people can see who you are and what you've built.",
  ],
  [
    2,
    "Showcase your work",
    "Pick one project to start or improve — make it shine with a great README, a license, and a demo — then showcase it for the cohort to star.",
  ],
  [
    3,
    "Contribute to open source",
    "Make your first (or next) open-source contribution — a pull request to a peer's project or to a tool you use — and learn to write and review great PRs.",
  ],
  [
    4,
    "Your portfolio & spark",
    "Bring it together: a portfolio that shows your best work, and a clear sense of the spark you want to build on next.",
  ],
];

// One assignment per week. submission_type drives how the showcase renders the
// payload (repo → owner/name; link → the URL).
const ASSIGNMENTS: {
  week: number;
  title: string;
  prompt: string;
  type: "link" | "repo";
}[] = [
  {
    week: 1,
    title: "Refresh your GitHub profile",
    type: "link",
    prompt:
      "Polish your GitHub profile and personal README so people can see who you are and what you've built. Submit your profile URL (github.com/yourname). Follow a few peers in the cohort on GitHub.",
  },
  {
    week: 2,
    title: "Showcase one repo",
    type: "repo",
    prompt:
      "Pick one project — something new to start, or something you'd like to improve — and get it ready to show off. Give it a clear README, a license, and a demo (a screenshot or short video), and tidy the codebase so it reads well. Then submit the repo URL (github.com/you/project) to showcase it. Turn on Trade Stars to trade stars with the cohort.",
  },
  {
    week: 3,
    title: "Make an open-source contribution",
    type: "link",
    prompt:
      "Make a real open-source contribution. Level 1 (the assignment) — open a pull request on a peer's project from the showcase. Level 2 (extra credit) — go further and contribute to an open-source tool or product you actually use. Keep it small and focused, write a clear PR, and review a peer's PR too. Submit the link to your pull request (github.com/owner/repo/pull/123).",
  },
  {
    week: 4,
    title: "Build your portfolio",
    type: "link",
    prompt:
      "Bring it all together. Build a portfolio that shows your best work — projects, an about section, and a way to reach you — and get clear on your spark: what you actually want to build next. Submit your portfolio link, then give feedback on a few peers' profiles to close out the program.",
  },
];

/** Idempotent: create the week's assignment, or update it in place if present. */
async function upsertAssignment(a: (typeof ASSIGNMENTS)[number]) {
  const { rows } = await pool.query(
    `select id from ss_weeks where number = $1 limit 1`,
    [a.week],
  );
  if (!rows[0]) return;
  const weekId = rows[0].id;
  const { rows: existing } = await pool.query(
    `select id from ss_assignments where week_id = $1 limit 1`,
    [weekId],
  );
  if (!existing[0]) {
    await pool.query(
      `insert into ss_assignments
         (id, week_id, title, prompt, submission_type, review_count)
       values ($1,$2,$3,$4,$5,3)`,
      [crypto.randomUUID(), weekId, a.title, a.prompt, a.type],
    );
    console.log(`✓ Week ${a.week} assignment created`);
  } else {
    await pool.query(
      `update ss_assignments
       set title = $2, prompt = $3, submission_type = $4
       where week_id = $1`,
      [weekId, a.title, a.prompt, a.type],
    );
    console.log(`✓ Week ${a.week} assignment updated`);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");

  for (const [number, theme, description] of WEEKS) {
    await pool.query(
      `insert into ss_weeks (id, number, theme, description, is_published)
       values ($1,$2,$3,$4,true)
       on conflict (number) do update
         set theme = excluded.theme, description = excluded.description`,
      [crypto.randomUUID(), number, theme, description],
    );
  }
  console.log(`✓ weeks seeded (${WEEKS.length})`);

  for (const a of ASSIGNMENTS) await upsertAssignment(a);

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length) {
    for (const email of adminEmails) {
      await pool.query(
        `insert into ss_admins (id, email, added_by) values ($1,$2,'seed')
         on conflict (email) do nothing`,
        [crypto.randomUUID(), email],
      );
    }
    const res = await pool.query(
      `update ss_users set is_admin = true where lower(email) = any($1::text[])`,
      [adminEmails],
    );
    console.log(
      `✓ admin allowlist seeded (${adminEmails.join(", ")}); ${res.rowCount} existing user(s) flagged`,
    );
  }

  await pool.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
