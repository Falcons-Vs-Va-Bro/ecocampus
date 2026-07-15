import { useEffect, useState } from 'react'

export const mobileMarketplaceLayoutQuery =
  '(max-width: 720px), ((max-height: 500px) and (pointer: coarse))'

export function matchesMobileMarketplaceLayout() {
  return window.matchMedia(mobileMarketplaceLayoutQuery).matches
}

export function useMobileMarketplaceLayout() {
  const [matches, setMatches] = useState(matchesMobileMarketplaceLayout)

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileMarketplaceLayoutQuery)
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches)

    setMatches(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return matches
}
