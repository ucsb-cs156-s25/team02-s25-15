const ucsbOrganizationFixtures = {
  oneOrganization: {
    orgCode: "ZPR",
    orgTranslationShort: "ZETA PHI RHO",
    orgTranslation: "ZETA PHI RHO",
    inactive: false,
  },
  threeOrganizations: [
    {
      orgCode: "ZPR",
      orgTranslationShort: "ZETA PHI RHO",
      orgTranslation: "ZETA PHI RHO",
      inactive: false,
    },
    {
      orgCode: "SKY",
      orgTranslationShort: "SKYDIVING CLUB",
      orgTranslation: "SKYDIVING CLUB AT UCSB",
      inactive: true,
    },
    {
      orgCode: "OSLI",
      orgTranslationShort: "STUDENT LIFE",
      orgTranslation: "OFFICE OF STUDENT LIFE",
      inactive: false,
    },
  ],
};

export { ucsbOrganizationFixtures };
