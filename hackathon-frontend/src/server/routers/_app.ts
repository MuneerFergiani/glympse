import { z } from "zod";
import { procedure, router } from "../trpc";

import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { account, studyProposal, todos } from "@/db/schema";
import { randomInt } from "crypto";
import { formSchema as proposeFormSchema } from "@/pages/propose/new-study";
import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/mysql-core";

const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: "drizzle" });

const proposeStudySchema = proposeFormSchema;

export const appRouter = router({
  proposeStudy: procedure.input(proposeStudySchema).mutation(async (opts) => {
    // compute timestamps
    const createdUnixTimestamp = Date.now();
    const expiryUnixTimestamp =
      createdUnixTimestamp + opts.input.timeLimit * 60 * 60 * 1000;

    // find proposing id
    const proposingAccountId = (
      await db
        .select({ id: account.id })
        .from(account)
        .where(sql`${account.address} = ${opts.input.proposingAccount}`)
    ).map((i) => i.id)[0];

    // wrtite study proposal
    const studyInsertResult = await db
      .insert(studyProposal)
      .values({
        studyName: opts.input.studyName,
        studyDescription: opts.input.studyDescription,
        studyHypothesis: opts.input.studyHypothesis,
        dataAnalysisMethod: opts.input.dataAnalysisMethod,
        minimumParticipants: opts.input.minimumParticipants,
        maximumParticipants: opts.input.maximumParticipants,
        createdUnixTimestamp,
        expiryUnixTimestamp,
        proposingAccountId,
      })
      .returning();

    // write questions
    await db;

    // write tags
  }),
  hello: procedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query(async (opts) => {
      const data = await db.select().from(todos).all();

      return {
        greeting: `hello ${opts.input.text}. You have ${data.length} todos`,
        todos: data,
      };
    }),
  addTodo: procedure
    .input(z.object({ content: z.string() }))
    .mutation(async (opts) => {
      await db
        .insert(todos)
        .values({
          id: randomInt(10000000),
          content: opts.input.content,
          done: 0,
        })
        .run();
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
