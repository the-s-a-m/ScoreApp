import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import 'isomorphic-fetch';
import { withRouter } from 'react-router-dom'

interface GameEditState {
    games: Game[];
    loadingState: number;
    newGame: string;
    possibleTeams: Team[];
    newTeamName: string;
}

export class GameView extends React.Component<RouteComponentProps<{}>, GameEditState> {
    constructor() {
        super();
        this.state = { games: [], loadingState: 0, newGame: '', possibleTeams: [], newTeamName: '' };

        fetch('api/Game')
            .then(response => response.json() as Promise<Game[]>)
            .then(data => {
                this.setState({ games: data, loadingState: this.state.loadingState + 1 });
            });
    }

    public render() {
        let contents = this.state.loadingState < 1
            ? <p><em>Loading...</em></p>
            : this.renderForecastsTable(this.state.games);

        return <div>
            <h1>Games</h1>
            <p>Create, edit or delete Games.</p>
            {contents}
            <form>
                <div className="form-group row">
                    <div className="col-sm-6">
                        <input type="text" className="form-control" value={this.state.newGame} onChange={this.handleChange.bind(this)}></input>
                    </div>
                    <button type="button" className="btn btn-primary col-sm-2" onClick={() => { this.addGame() }}>Add Team</button>
                </div>
            </form>
        </div>;
    }

    private renderForecastsTable(games: Game[]) {
        return <table className='table'>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Teams</th>
                    <th>Rounds</th>
                    <th>Started</th>
                    <th>Ended</th>
                </tr>
            </thead>
            <tbody>
            {games.map(game =>
                <tr key={ game.id }>
                        <td>{game.name}</td>
                        <td>{game.created}</td>
                        <td>{game.teams.map(t =>
                                <span>{t.name}<button>x</button></span>
                            )}
                            <div className="input-group">
                                <span className="input-group-btn">
                                    <button className="btn btn-secondary" type="button" onClick={() => { this.props.history.push('/team/' + game.id) }}>Edit Team</button>
                                </span>
                            </div>
                        </td>
                        <td>{game.playingRounds.map(r => r.teams.join('vs')).join(', ')}</td>
                        <td>{game.started}</td>
                        <td>{game.ended}</td>
                </tr>
            )}
            </tbody>
        </table>;
    }

    handleChange(event: any) {
        console.log(event.target.value);
        this.setState({ newGame: event.target.value });
    }

    setNewTeamName(event: any) {
        console.log(event.target.value);
        this.setState({ newTeamName: event.target.value });
    }

    addGame() {
        var game: Game = {
            id: 0,
            name: this.state.newGame,
            teams: [],
            playingRounds: [],
            deleted: false
        };
        fetch('api/Game', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(game),
        }).then(response => {
            return response.json();
        }).then((response) => {
            console.log(JSON.stringify(response));
            var newGames = this.state.games;
            newGames.push(response);
            this.setState({ games: newGames, newGame: '' });
        });
    }

    addTeam(gameid: number) {
        if (this.state.newTeamName.length == 0) {
            console.log('TeamLength is 0');
            return;
        }

        var fileteredTeams = this.state.possibleTeams.forEach(t => {
            if (t.name == this.state.newTeamName) {
                this.state.games.forEach(g => {
                    if (g.id == gameid) {
                        console.log('Found gameid ' + g.id);
                        g.teams.push(t);

                        fetch('api/Game/' + g.id, {
                            method: 'PUT',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(g),
                        }).then(response => {
                            console.log(JSON.stringify(response));
                        });
                    }
                });
            }
        });
        
        console.log(gameid);
    }
}