import React, { useState, useEffect, useCallback, useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons'
import useQuery from "../hook/useQuery"
import Context from "../context"

export default ({ accessToken }) => {

  const [queryOptions, setQueryOptions] = useState({})
  const [loading] = useQuery({ token: accessToken, options: queryOptions })
  const { setLoading } = useContext(Context)

  const startSdk = useCallback(
    () => {
      setQueryOptions({
        api: "https://localhost:1928/session/start",
        method: "post",
        data: { "REALTIME_SERVER": "https://api.skedulo.com", "API_SERVER": "https://api.skedulo.com" }
      })
    },
    [],
  )

  const stopSdk = useCallback(
    () => {
      setQueryOptions({
        api: "https://localhost:1928/session/stop",
        method: "post"
      })
    },
    [],
  )

  useEffect(() => {
    setLoading(loading)
    return () => { }
  }, [loading, setLoading])

  return <>
    <h6 className="text-muted">SDK</h6>
    <button className="btn btn-primary mr-1" onClick={() => startSdk()}><FontAwesomeIcon icon={faPlay} /> Start </button>
    <button className="btn btn-secondary" onClick={() => stopSdk()}><FontAwesomeIcon icon={faStop} /> End</button>
  </>
}