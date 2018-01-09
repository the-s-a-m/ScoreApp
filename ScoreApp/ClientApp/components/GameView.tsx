import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import 'isomorphic-fetch';

interface GameState {
    gameId: string;
    loading: boolean;
    gameData: Game;
    roundInputCount: number[];
    gameStarted: boolean;
    webSocket: WebSocket;
}

var tempGame: Game = {
    id: 0,
    created: '',
    deleted: true,
    ended: '',
    name: 'test',
    playingRounds: [],
    started: '',
    teams: []
}


export class GameView extends React.Component<RouteComponentProps<{}>, GameState> {
    constructor(props: any) {
        super(props);
        var pathGameId = this.props.location.pathname.replace('/game/', '');
        this.state = {
            gameId: pathGameId,
            loading: true,
            gameData: tempGame,
            roundInputCount: [],
            gameStarted: false,
            webSocket: new WebSocket('ws://' + location.host + '/ws')
        };

        this.updateLocalGameData();

        // Connection opened
        this.state.webSocket.addEventListener('open', (event) => {
            this.state.webSocket.send('Hello Server from Client');
        });

        // Listen for messages
        this.state.webSocket.addEventListener('message', (event) => {
            console.log('Message from server ', event.data);
            this.updateLocalGameData();
        });

        //Bind functionkey press
        this.keyEvents = this.keyEvents.bind(this);
    }

