package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.entities.UCSBDate;
import edu.ucsb.cs156.example.repositories.MenuItemsReviewRepository;
import edu.ucsb.cs156.example.repositories.UCSBDateRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = MenuItemReviewsController.class)
@Import(TestConfig.class)
public class MenuItemReviewsControllerTests extends ControllerTestCase{
    
    @MockBean
    MenuItemsReviewRepository menuItemsReviewRepository;

    @MockBean
    UserRepository userRepository;

    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
            mockMvc.perform(get("/api/MenuItemReviews/all"))
                            .andExpect(status().is(403)); // logged out users can't get all
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_users_can_get_all() throws Exception {
            mockMvc.perform(get("/api/MenuItemReviews/all"))
                            .andExpect(status().is(200)); // logged
    }

    
    @Test
    public void logged_out_users_cannot_post() throws Exception {
            mockMvc.perform(post("/api/MenuItemReviews/post"))
                            .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_regular_users_cannot_post() throws Exception {
            mockMvc.perform(post("/api/MenuItemReviews/post"))
                            .andExpect(status().is(403)); // only admins can post
    }

    @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_can_get_all_ucsbdates() throws Exception {

                // arrange
                LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

                MenuItemReview menuitemreview1 = MenuItemReview.builder()
                    .itemId(Long.valueOf(1))
                    .reviewerEmail("tyler_wong@ucsb.edu")
                    .stars(4)
                    .dateReviewed(ldt1)
                    .comments("Quite good.")
                    .build();

                ArrayList<MenuItemReview> expectedMenuItemReviews = new ArrayList<>();
                expectedMenuItemReviews.addAll(Arrays.asList(menuitemreview1));

                when(menuItemsReviewRepository.findAll()).thenReturn(expectedMenuItemReviews);

                // act
                MvcResult response = mockMvc.perform(get("/api/MenuItemReviews/all"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(menuItemsReviewRepository, times(1)).findAll();
                String expectedJson = mapper.writeValueAsString(expectedMenuItemReviews);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_post_a_new_menuitemreview() throws Exception {
                // arrange

                LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

                MenuItemReview menuitemreview1 = MenuItemReview.builder()
                    .itemId(Long.valueOf(1))
                    .reviewerEmail("tyler_wong@ucsb.edu")
                    .stars(4)
                    .dateReviewed(ldt1)
                    .comments("Good.")
                    .build();

                when(menuItemsReviewRepository.save(eq(menuitemreview1))).thenReturn(menuitemreview1);

                // act
                MvcResult response = mockMvc.perform(
                                post("/api/MenuItemReviews/post?itemId=1&reviewerEmail=tyler_wong@ucsb.edu&stars=4&dateReviewed=2022-01-03T00:00:00&comments=Good.")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(menuItemsReviewRepository, times(1)).save(eq(menuitemreview1));
                String expectedJson = mapper.writeValueAsString(menuitemreview1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @Test
        public void logged_out_users_cannot_get_by_id() throws Exception {
                mockMvc.perform(get("/api/MenuItemReviews?id=7"))
                                .andExpect(status().is(403)); // logged out users can't get by id
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

                // arrange

                when(menuItemsReviewRepository.findById(eq(7L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(get("/api/MenuItemReviews?id=7"))
                                .andExpect(status().isNotFound()).andReturn();

                // assert

                verify(menuItemsReviewRepository, times(1)).findById(eq(7L));
                Map<String, Object> json = responseToJson(response);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("MenuItemReview with id 7 not found", json.get("message"));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_does() throws Exception {

                // arrange

                LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

                MenuItemReview menuitemreview1 = MenuItemReview.builder()
                    .itemId(Long.valueOf(1))
                    .reviewerEmail("tyler_wong@ucsb.edu")
                    .stars(4)
                    .dateReviewed(ldt1)
                    .comments("Good.")
                    .build();

                when(menuItemsReviewRepository.findById(eq(7L))).thenReturn(Optional.of(menuitemreview1));

                // act
                MvcResult response = mockMvc.perform(get("/api/MenuItemReviews?id=7"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(menuItemsReviewRepository, times(1)).findById(eq(7L));
                String expectedJson = mapper.writeValueAsString(menuitemreview1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_edit_an_existing_menuitemreview() throws Exception {
                // arrange

                LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
                LocalDateTime ldt2 = LocalDateTime.parse("2023-01-03T00:00:00");

                MenuItemReview menuitemreview1 = MenuItemReview.builder()
                        .itemId(Long.valueOf(1))
                        .reviewerEmail("tyler_wong@ucsb.edu")
                        .stars(4)
                        .dateReviewed(ldt1)
                        .comments("Good.")
                        .build();

                MenuItemReview editedMenuItemReview = MenuItemReview.builder()
                        .itemId(Long.valueOf(2))
                        .reviewerEmail("tyler_w0ng@ucsb.edu")
                        .stars(3)
                        .dateReviewed(ldt2)
                        .comments("Ok")
                        .build();

                String requestBody = mapper.writeValueAsString(editedMenuItemReview);

                when(menuItemsReviewRepository.findById(eq(67L))).thenReturn(Optional.of(menuitemreview1));

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/MenuItemReviews?id=67")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(menuItemsReviewRepository, times(1)).findById(67L);
                verify(menuItemsReviewRepository, times(1)).save(editedMenuItemReview); 
                String responseString = response.getResponse().getContentAsString();
                assertEquals(requestBody, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_cannot_edit_menuitemreviews_that_does_not_exist() throws Exception {
                // arrange

                LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

                MenuItemReview editedMenuItemReview = MenuItemReview.builder()
                        .itemId(Long.valueOf(2))
                        .reviewerEmail("tyler_w0ng@ucsb.edu")
                        .stars(3)
                        .dateReviewed(ldt1)
                        .comments("Ok")
                        .build();

                String requestBody = mapper.writeValueAsString(editedMenuItemReview);

                when(menuItemsReviewRepository.findById(eq(67L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/MenuItemReviews?id=67")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(menuItemsReviewRepository, times(1)).findById(67L);
                Map<String, Object> json = responseToJson(response);
                assertEquals("MenuItemReview with id 67 not found", json.get("message"));

        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_delete_a_menuitemreview() throws Exception {
                // arrange

                LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

                MenuItemReview menuitemreview1 = MenuItemReview.builder()
                        .itemId(Long.valueOf(1))
                        .reviewerEmail("tyler_wong@ucsb.edu")
                        .stars(4)
                        .dateReviewed(ldt1)
                        .comments("Good.")
                        .build();

                when(menuItemsReviewRepository.findById(eq(15L))).thenReturn(Optional.of(menuitemreview1));

                // act
                MvcResult response = mockMvc.perform(
                                delete("/api/MenuItemReviews?id=15")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(menuItemsReviewRepository, times(1)).findById(15L);
                verify(menuItemsReviewRepository, times(1)).delete(any());

                Map<String, Object> json = responseToJson(response);
                assertEquals("MenuItemReview with id 15 deleted", json.get("message"));
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_tries_to_delete_non_existant_menuitemreview_and_gets_right_error_message()
                        throws Exception {
                // arrange

                when(menuItemsReviewRepository.findById(eq(15L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                delete("/api/MenuItemReviews?id=15")
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(menuItemsReviewRepository, times(1)).findById(15L);
                Map<String, Object> json = responseToJson(response);
                assertEquals("MenuItemReview with id 15 not found", json.get("message"));
        }
}
