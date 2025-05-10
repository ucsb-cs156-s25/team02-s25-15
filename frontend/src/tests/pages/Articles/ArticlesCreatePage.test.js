import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
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
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /articles", async () => {
    const queryClient = new QueryClient();
    const articles = {
      id: 3,
      title: "Patch 25.09 Notes",
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-09-notes/",
      explanation:
        "Welcome to Season 2 where we go to Ionia just in time for the Spirit Blossom Festival! We’ve got lots to celebrate this patch, so make sure to read the full patch notes for all the details!",
      email: "riotgames@ucsb.edu",
      dateAdded: "2025-04-29T12:13:14",
    };

    axiosMock.onPost("/api/articles/post").reply(202, articles);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title");
    expect(titleInput).toBeInTheDocument();

    const urlInput = screen.getByLabelText("URL");
    expect(urlInput).toBeInTheDocument();

    const explanationInput = screen.getByLabelText("Explanation");
    expect(explanationInput).toBeInTheDocument();

    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toBeInTheDocument();

    const dateAddedInput = screen.getByLabelText("Date Added");
    expect(dateAddedInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: "Patch 25.09 Notes" } });
    fireEvent.change(urlInput, {
      target: {
        value:
          "https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-09-notes/",
      },
    });
    fireEvent.change(explanationInput, {
      target: {
        value:
          "Welcome to Season 2 where we go to Ionia just in time for the Spirit Blossom Festival! We’ve got lots to celebrate this patch, so make sure to read the full patch notes for all the details!",
      },
    });
    fireEvent.change(emailInput, { target: { value: "riotgames@ucsb.edu" } });
    fireEvent.change(dateAddedInput, {
      target: { value: "2025-04-29T12:13:14" },
    });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "Patch 25.09 Notes",
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-09-notes/",
      explanation:
        "Welcome to Season 2 where we go to Ionia just in time for the Spirit Blossom Festival! We’ve got lots to celebrate this patch, so make sure to read the full patch notes for all the details!",
      email: "riotgames@ucsb.edu",
      dateAdded: "2025-04-29T12:13:14.000",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New article Created - id: 3 title: Patch 25.09 Notes",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });
});
