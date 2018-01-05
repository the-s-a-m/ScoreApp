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
    shuffledRoundIndex: number[];
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
        this.state = { gameId: pathGameId, gameData: tempGame, loading: true, scoreInput: 0, startAllowed: false, roundInputCount: [], shuffledRoundIndex: [] };

        fetch('api/game/' + this.state.gameId + '/all')
            .then(response => response.json() as Promise<Game>)
            .then(data => {
                var roundCount = this.state.roundInputCount;
                var updatedShuffeledRoundIndex = this.state.shuffledRoundIndex;
                data.playingRounds.forEach((round, index) => {
                    roundCount[round.id] = 0;
                    updatedShuffeledRoundIndex[index] = index;
                });
                updatedShuffeledRoundIndex = this.shuffleArray(updatedShuffeledRoundIndex);
                this.setState({ gameData: data, loading: false, roundInputCount: roundCount, shuffledRoundIndex: updatedShuffeledRoundIndex});
            });
    }

    public render() {
        let mainContent = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.showPlayingRounds(this.state.gameData.playingRounds);

        return <div>
            <h1>{this.state.gameData.name}</h1>
            <p>Playing teams: {this.state.gameData.teams.map(team => team.name).join(', ')}</p>
            {mainContent}
            {this.renderTeamsTable(this.state.gameData.teams)}
        </div>;
    }

    private shuffleArray(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
            {this.state.shuffledRoundIndex.map(shuffleIndex => rounds[shuffleIndex]).map(round => this.renderScoreInput(round))}
        </div>;
    }

    private renderScoreInput(round: Round) {
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
                    <button type="button" className={'btn ' + buttonType} disabled={round.deleted || round.played || this.state.roundInputCount[round.id] < playingTeamsIDs.length} onClick={() => { this.updateScore(round.id) }}>{buttonText}</button>
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

            var updatedShuffledRoundIndex = this.state.shuffledRoundIndex;
            gameDataUpdated.playingRounds.forEach((round, index) => {
                updatedShuffledRoundIndex[index] = index;
            });
            updatedShuffledRoundIndex = this.shuffleArray(updatedShuffledRoundIndex);

            this.setState({ gameData: gameDataUpdated, shuffledRoundIndex: updatedShuffledRoundIndex });
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