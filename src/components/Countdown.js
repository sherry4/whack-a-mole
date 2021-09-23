import * as React from 'react';

const Countdown = (props) => {
    const { remaining } = props;
    const progress_bar_ref = React.useRef(null);

    React.useEffect(() => {
        progress_bar_ref.current.style.width = `${remaining / 20 * 100}%`;
    }, [remaining]);

    return (
        <div className="countdown__container">
            <span className="countdown__text">Remaining: {remaining} second{remaining > 1 && 's'}</span>
            <div className="progress__container">
                <div ref={ref => { progress_bar_ref.current = ref; }} className="progress__bar" remaining={remaining} />
            </div>
        </div>
    )
}

export default Countdown;