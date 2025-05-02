import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

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

describe("ArticlesEditPage tests", () => {
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Article");
      expect(screen.queryByText(/Title/)).not.toBeInTheDocument();
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 21,
        title: "Patch 25.09 Notes",
        url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-09-notes/",
        explanation:
          "Welcome to Season 2 where we go to Ionia just in time for the Spirit Blossom Festival! We’ve got lots to celebrate this patch, so make sure to read the full patch notes for all the details!",
        email: "riotgames@ucsb.edu",
        dateAdded: "2025-04-29T12:42:00",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: 21,
        title: "RELEASE NOTES: THE BATTLE FOR KATANA KINGDOM!",
        url: "https://supercell.com/en/games/brawlstars/blog/release-notes/release-notes-the-battle-for-katana-kingdom/",
        explanation:
          "The First Ultra Legendary Brawler Kaze, a Brawl MOBA, Wasabi Powers, Jae-yong the Karaoke King, and More!",
        email: "brawlstars@ucsb.edu",
        dateAdded: "2025-04-25T11:11:11",
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Id/);

      const idField = screen.getByLabelText(/Id/);
      const titleField = screen.getByLabelText(/Title/);
      const urlField = screen.getByLabelText(/URL/);
      const explanationField = screen.getByLabelText(/Explanation/);
      const emailField = screen.getByLabelText(/Email/);
      const dateAddedField = screen.getByLabelText(/Date Added/);
      const submitButton = screen.getByText(/Update/);

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("21");

      expect(titleField).toBeInTheDocument();
      expect(titleField).toHaveValue("Patch 25.09 Notes");
      expect(urlField).toBeInTheDocument();
      expect(urlField).toHaveValue(
        "https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-09-notes/",
      );
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue(
        "Welcome to Season 2 where we go to Ionia just in time for the Spirit Blossom Festival! We’ve got lots to celebrate this patch, so make sure to read the full patch notes for all the details!",
      );
      expect(emailField).toBeInTheDocument();
      expect(emailField).toHaveValue("riotgames@ucsb.edu");
      expect(dateAddedField).toBeInTheDocument();
      expect(dateAddedField).toHaveValue("2025-04-29T12:42");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, {
        target: { value: "RELEASE NOTES: THE BATTLE FOR KATANA KINGDOM!" },
      });
      fireEvent.change(urlField, {
        target: {
          value:
            "https://supercell.com/en/games/brawlstars/blog/release-notes/release-notes-the-battle-for-katana-kingdom/",
        },
      });
      fireEvent.change(explanationField, {
        target: {
          value:
            "The First Ultra Legendary Brawler Kaze, a Brawl MOBA, Wasabi Powers, Jae-yong the Karaoke King, and More!",
        },
      });
      fireEvent.change(emailField, {
        target: { value: "brawlstars@ucsb.edu" },
      });
      fireEvent.change(dateAddedField, {
        target: { value: "2025-04-25T11:11:11.111" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Article Updated - id: 21 title: RELEASE NOTES: THE BATTLE FOR KATANA KINGDOM!",
      );

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 21 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "RELEASE NOTES: THE BATTLE FOR KATANA KINGDOM!",
          url: "https://supercell.com/en/games/brawlstars/blog/release-notes/release-notes-the-battle-for-katana-kingdom/",
          explanation:
            "The First Ultra Legendary Brawler Kaze, a Brawl MOBA, Wasabi Powers, Jae-yong the Karaoke King, and More!",
          email: "brawlstars@ucsb.edu",
          dateAdded: "2025-04-25T11:11:11.111",
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Id/);

      const idField = screen.getByLabelText(/Id/);
      const titleField = screen.getByLabelText(/Title/);
      const urlField = screen.getByLabelText(/URL/);
      const explanationField = screen.getByLabelText(/Explanation/);
      const emailField = screen.getByLabelText(/Email/);
      const dateAddedField = screen.getByLabelText(/Date Added/);
      const submitButton = screen.getByText(/Update/);

      expect(idField).toHaveValue("21");
      expect(titleField).toHaveValue("Patch 25.09 Notes");
      expect(urlField).toHaveValue(
        "https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-09-notes/",
      );
      expect(explanationField).toHaveValue(
        "Welcome to Season 2 where we go to Ionia just in time for the Spirit Blossom Festival! We’ve got lots to celebrate this patch, so make sure to read the full patch notes for all the details!",
      );
      expect(emailField).toHaveValue("riotgames@ucsb.edu");
      expect(dateAddedField).toHaveValue("2025-04-29T12:42");

      expect(submitButton).toBeInTheDocument();

      fireEvent.change(titleField, {
        target: { value: "RELEASE NOTES: THE BATTLE FOR KATANA KINGDOM!" },
      });
      fireEvent.change(urlField, {
        target: {
          value:
            "https://supercell.com/en/games/brawlstars/blog/release-notes/release-notes-the-battle-for-katana-kingdom/",
        },
      });
      fireEvent.change(explanationField, {
        target: {
          value:
            "The First Ultra Legendary Brawler Kaze, a Brawl MOBA, Wasabi Powers, Jae-yong the Karaoke King, and More!",
        },
      });
      fireEvent.change(emailField, {
        target: { value: "brawlstars@ucsb.edu" },
      });
      fireEvent.change(dateAddedField, {
        target: { value: "2025-04-25T11:11:11.111" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Article Updated - id: 21 title: RELEASE NOTES: THE BATTLE FOR KATANA KINGDOM!",
      );
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/articles" });
    });
  });
});
