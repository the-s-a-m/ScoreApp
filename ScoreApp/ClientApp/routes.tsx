import * as React from 'react';
import { Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { TeamView } from './components/TeamView';
import { GameEditView } from './components/GameEditView';
import { GameView } from './components/GameView';

export const routes = <Layout>
    <Route exact path='/' component={ Home } />
    <Route path='/team' component={TeamView} />
    <Route path='/gameedit' component={GameEditView} />
    <Route path='/game' component={GameView} />
</Layout>;
