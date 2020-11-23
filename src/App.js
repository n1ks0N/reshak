import React, { useReducer, useState, useRef } from 'react'
import firebase from 'firebase'
import { createWorker } from 'tesseract.js'
import './App.css'
import Textarea from './Textarea'
import Answer from './Answer'

const initialState = { text: [], answer: [] } // текстовое содержание изображений
const reducer = (textarea, action) => { // изменение содержания
  let arr = textarea.text
  let ans = textarea.answer
  let index = 0
  switch (action.type) {
    case 'write':
      return { text: action.text, answer: [] }
    case 'add': // добавление textarea
      let allow = true // переменная проверки для добавления textarea
      arr.map(data => {
        if (data.string === '') { // если уже имеется пустая textarea, то добавления не будет
          allow = false
        }
      })
      if (allow) arr.push({ id: arr[arr.length - 1].id + 1, string: '' })
      return { text: arr, answer: textarea.answer }
    case 'delete': // удаление textarea
      if (textarea.text.length === 1) { // если осталась одна textarea, то только её очистка, без удаления
        index = arr.findIndex(n => n.id === action.id)
        if (index !== -1) arr[index].string = ''
        return { text: arr, answer: textarea.answer }
      }
      index = arr.findIndex(n => n.id === action.id)
      if (index !== -1) arr.splice(index, 1)
      return { text: arr, answer: textarea.answer }
    case 'change': // изменение textarea
      index = arr.findIndex(n => n.id === action.id)
      if (index !== -1) arr[index].string = action.value
      return { text: arr, answer: textarea.answer }
    case 'result':
      if (action.obj.id === ans.length) ans.push(action.obj)
      return { text: textarea.text, answer: ans }
    case 'clear':
      return { text: textarea.text, answer: [] }
    default:
      console.log('Code 412 Precondition Failed in REDUCER at App.js')
  }
}

