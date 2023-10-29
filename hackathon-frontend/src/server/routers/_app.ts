import { z } from "zod";
import { procedure, router } from "../trpc";

import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import * as schema from "@/db/schema";
import { formSchema as proposeFormSchema } from "@/pages/propose/new-study-form";
import { sql } from "drizzle-orm";
import { env } from "@/env.mjs";

// db setup
const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite, { schema });
migrate(db, { migrationsFolder: "drizzle" });

// helper functions
async function syncStudyLifecycle(id: number) {
  await db.transaction(async () => {
    const studyProposal = (
      await db
        .select()
        .from(schema.studyProposal)
        .where(sql`${schema.studyProposal.id} = ${id}`)
    )?.[0];

    // is it pending?
    const pendingStudy = (
      await db
        .select()
        .from(schema.studyUnderConfirmation)
        .where(sql`${schema.studyUnderConfirmation.studyProposalId} = ${id}`)
    )?.[0];

    // not pending route
    if (!pendingStudy) {
      // get participants
      const studyParticipants = await db
        .select()
        .from(schema.studyProposalParticipant)
        .where(sql`${schema.studyProposalParticipant.studyProposalId} = ${id}`);

      // expired + threshold met = promote to pending
      // not expired + maximum met = promote to pending
      if (
        (studyProposal.expiryUnixTimestamp <= Date.now() &&
          studyParticipants.length >= studyProposal.minimumParticipants) ||
        (studyProposal.expiryUnixTimestamp > Date.now() &&
          studyParticipants.length === studyProposal.maximumParticipants)
      ) {
        // promote to pending study and exit
        db.insert(schema.studyUnderConfirmation)
          .values({
            studyProposalId: studyProposal.id,
            expiryUnixTimestamp:
              Date.now() + env.STUDY_CONFIRMATION_WINDOW_HOURS * 60 * 60 * 1000,
          })
          .run();
        return;
      }

      // expired + not met = cancelled = do nothing
      // not expired + not met = onboarding = do nothing
      // not expired + threshold met but max not met = onboarding = do nothing
      return;
    }

    // TODO: implement the rest of function
  });
}
type StudyLifecycle =
  | "onboarding"
  | "confirmation"
  | "voting"
  | "completed"
  | "failed";
async function getStudyLifecycle(id: number): Promise<StudyLifecycle> {
  // first sync everything
  syncStudyLifecycle(id);

  // get proposal
  const studyProposal = (
    await db
      .select()
      .from(schema.studyProposal)
      .where(sql`${schema.studyProposal.id} = ${id}`)
  )?.[0];

  // is it under confirmation?
  const studyUnderConfirmation = (
    await db
      .select()
      .from(schema.studyUnderConfirmation)
      .where(sql`${schema.studyUnderConfirmation.studyProposalId} = ${id}`)
  )?.[0];
  if (!studyUnderConfirmation) {
    // Since we just synced everything, then all expired = failed
    if (Date.now() >= studyProposal.expiryUnixTimestamp) {
      return "failed";
    }
    // And all not expired = still onboarding
    else {
      return "onboarding";
    }
  }

  // is it under voting?
  const studyVoting = (
    await db
      .select()
      .from(schema.studyVoting)
      .where(sql`${schema.studyVoting.studyProposalId} = ${id}`)
  )?.[0];
  console.log(studyVoting);
  if (typeof studyVoting === "undefined") {
    return "confirmation";
  }

  // TODO: implement rest of this function
  return "voting";
}

