import { useState, useEffect, useMemo } from 'react'
import axios from "axios"

export default ({ token, options }) => {
  const [loading, setLoading] = useState(false)
  const [fetchedData, setFetchedData] = useState()

  const instance = useMemo(() => axios.create({
    baseURL: "https://api.skedulo.com",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }), [token])

  useEffect(() => {

    if (!options.api || !token) {
      return;
    }

    setLoading(true)

    instance({
      url: options.api,
      method: options.method || "get",
      data: options.params
    }).then((response) => {
      setLoading(false)
      setFetchedData(response.data)
    })

    return () => { }
  }, [instance, options])

  return [loading, fetchedData]
}