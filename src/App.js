import React, { useRef, useState } from 'react'
import firebase from 'firebase'
import { createWorker } from 'tesseract.js'
import './App.css'

const worker = createWorker({
  logger: m => console.log(m)
});

const App = () => {

  const ref = firebase.storage().ref()

  const [img, setImg] = useState({ name: '', content: '' })
  let lastUrl = null

  const click = () => {
    if ((lastUrl !== img.content) && (img.content !== '')) { // проверка, чтобы изображение отличалось от предыдущего и не было пустым
      ref.child(`images/${img.name}.txt`).putString(img.content) // отправка в storage
      lastUrl = img.content;

      (async () => { // OCR изображения
        await worker.load();
        await worker.loadLanguage('rus');
        await worker.initialize('rus');
        const { data: { text } } = await worker.recognize(img.content);
        console.log(text);
        await worker.terminate();
      })();
    } else {
      console.log('None')
    }
  }


  const record = (image) => {
    let reader = new FileReader() // считываение изображения
    reader.readAsDataURL(image) // перевод в кодировку base64
    reader.onload = function () {
      console.log(reader.result)
      setImg({ name: image.name.split('.')[0], content: reader.result })
    }
  }

  console.log('render')

  return (
    <>
      <input
        type="file"
        placeholder="text"
        accept='image/bmp, image/jpeg, image/png, image/pbm'
        onChange={(e) => record(e.target.files[0])}
        required
      /><br />
      <button onClick={() => click()}>Search</button><br />
      <img src={img.content} />
    </>
  )
}

export default App