// input schemas
const proposeStudySchema = proposeFormSchema;
export const appRouter = router({
  logIn: procedure
    .input(z.object({ account: z.string().min(3) }))
    .mutation(async ({ input }) => {
      // find account
      const acc = await db
        .select({ id: schema.account.id })
        .from(schema.account)
        .where(sql`${schema.account.address} = ${input.account}`);

      // exit early if found
      if (acc.length === 1) return;

      // create new account if not
      await db
        .insert(schema.account)
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
        .select({ id: schema.account.id })
        .from(schema.account)
        .where(sql`${schema.account.address} = ${opts.input.proposingAccount}`)
    ).map((i) => i.id)[0];

    // wrtite study proposal
    const studyInsertResult = (
      await db
        .insert(schema.studyProposal)
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
      await db.insert(schema.studyProposalQuestion).values({
        question: q.question,
        studyProposalId: studyInsertResult.id,
      });
    }

    // write tags
    for (const t of opts.input.tags) {
      await db.insert(schema.studyProposalTag).values({
        tag: t.tag,
        studyProposalId: studyInsertResult.id,
      });
    }

    return {
      studyProposalId: studyInsertResult.id,
    };
  }),
  getStudiesToJoin: procedure
    .input(z.object({ account: z.string() }))
    .query(async ({ input }) => {
      // find account id
      const accountId = (
        await db
          .select({ id: schema.account.id })
          .from(schema.account)
          .where(sql`${schema.account.address} = ${input.account}`)
      ).map((i) => i.id)[0];

      // fetch all studies
      const studies = await db.query.studyProposal.findMany({
        with: {
          studyProposalParticipant: true,
        },
      });

      // filter out studies that are not in the onboarding stage
      const proposedStudies = await Promise.all(
        studies.filter(
          async (study) => (await getStudyLifecycle(study.id)) === "onboarding",
        ),
      );

      // filter out those that have already been joined
      const joinableStudies = proposedStudies.filter((study) => {
        for (const p of study.studyProposalParticipant)
          if (p.participantAccountId === accountId) return false;
        return true;
      });

      // find questions and tags for these
      return await Promise.all(
        joinableStudies.map(async (study) => {
          const questions = await db
            .select({
              id: schema.studyProposalQuestion.id,
              question: schema.studyProposalQuestion.question,
            })
            .from(schema.studyProposalQuestion)
            .where(
              sql`${schema.studyProposalQuestion.studyProposalId} = ${study.id}`,
            );
          const tags = (
            await db
              .select({ tag: schema.studyProposalTag.tag })
              .from(schema.studyProposalTag)
              .where(
                sql`${schema.studyProposalTag.studyProposalId} = ${study.id}`,
              )
          ).map((i) => i.tag);

          return {
            ...study,
            questions,
            tags,
          };
        }),
      );
    }),
  joinStudy: procedure
    .input(
      z.object({
        account: z.string().min(3),
        studyProposalId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      // find account id
      const accountId = (
        await db
          .select({ id: schema.account.id })
          .from(schema.account)
          .where(sql`${schema.account.address} = ${input.account}`)
      ).map((i) => i.id)[0];

      // add connection
      await db.insert(schema.studyProposalParticipant).values({
        participantAccountId: accountId,
        studyProposalId: input.studyProposalId,
      });

      // check if we want to move study to "confirmation" state
    }),
  getStudiesToConfirm: procedure
    .input(z.object({ account: z.string() }))
    .query(async ({ input }) => {
      // find account id
      const accountId = (
        await db
          .select({ id: schema.account.id })
          .from(schema.account)
          .where(sql`${schema.account.address} = ${input.account}`)
      ).map((i) => i.id)[0];

      // fetch all studies
      const studies = await db.query.studyProposal.findMany({
        with: {
          studyProposalParticipant: true,
        },
      });

      // filter out those that I didnt participate in
      const myStudies = studies.filter((study) => {
        for (const p of study.studyProposalParticipant) {
          if (p.id === accountId) return true;
        }
        return false;
      });

      // filter out studies that are not in the confirmation stage
      const studiesBeingConfirmed = await Promise.all(
        myStudies.filter(
          async (study) =>
            (await getStudyLifecycle(study.id)) === "confirmation",
        ),
      );

      // filter out those that have already been confirmed
      // TODO: implement this somehow. maybe clientside, even
      // const joinableStudies = proposedStudies.filter((study) => {
      //   for (const p of study.studyProposalParticipant)
      //     if (p.participantAccountId === accountId) return false;
      //   return true;
      // });

      // find questions and tags for these
      return await Promise.all(
        studiesBeingConfirmed.map(async (study) => {
          const questions = await db
            .select({
              id: schema.studyProposalQuestion.id,
              question: schema.studyProposalQuestion.question,
            })
            .from(schema.studyProposalQuestion)
            .where(
              sql`${schema.studyProposalQuestion.studyProposalId} = ${study.id}`,
            );
          const tags = (
            await db
              .select({ tag: schema.studyProposalTag.tag })
              .from(schema.studyProposalTag)
              .where(
                sql`${schema.studyProposalTag.studyProposalId} = ${study.id}`,
              )
          ).map((i) => i.tag);
          const studyUnderConfirmation = (
            await db
              .select()
              .from(schema.studyUnderConfirmation)
              .where(
                sql`${schema.studyUnderConfirmation.studyProposalId} = ${study.id}`,
              )
          )?.[0];

          return {
            ...study,
            expiryUnixTimestamp: studyUnderConfirmation.expiryUnixTimestamp, // override the timestamp in the study proposal
            questions,
            tags,
          };
        }),
      );
    }),
  confirmStudy: procedure
    .input(
      z.object({
        account: z.string().min(3),
        studyProposalId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      // find account id
      const accountId = (
        await db
          .select({ id: schema.account.id })
          .from(schema.account)
          .where(sql`${schema.account.address} = ${input.account}`)
      ).map((i) => i.id)[0];

      // add connection
      await db.insert(schema.studyVoting).values({
        expiryUnixTimestamp:
          Date.now() + env.STUDY_CONFIRMATION_WINDOW_HOURS * 60 * 60 * 1000,
        studyProposalId: input.studyProposalId,
      });

      // check if we want to move study to "confirmation" state
    }),
  getStudiesToVote: procedure
    .input(z.object({ account: z.string() }))
    .query(async ({ input }) => {
      // find account id
      const accountId = (
        await db
          .select({ id: schema.account.id })
          .from(schema.account)
          .where(sql`${schema.account.address} = ${input.account}`)
      ).map((i) => i.id)[0];

      // fetch all studies
      const studies = await db.query.studyProposal.findMany({
        with: {
          studyProposalParticipant: true,
        },
      });

      // filter out studies that are not in the voting stage
      const proposedStudies = await Promise.all(
        studies.filter(
          async (study) => (await getStudyLifecycle(study.id)) === "voting",
        ),
      );

      // filter out those that have are not mine
      const votableStudies = proposedStudies.filter((study) => {
        for (const p of study.studyProposalParticipant)
          if (p.participantAccountId === accountId) return true;
        return false;
      });

      // find questions and tags for these
      return await Promise.all(
        votableStudies.map(async (study) => {
          const questions = await db
            .select({
              id: schema.studyProposalQuestion.id,
              question: schema.studyProposalQuestion.question,
            })
            .from(schema.studyProposalQuestion)
            .where(
              sql`${schema.studyProposalQuestion.studyProposalId} = ${study.id}`,
            );
          const tags = (
            await db
              .select({ tag: schema.studyProposalTag.tag })
              .from(schema.studyProposalTag)
              .where(
                sql`${schema.studyProposalTag.studyProposalId} = ${study.id}`,
              )
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
