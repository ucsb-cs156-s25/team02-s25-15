import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

export default {
  title: "pages/RecommendationRequest/RecommendationRequestEditPage",
  component: RecommendationRequestEditPage,
};

const Template = () => <RecommendationRequestEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/recommendationrequest", () => {
      return HttpResponse.json(
        recommendationRequestFixtures.threeRecommendationRequests[0],
        {
          status: 200,
        },
      );
    }),

    http.put("/api/recommendationrequest", () => {
      return HttpResponse.json(
        {
          id: 17,
          requesterEmail: "perrytham@1gmail.com",
          professorEmail: "pconrad1@ucsb.edu",
          explanation: "hi2",
          dateRequested: "2025-05-07T01:00:00",
          dateNeeded: "2025-05-07T01:00:00",
          done: false,
        },
        { status: 200 },
      );
    }),
  ],
};
