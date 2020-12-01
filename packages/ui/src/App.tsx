import { BaseStyles } from "@primer/components";
import React from "react";
import { Route, Switch, Link } from "react-router-dom";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { Spacer } from "./components/ui";
import { PackageMap } from "./pages/PackageMap";

function App() {
  return (
    <BaseStyles>
      <GlobalNavigation />
      <Switch>
        <Route exact path="/">
          <Spacer size={16} />
          Landing page
          <Spacer size={16} />
          <Link to="/coursera">Coursera</Link>
          <Spacer size={16} />
          <Link to="/package-analyzer">PackageList</Link>
        </Route>
        <Route path="/:slug">
          <PackageMap />
        </Route>
      </Switch>
    </BaseStyles>
  );
}

export default App;
