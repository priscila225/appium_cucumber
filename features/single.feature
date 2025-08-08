Feature: Browserstack test

  Scenario: BStack Sample Test - Search BrowserStack
    Given I dismiss the Braze in-app message
    When I open the drawer and navigate to Search
    Then I search with keyword car
    Then The search results should be listed
