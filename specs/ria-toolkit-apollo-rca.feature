Feature: Apollo RCA — cause-and-effect analysis
  As a team investigating a problem or incident
  I want to map all causal paths with evidence and conditions
  So I find solutions that address verified causes, not just surface symptoms

  Background:
    Given the RIA Toolkit is open
    And the Apollo RCA tool is selected

  Scenario: Tool is visible in the Root Cause category
    Then the nav button "Apollo RCA" appears under the "Root Cause" category

  Scenario: User enters a primary event and gets a causal map
    When I enter "Production database went read-only during peak hours" as the event
    And I enter context "Postgres, AWS RDS, auto-scaling group, Friday 14:00 UTC"
    Then the output contains at least two distinct causal paths
    And each cause is classified as an action or a condition
    And each cause notes the evidence required to verify it

  Scenario: Multiple causal paths are identified
    When the analysis runs
    Then causal_chains contains more than one path
    And the paths are distinct (not the same chain repeated)

  Scenario: Solutions are mapped to specific causes
    When the analysis returns
    Then each causal chain includes at least one solution
    And the solutions address the cause in that chain, not the event generically

  Scenario: Evidence gaps are surfaced
    When causes cannot be verified from the information provided
    Then verification_gaps lists what evidence would be needed
    And those causes are marked verified: false

  Scenario: Warning shown if no event entered
    When I click "Analyse" without entering a primary event
    Then a warning message is shown
    And no API call is made

  Scenario: Output is cleared on clear button click
    Given Apollo RCA results are shown
    When I click "Clear"
    Then the output and all input fields are reset