    keyEvents(event: any) {
        //Key F11
        if (event.keyCode === 122) {
            console.log('change to presentation mode /gameviewer/' + this.state.gameId);
            this.props.history.push('/gameviewer/' + this.state.gameId);
        }
    }
    componentDidMount() {
        document.addEventListener("keydown", this.keyEvents, false);
    }
    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyEvents, false);
    }

    public render() {
        if (this.state.loading) {
            return <p><em>Loading...</em></p>
        }
        if (!this.state.gameStarted) {
            return <div>
                <h1>{this.state.gameData.name}</h1>
                <p><em>Game not started</em></p>
            </div>
        }
        return <div>
            <h1>{this.state.gameData.name}</h1>
            <p>Playing teams: {this.state.gameData.teams.map(team => team.name).join(', ')}</p>
            <div>
                {this.renderPlayingRounds(this.state.gameData.playingRounds)}
                <p></p>
                {this.renderTeamsTable(this.state.gameData.teams)}
            </div>
        </div>;
    }

    shuffleArray(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private renderPlayingRounds(rounds: Round[]) {
        if (rounds.length == 0) {
            return <p>No rounds to play</p>
        }
        return <div>
            <p>Rounds: {rounds.length}</p>
            {rounds.map((round, index) => this.renderScoreInput(round, index))}
        </div>;
    }

    private renderScoreInput(round: Round, roundIndex: number) {
        const playingTeamsIDs = Object.keys(round.roundScores);
        var winningTeamId = 0;
        var winningTeamVal = -1;
        var sameScoreCount = -1;
        playingTeamsIDs.forEach((teamId, index) => {
            if (round.roundScores[teamId] > winningTeamVal) {
                winningTeamId = parseInt(teamId);
                winningTeamVal = round.roundScores[teamId];
                sameScoreCount = -1;
            }
            if (round.roundScores[teamId] == winningTeamVal) {
                sameScoreCount++;
            }
        });
        const buttonText = round.deleted ? 'Deleted' : round.played ? sameScoreCount > 0 ? 'Drawn' : this.getTeamName(winningTeamId) + ' Won' : 'Set scores';
        const buttonType = round.deleted ? 'btn-default' : round.played ? sameScoreCount > 0 ? 'btn-info' : 'btn-success' : 'btn-primary';
        return <div className="row" key={round.id + '_' + roundIndex}>
                {playingTeamsIDs.map((teamId, index) => 
                    <div key={round.id + '_' + teamId + '_' + index} className="col-sm-4">
                        <div className="input-group" >
                            <span className="input-group-addon">{this.getTeamName(parseInt(teamId))} </span>
                            <input type="number" min="0" step="1" className="form-control" disabled={round.deleted || round.played} value={round.roundScores[teamId]} onChange={(event) => this.handleChange(event, round.id, parseInt(teamId))}></input>
                        </div>
                    </div>
                )}
                <span className="input-group-btn">
                    <button type="button" className={'btn ' + buttonType} disabled={round.deleted || round.played || this.state.roundInputCount[round.id] < playingTeamsIDs.length} onClick={() => { this.updateScore(round.id) }}>{buttonText}</button>
                </span>
            </div>;
    }

    private renderTeamsTable(teams: Team[]) {
        return <table className='table table-bordered table-condensed'>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Games Won</th>
                    <th>Games Played</th>
                </tr>
            </thead>
            <tbody>
                {teams.sort((a: Team, b: Team) => b.gamesWon - a.gamesWon).map((team, index) =>
                    <tr key={team.id} className={(index == 0) ? 'success' : (index == 1) ? 'info' : (index == 2) ? 'warning' : ''}>
                        <td>{team.name}</td>
                        <td>{team.gamesWon}</td>
                        <td>{team.gamesPlayed}</td>
                    </tr>
                )}
            </tbody>
        </table>;
    }

    gameStarted(startTime: string | undefined): boolean {
        return startTime != '' && startTime != '0001-01-01T00:00:00' && startTime != undefined
    }

    updateWinnerData(round: Round) {
        if (round.deleted || round.played) {
            return;
        }
        const playingTeamsIDs = Object.keys(round.roundScores);
        var winningTeamId = -1;
        var winningTeamVal = -1;
        var sameScoreCount = -1;
        var sameScoreTeamId = -1;

        playingTeamsIDs.forEach((teamId, index) => {
            if (round.roundScores[teamId] > winningTeamVal) {
                winningTeamId = parseInt(teamId);
                winningTeamVal = round.roundScores[teamId];
                sameScoreCount = -1;
            }
            if (round.roundScores[teamId] == winningTeamVal) {
                sameScoreCount++;
                sameScoreTeamId = parseInt(teamId);
            }
        });

        playingTeamsIDs.forEach((teamId, index) => {
            this.updateTeam(parseInt(teamId), (parseInt(teamId) == winningTeamId) || (parseInt(teamId) == sameScoreTeamId));
        });
    }

    handleChange(event: any, roundId: number, teamId: number) {
        var score = parseInt(event.target.value);
        var roundCount = this.state.roundInputCount;
        roundCount[roundId]++;
        var gameInfo = this.state.gameData;
        gameInfo.playingRounds.forEach(round => {
            if (round.id == roundId) {
                round.roundScores[teamId] = score;
                round.roundScoresJSON = JSON.stringify(round.roundScores);
            }
        });
        this.setState({ gameData: gameInfo, roundInputCount: roundCount });
    }

    updateLocalGameData() {
        fetch('api/game/' + this.state.gameId + '/all')
            .then(response => response.json() as Promise<Game>)
            .then(data => {
                var roundCount = this.state.roundInputCount;
                data.playingRounds.forEach((round, index) => {
                    roundCount[round.id] = 0;
                });
                this.setState({ gameData: data, loading: false, roundInputCount: roundCount, gameStarted: this.gameStarted(data.started) });
            });
    }

    updateLocalRounds() {
        fetch('api/' + this.state.gameId + '/round', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(response => {
            return response.json();
        }).then((response: Round[]) => {
            console.log(JSON.stringify(response));
            var gameDataUpdated = this.state.gameData;
            gameDataUpdated.playingRounds = response;
            this.setState({ gameData: gameDataUpdated });
        });
    }

    getTeamName(teamId: number): string {
        var teamName = '';
        this.state.gameData.teams.forEach(t => {
            if (t.id == teamId) {
                teamName = t.name;
            }
        });
        return teamName;
    }

    startGame() {
        if (this.state.gameStarted) {
            return;
        }
        this.updateGameStarted();
    }

    updateGameStarted() {
        fetch('api/game/' + this.state.gameId + '/start', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(response => {
            return response.json();
        }).then((response) => {
            console.log(JSON.stringify(response));
            var gameDataUpdated = this.state.gameData;
            gameDataUpdated.started = response.started
            this.setState({ gameData: gameDataUpdated });
        });
    }

    updateScore(roundId: number) {
        this.state.gameData.playingRounds.forEach((round, index) => {
            if (round.id == roundId) {
                this.updateWinnerData(round);

                round.played = true;
                fetch('api/' + this.state.gameId + '/round/' + roundId, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(round),
                }).then((response) => {
                    console.log(JSON.stringify(response));
                    var updatedGameData = this.state.gameData;
                    updatedGameData.playingRounds[index].played = true;
                    this.setState({ gameData: updatedGameData });
                });
            }
        });
    }

    updateTeam(teamId: number, gameWon: boolean) {
        this.state.gameData.teams.forEach((team, index) => {
            if (team.id == teamId) {
                team.gamesPlayed++;
                team.gamesWon = gameWon ? team.gamesWon + 1 : team.gamesWon;
                fetch('api/' + this.state.gameId + '/team/' + teamId, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(team),
                }).then((response) => {
                    console.log(JSON.stringify(response));
                    var updatedGameData = this.state.gameData;
                    this.setState({ gameData: updatedGameData });
                });
            }
        });
    }
}