import React, { useEffect } from 'react'
import './App.css'

const Textarea = (props) => {

    useEffect(() => {
        console.log('render')
    }, [props.text])

    const change = ({ value, id }) => { // изменение текста (textarea.value)
        props.dispatch({ type: 'change', id: Number(id), value: value })
    }

    const del = ({ id }) => {
        props.dispatch({ type: 'delete', id: Number(id) })
        console.log('checker')
    }

    const add = () => {
        props.dispatch({ type: 'add' })
    }

    console.log('Textarea.js:', props.text)

    return (
        <>{props.text.map(data => <>
            <div className="form-group textarea-group" id={`tg${data.id}`}>
                <label></label>
                <textarea className="form-control textarea-group__textarea" rows="3" value={data.string} style={data.string.length === 0 ? { border: '1px solid #dc3545' } : {}} onChange={(e) => change(e.target)} id={data.id} />
                <button type="button" className="btn btn-outline-danger textarea-group__btn" id={data.id} onClick={(e) => del(e.target)}>
                    <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-x-square-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" id={data.id} />
                    </svg>
                </button>
            </div>
        </>)}
            {props.text.length !== 0 ? <button type="button" className="btn btn-success btn-lg" onClick={add}>+</button> : <></>}
        </>
    )
}

export default Textarea