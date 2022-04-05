import context from "../context"
import { useMemo, useContext } from "react"

export default () => {
  const { skedLocalStorage } = useContext(context)
  const instance_url = useMemo(() => {
    if (skedLocalStorage) {
      return JSON.parse(skedLocalStorage.auth).sfdc.instance_url
    }
    return "https://api.skedulo.com"
  }, [skedLocalStorage])
  return instance_url
}