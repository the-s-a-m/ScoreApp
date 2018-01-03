import * as React from 'react';
import { RouteComponentProps } from 'react-router';

interface Team {
    name: string,
    wins: number,
    gamesplayed: number,
    playedAgainst: string[]
}

interface TeamVsTeam {
    team1: Team,
    team2: Team,
    played: boolean
}

interface TeamData {
    teams: Team[];
    teamVsTeam: TeamVsTeam[];
    newTeam: string;
    gameStarted: boolean;
    round: number;
}

export class ScoreView extends React.Component<RouteComponentProps<{}>, TeamData> {
    constructor() {
        super();
        this.state = { teams: [], newTeam: '', gameStarted: false, round: 0, teamVsTeam: [] };
    }

    public render() {
        return <div>
            <h1>TeamScore</h1>
            <h3>Teams</h3>
            <ul className="list-group">
                {this.state.teams.map(function (team, index) {
                    return <li className="list-group-item" key={index}>Name: {team.name}, Gespielte Spiele: {team.gamesplayed}, Gewonnen: {team.wins}</li>;
                })}
            </ul>
            { !this.state.gameStarted ? (
                <div>
                    <form>
                        <div className="form-group row">
                            <div className="col-sm-6">
                                <input type="text" className="form-control" value={this.state.newTeam} onChange={this.handleChange.bind(this)}></input>
                            </div>
                            <button type="button" className="btn btn-primary col-sm-2" onClick={() => { this.addTeam() }}>Add Team</button>
                        </div>
                    </form>
                    <br />
                    {this.state.teams.length > 0 && this.state.teams.length % 2 == 0 ? (
                        < button type="button" className="btn btn-primary" onClick={() => { this.startGame() }}>Spiel starten</button>
                    ) : (
                            <div></div>
                        ) 
                    }
                    
                </div>
            ) :
                (<div>
                    <h3>Team vs Team</h3>
                    <ul className="list-group">
                        {
                            this.state.teamVsTeam.sort((teamVsTeam) => (teamVsTeam.team1.gamesplayed + teamVsTeam.team2.gamesplayed)).map((teamVsTeam, index) => {
                            if (!teamVsTeam.played) {
                                return <li className="list-group-item" key={index}>
                                    <button type="button" value={index} className="btn btn-primary" onClick={() => {
                                        this.updatePlays(teamVsTeam.team1.name, true, index);
                                        this.updatePlays(teamVsTeam.team2.name, false, index);
                                    }}>Team1: {teamVsTeam.team1.name}</button>
                                    <span> vs </span>
                                    <button type="button" value={index} className="btn btn-primary" onClick={() => {
                                        this.updatePlays(teamVsTeam.team2.name, true, index);
                                        this.updatePlays(teamVsTeam.team1.name, false, index);
                                    }}>Team2: {teamVsTeam.team2.name}</button>
                                </li>;
                            }
                        })}
                    </ul>
                </div>)
            }
            
        </div>;
    }

    handleChange(event: any) {
        this.setState({ newTeam: event.target.value })
    }

    addTeam() {
        this.setState({
            teams: this.state.teams.concat({ name: this.state.newTeam, wins: 0, gamesplayed: 0, playedAgainst: [] }),
            newTeam: ''
        });
    }

    startGame() {
        var teamVsTeamData: TeamVsTeam[] = [];
        var sortedTeams = this.state.teams.sort(t => -t.wins);
        for (var i = 0; i < sortedTeams.length; i++) {
            for (var j = i + 1; j < sortedTeams.length; j++) {
                teamVsTeamData.push({ team1: sortedTeams[i], team2: sortedTeams[j], played: false });
            }
        }
        teamVsTeamData = teamVsTeamData.sort(function () {
            return .5 - Math.random();
        });
        console.log(this.state.teamVsTeam.length);
        this.setState({ newTeam: '', gameStarted: true, teamVsTeam: teamVsTeamData })
    }

    updatePlays(teamName: string, wins: boolean, teamIndex: number) {
        for (var i = 0; i < this.state.teams.length; i++) {
            if (this.state.teams[i].name == teamName) {
                var updateTeam = this.state.teams[i];
                updateTeam.gamesplayed++;
                if (wins) {
                    updateTeam.wins++;
                }
                this.setState({ teams: this.state.teams })
            }
        }
        var teamVsTeams = this.state.teamVsTeam;
        teamVsTeams[teamIndex].played = true;
        this.setState({ teamVsTeam: teamVsTeams });
    }
}
