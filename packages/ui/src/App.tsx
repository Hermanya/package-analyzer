import { BaseStyles } from "@primer/components";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { PackageMap } from "./pages/PackageMap";

function App() {
  return (
    <BaseStyles>
      <GlobalNavigation />
      <Switch>
        <Route exact path="/">
          Landing page
        </Route>
        <Route path="/:slug">
          <PackageMap />
        </Route>
      </Switch>
    </BaseStyles>
  );
}

export default App;
