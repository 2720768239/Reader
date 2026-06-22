import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import TranslationDrawer from "./TranslationDrawer";

describe("TranslationDrawer", () => {
  it("calls onClose when the close control is selected", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<TranslationDrawer onClose={onClose} open text="中文内容" />);

    await user.click(screen.getByRole("button", { name: /close translation$/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is selected", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<TranslationDrawer onClose={onClose} open text="中文内容" />);

    await user.click(
      screen.getByRole("button", { name: /close translation backdrop/i })
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
