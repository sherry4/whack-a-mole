import * as React from 'react';
import Spinkit from 'react-spinkit';

const icons = {
    close: require('../images/close.png').default,
};

const DialogInputName = (props) => {
    const { onClick, is_waiting, is_joined } = props;

    const [playername, set_playername] = React.useState('');

    const onChangeName = (e) => {
        set_playername(e.target.value);
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && playername) {
            onClick('confirm_name', playername);
        }
    };

    return (
        <dialog open className="dialog">
            {!is_joined
                && <React.Fragment>
                    <div className="dialog__header">
                        <span>input player name</span>
                        <img src={icons.close} className="dialog__closeicon" onClick={() => onClick('close_dialog_name')} />
                    </div>
                    <input
                        autoFocus
                        name="playername"
                        onChange={onChangeName}
                        value={playername}
                        onKeyDown={onKeyDown}
                    />
                </React.Fragment>
            }
            {is_waiting
                ? <div className="dialog__waiting_zone">
                    <p>waiting for player</p>
                    <Spinkit name="ball-clip-rotate-multiple" fadeIn="none" />
                </div>
                : <button onClick={() => playername && onClick('confirm_name', playername)}>
                    confirm
                </button>
            }
        </dialog>
    )
}

export default DialogInputName;