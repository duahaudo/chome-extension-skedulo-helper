// @ts-nocheck
/*global chrome*/

import React, { useState, useEffect, useCallback, useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
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
    <button className="btn btn-secondary mr-1" onClick={() => stopSdk()}><FontAwesomeIcon icon={faStop} /> End</button>
    <button className="btn btn-success mr-1" onClick={() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0]
        const protocols = tab.url.split("//")[0];
        const domain = tab.url.split("//")[1].split('/')[0]
        chrome.tabs.create({ url: `${protocols}//${domain}/c-dev/` });
      })
    }}><FontAwesomeIcon icon={faExternalLinkAlt} /> Open Dev </button>
  </>
}