// @ts-nocheck
/*global chrome copy*/
import './style.scss';

import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { copyTextToClipboard } from '../helper';

function App() {

  const [authToken, setAuthToken] = useState({})

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
    <div className="app d-flex flex-column">
      <div className="header bg-info text-white p-2">
        <h4>Sked tools by Stiger</h4>
      </div>
      <div className="body p-2 d-flex flex-column">
        <div className="copy-token">
          <h5>Copy Token</h5>
          <button className="btn btn-primary mr-1" onClick={() => copyTextToClipboard(accessToken)}><FontAwesomeIcon icon={faCopy} /> Session Token</button>
          <button className="btn btn-success" onClick={() => copyTextToClipboard(idToken)}><FontAwesomeIcon icon={faCopy} /> User Token</button>
        </div>
      </div>
    </div>
  );
}

export default App;
