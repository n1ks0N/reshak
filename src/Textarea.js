import React from 'react'
import './App.css'

const Textarea = (props) => {
    const change = ({ value, id }) => { // изменение текста (textarea.value)
        props.dispatch({ type: 'change', id: Number(id), value: value })
    }
    const del = ({ id }) => {
        props.dispatch({ type: 'delete', id: Number(id) })
    }
    return (
        <div className="form-group textarea-group" id={props.id}>
            <label id={props.id}></label>
            <textarea className="form-control textarea-group__textarea" rows="3" value={props.string} style={props.string.length === 0 ? { border: '1px solid #dc3545' } : {}} onChange={(e) => change(e.target)} id={props.id} />
            <button type="button" className="btn btn-outline-danger textarea-group__btn" id={props.id} onClick={(e) => del(e.target)} id={props.id}>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-x-square-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg" id={props.id}>
                    <path fillRule="evenodd" d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" id={props.id} />
                </svg>
            </button>
        </div>
    )
}

export default Textarea