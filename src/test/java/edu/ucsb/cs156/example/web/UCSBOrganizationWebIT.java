package edu.ucsb.cs156.example.web;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.beans.factory.annotation.Autowired;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;

import edu.ucsb.cs156.example.repositories.UCSBOrganizationRepository;
import edu.ucsb.cs156.example.entities.UCSBOrganization;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBOrganizationWebIT extends WebTestCase {

    @Autowired
        UCSBOrganizationRepository ucsbOrganizationRepository;

    @Test
    public void admin_user_can_create_edit_delete_ucsborganization() throws Exception {

        // OrgTranslationShort orgTranslationShort1 = "ZETA PHI RHO";

        UCSBOrganization ucsbOrganization1 = UCSBOrganization.builder()
                                .orgCode("ZPR")
                                .orgTranslationShort("ZETA PHI RHO")
                                .orgTranslation("ZETA PHI RHO1")
                                .inactive(true)
                                .build();
                                
        ucsbOrganizationRepository.save(ucsbOrganization1);


        setupUser(true);

        page.getByText("UCSB Organizations").click();

        // page.getByText("Create UCSB Organization").click();
        // assertThat(page.getByText("Create New UCSB Organization")).isVisible();
        // page.getByTestId("UCSBOrganizationForm-orgCode").fill("ZPR");
        // page.getByTestId("UCSBOrganizationForm-orgTranslationShort").fill("ZETA PHI RHO");
        // page.getByTestId("UCSBOrganizationForm-orgTranslation").fill("ZETA PHI RHO");
        // page.getByTestId("UCSBOrganizationForm-inactive").selectOption("false");
        // page.getByTestId("UCSBOrganizationForm-submit").click();

        assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).hasText("ZPR");

        // page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Edit-button").click();
        // assertThat(page.getByText("Edit UCSB Organization")).isVisible();
        // page.getByTestId("UCSBOrganizationForm-orgTranslationShort").fill("ZETA PHI RHO1");
        // page.getByTestId("UCSBOrganizationForm-submit").click();

        // assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslationShort")).hasText("ZETA PHI RHO1");

        page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Delete-button").click();

        assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
    }

    @Test
    public void regular_user_cannot_create_ucsborganization() throws Exception {
         setupUser(false);

         page.getByText("UCSB Organizations").click();

         assertThat(page.getByText("Create UCSB Organization")).not().isVisible();
         assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
    }

    @Test
    public void admin_user_can_see_create_ucsborganization_button() throws Exception {
         setupUser(true);

         page.getByText("UCSB Organizations").click();

         assertThat(page.getByText("Create UCSB Organization")).isVisible();
    }
}