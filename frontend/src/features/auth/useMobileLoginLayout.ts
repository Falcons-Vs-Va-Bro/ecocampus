import { useEffect, useState } from 'react'

export const mobileLoginLayoutQuery =
  '(max-width: 640px), ((max-height: 500px) and (pointer: coarse))'

export function matchesMobileLoginLayout() {
  return window.matchMedia(mobileLoginLayoutQuery).matches
}

export function useMobileLoginLayout() {
  const [matches, setMatches] = useState(matchesMobileLoginLayout)

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileLoginLayoutQuery)
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches)

    setMatches(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return matches
}
