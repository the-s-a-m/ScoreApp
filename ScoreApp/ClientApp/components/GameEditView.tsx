import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import 'isomorphic-fetch';

interface GameEditState {
    gameId: string;
    gameData: Game;
    generatedRounds: Round[];
    teamVsCountInput: number;
    loading: boolean;
    gameStarted: boolean;
    startAllowed: boolean;
    inputTeamName: string;
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


export class GameEditView extends React.Component<RouteComponentProps<{}>, GameEditState> {
    constructor(props: any) {
        super(props);
        var pathGameId = this.props.location.pathname.replace('/gameedit/', '');
        console.log(pathGameId);
        this.state = {
            gameId: pathGameId,
            gameData: tempGame,
            generatedRounds: [],
            loading: true,
            teamVsCountInput: 2,
            gameStarted: false,
            startAllowed: false,
            inputTeamName: ''
        };

        this.updateLocalGameData();
    }

    public render() {
        if (this.state.loading) {
            return <p><em>Loading...</em></p>;
        }
        return <div>
            <h1>{this.state.gameData.name}</h1>
            {this.renderTeamsEdit(this.state.gameData.teams, this.state.gameData.playingRounds)}
            {this.renderPlayingRounds(this.state.generatedRounds, this.state.gameStarted)}
            {this.renderPlayingRounds(this.state.gameData.playingRounds, this.state.gameStarted)}
        </div>;
    }

    private renderTeamsEdit(teams: Team[], rounds: Round[]) {
        return <div>
            <h3>Edit Teams</h3>
            <p>Create, edit or delete Teams.</p>
            <table className='table table-condensed'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>UpdateName</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {teams.map(team =>
                        <tr key={team.id}>
                            <td>{team.name}</td>
                            <td><button type="button" disabled={true} className='btn btn-xs btn-warn'>UpdateName</button></td>
                            <td><button type="button" disabled={true} className='btn btn-xs btn-error'>Delete {team.name}</button></td>
                        </tr>
                    )}
                    {this.state.gameStarted ? <tr></tr> : 
                        <tr key={'AddTeamID'}>
                            <td><input type="text" className="form-control input-xs" value={this.state.inputTeamName} onChange={(event) => this.setState({ inputTeamName: event.target.value })}></input></td>
                            <td><button type="button" className="btn btn-primary" onClick={() => { this.addTeam() }}>Add Team</button></td>
                            <td></td>
                        </tr>
                    }
                </tbody>
            </table>
            <p>Playing teams: {teams.map(team => team.name).join(', ')}</p>
        </div>;
    }

    private renderPlayingRounds(rounds: Round[], gameStarted: boolean) {
        if (rounds.length == 0) {
            return 
        }
        return <div>
            <p>Rounds: {rounds.length}</p>
            {rounds.map((round, index) => <div className="input-group" key={round.id + '_' + index}>
                <span className="input-group-addon">{index}</span>
                <input type="text" className="form-control" disabled={true} value={Object.keys(round.roundScores).map(teamId => this.getTeamName(parseInt(teamId))).join(' vs ')}></input>
            </div>
            )}
            <br/>
            <div className="btn-group btn-group-justified">
                <a hrefLang="#" className="btn btn-primary" disabled={gameStarted} onClick={() => { this.setState({ generatedRounds: this.shuffleArray(this.state.generatedRounds) }) }}>Shuffle rounds</a>
                <a hrefLang="#" className="btn btn-success" onClick={() => { this.startGame() }}>{gameStarted ? 'Play Game' : 'Start Game'}</a>
            </div> 
        </div>;
    }

    addTeam() {
        if (this.state.gameStarted) {
            return;
        }
        var team: Team = {
            id: 0,
            name: this.state.inputTeamName,
            gamesPlayed: 0,
            gamesWon: 0,
            deleted: false
        };
        fetch('api/' + this.state.gameId + '/team', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(team),
        }).then(response => {
            return response.json();
        }).then((response) => {
            console.log(JSON.stringify(response));
            this.updateLocalGameData();
        });
    }

    shuffleArray(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    gameStarted(startTime: string | undefined): boolean {
        return startTime != '' && startTime != '0001-01-01T00:00:00' && startTime != undefined
    }

    handelCheckbox() {
        this.setState({ startAllowed: !this.state.startAllowed });
    }

    updateLocalGameData() {
        fetch('api/game/' + this.state.gameId + '/all')
            .then(response => response.json() as Promise<Game>)
            .then(data => {
                this.setState({ gameData: data, loading: false, gameStarted: this.gameStarted(data.started), inputTeamName: '' });
                this.generatePlayingRounds();
            });
    }

    generatePlayingRounds() {
        if (this.state.gameStarted) {
            this.setState({ generatedRounds: [] });
            return;
        }
        var generatedRounds: Round[] = [];
        let teams = this.state.gameData.teams;
        for (var i = 0; i < teams.length; i++) {
            for (var j = i + 1; j < teams.length; j++) {
                var teamDict: Dictionary<number> = {};
                teamDict[teams[i].id] = 0;
                teamDict[teams[j].id] = 0;
                var round: Round = {
                    id: 0,
                    roundScores: teamDict,
                    roundScoresJSON: JSON.stringify(teamDict),
                    played: false,
                    deleted: false
                }
                generatedRounds.push(round);
            }
        }
        generatedRounds = this.shuffleArray(generatedRounds);
        this.setState({ generatedRounds: generatedRounds });
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
            this.props.history.push('/game/' + this.state.gameId)
            return;
        }
        this.insertRounds(this.state.generatedRounds);
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
            this.setState({ gameData: gameDataUpdated, generatedRounds: [] });
            this.props.history.push('/game/' + this.state.gameId)
        });
    }

    insertRounds(rounds: Round[]) {
        fetch('api/' + this.state.gameId + '/round', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rounds),
        }).then(response => {
            return response.json();
        }).then((response: Round[]) => {
            console.log(JSON.stringify(response));
            var gameDataUpdated = this.state.gameData;
            gameDataUpdated.playingRounds = response;
            this.setState({ gameData: gameDataUpdated, generatedRounds: [] });
        });
    }
}