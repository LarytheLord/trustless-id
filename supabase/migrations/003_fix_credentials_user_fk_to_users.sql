-- Migration: Fix credentials.user_id foreign key target
-- Problem observed: credentials_user_id_fkey points to profiles(id),
-- while app writes user IDs from public.users(id).

DO $$
BEGIN
    -- Drop old FK regardless of referenced table.
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'credentials_user_id_fkey'
          AND conrelid = 'public.credentials'::regclass
    ) THEN
        ALTER TABLE public.credentials DROP CONSTRAINT credentials_user_id_fkey;
    END IF;

    -- Recreate FK against public.users(id)
    ALTER TABLE public.credentials
        ADD CONSTRAINT credentials_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Skipping FK fix: public.credentials or public.users does not exist yet.';
END $$;
