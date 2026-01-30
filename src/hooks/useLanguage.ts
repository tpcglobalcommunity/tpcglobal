import { useParams } from 'react-router-dom';

export function useLanguage() {
  const { lang } = useParams<{ lang?: string }>();
  
  // Default to 'en' if no lang parameter or invalid lang
  const language = lang === 'id' ? 'id' : 'en';
  
  return { language };
}
