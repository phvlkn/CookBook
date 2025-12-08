import { useState, useEffect } from 'react'

export default function useRecipes(page = 1, pageSize = 10) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch(`/api/recipes/all?skip=${(page-1)*pageSize}&limit=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        if (!mounted) return
        setRecipes(prev => [...prev, ...data])
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [page])

  return { recipes, loading }
}
