import React, { useCallback, useState, useContext, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faSave } from '@fortawesome/free-solid-svg-icons'
import _ from "lodash"
import Select from 'react-select'
import useQuery from "../hook/useQuery"
import Context from "../context"

export default ({ forms, setForms }) => {

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
          <div className="flex-fill p-1 jobtype-row">
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