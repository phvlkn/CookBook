import { useState, useEffect } from 'react'
import { ApiClient } from '../../utils/storage'

export default function useRecipes(page = 1, pageSize = 10) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ApiClient.fetchRecipes({ skip: (page - 1) * pageSize, limit: pageSize })
      .then((data) => {
        if (!mounted) return
        setRecipes((prev) => [...prev, ...data])
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [page])

  return { recipes, loading }
}
