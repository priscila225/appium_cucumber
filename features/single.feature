Feature: Browserstack test

  Scenario: BStack Sample Test - Search BrowserStack
    Given I try to search using khtv App
    Then I search with keyword BrowserStack
    Then The search results should be listed
