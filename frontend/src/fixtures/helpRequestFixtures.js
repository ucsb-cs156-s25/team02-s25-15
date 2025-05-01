const helpRequestFixtures = {
    oneHelpRequest: {
        "id": 2,
        "requesterEmail": "joe@gmail.com",
        "teamId": "A",
        "tableOrBreakoutRoom": "table",
        "requestTime": "2025-12-10T06:34:12",
        "explanation": "need help!",
        "solved": false
      },
    threeHelpRequest: [
        {
          "id": 3,
          "requesterEmail": "bob@ucsb.edu",
          "teamId": "B",
          "tableOrBreakoutRoom": "bRoom",
          "requestTime": "2025-04-10T03:34:12",
          "explanation": "need a lot of help!!",
          "solved": true
        },
         {
          "id": 4,
          "requesterEmail": "dave@ucsb.edu",
          "teamId": "C",
          "tableOrBreakoutRoom": "bRoom",
          "requestTime": "2025-04-18T07:44:14",
          "explanation": "need a ton of help!!",
          "solved": false
        },
        {
          "id": 2,
          "requesterEmail": "joe@gmail.com",
          "teamId": "A",
          "tableOrBreakoutRoom": "table",
          "requestTime": "2025-12-10T06:34:12",
          "explanation": "need help!",
          "solved": false
        }
      ]
  };
  
  export { helpRequestFixtures };
  