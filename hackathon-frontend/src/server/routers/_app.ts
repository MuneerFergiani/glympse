import { z } from "zod";
import { procedure, router } from "../trpc";

import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import {
  account,
  studyProposal,
  studyProposalQuestion,
  studyProposalTag,
} from "@/db/schema";
import { formSchema as proposeFormSchema } from "@/pages/propose/new-study-form";
import { sql } from "drizzle-orm";

// db setup
const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: "drizzle" });

// helper functions
function getStudyLifecycle(id: number) {
  // TODO: implement this function
  return "proposal";
}

// input schemas
const proposeStudySchema = proposeFormSchema;
export const appRouter = router({
  logIn: procedure
    .input(z.object({ account: z.string().min(3) }))
    .mutation(async ({ input }) => {
      // find account
      const acc = await db
        .select({ id: account.id })
        .from(account)
        .where(sql`${account.address} = ${input.account}`);

      // exit early if found
      if (acc.length === 1) return;

      // create new account if not
      await db
        .insert(account)
        .values({
          address: input.account,
        })
        .run();
    }),
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
    const studyInsertResult = (
      await db
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
        .returning()
    )[0];

    // write questions
    for (const q of opts.input.surveyQuestions) {
      await db.insert(studyProposalQuestion).values({
        question: q.question,
        studyProposalId: studyInsertResult.id,
      });
    }

    // write tags
    for (const t of opts.input.tags) {
      await db.insert(studyProposalTag).values({
        tag: t.tag,
        studyProposalId: studyInsertResult.id,
      });
    }

    return {
      studyProposalId: studyInsertResult.id,
    };
  }),
  getStudiesToJoin: procedure.query(async () => {
    // fetch all studies
    const studies = await db.select().from(studyProposal).all();

    // filter out studies that are not in the proposal stage
    const proposedStudies = studies.filter(
      (study) => getStudyLifecycle(study.id) === "proposal",
    );

    // find questions and tags for these
    return await Promise.all(
      proposedStudies.map(async (study) => {
        const questions = (
          await db
            .select({ question: studyProposalQuestion.question })
            .from(studyProposalQuestion)
            .where(sql`${studyProposalQuestion.studyProposalId} = ${study.id}`)
        ).map((i) => i.question);
        const tags = (
          await db
            .select({ tag: studyProposalTag.tag })
            .from(studyProposalTag)
            .where(sql`${studyProposalTag.studyProposalId} = ${study.id}`)
        ).map((i) => i.tag);

        return {
          ...study,
          questions,
          tags,
        };
      }),
    );
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
