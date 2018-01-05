import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import 'isomorphic-fetch';

interface GameState {
    gameId: string;
    gameData: Game;
    scoreInput: number;
    loading: boolean;
    startAllowed: boolean;
    roundInputCount: number[];
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
        this.state = { gameId: pathGameId, gameData: tempGame, loading: true, scoreInput: 0, startAllowed: false, roundInputCount: [] };

        fetch('api/game/' + this.state.gameId + '/all')
            .then(response => response.json() as Promise<Game>)
            .then(data => {
                var roundCount = this.state.roundInputCount;
                data.playingRounds.forEach((round) => {
                    roundCount[round.id] = 0;
                });
                this.setState({ gameData: data, loading: false, roundInputCount: roundCount});
            });
    }

    public render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.showPlayingRounds(this.state.gameData.playingRounds);

        return <div>
            <h1>{this.state.gameData.name}</h1>
            <p>Playing teams: {this.state.gameData.teams.map(team => team.name).join(', ')}</p>
            {contents}
        </div>;
    }

    private showPlayingRounds(rounds: Round[]) {
        if (rounds.length == 0) {
            return <form>
                <div className="form-group">
                    <input className="form-check-input" type="checkbox" id="inlineCheckbox1" onClick={() => { this.handelCheckbox() }} /> Teams correct (can not be changed later)
                </div>
                <div className="form-group">
                    <button type="button" className="btn btn-block btn-primary" disabled={!this.state.startAllowed} onClick={() => { this.generatePlayingRounds() }}>Generated playing rounds</button>
                </div>
            </form>
        }

        return <div>
            <p>Rounds: {rounds.length}</p>
            <form>
                {rounds.map((round, index) => this.renderScoreInput(round, index))}
            </form>
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
                console.log(sameScoreCount);
            }
        });
        const buttonText = round.deleted ? 'Deleted' : round.played ? sameScoreCount > 0 ? 'Drawn' : this.getTeamName(winningTeamId) + ' Won' : 'Set scores';
        const buttonType = round.deleted ? 'btn-default' : round.played ? sameScoreCount > 0 ? 'btn-info' : 'btn-success' : 'btn-primary';
        return <div className="row" key={round.id}>
                {playingTeamsIDs.map((teamId, index) => 
                    <div key={round.id + '_' + teamId + '_' + index} className="col-sm-4">
                        <div className="input-group" >
                            <span className="input-group-addon">{this.getTeamName(parseInt(teamId))} </span>
                            <input type="number" min="0" step="1" className="form-control" disabled={round.deleted || round.played} value={round.roundScores[teamId]} onChange={(event) => this.handleChange(event, round.id, parseInt(teamId))}></input>
                        </div>
                    </div>
                )}
                <span className="input-group-btn">
                    <button type="button" className={'btn ' + buttonType} disabled={round.deleted || round.played || this.state.roundInputCount[round.id] < playingTeamsIDs.length} onClick={() => { this.setScore(round.id) }}>{buttonText}</button>
                </span>
            </div>;
    }

    handleChange(event: any, roundId: number, teamId: number) {
        console.log(event.target.value);
        var score = parseInt(event.target.value);
        var roundCount = this.state.roundInputCount;
        roundCount[roundId]++;
        var gameInfo = this.state.gameData;
        gameInfo.playingRounds.forEach(round => {
            if (round.id == roundId) {
                console.log("set roundId " + round.id + " teamId " + teamId + " to " + score);
                round.roundScores[teamId] = score;
                round.roundScoresJSON = JSON.stringify(round.roundScores);
            }
        });
        this.setState({ gameData: gameInfo, roundInputCount: roundCount });
        console.log(JSON.stringify(this.state.gameData.playingRounds));
    }

    handelCheckbox() {
        this.setState({ startAllowed: !this.state.startAllowed });
    }

    generatePlayingRounds() {
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
        fetch('api/' + this.state.gameId + '/round', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(generatedRounds),
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

    setScore(roundId: number) {
        this.state.gameData.playingRounds.forEach((round, index) => {
            if (round.id == roundId) {
                round.played = true;
                console.log(JSON.stringify(round))
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
}