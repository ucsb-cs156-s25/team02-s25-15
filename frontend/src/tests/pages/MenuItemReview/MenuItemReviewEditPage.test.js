import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

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

describe("MenuItemReviewEditPage tests", () => {
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
      axiosMock.onGet("/api/MenuItemReviews", { params: { id: 17 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit MenuItemReview");
      expect(
        screen.queryByTestId("MenuItemReview-itemId"),
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
        .onGet("/api/MenuItemReviews", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          itemId: 10,
          reviewerEmail: "tyguywong@gmail.com",
          stars: 1,
          dateReviewed: "2025-04-26T04:18:01.047",
          comments: "Very good.",
        });
      axiosMock.onPut("/api/MenuItemReviews").reply(200, {
        id: 17,
        itemId: 9,
        reviewerEmail: "tyguyw0ng@gmail.com",
        stars: 2,
        dateReviewed: "2025-04-26T04:18:01.045",
        comments: "Very bad.",
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      const idField = screen.getByTestId("MenuItemReviewForm-id");
      const itemIdField = screen.getByLabelText("ItemId");
      const reviewerEmailField = screen.getByLabelText("Reviewer Email");
      const starsField = screen.getByLabelText("Stars");
      const dateReviewedField = screen.getByLabelText(
        "Date Reviewed (iso format)",
      );
      const commentsField = screen.getByLabelText("Comments");
      const submitButton = screen.getByText("Update");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");

      expect(itemIdField).toBeInTheDocument();
      expect(itemIdField).toHaveValue(10);

      expect(reviewerEmailField).toBeInTheDocument();
      expect(reviewerEmailField).toHaveValue("tyguywong@gmail.com");

      expect(starsField).toBeInTheDocument();
      expect(starsField).toHaveValue(1);

      expect(dateReviewedField).toBeInTheDocument();
      expect(dateReviewedField).toHaveValue("2025-04-26T04:18:01.047");

      expect(commentsField).toBeInTheDocument();
      expect(commentsField).toHaveValue("Very good.");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(itemIdField, {
        target: { value: "9" },
      });
      fireEvent.change(reviewerEmailField, {
        target: { value: "tyguyw0ng@gmail.com" },
      });
      fireEvent.change(starsField, {
        target: { value: "2" },
      });
      fireEvent.change(dateReviewedField, {
        target: { value: "2025-04-26T04:18:01.045" },
      });
      fireEvent.change(commentsField, {
        target: { value: "Very bad." },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "MenuItemReview Updated - id: 17 itemId: 9",
      );

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/MenuItemReviews" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          itemId: "9",
          reviewerEmail: "tyguyw0ng@gmail.com",
          stars: "2",
          dateReviewed: "2025-04-26T04:18:01.045",
          comments: "Very bad.",
        }),
      ); // posted object
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/MenuItemReviews" });
    });
  });
});
