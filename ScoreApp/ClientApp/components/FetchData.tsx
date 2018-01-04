const Countries = [
    "Afghanistan",
    "Albania",
    "Algeria"
];

import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import 'isomorphic-fetch';
//import { WithContext as ReactTags } from 'react-tag-input';
//import './../css/reactTags.css'

//const Tags = ReactTags;


interface FetchDataExampleState {
    forecasts: WeatherForecast[];
    loading: boolean;
    tags: { id: number, text: string }[];
    suggestions: string[];
}

export class FetchData extends React.Component<RouteComponentProps<{}>, FetchDataExampleState> {
    
    constructor() {
        super();
        this.state = {
            forecasts: [],
            loading: true,
            tags: [{ id: 1, text: "Thailand" }, { id: 2, text: "India" }],
            suggestions: Countries
         };

        fetch('api/SampleData/WeatherForecasts')
            .then(response => response.json() as Promise<WeatherForecast[]>)
            .then(data => {
                this.setState({ forecasts: data, loading: false });
            });

        this.handleDelete = this.handleDelete.bind(this);
        this.handleAddition = this.handleAddition.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
    }

    public render() {
        const { tags, suggestions } = this.state;
        return (
            <div>
            </div>
        );
        /*
            <Tags
                tags={tags}
                suggestions={suggestions}
                handleDelete={(i) => this.handleDelete(i, "abc")}
                handleAddition={this.handleAddition}
            />
        */
    }
    /*
    public render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : FetchData.renderForecastsTable(this.state.forecasts);

        return <div>
            <h1>Weather forecast</h1>
            <p>This component demonstrates fetching data from the server.</p>
            { contents }
        </div>;
    }

    private static renderForecastsTable(forecasts: WeatherForecast[]) {
        return <table className='table'>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Temp. (C)</th>
                    <th>Temp. (F)</th>
                    <th>Summary</th>
                </tr>
            </thead>
            <tbody>
            {forecasts.map(forecast =>
                <tr key={ forecast.dateFormatted }>
                    <td>{ forecast.dateFormatted }</td>
                    <td>{ forecast.temperatureC }</td>
                    <td>{ forecast.temperatureF }</td>
                    <td>{ forecast.summary }</td>
                </tr>
            )}
            </tbody>
        </table>;
    }*/

    handleDelete(i: any, test: any) {
        let tags = this.state.tags;
        tags.splice(i, 1);
        this.setState({ tags: tags });
    }

    handleAddition(tag: any) {
        let tags = this.state.tags;
        tags.push({
            id: tags.length + 1,
            text: tag
        });
        this.setState({ tags: tags });
    }

    handleDrag(tag: any, currPos: any, newPos: any) {
        let tags = this.state.tags;

        // mutate array
        tags.splice(currPos, 1);
        tags.splice(newPos, 0, tag);

        // re-render
        this.setState({ tags: tags });
    }
}

interface WeatherForecast {
    dateFormatted: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}
