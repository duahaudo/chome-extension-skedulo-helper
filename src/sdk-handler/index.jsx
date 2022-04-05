// @ts-nocheck
/*global chrome*/

import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faExternalLinkAlt, faCube, faBoxOpen, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import useQuery from "../hook/useQuery"
import Context from "../context"
import useApiInstance from '../hook/useApiInstance'

export default ({ accessToken }) => {

  const [queryOptions, setQueryOptions] = useState({})
  const [loading, fetchData] = useQuery({ token: accessToken, options: queryOptions })
  const { setLoading } = useContext(Context)

  const [buildPkgs, setBuildPkgs] = useState([])
  const [pkgStatus, setPkgStatus] = useState(null)
  const [currentPkg, setCurrentPkg] = useState(null)

  const instance_url = useApiInstance()

  const startSdk = useCallback(
    () => {
      setQueryOptions({
        api: "https://localhost:1928/session/start",
        method: "post",
        data: { "REALTIME_SERVER": instance_url, "API_SERVER": instance_url }
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

  const [managePkgStatus, setManagePkgStatus] = useState(false)

  const getAllBuildPkgs = useCallback(() => {
    setQueryOptions({
      api: "/pkg/installed",
      method: "get"
    })
  }, [])

  const getBuildStatus = useCallback((pkg) => {
    if (!currentPkg || (pkg.id !== currentPkg.id)) {
      setCurrentPkg(pkg)
      setQueryOptions({
        api: "/pkg/builds",
        method: "get",
        param: { name: pkg.name }
      })
    } else {
      setCurrentPkg(null)
    }
  }, [currentPkg])

  const refreshStatus = useCallback(() => {
    setQueryOptions({
      api: "/pkg/builds",
      method: "get",
      param: { name: currentPkg.name }
    })
  }, [currentPkg])

  useEffect(() => {

    if (!loading && !!fetchData) {
      switch (queryOptions.api) {
        case "/pkg/installed":
          setBuildPkgs(fetchData.result)
          break;

        case "/pkg/builds":
          setPkgStatus(fetchData.result[0] || null)
          break;

        default:
      }
    }

  }, [fetchData, queryOptions, loading])

  return <>
    <h6 className="text-muted">SDK</h6>
    <button className="btn btn-primary mr-1 mt-1" onClick={() => startSdk()}><FontAwesomeIcon icon={faPlay} /> Start </button>
    <button className="btn btn-secondary mr-1 mt-1" onClick={() => stopSdk()}><FontAwesomeIcon icon={faStop} /> End</button>
    <button className="btn btn-success mr-1 mt-1" onClick={() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0]
        const protocols = tab.url.split("//")[0];
        const domain = tab.url.split("//")[1].split('/')[0]
        chrome.tabs.create({ url: `${protocols}//${domain}/c-dev/` });
      })
    }}><FontAwesomeIcon icon={faExternalLinkAlt} /> Open Dev </button>
    <button className="btn btn-warning mr-1 mt-1" onClick={() => {
      setQueryOptions({
        api: "/package/global/manage-pkg",
        method: "put",
        data: {
          active: !managePkgStatus
        }
      })
      setManagePkgStatus(!managePkgStatus)
    }}><FontAwesomeIcon icon={faCube} /> Turn On Manage Pkg</button>

    <div className="btn-group mr-1 mt-1" role="group">
      <button className="btn btn-primary text-white" onClick={() => getAllBuildPkgs()}><FontAwesomeIcon icon={faBoxOpen} /> Packages </button>

      {buildPkgs.map((pkg, idx) => {
        return <button className="btn btn-info" key={idx}>
          <FontAwesomeIcon icon={currentPkg && (pkg.id === currentPkg.id) ? faEye : faEyeSlash} />
          <span onClick={() => getBuildStatus(pkg)}> {pkg.name} </span>
          <span onClick={() => refreshStatus()}><small className="status"> {currentPkg && pkgStatus && (pkg.id === currentPkg.id) ? pkgStatus.status : ""} </small></span></button>
      })}
    </div>
  </>
}