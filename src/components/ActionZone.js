import React from 'react';
import './styles.scss';

const ActionZone = (props) => {
    const { children } = props;
    return (
        <div className="actionzone__container">
            {children}
        </div>
    )
};

export default ActionZone;
