import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { number } from "zod";

// Account model and relations
export const account = sqliteTable("account", {
  id: integer("id").primaryKey(),
  address: text("address").notNull().unique(),
});
export const accountRelations = relations(account, ({ many }) => ({
  studyProposal: many(studyProposal),
  studyProposalParticipant: many(studyProposalParticipant),
}));

// study proposal model and relations
export const studyProposal = sqliteTable("study_proposal", {
  id: integer("id").primaryKey(),
  studyName: text("study_name").notNull(),
  studyDescription: text("study_description").notNull(),
  studyHypothesis: text("study_hypothesis").notNull(),
  dataAnalysisMethod: text("data_analysis_method").notNull(),
  minimumParticipants: integer("minimum_participants").notNull(),
  maximumParticipants: integer("maximum_participants").notNull(),
  createdUnixTimestamp: integer("created_unix_timestamp").notNull(),
  expiryUnixTimestamp: integer("expiry_unix_timestamp").notNull(),
  proposingAccountId: integer("proposing_account_id")
    .notNull()
    .references(() => account.id),
});
export const studyProposalRelations = relations(
  studyProposal,
  ({ one, many }) => ({
    account: one(account, {
      fields: [studyProposal.proposingAccountId],
      references: [account.id],
    }),
    studyProposalQuestion: many(studyProposalQuestion),
    studyProposalTag: many(studyProposalTag),
    studyProposalParticipant: many(studyProposalParticipant),
  }),
);

// study proposal question model and relations
export const studyProposalQuestion = sqliteTable("study_proposal_question", {
  id: integer("id").primaryKey(),
  question: text("question").notNull(),
  studyProposalId: integer("study_proposal_id")
    .notNull()
    .references(() => studyProposal.id),
});
export const studyProposalQuestionRelations = relations(
  studyProposalQuestion,
  ({ one }) => ({
    studyProposal: one(studyProposal, {
      fields: [studyProposalQuestion.studyProposalId],
      references: [studyProposal.id],
    }),
  }),
);

// study proposal tag model and relations
export const studyProposalTag = sqliteTable("study_proposal_tag", {
  id: integer("id").primaryKey(),
  tag: text("tag").notNull(),
  studyProposalId: integer("study_proposal_id")
    .notNull()
    .references(() => studyProposal.id),
});
export const studyProposalTagRelations = relations(
  studyProposalTag,
  ({ one }) => ({
    studyProposal: one(studyProposal, {
      fields: [studyProposalTag.studyProposalId],
      references: [studyProposal.id],
    }),
  }),
);

// study proposal participant model and relations
export const studyProposalParticipant = sqliteTable("study_participant", {
  id: integer("id").primaryKey(),
  participantAccountId: integer("participant_account_id")
    .notNull()
    .references(() => account.id),
  studyProposalId: integer("study_proposal_id")
    .notNull()
    .references(() => studyProposal.id),
});
export const studyProposalParticipantRelations = relations(
  studyProposalParticipant,
  ({ one }) => ({
    account: one(account, {
      fields: [studyProposalParticipant.participantAccountId],
      references: [account.id],
    }),
    studyProposal: one(studyProposal, {
      fields: [studyProposalParticipant.studyProposalId],
      references: [studyProposal.id],
    }),
  }),
);

// study under confirmation model and relations
export const studyUnderConfirmation = sqliteTable("study_under_confirmation", {
  id: integer("id")
    .references(() => studyProposal.id)
    .primaryKey(),
});
export const studyUnderConfirmationRelations = relations(
  studyUnderConfirmation,
  ({ one }) => ({
    studyProposal: one(studyProposal, {
      fields: [studyUnderConfirmation.id],
      references: [studyProposal.id],
    }),
  }),
);
