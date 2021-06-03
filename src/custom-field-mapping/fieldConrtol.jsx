
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faUndoAlt } from '@fortawesome/free-solid-svg-icons'
// import _ from "lodash"

// const FieldType = {
//   reference: 'reference',
//   email: 'email',
//   phone: 'phone',
//   string: 'string',
//   picklist: 'picklist',
//   time: 'time',
//   date: 'date',
//   double: 'double',
//   multipicklist: 'multipicklist',
//   boolean: 'boolean',
//   textarea: "textarea",
//   datetime: "datetime"
// }

// const fieldTypes = _.keys(FieldType)

export default (props) => {

  const [field, setfield] = useState(props.field)
  const [dirty, setDirty] = useState(false)

  const onChangeHandler = React.useCallback((fieldName, newVal) => {
    setDirty(true)
    const newObj = { ...field, [fieldName]: newVal }
    setfield(newObj)
    props.onChange(newObj)
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
      <div className=" d-flex flex-fill row">
        <div className=" col-3 pr-0">
          <input className={"form-control " + (field.id ? "" : "text-info")} disabled={isDisabled} value={field.label} onChange={(evt) => onChangeHandler('label', evt.target.value)} /> </div>
        <div className=" col-4 pr-0">
          <input className={"form-control " + (field.id ? "" : "text-info")} disabled={isDisabled} value={field.name} onChange={(evt) => onChangeHandler('name', evt.target.value)} /> </div>
        <div className=" col-3 pr-0">
          <input className={"form-control " + (field.id ? "" : "text-info")} disabled value={field.mapping} onChange={(evt) => onChangeHandler('mapping', evt.target.value)} /> </div>
        <div className=" col-1-5 pr-0">
          <input className={"form-control " + (field.id ? "" : "text-info")} disabled value={field.fieldType} onChange={(evt) => onChangeHandler('fieldType', evt.target.value)} />
          {/* <select className={"form-control pr-2 " + (field.id ? "" : "text-info")} disabled value={field.fieldType} onChange={(evt) => onChangeHandler('label', evt.target.value)}>
            {fieldTypes.map(type => <option value={type} key={type}>{type}</option>)}
          </select> */}
        </div>
      </div>
      <div className="align-self-center d-flex">
        <button type="button" className="btn-sm bg-danger border-0 text-white mr-2" onClick={onDeleteHandler}><FontAwesomeIcon icon={faTrashAlt} /> </button>
        {true && <button type="button" className={"btn-sm  border-0 text-white mr-2 " + (dirty ? "bg-primary" : "bg-secondary disabled")} disabled={!dirty} onClick={undoHandler}><FontAwesomeIcon icon={faUndoAlt} /> </button>}
      </div>
    </div>
  )
}