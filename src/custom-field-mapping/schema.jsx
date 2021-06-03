
import React, { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faSave, faUndoAlt, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import FieldControl from "./fieldConrtol"
import _ from "lodash"
import Select from 'react-select'
import Context from "./dataContext";

export default (props) => {
  const context = React.useContext(Context)

  const [schema, setSchema] = useState(props.schema)
  const [fields, setFields] = useState(context.fields)
  const [newFields, setNewFields] = useState([])
  const [delFields, setDelFields] = useState([])
  const [filter, setFilter] = useState("")

  useEffect(() => {
    setSchema(props.schema)
    setFields(context.fields)
  }, [context.fields, props.schema])

  const isFieldsShowed = React.useMemo(() => context.activeSchema === schema.name, [context.activeSchema, schema.name])

  const validFields = useMemo(() =>
    [...newFields, ...fields].filter(field =>
      field.schemaName === schema.name && field.schemaName === context.activeSchema
      && (field.label.toLowerCase().includes(filter.toLowerCase()) || field.name.toLowerCase().includes(filter.toLowerCase()))),
    [context.activeSchema, fields, newFields, filter])

  const toggle = React.useCallback(() => {
    if (schema.name !== context.activeSchema) {
      context.setactiveSchema(schema.name)
    } else {
      context.setactiveSchema("")
    }
  }, [context.activeSchema, schema.name])

  const notMappingFieldOptions = React.useMemo(() => {
    if (context.schemaMetadatas && context.schemaMetadatas.length > 0) {
      const _schema = context.schemaMetadatas.find(item => item.mapping === schema.mapping)
      const _fields = _schema ? _schema.fields : []
      const fieldsMapped = fields.map(item => item.mapping)
      const fieldRecentlyMapped = newFields.map(item => item.mapping)
      const notValidFields = [...fieldsMapped, ...fieldRecentlyMapped]
      return _fields.filter(item => notValidFields.indexOf(item.mapping) === -1)
    }
    return []
  }, [context.schemaMetadatas, schema.mapping, newFields, fields])

  const [newMappingField, setNewMappingField] = useState()
  const newCustomMappingFieldHandler = React.useCallback(() => {
    const { name, label, type, mapping, relationship, upsertKey, accessMode, readOnly, maxLength, precision, scale } = newMappingField
    const newMappings = []
    const mappingName = mapping.substring(0, mapping.length - 3).replace(/_/g, ' ');
    const formattedName = name ? name : _.startCase(_.camelCase(mappingName)).replace(/ /g, "");

    let newMapping = {
      name: formattedName,
      schemaName: schema.name,
      fieldType: type,
      label, mapping, upsertKey, accessMode, readOnly, maxLength, precision, scale,
      showDesktop: false,
      showMobile: false,
      editableOnMobile: false,
      requiredOnMobile: false
    }

    if (type === "reference") {
      const referenceSchema = context.schemas.find(item => item.mapping === relationship.schemaMapping);
      if (!referenceSchema) {
        alert("Please add mapping for " + relationship.schemaMapping)
      } else {
        newMapping = {
          ...newMapping,
          referenceSchemaName: referenceSchema.name,
          mapping: relationship.mapping
        }

        newMappings.push(newMapping)

        let hasManyMapping = {
          name: formattedName + "s",
          schemaName: referenceSchema.name,
          fieldType: "reference",
          referenceSchemaName: schema.name
        }

        const schemaMetadata = context.schemaMetadatas.find(item => item.mapping === relationship.schemaMapping)
        const hasManyMappingValue = schemaMetadata.relationships.find(item => item.schemaMapping === schema.mapping && item.fieldMapping === relationship.schemaMapping)

        if (hasManyMappingValue) {
          hasManyMapping = {
            ...hasManyMapping,
            mapping: hasManyMappingValue.mapping,
            referenceSchemaFieldName: formattedName + "Id"
          }

          newMappings.push(hasManyMapping)
        }
      }
    } else {
      newMappings.push(newMapping)
    }

    setNewMappingField(null)
    setNewFields(prev => ([...prev, ...newMappings]))
  }, [newMappingField, context, newFields])

  const onSaveHandler = React.useCallback(() => {
    context.setLoading(true)

    let promises = []

    if (newFields.length > 0) {
      promises.push(context.instance.post(`/custom/fields`, newFields))
    }

    if (delFields.length > 0) {
      promises = promises.concat(delFields.map(id => context.instance.delete(`/custom/field/${id}`)))
    }

    Promise.all(promises).then(() => {
      context.setLoading(false)
      window.location.reload()
    })

  }, [fields, newFields, delFields])

  const onDeleteHandler = React.useCallback((field) => {
    // saved fields
    if (field.id) {
      setDelFields(prev => ([...prev, field.id]))
      setFields(prev => prev.filter(item => item.id !== field.id))
    } else {
      // temp field
      setNewFields(prev => prev.filter(item => item.mapping !== field.mapping))
    }
  }, [newFields, delFields])

  return <div className="d-flex flex-column">
    <div className={" border-bottom d-flex m-2 p-2 justify-content-between " + (isFieldsShowed ? 'text-success border-success' : 'text-secondary')}>
      <div className="d-flex  align-items-center">
        <FontAwesomeIcon onClick={toggle} icon={isFieldsShowed ? faChevronUp : faChevronDown} className="mr-3 ml-2" />
        <div className=" font-weight-bold">{schema.label} - {schema.name}</div>
      </div>
      {isFieldsShowed && <div className="input-group-sm d-flex">
        <input className="form-control" placeholder="filter" value={filter} onChange={(evt) => setFilter(evt.target.value)} />
        <div className="align-self-center d-flex pr-2 ml-3"> <button className="btn btn-sm btn-success" onClick={onSaveHandler}>Save</button> </div>
      </div>}
    </div>

    {isFieldsShowed && <div className="d-flex flex-column">
      <div className="d-flex flex-fill pr-2 m-2">
        <div className="col-5 pl-0">
          <Select
            className="basic-single"
            classNamePrefix="select"
            isClearable={true}
            isSearchable={true}
            value={newMappingField}
            options={notMappingFieldOptions}
            onChange={(val) => setNewMappingField(val)}
            formatOptionLabel={(field) => `${field.label} (${field.mapping})`}
          />

        </div>
        <div>
          <button className="btn btn-success" onClick={newCustomMappingFieldHandler}>Add</button>
        </div>
      </div>
      {validFields.map((field, idx2) => {
        return <FieldControl key={schema.mapping + field.mapping} field={field} onDelete={onDeleteHandler} />
      })}
    </div>}
  </div>
}