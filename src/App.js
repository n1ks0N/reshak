import React, { useEffect, useState } from 'react'
import firebase from 'firebase'
import { createWorker } from 'tesseract.js'
import './App.css'

const App = () => {
  const ref = firebase.storage().ref()

  const worker = createWorker({
    logger: m => console.log(m.progress),
    errorHandler: err => console.log(err)
  });

  const [img, setImg] = useState({ name: '', content: '', allow: false, string: undefined, state: 0 })
  /* имя файла, кодировка base64, доступ для проверки, содержание картинки (текст), состояние для отображения нужного контента
  state = 0 - ничего не загружено (ничего не отображать)
  state = 1 - картинка загружена (отображать картинку), если текст считан (string !== undefined), то отображать кнопку GET и содержание STRING
  state = 2 - загрузка (отображать loader)
  */
  const [area, setArea] = useState([])

  /* 
    1. испольльзовать более сложный area/setArea state, для каждой textarea
    2. использовать useRef для изменения внешнего вида
  */


  const ocr = async () => { // OCR изображения
    if (img.allow) { // проверка, чтобы изображение отличалось от предыдущего
      document.querySelector('#inputGroupFile03').setAttribute('disabled', 'disabled') // запрет на добавление нового изображения во время OCR
      setImg(prev => {
        return { 
          ...prev, 
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
      let arr = []
      for (let i = 0; i < str.length; i++) {
        if (str[i].includes('?') || str[i].includes('Какой') || str[i].includes('Как') || str[i].includes('Что') || str[i].includes('Где') || str[i].includes('Когда') || str[i].includes('Зачем') || str[i].includes('Почему') || str[i].includes('Сколько') || str[i].includes('Куда') || str[i].includes('Найдите') || str[i].includes('Решите') || str[i].includes('Постройте') || str[i].includes('Определите') || str[i].includes('какой') || str[i].includes('как') || str[i].includes('что') || str[i].includes('где') || str[i].includes('когда') || str[i].includes('зачем') || str[i].includes('почему') || str[i].includes('сколько') || str[i].includes('куда') || str[i].includes('найдите') || str[i].includes('решите') || str[i].includes('постройте') || str[i].includes('определите')) {
          arr.push({
            id: arr.length,
            string: str[i]
          })
        }
      }
      console.log(arr)
      document.querySelector('#inputGroupFile03').removeAttribute('disabled', 'disabled')
      setImg(prev => { // запись текста
        return {
          ...prev,
          allow: false,
          string: arr,
          state: 1,
          content: img.content
        }
      })
    } else {
      console.log('Code 406: Not Acceptable in function OCR');
    }
  };

  const record = (image) => {
    if (image) {
      let reader = new FileReader() // считываение изображения
      reader.readAsDataURL(image) // перевод в кодировку base64
      reader.onload = function () {
        console.log(reader.result)
        if (img.content !== reader.result) {
          setImg(prev => {
            return {
              ...prev,
              name: image.name.split('.')[0], 
              content: reader.result, 
              allow: true, 
              state: 1,
              string: undefined
            }
          })
        } else {
          console.log('Code 406: Not Acceptable on function RECORD')
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

  const focus = (value) => {
    if (value.value === '') {
      setArea({ border: '1px solid red' })
      console.log('Code 411: Length Required in function FOCUS')
    } else {
      setArea({ border: '1px solid #ced4da' })
    }
    console.log(value.value)
  }

  let a = 0


  const del = ({ id }) => {
    let str = img.string
    const index = str.findIndex(n => n.id === Number(id))
    if (index !== -1) {
      str.splice(index, 1)
    }
    setImg(prev => {
      return {
        ...prev, 
        string: str
      }
    })
    // console.log(id, index, str)
  }

  const add = () => {

  }

  console.log('render', img)
  return (
    <div>
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <button
            className="btn btn-primary input-group-prepend__btn-download"
            type="button"
            id="inputGroupFileAddon03"
            onClick={() => ocr()}>Загрузить</button>
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
              img.string !== undefined ?
                <button type="button" className="btn btn-success btn-lg" onClick={() => get()}>Решить</button> :
                <></>
            }
          </> :
          <>
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div><br />
          </>
      }
      {img.string !== undefined ? <><div>{img.string.map(val => <>
        <div className="form-group textarea-group" id={`tg${val.id}`}>
          <label></label>
          <textarea className="form-control textarea-group__textarea" rows="3" defaultValue={val.string} onChange={(e) => focus(e.target)} style={area} />
          <button type="button" className="btn btn-outline-danger textarea-group__btn" id={val.id} onClick={(e) => del(e.target)}>
            <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-x-square-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" id={val.id} />
            </svg>
          </button>
        </div>
      </>)}<button type="button" className="btn btn-success btn-lg" onClick={() => add()}>+</button></div></> : <></>}
    </div>
  )
}

export default App