import React from 'react';
import classNames from 'classnames';
import './styles.scss';

const images = {
    mole: require('../images/mole.png').default,
    base: require('../images/base.png').default,
};

const Mole = (props) => {
    const { onClick, index, showed_mole_number } = props;

    const mole_styles = classNames('image__mole', {
        translate_to_top: showed_mole_number === index,
    });

    return (
        <div className="mole__container">
            <div className="mole__wrapper">
                <img className={mole_styles} src={images.mole} draggable={false} onClick={() => onClick(index)} />
            </div>
            <div className="base__wrapper">
                <img className="image__base" src={images.base} draggable={false} onClick={() => onClick(index)} />
            </div>
            <div className="base__plaster" />
        </div>
    )
};

export default Mole;
