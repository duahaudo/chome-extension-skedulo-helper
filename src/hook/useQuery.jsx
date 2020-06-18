import { useState, useEffect, useMemo } from 'react'
import axios from "axios"

export default ({ token, options }) => {
  const [loading, setLoading] = useState(false)
  const [fetchedData, setFetchedData] = useState()

  const instance = useMemo(() => axios.create({
    baseURL: "https://api.skedulo.com",
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  }), [token, options.headers])

  useEffect(() => {

    if (!options.api || !token) {
      return;
    }

    setLoading(true)

    console.log(instance)
    console.log(options)
    console.log({
      url: options.api,
      method: options.method || "get",
      data: options.params
    })

    instance({
      url: options.api,
      method: options.method || "get",
      data: options.params
    }).then((response) => {
      setLoading(false)
      setFetchedData(response.data)
    })

    return () => { }
  }, [instance, options, token])

  return [loading, fetchedData]
}