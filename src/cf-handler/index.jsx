import React, { useCallback, useState, useContext, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import useQuery from "../hook/useQuery"
import Context from "../context"

export default ({ accessToken }) => {

  const [queryOptions, setQueryOptions] = useState({})
  const [loading] = useQuery({ token: accessToken, options: queryOptions })
  const { setLoading } = useContext(Context)

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
        params: bodyFormData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
  }, [])

  useEffect(() => {
    setLoading(loading)
  }, [loading, setLoading])

  return (
    <div className="cf-wrapper">
      <h6 className="text-muted">Custom Form</h6>
      <button className="btn btn-primary mr-1" onClick={() => uploadHandler()}><FontAwesomeIcon icon={faUpload} /> Deploy </button>
    </div>
  )
}