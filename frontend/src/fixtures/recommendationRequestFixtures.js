const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 4,
    requesterEmail: "perrytham@gmail.com",
    professorEmail: "pconrad@ucsb.edu",
    explanation: "hi1",
    dateRequested: "2025-05-07T00:00:00",
    dateNeeded: "2025-05-07T00:00:00",
    done: true,
  },
  threeRecommendationRequests: [
    {
      id: 4,
      requesterEmail: "perrytham@gmail.com",
      professorEmail: "pconrad@ucsb.edu",
      explanation: "hi1",
      dateRequested: "2025-05-07T00:00:00",
      dateNeeded: "2025-05-07T01:00:00",
      done: true,
    },
    {
      id: 5,
      requesterEmail: "jirakit.tham@gmail.com",
      professorEmail: "pconrad1@ucsb.edu",
      explanation: "hi2",
      dateRequested: "2025-05-07T02:00:00",
      dateNeeded: "2025-05-07T03:00:00",
      done: false,
    },
    {
      id: 6,
      requesterEmail: "jthampiratwong@ucsb.edu",
      professorEmail: "pconrad2@ucsb.edu",
      explanation: "hi3",
      dateRequested: "2025-05-07T04:00:00",
      dateNeeded: "2025-05-07T05:00:00",
      done: true,
    },
  ],
};

export { recommendationRequestFixtures };
