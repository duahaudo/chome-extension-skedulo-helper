import "./style.scss"

import React, { useCallback, useState, useContext, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faLink, faTrashAlt, faSave, faWindowClose } from '@fortawesome/free-solid-svg-icons'
import Select from 'react-select'
import _ from "lodash"
import $ from "jquery"

import useQuery from "../hook/useQuery"
import Context from "../context"

export default ({ }) => {

  const { setLoading } = useContext(Context)
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

  useEffect(() => {
    if (!loading) {
      switch (queryOptions.api) {
        case "/customform/form": {
          if (fetchedData && fetchedData.result) {
            setForms(fetchedData.result)
          }
          break;
        }

        default:
      }
    }

  }, [fetchedData, queryOptions, loading])

  return (
    <div className="cf-wrapper">
      <h6 className="text-muted">Custom Form</h6>
      <button className="btn btn-primary mr-1" onClick={() => uploadHandler()}><FontAwesomeIcon icon={faUpload} /> Deploy </button>
      <button className="btn btn-secondary mr-1" onClick={() => viewCFPanelHandler()}><FontAwesomeIcon icon={faLink} /> Manage </button>

      {showManage && <div ref={ref} className="panel">
        <ManageCF forms={forms} setForms={setForms} />
        <button className="btn btn-success m-2 float-right" onClick={() => viewCFPanelHandler()}><FontAwesomeIcon icon={faWindowClose} /> Close </button>
      </div>}
    </div>
  )
}

const ManageCF = ({ forms, setForms }) => {

  const { skedLocalStorage, setLoading } = useContext(Context)
  const jobTypes = JSON.parse(skedLocalStorage["sked-default.schemaVocab"]).value.Jobs.Type
  const [queryOptions, setQueryOptions] = useState({})
  const [loading, fetchedData] = useQuery({ options: queryOptions })
  const [linkForms, setLinkForms] = useState([])

  useEffect(() => {
    setLoading(loading)
  }, [loading, setLoading])

  const linkFormHandler = useCallback((formId, selectedOptions) => {
    console.log(selectedOptions)
    const newLinkForms = [...linkForms]
    const existItem = newLinkForms.find(item => item.formId === formId);

    if (existItem) {
      existItem.jobTypes = (selectedOptions || []).map(item => item.value)
    } else {
      newLinkForms.push({
        formId, jobTypes: (selectedOptions || []).map(item => item.value)
      })
    }

    setLinkForms([...newLinkForms])
  }, [linkForms])

  const saveFormLink = useCallback((form) => {
    const updatedForm = linkForms.find(f => f.formId === form.id)
    const removedJobType = _.difference(form.jobTypes, updatedForm.jobTypes)
    const addedJobTypes = _.difference(updatedForm.jobTypes, form.jobTypes)

    let options = []

    addedJobTypes.forEach(jobType => {
      options.push({
        api: "/customform/link_form",
        method: "POST",
        data: {
          formId: form.formRev.formId,
          jobTypeName: jobType
        }
      })
    })
    removedJobType.forEach(jobType => {
      options.push({
        api: "/customform/link_form",
        method: "DELETE",
        params: {
          form_id: form.formRev.formId,
          job_type_name: jobType
        }
      })
    })

    setQueryOptions({
      bulkQuery: true,
      options
    })
  }, [linkForms])

  const removeForm = useCallback((form) => {
    setQueryOptions({
      api: "/customform/form/" + form.formRev.formId,
      method: "DELETE"
    })

    const newFormLst = _.reject(forms, item => item.formRev.formId === form.formRev.formId)
    setForms(newFormLst)
  }, [forms, setForms])

  return (
    <div className="lst-custom-form">
      {(forms || []).map(form => {
        const name = form.formRev.definition.forms.map(item => item.name).join('\n')
        const formJobTypes = jobTypes.filter(item => form.jobTypes.indexOf(item.value) > -1)

        return <div key={form.id} className="d-flex border-bottom small">
          <div className="col-3 align-self-center">{name}</div>
          <div className="flex-fill p-1">
            <SelectComp jobTypes={jobTypes} existSelected={formJobTypes} onChange={(selectedOptions) => linkFormHandler(form.id, selectedOptions)} />
          </div>
          <div className="align-self-center d-flex">
            <button className="btn-sm bg-primary border-0 text-white m-1" onClick={() => saveFormLink(form)}><FontAwesomeIcon icon={faSave} /> </button>
            <button className="btn-sm bg-danger border-0 text-white m-1" onClick={() => removeForm(form)}><FontAwesomeIcon icon={faTrashAlt} /> </button>
          </div>
        </div>
      })}
    </div>
  )
}
const SelectComp = ({ jobTypes, existSelected, onChange }) => {
  const [selected, setSelected] = useState(existSelected)

  // console.log(selected, existSelected)

  return (
    <>
      <Select options={jobTypes} isMulti closeMenuOnSelect={false}
        value={selected}
        onChange={(selectedOptions) => {
          setSelected(selectedOptions)
          onChange(selectedOptions)
        }} />
    </>
  )
}