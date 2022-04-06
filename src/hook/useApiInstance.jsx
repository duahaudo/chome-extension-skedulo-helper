import context from "../context"
import { useMemo, useContext } from "react"

export default () => {
  const { skedLocalStorage } = useContext(context)
  const api = useMemo(() => {
    if (skedLocalStorage) {
      return JSON.parse(skedLocalStorage.team_env).server.api
    }
    return "https://api.skedulo.com"
  }, [skedLocalStorage])
  return api
}