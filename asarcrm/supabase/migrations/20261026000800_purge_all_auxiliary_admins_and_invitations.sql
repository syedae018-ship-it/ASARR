-- ==============================================================================
-- ASARR AGENCYOS - MIGRATION 8: PURGE AUXILIARY ADMINS & ALL INVITATIONS
-- ==============================================================================
-- Purpose:
-- 1. Permanently delete all previous admin invitations
-- 2. Permanently delete all previous client onboarding invitations
-- 3. Delete any admin memberships other than syed.ae018@asarr.in (77308899-8657-4ce4-907c-b56e33c8f760)
-- 4. Delete any profiles other than syed.ae018@asarr.in
-- 5. Delete any auxiliary client users
-- 6. Provide a secure RPC function to allow admins to purge invitations at any time.

-- 1. Permanently delete all previous admin invitations
DELETE FROM public.admin_invitations;

-- 2. Permanently delete all previous client onboarding invitations
DELETE FROM public.client_onboarding_invitations;

-- 3. Delete any admin memberships other than primary owner syed.ae018@asarr.in
DELETE FROM public.admin_memberships
WHERE user_id <> '77308899-8657-4ce4-907c-b56e33c8f760'
   OR (email IS NOT NULL AND lower(trim(email)) <> 'syed.ae018@asarr.in');

-- 4. Delete any profiles other than primary owner syed.ae018@asarr.in
DELETE FROM public.profiles
WHERE id <> '77308899-8657-4ce4-907c-b56e33c8f760'
   OR lower(trim(email)) <> 'syed.ae018@asarr.in';

-- 5. Delete any client_users associations
DELETE FROM public.client_users;

-- 6. Security Definer RPC function to purge all admin invitations
CREATE OR REPLACE FUNCTION public.purge_all_admin_invitations()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_invitations;
  RETURN jsonb_build_object('success', true, 'message', 'All admin invitations successfully deleted.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.purge_all_admin_invitations() TO authenticated, anon;
