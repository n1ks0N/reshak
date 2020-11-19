import React from 'react'

const Answer = (props) => {
    return (
        <>
            <div>
                <div><p>{props.q}</p><p>{props.ans}</p></div>
            </div>
        </>
    )
}

export default Answer