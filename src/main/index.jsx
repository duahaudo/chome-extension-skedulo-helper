// @ts-nocheck
/*global chrome*/
import './style.scss';

import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { copyTextToClipboard } from '../helper';
import SdkHandler from "../sdk-handler"
import Context from "../context"
import Loading from "../loading"
import CfHandler from "../cf-handler"

function App() {

  const [authToken, setAuthToken] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!chrome || !chrome.tabs) {
      return
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (tab.url.includes("skedulo")) {
        // Execute script in the current tab
        chrome.tabs.executeScript(tab.id, { code: `localStorage['auth']` }, ([fromPageLocalStore]) => {
          // const skedApiAccessToken = JSON.parse(fromPageLocalStore).skedApiAccessToken;
          // return skedApiAccessToken
          setAuthToken(JSON.parse(fromPageLocalStore))
        });
      }
    })
  }, [])

  const accessToken = useMemo(() => authToken.skedApiAccessToken || null, [authToken])
  const idToken = useMemo(() => authToken.idToken || null, [authToken])

  return (
    <>
      <Context.Provider value={{ setLoading }}>
        <div className={"app d-flex flex-column " + (loading && "blur")} >
          <div className="header bg-info text-white p-2">
            <h5 className="m-0">Sked tools by Stiger</h5>
          </div>
          <div className="body p-2 d-flex flex-column">
            <div className="copy-token">
              <h6 className="text-muted">Copy Token</h6>
              <button className="btn btn-primary mr-1" onClick={() => copyTextToClipboard(accessToken)}><FontAwesomeIcon icon={faCopy} /> Session Token</button>
              <button className="btn btn-success" onClick={() => copyTextToClipboard(idToken)}><FontAwesomeIcon icon={faCopy} /> User Token</button>
            </div>

            <div className="sked-sdk mt-2">
              <SdkHandler accessToken={accessToken} />
            </div>

            <div className="sked-sdk mt-2">
              <CfHandler accessToken={accessToken} />
            </div>
          </div>

        </div>
      </Context.Provider>
      {loading && <Loading />}
    </>
  );
}

export default App;
