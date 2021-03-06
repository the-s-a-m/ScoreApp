import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import 'isomorphic-fetch';
import { withRouter } from 'react-router-dom'

interface GameOverviewState {
    games: Game[];
    loadingState: number;
    newGame: string;
    possibleTeams: Team[];
    newTeamName: string;
}

export class GameOverView extends React.Component<RouteComponentProps<{}>, GameOverviewState> {
    constructor(params: any) {
        super(params);
        this.state = { games: [], loadingState: 0, newGame: '', possibleTeams: [], newTeamName: '' };

        fetch('api/game')
            .then(response => response.json() as Promise<Game[]>)
            .then(data => {
                this.setState({ games: data, loadingState: this.state.loadingState + 1 });
            });
    }

    public render() {
        let contents = this.state.loadingState < 1
            ? <p><em>Loading...</em></p>
            : this.renderGameTable(this.state.games);

        return <div>
            <h1>Games</h1>
            <p>Create, edit or play Games.</p>
            {contents}
            <form>
                <div className="form-group row">
                    <div className="col-sm-6">
                        <input type="text" className="form-control" value={this.state.newGame} onChange={this.handleChange.bind(this)}></input>
                    </div>
                    <button type="button" className="btn btn-primary col-sm-2" onClick={() => { this.addGame() }}>Add Game</button>
                </div>
            </form>
        </div>;
    }

    private renderGameTable(games: Game[]) {
        return <table className='table table-condensed'>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Edit</th>
                    <th>Started</th>
                    <th>Ended</th>
                    <th>Results</th>
                </tr>
            </thead>
            <tbody>
            {games.map(game =>
                <tr key={ game.id }>
                        <td>{game.name}</td>
                        <td>{this.niceDate(game.created)}</td>
                        <td>
                            <div className="input-group">
                                <span className="input-group-btn">
                                    <button className="btn btn-xs btn-secondary" type="button" disabled={this.gameStarted(game.started)} onClick={() => { this.props.history.push('/gameedit/' + game.id) }}>Edit Game</button>
                                </span>
                            </div>
                        </td>
                        <td>{this.renderGameStart(game.id, game.started)}</td>
                        <td>{this.renderGameEnd(game.id, game.ended)}</td>
                        <td>
                            <div className="input-group">
                                <span className="input-group-btn">
                                    <button className="btn btn-xs btn-success" type="button" onClick={() => { this.startGame(game.id) }}>Play Game</button>
                                </span>
                            </div>
                        </td>
                </tr>
            )}
            </tbody>
        </table>;
    }

    private renderGameStart(gameId: number, gameStarted: string | undefined) {
        if (gameStarted == '0001-01-01T00:00:00' || gameStarted == undefined) {
            return <div></div>;
        }
        return <span>{this.niceDate(gameStarted)}</span>
    }

    private renderGameEnd(gameId: number, gameEnded: string | undefined) {
        if (gameEnded == '0001-01-01T00:00:00' || gameEnded == undefined) {
            return <div></div>;
        }
        return <span>{this.niceDate(gameEnded)}</span>
    }

    gameStarted(startTime: string | undefined): boolean {
        return startTime != '' && startTime != '0001-01-01T00:00:00' && startTime != undefined
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
            created: '0001-01-01T00:00:00',
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

    startGame(gameId: number) {
        this.props.history.push('/game/' + gameId);
    }

    private niceDate(dateString: string | undefined) {
        if (dateString == undefined || typeof dateString == 'undefined') {
            return '';
        }
        return dateString.replace('T', ' ').substring(0, 19)
    }

}