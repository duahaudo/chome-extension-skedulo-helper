// @ts-nocheck
/*global chrome*/

import "./style.scss"

import React, { useCallback, useState, useContext, useEffect, useRef, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faLink, faTimes, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import $ from "jquery"
import { each } from "lodash"
import Loading from "../loading"

import useQuery from "../hook/useQuery"
import Context from "../context"
import ManageCF from "./manageCustomForm"
import useApiInstance from "../hook/useApiInstance"

export default () => {

  const instance_url = useApiInstance()
  const { idToken } = useContext(Context)

  const [queryForms, setQueryForms] = useState({})
  const [loadingForms, managedForms] = useQuery({ options: queryForms })

  const [queryJobs, setQueryJobs] = useState({})
  const [loadingJobs, jobs] = useQuery({ options: queryJobs })

  const [uploadForm, setQueryUploadForm] = useState({})
  const [loadingUpload] = useQuery({ options: uploadForm })

  const [markDownload, setMarkDownload] = useState(false)
  const [showManage, setShowManage] = useState(false)

  const ref = useRef(null)

  const getLink = useCallback((jobType) => `${instance_url}/api/Jobs?limit=3&filter=(JobStatus != "Complete" AND JobStatus != "Cancelled" ${jobType ? ` AND Type == "${jobType}"` : ""})&fieldNames=UID, Name&onlyFields=true&orderBy=Name DESC`, [instance_url])

  const uploadHandler = useCallback(() => {
    var input = document.createElement('input');
    input.multiple = "multiple";
    input.type = 'file';
    input.click();

    input.onchange = e => {
      var { files } = e.target;
      each(files, uploadHandler)
    }

    const uploadHandler = (file) => {
      var bodyFormData = new FormData();
      bodyFormData.set('file', file);

      setQueryUploadForm({
        api: "/centrifuge/util/deploy-form",
        method: "post",
        data: bodyFormData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
  }, [])

  const showPanel = useCallback((show) => {
    setShowManage(show)
    setTimeout(() => {
      if (ref.current) {
        $(ref.current)[show ? "slideDown" : "slideUp"]()
      }
    }, 400)

  }, [ref.current])

  const viewCFPanelHandler = useCallback(() => {

    setQueryForms({
      api: "/customform/form",
      type: "get",
      timestampe: Date.now()
    })
    // setMarkDownload(true)

    showPanel(true)

  }, [showManage, queryForms])

  // loading list custom form
  useEffect(() => {
    if (!loadingUpload && markDownload) {
      showPanel(true)

      setTimeout(() => {
        $(ref.current).slideDown()
        setMarkDownload(false)
      }, 400)
    }
  }, [loadingUpload, markDownload])

  const openJobHandler = useCallback((type) => {
    // setQueryJob(getLink(type))
    setQueryJobs({
      api: getLink(type),
      type: "get",
      timestampe: Date.now()
    })
  }, [queryJobs])

  useEffect(() => {
    if (jobs && jobs.Jobs.records) {
      const [job] = jobs.Jobs.records;
      console.log(job.UID)
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.create({ url: `http://localhost:9050/form/index.html#${job.UID}/0` }, (tab) => {
          chrome.tabs.executeScript(tab.id, { code: `SetIdToken("${idToken}")` });
        })
      })
    }
  }, [jobs, idToken])

  useEffect(() => {

    console.log(`👉  SLOG (${new Date().toLocaleTimeString()}): 🏃‍♂️ managedForms`, showManage)
  }, [showManage])

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
        <ManageCF forms={managedForms ? managedForms.result : []} refresh={() => viewCFPanelHandler()} />
        <button className="btn btn-dark m-2 float-right" onClick={() => showPanel(false)}>
          <FontAwesomeIcon icon={faTimes} /> Close </button>
      </div>}
      {(loadingForms || loadingJobs || loadingUpload) && <Loading />}
    </div>
  )
}