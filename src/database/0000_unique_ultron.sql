-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."MfaType" AS ENUM('EMAIL', 'APP');--> statement-breakpoint
CREATE TYPE "public"."UserProvider" AS ENUM('API', 'GOOGLE', 'FACEBOOK');--> statement-breakpoint
CREATE TYPE "public"."UserStatus" AS ENUM('ACTIVE', 'DEACTIVATED', 'PENDING');--> statement-breakpoint
CREATE TABLE "user" (
	"userId" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password" varchar(200),
	"status" "UserStatus",
	"provider" "UserProvider" NOT NULL,
	"providerIdentifier" varchar(100),
	"mfaEnabled" integer DEFAULT 0,
	"mfaKey" json,
	"mfaMethod" "MfaType",
	"mfaEabledAt" timestamp,
	"userPicture" varchar(1024),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);

*/