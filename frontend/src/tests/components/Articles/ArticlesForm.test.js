import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticlesForm from "main/components/Articles/ArticlesForm";
import { articlesFixtures } from "fixtures/articlesFixtures";
import { BrowserRouter as Router } from "react-router-dom";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("ArticlesForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    await screen.findByText(/Title/);
    await screen.findByText(/Create/);
  });

  test("renders correctly when passing in a Articles", async () => {
    render(
      <Router>
        <ArticlesForm initialContents={articlesFixtures.oneArticles} />
      </Router>,
    );
    await screen.findByText(/Title/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    // expect(screen.getByTestId(/ArticlesForm-id/)).toHaveValue("1");
  });

  test("Correct Error messsages on bad input", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    await screen.findByText(/Title/);
    expect(screen.getByText(/URL/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation/)).toBeInTheDocument();
    expect(screen.getByText(/Email/)).toBeInTheDocument();
    expect(screen.getByText(/Date Added/)).toBeInTheDocument();

    // const titleField = screen.getByLabelText("Title");

    // These fields do not really matter here because they don't have extra checks like format or max length
    // const urlField = screen.getByLabelText("URL");
    // const explanationField = screen.getByLabelText("Explanation");
    // const emailField = screen.getByLabelText("Email");
    const dateAddedField = screen.getByLabelText("Date Added");
    const submitButton = screen.getByRole("button", { name: /create/i });

    // fireEvent.change(titleField, { target: { value: "a".repeat(256) } });
    fireEvent.change(dateAddedField, { target: { value: "bad-input" } });
    fireEvent.click(submitButton);

    await screen.findByText(/Date Added is required./);
    // expect(screen.getByText(/Date Added is required./)).toBeInTheDocument();
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    await screen.findByText(/Create/);
    const submitButton = screen.getByRole("button", { name: /create/i });

    fireEvent.click(submitButton);

    await screen.findByText(/Title is required./);
    expect(screen.getByText(/URL is required./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Added is required./)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = jest.fn();

    render(
      <Router>
        <ArticlesForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByText(/Title/);

    const titleField = screen.getByLabelText("Title");
    const urlField = screen.getByLabelText("URL");
    const explanationField = screen.getByLabelText("Explanation");
    const emailField = screen.getByLabelText("Email");
    const dateAddedField = screen.getByLabelText("Date Added");
    const submitButton = screen.getByRole("button", { name: /create/i });

    fireEvent.change(titleField, { target: { value: "Awesome Title" } });
    fireEvent.change(urlField, { target: { value: "awesome-article.com" } });
    fireEvent.change(explanationField, {
      target: { value: "Awesome things and such" },
    });
    fireEvent.change(emailField, {
      target: { value: "awesome-email@ucsb.edu" },
    });
    fireEvent.change(dateAddedField, {
      target: { value: "2025-04-29T12:12" },
    });
    fireEvent.click(submitButton);
    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/Title is required./)).not.toBeInTheDocument();
    expect(screen.queryByText(/URL is required./)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Explanation is required./),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Email is required./)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Date Added is required./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/max length 255 characters/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Title has max length 255 characters."),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    await screen.findByText(/Cancel/);
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
