import styled from "styled-components";
import { Text as PrimerText, theme } from "@primer/components";
export const Spacer = styled.div<{ size: number }>`
  min-width: ${(props) => props.size + "px"};
  min-height: ${(props) => props.size + "px"};
`;

export const Text = styled(PrimerText)`
  display: block;
`;
export const LabelText = styled(PrimerText)`
  font-weight: bold;
`;

export const SecondaryText = styled(PrimerText)`
  opacity: 0.75;
  display: block;
`;

export const InteractiveText = styled(PrimerText)`
  display: block;
  font-size: initial;
  color: ${theme.colors.blue[4]};
`;

export const Clickable = styled.button`
  border: none;
  background: none;
  padding: 0;
  outline-offset: 4px;
`;
