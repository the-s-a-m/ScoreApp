import * as React from 'react';
import { Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { GameOverView } from './components/GameOverView';
import { GameEditView } from './components/GameEditView';
import { GameView } from './components/GameView';
import { GameViewerView } from './components/GameViewerView';

export const routes = <Layout>
    <Route exact path='/' component={ Home } />
    <Route path='/games' component={GameOverView} />
    <Route path='/gameedit' component={GameEditView} />
    <Route path='/game' component={GameView} />
    <Route path='/gameviewer' component={GameViewerView} />
</Layout>;
