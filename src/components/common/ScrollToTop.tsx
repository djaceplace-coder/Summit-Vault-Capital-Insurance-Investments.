import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures pages scroll smoothly to top on navigation and page reloads.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname, search]);

  return null;
}
