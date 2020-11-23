import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import firebase from 'firebase/app'
import Provider from './store'
import store from './store/store'

const firebaseConfig = {
  apiKey: "AIzaSyBxlwIjgs9g7x1OqLZTD94FlRSVPuDdN7Y",
  authDomain: "reshak-a64bc.firebaseapp.com",
  databaseURL: "https://reshak-a64bc.firebaseio.com",
  projectId: "reshak-a64bc",
  storageBucket: "reshak-a64bc.appspot.com",
  messagingSenderId: "184042173837",
  appId: "1:184042173837:web:01487ef4aaaf21b9fd79c4",
  measurementId: "G-0TEH8K1KEF"
}

firebase.initializeApp(firebaseConfig)

const render = (state) => {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <App 
          state={state}
          dispatch={store.dispatch.bind(store)}
        />
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  )
}

render(store.getState())
store.subscribe(() => {
  let state = store.getState()
  render(state)
})

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
