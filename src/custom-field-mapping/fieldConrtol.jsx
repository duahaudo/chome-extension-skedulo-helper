
import React, { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faSave, faUndoAlt, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import _ from "lodash"

const FieldType = {
  reference: 'reference',
  email: 'email',
  phone: 'phone',
  string: 'string',
  picklist: 'picklist',
  time: 'time',
  date: 'date',
  double: 'double',
  multipicklist: 'multipicklist',
  boolean: 'boolean',
  textarea: "textarea",
  datetime: "datetime"
}

const fieldTypes = _.keys(FieldType)

export default (props) => {

  const [field, setfield] = useState(props.field)
  const [dirty, setDirty] = useState(false)

  const onChangeHandler = React.useCallback((fieldName, newVal) => {
    setDirty(true)
    setfield(prev => ({ ...prev, [fieldName]: newVal }))
  }, [field])

  const undoHandler = React.useCallback(() => {
    setfield(props.field)
    setDirty(false)
  }, [])

  const isDisabled = React.useMemo(() => ["UID", "Name"].indexOf(props.field.name) > -1, [props.field.name])

  const onDeleteHandler = React.useCallback(() => {
    props.onDelete(field)
  }, [field])

  return (
    <div className="m-2 d-flex">
      <div className=" d-flex flex-fill">
        <div className="flex-fill pr-2">
          <input className="form-control" disabled={isDisabled} value={field.label} onChange={(evt) => onChangeHandler('label', evt.target.value)} /> </div>
        <div className="flex-fill pr-2">
          <input className="form-control" disabled={isDisabled} value={field.name} onChange={(evt) => onChangeHandler('name', evt.target.value)} /> </div>
        <div className="flex-fill pr-2">
          <input className="form-control" disabled value={field.mapping} onChange={(evt) => onChangeHandler('mapping', evt.target.value)} /> </div>
        <div className="flex-fill pr-2">
          <select className="form-control pr-2" disabled value={field.fieldType} onChange={(evt) => onChangeHandler('label', evt.target.value)}>
            {fieldTypes.map(type => <option value={type} key={type}>{type}</option>)}
          </select> </div>
      </div>
      <div className="align-self-center d-flex">
        <button className="btn-sm bg-danger border-0 text-white mr-2" onClick={onDeleteHandler}><FontAwesomeIcon icon={faTrashAlt} /> </button>
        {dirty && <button className={"btn-sm  border-0 text-white mr-2 " + (dirty ? "bg-primary" : "bg-secondary disabled")} disabled={!dirty} onClick={undoHandler}><FontAwesomeIcon icon={faUndoAlt} /> </button>}
      </div>
    </div>
  )
}