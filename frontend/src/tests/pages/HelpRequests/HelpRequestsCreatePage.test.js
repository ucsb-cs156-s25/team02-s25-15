import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestsCreatePage from "main/pages/HelpRequests/HelpRequestsCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("HelpRequestsCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("RequesterEmail")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /helprequests", async () => {
    const queryClient = new QueryClient();
    const helpRequest = {
      id: 2,
      requesterEmail: "joe@gmail.com",
      teamId: "A",
      tableOrBreakoutRoom: "table",
      requestTime: "2025-12-10T06:34:12",
      explanation: "need help!",
      solved: "false",
    };

    axiosMock.onPost("/api/helprequests/post").reply(202, helpRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("RequesterEmail")).toBeInTheDocument();
    });

    const requesterEmail = screen.getByLabelText("RequesterEmail");
    expect(requesterEmail).toBeInTheDocument();

    const teamIdInput = screen.getByLabelText("TeamId");
    expect(teamIdInput).toBeInTheDocument();

    const tableOrBreakoutRoomInput = screen.getByLabelText(
      "TableOrBreakoutRoom",
    );
    expect(tableOrBreakoutRoomInput).toBeInTheDocument();

    const requestTimeInput = screen.getByLabelText("requestTime");
    expect(requestTimeInput).toBeInTheDocument();

    const explanationInput = screen.getByLabelText("explanation");
    expect(explanationInput).toBeInTheDocument();

    const solvedInput = screen.getByLabelText("solved");
    expect(solvedInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(requesterEmail, { target: { value: "joe@gmail.com" } });
    fireEvent.change(teamIdInput, { target: { value: "A" } });
    fireEvent.change(tableOrBreakoutRoomInput, { target: { value: "table" } });
    fireEvent.change(requestTimeInput, {
      target: { value: "2025-12-10T06:34:12" },
    });
    fireEvent.change(explanationInput, { target: { value: "need help!" } });
    fireEvent.change(solvedInput, { target: { value: "false" } });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "joe@gmail.com",
      teamId: "A",
      tableOrBreakoutRoom: "table",
      requestTime: "2025-12-10T06:34:12.000",
      explanation: "need help!",
      solved: "false",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toHaveBeenCalledWith(
      "New helpRequest Created - id: 2 requesterEmail: joe@gmail.com",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/helprequests" });
  });
});
