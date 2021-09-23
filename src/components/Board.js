import React from 'react';
import './styles.scss';

const Board = (props) => {
    const { children } = props;
    return (
        <div className="board__container">
            {children}
        </div>
    )
};

export default Board;
