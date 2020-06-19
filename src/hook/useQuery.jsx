import { useState, useEffect, useMemo, useContext } from 'react'
import Context from "../context"
import axios from "axios"

export default ({ options }) => {
  const { accessToken } = useContext(Context)
  const [loading, setLoading] = useState(false)
  const [fetchedData, setFetchedData] = useState()

  const instance = useMemo(() => axios.create({
    baseURL: "https://api.skedulo.com",
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`
    }
  }), [accessToken, options.headers])

  useEffect(() => {
    if (!options.bulkQuery) {
      if (!options.api || !accessToken) {
        return;
      }

      setLoading(true)

      instance({
        url: options.api,
        method: options.method || "get",
        params: options.params,
        data: options.data
      }).then((response) => {
        setLoading(false)
        setFetchedData(response.data)
      }).catch((e) => {
        setLoading(false)
        setFetchedData(e)
      })
    } else {
      setLoading(true)

      const promises = options.options.map(opt => {
        return instance({
          ...opt,
          url: opt.api,
          method: opt.method || "get"
        })
      })

      axios.all(promises).then((response) => {
        setLoading(false)
        setFetchedData(response.data)
      }).catch((e) => {
        setLoading(false)
        setFetchedData(e)
      })
    }

    return () => { }
  }, [instance, options, accessToken])

  return [loading, fetchedData]
}