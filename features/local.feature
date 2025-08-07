Feature: BrowserStack Local Testing

  Scenario: BStack Local Test - Can check tunnel working
    When I start test on the Local Sample App
    Then I should see "Up and running"
