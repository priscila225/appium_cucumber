Feature: Browserstack search test

  Scenario: BStack Sample Test - Search Car
    Given I try to search using wesh App
    Then I click on the menu and go to Search
    Then I search with keyword Car
    Then The search results should be listed
