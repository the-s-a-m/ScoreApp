import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import 'isomorphic-fetch';

interface GameViewerState {
    gameId: string;
    gameData: Game;
    loading: boolean;
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


export class GameViewerView extends React.Component<RouteComponentProps<{}>, GameViewerState> {
    constructor(props: any) {
        super(props);
        var pathGameId = this.props.location.pathname.substr(12);
        console.log(pathGameId);
        this.state = {
            gameId: pathGameId,
            gameData: tempGame,
            loading: true,
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

    updateLocalGameData() {
        fetch('api/game/' + this.state.gameId + '/all')
            .then(response => response.json() as Promise<Game>)
            .then(data => this.setState({ gameData: data, loading: false }));
    }

    keyEvents(event: any) {
        //Key F11
        if (event.keyCode === 122) {
            console.log("switch to GameView");
            this.props.history.push('/game/' + this.state.gameId);
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
            return <p>Loading data</p>
        }
        return <div>
            <h1>{this.state.gameData.name}</h1>
            <p>Playing teams: {this.state.gameData.teams.map(team => team.name).join(', ')}</p>
            <div>
                {this.showPlayingRounds(this.state.gameData.playingRounds, false)}
                {this.renderTeamsTable(this.state.gameData.teams)}
            </div>
        </div>;
    }

    private showPlayingRounds(rounds: Round[], disabledInput: boolean) {
        if (rounds.length == 0) {
            return <div className="row">
                <span> not playing rounds </span>
            </div>
        }
        return <div>
            <p>Rounds: {rounds.length}</p>
            {rounds.map((round, index) => this.renderPresentationMode(round, index))}
        </div>;
    }

    renderPresentationMode(round: Round, roundIndex: number) {
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
                        <input type="number" min="0" step="1" className="form-control input-lg" disabled={true} value={round.roundScores[teamId]}></input>
                    </div>
                </div>
            )}
            <span className="input-group-btn">
                <button type="button" className={'btn ' + buttonType} disabled={true}>{buttonText}</button>
            </span>
        </div>;
    }

    private renderTeamsTable(teams: Team[]) {
        return <table className='table'>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Games Played</th>
                    <th>Games Won</th>
                </tr>
            </thead>
            <tbody>
                {teams.sort((a: Team, b: Team) => b.gamesWon - a.gamesWon).map(team =>
                    <tr key={team.id}>
                        <td>{team.name}</td>
                        <td>{team.gamesPlayed}</td>
                        <td>{team.gamesWon}</td>
                    </tr>
                )}
            </tbody>
        </table>;
    }

    gameStarted(startTime: string | undefined): boolean {
        return startTime != '' && startTime != '0001-01-01T00:00:00' && startTime != undefined
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
    
}