import React from 'react';
import './styles.scss';

const ActionButton = (props) => {
    const { join_label, play_label, stop_label, onClick, is_playing, is_joined } = props;
    return (
        <button className="actionbutton__container" onClick={() => onClick(is_joined ? (is_playing ? 'stop' : 'play') : 'show_dialog_name')}>
            {is_joined ? (is_playing ? stop_label : play_label) : join_label}
        </button>
    )
};

ActionButton.defaultProps = {
    onClick: () => { },
};

export default ActionButton;
