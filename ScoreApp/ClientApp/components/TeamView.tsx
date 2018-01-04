import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import 'isomorphic-fetch';

interface TeamEditState {
    gameId: string;
    teams: Team[];
    loading: boolean;
    newTeam: string;
}


export class TeamView extends React.Component<RouteComponentProps<{}>, TeamEditState> {
    constructor(props: any) {
        super(props);
        var pathGameId = this.props.location.pathname.substr(6);
        console.log(pathGameId);
        this.state = { gameId: pathGameId, teams: [], loading: true, newTeam: '' };

        fetch('api/' + this.state.gameId + '/team')
            .then(response => response.json() as Promise<Team[]>)
            .then(data => {
                this.setState({ teams: data, loading: false });
            });
    }

    public render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderForecastsTable(this.state.teams);

        return <div>
            <h1>Teams</h1>
            <p>Create, edit or delete Teams.</p>
            {contents}
            <form>
                <div className="form-group row">
                    <div className="col-sm-6">
                        <input type="text" className="form-control" value={this.state.newTeam} onChange={this.handleChange.bind(this)}></input>
                    </div>
                    <button type="button" className="btn btn-primary col-sm-2" onClick={() => { this.addTeam() }}>Add Team</button>
                </div>
            </form>
        </div>;
    }

    private renderForecastsTable(teams: Team[]) {
        return <table className='table'>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Games Played</th>
                    <th>Games Won</th>
                </tr>
            </thead>
            <tbody>
            {teams.map(team =>
                <tr key={ team.id }>
                    <td>{ team.name }</td>
                    <td>{ team.gamesPlayed }</td>
                    <td>{ team.gamesWon }</td>
                </tr>
            )}
            </tbody>
        </table>;
    }

    handleChange(event: any) {
        this.setState({ newTeam: event.target.value })
    }

    addTeam() {
        var team: Team = {
            id: 0,
            name: this.state.newTeam,
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
            var newTeams = this.state.teams;
            newTeams.push(response);
            this.setState({ teams: newTeams, newTeam: '' });
        });
    }
}