const App = () => {
  const ref = firebase.storage().ref()

  const worker = createWorker({
    logger: m => console.log(m.progress),
    errorHandler: err => console.log(err)
  });

  const [img, setImg] = useState({ name: '', content: '', allow: false, state: 0 })
  /* имя файла, кодировка base64, доступ для проверки, состояние для отображения нужного контента
  state = 0 - ничего не загружено (ничего не отображать)
  state = 1 - картинка загружена (отображать картинку), если текст считан (string !== undefined), то отображать кнопку GET и содержание STRING
  state = 2 - загрузка (отображать loader)
  */

  const [textarea, dispatch] = useReducer(reducer, initialState) // текстовое содержание изображений

  const ocr = async () => { // OCR изображения
    if (img.allow) { // проверка, чтобы изображение отличалось от предыдущего
      document.querySelector('#inputGroupFile03').setAttribute('disabled', 'disabled'); // запрет на добавление нового изображения во время OCR
      setImg(prev => {
        return {
          ...prev,
          allow: false,
          state: 2
        };
      });
      // ref.child(`images/${img.name}.txt`).putString(img.content); // отправка в firebase.storage
      await worker.load();
      await worker.loadLanguage('rus');
      await worker.initialize('rus');
      const { data: { text } } = await worker.recognize(img.content);
      console.log(text);
      let arr = [];
      let str = text.split('\n\n');
      if (str.length > 1) {
        for (let i = 0; i < str.length; i++) {
          if (str[i].includes('?') || str[i].includes('Какой') || str[i].includes('Как') || str[i].includes('Что') || str[i].includes('Где') || str[i].includes('Когда') || str[i].includes('Зачем') || str[i].includes('Почему') || str[i].includes('Сколько') || str[i].includes('Куда') || str[i].includes('Найдите') || str[i].includes('Решите') || str[i].includes('Постройте') || str[i].includes('Определите') || str[i].includes('какой') || str[i].includes('как') || str[i].includes('что') || str[i].includes('где') || str[i].includes('когда') || str[i].includes('зачем') || str[i].includes('почему') || str[i].includes('сколько') || str[i].includes('куда') || str[i].includes('найдите') || str[i].includes('решите') || str[i].includes('постройте') || str[i].includes('определите')) {
            arr.push({
              id: arr.length,
              string: str[i]
            });
          }
        }
      } else {
        str = text.split('\n');
        for (let i = 0; i < str.length; i++) {
          if (str[i].includes('?') || str[i].includes('Какой') || str[i].includes('Как') || str[i].includes('Что') || str[i].includes('Где') || str[i].includes('Когда') || str[i].includes('Зачем') || str[i].includes('Почему') || str[i].includes('Сколько') || str[i].includes('Куда') || str[i].includes('Найдите') || str[i].includes('Решите') || str[i].includes('Постройте') || str[i].includes('Определите') || str[i].includes('какой') || str[i].includes('как') || str[i].includes('что') || str[i].includes('где') || str[i].includes('когда') || str[i].includes('зачем') || str[i].includes('почему') || str[i].includes('сколько') || str[i].includes('куда') || str[i].includes('найдите') || str[i].includes('решите') || str[i].includes('постройте') || str[i].includes('определите')) {
            arr.push({
              id: arr.length,
              string: str[i]
            });
          }
          // for (let k = 0; k < str.length; k++) {
          //   if (k)
          // }
        };
      }
      document.querySelector('#inputGroupFile03').removeAttribute('disabled', 'disabled'); // снятие запрета
      setImg(prev => {
        return {
          ...prev,
          state: 1,
          content: img.content
        };
      });
      dispatch({ type: 'write', text: arr }); // запись содержания
    } else {
      console.log('Code 406: Not Acceptable in OCR at App.js');
    }
  }

  const record = () => {
    const image = inputImg.current.files[0]
    if (image) {
      let reader = new FileReader() // считываение изображения
      reader.readAsDataURL(image) // перевод в кодировку base64
      reader.onload = function () {
        console.log(reader.result)
        if (img.content !== reader.result) {
          dispatch({ type: 'write', text: [] })
          dispatch({ type: 'clear' })
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

  const getSearchingAPI = (i) => {
    const request = new XMLHttpRequest();
    request.open('GET', 'https://api.apify.com/v2/actor-tasks/5ceb2qYdeT8FK842U/run-sync-get-dataset-items?token=8CswXxbxpGHPWayNsYZC2Fcoe&clean=1');
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        console.log('Status:', this.status);
        console.log('Headers:', this.getAllResponseHeaders());
        console.log('Body:', this.responseText);
        if (this.status === 200 || this.status === 201) {
          const link = JSON.parse(this.responseText)[0].link;
          updateGettingAPI(link, i);
        } else {
          console.log('Code 400: Bad Request in getGettingAPI at App.js', 'ERROR:', this.status);
        }
      }
    };
    request.send();
  }

  const getGettingAPI = (i) => {
    const request = new XMLHttpRequest();
    request.open('GET', 'https://api.apify.com/v2/actor-tasks/d7sToHcnV4QPVvLsQ/run-sync-get-dataset-items?token=8CswXxbxpGHPWayNsYZC2Fcoe');
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        console.log('Status:', this.status);
        console.log('Headers:', this.getAllResponseHeaders());
        console.log('Body:', this.responseText);
        if (this.status === 200 || this.status === 201) {
          const text = JSON.parse(this.responseText)[0];
          let obj = { id: i, ans: text.answer, q: text.question };
          dispatch({ type: 'result', obj: obj });
          if (i < textarea.text.length - 1) {
            updateSearchingAPI(++i);
            console.log('NEXT REQUEST');
          } else {
            setImg(prev => ({
              ...prev,
              state: 1
            }));
            console.log('END');
          }
        } else {
          console.log('Code 400: Bad Request in getGettingAPI at App.js', 'ERROR:', this.status);
        }
      }
    };
    request.send();
  }

  const updateGettingAPI = (link, i) => {
    const request = new XMLHttpRequest();
    request.open('PUT', 'https://api.apify.com/v2/actor-tasks/d7sToHcnV4QPVvLsQ/input?token=8CswXxbxpGHPWayNsYZC2Fcoe');
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        console.log('Status:', this.status);
        console.log('Headers:', this.getAllResponseHeaders());
        console.log('Body:', this.responseText);
        if (this.status === 200 || this.status === 201) {
          getGettingAPI(i);
        } else {
          console.log('Code 400: Bad Request in getGettingAPI at App.js', 'ERROR:', this.status);
        }
      }
    };
    let body = {
      "startUrls": [
        {
          "url": `https://znanija.com${link}`,
        }
      ]
    }
    request.send(JSON.stringify(body));
  }

  const updateSearchingAPI = (i) => {
    const request = new XMLHttpRequest();
    request.open('PUT', 'https://api.apify.com/v2/actor-tasks/5ceb2qYdeT8FK842U/input?token=8CswXxbxpGHPWayNsYZC2Fcoe');
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        console.log('Status:', this.status);
        console.log('Headers:', this.getAllResponseHeaders());
        console.log('Body:', this.responseText);
        if (this.status === 200 || this.status === 201) {
          getSearchingAPI(i);
        } else {
          console.log('Code 400: Bad Request in getGettingAPI at App.js', 'ERROR:', this.status);
        }
      }
    };
    let body = {
      "startUrls": [
        {
          "url": `https://znanija.com/app/ask?&q=${textarea.text[i].string.split('\n').join(' ').split(' ').join('+')}`
        }
      ]
    }
    request.send(JSON.stringify(body));
  }

  const get = (i) => {
    dispatch({ type: 'clear' })
    // document.querySelectorAll('.textarea-group__btn').setAttribute('disabled', 'disabled')
    setImg(prev => {
      return {
        ...prev,
        state: 2
      }
    })
    updateSearchingAPI(i)
  }

  const inputImg = useRef(null)

  console.log('App.js:', img, textarea)
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
            ref={inputImg}
            onChange={record}
          />
          <label className="custom-file-label" htmlFor="inputGroupFile03">Выбрать картинку</label>
        </div>
      </div>
      {img.state === 0 ?
        <></> :
        <><img src={img.content} alt="Задания" className="img" /><br />
          { img.state === 1 ?
            textarea.text.length === 0 ?
              <></> :
              <button type="button" className="btn btn-success btn-lg" onClick={() => get(0)}>Решить</button>
            :
            <>
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div><br />
            </>
          }
        </>
      }
      {textarea.text.map(data =>
        <Textarea key={data.id} string={data.string} id={data.id} dispatch={dispatch} />
      )}
      {textarea.text.length !== 0 ? <button type="button" className="btn btn-success btn-lg" onClick={() => dispatch({ type: 'add' })}>+</button> : <></>}
      {textarea.answer.map(data =>
        <Answer key={`1${data.id}`} q={data.q} ans={data.ans} />
      )}
    </div>
  )
}

export default App