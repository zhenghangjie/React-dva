import React, { Component } from 'react';
import { Route, Switch } from 'dva/router';
import ActiveCode from './activeCode';
import AddCode from './addCode';
import ViewCode from './viewCode';


class ActiveCodeLists extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/active/activecode/addcode" component={AddCode} />
          <Route exact path="/active/activecode/viewcode/:id" component={ViewCode} />
          <Route exact path="/active/activecode" component={ActiveCode} />
        </Switch>
      </div>
    );
  }
}

export default ActiveCodeLists;
