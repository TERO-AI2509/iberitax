import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SessionBanner from "@/components/SessionBanner";

it("renders expired with login and retry", () => {
  const onLogin = jest.fn();
  const onRetry = jest.fn();
  render(<SessionBanner state="expired" onLogin={onLogin} onRetry={onRetry} />);
  fireEvent.click(screen.getByTestId("login-btn"));
  fireEvent.click(screen.getByTestId("retry-btn"));
  expect(onLogin).toHaveBeenCalled();
  expect(onRetry).toHaveBeenCalled();
});

it("renders offline without login", () => {
  render(<SessionBanner state="offline" />);
  expect(screen.getByTestId("session-banner")).toBeInTheDocument();
  expect(screen.queryByTestId("login-btn")).toBeNull();
});
