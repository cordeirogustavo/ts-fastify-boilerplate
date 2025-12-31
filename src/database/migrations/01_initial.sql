CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApprovalStatus') THEN
          CREATE TYPE public."UserStatus" AS ENUM
      ('ACTIVE', 'DEACTIVATED', 'PENDING');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MfaType') THEN
        CREATE TYPE public."MfaType" AS ENUM
            ('EMAIL', 'APP');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS CREATE TYPE public."UserProvider" AS ENUM
        ('API', 'GOOGLE', 'FACEBOOK');
    END IF;
END
$$;

BEGIN;

CREATE TABLE IF NOT EXISTS public."user"
(
    "userId" uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(200),
    status "UserStatus",
    provider "UserProvider" NOT NULL,
    "providerIdentifier" character varying(100),
    "mfaEnabled" integer DEFAULT 0,
    "mfaKey" json,
    "mfaMethod" "MfaType",
    "mfaEabledAt" timestamp without time zone,
    "userPicture" character varying(1024),
    "createdAt" timestamp without time zone NOT NULL DEFAULT NOW(),
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    CONSTRAINT "PK_user_userId" PRIMARY KEY ("userId")
);