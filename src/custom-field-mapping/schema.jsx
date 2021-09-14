
import React, { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { copyTextToClipboard } from '../helper';
import FieldControl from "./fieldConrtol"
import _ from "lodash"
import Select from 'react-select'
import Context from "./dataContext";

export default (props) => {
  const context = React.useContext(Context)

  const [schema, setSchema] = useState(props.schema)
  const [fields, setFields] = useState([])
  const [newFields, setNewFields] = useState([])
  const [delFields, setDelFields] = useState([])
  const [updateFields, setUpdateFields] = useState([])
  const [filter, setFilter] = useState("")

  useEffect(() => {
    setSchema(props.schema)
    setFields(context.fields.filter(item => item.schemaName === schema.name))
  }, [context.fields, props.schema])

  const isFieldsShowed = React.useMemo(() => context.activeSchema === schema.name, [context.activeSchema, schema.name])

  const validFields = useMemo(() =>
    [...newFields, ...fields].filter(field =>
      field.schemaName === schema.name && field.schemaName === context.activeSchema
      && ((field.label || "").toLowerCase().includes(filter.toLowerCase()) || (field.name || "").toLowerCase().includes(filter.toLowerCase()))),
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
      const fieldsMapped = fields.map(item => item.fieldType !== "reference" ? item.mapping : item.mapping.replace(/__r$/, "__c"))

      const fieldRecentlyMapped = newFields.map(item => item.fieldType !== "reference" ? item.mapping : item.mapping.replace(/__r$/, "__c")) // not save yet
      const notValidFields = [...fieldsMapped, ...fieldRecentlyMapped]

      // if (schema.name === "MedicationStatement") {
      //   console.log(fieldsMapped)
      //   console.log(fields.filter(item => item.fieldType === "reference"))
      //   console.log(notValidFields.filter(item => item.includes("Transcare_Form")))
      //   console.log(_fields.filter(item => item.mapping.includes("Transcare_Form")))
      // }
      return _fields.filter(item => notValidFields.indexOf(item.mapping) === -1)
    }
    return []
  }, [context.schemaMetadatas, schema.mapping, newFields, fields])

  const [newMappingField, setNewMappingField] = useState()

  const newCustomMappingFieldHandler = React.useCallback(() => {
    const { name, label, type, mapping, relationship, upsertKey, accessMode, readOnly, maxLength, precision, scale } = newMappingField
    const newMappings = []
    const mappingName = mapping.includes("__") ? mapping.substring(0, mapping.length - 3).replace(/_/g, ' ') : mapping;
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
          label,
          schemaName: referenceSchema.name,
          fieldType: "reference",
          referenceSchemaName: schema.name
        }

        const schemaMetadata = context.schemaMetadatas.find(item => item.mapping === relationship.schemaMapping)
        const hasManyMappingValue = schemaMetadata.relationships.find(item => item.schemaMapping === schema.mapping && item.fieldMapping === relationship.schemaMapping)

        if (hasManyMappingValue) {

          hasManyMapping = {
            ...hasManyMapping,
            name: props.schema.name + "s",
            label: props.schema.label,
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

    const _newFields = newFields.filter(item => delFields.indexOf(item.id) === -1)
    if (_newFields.length > 0) {
      promises.push(context.instance.post(`/custom/fields`, _newFields))
    }

    const _updateFields = updateFields.filter(item => delFields.indexOf(item.id) === -1)
    if (_updateFields.length > 0) {
      promises.push(context.instance.post(`/custom/fields`, _updateFields))
    }

    if (delFields.length > 0) {
      promises = promises.concat(delFields.map(id => context.instance.delete(`/custom/field/${id}`)))
    }

    Promise.all(promises).then(() => {
      context.setLoading(false)
      window.location.reload()
    })

  }, [fields, newFields, delFields, updateFields])

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

  const fieldChangedHandler = React.useCallback((newField) => {
    // already update
    const _field = updateFields.find(item => newField.id && (item.id === newField.id));
    if (_field) {
      _.assign(_field, newField)
    } else {
      // verify field is exist
      const _field = [...newFields, ...fields].find(item => item.mapping === newField.mapping);

      if (_field) {
        if (_field.id) {
          setUpdateFields([...updateFields.filter(item => item.mapping !== newField.mapping), newField])
        } else {
          setNewFields([...newFields.filter(item => item.mapping !== newField.mapping), newField])
        }
      } else {
        console.log("Error")
      }
    }
  }, [updateFields, newFields, fields])

  const exportHandler = React.useCallback(() => {
    const validFields = [...fields, ...newFields]
      .filter(item => delFields.indexOf(item.id) === -1)
      .map(item => {
        const _isUpdated = updateFields.find(uf => uf.mapping === item.mapping);
        return _isUpdated || item
      })
    const result = {
      ...schema,
      fields: [...validFields]
    }

    copyTextToClipboard(JSON.stringify(result, null, "\t"))
  }, [schema, fields, updateFields, newFields, delFields])

  return <div className="d-flex flex-column">
    <div className={" border-bottom d-flex m-2 p-2 justify-content-between " + (isFieldsShowed ? 'text-success border-success' : 'text-secondary')}>
      <div className="d-flex  align-items-center">
        <FontAwesomeIcon onClick={toggle} icon={isFieldsShowed ? faChevronUp : faChevronDown} className="mr-3 ml-2" />
        <div className=" font-weight-bold"><span onClick={toggle}>{schema.label}</span> - {schema.name} ({schema.mapping})</div>
      </div>
      {isFieldsShowed && <div className="input-group-sm d-flex col-4 pr-0">
        <input className="form-control" placeholder="filter field" value={filter} onChange={(evt) => setFilter(evt.target.value)} />
        <div className="align-self-center d-flex ml-3"> <button className="btn btn-sm btn-success" onClick={onSaveHandler}>Save</button> </div>
      </div>}
    </div>

    {isFieldsShowed && <div className="d-flex flex-column">
      <div className="d-flex flex-fill pr-2 m-2 justify-content-between">
        <div className="col-5 pl-0  d-flex">
          <Select
            className="flex-fill mr-2"
            classNamePrefix="select"
            isClearable={true}
            isSearchable={true}
            value={newMappingField}
            options={notMappingFieldOptions}
            onChange={(val) => setNewMappingField(val)}
            formatOptionLabel={(field) => `${field.label} (${field.mapping})`}
          />
          <button className="btn btn-success" onClick={newCustomMappingFieldHandler}>Add</button>
        </div>
        <button className="btn btn-secondary" onClick={exportHandler}>Export</button>
      </div>
      {validFields.map((field) => {
        return <FieldControl key={schema.mapping + field.mapping} field={field} onDelete={onDeleteHandler} onChange={fieldChangedHandler} />
      })}
    </div>}
  </div>
}