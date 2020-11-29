import React from "react";
import { getBundleName } from "./utils";
import { Package } from "../types";
import { Flex as Box, TextInput } from "@primer/components";
import { LabelText, InteractiveText, Spacer, Clickable } from "./ui";
import { SearchIcon } from "@primer/octicons-react";

type Props = { onBundleSelected: (bundle: string) => void; bundles: Package[] };
type State = { query: string };

export class BundleSearch extends React.Component<Props, State> {
  state: State = { query: "" };

  handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { bundles } = this.props;
    const query = event.target.value;
    this.setState({ query });
    const match = bundles.find((_) => getBundleName(_) === query);
    if (match) {
      this.props.onBundleSelected(getBundleName(match));
    }
  };

  handleClear = () => {
    this.setState({ query: "" });
  };

  render() {
    const { bundles } = this.props;
    const { query } = this.state;
    return (
      <div>
        <Box justifyContent="space-between">
          <LabelText>Search</LabelText>
          {query && (
            <Clickable onClick={this.handleClear}>
              <InteractiveText>Clear</InteractiveText>
            </Clickable>
          )}
        </Box>
        <Spacer size={6} />
        <TextInput
          icon={SearchIcon}
          value={query}
          onChange={this.handleQueryChange}
          placeholder="Bundle name"
          list="browsers"
        />

        <datalist id="browsers">
          {bundles.map(getBundleName).map((_) => (
            <option key={_} value={_} />
          ))}
        </datalist>
      </div>
    );
  }
}
