-- =====================================================
-- CHECK EMAIL TEMPLATES STATUS
-- =====================================================

-- Query to check email templates with their status
select 
  template_type,
  lang,
  is_active,
  updated_at
from public.email_templates
order by template_type, lang;
