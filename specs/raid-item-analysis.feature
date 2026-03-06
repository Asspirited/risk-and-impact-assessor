Feature: RAID item analysis
  As a user with a completed project assessment
  I want to describe a specific Risk, Issue, Assumption, Dependency, or Change
  So I can get contextual analysis of that item against the project's risk profile

  Scenario: Item type selector shows all five types
    Given an assessment has been completed
    When I view the RAID item section
    Then I can select from: Risk, Issue, Assumption, Dependency, Change

  Scenario: Analyse button disabled until both type and description are provided
    Given an assessment has been completed
    When I have selected a type but not entered a description
    Then the Analyse button is disabled

  Scenario: Analysis generates contextual commentary
    Given an assessment has been completed
    And I have selected type "Risk" and entered a description
    When I click Analyse
    Then a commentary is returned that references the project and the item

  Scenario: RAID item section is locked before an assessment is run
    Given no assessment has been run
    When I view the RAID item section
    Then it shows a message explaining that an assessment must be run first
    And the type selector and description field are not interactive

  Scenario: Each item type produces a distinct prompt
    Given an assessment has been completed
    When I build a prompt for type "RISK" with a given description
    And I build a prompt for type "CHANGE" with the same description
    Then the two prompts are different

  Scenario: Analysis result is cleared when a new assessment is run
    Given I have run an assessment and analysed an item
    When I run a new assessment
    Then the previous item analysis output is cleared

  Scenario: Empty description is rejected
    When I call buildRaidItemPrompt with an empty description
    Then it throws an error containing "description"

  Scenario: Unknown item type is rejected
    When I call buildRaidItemPrompt with an unknown type
    Then it throws an error containing the type name
