import * as React from 'react';

const Scoreboard = (props) => {
    const { player_data } = props;

    return (
        <div className="scoreboard">
            <div className="scoreboard__header">
                scoreboard
            </div>
            <div className="scoreboard__content">
                {player_data?.map((player, index) => {
                    return (
                        <div key={index} className="scoreboard__content__row">
                            <span>{player.name}</span>
                            <span>{player.score}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Scoreboard;