CREATE TABLE `study_under_confirmation` (
	`id` integer PRIMARY KEY NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `study_proposal`(`id`) ON UPDATE no action ON DELETE no action
);
