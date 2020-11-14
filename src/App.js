import React, { useEffect, useReducer, useState } from 'react'
import firebase from 'firebase'
import { createWorker } from 'tesseract.js'
import './App.css'
import Textarea from './Textarea'

let textareaValues = [] // промежуточный массив, через который передаётся и хранится содержание изображений
// let allow = false;
const App = () => {
  const initialState = { text: [] } // текстовое содержание изображений
  const reducer = (textarea, action) => {
    switch (action.type) {
      case 'write':
        return { text: action.text }
      case 'delete':
        let arrDel = textarea.text
        const index = arrDel.findIndex(n => n.id === action.id)
        if (index !== -1) arrDel.splice(index, 1)
        return { text: arrDel }
      case 'add':
        // allow = !allow
        let arrAdd = textarea.text
        /* if (allow) */ arrAdd.push({ id: arrAdd.length, string: '' })
        return { text: arrAdd }
      case 'change':
        let arrChange = textarea.text
        arrChange[action.id].string = action.value
        return { text: arrChange }
      default:
        console.log('Code 412 Precondition Failed in REDUCER at App.js')
    }
  }
  const ref = firebase.storage().ref()

  const worker = createWorker({
    logger: m => console.log(m.progress),
    errorHandler: err => console.log(err)
  });

  const [img, setImg] = useState({ name: '', content: '', allow: false, state: 0 })
  /* имя файла, кодировка base64, доступ для проверки, содержание картинки (текст), состояние для отображения нужного контента
  state = 0 - ничего не загружено (ничего не отображать)
  state = 1 - картинка загружена (отображать картинку), если текст считан (string !== undefined), то отображать кнопку GET и содержание STRING
  state = 2 - загрузка (отображать loader)
  */

  const [textarea, dispatch] = useReducer(reducer, initialState) // текстовое содержание изображений

  const ocr = async () => { // OCR изображения
    if (img.allow) { // проверка, чтобы изображение отличалось от предыдущего
      document.querySelector('#inputGroupFile03').setAttribute('disabled', 'disabled') // запрет на добавление нового изображения во время OCR
      setImg(prev => {
        return {
          ...prev,
          allow: false,
          state: 2
        }
      });
      ref.child(`images/${img.name}.txt`).putString(img.content); // отправка в firebase.storage
      await worker.load();
      await worker.loadLanguage('rus');
      await worker.initialize('rus');
      const { data: { text } } = await worker.recognize(img.content);
      console.log(text)
      let str = text.split('\n\n')
      for (let i = 0; i < str.length; i++) {
        if (str[i].includes('?') || str[i].includes('Какой') || str[i].includes('Как') || str[i].includes('Что') || str[i].includes('Где') || str[i].includes('Когда') || str[i].includes('Зачем') || str[i].includes('Почему') || str[i].includes('Сколько') || str[i].includes('Куда') || str[i].includes('Найдите') || str[i].includes('Решите') || str[i].includes('Постройте') || str[i].includes('Определите') || str[i].includes('какой') || str[i].includes('как') || str[i].includes('что') || str[i].includes('где') || str[i].includes('когда') || str[i].includes('зачем') || str[i].includes('почему') || str[i].includes('сколько') || str[i].includes('куда') || str[i].includes('найдите') || str[i].includes('решите') || str[i].includes('постройте') || str[i].includes('определите')) {
          textareaValues.push({
            id: textareaValues.length,
            string: str[i]
          })
        }
      }
      document.querySelector('#inputGroupFile03').removeAttribute('disabled', 'disabled')
      setImg(prev => { // запись текста
        return {
          ...prev,
          state: 1,
          content: img.content
        }
      })
      dispatch({ type: 'write', text: textareaValues })
    } else {
      console.log('Code 406: Not Acceptable in OCR at App.js');
    }
  };

  const record = (image) => {
    if (image) {
      let reader = new FileReader() // считываение изображения
      reader.readAsDataURL(image) // перевод в кодировку base64
      reader.onload = function () {
        console.log(reader.result)
        if (img.content !== reader.result) {
          if (textareaValues.length !== 0) {
            textareaValues = []
            dispatch({ type: 'write', text: textareaValues })
          }
          setImg(prev => {
            return {
              ...prev,
              name: image.name.split('.')[0],
              content: reader.result,
              allow: true,
              state: 1,
            }
          })
        } else {
          console.log('Code 406: Not Acceptable in RECORD at App.js')
        }
      }
    }
  }

  const get = () => {
    let request = new XMLHttpRequest();
    request.open('PUT', 'https://api.apify.com/v2/actor-tasks/d7sToHcnV4QPVvLsQ/input?token=8CswXxbxpGHPWayNsYZC2Fcoe');
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        console.log('Status:', this.status);
        console.log('Headers:', this.getAllResponseHeaders());
        console.log('Body:', this.responseText);
      }
    };
    let body = {
      "runMode": "DEVELOPMENT",
      "startUrls": [
        {
          "url": "https://znanija.com/task/3979902",
          "method": "GET"
        }
      ]
    };
    // request.send(JSON.stringify(body));
  }

  console.log('App.js:', img, textarea, textareaValues)
  return (
    <div>
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <button
            className="btn btn-primary input-group-prepend__btn-download"
            type="button"
            id="inputGroupFileAddon03"
            onClick={ocr}>Загрузить</button>
        </div>
        <div className="custom-file">
          <input
            type="file"
            className="custom-file-input"
            id="inputGroupFile03"
            aria-describedby="inputGroupFileAddon03"
            accept="image/bmp, image/jpeg, image/png, image/pbm"
            onChange={(e) => record(e.target.files[0])}
          />
          <label className="custom-file-label" htmlFor="inputGroupFile03">Выбрать картинку</label>
        </div>
      </div>
      {img.state === 0 ?
        <></> :
        img.state === 1 ?
          <>
            <img src={img.content} alt="Задания" /><br />
            {
              textarea.text.length !== 0 ?
                <button type="button" className="btn btn-success btn-lg" onClick={get}>Решить</button> :
                <></>
            }
          </> :
          <>
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div><br />
          </>
      }
      <Textarea text={textarea.text} dispatch={dispatch} />
    </div>
  )
}

export default App