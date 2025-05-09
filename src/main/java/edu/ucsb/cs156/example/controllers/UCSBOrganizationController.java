package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.UCSBOrganization;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.UCSBOrganizationRepository;

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
 * This is a REST controller for UCSBOrganization
 */

@Tag(name = "UCSBOrganization")
@RequestMapping("/api/ucsborganization")
@RestController
@Slf4j
public class UCSBOrganizationController extends ApiController{

    @Autowired
    UCSBOrganizationRepository ucsbOrganizationRepository;

    /**
     * List all UCSB Organizations
     * 
     * @return an iterable of UCSBOrganization
     */
    @Operation(summary= "List all ucsb organizations")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<UCSBOrganization> allUCSBOrganization() {
        Iterable<UCSBOrganization> organizations = ucsbOrganizationRepository.findAll();
        return organizations;
    }

    /**
     * Create a new organization
     * 
     * @param orgCode  the organization code
     * @param orgTranslationShort  the short translation of the organization
     * @param orgTranslation  the translation of the organization
     * @param inactive  activity level of the organization
     * @return the saved ucsborganization
     */
    @Operation(summary= "Create a new organization")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public UCSBOrganization postUCSBOrganization(
            @Parameter(name="orgCode") @RequestParam String orgCode,
            @Parameter(name="orgTranslationShort") @RequestParam String orgTranslationShort,
            @Parameter(name="orgTranslation") @RequestParam String orgTranslation,
            @Parameter(name="inactive") @RequestParam Boolean inactive
            )
            {

            UCSBOrganization ucsbOrganization = new UCSBOrganization();
            ucsbOrganization.setOrgCode(orgCode);
            ucsbOrganization.setOrgTranslationShort(orgTranslationShort);
            ucsbOrganization.setOrgTranslation(orgTranslation);
            ucsbOrganization.setInactive(inactive);

            UCSBOrganization savedUcsbOrganization = ucsbOrganizationRepository.save(ucsbOrganization);

            return savedUcsbOrganization;
            
    }


    /**
     * Get a single UCSB organization by id
     * 
     * @param orgCode the id of the UCSB organization
     * @return a UCSBDOrganization
     */
    @Operation(summary= "Get a single organization")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public UCSBOrganization getById(
            @Parameter(name="orgCode") @RequestParam String orgCode) {
        UCSBOrganization ucsbOrganization = ucsbOrganizationRepository.findById(orgCode)
                .orElseThrow(() -> new EntityNotFoundException(UCSBOrganization.class, orgCode));

        return ucsbOrganization;
    }


    /**
     * Update a single organization
     * 
     * @param orgCode       id of the organization to update
     * @param incoming the new organization
     * @return the updated organization object
     */
    @Operation(summary= "Update a single organization")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("")
    public UCSBOrganization updateUCSBOrganization(
            @Parameter(name="orgCode") @RequestParam String orgCode,
            @RequestBody @Valid UCSBOrganization incoming) {

        UCSBOrganization ucsbOrganization = ucsbOrganizationRepository.findById(orgCode)
                .orElseThrow(() -> new EntityNotFoundException(UCSBOrganization.class, orgCode));

        ucsbOrganization.setOrgTranslationShort(incoming.getOrgTranslationShort());
        ucsbOrganization.setOrgTranslation(incoming.getOrgTranslation());
        ucsbOrganization.setInactive(incoming.getInactive());

        ucsbOrganizationRepository.save(ucsbOrganization);

        return ucsbOrganization;
    }


    /**
     * Delete a UCSBOrganization
     * 
     * @param orgCode the id of the organization to delete
     * @return a message indicating the organization was deleted
     */
    @Operation(summary= "Delete a UCSBOrganization")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteUCSBOrganization(
            @Parameter(name="orgCode") @RequestParam String orgCode) {
        UCSBOrganization ucsbOrganization = ucsbOrganizationRepository.findById(orgCode)
                .orElseThrow(() -> new EntityNotFoundException(UCSBOrganization.class, orgCode));

        ucsbOrganizationRepository.delete(ucsbOrganization);
        return genericMessage("UCSBOrganization with id %s deleted".formatted(orgCode));
    }


}
