import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { CompanySearchBar } from "./CompanySearchBar";

const meta: Meta<typeof CompanySearchBar> = {
  title: "Components/CompanySearchBar",
  component: CompanySearchBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onCompanySelect: { action: "companySelected" },
  },

  args: {
    onCompanySelect: action("companySelected"),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
