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
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestWebIT extends WebTestCase {

    
    @Autowired
    RecommendationRequestRepository recommendationRequestRepository;
    
    @Test
    public void admin_user_can_create_edit_delete_recommendationrequest() throws Exception {
                LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
                LocalDateTime ldt2 = LocalDateTime.parse("2022-01-03T00:00:00");

                RecommendationRequest recommendationRequest1 = RecommendationRequest.builder()
                            .requesterEmail("jthampiratwong@ucsb.edu")
                            .professorEmail("pconrad@ucsb.edu")
                            .explanation("recommendation request")
                            .dateRequested(ldt1)
                            .dateNeeded(ldt2)
                            .done(false)
                            .build();
                recommendationRequestRepository.save(recommendationRequest1);


        setupUser(true);

        page.getByText("Recommendation Request").click();





        assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail")).hasText("jthampiratwong@ucsb.edu");

        page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button").click();

        assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail")).not().isVisible();
    }

    @Test
    public void regular_user_cannot_create_recommendationrequest() throws Exception {
        setupUser(false);

        page.getByText("Recommendation Request").click();

        assertThat(page.getByText("Create Recommendation Request")).not().isVisible();

    }
    @Test
    public void admin_user_can_see_create_recommendationrequest_button() throws Exception {
        setupUser(true);

        page.getByText("Recommendation Request").click();

        assertThat(page.getByText("Create Recommendation Request")).isVisible();

    }
}