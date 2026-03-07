Feature: BDD / Specification by Example
  As a developer, BA, or tester
  I want to turn a feature description into Given/When/Then scenarios with concrete examples
  So I have unambiguous acceptance criteria that drive the build and prevent regression

  Background:
    Given the RIA Toolkit is open
    And the BDD tool is selected

  Scenario: Tool is visible in the Quality category
    Then the nav button "BDD / Spec by Example" appears under the "Quality" category

  Scenario: User enters a feature and gets concrete scenarios
    When I enter "User login with email and password"
    And I enter context "Web app, email must be verified, 5 failed attempts locks the account"
    Then the output contains at least 3 scenarios
    And each scenario has Given, When, and Then clauses
    And the Then clauses contain observable outcomes, not implementation details

  Scenario: Scenarios use concrete values not generic placeholders
    When the scenarios are generated
    Then the Given and Then clauses reference specific values (e.g. email addresses, counts)
    And no clause contains phrases like "valid input" or "some value"

  Scenario: Happy path and failure paths are both covered
    When scenarios are returned
    Then at least one scenario covers the happy path
    And at least one scenario covers a failure or rejection case

  Scenario: Anti-patterns in the story are flagged
    Given the story description is vague or implementation-focused
    When the analysis runs
    Then anti_patterns_spotted contains at least one observation

  Scenario: Examples table is provided for parametrisable scenarios
    When the feature lends itself to multiple concrete examples
    Then examples_table.applicable is true
    And examples_table.rows contains at least 2 rows

  Scenario: Definition of done is returned
    When the analysis completes
    Then definition_of_done contains 3 to 5 concrete done criteria

  Scenario: Warning shown if no feature entered
    When I click "Write Scenarios" without entering a feature
    Then a warning message is shown
    And no API call is made
