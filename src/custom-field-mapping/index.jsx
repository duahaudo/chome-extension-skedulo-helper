import "./styles.scss"

import axios from "axios"
import _ from "lodash"
import React, { useEffect, useMemo, useState } from 'react'
import Schema from "./schema"
import Context from "./dataContext"
import Loading from "../loading"

import { tokenKey, apiKey } from "../main"

const mock = require("./mock.json")

const getParams = () => {
  const searchQuery = window.location.search.substring(1);
  const conditions = searchQuery.split("&")
  return conditions.reduce((result, condition) => {
    const [key, value] = condition.split("=")
    return _.assign(result, { [key]: value })
  }, {})
}

export default ({ setLoading }) => {

  const params = getParams()
  const instance = useMemo(() => axios.create({
    baseURL: params[apiKey],
    headers: {
      Authorization: `Bearer ${params[tokenKey]}`
    }
  }), [params])

  const [schemas, setSchemas] = useState([])
  const [fields, setFields] = useState([])
  const [schemaMetadatas, setschemaMetadatas] = useState([])

  const [filter, setFilter] = useState("")
  const [loading, setLoading2] = useState(false)

  useEffect(() => {
    const queryData = async () => {
      const [_schemas, _fields, _schemas2] = await Promise.all([
        instance.get('/custom/schemas').then(res => res.data.result),
        instance.get('/custom/fields').then(res => res.data.result),
        instance.get('/custom/standard_schemas').then(res => res.data.result),
      ])

      const allSchemas = [..._schemas, ..._schemas2]
      const schemasMapping = allSchemas.map(item => item.mapping)
      // console.log(`👉  SLOG (${new Date().toLocaleTimeString()}): 🏃‍♂️ queryData 🏃‍♂️ schemasMapping`, schemasMapping)

      const schemaMetadataResult = window.location.port === "3000" ?
        await Promise.resolve(mock)
        : await Promise.all(schemasMapping.map(mapping => instance.get(`custom/metadata/${mapping}?force=true`).then(res => res.data.result)))

      // console.log(schemaMetadataResult)

      return { schemas: allSchemas, fields: _fields, metadata: schemaMetadataResult }
    }

    queryData().then(({ schemas, fields, metadata }) => {
      setSchemas(schemas)
      setFields(fields)
      setschemaMetadatas(metadata)
      setLoading(false)
    }, error => {
      console.log(`👉  SLOG (${new Date().toLocaleTimeString()}): 🏃‍♂️ queryData 🏃‍♂️ error`, error)

    }).finally(() => {
      setLoading(false)
    })
  }, [])

  const [activeSchema, setactiveSchema] = useState()

  const filterSchemas = React.useMemo(() => schemas.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()) || item.label.toLowerCase().includes(filter.toLowerCase())), [filter, schemas])

  return <Context.Provider value={{ instance, schemas, fields, schemaMetadatas, activeSchema, setactiveSchema, setLoading: setLoading2 }}>
    <div className="d-flex flex-column">
      <div className="p-2">
        <input className="form-control" placeholder="filter schema" value={filter} onChange={(evt) => setFilter(evt.target.value)} />
      </div>
      {filterSchemas.filter(item => !!item.name).map((schema, idx) => {
        const options = { schema }
        return <Schema {...options} key={schema.mapping} />
      })}
    </div>

    {loading && <Loading />}
  </Context.Provider>
}