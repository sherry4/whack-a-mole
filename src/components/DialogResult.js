import * as React from 'react';

const DialogInputName = (props) => {
    const { onClick, result } = props;

    return (
        <dialog open className="dialog">
            <span>{result}</span>
            <button onClick={() => onClick('play_again')}>
                play again
            </button>
        </dialog>
    )
}

export default DialogInputName;