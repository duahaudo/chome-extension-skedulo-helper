// @ts-nocheck
/*global chrome*/

import "./style.scss"

import React, { useCallback, useState, useContext, useEffect, useRef, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faLink, faTimes, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import $ from "jquery"

import useQuery from "../hook/useQuery"
import Context from "../context"
import ManageCF from "./manageCustomForm"

const getLink = (jobType) => `https://api.skedulo.com/api/Jobs?limit=3&filter=(JobStatus != "Complete" AND JobStatus != "Cancelled" ${jobType ? ` AND Type == "${jobType}"` : ""})&fieldNames=UID, Name&onlyFields=true&orderBy=Name DESC`

export default () => {

  const { setLoading, idToken } = useContext(Context)
  const [queryOptions, setQueryOptions] = useState({})
  const [loading, fetchedData] = useQuery({ options: queryOptions })
  const [markDownload, setMarkDownload] = useState(false)
  const [showManage, setShowManage] = useState(false)
  const [forms, setForms] = useState([])

  const ref = useRef(null)

  const uploadHandler = useCallback(() => {
    var input = document.createElement('input');
    input.type = 'file';
    input.click();

    input.onchange = e => {
      var file = e.target.files[0];
      var bodyFormData = new FormData();
      bodyFormData.set('file', file);

      setQueryOptions({
        api: "/centrifuge/util/deploy-form",
        method: "post",
        data: bodyFormData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
  }, [])

  useEffect(() => {
    setLoading(loading)
  }, [loading, setLoading])

  const viewCFPanelHandler = useCallback(() => {
    const newState = !showManage

    if (newState) {
      setQueryOptions({
        api: "/customform/form",
        type: "get",
        timestampe: Date.now()
      })
      setMarkDownload(true)
    } else {
      $(ref.current)[newState ? "slideDown" : "slideUp"]()
      setTimeout(() => setShowManage(newState), 400)
    }

  }, [showManage])

  // loading list custom form
  useEffect(() => {
    if (!loading && markDownload) {
      setShowManage(true)

      setTimeout(() => {
        $(ref.current).slideDown()
        setMarkDownload(false)
      }, 400)
    }
  }, [loading, markDownload])

  const [queryJob, setQueryJob] = useState(getLink())

  useEffect(() => {
    if (!loading) {
      switch (queryOptions.api) {
        case "/customform/form": {
          if (fetchedData && fetchedData.result) {
            setForms(fetchedData.result)
          }
          break;
        }
        case queryJob: {
          if (fetchedData && fetchedData.Jobs.records) {
            const job = fetchedData.Jobs.records[0];
            console.log(job.UID)
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              chrome.tabs.create({ url: `http://localhost:9050/form/index.html#${job.UID}/0` }, (tab) => {
                chrome.tabs.executeScript(tab.id, { code: `SetIdToken("${idToken}")` });
              })
            })
          }
          break;
        }
        default:
      }
    }

  }, [fetchedData, queryOptions, loading, queryJob, idToken])

  const openJobHandler = useCallback((type) => {
    setQueryJob(getLink(type))
    setQueryOptions({
      api: getLink(type),
      type: "get",
      timestampe: Date.now()
    })
  }, [])

  return (
    <div className="cf-wrapper">
      <h6 className="text-muted">Custom Form</h6>

      <div className="btn-group mr-1 mb-1" role="group">
        <button className="btn btn-warning text-white" onClick={() => openJobHandler()}><FontAwesomeIcon icon={faExternalLinkAlt} /> Job </button>
        <button className="btn btn-info" onClick={() => openJobHandler("Single Booking")}>Single Booking </button>
        <button className="btn btn-success" onClick={() => openJobHandler("Group Event")}>Group Event </button>
      </div>

      <div />

      <button className="btn btn-primary mr-1" onClick={() => uploadHandler()}><FontAwesomeIcon icon={faUpload} /> Deploy </button>
      <button className="btn btn-secondary mr-1" onClick={() => viewCFPanelHandler()}><FontAwesomeIcon icon={faLink} /> Manage </button>

      {showManage && <div ref={ref} className="panel">
        <ManageCF forms={forms} setForms={setForms} />
        <button className="btn btn-dark m-2 float-right" onClick={() => viewCFPanelHandler()}><FontAwesomeIcon icon={faTimes} /> Close </button>
      </div>}
    </div>
  )
}