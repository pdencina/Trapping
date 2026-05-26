alter table profiles
add column if not exists kyc_status text default 'pending_review';

alter table profiles
add column if not exists kyc_message text;

alter table profiles
add column if not exists kyc_internal_note text;

alter table profiles
add column if not exists reviewed_at timestamptz;

alter table profiles
add column if not exists approved_at timestamptz;

alter table profiles
add column if not exists rejected_at timestamptz;

update profiles
set kyc_status = case
  when validado = 1 then 'approved'
  else coalesce(kyc_status, 'pending_review')
end
where kyc_status is null or kyc_status = 'pending_review';
