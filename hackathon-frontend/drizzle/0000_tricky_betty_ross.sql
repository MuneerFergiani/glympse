CREATE TABLE `account` (
	`id` integer PRIMARY KEY NOT NULL,
	`address` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_proposal` (
	`id` integer PRIMARY KEY NOT NULL,
	`study_name` text NOT NULL,
	`study_description` text NOT NULL,
	`study_hypothesis` text NOT NULL,
	`data_analysis_method` text NOT NULL,
	`minimum_participants` integer NOT NULL,
	`maximum_participants` integer NOT NULL,
	`created_unix_timestamp` integer NOT NULL,
	`expiry_unix_timestamp` integer NOT NULL,
	`proposing_account_id` integer NOT NULL,
	FOREIGN KEY (`proposing_account_id`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `study_participant` (
	`id` integer PRIMARY KEY NOT NULL,
	`participant_account_id` integer NOT NULL,
	`study_proposal_id` integer NOT NULL,
	FOREIGN KEY (`participant_account_id`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`study_proposal_id`) REFERENCES `study_proposal`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `study_proposal_question` (
	`id` integer PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`study_proposal_id` integer NOT NULL,
	FOREIGN KEY (`study_proposal_id`) REFERENCES `study_proposal`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `study_proposal_tag` (
	`id` integer PRIMARY KEY NOT NULL,
	`tag` text NOT NULL,
	`study_proposal_id` integer NOT NULL,
	FOREIGN KEY (`study_proposal_id`) REFERENCES `study_proposal`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `study_under_confirmation` (
	`id` integer PRIMARY KEY NOT NULL,
	`study_proposal_id` integer NOT NULL,
	`expiry_unix_timestamp` integer NOT NULL,
	FOREIGN KEY (`study_proposal_id`) REFERENCES `study_proposal`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `study_voting` (
	`id` integer PRIMARY KEY NOT NULL,
	`study_proposal_id` integer NOT NULL,
	`expiry_unix_timestamp` integer NOT NULL,
	FOREIGN KEY (`study_proposal_id`) REFERENCES `study_proposal`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_address_unique` ON `account` (`address`);--> statement-breakpoint
CREATE UNIQUE INDEX `study_under_confirmation_study_proposal_id_unique` ON `study_under_confirmation` (`study_proposal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `study_voting_study_proposal_id_unique` ON `study_voting` (`study_proposal_id`);