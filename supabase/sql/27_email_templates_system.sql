-- =====================================================
-- EMAIL TEMPLATES SYSTEM (EN/ID) + HELPER FUNCTION
-- =====================================================

begin;

-- 1) Create table
create table if not exists public.email_templates (
  id bigserial primary key,
  template_type text not null,      -- 'welcome' | 'verify' | 'reset' | 'announcement'
  lang text not null,               -- 'en' | 'id'
  subject text not null,
  body_text text not null,
  body_html text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (template_type, lang)
);

-- 2) updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_email_templates_updated_at'
  ) then
    create trigger trg_email_templates_updated_at
    before update on public.email_templates
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

-- 3) Seed templates (idempotent upsert)
insert into public.email_templates (template_type, lang, subject, body_text, body_html, is_active)
values
-- WELCOME
('welcome','en',
 'Welcome to TPC Global',
 'Hi {{name}},

Welcome to TPC Global.
Your account is ready.

Login: {{app_url}}

— TPC Global Team',
 '<p>Hi <b>{{name}}</b>,</p><p>Welcome to <b>TPC Global</b>. Your account is ready.</p><p><a href="{{app_url}}">Open TPC Global</a></p><p>— TPC Global Team</p>',
 true),
('welcome','id',
 'Selamat datang di TPC Global',
 'Halo {{name}},

Selamat datang di TPC Global.
Akun kamu sudah siap.

Login: {{app_url}}

— Tim TPC Global',
 '<p>Halo <b>{{name}}</b>,</p><p>Selamat datang di <b>TPC Global</b>. Akun kamu sudah siap.</p><p><a href="{{app_url}}">Buka TPC Global</a></p><p>— Tim TPC Global</p>',
 true),

-- VERIFY (kalau kamu pakai verify link sendiri)
('verify','en',
 'Verify your email',
 'Hi {{name}},

Please verify your email by clicking this link:
{{verify_url}}

If you didn't request this, ignore this email.

— TPC Global Team',
 '<p>Hi <b>{{name}}</b>,</p><p>Please verify your email:</p><p><a href="{{verify_url}}">Verify Email</a></p><p>If you didn't request this, ignore this email.</p><p>— TPC Global Team</p>',
 true),
('verify','id',
 'Verifikasi email kamu',
 'Halo {{name}},

Silakan verifikasi email kamu dengan klik link berikut:
{{verify_url}}

Jika bukan kamu yang meminta, abaikan email ini.

— Tim TPC Global',
 '<p>Halo <b>{{name}}</b>,</p><p>Silakan verifikasi email kamu:</p><p><a href="{{verify_url}}">Verifikasi Email</a></p><p>Jika bukan kamu yang meminta, abaikan email ini.</p><p>— Tim TPC Global</p>',
 true),

-- RESET
('reset','en',
 'Reset your password',
 'Hi {{name}},

Reset your password here:
{{reset_url}}

If you didn't request this, ignore this email.

— TPC Global Team',
 '<p>Hi <b>{{name}}</b>,</p><p>Reset your password:</p><p><a href="{{reset_url}}">Reset Password</a></p><p>If you didn't request this, ignore this email.</p><p>— TPC Global Team</p>',
 true),
('reset','id',
 'Reset kata sandi kamu',
 'Halo {{name}},

Reset kata sandi kamu di sini:
{{reset_url}}

Jika bukan kamu yang meminta, abaikan email ini.

— Tim TPC Global',
 '<p>Halo <b>{{name}}</b>,</p><p>Reset kata sandi kamu:</p><p><a href="{{reset_url}}">Reset Password</a></p><p>Jika bukan kamu yang meminta, abaikan email ini.</p><p>— Tim TPC Global</p>',
 true),

-- ANNOUNCEMENT
('announcement','en',
 'TPC Global Update',
 'Hi {{name}},

{{message}}

— TPC Global Team',
 '<p>Hi <b>{{name}}</b>,</p><p>{{message}}</p><p>— TPC Global Team</p>',
 true),
('announcement','id',
 'Update TPC Global',
 'Halo {{name}},

{{message}}

— Tim TPC Global',
 '<p>Halo <b>{{name}}</b>,</p><p>{{message}}</p><p>— Tim TPC Global</p>',
 true)
on conflict (template_type, lang)
do update set
  subject = excluded.subject,
  body_text = excluded.body_text,
  body_html = excluded.body_html,
  is_active = excluded.is_active;

-- 4) Helper function: ambil template by type + lang, fallback EN
create or replace function public.get_email_template(p_type text, p_lang text)
returns table(subject text, body_text text, body_html text, lang text)
language sql
stable
as $$
  with wanted as (
    select et.subject, et.body_text, et.body_html, et.lang
    from public.email_templates et
    where et.template_type = p_type
      and et.lang = lower(coalesce(p_lang,'en'))
      and et.is_active = true
    limit 1
  ),
  fallback as (
    select et.subject, et.body_text, et.body_html, et.lang
    from public.email_templates et
    where et.template_type = p_type
      and et.lang = 'en'
      and et.is_active = true
    limit 1
  )
  select * from wanted
  union all
  select * from fallback
  limit 1;
$$;

-- Quick view
select template_type, lang, is_active, updated_at
from public.email_templates
order by template_type, lang;
