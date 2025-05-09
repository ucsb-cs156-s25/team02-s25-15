package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.time.LocalDateTime;

/**
 * This is a REST controller for HeloRequests
 */
@Tag(name = "HelpRequests")
@RequestMapping("/api/helprequests")
@RestController
@Slf4j
public class HelpRequestsController extends ApiController {

    @Autowired
    HelpRequestRepository helpRequestRepository;

    /**
     * List all UCSB helprequests
     * 
     * @return an iterable of HelpRequest
     */
    @Operation(summary= "List all ucsb helprequests")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<HelpRequest> allHelpRequests() {
        Iterable<HelpRequest> helprequests = helpRequestRepository.findAll();
        return helprequests;
    }

     /**
     * Create a new helprequest
     * 
     * @param requesterEmail helprequest email
     * @param teamId         team id
     * @param tableOrBreakoutRoom     table
     * @param requestTime     time
     * @param explanation     explain
     * @param solved          solve
     * @return the saved helprequest
     */
    @Operation(summary= "Create a new helprequest")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public HelpRequest postHelpRequest(
            @Parameter(name="requesterEmail") @RequestParam String requesterEmail,
            @Parameter(name="teamId") @RequestParam String teamId,
            @Parameter(name="tableOrBreakoutRoom") @RequestParam String tableOrBreakoutRoom,
            @Parameter(name="explanation") @RequestParam String explanation,
            @Parameter(name="solved") @RequestParam boolean solved,
            @Parameter(name="requestTime", description="date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)") @RequestParam("requestTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime requestTime)
            throws JsonProcessingException {

        // For an explanation of @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        // See: https://www.baeldung.com/spring-date-parameters

        log.info("requestTime={}", requestTime);

        HelpRequest helprequest = new HelpRequest();
        helprequest.setRequesterEmail(requesterEmail);
        helprequest.setTeamId(teamId);
        helprequest.setTableOrBreakoutRoom(tableOrBreakoutRoom);
        helprequest.setRequestTime(requestTime);
        helprequest.setExplanation(explanation);
        helprequest.setSolved(solved);

        HelpRequest savedHelpRequest = helpRequestRepository.save(helprequest);

        return savedHelpRequest;
    }


    /**
     * Get a single helprequest by id
     * 
     * @param id the id of the helprequest
     * @return a HelpRequest
     */
    @Operation(summary= "Get a single helprequest")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public HelpRequest getById(
            @Parameter(name="id") @RequestParam Long id) {
        HelpRequest helprequest = helpRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(HelpRequest.class, id));

        return helprequest;
    }


    /**
     * Update a single helprequest
     * 
     * @param id       id of the helprequest to update
     * @param incoming the new helprequest
     * @return the updated helprequest object
     */
    @Operation(summary= "Update a single helprequest")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("")
    public HelpRequest updateHelpRequest(
            @Parameter(name="id") @RequestParam Long id,
            @RequestBody @Valid HelpRequest incoming) {

        HelpRequest helprequest = helpRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(HelpRequest.class, id));


        helprequest.setRequesterEmail(incoming.getRequesterEmail());
        helprequest.setTeamId(incoming.getTeamId());
        helprequest.setTableOrBreakoutRoom(incoming.getTableOrBreakoutRoom());
        helprequest.setRequestTime(incoming.getRequestTime());
        helprequest.setExplanation(incoming.getExplanation());
        helprequest.setSolved(incoming.getSolved());

        

        helpRequestRepository.save(helprequest);

        return helprequest;
    }

    /**
     * Delete a HelpRequest
     * 
     * @param id the id of the helprequest to delete
     * @return a message indicating the helprequest was deleted
     */
    @Operation(summary= "Delete a HelpRequest")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteHelpRequest(
            @Parameter(name="id") @RequestParam Long id) {
        HelpRequest helprequest = helpRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(HelpRequest.class, id));

        helpRequestRepository.delete(helprequest);
        return genericMessage("HelpRequest with id %s deleted".formatted(id));
    }


}