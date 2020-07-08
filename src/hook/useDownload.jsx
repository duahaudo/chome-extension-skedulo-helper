import { useState, useEffect, useMemo, useContext } from 'react'
import Context from "../context"
import axios from "axios"

export default (formRevId) => {
  const { accessToken } = useContext(Context)
  const [loading, setLoading] = useState(false)
  const [fetchedData, setFetchedData] = useState()

  const instance = useMemo(() => axios.create({
    baseURL: "https://api.skedulo.com",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      withCredentials: true
    }
  }), [accessToken])

  useEffect(() => {
    if (!formRevId) {
      return;
    }

    setLoading(true)

    try {
      instance({
        url: "customform/file/download",
        method: "get",
        params: {
          ['file_name']: 'viewSources.zip',
          ['form_rev_id']: formRevId
        },
        maxRedirects: 0
      }).catch((e) => {
        console.log(Object.keys(e))
        console.log(e.toJSON())
        console.log(e.config)
        console.log(e.request)
      })
    } catch (e) {
      console.log(e)
    }


  }, [formRevId, instance, accessToken])

  return [loading, fetchedData]
}