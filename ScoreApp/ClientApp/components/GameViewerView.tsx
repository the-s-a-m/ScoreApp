import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import 'isomorphic-fetch';

interface GameViewerState {
    gameId: string;
    loading: boolean;
    gameData: Game;
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


export class GameViewerView extends React.Component<RouteComponentProps<{}>, GameViewerState> {
    constructor(props: any) {
        super(props);
        var pathGameId = this.props.location.pathname.replace('/gameviewer/','');
        console.log(pathGameId);
        this.state = {
            gameId: pathGameId,
            loading: true,
            gameData: tempGame,
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
            console.log('switch to GameView /game/' + this.state.gameId);
            this.props.history.push('/game/' + this.state.gameId);
        }
    }
    componentDidMount() {
        document.addEventListener("keydown", this.keyEvents, false);
    }
    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyEvents, false);
    }

    updateLocalGameData() {
        fetch('api/game/' + this.state.gameId + '/all')
            .then(response => response.json() as Promise<Game>)
            .then(data => this.setState({ gameData: data, loading: false, gameStarted: this.gameStarted(data.started) }));
    }

    public render() {
        if (this.state.loading) {
            return <p>Loading data</p>
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
                {this.renderTeamsTable(this.state.gameData.teams)}
            </div>
        </div>;
    }

    private renderPlayingRounds(rounds: Round[]) {
        if (rounds.length == 0) {
            return <div className="row">
                <span> not playing rounds </span>
            </div>
        }
        return <div>
            <p>Rounds: {rounds.length}</p>
            <table className="table table-condensed" >
                <tbody>
                    {rounds.map((round, index) => this.renderPresentationMode(round, index))}
                </tbody>
            </table>
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
        const currentState = round.deleted ? 'Deleted' : round.played ? sameScoreCount > 0 ? 'Drawn' : this.getTeamName(winningTeamId) + ' Won' : 'Set scores';
        const labelType = round.deleted ? '-default' : round.played ? sameScoreCount > 0 ? '-info' : '-success' : '-primary';
        return <tr key={round.id + '_' + roundIndex}>
            <td>
                <h2 className="text-center" style={{ marginTop: 0.01 + "em", marginBottom: 0.01 + "em" }}>
                    {playingTeamsIDs.map(teamId => this.getTeamName(parseInt(teamId))).join(' : ')}
                </h2>
            </td>
            <td>
                <h2 className="text-center" style={{ marginTop: 0.01 + "em", marginBottom: 0.01 + "em" }}>
                    {playingTeamsIDs.map(teamId => round.roundScores[teamId]).join(' : ')}
                </h2>
            </td>
            <td><button type="button" className={'btn btn' + labelType}>{currentState}</button></td>
        </tr>;
            
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