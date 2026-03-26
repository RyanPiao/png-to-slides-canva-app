/* eslint-disable formatjs/no-literal-string-in-jsx */
import { useFeatureSupport } from "@canva/app-hooks";
import { TestAppI18nProvider } from "@canva/app-i18n-kit";
import { TestAppUiProvider } from "@canva/app-ui-kit";
import { addPage } from "@canva/design";
import type { Feature } from "@canva/platform";
import { render } from "@testing-library/react";
import type { RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";
import { App } from "../app";

function renderInTestProvider(node: ReactNode): RenderResult {
  return render(
    <TestAppI18nProvider>
      <TestAppUiProvider>{node}</TestAppUiProvider>,
    </TestAppI18nProvider>,
  );
}

jest.mock("@canva/app-hooks");

describe("PNG to Slides", () => {
  const mockIsSupported = jest.fn();
  const mockUseFeatureSupport = jest.mocked(useFeatureSupport);

  beforeEach(() => {
    jest.resetAllMocks();
    mockIsSupported.mockImplementation((fn: Feature) => fn === addPage);
    mockUseFeatureSupport.mockReturnValue(mockIsSupported);
  });

  it("should render the app with insert button disabled when no files selected", () => {
    const result = renderInTestProvider(<App />);
    const insertButton = result.getByRole("button", { name: /Insert 0 Slide/i });
    expect(insertButton.hasAttribute("disabled") || insertButton.getAttribute("aria-disabled") === "true").toBe(true);
  });

  it("should have a consistent snapshot", () => {
    const result = renderInTestProvider(<App />);
    expect(result.container).toMatchSnapshot();
  });
});
