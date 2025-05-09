package edu.ucsb.cs156.example.web;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import java.time.LocalDateTime;

import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.Articles;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticlesWebIT extends WebTestCase {
    @Autowired
    ArticlesRepository articlesRepository;

    @Test
    public void admin_user_can_create_edit_delete_articles() throws Exception {

        LocalDateTime ldt = LocalDateTime.parse("2022-01-03T00:00:00");

        Articles articles1 = Articles.builder()
                .title("bi - test01: Nexustentialism")
                .url("https://dailynexus.com/2025-04-17/bingo-your-next-professor-may-be-a-lottery-hire/")
                .explanation("This is the first post added to the test")
                .email("binouye@ucsb.edu")
                .dateAdded(ldt)
                .build();

        articlesRepository.save(articles1);

        setupUser(true);

        page.getByText("Articles").click();

        assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).hasText("bi - test01: Nexustentialism");

        page.getByTestId("ArticlesTable-cell-row-0-col-Delete-button").click();

        assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).not().isVisible();
    }

    @Test
    public void regular_user_cannot_create_articles() throws Exception {
    setupUser(false);

    page.getByText("Articles").click();

    assertThat(page.getByText("Create Article")).not().isVisible();
    assertThat(page.getByTestId("Articles-cell-row-0-col-title")).not().isVisible();
    }
}