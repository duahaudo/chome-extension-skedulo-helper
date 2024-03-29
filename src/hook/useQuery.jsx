import { useState, useEffect, useMemo, useContext } from 'react'
import Context from "../context"
import axios from "axios"
import useApiInstance from './useApiInstance'

export default ({ options }) => {
  const { accessToken } = useContext(Context)
  const instance_url = useApiInstance()
  const [loading, setLoading] = useState(false)
  const [fetchedData, setFetchedData] = useState()

  const instance = useMemo(() => axios.create({
    baseURL: instance_url,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`
    }
  }), [accessToken, options.headers, instance_url])

  useEffect(() => {
    // console.log(options)

    if (!options.bulkQuery) {
      if (!options.api || !accessToken) {
        return;
      }

      setLoading(true)
      setFetchedData(null)

      instance({
        url: options.api,
        method: options.method || "get",
        params: options.params,
        data: options.data
      }).then((response) => {
        // console.log('Query response', response.data)
        setFetchedData({ ...response.data })
        setLoading(false)
      }).catch((e) => {
        setFetchedData(e)
        setLoading(false)
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
        console.log(response.data)
        setFetchedData(response.data)
        setLoading(false)
      }).catch((e) => {
        setFetchedData(e)
        setLoading(false)
      })
    }

    return () => { }
  }, [instance, options, accessToken])

  return [loading, fetchedData]
}