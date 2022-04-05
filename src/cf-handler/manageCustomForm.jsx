import { faEllipsisV, faSave, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import _ from "lodash"
import React, { useCallback, useContext, useEffect, useState } from 'react'
import Select from 'react-select'
import Context from "../context"
import useQuery from "../hook/useQuery"
import Loading from "../loading"

export default ({ forms, refresh }) => {
  const { skedLocalStorage } = useContext(Context)
  const jobTypes = JSON.parse(skedLocalStorage["sked-default.schemaVocab"]).value.Jobs.Type

  const [linkJobTypeOptions, setLinkJobTypeOptions] = useState({})
  const [linkJobTypeLoading] = useQuery({ options: linkJobTypeOptions })

  const [deleteForm, setQueryDeleteForm] = useState({})
  const [deleting] = useQuery({ options: deleteForm })

  const [linkForms, setLinkForms] = useState([])

  // const [downloadOpt, setDownloadOpt] = useState("")
  // const [loading2, fetchedDownload] = useDownload(downloadOpt)

  const linkFormHandler = useCallback((formId, selectedOptions) => {
    // console.log(selectedOptions)
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

    setLinkJobTypeOptions({
      bulkQuery: true,
      options
    })
  }, [linkForms])

  const removeForm = useCallback((form) => {
    setQueryDeleteForm({
      api: "/customform/form/" + form.formRev.formId,
      method: "DELETE"
    })

  }, [forms])

  useEffect(() => {
    if (!deleting) {
      refresh()
    }
  }, [deleting])

  // const downloadForm = useCallback((form) => {
  //   setDownloadOpt(form.formRev.id)
  // }, [])

  return (
    <div className="lst-custom-form">
      {(forms || []).map(form => {
        const name = form.formRev.definition.forms.map(item => item.name).join('\n')
        const formJobTypes = jobTypes.filter(item => form.jobTypes.indexOf(item.value) > -1)
        const isMenuForm = form.formRev.definition.deploy && (form.formRev.definition.deploy.context === "resource")

        return <div key={form.id} className="d-flex border-bottom small">
          <div className="col-3 align-self-center">{isMenuForm && <FontAwesomeIcon icon={faEllipsisV} />} {name}</div>
          <div className="flex-fill p-1 jobtype-row">
            <SelectComp jobTypes={jobTypes} disabled={isMenuForm} existSelected={formJobTypes} onChange={(selectedOptions) => linkFormHandler(form.id, selectedOptions)} />
          </div>
          <div className="align-self-center d-flex">
            <button className="btn-sm bg-primary border-0 text-white m-1" onClick={() => saveFormLink(form)}>
              <FontAwesomeIcon icon={faSave} /> </button>
            {/* <button className="btn-sm bg-success border-0 text-white m-1" onClick={() => downloadForm(form)}><FontAwesomeIcon icon={faFileDownload} /> </button> */}
            <button className="btn-sm bg-danger border-0 text-white m-1" onClick={() => removeForm(form)}>
              <FontAwesomeIcon icon={faTrashAlt} /> </button>
          </div>
        </div>
      })}

      {(linkJobTypeLoading || deleting) && <Loading />}
    </div>
  )
}
const SelectComp = ({ jobTypes, existSelected, onChange, disabled }) => {
  const [selected, setSelected] = useState(existSelected)

  // console.log(selected, existSelected)

  return (
    <>
      <Select options={jobTypes} isMulti closeMenuOnSelect={false}
        value={selected}
        isDisabled={disabled}
        onChange={(selectedOptions) => {
          setSelected(selectedOptions)
          onChange(selectedOptions)
        }} />
    </>
  )
}