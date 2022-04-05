// @ts-nocheck
/*global chrome*/

import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faExternalLinkAlt, faCube, faBoxOpen, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import useQuery from "../hook/useQuery"
import useApiInstance from '../hook/useApiInstance'
import Loading from "../loading"

export default ({ accessToken }) => {

  const [startPkg, setQueryStarPkg] = useState({})
  const [starting] = useQuery({ token: accessToken, options: startPkg })

  const [getBuildPkgs, setGetBuildPkgs] = useState({})
  const [loadingBuildPkgs, buildPkgs] = useQuery({ options: getBuildPkgs })

  const [queryBuildStatus, setQueryBuildStatus] = useState({})
  const [loadingBuildStatus, pkgStatus] = useQuery({ options: queryBuildStatus })

  const [queryTurnOnManagePkg, setQueryTurnOnManagePkg] = useState({})
  const [loadingTurnOnMangePkg] = useQuery({ options: queryTurnOnManagePkg })

  // const [buildPkgs, setBuildPkgs] = useState([])
  // const [pkgStatus, setPkgStatus] = useState(null)
  const [currentPkg, setCurrentPkg] = useState(null)

  const instance_url = useApiInstance()

  const startSdk = useCallback(
    () => {
      setQueryStarPkg({
        api: "https://localhost:1928/session/start",
        method: "post",
        data: { "REALTIME_SERVER": instance_url, "API_SERVER": instance_url }
      })
    },
    [],
  )

  const stopSdk = useCallback(
    () => {
      setQueryStarPkg({
        api: "https://localhost:1928/session/stop",
        method: "post"
      })
    },
    [],
  )

  const [managePkgStatus, setManagePkgStatus] = useState(false)

  const getAllBuildPkgs = useCallback(() => {
    setGetBuildPkgs({
      api: "/pkg/installed",
      method: "get"
    })
  }, [])

  const refreshStatus = useCallback((pkg) => {
    setCurrentPkg(pkg)
    const { name } = pkg
    setQueryBuildStatus({
      api: "/pkg/builds",
      method: "get",
      param: { name }
    })
  }, [])

  // useEffect(() => {

  //   if (!starting && !!fetchData) {
  //     switch (startPkg.api) {
  //       case "/pkg/installed":
  //         setBuildPkgs(fetchData.result)
  //         break;

  //       case "/pkg/builds":
  //         setPkgStatus(fetchData.result[0] || null)
  //         break;

  //       default:
  //     }
  //   }

  // }, [fetchData, startPkg, starting])

  const installedPackaged = useMemo(() => buildPkgs ? buildPkgs.result : [], [buildPkgs])

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
      setQueryTurnOnManagePkg({
        api: "/package/global/manage-pkgs",
        method: "put",
        data: {
          active: !managePkgStatus
        }
      })
      setManagePkgStatus(!managePkgStatus)
    }}><FontAwesomeIcon icon={faCube} /> Turn On Manage Pkg</button>

    <div className="btn-group mr-1 mt-1" role="group">
      <button className="btn btn-primary text-white" onClick={() => getAllBuildPkgs()}>
        <FontAwesomeIcon icon={faBoxOpen} /> Packages </button>

      {installedPackaged.map((pkg, idx) => {
        return <button className="btn btn-info" key={idx}>
          <FontAwesomeIcon icon={currentPkg && (pkg.id === currentPkg.id) ? faEye : faEyeSlash} />
          <span onClick={() => refreshStatus(pkg)}> {pkg.name} </span>
          <span>
            <small className="status">
              {currentPkg && pkgStatus && (pkg.id === currentPkg.id) ? pkgStatus.result[0].status : ""}
            </small>
          </span>
        </button>
      })}
    </div>

    {(starting || loadingBuildPkgs || loadingBuildStatus || loadingTurnOnMangePkg) && <Loading />}
  </>
}