import React, { useEffect, useRef, useState } from 'react';
import { io } from "socket.io-client";
import './styles.scss';

import Board from '../components/Board';
import ActionZone from '../components/ActionZone';
import Countdown from '../components/Countdown';
import Mole from '../components/Mole';
import ActionButton from '../components/ActionButton';

import DialogInputName from '../components/DialogInputName';
import DialogResult from '../components/DialogResult';
import Scoreboard from '../components/Scoreboard';

const IndexPage = () => {

    const [is_joined, set_is_joined] = useState(false);
    const [result, set_result] = useState('');
    const [player_data, set_player_data] = useState([]);
    const [is_show_scoreboard, set_is_show_scoreboard] = useState(false);
    const [is_waiting, set_is_waiting] = useState(false);
    const [current_player, set_current_player] = useState('user');
    const [player_num, set_player_num] = useState();
    const [show_dialog_name, set_show_dialog_name] = useState(false);
    const [show_dialog_result, set_show_dialog_result] = useState(false);
    const [is_disable_click, set_is_disable_click] = useState(false);

    const [remaining, set_remaining] = useState(20);
    const [is_playing, set_is_playing] = useState(false);
    const [showed_mole_number, set_showed_mole_number] = useState(-1);

    const game_interval_ref = useRef(null);
    const mole_timeout_ref = useRef(null);
    const socket_ref = useRef(null);

    const clear_refs = () => {
        clearInterval(game_interval_ref.current);
        clearTimeout(mole_timeout_ref.current);
    };

    useEffect(() => {
        if (is_playing) {
            game_interval_ref.current = setInterval(() => {
                set_remaining(remaining => remaining - 1);
            }, 1000);
        } else {
            clear_refs();
            set_remaining(20);
            set_showed_mole_number(-1);
        }
        return () => { clear_refs(); };
    }, [is_playing]);

    useEffect(() => {
        if (is_playing) {
            socket_ref.current.emit('request-new-mole', showed_mole_number);
        }
    }, [showed_mole_number]);

    useEffect(() => {
        if (!remaining) {
            set_is_playing(false);
            set_remaining(20);
            socket_ref.current.emit('get-result');
        }
    }, [remaining]);

    useEffect(() => {
        if (is_joined) {
            set_is_show_scoreboard(true);
        }
    }, [is_joined]);

    useEffect(() => {
        // new mole comes
        if (socket_ref.current && player_num != undefined) {
            socket_ref.current.on('final-result', (player_data) => {
                handle_get_result(player_data);
            });

            // handle ready again
            socket_ref.current.on('ready-again', (player_data) => {
                const is_player_ready = player_data[player_num].is_ready_again;
                const is_enemy_ready = player_data[player_num ? 0 : 1].is_ready_again;
                if (is_player_ready && !is_enemy_ready) {
                    set_show_dialog_name(true);
                    set_is_waiting(true);
                }
                if (is_player_ready && is_enemy_ready) {
                    handle_all_connected();
                }
            })
        };
    }, [player_num]);

    const handle_get_result = (data) => {
        const user_score = data[player_num].score;
        const enemy_score = data[player_num ? 0 : 1].score;
        if (user_score > enemy_score) {
            set_result('you win!');
        } else if (user_score === enemy_score) {
            set_result('tied! what a game!');
        } else {
            set_result('you lose...');
        }
        set_show_dialog_result(true);
    };

    const handle_all_connected = () => {
        set_is_waiting(false);
        set_is_joined(true);
        set_show_dialog_name(false);
    };

    const handle_all_ready = (player_data) => {
        set_player_data(player_data);
        handle_all_connected();
    }

    const handle_stop = () => {
        socket_ref.current.emit('stop');
        player_data.forEach((player, idx) => { player_data[idx].score = 0; });
        set_player_data(player_data);
        set_show_dialog_result(false);
    }

    const handle_play_again = () => {
        socket_ref.current.emit('play-again', player_num);
        player_data.forEach((player, idx) => { player_data[idx].score = 0; });
        set_player_data(player_data);
        set_show_dialog_result(false);
    }

    const handle_socket = (name) => {
        socket_ref.current = io({ query: { name } });
        // get player number/role
        socket_ref.current.on('player-number', ({ player_index, player_data }) => {
            if (player_index === -1) {
                alert('full!');
            } else {
                set_player_num(parseInt(player_index));
                if (parseInt(player_index) === 1) {
                    set_current_player('enemy');
                    socket_ref.current.emit('all-player-ready');
                    handle_all_ready(player_data);
                } else if (parseInt(player_index) === 0) {
                    set_is_waiting(true);
                };
            }
        })
        // another player has connected
        socket_ref.current.on('player-connection', (num) => {
            handle_all_connected();
        });

        socket_ref.current.on('player-disconnect', (num) => {
            if (parseInt(num) !== player_num) {
                alert('Enemy has resigned!');
                set_is_joined(false);
                set_is_playing(false);
                if (is_playing) set_is_playing(false);
            }
        });

        // handle all player ready
        socket_ref.current.on('player-ready', (player_data) => {
            handle_all_ready(player_data)
        });

        // start playing
        socket_ref.current.on('start-play', () => {
            set_is_playing(true);
        });

        // update score
        socket_ref.current.on('score-updated', (player_data) => {
            set_showed_mole_number(-1);
            set_player_data(player_data);
        });

        // stop-clicked
        socket_ref.current.on('stop-clicked', (player_data) => {
            set_is_playing(false);
            set_player_data(player_data);
        });

        // new mole comes
        socket_ref.current.on('mole-index', (mole_index) => {
            set_is_disable_click(false);
            set_showed_mole_number(mole_index);
        });
    };

    const onClick = (type, data) => {
        switch (type) {
            case 'show_dialog_name':
                set_show_dialog_name(true);
                break;
            case 'play':
                socket_ref.current.emit('play');
                break;
            case 'stop':
                handle_stop();
                break;
            case 'close_dialog_name':
                set_show_dialog_name(false);
                set_is_waiting(false);
                break
            case 'confirm_name': {
                const name = data;
                handle_socket(name);
            }
                break;
            case 'click_mole':
                if (!is_disable_click) {
                    socket_ref.current.emit('someone-scores', { player_num, showed_mole_number });
                    set_is_disable_click(true);
                } break;
            case 'play_again':
                handle_play_again();
                break;
            default: break;
        }
    };

    const buttons = [
        { join_label: 'join', stop_label: 'stop', play_label: 'play' },
    ];

    const fake = Array.from({ length: 8 }).map((i) => ({ show: true }));

    return (
        <div className="main">
            <div className="container">
                <span className="title">Simple Game With Friend</span>
                <Board>
                    {fake.map((i, idx) => (
                        <Mole
                            key={idx}
                            index={idx}
                            onClick={(index) => onClick('click_mole', index)}
                            showed_mole_number={showed_mole_number}
                        />
                    ))}
                </Board>
                <Countdown remaining={remaining} />
                <ActionZone>
                    {buttons.map((b, idx) => (
                        <ActionButton
                            key={idx}
                            play_label={b.play_label}
                            join_label={b.join_label}
                            stop_label={b.stop_label}
                            onClick={onClick}
                            is_joined={is_joined}
                            is_playing={is_playing}
                        />
                    ))}
                </ActionZone>
                {show_dialog_name
                    && <DialogInputName
                        is_joined={is_joined}
                        is_waiting={is_waiting}
                        onClick={onClick}
                    />
                }
                {show_dialog_result
                    && <DialogResult
                        result={result}
                        onClick={onClick}
                    />
                }
            </div>
            {is_show_scoreboard
                && <Scoreboard
                    player_data={player_data}
                />
            }
        </div>
    )
};

export default IndexPage;
