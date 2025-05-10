import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import HelpRequestsEditPage from "main/pages/HelpRequests/HelpRequestsEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

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
    useParams: () => ({
      id: 17,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("HelpRequestsEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit HelpRequest");
      expect(
        screen.queryByTestId("HelpRequest-requesterEmail"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).reply(200, {
        id: 17,
        requesterEmail: "joe@gmail.com",
        teamId: "A",
        tableOrBreakoutRoom: "table",
        requestTime: "2025-12-10T06:34:12.000",
        explanation: "need help!",
        solved: false,
      });
      axiosMock.onPut("/api/helprequests").reply(200, {
        id: 17,
        requesterEmail: "bob@gmail.com",
        teamId: "ABB",
        tableOrBreakoutRoom: "table",
        requestTime: "2025-12-10T06:34:12.000",
        explanation: "need help!",
        solved: false,
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-id");

      const idField = screen.getByLabelText("Id");
      const requesterEmailField = screen.getByLabelText("Requester Email");
      const teamIdField = screen.getByLabelText("Team Id");
      const tableOrBreakoutRoomField = screen.getByLabelText(
        "Table or Breakout Room",
      );
      const requestTimeField = screen.getByLabelText("Request Time");
      const explanationField = screen.getByLabelText("Explanation");
      const solvedField = screen.getByLabelText("Solved");

      const submitButton = screen.getByText("Update");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(requesterEmailField).toBeInTheDocument();
      expect(requesterEmailField).toHaveValue("joe@gmail.com");
      expect(teamIdField).toBeInTheDocument();
      expect(teamIdField).toHaveValue("A");
      expect(tableOrBreakoutRoomField).toBeInTheDocument();
      expect(tableOrBreakoutRoomField).toHaveValue("table");
      expect(requestTimeField).toBeInTheDocument();
      expect(requestTimeField).toHaveValue("2025-12-10T06:34:12.000");
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("need help!");
      expect(solvedField).toBeInTheDocument();
      expect(solvedField).toHaveValue("false");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(requesterEmailField, {
        target: { value: "bobby@gmail.com" },
      });
      fireEvent.change(teamIdField, {
        target: { value: "AB" },
      });
      fireEvent.change(tableOrBreakoutRoomField, {
        target: { value: "table" },
      });
      fireEvent.change(requestTimeField, {
        target: { value: "2025-12-10T06:34:12.000" },
      });
      fireEvent.change(explanationField, {
        target: { value: "need help!" },
      });
      fireEvent.change(solvedField, {
        target: { value: "true" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "HelpRequest Updated - id: 17 RequesterEmail: bob@gmail.com",
      );

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/helprequests" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "bobby@gmail.com",
          teamId: "AB",
          tableOrBreakoutRoom: "table",
          requestTime: "2025-12-10T06:34:12.000",
          explanation: "need help!",
          solved: "true",
        }),
      ); // posted object
    });
  });
});
