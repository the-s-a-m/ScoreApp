import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import 'isomorphic-fetch';

interface GameState {
    gameId: string;
    gameData: Game;
    scoreInput: number;
    loading: boolean;
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
        var pathGameId = this.props.location.pathname.substr(6);
        this.state = { gameId: pathGameId, gameData: tempGame, loading: true, scoreInput: 0 };

        fetch('api/game/' + this.state.gameId + '/all')
            .then(response => response.json() as Promise<Game>)
            .then(data => {
                this.setState({ gameData: data, loading: false});
            });
    }

    public render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderForecastsTable(this.state.gameData.playingRounds);

        return <div>
            <h1>{this.state.gameData.name}</h1>
            <p>Playing teams: {this.state.gameData.teams.map(team => team.name).join(',')}</p>
            <p>Round:</p>
            {contents}
            <form>
                <div className="form-group row">
                    <div className="col-sm-6">
                        <input type="number" className="form-control" value={this.state.scoreInput} onChange={this.handleChange.bind(this)}></input>
                    </div>
                    <button type="button" className="btn btn-primary col-sm-2" onClick={() => { this.setScore() }}>Add Team</button>
                </div>
            </form>
        </div>;
    }

    private renderForecastsTable(rounds: Round[]) {
        return <table className='table'>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Games Played</th>
                    <th>Games Won</th>
                </tr>
            </thead>
            <tbody>
               {rounds.map(rounds =>
                    <tr key={rounds.id }>
                </tr>
            )}
            </tbody>
        </table>;
    }

    handleChange(event: any) {
        this.setState({ scoreInput: event.target.value })
    }

    setScore() {
        var team: Team = {
            id: 0,
            name: '',
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
            //var newTeams = this.state.teams;
            //newTeams.push(response);
            //this.setState({ teams: newTeams });
        });
    }
}