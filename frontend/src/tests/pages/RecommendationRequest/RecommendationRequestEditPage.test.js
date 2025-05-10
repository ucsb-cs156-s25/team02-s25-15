import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

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

describe("RecommendationRequestEditPage tests", () => {
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
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 17 } })
        .timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Recommendation Request");
      expect(
        screen.queryByTestId("RecommendationRequest-professorEmail"),
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
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          requesterEmail: "perrytham@gmail.com",
          professorEmail: "pconrad@ucsb.edu",
          explanation: "hi1",
          dateRequested: "2025-05-07T00:00:00",
          dateNeeded: "2025-05-07T00:00:00",
          done: true,
        });
      axiosMock.onPut("/api/recommendationrequest").reply(200, {
        id: 17,
        requesterEmail: "perrytham@1gmail.com",
        professorEmail: "pconrad1@ucsb.edu",
        explanation: "hi2",
        dateRequested: "2025-05-07T01:00:00",
        dateNeeded: "2025-05-07T01:00:00",
        done: false,
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided, and changes when data is changed", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");

      const idField = screen.getByTestId("RecommendationRequestForm-id");
      const requesterEmailField = screen.getByLabelText("Requestor Email");
      const professorEmailField = screen.getByLabelText("Professor Email");
      const explanationField = screen.getByLabelText("Explanation");
      const dateRequestedField = screen.getByLabelText(
        "Date Requested (in UTC)",
      );
      const dateNeededField = screen.getByLabelText("Date Needed (in UTC)");
      const doneField = screen.getByLabelText("Done");

      const submitButton = screen.getByText("Update");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");

      expect(requesterEmailField).toBeInTheDocument();
      expect(requesterEmailField).toHaveValue("perrytham@gmail.com");

      expect(professorEmailField).toBeInTheDocument();
      expect(professorEmailField).toHaveValue("pconrad@ucsb.edu");

      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("hi1");

      expect(dateRequestedField).toBeInTheDocument();
      expect(dateRequestedField).toHaveValue("2025-05-07T00:00");

      expect(dateNeededField).toBeInTheDocument();
      expect(dateNeededField).toHaveValue("2025-05-07T00:00");

      expect(doneField).toBeInTheDocument();
      expect(doneField).toHaveValue("true");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(requesterEmailField, {
        target: { value: "perrytham@1gmail.com" },
      });
      fireEvent.change(professorEmailField, {
        target: { value: "pconrad1@ucsb.edu" },
      });
      fireEvent.change(explanationField, {
        target: { value: "hi2" },
      });
      fireEvent.change(dateRequestedField, {
        target: { value: "2025-05-07T01:00:00" },
      });
      fireEvent.change(dateNeededField, {
        target: { value: "2025-05-07T01:00:00" },
      });
      fireEvent.change(doneField, {
        target: { value: "false" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Recommendation Request Updated - id: 17 requesterEmail: perrytham@1gmail.com",
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/recommendationrequest",
      });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "perrytham@1gmail.com",
          professorEmail: "pconrad1@ucsb.edu",
          explanation: "hi2",
          dateRequested: "2025-05-07T01:00Z",
          dateNeeded: "2025-05-07T01:00Z",
          done: "false",
        }),
      ); // posted object
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/recommendationrequest",
      });
    });

    // test("Changes when you click Update", async () => {
    //   render(
    //     <QueryClientProvider client={queryClient}>
    //       <MemoryRouter>
    //         <RecommendationRequestEditPage />
    //       </MemoryRouter>
    //     </QueryClientProvider>,
    //   );

    //   await screen.findByTestId("RecommendationRequestForm-id");

    //   const idField = screen.getByTestId("RecommendationRequestForm-id");
    //   const requesterEmailField = screen.getByLabelText("Requestor Email");
    //   const professorEmailField = screen.getByLabelText("Professor Email");
    //   const explanationField = screen.getByLabelText("Explanation");
    //   const dateRequestedField = screen.getByLabelText("Date Requested (in UTC)");
    //   const dateNeededField = screen.getByLabelText("Date Needed (in UTC)");
    //   const doneField = screen.getByLabelText("Done");

    //   const submitButton = screen.getByText("Update");

    //   expect(idField).toBeInTheDocument();
    //   expect(idField).toHaveValue("17");

    //   expect(requesterEmailField).toBeInTheDocument();
    //   expect(requesterEmailField).toHaveValue("perrytham@gmail.com");

    //   expect(professorEmailField).toBeInTheDocument();
    //   expect(professorEmailField).toHaveValue("pconrad@ucsb.edu");

    //   expect(explanationField).toBeInTheDocument();
    //   expect(explanationField).toHaveValue("hi1");

    //   expect(dateRequestedField).toBeInTheDocument();
    //   expect(dateRequestedField).toHaveValue("2025-05-07T00:00");

    //   expect(dateNeededField).toBeInTheDocument();
    //   expect(dateNeededField).toHaveValue("2025-05-07T00:00");

    //   expect(doneField).toBeInTheDocument();
    //   expect(doneField).toHaveValue("true");

    //   expect(submitButton).toHaveTextContent("Update");

    //   fireEvent.change(nameField, {
    //     target: { value: "Freebirds World Burrito" },
    //   });
    //   fireEvent.change(descriptionField, { target: { value: "Big Burritos" } });

    //   fireEvent.click(submitButton);

    //   await waitFor(() => expect(mockToast).toHaveBeenCalled());
    //   expect(mockToast).toHaveBeenCalledWith(
    //     "Restaurant Updated - id: 17 name: Freebirds World Burrito",
    //   );
    //   expect(mockNavigate).toHaveBeenCalledWith({ to: "/recommendationrequest" });
    // });
  });
});
