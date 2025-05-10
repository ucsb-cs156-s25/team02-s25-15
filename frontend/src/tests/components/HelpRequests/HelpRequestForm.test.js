import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import HelpRequestForm from "main/components/HelpRequests/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("HelpRequestForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Requester Email",
    "Team Id",
    "Table or Breakout Room",
    "Request Time",
    "Explanation",
    "Solved",
  ];
  const testId = "HelpRequestForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm
            initialContents={helpRequestFixtures.oneHelpRequest}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Requester Email is required/);
    expect(screen.getByText(/Team Id is required/)).toBeInTheDocument();
    expect(
      screen.getByText(/Table or Breakout Room is required/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Request Time is required/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
    expect(screen.getByText(/Solved is required/)).toBeInTheDocument();

    const nameInput = screen.getByTestId(`${testId}-requesterEmail`);
    fireEvent.change(nameInput, { target: { value: "a".repeat(31) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
    });
  });
});
