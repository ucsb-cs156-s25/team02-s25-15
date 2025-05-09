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
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemsReviewRepository;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewWebIT extends WebTestCase {

    @Autowired
        MenuItemsReviewRepository menuItemReviewRepository;

    @Test
    public void admin_user_can_create_edit_delete_restaurant() throws Exception {

        LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

                MenuItemReview menuitemreview1 = MenuItemReview.builder()
                    .itemId(Long.valueOf(1))
                    .reviewerEmail("tyler_wong@ucsb.edu")
                    .stars(4)
                    .dateReviewed(ldt1)
                    .comments("Good.")
                    .build();

        menuItemReviewRepository.save(menuitemreview1);
        setupUser(true);

        page.getByText("Menu Item Reviews").click();

        assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).hasText("1");

        page.getByTestId("MenuItemReviewTable-cell-row-0-col-Delete-button").click();

        assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).not().isVisible();
    }

    @Test
    public void regular_user_cannot_create_MenuItemReview() throws Exception {
        setupUser(false);

        page.getByText("Menu Item Reviews").click();

        assertThat(page.getByText("Create MenuItemReview")).not().isVisible();
    }

    @Test
    public void regular_user_can_create_MenuItemReview_button() throws Exception {
        setupUser(true);

        page.getByText("Menu Item Reviews").click();

        assertThat(page.getByText("Create MenuItemReview")).isVisible();
    }
}